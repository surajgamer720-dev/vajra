# Design Brief — Vajra: Discipline Streak Tracker

## Tone & Purpose
Spiritually grounded habit tracker emphasizing honesty, self-accountability, and daily discipline. Warm indigo mysticism meets gold fire energy. No guilt, only reflection and growth.

## Color Palette

| Token               | Light             | Dark (Active)         |
| ------------------ | ----------------- | --------------------- |
| **Background**      | 0.99 0 0          | 0.108 0.05 309        |
| **Foreground**      | 0.15 0 0          | 0.92 0.04 279         |
| **Card**            | 1.0 0 0           | 0.16 0.06 309         |
| **Primary (Fire)**  | 0.35 0 0          | 0.65 0.19 70          |
| **Accent (Violet)** | 0.35 0 0          | 0.72 0.21 291         |
| **Destructive**     | 0.55 0.22 25      | 0.62 0.21 17          |
| **Success (Green)** | 0.82 0.19 119     | 0.82 0.19 119         |

## Typography
- **Display (Quotes)**: Instrument Serif Italic — elegant, wisdom-conveying serif for motivational quotes
- **Body (UI)**: General Sans — modern, clean, highly readable for all interface text
- **Mono**: Geist Mono — consistent code/number display in stats and logs

## Shape Language
- **Border Radius**: 0.5rem (8px) — medium soft corners for cards and buttons; 0 for flame effects
- **Spacing**: 1rem grid with 0.5rem micro-spacing for density control
- **Shadows**: Layered glows for fire effects; subtle depth for cards (inset + outer glow)

## Structural Zones

| Zone                 | Background              | Border              | Details                                          |
| -------------------- | ----------------------- | ------------------- | ------------------------------------------------ |
| **Page Background**  | `bg-background`         | None                | Deep indigo: 0.108 0.05 309                      |
| **Card / Activity**  | `bg-card`               | Fire glow (0.5px)   | Elevated surface with `fire-glow` shadow class   |
| **Dashboard Header** | `bg-card` elevated      | `border-b border-border` | Large stats (72px font), streak count, milestone |
| **Button (Tap)**     | `bg-primary`            | Fire border glow    | Scales with streak; triggers confetti + sound    |
| **Trophy Room Grid** | `bg-card` tiled         | Subtle border       | 3-col grid; locked badges dimmed, unlocked glow  |
| **Calendar Heatmap** | Gradient overlay        | None                | Deep indigo → gold intensity scale per day       |
| **Quote Overlay**    | `bg-popover` with blur  | None                | Serif italic text, centered, z-index high        |

## Animation Choreography

| Interaction         | Keyframes                | Duration | Easing                        |
| ------------------- | ------------------------ | -------- | ----------------------------- |
| **Daily Tap**       | `fire-flicker` loop      | 0.4s     | ease-in-out (infinite)        |
| **Milestone Unlock**| `badge-spin-unlock`      | 0.8s     | cubic-bezier(0.68, -0.55…)    |
| **Streak Break**    | `streak-fade`            | 0.6s     | ease-out                      |
| **Light Beam**      | `light-beam` (y-scale)   | 0.5s     | ease-out                      |
| **Quote Appear**    | Fade + scale             | 0.3s     | cubic-bezier(0.4, 0, 0.2, 1) |

## Component Patterns
- **Activity Cards**: Fire-glow border intensifies with streak (1px at 1 day, 3px at 100+); tap triggers animation
- **Flame Icon Variants**: 1–6 days (small flicker), 7–29 (medium), 30–99 (large with embers), 100+ (inferno + golden aura)
- **Badge System**: Radiant metal coin (inset + outer glow); bronze (0–7d), silver (8–29d), gold (30–99d), diamond (100+d)
- **Calendar Heatmap**: 5-color intensity scale; empty day = muted bg, complete day = saturated gold
- **Quote Card**: Serif display font, centered, with blur background, soft fade-in

## Motion Philosophy
- 60fps smooth via `cubic-bezier(0.4, 0, 0.2, 1)` default easing
- Fire animations loop continuously; milestone/break animations one-shot
- All motion is meaningful: communicates state change, never distracting
- Particle emitters on fire glow (subtle upward float)

## Custom Utility Classes
- `.fire-glow` — standard fire shadow
- `.fire-glow-intense` — high-streak fire shadow (3x intensity)
- `.quote-text` — font-display italic lg size
- `.badge-radiant` — inset + outer glow for badges
- `.transition-smooth` — smooth 0.3s transition

## Signature Detail
**Honesty-first design**: Manual streak break UI is equal in prominence to "tap to complete." Breaking a streak with a reason logged is celebrated as self-reflection, not failure. UI never uses guilt language; instead emphasizes growth and accountability.

## Constraints
- Dark mode **always active** (no light mode toggle)
- No animation loops longer than 0.8s (avoid fatigue)
- All colors use OKLCH with alpha via `/ <opacity>` syntax
- Fire effects use absolute shadow positioning; no filters (for performance)
