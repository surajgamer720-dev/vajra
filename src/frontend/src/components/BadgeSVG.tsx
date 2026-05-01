import type { BadgeTier } from "../types/index";

interface BadgeSVGProps {
  day: number;
  tier: BadgeTier;
  isLocked?: boolean;
  size?: number;
}

// ─── Tier motif renderers ────────────────────────────────────────────────────

function BronzeLotus({ size }: { size: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.28;
  // Lotus petals — 6 ellipses rotated around center
  const petals = [0, 60, 120, 180, 240, 300];
  return (
    <g>
      {/* Outer ring */}
      <circle
        cx={cx}
        cy={cy}
        r={r * 1.35}
        fill="none"
        stroke="oklch(0.72 0.14 58 / 0.6)"
        strokeWidth={size * 0.015}
      />
      {/* Lotus petals */}
      {petals.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const px = cx + Math.cos(rad) * r * 0.45;
        const py = cy + Math.sin(rad) * r * 0.45;
        return (
          <ellipse
            key={angle}
            cx={px}
            cy={py}
            rx={r * 0.32}
            ry={r * 0.55}
            transform={`rotate(${angle + 90}, ${px}, ${py})`}
            fill="oklch(0.78 0.14 62 / 0.85)"
            stroke="oklch(0.6 0.12 52 / 0.5)"
            strokeWidth={size * 0.01}
          />
        );
      })}
      {/* Center */}
      <circle cx={cx} cy={cy} r={r * 0.22} fill="oklch(0.85 0.17 70)" />
    </g>
  );
}

