import Principal "mo:base/Principal";

actor {
    stable var storedText : Text = ""; // テキストを保持するための変数

    public shared (_msg) func whoami() : async Text {
        return Principal.toText(_msg.caller);
    };


    // テキストを取得するメソッド
    public query func get_text() : async Text {
        return storedText;
    };

    // テキストを設定するメソッド
    public func set_text(newText: Text) : async () {
        storedText := newText;
    };
};
