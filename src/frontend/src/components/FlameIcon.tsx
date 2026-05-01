import { useEffect, useRef } from "react";
import type { FlameLevel } from "../types/index";

interface FlameIconProps {
  streakLevel: FlameLevel;
  isActive?: boolean;
  size?: number;
}

// CSS animation class map for each tier
const glowClass: Record<FlameLevel, string> = {
  small: "",
  medium: "fire-glow",
  large: "fire-glow-large",
  inferno: "fire-glow-inferno",
};

export function FlameIcon({
  streakLevel,
  isActive = false,
  size = 48,
}: FlameIconProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;
    const el = containerRef.current;
    if (!el) return;
    el.classList.add("flame-burst");
    const t = setTimeout(() => el.classList.remove("flame-burst"), 600);
    return () => clearTimeout(t);
  }, [isActive]);

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center justify-center transition-smooth ${glowClass[streakLevel]}`}
      style={{ width: size, height: size }}
    >
      <FlameShape level={streakLevel} size={size} />
      {streakLevel === "large" && <EmberParticles />}
      {streakLevel === "inferno" && <InfernoAura size={size} />}
    </div>
  );
}

// ─── Flame SVG shapes ─────────────────────────────────────────────────────────

function FlameShape({ level, size }: { level: FlameLevel; size: number }) {
  const s = size;

  if (level === "small") {
    return (
      <svg
        width={s}
        height={s}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
        className="animate-[fire-flicker_2.5s_ease-in-out_infinite]"
      >
        <path
          d="M24 40 C14 40 8 32 10 22 C12 16 18 14 20 8 C22 14 16 18 18 24 C20 30 28 28 26 22 C30 26 32 32 30 36 C28 38 26 40 24 40Z"
          fill="oklch(0.78 0.22 50)"
        />
        <path
          d="M24 40 C17 40 13 34 15 27 C17 22 21 20 22 15 C23 20 19 23 21 28 C23 33 27 31 26 27 C28 30 28 36 26 38 C25.5 39 24.8 40 24 40Z"
          fill="oklch(0.88 0.21 70)"
        />
      </svg>
    );
  }

  if (level === "medium") {
    return (
      <svg
        width={s}
        height={s}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
        className="animate-[fire-flicker_1.8s_ease-in-out_infinite]"
      >
        {/* Outer amber flame */}
        <path
          d="M24 44 C12 44 5 33 8 20 C10 12 18 8 20 2 C22 8 16 14 18 21 C20 27 28 26 26 19 C30 24 34 30 32 37 C30 41 27 44 24 44Z"
          fill="oklch(0.62 0.20 40)"
        />
        {/* Core orange */}
        <path
          d="M24 44 C15 44 10 36 12 26 C14 19 20 16 21 10 C23 16 18 21 20 27 C22 33 28 31 27 25 C30 29 31 36 29 40 C27.5 42 25.8 44 24 44Z"
          fill="oklch(0.78 0.22 50)"
        />
        {/* Gold inner core */}
        <path
          d="M24 44 C18 44 15 38 17 31 C19 25 22 23 23 18 C24.5 23 21 27 23 31 C25 35 27 33 26 29 C28 32 28 38 26.5 41 C25.5 43 24.8 44 24 44Z"
          fill="oklch(0.88 0.21 70)"
        />
      </svg>
    );
  }

  if (level === "large") {
    return (
      <svg
        width={s}
        height={s}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
        className="animate-[fire-flicker_1.4s_ease-in-out_infinite]"
      >
        {/* Deep red base */}
        <path
          d="M24 46 C10 46 2 32 5 18 C7 8 17 4 19 0 C22 6 14 14 17 22 C19 28 28 27 25 17 C31 22 36 29 34 38 C32 43 28 46 24 46Z"
          fill="oklch(0.52 0.20 30)"
        />
        {/* Amber mid */}
        <path
          d="M24 46 C13 46 7 36 10 24 C13 15 19 12 21 6 C23 12 17 18 19 25 C21 31 29 30 27 22 C31 27 33 34 31 40 C29 43 26.5 46 24 46Z"
          fill="oklch(0.68 0.21 40)"
        />
        {/* Orange */}
        <path
          d="M24 46 C16 46 11 38 13 29 C15 22 21 19 22 13 C24 19 20 23 22 29 C24 35 29 33 28 27 C31 31 31 38 29 42 C27.5 44 26 46 24 46Z"
          fill="oklch(0.78 0.22 50)"
        />
        {/* Gold core */}
        <path
          d="M24 46 C19 46 16 40 18 33 C20 27 23 25 24 20 C25.5 25 22 29 24 33 C26 37 28 35 27 31 C29 34 29 40 27 43 C26 45 25 46 24 46Z"
          fill="oklch(0.88 0.21 70)"
        />
        {/* White-gold tip */}
        <path
          d="M24 46 C21 46 19.5 42 21 37 C22 33 23.5 32 24 28 C24.8 32 23 34 24 37 C25 40 25.5 38 25 35.5 C26.5 37.5 26.5 42 25 44.5 C24.5 45.5 24.2 46 24 46Z"
          fill="oklch(0.96 0.14 80)"
        />
      </svg>
    );
  }

  // inferno
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="animate-[fire-flicker_0.8s_ease-in-out_infinite]"
    >
      {/* Deep crimson base */}
      <path
        d="M24 47 C8 47 0 31 3 16 C5 5 16 1 18 -4 C21 4 12 13 15 22 C17 28 27 28 24 16 C31 20 38 28 35 39 C33 44 29 47 24 47Z"
        fill="oklch(0.48 0.22 25)"
      />
      {/* Red-orange */}
      <path
        d="M24 47 C11 47 4 34 7 21 C10 11 18 7 20 2 C23 8 16 15 18 23 C20 30 29 29 26 20 C32 24 35 32 33 40 C31 44 27.5 47 24 47Z"
        fill="oklch(0.60 0.23 30)"
      />
      {/* Amber */}
      <path
        d="M24 47 C14 47 8 37 11 26 C13 17 20 13 22 7 C24 13 18 19 20 26 C22 33 30 31 28 23 C32 27 33 35 31 41 C29 44 26.5 47 24 47Z"
        fill="oklch(0.72 0.22 45)"
      />
      {/* Gold flame */}
      <path
        d="M24 47 C17 47 13 39 15 31 C17 24 22 20 23 14 C25 20 21 25 23 31 C25 37 29 35 28 29 C31 33 31 40 29 43.5 C27.5 45.5 25.8 47 24 47Z"
        fill="oklch(0.82 0.21 65)"
      />
      {/* Bright gold tip */}
      <path
        d="M24 47 C20 47 18.5 42 20 36 C21.5 30 23 28 24 22 C25 28 22.5 31 24 35 C25.5 39 26.5 37 26 33 C28 36 27.5 42 26 45 C25.2 46.5 24.5 47 24 47Z"
        fill="oklch(0.92 0.18 78)"
      />
      {/* White-hot core */}
      <path
        d="M24 47 C22 47 21.5 43 22.5 39 C23.2 35 24 33 24.2 30 C24.7 33 23.5 35 24 38 C24.5 41 25 39.5 24.8 37.5 C26 39 25.5 43.5 24.5 45.5 C24.2 46.5 24 47 24 47Z"
        fill="oklch(0.98 0.06 90)"
      />
    </svg>
  );
}

// ─── Ember particles (large tier) ─────────────────────────────────────────────

function EmberParticles() {
  const embers = [
    { delay: "0s", x: -8, size: 3 },
    { delay: "0.3s", x: 10, size: 2 },
    { delay: "0.7s", x: -4, size: 2 },
    { delay: "1.1s", x: 6, size: 3 },
  ];
  return (
    <>
      {embers.map((e) => (
        <span
          key={`${e.delay}-${e.x}`}
          className="absolute rounded-full opacity-0 animate-[float-up_1.5s_ease-out_infinite]"
          style={{
            width: e.size,
            height: e.size,
            bottom: 8,
            left: `calc(50% + ${e.x}px)`,
            animationDelay: e.delay,
            background: "oklch(0.88 0.21 70)",
          }}
        />
      ))}
    </>
  );
}

// ─── Inferno radiant aura ──────────────────────────────────────────────────────

function InfernoAura({ size }: { size: number }) {
  return (
    <span
      className="absolute inset-0 rounded-full opacity-30 animate-[pulse-glow_1s_ease-in-out_infinite]"
      style={{
        background:
          "radial-gradient(circle, oklch(0.82 0.21 65 / 0.6) 0%, transparent 70%)",
        transform: `scale(${size > 48 ? 1.6 : 1.4})`,
      }}
    />
  );
}
