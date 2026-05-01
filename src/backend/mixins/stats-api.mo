import Types "../types/common";
import StatsLib "../lib/stats";
import List "mo:core/List";
import Map "mo:core/Map";

mixin (
  streaks : Map.Map<Text, Types.Streak>,
  breakLogs : List.List<Types.BreakLog>,
) {
  public func getActivityStats(activityId : Text) : async Types.ActivityStats {
    StatsLib.getActivityStats(streaks, breakLogs, activityId);
  };
};
