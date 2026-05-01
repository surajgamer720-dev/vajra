import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { useVajraStore } from "../store/vajraStore";
import type { AppActivity } from "../types/index";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivityOption {
  id: string;
  emoji: string;
  name: string;
  selected: boolean;
}

interface CustomActivity {
  name: string;
  emoji: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_ACTIVITIES: ActivityOption[] = [
  { id: "brahmacharya", emoji: "🔥", name: "Brahmachariya", selected: true },
  { id: "meditation", emoji: "🧘", name: "Meditation", selected: true },
  { id: "exercise", emoji: "💪", name: "Exercise", selected: true },
];

const EMOJI_OPTIONS = [
  "🚿",
  "🍎",
  "📚",
  "🏃",
  "🌅",
  "🤸",
  "💧",
  "✍️",
  "🎯",
  "🙏",
];

const PHILOSOPHY_CARDS = [
  {
    emoji: "🔥",
    title: "Your flame grows with every day kept",
    body: "Each unbroken day adds fuel to your inner fire. Watch it grow from a spark to an inferno — the longer the chain, the brighter the flame.",
  },
  {
    emoji: "🏆",
    title: "Milestones mark your transformation",
    body: "At 1, 7, 21, 30, 100 days and beyond — unlock sacred badges that honor your discipline. Each trophy is a testament to who you've become.",
  },
  {
    emoji: "🤝",
    title: "Honesty over perfection",
    body: "Life happens. You can manually break a streak and record your reason. Self-reflection is strength — not weakness. No guilt, only growth.",
  },
];

// ─── Ember Particle ──────────────────────────────────────────────────────────

function EmberParticle({ index }: { index: number }) {
  const left = 30 + ((index * 13) % 40);
  const delay = (index * 0.37) % 2.5;
  const duration = 2 + ((index * 0.41) % 1.5);
  const size = 3 + (index % 3) * 2;
  return (
    <motion.div
      role="presentation"
      aria-hidden="true"
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${left}%`,
        bottom: "30%",
        width: size,
        height: size,
        background:
          index % 2 === 0 ? "oklch(0.88 0.21 70)" : "oklch(0.75 0.19 40)",
      }}
      animate={{
        y: [-10, -80 - index * 10],
        x: [0, (index % 2 === 0 ? 1 : -1) * (10 + index * 5)],
        opacity: [0.9, 0],
        scale: [1, 0.3],
      }}
      transition={{
        duration,
        delay,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeOut",
      }}
    />
  );
}

// ─── Flame SVG ───────────────────────────────────────────────────────────────

function FlameAnimation({ size = 160 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.65 0.19 70 / 0.35) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.svg
        aria-label="Animated flame"
        role="img"
        viewBox="0 0 100 120"
        style={{ width: size * 0.7, height: size * 0.7 }}
        animate={{
          scaleY: [1, 1.06, 0.97, 1.04, 1],
          scaleX: [1, 0.96, 1.02, 0.98, 1],
        }}
        transition={{
          duration: 1.2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <defs>
          <radialGradient id="flameGrad" cx="50%" cy="80%" r="60%">
            <stop offset="0%" stopColor="oklch(0.95 0.18 90)" />
            <stop offset="40%" stopColor="oklch(0.82 0.21 70)" />
            <stop offset="75%" stopColor="oklch(0.65 0.19 40)" />
            <stop offset="100%" stopColor="oklch(0.45 0.15 25)" />
          </radialGradient>
          <radialGradient id="innerFlame" cx="50%" cy="85%" r="40%">
            <stop offset="0%" stopColor="oklch(0.98 0.1 95)" />
            <stop offset="60%" stopColor="oklch(0.88 0.21 80)" />
            <stop offset="100%" stopColor="oklch(0.72 0.2 60)" />
          </radialGradient>
        </defs>
        <path
          d="M50 5 C38 25, 15 35, 18 65 C20 85, 32 108, 50 115 C68 108, 80 85, 82 65 C85 35, 62 25, 50 5Z"
          fill="url(#flameGrad)"
        />
        <path
          d="M50 5 C42 18, 22 28, 25 52 C27 62, 35 78, 50 85"
          fill="none"
          stroke="oklch(0.72 0.19 50)"
          strokeWidth="2"
          opacity="0.4"
        />
        <path
          d="M50 40 C44 50, 34 60, 36 80 C38 95, 45 108, 50 115 C55 108, 62 95, 64 80 C66 60, 56 50, 50 40Z"
          fill="url(#innerFlame)"
        />
        <ellipse
          cx="50"
          cy="42"
          rx="7"
          ry="12"
          fill="oklch(0.98 0.06 90)"
          opacity="0.7"
        />
      </motion.svg>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <EmberParticle key={i} index={i} />
      ))}
    </div>
  );
}

// ─── Progress Dots ───────────────────────────────────────────────────────────

function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div
      className="flex gap-2 items-center justify-center"
      aria-label={`Step ${step + 1} of ${total}`}
    >
      {Array.from({ length: total }, (_, i) => i).map((i) => (
        <motion.div
          key={`dot-${i}`}
          className="rounded-full"
          animate={{
            width: i === step ? 24 : 8,
            background:
              i === step
                ? "oklch(0.82 0.19 84)"
                : i < step
                  ? "oklch(0.65 0.19 70 / 0.6)"
                  : "oklch(0.92 0.04 279 / 0.25)",
          }}
          style={{ height: 8 }}
          transition={{ duration: 0.3 }}
        />
      ))}
    </div>
  );
}

// ─── Step 1: Welcome ─────────────────────────────────────────────────────────

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      key="welcome"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col items-center justify-center min-h-screen px-8 text-center gap-8"
      data-ocid="onboarding.welcome.section"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 55%, oklch(0.25 0.12 309 / 0.7) 0%, transparent 70%)",
        }}
      />
      <FlameAnimation size={200} />
      <div className="flex flex-col items-center gap-3 relative z-10">
        <motion.h1
          className="font-display text-7xl italic"
          style={{ color: "oklch(0.82 0.19 84)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Vajra
        </motion.h1>
        <motion.p
          className="text-lg font-body tracking-widest uppercase"
          style={{
            color: "oklch(0.92 0.04 279 / 0.6)",
            letterSpacing: "0.2em",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          One day at a time. One unbroken chain.
        </motion.p>
      </div>
      <motion.button
        type="button"
        className="relative z-10 px-10 py-4 rounded-2xl font-body font-semibold text-lg tracking-wide transition-smooth"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.65 0.19 70), oklch(0.82 0.19 84))",
          color: "oklch(0.12 0.04 309)",
          boxShadow:
            "0 0 24px oklch(0.65 0.19 70 / 0.5), 0 4px 16px oklch(0 0 0 / 0.3)",
        }}
        whileHover={{
          scale: 1.04,
          boxShadow: "0 0 36px oklch(0.65 0.19 70 / 0.7)",
        }}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        onClick={onNext}
        data-ocid="onboarding.begin_button"
      >
        Begin Your Journey
      </motion.button>
    </motion.div>
  );
}

// ─── Step 2: Your Name ───────────────────────────────────────────────────────

function StepName({
  onNext,
  onBack,
  name,
  setName,
}: {
  onNext: () => void;
  onBack: () => void;
  name: string;
  setName: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const canContinue = name.trim().length >= 2;

  return (
    <motion.div
      key="name"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col items-center justify-center min-h-screen px-8 text-center gap-10"
      data-ocid="onboarding.name.section"
    >
      <div className="flex flex-col items-center gap-4">
        <motion.div
          className="text-5xl"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          🌟
        </motion.div>
        <h2
          className="font-display text-4xl italic leading-tight"
          style={{ color: "oklch(0.92 0.04 279)" }}
        >
          What shall we call you,
          <br />
          seeker?
        </h2>
      </div>

      <div className="w-full max-w-xs relative">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => e.key === "Enter" && canContinue && onNext()}
          placeholder="Your name"
          maxLength={40}
          className="w-full bg-transparent text-center text-2xl font-body pb-2 outline-none placeholder-opacity-30"
          style={{
            color: "oklch(0.92 0.04 279)",
            borderBottom: "2px solid",
            borderColor: focused
              ? "oklch(0.82 0.19 84)"
              : "oklch(0.92 0.04 279 / 0.25)",
            transition: "border-color 0.3s ease",
            caretColor: "oklch(0.82 0.19 84)",
          }}
          data-ocid="onboarding.name.input"
        />
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
          style={{ background: "oklch(0.82 0.19 84)" }}
          animate={{ scaleX: focused ? 1 : 0, opacity: focused ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <motion.button
          type="button"
          className="w-full py-4 rounded-2xl font-body font-semibold text-lg transition-smooth"
          style={{
            background: canContinue
              ? "linear-gradient(135deg, oklch(0.65 0.19 70), oklch(0.82 0.19 84))"
              : "oklch(0.92 0.04 279 / 0.12)",
            color: canContinue
              ? "oklch(0.12 0.04 309)"
              : "oklch(0.92 0.04 279 / 0.35)",
            boxShadow: canContinue
              ? "0 0 20px oklch(0.65 0.19 70 / 0.4)"
              : "none",
            cursor: canContinue ? "pointer" : "not-allowed",
          }}
          whileHover={canContinue ? { scale: 1.03 } : {}}
          whileTap={canContinue ? { scale: 0.97 } : {}}
          onClick={canContinue ? onNext : undefined}
          disabled={!canContinue}
          data-ocid="onboarding.name.continue_button"
        >
          Continue
        </motion.button>
        <button
          type="button"
          className="w-full py-3 font-body text-sm transition-smooth"
          style={{ color: "oklch(0.92 0.04 279 / 0.45)" }}
          onClick={onBack}
          data-ocid="onboarding.name.back_button"
        >
          ← Back
        </button>
      </div>
    </motion.div>
  );
}

// ─── Step 3: Activities ───────────────────────────────────────────────────────

function StepActivities({
  onNext,
  onBack,
  activities,
  setActivities,
  customActivity,
  setCustomActivity,
  onAddCustom,
  showCustomForm,
  setShowCustomForm,
}: {
  onNext: () => void;
  onBack: () => void;
  activities: ActivityOption[];
  setActivities: (a: ActivityOption[]) => void;
  customActivity: CustomActivity;
  setCustomActivity: (a: CustomActivity) => void;
  onAddCustom: () => void;
  showCustomForm: boolean;
  setShowCustomForm: (v: boolean) => void;
}) {
  const selectedCount = activities.filter((a) => a.selected).length;

  const toggleActivity = (id: string) => {
    const isSelected = activities.find((a) => a.id === id)?.selected;
    if (isSelected && selectedCount === 1) return;
    setActivities(
      activities.map((a) =>
        a.id === id ? { ...a, selected: !a.selected } : a,
      ),
    );
  };

  return (
    <motion.div
      key="activities"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col items-center min-h-screen px-6 pt-8 pb-10 gap-8"
      data-ocid="onboarding.activities.section"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="text-4xl">⚡</div>
        <h2
          className="font-display text-4xl italic"
          style={{ color: "oklch(0.92 0.04 279)" }}
        >
          Choose your disciplines
        </h2>
        <p
          className="font-body text-sm"
          style={{ color: "oklch(0.92 0.04 279 / 0.5)" }}
        >
          Select at least one to track daily
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        {activities.map((activity, i) => (
          <motion.button
            key={activity.id}
            type="button"
            className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl border transition-smooth text-left"
            style={{
              background: activity.selected
                ? "oklch(0.65 0.19 70 / 0.15)"
                : "oklch(0.92 0.04 279 / 0.04)",
              borderColor: activity.selected
                ? "oklch(0.82 0.19 84 / 0.6)"
                : "oklch(0.92 0.04 279 / 0.15)",
              boxShadow: activity.selected
                ? "0 0 16px oklch(0.65 0.19 70 / 0.2)"
                : "none",
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => toggleActivity(activity.id)}
            data-ocid={`onboarding.activity.item.${i + 1}`}
          >
            <span className="text-3xl">{activity.emoji}</span>
            <span
              className="font-body font-medium text-lg flex-1"
              style={{ color: "oklch(0.92 0.04 279)" }}
            >
              {activity.name}
            </span>
            <motion.div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{
                background: activity.selected
                  ? "oklch(0.82 0.19 84)"
                  : "oklch(0.92 0.04 279 / 0.1)",
                border: "2px solid",
                borderColor: activity.selected
                  ? "oklch(0.82 0.19 84)"
                  : "oklch(0.92 0.04 279 / 0.25)",
              }}
              animate={{ scale: activity.selected ? 1 : 0.85 }}
            >
              {activity.selected && (
                <svg
                  aria-hidden="true"
                  width="12"
                  height="10"
                  viewBox="0 0 12 10"
                  fill="none"
                >
                  <path
                    d="M1 5L4.5 8.5L11 1"
                    stroke="oklch(0.12 0.04 309)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </motion.div>
          </motion.button>
        ))}

        {/* Add Custom Activity */}
        <AnimatePresence>
          {!showCustomForm && (
            <motion.button
              type="button"
              className="flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-2xl border border-dashed font-body text-sm transition-smooth"
              style={{
                borderColor: "oklch(0.82 0.19 84 / 0.35)",
                color: "oklch(0.82 0.19 84 / 0.8)",
              }}
              whileHover={{
                scale: 1.02,
                borderColor: "oklch(0.82 0.19 84 / 0.7)",
              }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCustomForm(true)}
              data-ocid="onboarding.add_custom_activity_button"
            >
              <span className="text-lg">+</span> Add Custom Activity
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCustomForm && (
            <motion.div
              className="rounded-2xl border p-4 flex flex-col gap-4"
              style={{
                background: "oklch(0.92 0.04 279 / 0.05)",
                borderColor: "oklch(0.82 0.19 84 / 0.35)",
              }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              data-ocid="onboarding.custom_form"
            >
              <input
                type="text"
                value={customActivity.name}
                onChange={(e) =>
                  setCustomActivity({ ...customActivity, name: e.target.value })
                }
                placeholder="Activity name"
                maxLength={30}
                className="w-full bg-transparent pb-1 font-body text-base outline-none"
                style={{
                  color: "oklch(0.92 0.04 279)",
                  borderBottom: "1px solid oklch(0.92 0.04 279 / 0.25)",
                  caretColor: "oklch(0.82 0.19 84)",
                }}
                data-ocid="onboarding.custom_activity.name_input"
              />
              <div>
                <p
                  className="font-body text-xs mb-2"
                  style={{ color: "oklch(0.92 0.04 279 / 0.45)" }}
                >
                  Pick an emoji
                </p>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="text-2xl w-10 h-10 rounded-xl flex items-center justify-center transition-smooth"
                      style={{
                        background:
                          customActivity.emoji === emoji
                            ? "oklch(0.65 0.19 70 / 0.3)"
                            : "oklch(0.92 0.04 279 / 0.06)",
                        border: "1px solid",
                        borderColor:
                          customActivity.emoji === emoji
                            ? "oklch(0.82 0.19 84 / 0.6)"
                            : "transparent",
                      }}
                      onClick={() =>
                        setCustomActivity({ ...customActivity, emoji })
                      }
                      data-ocid={`onboarding.emoji_picker.${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 py-2.5 rounded-xl font-body text-sm transition-smooth"
                  style={{ color: "oklch(0.92 0.04 279 / 0.4)" }}
                  onClick={() => {
                    setShowCustomForm(false);
                    setCustomActivity({ name: "", emoji: "🎯" });
                  }}
                  data-ocid="onboarding.custom_form.cancel_button"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 py-2.5 rounded-xl font-body text-sm font-semibold transition-smooth"
                  style={{
                    background:
                      customActivity.name.trim().length > 0
                        ? "oklch(0.65 0.19 70 / 0.3)"
                        : "oklch(0.92 0.04 279 / 0.08)",
                    color:
                      customActivity.name.trim().length > 0
                        ? "oklch(0.82 0.19 84)"
                        : "oklch(0.92 0.04 279 / 0.3)",
                  }}
                  onClick={
                    customActivity.name.trim().length > 0
                      ? onAddCustom
                      : undefined
                  }
                  disabled={customActivity.name.trim().length === 0}
                  data-ocid="onboarding.custom_form.add_button"
                >
                  Add
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm mt-auto">
        <motion.button
          type="button"
          className="w-full py-4 rounded-2xl font-body font-semibold text-lg transition-smooth"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.65 0.19 70), oklch(0.82 0.19 84))",
            color: "oklch(0.12 0.04 309)",
            boxShadow: "0 0 20px oklch(0.65 0.19 70 / 0.4)",
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          data-ocid="onboarding.activities.continue_button"
        >
          Continue ({selectedCount} selected)
        </motion.button>
        <button
          type="button"
          className="w-full py-3 font-body text-sm transition-smooth"
          style={{ color: "oklch(0.92 0.04 279 / 0.45)" }}
          onClick={onBack}
          data-ocid="onboarding.activities.back_button"
        >
          ← Back
        </button>
      </div>
    </motion.div>
  );
}

