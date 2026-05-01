import { Lock, Share2, Trophy, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { BadgeSVG } from "../components/BadgeSVG";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { useVajraStore } from "../store/vajraStore";
import {
  type AppActivity,
  type AppMilestoneUnlock,
  MILESTONE_DAYS,
  getBadgeTier,
  getMilestoneName,
} from "../types/index";
import { shareAchievement } from "../utils/shareImage";

// ─── Badge Detail Sheet ───────────────────────────────────────────────────────

interface SheetProps {
  activity: AppActivity;
  milestone: AppMilestoneUnlock;
  onClose: () => void;
}

function BadgeDetailSheet({ activity, milestone, onClose }: SheetProps) {
  const tier = getBadgeTier(milestone.milestoneDay);
  const name = getMilestoneName(milestone.milestoneDay);
  const userName = useVajraStore((s) => s.userProfile?.name);
  const dateStr = new Date(milestone.unlockedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  async function handleShare() {
    await shareAchievement(
      userName ?? "You",
      activity.name,
      milestone.milestoneDay,
      tier,
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Sheet */}
        <motion.div
          data-ocid="trophy.badge_detail.dialog"
          className="relative z-10 w-full max-w-lg bg-card border border-border/60 rounded-t-3xl p-6 pb-10 shadow-2xl"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
        >
          {/* Close button */}
          <button
            type="button"
            data-ocid="trophy.badge_detail.close_button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close badge detail"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge */}
          <div className="flex flex-col items-center gap-4 pt-2">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 280 }}
            >
              <BadgeSVG
                day={milestone.milestoneDay}
                tier={tier}
                isLocked={false}
                size={140}
              />
            </motion.div>

            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{name}</p>
              <p className="text-muted-foreground text-sm mt-1">
                {activity.emoji} {activity.name} — Day {milestone.milestoneDay}
              </p>
              <p className="text-muted-foreground text-xs mt-2">{dateStr}</p>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                className="capitalize text-xs font-semibold border"
                style={{
                  background:
                    tier === "bronze"
                      ? "oklch(0.25 0.05 60)"
                      : tier === "silver"
                        ? "oklch(0.25 0.03 280)"
                        : tier === "gold"
                          ? "oklch(0.25 0.07 80)"
                          : "oklch(0.25 0.05 220)",
                  color:
                    tier === "bronze"
                      ? "oklch(0.75 0.15 60)"
                      : tier === "silver"
                        ? "oklch(0.85 0.02 270)"
                        : tier === "gold"
                          ? "oklch(0.88 0.20 80)"
                          : "oklch(0.85 0.15 220)",
                }}
              >
                {tier}
              </Badge>
            </div>

            <Button
              type="button"
              data-ocid="trophy.badge_detail.share_button"
              onClick={handleShare}
              className="mt-3 w-full max-w-xs gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share this milestone
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center bg-secondary/60 border border-border/40 rounded-xl px-4 py-3 min-w-[80px]">
      <span className="text-xl font-bold text-primary leading-none">
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

// ─── Trophy Page ──────────────────────────────────────────────────────────────

export default function TrophyPage() {
  // Read directly from store — no loading state
  const activities = useVajraStore((s) => s.activities);
  const allMilestones = useVajraStore((s) => s.milestones);
  const allStreaks = useVajraStore((s) => s.streaks);

  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedBadge, setSelectedBadge] = useState<{
    activity: AppActivity;
    milestone: AppMilestoneUnlock;
  } | null>(null);

  const totalUnlocked = Object.values(allMilestones).reduce(
    (acc, ms) => acc + ms.length,
    0,
  );
  const totalPossible = activities.length * MILESTONE_DAYS.length;

  const currentActivity = activities[selectedTab];
  const actMilestones: AppMilestoneUnlock[] = currentActivity
    ? (allMilestones[currentActivity.id] ?? [])
    : [];
  const unlockedDays = new Set(actMilestones.map((m) => m.milestoneDay));

  const streak = currentActivity ? allStreaks[currentActivity.id] : undefined;

  return (
    <div data-ocid="trophy.page" className="flex flex-col gap-6 pb-4">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="pt-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/25">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Trophy Room
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {totalUnlocked} of {totalPossible} milestones unlocked
            </p>
          </div>
        </div>
      </div>

      {/* ── Activity tabs ──────────────────────────────────────────────────── */}
      {activities.length === 0 ? (
        <div
          data-ocid="trophy.empty_state"
          className="flex flex-col items-center gap-3 py-12 text-center"
        >
          <Lock className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">
            Add an activity to start earning badges
          </p>
        </div>
      ) : (
        <>
          <div
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
            role="tablist"
            aria-label="Select activity"
          >
            {activities.map((act, i) => (
              <button
                key={act.id}
                type="button"
                role="tab"
                data-ocid={`trophy.activity_tab.${i + 1}`}
                aria-selected={selectedTab === i}
                onClick={() => setSelectedTab(i)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-smooth border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selectedTab === i
                    ? "bg-primary text-primary-foreground border-primary/60 shadow-sm fire-glow"
                    : "bg-secondary/60 text-muted-foreground border-border/40 hover:text-foreground hover:bg-secondary",
                )}
              >
                <span>{act.emoji}</span>
                <span>{act.name}</span>
              </button>
            ))}
          </div>

          {/* ── Summary stat pills ──────────────────────────────────────────── */}
          {currentActivity && streak && (
            <div
              data-ocid="trophy.stats_summary.section"
              className="flex gap-3 overflow-x-auto scrollbar-none pb-1"
            >
              <StatPill label="Unlocked" value={actMilestones.length} />
              <StatPill label="Streak" value={`${streak.currentStreak}d`} />
              <StatPill label="Best" value={`${streak.longestStreak}d`} />
            </div>
          )}

          {/* ── Badge grid ──────────────────────────────────────────────────── */}
          <ul
            data-ocid="trophy.badge_grid.section"
            className="grid grid-cols-4 gap-3 list-none p-0 m-0"
            aria-label="Milestone badges"
          >
            {MILESTONE_DAYS.map((day, idx) => {
              const unlocked = unlockedDays.has(day);
              const tier = getBadgeTier(day);
              const unlock = actMilestones.find((m) => m.milestoneDay === day);
              const dateLabel = unlock
                ? new Date(unlock.unlockedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })
                : null;

              return (
                <motion.li
                  key={day}
                  data-ocid={`trophy.badge.${idx + 1}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: idx * 0.03,
                    type: "spring",
                    stiffness: 260,
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-2xl border transition-smooth",
                    unlocked
                      ? "cursor-pointer bg-secondary/40 border-primary/20 hover:border-primary/50 hover:bg-secondary/70"
                      : "bg-secondary/20 border-border/30 opacity-60",
                  )}
                  onClick={() => {
                    if (unlocked && unlock) {
                      setSelectedBadge({
                        activity: currentActivity,
                        milestone: unlock,
                      });
                    }
                  }}
                >
                  <BadgeSVG
                    day={day}
                    tier={tier}
                    isLocked={!unlocked}
                    size={56}
                  />
                  {dateLabel && (
                    <span className="text-[9px] text-primary/80 font-medium text-center leading-tight">
                      {dateLabel}
                    </span>
                  )}
                </motion.li>
              );
            })}
          </ul>
        </>
      )}

      {/* ── Badge detail sheet ─────────────────────────────────────────────── */}
      {selectedBadge && (
        <BadgeDetailSheet
          activity={selectedBadge.activity}
          milestone={selectedBadge.milestone}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
}
