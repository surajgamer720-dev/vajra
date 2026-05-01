import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "vajra_install_prompted";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export type InstallState = "idle" | "installing" | "installed" | "hidden";

interface UsePWAInstall {
  canInstall: boolean;
  installState: InstallState;
  triggerInstall: () => Promise<void>;
  dismiss: () => void;
}

export function usePWAInstall(): UsePWAInstall {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [installState, setInstallState] = useState<InstallState>("idle");
  const dismissedRef = useRef(false);

  useEffect(() => {
    // If user already dismissed or installed, never show again
    const alreadyPrompted = localStorage.getItem(STORAGE_KEY);
    if (alreadyPrompted) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    // Capture any already-fired event stored on window
    const pending = (window as Window & { __bipEvent?: Event }).__bipEvent;
    if (pending) {
      handler(pending);
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Listen for appinstalled event to confirm installation
  useEffect(() => {
    const handler = () => {
      setInstallState("installed");
      localStorage.setItem(STORAGE_KEY, "installed");
      // Auto-hide the banner after 3 seconds
      setTimeout(() => {
        setCanInstall(false);
        setInstallState("hidden");
      }, 3000);
    };
    window.addEventListener("appinstalled", handler);
    return () => window.removeEventListener("appinstalled", handler);
  }, []);

  const triggerInstall = useCallback(async () => {
    if (!deferredPrompt || dismissedRef.current) return;

    setInstallState("installing");

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setInstallState("installed");
        localStorage.setItem(STORAGE_KEY, "installed");
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
          setCanInstall(false);
          setInstallState("hidden");
        }, 3000);
      } else {
        // User cancelled — go back to idle
        setInstallState("idle");
        localStorage.setItem(STORAGE_KEY, "dismissed");
        setDeferredPrompt(null);
        setCanInstall(false);
      }
    } catch {
      setInstallState("idle");
    }
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    dismissedRef.current = true;
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setDeferredPrompt(null);
    setCanInstall(false);
    setInstallState("hidden");
  }, []);

  return { canInstall, installState, triggerInstall, dismiss };
}
