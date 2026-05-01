import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "motion/react";
import type { Easing } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { getRandomQuote } from "../data/quotes";
import { playMilestoneSound } from "../services/sounds";
import type { BadgeTier } from "../types/index";
import { getBadgeEmoji, getMilestoneName } from "../types/index";
import { shareAchievement } from "../utils/shareImage";
import { BadgeSVG } from "./BadgeSVG";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MilestoneOverlayProps {
  milestoneDay: number;
  activityName: string;
  badgeTier: BadgeTier;
  userName?: string;
  onContinue: () => void;
  onShare: () => void;
}

// ─── Animation timing constants ───────────────────────────────────────────────

const BOUNCE = [0.68, -0.55, 0.265, 1.55] as [number, number, number, number];
const SMOOTH = [0.4, 0, 0.2, 1] as [number, number, number, number];

// ─── Light beam ──────────────────────────────────────────────────────────────

function LightBeam() {
  return (
    <motion.div
      className="pointer-events-none absolute bottom-1/2 left-1/2 -translate-x-1/2"
      style={{ width: 3, height: "55vh", transformOrigin: "bottom center" }}
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: [0, 0.7, 0], scaleY: [0, 1, 1] }}
      transition={{
        duration: 1.2,
        delay: 0.9,
        ease: SMOOTH,
      }}
    >
      <div
        className="h-full w-full rounded-full"
        style={{
          background:
            "linear-gradient(to top, oklch(0.88 0.21 84 / 0.9), oklch(0.88 0.21 84 / 0.3), transparent)",
          filter: "blur(2px)",
        }}
      />
      {/* Fan of rays */}
      {[-12, -6, 0, 6, 12].map((deg) => (
        <div
          key={deg}
          className="absolute bottom-0 left-1/2 h-full w-px origin-bottom"
          style={{
            transform: `translateX(-50%) rotate(${deg}deg)`,
            background:
              "linear-gradient(to top, oklch(0.88 0.21 84 / 0.4), transparent)",
            filter: "blur(1px)",
          }}
        />
      ))}
    </motion.div>
  );
}

// ─── Particle burst ───────────────────────────────────────────────────────────

