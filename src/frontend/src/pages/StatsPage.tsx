import {
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  Flame,
  Scissors,
  Snowflake,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { CalendarHeatmap } from "../components/CalendarHeatmap";
import { Badge } from "../components/ui/badge";
import { cn } from "../lib/utils";
import { useVajraStore } from "../store/vajraStore";
import type { AppActivity, AppBreakLog } from "../types/index";

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: boolean;
}

function StatCard({ icon, label, value, accent }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-4 rounded-2xl border transition-smooth",
        accent ? "bg-primary/10 border-primary/25" : "bg-card border-border/40",
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center",
          accent ? "bg-primary/20" : "bg-secondary/60",
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground leading-none">
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
          {label}
        </p>
      </div>
    </div>
  );
}

// ─── Stats Panel (per-activity) ───────────────────────────────────────────────

function ActivityStatsPanel({ activity }: { activity: AppActivity }) {
  const streaks = useVajraStore((s) => s.streaks);
  const completions = useVajraStore((s) => s.completions);
  const breakLogs = useVajraStore((s) => s.breakLogs);

  const streak = streaks[activity.id];

  // Compute stats from local data
  const stats = useMemo(() => {
    const actBreaks = breakLogs.filter((b) => b.activityId === activity.id);
    const manualBreaks = actBreaks.filter((b) => b.wasManual).length;
    const autoBreaks = actBreaks.filter((b) => !b.wasManual).length;
    return {
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
      totalDays: streak?.totalDaysCompleted ?? 0,
      manualBreaks,
      autoBreaks,
      freezesUsed: streak?.freezeTokensUsed ?? 0,
    };
  }, [streak, breakLogs, activity.id]);

  // Build completion calendar data from local completions store
  const calendarData = useMemo(() => {
    return Object.entries(completions)
      .filter(([, ids]) => ids.includes(activity.id))
      .map(([date]) => ({ date, completed: true }));
  }, [completions, activity.id]);

  return (
    <div className="flex flex-col gap-5">
      {/* Stat cards grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Flame className="w-4 h-4 text-primary" />}
          label="Current Streak"
          value={`${stats.currentStreak}d`}
          accent
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4 text-foreground" />}
          label="Longest Streak"
          value={`${stats.longestStreak}d`}
        />
        <StatCard
          icon={<Calendar className="w-4 h-4 text-foreground" />}
          label="Total Days"
          value={stats.totalDays}
        />
        <StatCard
          icon={<Snowflake className="w-4 h-4 text-foreground" />}
          label="Freezes Used"
          value={stats.freezesUsed}
        />
        <StatCard
          icon={<Scissors className="w-4 h-4 text-foreground" />}
          label="Manual Breaks"
          value={stats.manualBreaks}
        />
        <StatCard
          icon={<BookOpen className="w-4 h-4 text-foreground" />}
          label="Missed Days"
          value={stats.autoBreaks}
        />
      </div>

      {/* Calendar heatmap */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Completion History
        </h3>
        <CalendarHeatmap completions={calendarData} />
      </div>
    </div>
  );
}

// ─── Break Log Entry ──────────────────────────────────────────────────────────

function BreakLogEntry({
  log,
  activity,
  index,
}: { log: AppBreakLog; activity?: AppActivity; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const isTruncated = log.reason.length > 100;
  const displayReason =
    expanded || !isTruncated ? log.reason : `${log.reason.slice(0, 100)}…`;

  return (
    <motion.div
      data-ocid={`stats.break_log.item.${index}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex gap-3 p-4 rounded-2xl bg-card border border-border/40"
    >
      <div className="text-xl leading-none mt-0.5">
        {activity?.emoji ?? "📋"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {activity?.name ?? "Activity"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(log.breakDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              <span className="mx-1.5 opacity-40">·</span>
              <span className="opacity-60">
                {log.streakLengthAtBreak}d streak
              </span>
            </p>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              "text-[10px] font-semibold shrink-0",
              log.wasManual
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-destructive/15 text-destructive border-destructive/30",
            )}
          >
            {log.wasManual ? "manual" : "missed"}
          </Badge>
        </div>
        {log.reason && (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {displayReason}
            </p>
            {isTruncated && (
              <button
                type="button"
                data-ocid={`stats.break_log.expand.${index}`}
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-primary mt-1 flex items-center gap-0.5 hover:text-primary/80 transition-smooth focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-3 h-3" /> Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" /> Read more
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Stats Page ───────────────────────────────────────────────────────────────

export default function StatsPage() {
  // Read directly from store — no loading state
  const activities = useVajraStore((s) => s.activities);
  const breakLogs = useVajraStore((s) => s.breakLogs);
  const [selectedTab, setSelectedTab] = useState(0);

  const currentActivity = activities[selectedTab] ?? activities[0];
  const activityBreakLogs = currentActivity
    ? [...breakLogs]
        .filter((l) => l.activityId === currentActivity.id)
        .sort((a, b) => b.createdAt - a.createdAt)
    : [];

  const activityMap = new Map(activities.map((a) => [a.id, a]));

  return (
    <div data-ocid="stats.page" className="flex flex-col gap-6 pb-4">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="pt-2">
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          History & Stats
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your journey, by the numbers
        </p>
      </div>

      {/* ── No activities ──────────────────────────────────────────────────── */}
      {activities.length === 0 && (
        <div
          data-ocid="stats.empty_state"
          className="flex flex-col items-center gap-3 py-16 rounded-2xl bg-card border border-border/30 text-center px-4"
        >
          <span className="text-4xl">📊</span>
          <p className="text-sm text-muted-foreground">
            No activities yet. Add one from the dashboard to track your stats.
          </p>
        </div>
      )}

      {/* ── Activity tabs ──────────────────────────────────────────────────── */}
      {activities.length > 0 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
          role="tablist"
          aria-label="Select activity for stats"
        >
          {activities.map((act, i) => (
            <button
              key={act.id}
              type="button"
              role="tab"
              data-ocid={`stats.activity_tab.${i + 1}`}
              aria-selected={selectedTab === i}
              onClick={() => setSelectedTab(i)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-smooth border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selectedTab === i
                  ? "bg-primary text-primary-foreground border-primary/60 shadow-sm"
                  : "bg-secondary/60 text-muted-foreground border-border/40 hover:text-foreground hover:bg-secondary",
              )}
            >
              <span>{act.emoji}</span>
              <span>{act.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Stats for selected activity ───────────────────────────────────── */}
      {currentActivity && (
        <ActivityStatsPanel
          key={currentActivity.id}
          activity={currentActivity}
        />
      )}

      {/* ── Break Log Journal ─────────────────────────────────────────────── */}
      <div data-ocid="stats.break_log.section" className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground tracking-tight">
            Honest Break Log
          </h2>
          {activityBreakLogs.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {activityBreakLogs.length} entries
            </span>
          )}
        </div>

        {activityBreakLogs.length === 0 ? (
          <div
            data-ocid="stats.break_log.empty_state"
            className="flex flex-col items-center gap-3 py-10 rounded-2xl bg-card border border-border/30 text-center px-4"
          >
            <span className="text-3xl">✨</span>
            <p className="text-sm text-muted-foreground">
              Your log is empty — a clean record ✨
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {activityBreakLogs.map((log, i) => (
              <BreakLogEntry
                key={log.id}
                log={log}
                activity={activityMap.get(log.activityId)}
                index={i + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