function SilverMountain({ size }: { size: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const s = size * 0.28;
  // Three mountain peaks
  const peaks = [
    // Left peak
    `M ${cx - s * 1.1} ${cy + s * 0.7} L ${cx - s * 0.4} ${cy - s * 0.6} L ${cx + s * 0.15} ${cy + s * 0.7} Z`,
    // Right peak
    `M ${cx - s * 0.15} ${cy + s * 0.7} L ${cx + s * 0.5} ${cy - s * 0.4} L ${cx + s * 1.1} ${cy + s * 0.7} Z`,
    // Center (tallest)
    `M ${cx - s * 0.55} ${cy + s * 0.7} L ${cx} ${cy - s * 0.85} L ${cx + s * 0.55} ${cy + s * 0.7} Z`,
  ];
  return (
    <g>
      <path d={peaks[0]} fill="oklch(0.72 0.03 270 / 0.6)" stroke="none" />
      <path d={peaks[1]} fill="oklch(0.72 0.03 270 / 0.6)" stroke="none" />
      <path
        d={peaks[2]}
        fill="oklch(0.88 0.03 270 / 0.9)"
        stroke="oklch(0.6 0.04 270 / 0.4)"
        strokeWidth={size * 0.012}
      />
      {/* Snow cap */}
      <path
        d={`M ${cx - s * 0.18} ${cy - s * 0.4} L ${cx} ${cy - s * 0.85} L ${cx + s * 0.18} ${cy - s * 0.4} Z`}
        fill="oklch(0.97 0.01 270)"
      />
    </g>
  );
}

function GoldVajra({ size }: { size: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const s = size * 0.28;
  // Vajra (thunderbolt) — vertical rod with expanding ends
  return (
    <g>
      {/* Sparkles */}
      {[
        { dx: -s * 0.7, dy: -s * 0.5, pos: "tl" },
        { dx: s * 0.7, dy: -s * 0.5, pos: "tr" },
        { dx: -s * 0.65, dy: s * 0.5, pos: "bl" },
        { dx: s * 0.65, dy: s * 0.5, pos: "br" },
      ].map(({ dx, dy, pos }) => (
        <g key={pos} transform={`translate(${cx + dx}, ${cy + dy})`}>
          <line
            x1="0"
            y1={-s * 0.18}
            x2="0"
            y2={s * 0.18}
            stroke="oklch(0.88 0.2 84)"
            strokeWidth={size * 0.018}
            strokeLinecap="round"
          />
          <line
            x1={-s * 0.18}
            y1="0"
            x2={s * 0.18}
            y2="0"
            stroke="oklch(0.88 0.2 84)"
            strokeWidth={size * 0.018}
            strokeLinecap="round"
          />
        </g>
      ))}
      {/* Vajra rod */}
      <rect
        x={cx - s * 0.1}
        y={cy - s * 0.9}
        width={s * 0.2}
        height={s * 1.8}
        rx={s * 0.06}
        fill="oklch(0.75 0.2 78)"
      />
      {/* Top prongs */}
      {[-1, -0.5, 0, 0.5, 1].map((offset) => (
        <path
          key={`tp-${offset}`}
          d={`M ${cx} ${cy - s * 0.55} L ${cx + offset * s * 0.45} ${cy - s * 0.95}`}
          stroke="oklch(0.82 0.21 80)"
          strokeWidth={size * 0.022}
          strokeLinecap="round"
          fill="none"
        />
      ))}
      {/* Bottom prongs */}
      {[-1, -0.5, 0, 0.5, 1].map((offset) => (
        <path
          key={`bp-${offset}`}
          d={`M ${cx} ${cy + s * 0.55} L ${cx + offset * s * 0.45} ${cy + s * 0.95}`}
          stroke="oklch(0.82 0.21 80)"
          strokeWidth={size * 0.022}
          strokeLinecap="round"
          fill="none"
        />
      ))}
      {/* Center orb */}
      <circle cx={cx} cy={cy} r={s * 0.22} fill="oklch(0.88 0.2 84)" />
      <circle cx={cx} cy={cy} r={s * 0.14} fill="oklch(0.95 0.12 82)" />
    </g>
  );
}

function DiamondCrystal({ size }: { size: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const s = size * 0.3;
  // Multi-facet diamond crystal
  const top = `${cx},${cy - s}`;
  const bottom = `${cx},${cy + s}`;
  const left = `${cx - s * 0.75},${cy - s * 0.1}`;
  const right = `${cx + s * 0.75},${cy - s * 0.1}`;
  const botLeft = `${cx - s * 0.5},${cy + s * 0.4}`;
  const botRight = `${cx + s * 0.5},${cy + s * 0.4}`;
  const topLeft = `${cx - s * 0.55},${cy - s * 0.45}`;
  const topRight = `${cx + s * 0.55},${cy - s * 0.45}`;
  return (
    <g>
      {/* Prismatic facets */}
      <polygon
        points={`${top} ${topLeft} ${left}`}
        fill="oklch(0.82 0.22 220 / 0.9)"
      />
      <polygon
        points={`${top} ${topRight} ${right}`}
        fill="oklch(0.75 0.18 200 / 0.95)"
      />
      <polygon
        points={`${top} ${topLeft} ${topRight}`}
        fill="oklch(0.92 0.15 220 / 0.9)"
      />
      <polygon
        points={`${left} ${topLeft} ${topRight} ${right} ${botRight} ${botLeft}`}
        fill="oklch(0.72 0.24 220 / 0.85)"
      />
      <polygon
        points={`${left} ${botLeft} ${bottom}`}
        fill="oklch(0.62 0.2 210 / 0.9)"
      />
      <polygon
        points={`${right} ${botRight} ${bottom}`}
        fill="oklch(0.68 0.22 230 / 0.9)"
      />
      <polygon
        points={`${botLeft} ${bottom} ${botRight}`}
        fill="oklch(0.55 0.18 215 / 0.95)"
      />
      {/* Prismatic highlight */}
      <polygon
        points={`${top} ${topLeft} ${topRight}`}
        fill="oklch(0.97 0.06 220 / 0.7)"
      />
      {/* Outline */}
      <polygon
        points={`${top} ${topLeft} ${left} ${botLeft} ${bottom} ${botRight} ${right} ${topRight}`}
        fill="none"
        stroke="oklch(0.88 0.2 220 / 0.6)"
        strokeWidth={size * 0.012}
      />
    </g>
  );
}

// ─── Gradient definitions per tier ──────────────────────────────────────────

function TierDefs({
  tier,
  id,
  size,
}: { tier: BadgeTier; id: string; size: number }) {
  if (tier === "bronze") {
    return (
      <defs>
        <radialGradient id={`bg-${id}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="oklch(0.62 0.15 60)" />
          <stop offset="100%" stopColor="oklch(0.44 0.12 50)" />
        </radialGradient>
        <radialGradient id={`glow-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.72 0.18 65 / 0.5)" />
          <stop offset="100%" stopColor="oklch(0.58 0.13 55 / 0)" />
        </radialGradient>
        <filter id={`shadow-${id}`}>
          <feDropShadow
            dx="0"
            dy={size * 0.02}
            stdDeviation={size * 0.04}
            floodColor="oklch(0.35 0.1 50)"
            floodOpacity="0.6"
          />
        </filter>
      </defs>
    );
  }
  if (tier === "silver") {
    return (
      <defs>
        <radialGradient id={`bg-${id}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="oklch(0.88 0.02 270)" />
          <stop offset="60%" stopColor="oklch(0.72 0.04 270)" />
          <stop offset="100%" stopColor="oklch(0.58 0.05 270)" />
        </radialGradient>
        <radialGradient id={`glow-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.9 0.02 270 / 0.4)" />
          <stop offset="100%" stopColor="oklch(0.75 0.03 270 / 0)" />
        </radialGradient>
        <filter id={`shadow-${id}`}>
          <feDropShadow
            dx="0"
            dy={size * 0.02}
            stdDeviation={size * 0.04}
            floodColor="oklch(0.3 0.02 270)"
            floodOpacity="0.5"
          />
        </filter>
      </defs>
    );
  }
  if (tier === "gold") {
    return (
      <defs>
        <radialGradient id={`bg-${id}`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="oklch(0.88 0.2 84)" />
          <stop offset="50%" stopColor="oklch(0.72 0.2 72)" />
          <stop offset="100%" stopColor="oklch(0.52 0.17 60)" />
        </radialGradient>
        <radialGradient id={`glow-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.88 0.2 84 / 0.6)" />
          <stop offset="100%" stopColor="oklch(0.65 0.19 70 / 0)" />
        </radialGradient>
        <filter id={`shadow-${id}`}>
          <feDropShadow
            dx="0"
            dy={size * 0.02}
            stdDeviation={size * 0.05}
            floodColor="oklch(0.5 0.17 60)"
            floodOpacity="0.7"
          />
        </filter>
      </defs>
    );
  }
  // diamond
  return (
    <defs>
      <radialGradient id={`bg-${id}`} cx="30%" cy="25%" r="75%">
        <stop offset="0%" stopColor="oklch(0.88 0.18 220)" />
        <stop offset="50%" stopColor="oklch(0.68 0.24 220)" />
        <stop offset="100%" stopColor="oklch(0.45 0.18 210)" />
      </radialGradient>
      <radialGradient id={`glow-${id}`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="oklch(0.9 0.18 220 / 0.6)" />
        <stop offset="100%" stopColor="oklch(0.72 0.21 220 / 0)" />
      </radialGradient>
      <filter id={`shadow-${id}`}>
        <feDropShadow
          dx="0"
          dy={size * 0.02}
          stdDeviation={size * 0.05}
          floodColor="oklch(0.4 0.18 210)"
          floodOpacity="0.7"
        />
      </filter>
    </defs>
  );
}

// ─── Locked overlay ──────────────────────────────────────────────────────────

function LockedOverlay({ size, day }: { size: number; day: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const ls = size * 0.18;
  return (
    <g>
      {/* Dark desaturated overlay */}
      <circle
        cx={cx}
        cy={cy}
        r={size * 0.48}
        fill="oklch(0.12 0.02 309 / 0.72)"
      />
      {/* Day number faintly */}
      <text
        x={cx}
        y={cy - ls * 0.3}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size * 0.22}
        fontWeight="700"
        fontFamily="General Sans, sans-serif"
        fill="oklch(0.75 0.04 279 / 0.25)"
      >
        {day}
      </text>
      {/* Lock icon */}
      <g transform={`translate(${cx - ls * 0.5}, ${cy + ls * 0.1})`}>
        <rect
          x={0}
          y={ls * 0.45}
          width={ls}
          height={ls * 0.8}
          rx={ls * 0.12}
          fill="oklch(0.6 0.04 279 / 0.7)"
        />
        <path
          d={`M ${ls * 0.22} ${ls * 0.45} L ${ls * 0.22} ${ls * 0.2} A ${ls * 0.28} ${ls * 0.28} 0 0 1 ${ls * 0.78} ${ls * 0.2} L ${ls * 0.78} ${ls * 0.45}`}
          stroke="oklch(0.6 0.04 279 / 0.7)"
          strokeWidth={ls * 0.18}
          fill="none"
          strokeLinecap="round"
        />
        <circle
          cx={ls * 0.5}
          cy={ls * 0.9}
          r={ls * 0.14}
          fill="oklch(0.4 0.04 309)"
        />
      </g>
    </g>
  );
}

// ─── Badge SVG ───────────────────────────────────────────────────────────────

export function BadgeSVG({
  day,
  tier,
  isLocked = false,
  size = 120,
}: BadgeSVGProps) {
  const cx = size / 2;
  const cy = size / 2;
  const uid = `badge-${tier}-${day}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label={
        isLocked ? `Locked badge: ${day} days` : `${tier} badge: ${day} days`
      }
      role="img"
    >
      <TierDefs tier={tier} id={uid} size={size} />

      {/* Outer glow ring */}
      {!isLocked && (
        <circle cx={cx} cy={cy} r={size * 0.48} fill={`url(#glow-${uid})`} />
      )}

      {/* Badge circle */}
      <circle
        cx={cx}
        cy={cy}
        r={size * 0.44}
        fill={isLocked ? "oklch(0.18 0.04 309)" : `url(#bg-${uid})`}
        filter={isLocked ? undefined : `url(#shadow-${uid})`}
        stroke={isLocked ? "oklch(0.3 0.04 279 / 0.5)" : "oklch(1 0 0 / 0.15)"}
        strokeWidth={size * 0.018}
      />

      {/* Tier motif — hidden when locked */}
      {!isLocked && (
        <>
          {tier === "bronze" && <BronzeLotus size={size} />}
          {tier === "silver" && <SilverMountain size={size} />}
          {tier === "gold" && <GoldVajra size={size} />}
          {tier === "diamond" && <DiamondCrystal size={size} />}
        </>
      )}

      {/* Day number */}
      {!isLocked && (
        <>
          <text
            x={cx}
            y={cy + size * 0.32}
            textAnchor="middle"
            fontSize={size * 0.16}
            fontWeight="800"
            fontFamily="General Sans, sans-serif"
            fill={
              tier === "silver"
                ? "oklch(0.15 0.02 270)"
                : "oklch(0.12 0.04 309)"
            }
            opacity="0.85"
          >
            {day}
          </text>
          <text
            x={cx}
            y={cy + size * 0.43}
            textAnchor="middle"
            fontSize={size * 0.09}
            fontWeight="600"
            fontFamily="General Sans, sans-serif"
            fill={
              tier === "silver" ? "oklch(0.2 0.02 270)" : "oklch(0.18 0.04 309)"
            }
            opacity="0.7"
          >
            DAYS
          </text>
        </>
      )}

      {/* Locked overlay */}
      {isLocked && <LockedOverlay size={size} day={day} />}
    </svg>
  );
}

export default BadgeSVG;
