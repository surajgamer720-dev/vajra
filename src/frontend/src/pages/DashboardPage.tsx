import { Link } from "@tanstack/react-router";
import { MoreVertical, Plus, Settings, Snowflake, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BreakReasonDialog } from "../components/BreakReasonDialog";
import { FlameIcon } from "../components/FlameIcon";
import { MilestoneOverlay } from "../components/MilestoneOverlay";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
import { getQuoteForToday } from "../data/quotes";
import { scheduleActivityReminder } from "../services/notifications";
import {
  playBreakSound,
  playCompletionSound,
  playMilestoneSound,
} from "../services/sounds";
import { useVajraStore } from "../store/vajraStore";
import {
  type AppActivity,
  type AppMilestoneUnlock,
  getBadgeTier,
  getFlameLevel,
  todayString,
} from "../types/index";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface QuoteOverlay {
  text: string;
  author: string;
}

interface ConfettiDot {
  id: number;
  x: number;
  y: number;
  color: string;
}

// ─── Confetti helper ───────────────────────────────────────────────────────────

const CONFETTI_COLORS = [
  "oklch(0.82 0.21 70)",
  "oklch(0.65 0.19 40)",
  "oklch(0.72 0.21 291)",
  "oklch(0.88 0.18 200)",
  "oklch(0.82 0.19 119)",
  "oklch(0.96 0.14 80)",
  "oklch(0.62 0.21 17)",
  "oklch(0.78 0.22 50)",
];

function makeConfetti(n = 8): ConfettiDot[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    x: Math.cos((i / n) * Math.PI * 2) * 60,
    y: Math.sin((i / n) * Math.PI * 2) * 60,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }));
}

// ─── Greeting ─────────────────────────────────────────────────────────────────

