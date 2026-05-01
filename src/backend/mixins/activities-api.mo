import Types "../types/common";
import ActivityLib "../lib/activities";
import List "mo:core/List";

mixin (
  activities : List.List<Types.Activity>,
  genId : () -> Text,
) {
  public func initializeDefaultActivities() : async () {
    ActivityLib.initDefaults(activities, genId);
  };

  public func addActivity(name : Text, emoji : Text, reminderTime : ?Text) : async Types.Activity {
    ActivityLib.addActivity(activities, genId, name, emoji, reminderTime);
  };

  public func removeActivity(id : Text) : async Bool {
    ActivityLib.removeActivity(activities, id);
  };

  public func getActivities() : async [Types.Activity] {
    ActivityLib.getActivities(activities);
  };

  public func updateActivityReminder(id : Text, reminderTime : ?Text) : async Bool {
    ActivityLib.updateReminder(activities, id, reminderTime);
  };
};
