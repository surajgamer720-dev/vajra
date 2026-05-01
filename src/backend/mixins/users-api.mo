import Types "../types/common";
import UserLib "../lib/users";
import List "mo:core/List";

mixin (
  profile : { var value : ?Types.UserProfile },
  savedQuotes : List.List<Types.SavedQuote>,
) {
  public func setUserProfile(name : Text) : async () {
    UserLib.setUserProfile(profile, name);
  };

  public func getUserProfile() : async ?Types.UserProfilePublic {
    UserLib.getUserProfile(profile);
  };

  public func saveQuote(quoteId : Text) : async () {
    UserLib.saveQuote(savedQuotes, quoteId);
  };

  public func unsaveQuote(quoteId : Text) : async () {
    UserLib.unsaveQuote(savedQuotes, quoteId);
  };

  public func getSavedQuotes() : async [Types.SavedQuote] {
    UserLib.getSavedQuotes(savedQuotes);
  };
};