// ─── Step 4: Philosophy ───────────────────────────────────────────────────────

function StepPhilosophy({
  onFinish,
  onBack,
  isLoading,
}: {
  onFinish: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  return (
    <motion.div
      key="philosophy"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col items-center min-h-screen px-6 pt-8 pb-10 gap-8"
      data-ocid="onboarding.philosophy.section"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <motion.div
          className="text-5xl"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          ⚡
        </motion.div>
        <h2
          className="font-display text-4xl italic"
          style={{ color: "oklch(0.92 0.04 279)" }}
        >
          The Vajra Way
        </h2>
        <p
          className="font-body text-sm"
          style={{ color: "oklch(0.92 0.04 279 / 0.5)" }}
        >
          Vajra — the thunderbolt — unshakable discipline
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        {PHILOSOPHY_CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            className="rounded-2xl border p-5 flex flex-col gap-3"
            style={{
              background:
                i === 0
                  ? "oklch(0.65 0.19 70 / 0.08)"
                  : i === 1
                    ? "oklch(0.72 0.21 291 / 0.07)"
                    : "oklch(0.92 0.04 279 / 0.04)",
              borderColor:
                i === 0
                  ? "oklch(0.82 0.19 84 / 0.3)"
                  : i === 1
                    ? "oklch(0.72 0.21 291 / 0.3)"
                    : "oklch(0.92 0.04 279 / 0.15)",
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.12, duration: 0.5 }}
            data-ocid={`onboarding.philosophy.card.${i + 1}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{card.emoji}</span>
              <p
                className="font-display italic text-base leading-snug"
                style={{ color: "oklch(0.92 0.04 279)" }}
              >
                "{card.title}"
              </p>
            </div>
            <p
              className="font-body text-sm leading-relaxed"
              style={{ color: "oklch(0.92 0.04 279 / 0.6)" }}
            >
              {card.body}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm mt-auto">
        <motion.button
          type="button"
          className="relative w-full py-4 rounded-2xl font-body font-semibold text-lg transition-smooth overflow-hidden"
          style={{
            background: isLoading
              ? "oklch(0.65 0.19 70 / 0.5)"
              : "linear-gradient(135deg, oklch(0.65 0.19 70), oklch(0.82 0.19 84))",
            color: "oklch(0.12 0.04 309)",
            boxShadow: "0 0 24px oklch(0.65 0.19 70 / 0.5)",
          }}
          whileHover={!isLoading ? { scale: 1.03 } : {}}
          whileTap={!isLoading ? { scale: 0.97 } : {}}
          onClick={!isLoading ? onFinish : undefined}
          disabled={isLoading}
          data-ocid="onboarding.start_tracking_button"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                className="inline-block w-4 h-4 rounded-full border-2 border-current border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 0.8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              />
              Setting up your journey…
            </span>
          ) : (
            "Start Tracking 🔥"
          )}
        </motion.button>
        <button
          type="button"
          className="w-full py-3 font-body text-sm transition-smooth"
          style={{ color: "oklch(0.92 0.04 279 / 0.45)" }}
          onClick={onBack}
          disabled={isLoading}
          data-ocid="onboarding.philosophy.back_button"
        >
          ← Back
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main OnboardingPage ──────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [activityOptions, setActivityOptions] =
    useState<ActivityOption[]>(DEFAULT_ACTIVITIES);
  const [customActivity, setCustomActivity] = useState<CustomActivity>({
    name: "",
    emoji: "🎯",
  });
  const [showCustomForm, setShowCustomForm] = useState(false);

  const navigate = useNavigate();
  const setUserProfile = useVajraStore((s) => s.setUserProfile);
  const addActivity = useVajraStore((s) => s.addActivity);

  const handleAddCustom = useCallback(() => {
    if (!customActivity.name.trim()) return;
    const id = `custom-${Date.now()}`;
    setActivityOptions((prev) => [
      ...prev,
      {
        id,
        emoji: customActivity.emoji,
        name: customActivity.name.trim(),
        selected: true,
      },
    ]);
    setCustomActivity({ name: "", emoji: "🎯" });
    setShowCustomForm(false);
  }, [customActivity]);

  const handleFinish = useCallback(() => {
    // 1. Create user profile locally — instant, no network needed
    setUserProfile({
      name: name.trim() || "Practitioner",
      onboardingComplete: true,
      createdAt: Date.now(),
    });

    // 2. Add selected activities to local store
    const now = BigInt(Date.now());
    const selectedActivities = activityOptions.filter((a) => a.selected);
    selectedActivities.forEach((opt, i) => {
      const activity: AppActivity = {
        id: opt.id.startsWith("custom-") ? opt.id : `predefined-${opt.id}`,
        isPredefined: DEFAULT_ACTIVITIES.some((d) => d.id === opt.id),
        name: opt.name,
        createdAt: now + BigInt(i),
        emoji: opt.emoji,
      };
      addActivity(activity);
    });

    // 3. Navigate to dashboard — data is immediately available
    navigate({ to: "/" });
  }, [name, activityOptions, setUserProfile, addActivity, navigate]);

  // Redirect if already onboarded
  useEffect(() => {
    const profile = useVajraStore.getState().userProfile;
    if (profile?.onboardingComplete) {
      navigate({ to: "/" });
    }
  }, [navigate]);

  const stepComponents = [
    <StepWelcome key="welcome" onNext={() => setStep(1)} />,
    <StepName
      key="name"
      onNext={() => setStep(2)}
      onBack={() => setStep(0)}
      name={name}
      setName={setName}
    />,
    <StepActivities
      key="activities"
      onNext={() => setStep(3)}
      onBack={() => setStep(1)}
      activities={activityOptions}
      setActivities={setActivityOptions}
      customActivity={customActivity}
      setCustomActivity={setCustomActivity}
      onAddCustom={handleAddCustom}
      showCustomForm={showCustomForm}
      setShowCustomForm={setShowCustomForm}
    />,
    <StepPhilosophy
      key="philosophy"
      onFinish={handleFinish}
      onBack={() => setStep(2)}
      isLoading={false}
    />,
  ];

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: "oklch(0.108 0.05 309)" }}
      data-ocid="onboarding.page"
    >
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, oklch(0.2 0.08 309 / 0.8) 0%, transparent 70%)",
        }}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex flex-col items-center pt-12 pb-4 gap-4 z-20">
        <motion.p
          className="font-display italic text-xl"
          style={{ color: "oklch(0.82 0.19 84 / 0.7)" }}
          animate={{ opacity: step === 0 ? 0 : 1 }}
          transition={{ duration: 0.4 }}
          aria-hidden={step === 0}
        >
          Vajra
        </motion.p>
        <ProgressDots step={step} total={4} />
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">{stepComponents[step]}</AnimatePresence>
    </div>
  );
}
