import { useActor } from '@caffeineai/core-infrastructure';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createActor } from '../backend';
import type {
  AppActivity, AppStreakInfo, AppBreakLog, AppMilestoneUnlock,
  AppActivityStats, AppUserProfile, AppSavedQuote, AppFreezeStatus,
} from '../types/index';
import type { Activity, StreakPublic, BreakLog, MilestoneUnlock, ActivityStats, UserProfilePublic, SavedQuote, FreezeStatus } from '../backend.d.ts';

// ─── Converters ───────────────────────────────────────────────────────────────

function toActivity(a: Activity): AppActivity {
  return {
    id: a.id,
    isPredefined: a.isPredefined,
    name: a.name,
    createdAt: a.createdAt,
    emoji: a.emoji,
    reminderTime: a.reminderTime,
  };
}

function toStreakInfo(s: StreakPublic): AppStreakInfo {
  return {
    activityId: s.activityId,
    currentStreak: Number(s.currentStreak),
    longestStreak: Number(s.longestStreak),
    totalDaysCompleted: Number(s.totalDaysCompleted),
    freezeTokensEarned: Number(s.freezeTokensEarned),
    freezeTokensUsed: Number(s.freezeTokensUsed),
    lastCompletedDate: s.lastCompletedDate,
    freezeActiveDate: s.freezeActiveDate,
  };
}

function toBreakLog(b: BreakLog): AppBreakLog {
  return {
    id: b.id,
    activityId: b.activityId,
    breakDate: b.breakDate,
    reason: b.reason,
    wasManual: b.wasManual,
    streakLengthAtBreak: Number(b.streakLengthAtBreak),
    createdAt: Number(b.createdAt),
  };
}

function toMilestone(m: MilestoneUnlock): AppMilestoneUnlock {
  return {
    activityId: m.activityId,
    milestoneDay: Number(m.milestoneDay),
    unlockedAt: Number(m.unlockedAt),
  };
}

function toStats(s: ActivityStats): AppActivityStats {
  return {
    currentStreak: Number(s.currentStreak),
    longestStreak: Number(s.longestStreak),
    totalDays: Number(s.totalDays),
    manualBreaks: Number(s.manualBreaks),
    autoBreaks: Number(s.autoBreaks),
    freezesUsed: Number(s.freezesUsed),
  };
}

function toProfile(p: UserProfilePublic): AppUserProfile {
  return {
    name: p.name,
    onboardingComplete: p.onboardingComplete,
    createdAt: Number(p.createdAt),
  };
}

function toSavedQuote(q: SavedQuote): AppSavedQuote {
  return { quoteId: q.quoteId, savedAt: Number(q.savedAt) };
}

function toFreezeStatus(f: FreezeStatus): AppFreezeStatus {
  return {
    freezeActive: f.freezeActive,
    freezeDate: f.freezeDate,
    tokensAvailable: Number(f.tokensAvailable),
  };
}

// ─── Typed actor hook ─────────────────────────────────────────────────────────
// Each hook uses useActor(createActor) to get a typed Backend instance.

export function useUserProfile() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AppUserProfile | null>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      if (!actor) return null;
      const p = await actor.getUserProfile();
      return p ? toProfile(p) : null;
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useActivities() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AppActivity[]>({
    queryKey: ['activities'],
    queryFn: async () => {
      if (!actor) return [];
      const acts = await actor.getActivities();
      return acts.map(toActivity);
    },
    enabled: !!actor && !isFetching,
    staleTime: 300_000, // 5 min — activities change rarely
  });
}

export function useAllStreaks() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Record<string, AppStreakInfo>>({
    queryKey: ['allStreaks'],
    queryFn: async () => {
      if (!actor) return {};
      const pairs = await actor.getAllStreaks();
      return Object.fromEntries(pairs.map(([id, s]) => [id, toStreakInfo(s)]));
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000, // 1 min — streaks update once per day
  });
}

export function useStreakInfo(activityId: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AppStreakInfo | null>({
    queryKey: ['streak', activityId],
    queryFn: async () => {
      if (!actor) return null;
      const s = await actor.getStreakInfo(activityId);
      return s ? toStreakInfo(s) : null;
    },
    enabled: !!actor && !isFetching && !!activityId,
  });
}

