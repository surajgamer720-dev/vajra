import Types "../types/common";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  public func recordBreak(
    breakLogs : List.List<Types.BreakLog>,
    genId : () -> Text,
    activityId : Text,
    reason : Text,
    wasManual : Bool,
    streakLength : Nat,
    date : Text,
  ) : Types.BreakLog {
    let entry : Types.BreakLog = {
      id = genId();
      activityId;
      reason;
      breakDate = date;
      wasManual;
      streakLengthAtBreak = streakLength;
      createdAt = Time.now();
    };
    breakLogs.add(entry);
    entry;
  };

  public func getBreakLogs(
    breakLogs : List.List<Types.BreakLog>,
    activityId : Text,
  ) : [Types.BreakLog] {
    breakLogs.filter(func(b) { b.activityId == activityId }).toArray();
  };

  public func getAllBreakLogs(breakLogs : List.List<Types.BreakLog>) : [Types.BreakLog] {
    breakLogs.toArray();
  };
};
