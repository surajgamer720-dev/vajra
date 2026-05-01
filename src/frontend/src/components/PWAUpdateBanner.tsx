import { AnimatePresence, motion } from "motion/react";
import { usePWAUpdate } from "../hooks/usePWAUpdate";

export function PWAUpdateBanner() {
  const { updateAvailable, handleUpdate } = usePWAUpdate();

  return (
    <AnimatePresence>
      {updateAvailable && (
        <motion.div
          key="update-banner"
          initial={{ y: -56, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -56, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="sticky top-14 left-0 right-0 z-30"
          role="alert"
          aria-live="polite"
          data-ocid="pwa.update_banner"
        >
          <div className="bg-gradient-to-r from-[#1a1040] via-[#2d1b69] to-[#1a1040] border-b border-primary/30 shadow-lg">
            <div className="max-w-lg mx-auto flex items-center justify-between gap-3 px-5 py-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-base select-none shrink-0">🔥</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground leading-tight">
                    Vajra v4 is here!
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    Faster loads · Full offline · Notifications fixed
                  </p>
                </div>
              </div>
              <button
                onClick={handleUpdate}
                type="button"
                data-ocid="pwa.update_button"
                className="shrink-0 text-xs font-semibold text-white px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-primary hover:from-orange-400 hover:to-primary/90 transition-all shadow-md hover:shadow-orange-500/30 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Update Now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PWAUpdateBanner;
