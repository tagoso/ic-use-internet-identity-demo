import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Iter "mo:base/Iter";

actor {

    type Name = Text;
    type Phone = Text;

    type Entry = {
        desc : Text;
        phone : Phone;
    };

    // Initialize the phonebook as a HashMap
    var phonebook = Map.HashMap<Name, Entry>(0, Text.equal, Text.hash);

    // Insert a new entry into the phonebook
    public func insert(name : Name, entry : Entry) : async () {
        phonebook.put(name, entry);
    };

    // Lookup an entry by name
    public query func lookup(name : Name) : async ?Entry {
        phonebook.get(name);
    };

    // Retrieve all entries in the phonebook
    public query func getAllEntries() : async [(Name, Entry)] {
        return Iter.toArray(phonebook.entries());
    };

    // Pre-upgrade hook to serialize the phonebook entries
    system func preupgrade() {
        stablePhonebookEntries := Iter.toArray(phonebook.entries());
    };

    // Post-upgrade hook to deserialize the phonebook entries
    system func postupgrade() {
        phonebook := Map.fromIter(stablePhonebookEntries.vals(), 0, Text.equal, Text.hash);
    };

    // Stable variable to store serialized phonebook entries
    stable var stablePhonebookEntries : [(Name, Entry)] = [];
};
