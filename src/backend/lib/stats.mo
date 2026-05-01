import Types "../types/common";
import List "mo:core/List";
import Map "mo:core/Map";

module {
  public func getActivityStats(
    streaks : Map.Map<Text, Types.Streak>,
    breakLogs : List.List<Types.BreakLog>,
    activityId : Text,
  ) : Types.ActivityStats {
    let streak = switch (streaks.get(activityId)) {
      case (?s) { s };
      case null {
        return {
          currentStreak = 0;
          longestStreak = 0;
          totalDays = 0;
          manualBreaks = 0;
          autoBreaks = 0;
          freezesUsed = 0;
        };
      };
    };

    let actBreaks = breakLogs.filter(func(b) { b.activityId == activityId });
    let manualBreaks = actBreaks.filter(func(b) { b.wasManual }).size();
    let autoBreaks = actBreaks.filter(func(b) { not b.wasManual }).size();

    {
      currentStreak = streak.currentStreak;
      longestStreak = streak.longestStreak;
      totalDays = streak.totalDaysCompleted;
      manualBreaks;
      autoBreaks;
      freezesUsed = streak.freezeTokensUsed;
    };
  };
};
