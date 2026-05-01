import { Link, useLocation } from "@tanstack/react-router";
import {
  BarChart2,
  BookOpen,
  Flame,
  Home,
  Settings,
  Trophy,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { PWAInstallBanner } from "./PWAInstallBanner";
import { PWAUpdateBanner } from "./PWAUpdateBanner";

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  ocid: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", icon: Home, label: "Home", ocid: "nav.home_link" },
  { to: "/trophy", icon: Trophy, label: "Trophy", ocid: "nav.trophy_link" },
  { to: "/stats", icon: BarChart2, label: "Stats", ocid: "nav.stats_link" },
  { to: "/quotes", icon: BookOpen, label: "Quotes", ocid: "nav.quotes_link" },
];

interface LayoutProps {
  children: React.ReactNode;
}

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

export function Layout({ children }: LayoutProps) {
  const pathname = useLocation({ select: (l) => l.pathname });
  const isOnline = useOnlineStatus();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-card border-b border-border/60 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between px-5 h-14 max-w-lg mx-auto w-full">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary animate-fire-flicker" />
            <span className="font-display text-xl font-bold tracking-wide text-foreground">
              Vajra
            </span>
          </div>
          <div className="flex items-center gap-1">
            {/* Offline indicator */}
            {!isOnline && (
              <div
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30"
                title="You're offline — data is synced when back online"
                data-ocid="layout.offline_indicator"
              >
                <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-xs text-amber-400 font-medium hidden sm:inline">
                  Offline
                </span>
              </div>
            )}
            <Link
              to="/settings"
              data-ocid="nav.settings_link"
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── PWA Update Banner (below header, above content) ──────────────── */}
      <PWAUpdateBanner />

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-24 max-w-lg mx-auto w-full px-4 pt-4">
        {children}
      </main>

      {/* ── PWA Install Banner (above bottom nav) ────────────────────────── */}
      <PWAInstallBanner />

      {/* ── Bottom navigation ─────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border/60 backdrop-blur-sm">
        <div className="flex items-center justify-around max-w-lg mx-auto px-2 h-16">
          {NAV_ITEMS.map(({ to, icon: Icon, label, ocid }) => {
            const isActive =
              pathname === to || (to !== "/" && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                data-ocid={ocid}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl min-w-0",
                  "text-xs font-medium transition-smooth",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-lg transition-smooth",
                    isActive ? "bg-primary/15" : "bg-transparent",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-smooth",
                      isActive ? "text-primary fire-glow" : "",
                    )}
                  />
                </div>
                <span className={cn(isActive ? "text-primary" : "")}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default Layout;
