// ─── Domain Types (matching backend.d.ts) ────────────────────────────────────

export type {
  Activity,
  BreakLog,
  MilestoneUnlock,
  StreakPublic as StreakInfo,
  ActivityStats,
  UserProfilePublic as UserProfile,
  SavedQuote,
  DailyCompletion,
  CompleteResult,
  FreezeStatus,
  FreezeResult,
} from "../backend.d.ts";

// ─── Frontend-only types ─────────────────────────────────────────────────────

export interface AppActivity {
  id: string;
  isPredefined: boolean;
  name: string;
  createdAt: bigint;
  emoji: string;
  reminderTime?: string;
}

export interface AppStreakInfo {
  activityId: string;
  currentStreak: number;
  longestStreak: number;
  totalDaysCompleted: number;
  freezeTokensEarned: number;
  freezeTokensUsed: number;
  lastCompletedDate?: string;
  freezeActiveDate?: string;
}

export interface AppBreakLog {
  id: string;
  activityId: string;
  breakDate: string;
  reason: string;
  wasManual: boolean;
  streakLengthAtBreak: number;
  createdAt: number;
}

export interface AppMilestoneUnlock {
  activityId: string;
  milestoneDay: number;
  unlockedAt: number;
}

export interface AppActivityStats {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  manualBreaks: number;
  autoBreaks: number;
  freezesUsed: number;
}

export interface AppUserProfile {
  name: string;
  onboardingComplete: boolean;
  createdAt: number;
}

export interface AppSavedQuote {
  quoteId: string;
  savedAt: number;
}

export interface AppFreezeStatus {
  freezeActive: boolean;
  freezeDate?: string;
  tokensAvailable: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const MILESTONE_DAYS: number[] = [
  1, 3, 7, 14, 21, 30, 45, 60, 75, 100, 125, 150, 185, 250, 300, 365,
];

export type BadgeTier = "bronze" | "silver" | "gold" | "diamond";
export type FlameLevel = "small" | "medium" | "large" | "inferno";
export type QuoteTheme =
  | "discipline"
  | "patience"
  | "self-mastery"
  | "brahmacharya"
  | "stoic"
  | "spiritual";

export function getBadgeTier(day: number): BadgeTier {
  if (day <= 7) return "bronze";
  if (day <= 30) return "silver";
  if (day <= 100) return "gold";
  return "diamond";
}

export function getFlameLevel(streak: number): FlameLevel {
  if (streak < 7) return "small";
  if (streak < 21) return "medium";
  if (streak < 60) return "large";
  return "inferno";
}

export function getBadgeEmoji(tier: BadgeTier): string {
  const map: Record<BadgeTier, string> = {
    bronze: "🥉",
    silver: "🥈",
    gold: "🥇",
    diamond: "💎",
  };
  return map[tier];
}

export function getMilestoneName(day: number): string {
  const names: Record<number, string> = {
    1: "First Flame",
    3: "Kindling",
    7: "One Week Warrior",
    14: "Fortnight Fire",
    21: "Habit Forged",
    30: "Month of Mastery",
    45: "Persistence",
    60: "Diamond Mind",
    75: "Iron Will",
    100: "Centurion",
    125: "Relentless",
    150: "Half-Year Hero",
    185: "Ascendant",
    250: "Enlightened",
    300: "Almost Legend",
    365: "Vajra Complete",
  };
  return names[day] ?? `${day} Day Milestone`;
}

export function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function yearMonthString(date?: Date): string {
  const d = date ?? new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