function greeting(name: string): string {
  const h = new Date().getHours();
  if (h < 12) return `Good morning, ${name}`;
  if (h < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 gap-6"
      data-ocid="dashboard.empty_state"
    >
      <svg
        width="80"
        height="100"
        viewBox="0 0 80 100"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="34"
          y="60"
          width="12"
          height="30"
          rx="4"
          fill="oklch(0.35 0.08 309)"
        />
        <ellipse cx="40" cy="62" rx="10" ry="4" fill="oklch(0.3 0.07 309)" />
        <motion.ellipse
          cx="40"
          cy="58"
          rx="7"
          ry="10"
          fill="oklch(0.72 0.22 50)"
          animate={{ scaleY: [1, 1.08, 0.96, 1], opacity: [0.9, 1, 0.85, 0.9] }}
          transition={{
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.ellipse
          cx="40"
          cy="52"
          rx="4.5"
          ry="6"
          fill="oklch(0.88 0.21 70)"
          animate={{ scaleY: [1, 1.1, 0.93, 1] }}
          transition={{
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 0.2,
          }}
        />
        <motion.ellipse
          cx="40"
          cy="47"
          rx="2.5"
          ry="3.5"
          fill="oklch(0.97 0.12 85)"
          animate={{ scaleY: [1, 1.12, 0.94, 1] }}
          transition={{
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 0.4,
          }}
        />
      </svg>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          Start your first discipline
        </h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Choose something worth building. Every great journey begins with a
          single flame.
        </p>
      </div>
      <Button
        type="button"
        onClick={onAdd}
        className="gap-2"
        data-ocid="dashboard.add_first_activity_button"
      >
        <Plus size={16} />
        Add Activity
      </Button>
    </motion.div>
  );
}

// ─── Activity Card ─────────────────────────────────────────────────────────────

interface ActivityCardProps {
  activity: AppActivity;
  currentStreak: number;
  index: number;
  onComplete: (id: string) => void;
  onBreak: (id: string) => void;
  completedToday: boolean;
  isAnimating: boolean;
  hasFreezeToken: boolean;
  freezeActive: boolean;
  onApplyFreeze: (id: string) => void;
}

function ActivityCard({
  activity,
  currentStreak,
  index,
  onComplete,
  onBreak,
  completedToday,
  isAnimating,
  hasFreezeToken,
  freezeActive,
  onApplyFreeze,
}: ActivityCardProps) {
  const flameLevel = getFlameLevel(currentStreak);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handlePointerDown() {
    longPressTimer.current = setTimeout(() => {
      onBreak(activity.id);
    }, 500);
  }

  function handlePointerUp() {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }

  const confettiDots = isAnimating ? makeConfetti(8) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      data-ocid={`dashboard.activity_card.${index + 1}`}
      className={[
        "relative rounded-2xl p-4 border transition-smooth select-none",
        completedToday
          ? "border-[oklch(0.55_0.18_145/0.5)] bg-card shadow-[0_0_16px_oklch(0.55_0.18_145/0.2)]"
          : "border-border bg-card hover:border-[oklch(var(--primary)/0.4)]",
        isAnimating ? "border-[oklch(var(--primary)/0.8)] fire-glow" : "",
      ].join(" ")}
    >
      {/* Confetti burst */}
      <AnimatePresence>
        {confettiDots.map((dot) => (
          <motion.span
            key={dot.id}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
            animate={{ opacity: 0, x: dot.x, y: dot.y, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 rounded-full pointer-events-none z-10"
            style={{
              width: 8,
              height: 8,
              background: dot.color,
              marginLeft: -4,
              marginTop: -4,
            }}
          />
        ))}
      </AnimatePresence>

      <div className="flex items-center gap-4">
        {/* Flame */}
        <div
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="flex-shrink-0 cursor-pointer"
        >
          <motion.div
            animate={isAnimating ? { scale: [1, 1.4, 1.05, 1] } : { scale: 1 }}
            transition={{ duration: 0.6, ease: [0.68, -0.55, 0.265, 1.55] }}
          >
            <FlameIcon
              streakLevel={flameLevel}
              isActive={isAnimating}
              size={52}
            />
          </motion.div>
        </div>

        {/* Center info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-semibold text-foreground truncate">
              {activity.emoji} {activity.name}
            </span>
            {freezeActive && (
              <Badge className="text-xs bg-[oklch(0.55_0.18_220/0.2)] text-[oklch(0.72_0.18_220)] border-[oklch(0.55_0.18_220/0.4)]">
                ❄️ Protected
              </Badge>
            )}
          </div>

          <div className="flex items-baseline gap-1 mt-0.5">
            <motion.span
              key={currentStreak}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-primary leading-none"
            >
              {currentStreak}
            </motion.span>
            <span className="text-xs text-muted-foreground">day streak</span>
          </div>

          {completedToday && (
            <span className="text-xs text-[oklch(0.65_0.18_145)] mt-0.5 block">
              ✓ Done today
            </span>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Freeze token badge */}
          {hasFreezeToken &&
            !completedToday &&
            currentStreak > 0 &&
            !freezeActive && (
              <button
                type="button"
                onClick={() => onApplyFreeze(activity.id)}
                data-ocid={`dashboard.freeze_button.${index + 1}`}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-[oklch(0.55_0.18_220/0.15)] border border-[oklch(0.55_0.18_220/0.4)] hover:bg-[oklch(0.55_0.18_220/0.25)] transition-smooth"
                title="Apply Freeze Token to protect streak"
              >
                <Snowflake size={14} className="text-[oklch(0.72_0.18_220)]" />
              </button>
            )}

          {/* Complete button */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => !completedToday && onComplete(activity.id)}
            data-ocid={`dashboard.complete_button.${index + 1}`}
            aria-label={
              completedToday ? "Completed today" : `Complete ${activity.name}`
            }
            className={[
              "w-12 h-12 rounded-full flex items-center justify-center transition-smooth text-xl font-bold",
              completedToday
                ? "bg-[oklch(0.45_0.18_145/0.2)] border-2 border-[oklch(0.55_0.18_145/0.6)] text-[oklch(0.65_0.18_145)] cursor-default"
                : "bg-primary/10 border-2 border-primary/60 text-primary hover:bg-primary/20 cursor-pointer",
            ].join(" ")}
          >
            {completedToday ? "✓" : "○"}
          </motion.button>

          {/* Three-dot menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                data-ocid={`dashboard.activity_menu.${index + 1}`}
                className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
                aria-label="Activity options"
              >
                <MoreVertical size={15} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                onSelect={() => onBreak(activity.id)}
                data-ocid={`dashboard.break_streak_menu_item.${index + 1}`}
              >
                Break Streak
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Add Activity Sheet ────────────────────────────────────────────────────────

const EMOJI_OPTIONS = [
  "🧘",
  "💪",
  "📖",
  "✍️",
  "🏃",
  "🥗",
  "💧",
  "🌅",
  "🎯",
  "🔥",
  "🎵",
  "🧠",
];

interface AddActivitySheetProps {
  open: boolean;
  onClose: () => void;
}

function AddActivitySheet({ open, onClose }: AddActivitySheetProps) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🔥");
  const [reminderTime, setReminderTime] = useState("");
  const addActivity = useVajraStore((s) => s.addActivity);
  const notificationPermission = useVajraStore((s) => s.notificationPermission);

  function handleSave() {
    if (!name.trim()) return;
    const newActivity: AppActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      isPredefined: false,
      name: name.trim(),
      createdAt: BigInt(Date.now()),
      emoji,
      reminderTime: reminderTime || undefined,
    };
    addActivity(newActivity);

    // Schedule reminder if time set and permission granted
    if (reminderTime && notificationPermission === "granted") {
      scheduleActivityReminder(newActivity);
    }

    toast.success(`${emoji} ${name.trim()} added!`);
    setName("");
    setEmoji("🔥");
    setReminderTime("");
    onClose();
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl bg-card border-border pb-8"
        data-ocid="add_activity.sheet"
      >
        <SheetHeader className="mb-4">
          <SheetTitle className="text-foreground">New Activity</SheetTitle>
        </SheetHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-foreground text-sm">Activity Name</Label>
            <Input
              data-ocid="add_activity.name_input"
              placeholder="e.g. Morning meditation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background border-input"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground text-sm">Emoji</Label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => setEmoji(e)}
                  data-ocid={`add_activity.emoji_${e}`}
                  className={[
                    "w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-smooth",
                    emoji === e
                      ? "bg-primary/20 border-2 border-primary scale-110"
                      : "bg-background border border-border hover:border-primary/50",
                  ].join(" ")}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground text-sm">
              Daily Reminder (optional)
            </Label>
            <Input
              type="time"
              data-ocid="add_activity.reminder_input"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="bg-background border-input w-40"
            />
          </div>

          <Button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full gap-2"
            data-ocid="add_activity.save_button"
          >
            <Zap size={16} />
            Add Activity
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Quote Overlay ─────────────────────────────────────────────────────────────

function QuoteOverlayBanner({
  quote,
  onDismiss,
}: { quote: QuoteOverlay; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ y: 120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 120, opacity: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 200 }}
      className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-8"
      onClick={onDismiss}
      data-ocid="dashboard.quote_overlay"
    >
      <div className="max-w-lg mx-auto rounded-2xl bg-[oklch(0.14_0.06_309/0.96)] border border-[oklch(var(--primary)/0.3)] backdrop-blur-xl p-5 shadow-2xl">
        <p className="quote-text text-foreground mb-2">"{quote.text}"</p>
        <p className="text-xs text-muted-foreground text-right">
          — {quote.author}
        </p>
        <p className="text-xs text-muted-foreground/50 text-center mt-2">
          Tap to dismiss
        </p>
      </div>
    </motion.div>
  );
}

// ─── Dashboard Page ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  // ── Read DIRECTLY from store — zero loading state ──────────────────────────
  const activities = useVajraStore((s) => s.activities);
  const streaks = useVajraStore((s) => s.streaks);
  const completions = useVajraStore((s) => s.completions);
  const freezeTokens = useVajraStore((s) => s.freezeTokens);
  const userProfile = useVajraStore((s) => s.userProfile);
  const settings = useVajraStore((s) => s.settings);
  const savedQuoteIds = useVajraStore((s) => s.savedQuoteIds);
  const completeActivityLocally = useVajraStore(
    (s) => s.completeActivityLocally,
  );
  const breakStreakLocally = useVajraStore((s) => s.breakStreakLocally);
  const applyFreezeToken = useVajraStore((s) => s.applyFreezeToken);

  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [breakDialogId, setBreakDialogId] = useState<string | null>(null);
  const [quoteOverlay, setQuoteOverlay] = useState<QuoteOverlay | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [celebratingMilestone, setCelebratingMilestone] = useState<{
    activityId: string;
    milestone: AppMilestoneUnlock;
  } | null>(null);
  const quoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const today = todayString();
  const todayCompletions = completions[today] ?? [];

  // Auto-dismiss quote after 6s
  useEffect(() => {
    if (quoteOverlay) {
      quoteTimer.current = setTimeout(() => setQuoteOverlay(null), 6000);
    }
    return () => {
      if (quoteTimer.current) clearTimeout(quoteTimer.current);
    };
  }, [quoteOverlay]);

  const handleComplete = useCallback(
    (activityId: string) => {
      setAnimatingId(activityId);
      setTimeout(() => setAnimatingId(null), 700);

      const result = completeActivityLocally(activityId);

      if (result.alreadyDone) return;

      if (result.isNewMilestone && result.milestoneDay != null) {
        playMilestoneSound(settings.soundEnabled);
        // Find the newly created milestone from store
        const actMs = useVajraStore.getState().milestones[activityId] ?? [];
        const unlock = actMs.find(
          (m) => m.milestoneDay === result.milestoneDay,
        );
        if (unlock) {
          setCelebratingMilestone({ activityId, milestone: unlock });
        }
      } else {
        playCompletionSound(settings.soundEnabled);
        const q = getQuoteForToday(savedQuoteIds);
        setQuoteOverlay({ text: q.text, author: q.author });
      }
    },
    [completeActivityLocally, settings.soundEnabled, savedQuoteIds],
  );

  const handleBreakConfirm = useCallback(
    (reason: string) => {
      if (!breakDialogId) return;
      playBreakSound(settings.soundEnabled);
      breakStreakLocally(breakDialogId, reason);
      toast("Streak reset. Recorded honestly. 🙏");
      setBreakDialogId(null);
    },
    [breakDialogId, breakStreakLocally, settings.soundEnabled],
  );

  const handleApplyFreeze = useCallback(
    (activityId: string) => {
      const success = applyFreezeToken(activityId);
      if (success) {
        toast.success("Freeze token applied! Streak protected.");
      } else {
        toast.error("No freeze tokens available.");
      }
    },
    [applyFreezeToken],
  );

  const breakActivity = activities.find((a) => a.id === breakDialogId);
  const breakStreakLength = breakDialogId
    ? (streaks[breakDialogId]?.currentStreak ?? 0)
    : 0;

  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const userName = userProfile?.name ?? "Warrior";

  return (
    <div
      className="relative min-h-screen bg-background"
      data-ocid="dashboard.page"
    >
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3 flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{dateLabel}</p>
          <h1 className="text-lg font-semibold text-foreground leading-tight">
            {greeting(userName)}
          </h1>
        </div>
        <Link
          to="/settings"
          data-ocid="dashboard.settings_link"
          aria-label="Settings"
        >
          <Settings
            size={22}
            className="text-muted-foreground hover:text-foreground transition-smooth mt-1"
          />
        </Link>
      </header>

      {/* Content — NEVER blocked by isLoading */}
      <main className="px-4 py-5 pb-28 max-w-2xl mx-auto space-y-3">
        {activities.length === 0 && (
          <EmptyState onAdd={() => setShowAddSheet(true)} />
        )}

        {activities.length > 0 && (
          <AnimatePresence>
            {activities.map((activity, i) => {
              const streak = streaks[activity.id];
              const currentStreak = streak?.currentStreak ?? 0;
              const completedToday = todayCompletions.includes(activity.id);
              const hasFreezeToken = (freezeTokens[activity.id] ?? 0) > 0;
              const freezeActive = streak?.freezeActiveDate === today;

              return (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  currentStreak={currentStreak}
                  index={i}
                  onComplete={handleComplete}
                  onBreak={setBreakDialogId}
                  completedToday={completedToday}
                  isAnimating={animatingId === activity.id}
                  hasFreezeToken={hasFreezeToken}
                  freezeActive={freezeActive}
                  onApplyFreeze={handleApplyFreeze}
                />
              );
            })}
          </AnimatePresence>
        )}
      </main>

      {/* FAB */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
        className="fixed bottom-20 right-5 z-30"
      >
        <button
          type="button"
          onClick={() => setShowAddSheet(true)}
          data-ocid="dashboard.add_activity_fab"
          aria-label="Add activity"
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-smooth fire-glow"
        >
          <Plus size={24} />
        </button>
      </motion.div>

      {/* Break Reason Dialog */}
      <BreakReasonDialog
        open={!!breakDialogId}
        activityName={breakActivity?.name ?? ""}
        streakLength={breakStreakLength}
        onConfirm={handleBreakConfirm}
        onCancel={() => setBreakDialogId(null)}
      />

      {/* Add Activity Sheet */}
      <AddActivitySheet
        open={showAddSheet}
        onClose={() => setShowAddSheet(false)}
      />

      {/* Quote Overlay */}
      <AnimatePresence>
        {quoteOverlay && (
          <QuoteOverlayBanner
            quote={quoteOverlay}
            onDismiss={() => setQuoteOverlay(null)}
          />
        )}
      </AnimatePresence>

      {/* Milestone Overlay */}
      {celebratingMilestone &&
        (() => {
          const act = activities.find(
            (a) => a.id === celebratingMilestone.activityId,
          );
          const tier = getBadgeTier(
            celebratingMilestone.milestone.milestoneDay,
          );
          return (
            <MilestoneOverlay
              milestoneDay={celebratingMilestone.milestone.milestoneDay}
              activityName={act?.name ?? "Activity"}
              badgeTier={tier}
              userName={userProfile?.name ?? "Warrior"}
              onContinue={() => setCelebratingMilestone(null)}
              onShare={() => {
                // share handled inside MilestoneOverlay
              }}
            />
          );
        })()}
    </div>
  );
}
