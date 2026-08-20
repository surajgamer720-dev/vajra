import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppActivity,
  AppBreakLog,
  AppMilestoneUnlock,
  AppStreakInfo,
  AppUserProfile,
} from "../types/index";
import {
  MILESTONE_DAYS,
  daysBetween,
  todayString,
  yesterdayString,
} from "../types/index";

// ─── Notification settings ────────────────────────────────────────────────────

export interface NotifSettings {
  morningQuoteEnabled: boolean;
  morningQuoteTime: string;
  streakWarningEnabled: boolean;
}

// ─── App settings ─────────────────────────────────────────────────────────────

export interface VajraSettings {
  soundEnabled: boolean;
  animationsEnabled: boolean;
  highContrast: boolean;
  textSize: "small" | "medium" | "large";
  notifications: NotifSettings;
}

// ─── Completion result ────────────────────────────────────────────────────────

export interface LocalCompleteResult {
  newStreak: number;
  isNewMilestone: boolean;
  milestoneDay?: number;
  alreadyDone: boolean;
}

// ─── Store state ──────────────────────────────────────────────────────────────

export interface VajraState {
  // ─── Persisted data ───────────────────────────────────────────────────────
  userProfile: AppUserProfile | null;
  settings: VajraSettings;
  savedQuoteIds: string[];

  // ─── Core data (fully local, source of truth) ─────────────────────────────
  activities: AppActivity[];
  streaks: Record<string, AppStreakInfo>;
  /** completions["YYYY-MM-DD"] = activityId[] */
  completions: Record<string, string[]>;
  milestones: Record<string, AppMilestoneUnlock[]>;
  breakLogs: AppBreakLog[];
  /** freeze tokens available per activityId */
  freezeTokens: Record<string, number>;

  // ─── UI state (not persisted) ─────────────────────────────────────────────
  notificationPermission: NotificationPermission;
  showAddActivityModal: boolean;
  lastCompletedActivityId: string | null;
  celebratingMilestone: AppMilestoneUnlock | null;
  pendingBreakActivityId: string | null;

  // ─── Actions ──────────────────────────────────────────────────────────────
  setUserProfile: (profile: AppUserProfile | null) => void;
  updateSettings: (patch: Partial<VajraSettings>) => void;
  updateNotifSettings: (patch: Partial<NotifSettings>) => void;
  toggleSavedQuote: (id: string) => void;
  setSavedQuoteIds: (ids: string[]) => void;
  setNotificationPermission: (perm: NotificationPermission) => void;

  // Activities
  addActivity: (activity: AppActivity) => void;
  removeActivity: (id: string) => void;
  updateActivityReminder: (id: string, time: string | null) => void;
  setActivities: (activities: AppActivity[]) => void;

  // Streaks / Completions (local logic)
  completeActivityLocally: (activityId: string) => LocalCompleteResult;
  breakStreakLocally: (activityId: string, reason: string) => void;
  runStreakIntegrityCheck: () => void;
  applyFreezeToken: (activityId: string) => boolean;
  unfreezeStreakLocally: (activityId: string) => boolean;
  /** Used when syncing from backend on first load */
  setStreaks: (streaks: Record<string, AppStreakInfo>) => void;
  setMilestones: (milestones: Record<string, AppMilestoneUnlock[]>) => void;
  setBreakLogs: (logs: AppBreakLog[]) => void;

  // UI
  setShowAddActivityModal: (show: boolean) => void;
  setLastCompletedActivityId: (id: string | null) => void;
  setCelebratingMilestone: (m: AppMilestoneUnlock | null) => void;
  setPendingBreakActivityId: (id: string | null) => void;
}

// ─── Default settings ─────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: VajraSettings = {
  soundEnabled: true,
  animationsEnabled: true,
  highContrast: false,
  textSize: "medium",
  notifications: {
    morningQuoteEnabled: false,
    morningQuoteTime: "07:00",
    streakWarningEnabled: true,
  },
};


// ─── Store ────────────────────────────────────────────────────────────────────