function ParticleBurst({ tier }: { tier: BadgeTier }) {
  const colors: Record<BadgeTier, string[]> = {
    bronze: [
      "oklch(0.72 0.15 60)",
      "oklch(0.65 0.12 55)",
      "oklch(0.78 0.18 65)",
      "oklch(0.58 0.10 50)",
    ],
    silver: [
      "oklch(0.78 0.02 270)",
      "oklch(0.70 0.02 270)",
      "oklch(0.85 0.02 270)",
      "oklch(0.65 0.02 270)",
    ],
    gold: [
      "oklch(0.82 0.22 80)",
      "oklch(0.75 0.20 75)",
      "oklch(0.88 0.25 85)",
      "oklch(0.70 0.18 70)",
    ],
    diamond: [
      "oklch(0.88 0.15 215)",
      "oklch(0.80 0.12 210)",
      "oklch(0.94 0.18 220)",
      "oklch(0.75 0.10 205)",
    ],
  };
  const pts = colors[tier];
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    color: pts[i % pts.length],
    angle: (i / 24) * 360,
    distance: 80 + Math.random() * 80,
    size: 4 + Math.random() * 6,
    delay: Math.random() * 0.3,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.distance;
        const ty = Math.sin(rad) * p.distance;
        return (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{ width: p.size, height: p.size, background: p.color }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: tx, y: ty, opacity: 0, scale: 0.3 }}
            transition={{
              duration: 0.9,
              delay: 0.6 + p.delay,
              ease: SMOOTH,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Badge container with spin + glow ────────────────────────────────────────

function AnimatedBadge({ day, tier }: { day: number; tier: BadgeTier }) {
  const glowColors: Record<BadgeTier, string> = {
    bronze: "oklch(0.62 0.15 58 / 0.6)",
    silver: "oklch(0.78 0.03 270 / 0.6)",
    gold: "oklch(0.82 0.21 84 / 0.7)",
    diamond: "oklch(0.8 0.22 220 / 0.7)",
  };

  return (
    <motion.div
      className="relative flex items-center justify-center"
      initial={{ y: -200, opacity: 0, scale: 0.5 }}
      animate={{ y: 0, opacity: 1, scale: [0.5, 1.2, 1.0] }}
      transition={{
        y: { duration: 0.6, delay: 0.3, ease: BOUNCE },
        opacity: { duration: 0.3, delay: 0.3 },
        scale: { duration: 0.8, delay: 0.3, times: [0, 0.7, 1] },
      }}
      style={{
        filter: `drop-shadow(0 0 32px ${glowColors[tier]}) drop-shadow(0 0 64px ${glowColors[tier]})`,
      }}
    >
      {/* Spin wrapper */}
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
      >
        <BadgeSVG day={day} tier={tier} size={160} />
      </motion.div>

      <ParticleBurst tier={tier} />
    </motion.div>
  );
}

// ─── Share button state ───────────────────────────────────────────────────────

type ShareState = "idle" | "loading" | "done" | "error";

// ─── Main overlay ─────────────────────────────────────────────────────────────

export function MilestoneOverlay({
  milestoneDay,
  activityName,
  badgeTier,
  userName = "You",
  onContinue,
  onShare,
}: MilestoneOverlayProps) {
  const [shareState, setShareState] = useState<ShareState>("idle");
  const quote = useRef(getRandomQuote("self-mastery")).current;
  const milestoneName = getMilestoneName(milestoneDay);
  const emoji = getBadgeEmoji(badgeTier);

  // Play sound on mount
  useEffect(() => {
    playMilestoneSound();
  }, []);

  async function handleShare() {
    setShareState("loading");
    try {
      await shareAchievement(userName, activityName, milestoneDay, badgeTier);
      setShareState("done");
      onShare();
      setTimeout(() => setShareState("idle"), 3000);
    } catch {
      setShareState("error");
      setTimeout(() => setShareState("idle"), 3000);
    }
  }

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "oklch(0.06 0.03 309 / 0.96)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        data-ocid="milestone.dialog"
      >
        {/* Light beam behind badge */}
        <LightBeam />

        {/* Content panel */}
        <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
          {/* Badge */}
          <AnimatedBadge day={milestoneDay} tier={badgeTier} />

          {/* "Milestone Unlocked!" headline */}
          <motion.div
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "oklch(0.82 0.19 84 / 0.7)" }}
            >
              {emoji} {badgeTier} tier
            </p>
            <h1
              className="font-display text-4xl font-bold md:text-5xl"
              style={{
                color: "oklch(0.88 0.2 84)",
                textShadow: "0 0 24px oklch(0.82 0.19 84 / 0.5)",
              }}
            >
              Milestone Unlocked!
            </h1>
            <p
              className="text-xl font-semibold"
              style={{ color: "oklch(0.88 0.14 84)" }}
            >
              {milestoneName}
            </p>
          </motion.div>

          {/* Activity name + day */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.35 }}
          >
            <p className="text-lg text-foreground/80">
              <span className="font-semibold text-foreground">
                {activityName}
              </span>
              {" · "}
              <span
                className="font-bold"
                style={{ color: "oklch(0.82 0.19 84)" }}
              >
                Day {milestoneDay}
              </span>
            </p>
          </motion.div>

          {/* Motivational quote */}
          <motion.blockquote
            className="relative max-w-sm"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
          >
            <div
              className="absolute -left-3 -top-2 text-4xl leading-none opacity-30"
              style={{ color: "oklch(0.82 0.19 84)", fontFamily: "serif" }}
            >
              "
            </div>
            <p
              className="quote-text px-4 text-base md:text-lg"
              style={{ color: "oklch(0.92 0.04 279)" }}
            >
              {quote.text}
            </p>
            <footer
              className="mt-2 text-sm"
              style={{ color: "oklch(0.65 0.12 84)" }}
            >
              — {quote.author}
            </footer>
          </motion.blockquote>

          {/* Action buttons */}
          <motion.div
            className="flex flex-col items-center gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 2.0 }}
          >
            <Button
              type="button"
              onClick={handleShare}
              disabled={shareState === "loading"}
              className="min-w-[180px] font-semibold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.2 78), oklch(0.55 0.18 60))",
                color: "oklch(0.12 0.04 309)",
                boxShadow: "0 0 20px oklch(0.72 0.2 78 / 0.4)",
                border: "1px solid oklch(0.82 0.2 84 / 0.4)",
              }}
              data-ocid="milestone.share_button"
            >
              {shareState === "idle" && "Share Achievement"}
              {shareState === "loading" && "Preparing…"}
              {shareState === "done" && "Shared! ✓"}
              {shareState === "error" && "Try Again"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onContinue}
              className="min-w-[140px] border-foreground/20 bg-transparent font-semibold text-foreground/80 hover:bg-foreground/10"
              data-ocid="milestone.continue_button"
            >
              Continue
            </Button>
          </motion.div>
        </div>

        {/* Ambient corner glows */}
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full opacity-20 blur-3xl"
          style={{ background: "oklch(0.65 0.19 70)" }}
        />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-15 blur-3xl"
          style={{ background: "oklch(0.72 0.21 291)" }}
        />
      </motion.div>
    </AnimatePresence>
  );
}

export default MilestoneOverlay;
