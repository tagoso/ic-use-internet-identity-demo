import Principal "mo:base/Principal";

actor {
    stable var counter : Nat32 = 0;

    public shared (_msg) func whoami() : async Text {
        return Principal.toText(_msg.caller);
    };

    public query func get_counter() : async Nat32 {
        return counter;
    };

    public func inc_counter() : async Nat32 {
        counter += 1;
        return counter;
    };
};
