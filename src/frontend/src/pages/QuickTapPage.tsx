import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { FlameIcon } from "../components/FlameIcon";
import { playCompletionSound } from "../services/sounds";
import { useVajraStore } from "../store/vajraStore";
import { getFlameLevel, todayString } from "../types/index";

// ─── Quick Tap Card ────────────────────────────────────────────────────────────

interface QuickTapCardProps {
  activityId: string;
  emoji: string;
  name: string;
  currentStreak: number;
  completedToday: boolean;
  index: number;
  onTap: (id: string) => void;
  justDone: boolean;
}

function QuickTapCard({
  activityId,
  emoji,
  name,
  currentStreak,
  completedToday,
  index,
  onTap,
  justDone,
}: QuickTapCardProps) {
  const flameLevel = getFlameLevel(currentStreak);
  const done = completedToday || justDone;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06 }}
      data-ocid={`quicktap.activity_card.${index + 1}`}
    >
      <button
        type="button"
        onClick={() => !done && onTap(activityId)}
        data-ocid={`quicktap.complete_button.${index + 1}`}
        aria-label={done ? `${name} done today` : `Complete ${name}`}
        className={[
          "w-full rounded-3xl p-6 text-left transition-smooth relative overflow-hidden",
          done
            ? "bg-card border-2 border-[oklch(0.55_0.18_145/0.5)] cursor-default"
            : "bg-card border-2 border-border active:scale-[0.98] hover:border-primary/50 cursor-pointer",
        ].join(" ")}
      >
        <div className="flex items-center gap-5">
          <motion.div
            animate={justDone ? { scale: [1, 1.5, 1.05, 1] } : { scale: 1 }}
            transition={{ duration: 0.6, ease: [0.68, -0.55, 0.265, 1.55] }}
          >
            <FlameIcon streakLevel={flameLevel} isActive={justDone} size={64} />
          </motion.div>

          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold text-foreground truncate">
              {emoji} {name}
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-primary">
                {currentStreak}
              </span>
              <span className="text-sm text-muted-foreground">day streak</span>
            </div>
          </div>

          <div className="flex-shrink-0">
            <AnimatePresence mode="wait">
              {done ? (
                <motion.div
                  key="done"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="w-14 h-14 rounded-full bg-[oklch(0.45_0.18_145/0.2)] border-2 border-[oklch(0.55_0.18_145/0.6)] flex items-center justify-center text-2xl"
                >
                  ✓
                </motion.div>
              ) : (
                <motion.div
                  key="tap"
                  className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/60 flex items-center justify-center text-2xl text-primary"
                >
                  ○
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* "Done! 🔥" flash feedback */}
        <AnimatePresence>
          {justDone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex items-center justify-center rounded-3xl bg-[oklch(0.14_0.06_309/0.7)] backdrop-blur-sm pointer-events-none"
            >
              <span className="text-4xl font-black text-primary">Done! 🔥</span>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}

// ─── QuickTap Page ─────────────────────────────────────────────────────────────

export default function QuickTapPage() {
  // Read directly from store — no loading state
  const activities = useVajraStore((s) => s.activities);
  const streaks = useVajraStore((s) => s.streaks);
  const completions = useVajraStore((s) => s.completions);
  const settings = useVajraStore((s) => s.settings);
  const completeActivityLocally = useVajraStore(
    (s) => s.completeActivityLocally,
  );

  const [justDoneIds, setJustDoneIds] = useState<Set<string>>(new Set());
  const today = todayString();
  const todayCompletions = completions[today] ?? [];

  const handleTap = useCallback(
    (activityId: string) => {
      setJustDoneIds((prev) => new Set([...prev, activityId]));
      playCompletionSound(settings.soundEnabled);
      completeActivityLocally(activityId);

      // Clear "just done" flash after 1.5s
      setTimeout(() => {
        setJustDoneIds((prev) => {
          const next = new Set(prev);
          next.delete(activityId);
          return next;
        });
      }, 1500);
    },
    [completeActivityLocally, settings.soundEnabled],
  );

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      data-ocid="quicktap.page"
    >
      {/* Minimal header */}
      <header className="px-4 pt-6 pb-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Quick Tap
          </p>
          <h1 className="text-2xl font-bold text-foreground">
            Mark Today Done
          </h1>
        </div>
        <div className="text-3xl select-none">🔥</div>
      </header>

      {/* Cards */}
      <main className="flex-1 px-4 py-3 space-y-3 pb-6">
        {activities.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-20 gap-4 text-center"
            data-ocid="quicktap.empty_state"
          >
            <p className="text-muted-foreground">No activities yet.</p>
            <Link
              to="/"
              className="text-primary text-sm underline underline-offset-4"
              data-ocid="quicktap.go_dashboard_link"
            >
              Add one from the dashboard
            </Link>
          </div>
        )}

        {activities.map((activity, i) => {
          const streak = streaks[activity.id];
          const currentStreak = streak?.currentStreak ?? 0;
          const completedToday = todayCompletions.includes(activity.id);
          return (
            <QuickTapCard
              key={activity.id}
              activityId={activity.id}
              emoji={activity.emoji}
              name={activity.name}
              currentStreak={currentStreak}
              completedToday={completedToday}
              index={i}
              onTap={handleTap}
              justDone={justDoneIds.has(activity.id)}
            />
          );
        })}
      </main>

      {/* Footer link */}
      <footer className="px-4 py-5 text-center border-t border-border bg-card">
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
          data-ocid="quicktap.open_full_app_link"
        >
          Open Full App →
        </Link>
      </footer>
    </div>
  );
}
