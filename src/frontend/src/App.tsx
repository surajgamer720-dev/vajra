import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { Suspense, lazy, useEffect } from "react";
import { Layout } from "./components/Layout";
import { Skeleton } from "./components/ui/skeleton";
import { QUOTES } from "./data/quotes";
import { restoreNotificationSchedules } from "./services/notifications";
import { useVajraStore } from "./store/vajraStore";
import { useRegisterSW } from "virtual:pwa-register/react";
import { useState, useCallback } from "react";

// ─── Apply persisted appearance settings before first paint ──────────────────
(function applyPersistedAppearance() {
  try {
    const raw = localStorage.getItem("vajra-store");
    if (raw) {
      const stored = JSON.parse(raw) as {
        state?: {
          settings?: {
            animationsEnabled?: boolean;
            highContrast?: boolean;
            textSize?: string;
          };
        };
      };
      const s = stored?.state?.settings;
      if (s?.animationsEnabled === false)
        document.body.classList.add("no-motion");
      if (s?.highContrast === true)
        document.body.classList.add("high-contrast");
      if (s?.textSize && s.textSize !== "medium")
        document.body.classList.add(`text-scale-${s.textSize}`);
    }
  } catch {
    // ignore — localStorage may be unavailable
  }
})();

// ─── Lazy pages ────────────────────────────────────────────────────────────────
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const TrophyPage = lazy(() => import("./pages/TrophyPage"));
const StatsPage = lazy(() => import("./pages/StatsPage"));
const QuotesPage = lazy(() => import("./pages/QuotesPage"));
const QuickTapPage = lazy(() => import("./pages/QuickTapPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

// ─── Loading fallback ─────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex flex-col gap-4 p-4 pt-6">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}

// ─── App Init — runs once on app mount ───────────────────────────────────────
function AppInit() {
  useEffect(() => {
    const store = useVajraStore.getState();

    // 1. Run streak integrity check — reset broken streaks
    store.runStreakIntegrityCheck();

    // 2. Sync actual browser notification permission to store
    if ("Notification" in window) {
      const actualPerm = Notification.permission;
      if (actualPerm !== store.notificationPermission) {
        store.setNotificationPermission(actualPerm);
      }
    }

    // 3. Restore notification schedules if permission granted
    if (
      store.notificationPermission === "granted" &&
      store.activities.length > 0
    ) {
      try {
        restoreNotificationSchedules(
          store.activities,
          store.settings.notifications,
          QUOTES,
        );
      } catch {
        // ignore notification errors
      }
    }
  }, []); // Run once on mount

  return null;
}

// ─── Root route ────────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// ─── Onboarding route ─────────────────────────────────────────────────────────
const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <OnboardingPage />
    </Suspense>
  ),
});

// ─── Layout wrapper route ─────────────────────────────────────────────────────
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  beforeLoad: () => {
    const profile = useVajraStore.getState().userProfile;
    if (!profile?.onboardingComplete) {
      throw redirect({ to: "/onboarding" });
    }
  },
  component: () => (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </Layout>
  ),
});

// ─── App routes ───────────────────────────────────────────────────────────────
const dashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: DashboardPage,
});

const trophyRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/trophy",
  component: TrophyPage,
});

const statsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/stats",
  component: StatsPage,
});

const quotesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/quotes",
  component: QuotesPage,
});

const quickTapRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/quick-tap",
  component: QuickTapPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/settings",
  component: SettingsPage,
});

// ─── Router ───────────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  onboardingRoute,
  layoutRoute.addChildren([
    dashboardRoute,
    trophyRoute,
    statsRoute,
    quotesRoute,
    quickTapRoute,
    settingsRoute,
  ]),
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function UpdateNotification() {
  const [showReload, setShowReload] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [offlineReady, setOfflineReady] = useState(false);

  const onSWEvent = useCallback((event: any) => {
    if (event.type === "NEED_REFRESH") {
      setShowReload(true);
    } else if (event.type === "OFFLINE_READY") {
      setOfflineReady(true);
      setTimeout(() => setOfflineReady(false), 3000);
    }
  }, []);

  const { updateServiceWorker } = useRegisterSW({
    onRegisterError: (error: any) => console.error("SW registration error:", error),
    onSWEvent,
  });

  const handleUpdate = () => {
    setDownloading(true);
    let prog = 0;
    const interval = setInterval(() => {
      prog += 20;
      setProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        updateServiceWorker(true);
      }
    }, 1000);
  };

  if (offlineReady) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
        App ready for offline use!
      </div>
    );
  }

  if (!showReload) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 min-w-[300px]">
      <div className="font-bold mb-2">New version available!</div>
      {downloading ? (
        <div className="space-y-2">
          <div className="text-sm">Downloading update...</div>
          <div className="w-full bg-blue-800 rounded-full h-2.5">
            <div
              className="bg-white h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-blue-200">{progress}%</div>
        </div>
      ) : (
        <button
          onClick={handleUpdate}
          className="bg-white text-blue-600 px-4 py-1 rounded font-semibold hover:bg-blue-50"
        >
          Download Update
        </button>
      )}
    </div>
  );
}

export default function App() {
  const [updateComplete, setUpdateComplete] = useState(false);

  useEffect(() => {
    const handleComplete = () => {
      setUpdateComplete(true);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    };
    window.addEventListener("vajra:update-complete", handleComplete);
    return () => window.removeEventListener("vajra:update-complete", handleComplete);
  }, []);

  return (
    <>
      {updateComplete && (
        <div className="fixed top-14 left-0 right-0 z-50 bg-emerald-500 text-white text-center py-2 text-sm font-semibold">
          ✅ App Updated Successfully!
        </div>
      )}
      <AppInit />
      <RouterProvider router={router} />
      <UpdateNotification />
    </>
  );
}