export const useVajraStore = create<VajraState>()(
  persist(
    (set, get) => ({
      // ── Persisted defaults ────────────────────────────────────────────────
      userProfile: null,
      settings: DEFAULT_SETTINGS,
      savedQuoteIds: [],
      activities: [],
      streaks: {},
      completions: {},
      milestones: {},
      breakLogs: [],
      freezeTokens: {},

      // ── UI defaults (not persisted — reset on mount) ───────────────────────
      notificationPermission: "default",
      showAddActivityModal: false,
      lastCompletedActivityId: null,
      celebratingMilestone: null,
      pendingBreakActivityId: null,

      // ── Settings ──────────────────────────────────────────────────────────
      setUserProfile: (profile) => set({ userProfile: profile }),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      updateNotifSettings: (patch) =>
        set((s) => ({
          settings: {
            ...s.settings,
            notifications: { ...s.settings.notifications, ...patch },
          },
        })),

      toggleSavedQuote: (id) => {
        const { savedQuoteIds } = get();
        set({
          savedQuoteIds: savedQuoteIds.includes(id)
            ? savedQuoteIds.filter((q) => q !== id)
            : [...savedQuoteIds, id],
        });
      },

      setSavedQuoteIds: (ids) => set({ savedQuoteIds: ids }),

      setNotificationPermission: (perm) =>
        set({ notificationPermission: perm }),

      // ── Activities ────────────────────────────────────────────────────────
      addActivity: (activity) =>
        set((s) => ({ activities: [...s.activities, activity] })),

      removeActivity: (id) =>
        set((s) => {
          const activities = s.activities.filter((a) => a.id !== id);
          const streaks = { ...s.streaks };
          const milestones = { ...s.milestones };
          const freezeTokens = { ...s.freezeTokens };
          delete streaks[id];
          delete milestones[id];
          delete freezeTokens[id];
          // Clean completions
          const completions: Record<string, string[]> = {};
          for (const [date, ids] of Object.entries(s.completions)) {
            completions[date] = ids.filter((a) => a !== id);
          }
          return { activities, streaks, milestones, completions, freezeTokens };
        }),

      updateActivityReminder: (id, time) =>
        set((s) => ({
          activities: s.activities.map((a) =>
            a.id === id ? { ...a, reminderTime: time ?? undefined } : a,
          ),
        })),

      setActivities: (activities) => set({ activities }),
      setStreaks: (streaks) => set({ streaks }),
      setMilestones: (milestones) => set({ milestones }),
      setBreakLogs: (logs) => set({ breakLogs: logs }),

      // ── Core local completion logic ────────────────────────────────────────
      completeActivityLocally: (activityId) => {
        const state = get();
        const today = todayString();
        const todayCompletions = state.completions[today] ?? [];

        // Already done today
        if (todayCompletions.includes(activityId)) {
          return {
            newStreak: state.streaks[activityId]?.currentStreak ?? 0,
            isNewMilestone: false,
            alreadyDone: true,
          };
        }

        // Update completions
        const completions = {
          ...state.completions,
          [today]: [...todayCompletions, activityId],
        };

        // Compute new streak
        const prev = state.streaks[activityId];
        const prevStreak = prev?.currentStreak ?? 0;
        const prevLongest = prev?.longestStreak ?? 0;
        const prevTotal = prev?.totalDaysCompleted ?? 0;
        const lastDate = prev?.lastCompletedDate;
        const hasActiveFreeze = Boolean(prev?.freezeActiveDate);

        let newStreak = 1;
        if (lastDate) {
          const diff = daysBetween(lastDate, today);
          if (diff === 0) {
            // Completed on the same day (safety fallback)
            newStreak = Math.max(1, prevStreak);
          } else if (diff === 1) {
            // Consecutive day (yesterday -> today): exactly +1 streak!
            newStreak = prevStreak + 1;
          } else if (hasActiveFreeze) {
            // Missed day(s) while frozen due to work/life: streak was protected, resume +1!
            newStreak = prevStreak + 1;
          } else {
            // Missed 1 or more days without freeze: streak resets to 1 on this completion
            newStreak = 1;
          }
        } else {
          // First completion
          newStreak = 1;
        }

        const newLongest = Math.max(newStreak, prevLongest);

        // Check for milestone unlocks: unlock all milestone days <= newStreak not yet unlocked
        const actMs = state.milestones[activityId] ?? [];
        const unlockedDaySet = new Set(actMs.map((m) => m.milestoneDay));
        const newlyUnlockedDays = MILESTONE_DAYS.filter(
          (day) => day <= newStreak && !unlockedDaySet.has(day),
        );

        let newMilestones = state.milestones;
        let highestNewMilestoneDay: number | undefined;

        if (newlyUnlockedDays.length > 0) {
          const newUnlocks: AppMilestoneUnlock[] = newlyUnlockedDays.map((mDay) => ({
            activityId,
            milestoneDay: mDay,
            unlockedAt: Date.now(),
          }));
          newMilestones = {
            ...state.milestones,
            [activityId]: [...actMs, ...newUnlocks],
          };
          highestNewMilestoneDay = Math.max(...newlyUnlockedDays);
        }

        // Award freeze token at specific milestones
        const FREEZE_TOKEN_MILESTONES = [7, 30, 100, 365];
        let newFreezeTokens = state.freezeTokens;
        const tokensToEarn = newlyUnlockedDays.filter((d) =>
          FREEZE_TOKEN_MILESTONES.includes(d),
        ).length;

        if (tokensToEarn > 0) {
          newFreezeTokens = {
            ...state.freezeTokens,
            [activityId]: (state.freezeTokens[activityId] ?? 0) + tokensToEarn,
          };
        }

        const updatedStreak: AppStreakInfo = {
          activityId,
          currentStreak: newStreak,
          longestStreak: newLongest,
          totalDaysCompleted: prevTotal + 1,
          freezeTokensEarned: (prev?.freezeTokensEarned ?? 0) + tokensToEarn,
          freezeTokensUsed: prev?.freezeTokensUsed ?? 0,
          lastCompletedDate: today,
          freezeActiveDate: undefined, // consume active freeze upon completion
        };

        set({
          completions,
          streaks: { ...state.streaks, [activityId]: updatedStreak },
          milestones: newMilestones,
          freezeTokens: newFreezeTokens,
        });

        return {
          newStreak,
          isNewMilestone: highestNewMilestoneDay != null,
          milestoneDay: highestNewMilestoneDay,
          alreadyDone: false,
        };
      },

      // ── Break streak ──────────────────────────────────────────────────────
      breakStreakLocally: (activityId, reason) => {
        const state = get();
        const today = todayString();
        const streak = state.streaks[activityId];
        const streakLength = streak?.currentStreak ?? 0;

        const log: AppBreakLog = {
          id: `break-${Date.now()}-${activityId}`,
          activityId,
          breakDate: today,
          reason,
          wasManual: true,
          streakLengthAtBreak: streakLength,
          createdAt: Date.now(),
        };

        const updatedStreak: AppStreakInfo = {
          ...(streak ?? {
            activityId,
            currentStreak: 0,
            longestStreak: 0,
            totalDaysCompleted: 0,
            freezeTokensEarned: 0,
            freezeTokensUsed: 0,
          }),
          currentStreak: 0,
          lastCompletedDate: undefined,
          freezeActiveDate: undefined,
        };

        set({
          breakLogs: [...state.breakLogs, log],
          streaks: { ...state.streaks, [activityId]: updatedStreak },
        });
      },

      // ── Streak integrity check (run on app start) ─────────────────────────
      runStreakIntegrityCheck: () => {
        const state = get();
        const today = todayString();
        const yest = yesterdayString();
        const updatedStreaks = { ...state.streaks };
        let updatedMilestones = { ...state.milestones };
        let updatedBreakLogs = [...state.breakLogs];
        let updatedFreezeTokens = { ...state.freezeTokens };
        let changed = false;

        const FREEZE_TOKEN_MILESTONES = [7, 30, 100, 365];

        for (const activity of state.activities) {
          const streak = updatedStreaks[activity.id];
          if (!streak) continue;

          // 1. Backfill / heal any milestone achieved by currentStreak, longestStreak, totalDays, or completions history
          const activityCompletionsCount = Object.values(state.completions).filter(
            (ids) => ids.includes(activity.id),
          ).length;

          const highestAchieved = Math.max(
            streak.currentStreak ?? 0,
            streak.longestStreak ?? 0,
            streak.totalDaysCompleted ?? 0,
            activityCompletionsCount,
          );

          const actMs = updatedMilestones[activity.id] ?? [];
          const unlockedSet = new Set(actMs.map((m) => m.milestoneDay));
          const missingMilestones = MILESTONE_DAYS.filter(
            (day) => day <= highestAchieved && !unlockedSet.has(day),
          );

          if (missingMilestones.length > 0) {
            const addedUnlocks: AppMilestoneUnlock[] = missingMilestones.map((mDay) => ({
              activityId: activity.id,
              milestoneDay: mDay,
              unlockedAt: Date.now(),
            }));
            updatedMilestones[activity.id] = [...actMs, ...addedUnlocks];
            changed = true;
          }

          // Backfill freeze tokens for achieved milestones if not yet earned
          const totalEarnedTokens = MILESTONE_DAYS.filter(
            (d) => FREEZE_TOKEN_MILESTONES.includes(d) && d <= highestAchieved,
          ).length;

          const currentTokensEarned = streak.freezeTokensEarned ?? 0;
          if (currentTokensEarned < totalEarnedTokens) {
            const missingTokens = totalEarnedTokens - currentTokensEarned;
            updatedStreaks[activity.id] = {
              ...streak,
              freezeTokensEarned: totalEarnedTokens,
              longestStreak: Math.max(streak.longestStreak ?? 0, highestAchieved),
            };
            updatedFreezeTokens[activity.id] =
              (updatedFreezeTokens[activity.id] ?? 0) + missingTokens;
            changed = true;
          }

          // 2. Check if active streak has lapsed due to missed days
          if (streak.currentStreak > 0 && streak.lastCompletedDate) {
            const last = streak.lastCompletedDate;

            // Alive if completed today or yesterday
            if (last === today || last === yest) {
              continue;
            }

            // If streak is frozen: DO NOT BREAK THE STREAK. It stays safely paused.
            if (streak.freezeActiveDate) {
              continue;
            }

            const diff = daysBetween(last, today);
            if (diff > 1) {
              // Missed days without freeze — record auto-break and reset currentStreak to 0
              const autoBreakLog: AppBreakLog = {
                id: `auto-break-${Date.now()}-${activity.id}`,
                activityId: activity.id,
                breakDate: today,
                reason: "Missed day — streak reset",
                wasManual: false,
                streakLengthAtBreak: streak.currentStreak,
                createdAt: Date.now(),
              };

              updatedBreakLogs.push(autoBreakLog);
              updatedStreaks[activity.id] = {
                ...streak,
                currentStreak: 0,
                freezeActiveDate: undefined,
              };
              changed = true;
            }
          }
        }

        if (changed) {
          set({
            streaks: updatedStreaks,
            milestones: updatedMilestones,
            breakLogs: updatedBreakLogs,
            freezeTokens: updatedFreezeTokens,
          });
        }
      },

      // ── Freeze token ──────────────────────────────────────────────────────
      applyFreezeToken: (activityId) => {
        const state = get();
        const available = state.freezeTokens[activityId] ?? 0;
        if (available <= 0) return false;

        const today = todayString();
        const streak = state.streaks[activityId];
        if (!streak) return false;

        set({
          freezeTokens: {
            ...state.freezeTokens,
            [activityId]: available - 1,
          },
          streaks: {
            ...state.streaks,
            [activityId]: {
              ...streak,
              freezeActiveDate: today,
              freezeTokensUsed: (streak.freezeTokensUsed ?? 0) + 1,
            },
          },
        });
        return true;
      },

      // ── Unfreeze streak manually ──────────────────────────────────────────
      unfreezeStreakLocally: (activityId) => {
        const state = get();
        const streak = state.streaks[activityId];
        if (!streak || !streak.freezeActiveDate) return false;

        set({
          freezeTokens: {
            ...state.freezeTokens,
            [activityId]: (state.freezeTokens[activityId] ?? 0) + 1,
          },
          streaks: {
            ...state.streaks,
            [activityId]: {
              ...streak,
              freezeActiveDate: undefined,
              freezeTokensUsed: Math.max(0, (streak.freezeTokensUsed ?? 1) - 1),
            },
          },
        });
        return true;
      },

      // ── UI ────────────────────────────────────────────────────────────────
      setShowAddActivityModal: (show) => set({ showAddActivityModal: show }),
      setLastCompletedActivityId: (id) => set({ lastCompletedActivityId: id }),
      setCelebratingMilestone: (m) => set({ celebratingMilestone: m }),
      setPendingBreakActivityId: (id) => set({ pendingBreakActivityId: id }),
    }),
    {
      name: "vajra-store",
      partialize: (state) => ({
        userProfile: state.userProfile,
        settings: state.settings,
        savedQuoteIds: state.savedQuoteIds,
        activities: state.activities,
        streaks: state.streaks,
        completions: state.completions,
        milestones: state.milestones,
        breakLogs: state.breakLogs,
        freezeTokens: state.freezeTokens,
      }),
    },
  ),
);
