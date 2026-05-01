import Types "types/common";
import ActivitiesMixin "mixins/activities-api";
import StreaksMixin "mixins/streaks-api";
import BreaksMixin "mixins/breaks-api";
import MilestonesMixin "mixins/milestones-api";
import StatsMixin "mixins/stats-api";
import UsersMixin "mixins/users-api";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";

actor {
  // --- ID generation ---
  var idCounter : Nat = 0;
  func genId() : Text {
    idCounter += 1;
    Time.now().toText() # "-" # idCounter.toText();
  };

  // --- State ---
  let activities = List.empty<Types.Activity>();
  let streaks = Map.empty<Text, Types.Streak>();
  let completions = List.empty<Types.DailyCompletion>();
  let breakLogs = List.empty<Types.BreakLog>();
  let milestones = Map.empty<Text, List.List<Types.MilestoneUnlock>>();
  let savedQuotes = List.empty<Types.SavedQuote>();
  let profile : { var value : ?Types.UserProfile } = { var value = null };

  // --- Mixins ---
  include ActivitiesMixin(activities, genId);
  include StreaksMixin(streaks, completions, milestones, genId);
  include BreaksMixin(breakLogs, genId);
  include MilestonesMixin(milestones);
  include StatsMixin(streaks, breakLogs);
  include UsersMixin(profile, savedQuotes);
};
