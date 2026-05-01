import { useCallback, useEffect, useState } from "react";

interface UsePWAUpdate {
  updateAvailable: boolean;
  isUpdating: boolean;
  updateProgress: number;
  handleUpdate: () => void;
}

export function usePWAUpdate(): UsePWAUpdate {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [waitingSW, setWaitingSW] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Listen for SW messages (SW_UPDATED sent on activate)
    const messageHandler = (event: MessageEvent) => {
      if (event.data && event.data.type === "SW_UPDATED") {
        setUpdateAvailable(true);
      }
    };
    navigator.serviceWorker.addEventListener("message", messageHandler);

    // Also listen for our custom event dispatched from index.html
    const customHandler = () => {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          setWaitingSW(registration.waiting);
          setUpdateAvailable(true);
        }
      });
    };
    window.addEventListener("vajra:sw-waiting", customHandler);

    // Listen for update complete
    const updateCompleteHandler = () => {
      setIsUpdating(false);
      setUpdateProgress(100);
      // Reload after a short delay to show 100%
      setTimeout(() => {
        window.location.reload();
      }, 500);
    };
    window.addEventListener("vajra:update-complete", updateCompleteHandler);

    // Check for a waiting SW on load
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (!registration) return;

      if (registration.waiting) {
        setWaitingSW(registration.waiting);
        setUpdateAvailable(true);
      }

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            setWaitingSW(newWorker);
            setUpdateAvailable(true);
          }
        });
      });
    });

    return () => {
      navigator.serviceWorker.removeEventListener("message", messageHandler);
      window.removeEventListener("vajra:sw-waiting", customHandler);
      window.removeEventListener("vajra:update-complete", updateCompleteHandler);
    };
  }, []);

  const handleUpdate = useCallback(() => {
    if (waitingSW) {
      setIsUpdating(true);
      // Simulate 5-second progress animation
      const interval = setInterval(() => {
        setUpdateProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 20; // 20% every second = 5 seconds
        });
      }, 1000);
      
      // Send skip waiting message
      waitingSW.postMessage({ type: "SKIP_WAITING" });
      
      // Fallback: reload after 5 seconds if SW doesn't trigger reload
      setTimeout(() => {
        clearInterval(interval);
        window.location.reload();
      }, 5000);
    } else {
      // Fallback: reload
      window.location.reload();
    }
  }, [waitingSW]);

  return { updateAvailable, isUpdating, updateProgress, handleUpdate };
}
