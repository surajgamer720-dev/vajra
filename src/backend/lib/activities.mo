import Types "../types/common";
import Helpers "../lib/helpers";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  // ID generation: module-level counter is not allowed — use a passed-in counter ref
  // IDs are generated via Helpers.genId which uses Time.now()

  public func initDefaults(
    activities : List.List<Types.Activity>,
    genId : () -> Text,
  ) {
    if (not activities.isEmpty()) { return };
    let now = Time.now();
    let defaults : [(Text, Text, Text)] = [
      ("Brahmachariya", "🕉️", "06:00"),
      ("Meditation", "🧘", "07:00"),
      ("Exercise", "💪", "08:00"),
    ];
    for ((name, emoji, reminder) in defaults.values()) {
      activities.add({
        id = genId();
        name;
        emoji;
        isPredefined = true;
        reminderTime = ?reminder;
        createdAt = now;
      });
    };
  };

  public func addActivity(
    activities : List.List<Types.Activity>,
    genId : () -> Text,
    name : Text,
    emoji : Text,
    reminderTime : ?Text,
  ) : Types.Activity {
    let activity : Types.Activity = {
      id = genId();
      name;
      emoji;
      isPredefined = false;
      reminderTime;
      createdAt = Time.now();
    };
    activities.add(activity);
    activity;
  };

  public func removeActivity(activities : List.List<Types.Activity>, id : Text) : Bool {
    let before = activities.size();
    let filtered = activities.filter(func(a) { a.id != id });
    activities.clear();
    activities.append(filtered);
    activities.size() < before;
  };

  public func getActivities(activities : List.List<Types.Activity>) : [Types.Activity] {
    activities.toArray();
  };

  public func updateReminder(
    activities : List.List<Types.Activity>,
    id : Text,
    reminderTime : ?Text,
  ) : Bool {
    var found = false;
    activities.mapInPlace(func(a) {
      if (a.id == id) {
        found := true;
        { a with reminderTime };
      } else { a };
    });
    found;
  };
};
