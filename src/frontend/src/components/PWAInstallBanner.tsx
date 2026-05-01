import { CheckCircle2, Download, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type InstallState, usePWAInstall } from "../hooks/usePWAInstall";

function InstallButtonContent({ state }: { state: InstallState }) {
  if (state === "installing") {
    return (
      <>
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
        <span>Installing…</span>
      </>
    );
  }
  if (state === "installed") {
    return (
      <>
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
        <span className="text-emerald-400">Installed!</span>
      </>
    );
  }
  return (
    <>
      <Download className="w-3.5 h-3.5 shrink-0" />
      <span>Install</span>
    </>
  );
}

export function PWAInstallBanner() {
  const { canInstall, installState, triggerInstall, dismiss } = usePWAInstall();

  const isInstalled = installState === "installed";
  const isInstalling = installState === "installing";

  return (
    <AnimatePresence>
      {canInstall && (
        <motion.div
          key="install-banner"
          initial={{ y: 88, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 88, opacity: 0 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          className="fixed bottom-[72px] left-0 right-0 z-50 px-3 pb-1"
          role="banner"
          aria-label="Install Vajra app"
          data-ocid="pwa.install_banner"
        >
          <div className="max-w-lg mx-auto rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-md shadow-2xl overflow-hidden">
            {/* Animated glow bar */}
            <div
              className={`h-0.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent transition-opacity duration-500 ${
                isInstalled ? "opacity-100 via-emerald-400" : "opacity-70"
              }`}
            />

            <div className="flex items-center gap-3 p-4">
              {/* Fire / success icon */}
              <motion.div
                animate={
                  isInstalled
                    ? { scale: [1, 1.3, 1], rotate: [0, -8, 8, 0] }
                    : isInstalling
                      ? { rotate: 360 }
                      : {}
                }
                transition={
                  isInstalling
                    ? {
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 1,
                        ease: "linear",
                      }
                    : { duration: 0.5 }
                }
                className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500/20 to-primary/20 border border-orange-500/30 flex items-center justify-center text-2xl select-none"
              >
                {isInstalled ? "✅" : "🔥"}
              </motion.div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  {isInstalled ? (
                    <motion.div
                      key="installed"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                    >
                      <p className="font-display text-sm font-bold text-emerald-400 leading-tight">
                        Vajra Installed!
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                        Find it on your home screen
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                    >
                      <p className="font-display text-sm font-bold text-foreground leading-tight">
                        Install Vajra
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                        Works offline · Faster · Home screen
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {!isInstalled && !isInstalling && (
                  <button
                    onClick={dismiss}
                    data-ocid="pwa.install_dismiss_button"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    type="button"
                    aria-label="Dismiss install prompt"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={
                    isInstalled || isInstalling ? undefined : triggerInstall
                  }
                  type="button"
                  disabled={isInstalling}
                  data-ocid="pwa.install_button"
                  className={`text-xs font-semibold text-white px-3.5 py-1.5 rounded-lg transition-all shadow-md flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed ${
                    isInstalled
                      ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-emerald-500/20"
                      : isInstalling
                        ? "bg-primary/50 shadow-none"
                        : "bg-gradient-to-r from-orange-500 to-primary hover:from-orange-400 hover:to-primary/90 hover:shadow-orange-500/30"
                  }`}
                >
                  <InstallButtonContent state={installState} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PWAInstallBanner;
