import Types "../types/common";
import BreakLib "../lib/breaks";
import List "mo:core/List";

mixin (
  breakLogs : List.List<Types.BreakLog>,
  genId : () -> Text,
) {
  public func recordBreak(
    activityId : Text,
    reason : Text,
    wasManual : Bool,
    streakLength : Nat,
    date : Text,
  ) : async Types.BreakLog {
    BreakLib.recordBreak(breakLogs, genId, activityId, reason, wasManual, streakLength, date);
  };

  public func getBreakLogs(activityId : Text) : async [Types.BreakLog] {
    BreakLib.getBreakLogs(breakLogs, activityId);
  };

  public func getAllBreakLogs() : async [Types.BreakLog] {
    BreakLib.getAllBreakLogs(breakLogs);
  };
};
