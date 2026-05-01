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

export default function App() {
  return (
    <>
      <AppInit />
      <RouterProvider router={router} />
    </>
  );
}
