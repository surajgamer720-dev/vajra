import { useCallback, useEffect, useState } from "react";

interface UsePWAUpdate {
  updateAvailable: boolean;
  handleUpdate: () => void;
}

export function usePWAUpdate(): UsePWAUpdate {
  const [updateAvailable, setUpdateAvailable] = useState(false);
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
    };
  }, []);

  const handleUpdate = useCallback(() => {
    if (waitingSW) {
      waitingSW.postMessage({ type: "SKIP_WAITING" });
    } else {
      // Fallback: reload
      window.location.reload();
    }
  }, [waitingSW]);

  return { updateAvailable, handleUpdate };
}
