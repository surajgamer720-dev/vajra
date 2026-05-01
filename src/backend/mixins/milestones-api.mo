import Types "../types/common";
import MilestoneLib "../lib/milestones";
import List "mo:core/List";
import Map "mo:core/Map";

mixin (milestones : Map.Map<Text, List.List<Types.MilestoneUnlock>>) {
  public func getUnlockedMilestones(activityId : Text) : async [Types.MilestoneUnlock] {
    MilestoneLib.getUnlockedMilestones(milestones, activityId);
  };

  public func getAllMilestones() : async [(Text, [Types.MilestoneUnlock])] {
    MilestoneLib.getAllMilestones(milestones);
  };
};