export function useAllBreakLogs() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AppBreakLog[]>({
    queryKey: ['allBreakLogs'],
    queryFn: async () => {
      if (!actor) return [];
      const logs = await actor.getAllBreakLogs();
      return logs.map(toBreakLog);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBreakLogs(activityId: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AppBreakLog[]>({
    queryKey: ['breakLogs', activityId],
    queryFn: async () => {
      if (!actor) return [];
      const logs = await actor.getBreakLogs(activityId);
      return logs.map(toBreakLog);
    },
    enabled: !!actor && !isFetching && !!activityId,
  });
}

export function useAllMilestones() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Record<string, AppMilestoneUnlock[]>>({
    queryKey: ['allMilestones'],
    queryFn: async () => {
      if (!actor) return {};
      const pairs = await actor.getAllMilestones();
      return Object.fromEntries(pairs.map(([id, ms]) => [id, ms.map(toMilestone)]));
    },
    enabled: !!actor && !isFetching,
    staleTime: 300_000, // 5 min — milestones are append-only, very stable
  });
}

export function useActivityStats(activityId: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AppActivityStats | null>({
    queryKey: ['activityStats', activityId],
    queryFn: async () => {
      if (!actor) return null;
      const s = await actor.getActivityStats(activityId);
      return toStats(s);
    },
    enabled: !!actor && !isFetching && !!activityId,
  });
}

export function useCompletionsForMonth(activityId: string, yearMonth: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ['completions', activityId, yearMonth],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCompletionsForMonth(activityId, yearMonth);
    },
    enabled: !!actor && !isFetching && !!activityId,
  });
}

export function useSavedQuotes() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AppSavedQuote[]>({
    queryKey: ['savedQuotes'],
    queryFn: async () => {
      if (!actor) return [];
      const qs = await actor.getSavedQuotes();
      return qs.map(toSavedQuote);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFreezeStatus(activityId: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AppFreezeStatus | null>({
    queryKey: ['freezeStatus', activityId],
    queryFn: async () => {
      if (!actor) return null;
      const f = await actor.getFreezeStatus(activityId);
      return toFreezeStatus(f);
    },
    enabled: !!actor && !isFetching && !!activityId,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useSetUserProfile() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('No actor');
      await actor.setUserProfile(name);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['userProfile'] }),
  });
}

export function useInitDefaultActivities() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('No actor');
      await actor.initializeDefaultActivities();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities'] }),
  });
}

export function useAddActivity() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, emoji, reminderTime }: { name: string; emoji: string; reminderTime?: string }) => {
      if (!actor) throw new Error('No actor');
      return actor.addActivity(name, emoji, reminderTime ?? null);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities'] }),
  });
}

export function useRemoveActivity() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('No actor');
      return actor.removeActivity(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activities'] });
      qc.invalidateQueries({ queryKey: ['allStreaks'] });
    },
  });
}

export function useCompleteActivity() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ activityId, date }: { activityId: string; date: string }) => {
      if (!actor) throw new Error('No actor');
      return actor.completeActivity(activityId, date);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['allStreaks'] });
      qc.invalidateQueries({ queryKey: ['allMilestones'] });
    },
  });
}

export function useRecordBreak() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ activityId, reason, wasManual, streakLength, date }: {
      activityId: string; reason: string; wasManual: boolean; streakLength: number; date: string;
    }) => {
      if (!actor) throw new Error('No actor');
      return actor.recordBreak(activityId, reason, wasManual, BigInt(streakLength), date);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['allBreakLogs'] });
      qc.invalidateQueries({ queryKey: ['allStreaks'] });
    },
  });
}

export function useApplyFreezeToken() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ activityId, date }: { activityId: string; date: string }) => {
      if (!actor) throw new Error('No actor');
      return actor.applyFreezeToken(activityId, date);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['allStreaks'] });
      qc.invalidateQueries({ queryKey: ['freezeStatus'] });
    },
  });
}

export function useSaveQuote() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (quoteId: string) => {
      if (!actor) throw new Error('No actor');
      await actor.saveQuote(quoteId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['savedQuotes'] }),
  });
}

export function useUnsaveQuote() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (quoteId: string) => {
      if (!actor) throw new Error('No actor');
      await actor.unsaveQuote(quoteId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['savedQuotes'] }),
  });
}

export function useUpdateActivityReminder() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reminderTime }: { id: string; reminderTime: string | null }) => {
      if (!actor) throw new Error('No actor');
      return actor.updateActivityReminder(id, reminderTime);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities'] }),
  });
}
