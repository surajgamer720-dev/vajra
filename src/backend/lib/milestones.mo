import Types "../types/common";
import List "mo:core/List";
import Map "mo:core/Map";
import Array "mo:core/Array";

module {
  public func getUnlockedMilestones(
    milestones : Map.Map<Text, List.List<Types.MilestoneUnlock>>,
    activityId : Text,
  ) : [Types.MilestoneUnlock] {
    switch (milestones.get(activityId)) {
      case null { [] };
      case (?list) { list.toArray() };
    };
  };

  public func getAllMilestones(
    milestones : Map.Map<Text, List.List<Types.MilestoneUnlock>>,
  ) : [(Text, [Types.MilestoneUnlock])] {
    milestones.toArray().map<(Text, List.List<Types.MilestoneUnlock>), (Text, [Types.MilestoneUnlock])>(
      func((k, v)) { (k, v.toArray()) },
    );
  };
};
