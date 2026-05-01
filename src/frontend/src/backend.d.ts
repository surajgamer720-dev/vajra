import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DailyCompletion {
    completedAt: Timestamp;
    date: string;
    activityId: string;
}
export interface CompleteResult {
    isFreezeEarned: boolean;
    streak: bigint;
    milestoneDay?: bigint;
    isNewMilestone: boolean;
}
export type Timestamp = bigint;
export interface ActivityStats {
    manualBreaks: bigint;
    totalDays: bigint;
    freezesUsed: bigint;
    autoBreaks: bigint;
    longestStreak: bigint;
    currentStreak: bigint;
}
export interface FreezeResult {
    message: string;
    success: boolean;
}
export interface SavedQuote {
    quoteId: string;
    savedAt: Timestamp;
}
export interface FreezeStatus {
    freezeActive: boolean;
    freezeDate?: string;
    tokensAvailable: bigint;
}
export interface BreakLog {
    id: string;
    breakDate: string;
    createdAt: Timestamp;
    wasManual: boolean;
    activityId: string;
    streakLengthAtBreak: bigint;
    reason: string;
}
export interface StreakPublic {
    freezeActiveDate?: string;
    lastCompletedDate?: string;
    freezeTokensEarned: bigint;
    activityId: string;
    freezeTokensUsed: bigint;
    totalDaysCompleted: bigint;
    longestStreak: bigint;
    currentStreak: bigint;
}
export interface Activity {
    id: string;
    isPredefined: boolean;
    name: string;
    createdAt: Timestamp;
    emoji: string;
    reminderTime?: string;
}
export interface UserProfilePublic {
    name: string;
    createdAt: Timestamp;
    onboardingComplete: boolean;
}
export interface MilestoneUnlock {
    unlockedAt: Timestamp;
    activityId: string;
    milestoneDay: bigint;
}
export interface backendInterface {
    addActivity(name: string, emoji: string, reminderTime: string | null): Promise<Activity>;
    applyFreezeToken(activityId: string, date: string): Promise<FreezeResult>;
    completeActivity(activityId: string, date: string): Promise<CompleteResult>;
    getActivities(): Promise<Array<Activity>>;
    getActivityStats(activityId: string): Promise<ActivityStats>;
    getAllBreakLogs(): Promise<Array<BreakLog>>;
    getAllMilestones(): Promise<Array<[string, Array<MilestoneUnlock>]>>;
    getAllStreaks(): Promise<Array<[string, StreakPublic]>>;
    getBreakLogs(activityId: string): Promise<Array<BreakLog>>;
    getCompletionsForMonth(activityId: string, yearMonth: string): Promise<Array<DailyCompletion>>;
    getFreezeStatus(activityId: string): Promise<FreezeStatus>;
    getSavedQuotes(): Promise<Array<SavedQuote>>;
    getStreakInfo(activityId: string): Promise<StreakPublic | null>;
    getUnlockedMilestones(activityId: string): Promise<Array<MilestoneUnlock>>;
    getUserProfile(): Promise<UserProfilePublic | null>;
    initializeDefaultActivities(): Promise<void>;
    isCompletedToday(activityId: string, date: string): Promise<boolean>;
    recordBreak(activityId: string, reason: string, wasManual: boolean, streakLength: bigint, date: string): Promise<BreakLog>;
    removeActivity(id: string): Promise<boolean>;
    saveQuote(quoteId: string): Promise<void>;
    setUserProfile(name: string): Promise<void>;
    unsaveQuote(quoteId: string): Promise<void>;
    updateActivityReminder(id: string, reminderTime: string | null): Promise<boolean>;
}
