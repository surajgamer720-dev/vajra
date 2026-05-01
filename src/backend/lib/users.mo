import Types "../types/common";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  public func setUserProfile(
    profile : { var value : ?Types.UserProfile },
    name : Text,
  ) {
    switch (profile.value) {
      case (?p) {
        p.name := name;
        p.onboardingComplete := true;
      };
      case null {
        profile.value := ?{
          var name = name;
          var onboardingComplete = true;
          createdAt = Time.now();
        };
      };
    };
  };

  public func getUserProfile(
    profile : { var value : ?Types.UserProfile },
  ) : ?Types.UserProfilePublic {
    switch (profile.value) {
      case null { null };
      case (?p) {
        ?{
          name = p.name;
          onboardingComplete = p.onboardingComplete;
          createdAt = p.createdAt;
        };
      };
    };
  };

  public func saveQuote(
    savedQuotes : List.List<Types.SavedQuote>,
    quoteId : Text,
  ) {
    let exists = savedQuotes.find(func(q) { q.quoteId == quoteId });
    switch (exists) {
      case (?_) {}; // already saved
      case null {
        savedQuotes.add({ quoteId; savedAt = Time.now() });
      };
    };
  };

  public func unsaveQuote(
    savedQuotes : List.List<Types.SavedQuote>,
    quoteId : Text,
  ) {
    let filtered = savedQuotes.filter(func(q) { q.quoteId != quoteId });
    savedQuotes.clear();
    savedQuotes.append(filtered);
  };

  public func getSavedQuotes(savedQuotes : List.List<Types.SavedQuote>) : [Types.SavedQuote] {
    savedQuotes.toArray();
  };
};
