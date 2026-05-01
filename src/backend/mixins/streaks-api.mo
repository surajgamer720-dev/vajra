import Types "../types/common";
import StreakLib "../lib/streaks";
import List "mo:core/List";
import Map "mo:core/Map";

mixin (
  streaks : Map.Map<Text, Types.Streak>,
  completions : List.List<Types.DailyCompletion>,
  milestones : Map.Map<Text, List.List<Types.MilestoneUnlock>>,
  genId : () -> Text,
) {
  public func completeActivity(activityId : Text, date : Text) : async Types.CompleteResult {
    StreakLib.completeActivity(streaks, completions, milestones, genId, activityId, date);
  };

  public func getStreakInfo(activityId : Text) : async ?Types.StreakPublic {
    StreakLib.getStreakInfo(streaks, activityId);
  };

  public func getAllStreaks() : async [(Text, Types.StreakPublic)] {
    StreakLib.getAllStreaks(streaks);
  };

  public func getCompletionsForMonth(activityId : Text, yearMonth : Text) : async [Types.DailyCompletion] {
    StreakLib.getCompletionsForMonth(completions, activityId, yearMonth);
  };

  public func isCompletedToday(activityId : Text, date : Text) : async Bool {
    StreakLib.isCompletedToday(completions, activityId, date);
  };

  public func applyFreezeToken(activityId : Text, date : Text) : async Types.FreezeResult {
    StreakLib.applyFreezeToken(streaks, activityId, date);
  };

  public func getFreezeStatus(activityId : Text) : async Types.FreezeStatus {
    StreakLib.getFreezeStatus(streaks, activityId);
  };
};
