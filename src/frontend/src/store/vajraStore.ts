import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppActivity,
  AppBreakLog,
  AppMilestoneUnlock,
  AppStreakInfo,
  AppUserProfile,
} from "../types/index";
import { MILESTONE_DAYS, todayString } from "../types/index";

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

// ─── Date helpers ─────────────────────────────────────────────────────────────

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

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

        const yst = yesterday();
        const streakContinues =
          lastDate === yst ||
          lastDate === today ||
          prev?.freezeActiveDate === yst;

        const newStreak = streakContinues ? prevStreak + 1 : 1;
        const newLongest = Math.max(newStreak, prevLongest);

        // Check for milestone
        const isMilestone = MILESTONE_DAYS.includes(newStreak);
        let newMilestones = state.milestones;
        let milestoneDay: number | undefined;

        if (isMilestone) {
          const actMs = state.milestones[activityId] ?? [];
          const alreadyUnlocked = actMs.some(
            (m) => m.milestoneDay === newStreak,
          );
          if (!alreadyUnlocked) {
            milestoneDay = newStreak;
            const unlock: AppMilestoneUnlock = {
              activityId,
              milestoneDay: newStreak,
              unlockedAt: Date.now(),
            };
            newMilestones = {
              ...state.milestones,
              [activityId]: [...actMs, unlock],
            };
          }
        }

        // Award freeze token at specific milestones
        const FREEZE_TOKEN_MILESTONES = [7, 30, 100, 365];
        let newFreezeTokens = state.freezeTokens;
        if (FREEZE_TOKEN_MILESTONES.includes(newStreak)) {
          newFreezeTokens = {
            ...state.freezeTokens,
            [activityId]: (state.freezeTokens[activityId] ?? 0) + 1,
          };
        }

        const updatedStreak: AppStreakInfo = {
          activityId,
          currentStreak: newStreak,
          longestStreak: newLongest,
          totalDaysCompleted: prevTotal + 1,
          freezeTokensEarned: prev?.freezeTokensEarned ?? 0,
          freezeTokensUsed: prev?.freezeTokensUsed ?? 0,
          lastCompletedDate: today,
          freezeActiveDate: prev?.freezeActiveDate,
        };

        set({
          completions,
          streaks: { ...state.streaks, [activityId]: updatedStreak },
          milestones: newMilestones,
          freezeTokens: newFreezeTokens,
        });

        return {
          newStreak,
          isNewMilestone: !!milestoneDay,
          milestoneDay,
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
        const yst = yesterday();
        const updatedStreaks = { ...state.streaks };
        let changed = false;

        for (const activity of state.activities) {
          const streak = updatedStreaks[activity.id];
          if (!streak || streak.currentStreak === 0) continue;

          const last = streak.lastCompletedDate;
          if (!last) continue;

          // Streak is fine if last completion was today or yesterday
          if (last === today || last === yst) continue;

          // Check if freeze token was applied
          if (streak.freezeActiveDate === yst) continue;

          // Streak broken — reset it
          const autoBreakLog: AppBreakLog = {
            id: `auto-break-${Date.now()}-${activity.id}`,
            activityId: activity.id,
            breakDate: today,
            reason: "Missed day — streak reset automatically",
            wasManual: false,
            streakLengthAtBreak: streak.currentStreak,
            createdAt: Date.now(),
          };

          updatedStreaks[activity.id] = {
            ...streak,
            currentStreak: 0,
          };

          state.breakLogs.push(autoBreakLog);
          changed = true;
        }

        if (changed) {
          set({ streaks: updatedStreaks, breakLogs: [...state.breakLogs] });
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
            [activityId]: { ...streak, freezeActiveDate: today },
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
