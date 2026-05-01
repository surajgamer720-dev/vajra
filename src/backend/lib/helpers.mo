import Types "../types/common";
import Nat "mo:core/Nat";
import List "mo:core/List";

module {
  // DateGap: distance between prev and curr completion dates
  // #consecutive = exactly 1 day apart (e.g. Mon→Tue)
  // #gapOne      = exactly 2 days apart (missed 1 day, freeze can cover)
  // #gapMany     = 3+ days apart (no recovery)
  // #same        = same day
  // #future      = curr is before prev (invalid)
  public type DateGap = { #consecutive; #gapOne; #gapMany; #same; #future };

  public func dateGap(prev : Text, curr : Text) : DateGap {
    let prevParts = prev.split(#char '-').toArray();
    let currParts = curr.split(#char '-').toArray();
    if (prevParts.size() != 3 or currParts.size() != 3) { return #gapMany };

    let prevDays = dateToDays(prevParts[0], prevParts[1], prevParts[2]);
    let currDays = dateToDays(currParts[0], currParts[1], currParts[2]);

    if (currDays == prevDays) { #same }
    else if (currDays == prevDays + 1) { #consecutive }
    else if (currDays == prevDays + 2) { #gapOne }
    else if (currDays > prevDays + 2) { #gapMany }
    else { #future };
  };

  func natFromText(t : Text) : Nat {
    switch (Nat.fromText(t)) { case (?n) n; case null 0 };
  };

  func dateToDays(y : Text, m : Text, d : Text) : Nat {
    let year = natFromText(y);
    let month = natFromText(m);
    let day = natFromText(d);
    // Simple absolute day counter: year * 365 + leap corrections + month offset + day
    let leapYears = year / 4;
    let monthDays = monthToDays(month, isLeapYear(year));
    year * 365 + leapYears + monthDays + day;
  };

  func isLeapYear(y : Nat) : Bool {
    (y % 4 == 0 and y % 100 != 0) or (y % 400 == 0);
  };

  func monthToDays(m : Nat, leap : Bool) : Nat {
    switch (m) {
      case 1  { 0 };
      case 2  { 31 };
      case 3  { if (leap) 60 else 59 };
      case 4  { if (leap) 91 else 90 };
      case 5  { if (leap) 121 else 120 };
      case 6  { if (leap) 152 else 151 };
      case 7  { if (leap) 182 else 181 };
      case 8  { if (leap) 213 else 212 };
      case 9  { if (leap) 244 else 243 };
      case 10 { if (leap) 274 else 273 };
      case 11 { if (leap) 305 else 304 };
      case 12 { if (leap) 335 else 334 };
      case _  { 0 };
    };
  };

  public func streakToPublic(s : Types.Streak) : Types.StreakPublic {
    {
      activityId = s.activityId;
      currentStreak = s.currentStreak;
      longestStreak = s.longestStreak;
      lastCompletedDate = s.lastCompletedDate;
      totalDaysCompleted = s.totalDaysCompleted;
      freezeTokensEarned = s.freezeTokensEarned;
      freezeTokensUsed = s.freezeTokensUsed;
      freezeActiveDate = s.freezeActiveDate;
    };
  };

  public func checkMilestone(streak : Nat) : ?Nat {
    List.fromArray<Nat>(Types.MILESTONE_DAYS).find(func(d) { d == streak });
  };

  public func shouldEarnFreezeToken(newStreak : Nat, prevTokensEarned : Nat) : Bool {
    newStreak > 0 and
    newStreak % Types.FREEZE_EARN_INTERVAL == 0 and
    newStreak / Types.FREEZE_EARN_INTERVAL > prevTokensEarned;
  };

  public func getTokensAvailable(s : Types.Streak) : Nat {
    let earned = s.freezeTokensEarned;
    let used = s.freezeTokensUsed;
    if (earned > used) { Nat.min(earned - used, Types.MAX_FREEZE_TOKENS) } else { 0 };
  };
};
