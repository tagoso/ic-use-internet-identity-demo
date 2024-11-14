import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Int "mo:base/Int";

actor {

    type Name = Text;

    type Entry = {
        url : Text;
        time : Text;
    };

    // Initialize the bookmark as a HashMap
    var bookmark = Map.HashMap<Name, Entry>(0, Text.equal, Text.hash);

    // Insert a new entry into the bookmark with the current timestamp
    public func insert(url : Text) : async () {
        let timestamp = Time.now(); // Get current timestamp
        let formattedTime = Int.toText(timestamp); // Convert timestamp to Text
        let entryWithTime = { url = url; time = formattedTime }; // Create Entry with time
        bookmark.put(url, entryWithTime);
    };

    // Delete an entry by URL
    public func deleteEntry(url : Text) : async () {
        ignore bookmark.remove(url); // Remove entry and ignore the return value
    };

    // Retrieve all entries in the bookmark
    public query func getAllEntries() : async [(Name, Entry)] {
        return Iter.toArray(bookmark.entries());
    };

    // Pre-upgrade hook to serialize the bookmark entries
    system func preupgrade() {
        stableBookmarkEntries := Iter.toArray(bookmark.entries());
    };

    // Post-upgrade hook to deserialize the bookmark entries
    system func postupgrade() {
        bookmark := Map.fromIter(stableBookmarkEntries.vals(), 0, Text.equal, Text.hash);
    };

    // Stable variable to store serialized bookmark entries
    stable var stableBookmarkEntries : [(Name, Entry)] = [];
};
