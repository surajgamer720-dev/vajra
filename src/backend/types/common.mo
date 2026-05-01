module {
  public type Timestamp = Int; // nanoseconds

  public type Activity = {
    id : Text;
    name : Text;
    emoji : Text;
    isPredefined : Bool;
    reminderTime : ?Text;
    createdAt : Timestamp;
  };

  public type Streak = {
    activityId : Text;
    var currentStreak : Nat;
    var longestStreak : Nat;
    var lastCompletedDate : ?Text;
    var totalDaysCompleted : Nat;
    var freezeTokensEarned : Nat;
    var freezeTokensUsed : Nat;
    var freezeActiveDate : ?Text;
  };

  public type DailyCompletion = {
    activityId : Text;
    date : Text;
    completedAt : Timestamp;
  };

  public type BreakLog = {
    id : Text;
    activityId : Text;
    reason : Text;
    breakDate : Text;
    wasManual : Bool;
    streakLengthAtBreak : Nat;
    createdAt : Timestamp;
  };

  public type MilestoneUnlock = {
    activityId : Text;
    milestoneDay : Nat;
    unlockedAt : Timestamp;
  };

  public type UserProfile = {
    var name : Text;
    var onboardingComplete : Bool;
    createdAt : Timestamp;
  };

  public type SavedQuote = {
    quoteId : Text;
    savedAt : Timestamp;
  };

  public type FavoriteQuote = {
    quoteId : Text;
    savedAt : Timestamp;
  };

  // Shared (API boundary) types — no var fields
  public type StreakPublic = {
    activityId : Text;
    currentStreak : Nat;
    longestStreak : Nat;
    lastCompletedDate : ?Text;
    totalDaysCompleted : Nat;
    freezeTokensEarned : Nat;
    freezeTokensUsed : Nat;
    freezeActiveDate : ?Text;
  };

  public type UserProfilePublic = {
    name : Text;
    onboardingComplete : Bool;
    createdAt : Timestamp;
  };

  public type CompleteResult = {
    streak : Nat;
    isNewMilestone : Bool;
    milestoneDay : ?Nat;
    isFreezeEarned : Bool;
  };

  public type FreezeResult = {
    success : Bool;
    message : Text;
  };

  public type FreezeStatus = {
    tokensAvailable : Nat;
    freezeActive : Bool;
    freezeDate : ?Text;
  };

  public type ActivityStats = {
    currentStreak : Nat;
    longestStreak : Nat;
    totalDays : Nat;
    manualBreaks : Nat;
    autoBreaks : Nat;
    freezesUsed : Nat;
  };

  public let MILESTONE_DAYS : [Nat] = [1, 3, 7, 14, 21, 30, 45, 60, 75, 100, 125, 150, 185, 250, 300, 365];
  public let MAX_FREEZE_TOKENS : Nat = 3;
  public let FREEZE_EARN_INTERVAL : Nat = 30;
};
