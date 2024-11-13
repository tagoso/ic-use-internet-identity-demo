import { useEffect, useState } from "react";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../declarations/backend/backend.did"; // Import the backend service type
import { useBackend } from "../ic/Actors"; // Custom hook to get the backend actor
import { useInternetIdentity } from "ic-use-internet-identity"; // Importing the useInternetIdentity hook

type Entry = {
  name: string;
  desc: string;
  phone: string;
};

export function Entry() {
  const { actor: backend } = useBackend() as { actor: ActorSubclass<_SERVICE> };
  const { identity } = useInternetIdentity(); // Getting the identity from Internet Identity
  const [name, setName] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [entries, setEntries] = useState<Entry[]>([]); // State to hold all entries

  // Fetch all entries when the component mounts
  useEffect(() => {
    async function fetchEntries() {
      if (backend && identity) {
        const allEntries = await backend.getAllEntries(); // Assuming getAllEntries returns an array of entries
        setEntries(
          allEntries.map((entry) => ({
            name: entry[0],
            desc: entry[1].desc,
            phone: entry[1].phone,
          }))
        );
      }
    }
    fetchEntries();
  }, [backend, identity]);

  // Function to insert a new entry
  async function handleInsert() {
    if (!backend || !identity) return;
    const entry = { desc, phone };
    await backend.insert(name, entry);
    setEntries([...entries, { name, desc, phone }]); // Update the list with the new entry
    setName("");
    setDesc("");
    setPhone("");
  }

  if (!identity) {
    return <div>Please log in using your Internet Identity</div>; // Show a message if no identity is found
  }

  return (
    <div className="entry-container">
      <h2>Entry</h2>
      <div>
        <h3>Insert Entry</h3>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="text" placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button onClick={handleInsert}>Save Entry</button>
      </div>

      <div>
        <h3>All Entries</h3>
        {entries.length > 0 ? (
          <ul>
            {entries.map((entry, index) => (
              <li key={index}>
                <strong>{entry.name}</strong>: {entry.desc}, {entry.phone}
              </li>
            ))}
          </ul>
        ) : (
          <p>No entries found.</p>
        )}
      </div>
    </div>
  );
}
