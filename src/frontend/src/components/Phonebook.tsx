import { useState } from "react";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../declarations/backend/backend.did"; // Import the backend service type
import { useBackend } from "../ic/Actors"; // Custom hook to get the backend actor
import { useInternetIdentity } from "ic-use-internet-identity"; // Importing the useInternetIdentity hook

export function Phonebook() {
  const { actor: backend } = useBackend() as { actor: ActorSubclass<_SERVICE> };
  const { identity } = useInternetIdentity(); // Getting the identity from Internet Identity
  const [name, setName] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [lookupName, setLookupName] = useState<string>("");
  const [result, setResult] = useState<string>("");

  // Function to insert a new entry
  async function handleInsert() {
    if (!backend || !identity) return;
    const entry = { desc, phone };
    await backend.insert(name, entry);
    setResult(`Saved entry for ${name}`);
  }

  // Function to lookup an entry by name
  async function handleLookup() {
    if (!backend || !identity) return;
    const entry = await backend.lookup(lookupName);
    if (entry && entry[0]) {
      setResult(`Description: ${entry[0].desc}, Phone: ${entry[0].phone}`);
    } else {
      setResult(`No entry found for ${lookupName}`);
    }
  }

  if (!identity) {
    return <div>Please log in using your Internet Identity</div>; // Show a message if no identity is found
  }

  return (
    <div className="phonebook-container">
      <h2>Phonebook</h2>
      <div>
        <h3>Insert Entry</h3>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="text" placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button onClick={handleInsert}>Save Entry</button>
      </div>

      <div>
        <h3>Lookup Entry</h3>
        <input
          type="text"
          placeholder="Name to Lookup"
          value={lookupName}
          onChange={(e) => setLookupName(e.target.value)}
        />
        <button onClick={handleLookup}>Lookup</button>
      </div>

      <div>
        <h3>Result</h3>
        <p>{result}</p>
      </div>
    </div>
  );
}
