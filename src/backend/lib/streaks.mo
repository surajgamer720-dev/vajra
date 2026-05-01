import Types "../types/common";
import Helpers "../lib/helpers";
import List "mo:core/List";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Nat "mo:core/Nat";

module {
  public func completeActivity(
    streaks : Map.Map<Text, Types.Streak>,
    completions : List.List<Types.DailyCompletion>,
    milestones : Map.Map<Text, List.List<Types.MilestoneUnlock>>,
    genId : () -> Text,
    activityId : Text,
    date : Text,
  ) : Types.CompleteResult {
    // Idempotent: check if already completed today
    let alreadyDone = completions.find(func(c) {
      c.activityId == activityId and c.date == date
    });
    switch (alreadyDone) {
      case (?_) {
        let streak = getOrCreateStreak(streaks, activityId);
        return {
          streak = streak.currentStreak;
          isNewMilestone = false;
          milestoneDay = null;
          isFreezeEarned = false;
        };
      };
      case null {};
    };

    // Record completion
    completions.add({
      activityId;
      date;
      completedAt = Time.now();
    });

    let streak = getOrCreateStreak(streaks, activityId);

    // Calculate new streak value
    let newStreak = switch (streak.lastCompletedDate) {
      case null { 1 };
      case (?prevDate) {
        let gap = Helpers.dateGap(prevDate, date);
        switch (gap) {
          case (#same) { streak.currentStreak };
          case (#consecutive) { streak.currentStreak + 1 };
          case (#gapOne) {
            // Gap of exactly 1 missed day — check if freeze covers it
            switch (streak.freezeActiveDate) {
              case (?_) { streak.currentStreak + 1 };
              case null { 1 };
            };
          };
          case (#gapMany) { 1 };
          case (#future) { streak.currentStreak };
        };
      };
    };

    // Check freeze token earned
    let prevTokensEarned = streak.freezeTokensEarned;
    let isFreezeEarned = Helpers.shouldEarnFreezeToken(newStreak, prevTokensEarned);
    let newTokensEarned = if (isFreezeEarned) { prevTokensEarned + 1 } else { prevTokensEarned };

    // Update streak state
    streak.currentStreak := newStreak;
    streak.lastCompletedDate := ?date;
    streak.totalDaysCompleted += 1;
    streak.freezeTokensEarned := newTokensEarned;
    if (newStreak > streak.longestStreak) {
      streak.longestStreak := newStreak;
    };
    // Consume active freeze (it was used to bridge the gap)
    streak.freezeActiveDate := null;

    // Check milestone unlock
    let maybeMilestone = Helpers.checkMilestone(newStreak);
    let isNewMilestone = switch (maybeMilestone) {
      case null { false };
      case (?day) {
        let actMilestones = switch (milestones.get(activityId)) {
          case (?list) { list };
          case null {
            let newList = List.empty<Types.MilestoneUnlock>();
            milestones.add(activityId, newList);
            newList;
          };
        };
        let alreadyUnlocked = actMilestones.find(func(m) { m.milestoneDay == day });
        switch (alreadyUnlocked) {
          case (?_) { false };
          case null {
            actMilestones.add({ activityId; milestoneDay = day; unlockedAt = Time.now() });
            true;
          };
        };
      };
    };

    {
      streak = newStreak;
      isNewMilestone;
      milestoneDay = if (isNewMilestone) maybeMilestone else null;
      isFreezeEarned;
    };
  };

  public func getOrCreateStreak(
    streaks : Map.Map<Text, Types.Streak>,
    activityId : Text,
  ) : Types.Streak {
    switch (streaks.get(activityId)) {
      case (?s) { s };
      case null {
        let s : Types.Streak = {
          activityId;
          var currentStreak = 0;
          var longestStreak = 0;
          var lastCompletedDate = null;
          var totalDaysCompleted = 0;
          var freezeTokensEarned = 0;
          var freezeTokensUsed = 0;
          var freezeActiveDate = null;
        };
        streaks.add(activityId, s);
        s;
      };
    };
  };

  public func getStreakInfo(
    streaks : Map.Map<Text, Types.Streak>,
    activityId : Text,
  ) : ?Types.StreakPublic {
    switch (streaks.get(activityId)) {
      case null { null };
      case (?s) { ?Helpers.streakToPublic(s) };
    };
  };

  public func getAllStreaks(streaks : Map.Map<Text, Types.Streak>) : [(Text, Types.StreakPublic)] {
    streaks.toArray().map<(Text, Types.Streak), (Text, Types.StreakPublic)>(
      func((k, v)) { (k, Helpers.streakToPublic(v)) },
    );
  };

  public func getCompletionsForMonth(
    completions : List.List<Types.DailyCompletion>,
    activityId : Text,
    yearMonth : Text,
  ) : [Types.DailyCompletion] {
    completions.filter(func(c) {
      c.activityId == activityId and c.date.startsWith(#text yearMonth)
    }).toArray();
  };

  public func isCompletedToday(
    completions : List.List<Types.DailyCompletion>,
    activityId : Text,
    date : Text,
  ) : Bool {
    completions.find(func(c) { c.activityId == activityId and c.date == date }) != null;
  };

  public func applyFreezeToken(
    streaks : Map.Map<Text, Types.Streak>,
    activityId : Text,
    date : Text,
  ) : Types.FreezeResult {
    let streak = getOrCreateStreak(streaks, activityId);
    let available = Helpers.getTokensAvailable(streak);
    if (available == 0) {
      return { success = false; message = "No freeze tokens available" };
    };
    switch (streak.freezeActiveDate) {
      case (?_) {
        return { success = false; message = "A freeze token is already active" };
      };
      case null {};
    };
    streak.freezeActiveDate := ?date;
    streak.freezeTokensUsed += 1;
    { success = true; message = "Freeze token applied for " # date };
  };

  public func getFreezeStatus(
    streaks : Map.Map<Text, Types.Streak>,
    activityId : Text,
  ) : Types.FreezeStatus {
    let streak = getOrCreateStreak(streaks, activityId);
    let tokensAvailable = Helpers.getTokensAvailable(streak);
    {
      tokensAvailable;
      freezeActive = streak.freezeActiveDate != null;
      freezeDate = streak.freezeActiveDate;
    };
  };
};
