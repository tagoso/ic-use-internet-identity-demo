import { useEffect, useState } from "react";
import Spinner from "./Spinner";
import { useBackend } from "../ic/Actors";
import { _SERVICE } from "../../../declarations/backend/backend.did"; // Import Type
import { ActorSubclass } from "@dfinity/agent"; // Import ActorSubclass
import { useInternetIdentity } from "ic-use-internet-identity";

export function TextSaver() {
  const { actor: backend } = useBackend() as { actor: ActorSubclass<_SERVICE> }; // Add Type Assertion
  const { identity } = useInternetIdentity();
  const [loading, setLoading] = useState<boolean>(true);
  const [text, setText] = useState<string>("");
  const [savedText, setSavedText] = useState<string>("");

  // Fetch saved text from backend on mount
  useEffect(() => {
    if (!backend) return;
    backend.get_text().then((saved: string) => {
      setSavedText(saved || ""); // Set the retrieved text or empty if none
      setLoading(false);
    });
  }, [backend]);

  // Save input text to backend
  function handleSave() {
    if (!backend) return;
    setLoading(true);
    backend.set_text(text).then(() => {
      setSavedText(text);
      setLoading(false);
    });
  }

  let buttonClassName = "h-8 px-5 font-bold text-white bg-blue-500 rounded disabled:bg-blue-500/20";
  if (loading) {
    buttonClassName += " cursor-wait";
  } else {
    buttonClassName += " cursor-pointer hover:bg-blue-700";
  }

  if (!identity) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col items-center">
        <label className="mb-2">Enter URL:</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="h-8 px-3 rounded bg-zinc-600 text-white"
          placeholder="Type a URL here..."
        />
      </div>
      <button onClick={handleSave} className={buttonClassName} disabled={loading}>
        {loading ? <Spinner className="w-4 h-8" /> : "Save"}
      </button>
      <div className="mt-5 text-center">
        <p>Saved Text:</p>
        {loading ? (
          <Spinner className="w-4 h-8" />
        ) : (
          savedText && (
            <a href={savedText} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
              {savedText}
            </a>
          )
        )}
      </div>
    </div>
  );
}
