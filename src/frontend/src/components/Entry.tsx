import { useEffect, useState } from "react";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../declarations/backend/backend.did"; // Import the backend service type
import { useBackend } from "../ic/Actors"; // Custom hook to get the backend actor
import { useInternetIdentity } from "ic-use-internet-identity"; // Importing the useInternetIdentity hook

type Entry = {
  url: string;
};

export function Entry() {
  const { actor: backend } = useBackend() as { actor: ActorSubclass<_SERVICE> };
  const { identity } = useInternetIdentity(); // Getting the identity from Internet Identity
  const [url, setURL] = useState<string>(""); // Single input field for URL
  const [entries, setEntries] = useState<Entry[]>([]); // State to hold all entries
  const [isAscending, setIsAscending] = useState<boolean>(true); // State to track sort order

  // Fetch all entries when the component mounts
  useEffect(() => {
    async function fetchEntries() {
      if (backend && identity) {
        const allEntries = await backend.getAllEntries(); // Assuming getAllEntries returns an array of entries
        setEntries(
          allEntries.map((entry) => ({
            url: entry[0],
          }))
        );
      }
    }
    fetchEntries();
  }, [backend, identity]);

  // Function to insert a new entry
  async function handleInsert() {
    if (!backend || !identity) return;
    await backend.insert(url); // Only pass the URL
    setEntries([...entries, { url: url }]); // Update the list with the new entry
    setURL(""); // Clear the input
  }

  // Function to delete an entry
  async function handleDelete(url: string) {
    if (!backend || !identity) return;
    await backend.deleteEntry(url); // Call backend to delete the entry
    setEntries(entries.filter((entry) => entry.url !== url)); // Remove the deleted entry from the list
  }

  // Function to format display URL by removing "https://", "http://", "www.", and trailing slashes only for display
  const formatUrl = (url: string) => {
    return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  };

  // Function to sort entries alphabetically based on the formatted URL (without http, www, etc.)
  const handleSortAlphabetically = () => {
    const sortedEntries = [...entries].sort((a, b) => {
      const formattedA = formatUrl(a.url);
      const formattedB = formatUrl(b.url);
      return isAscending ? formattedA.localeCompare(formattedB) : formattedB.localeCompare(formattedA);
    });
    setEntries(sortedEntries);
    setIsAscending(!isAscending); // Toggle sort order for next click
  };

  if (!identity) {
    return <div>Please log in using your Internet Identity</div>; // Show a message if no identity is found
  }

  return (
    <div className="entry-container">
      <input type="text" placeholder="URL" value={url} onChange={(e) => setURL(e.target.value)} />
      <button onClick={handleInsert}>Save</button>

      <div>
        <button onClick={handleSortAlphabetically} style={{ margin: "1rem" }}>
          {isAscending ? "ABC" : "ZYX"} {/* Display ABC or ZYX based on sort order */}
        </button>
        {entries.length > 0 ? (
          <ul>
            {entries.map((entry, index) => (
              <li key={index} style={{ display: "flex", alignItems: "center" }}>
                <button onClick={() => handleDelete(entry.url)} style={{ marginRight: "0.5rem" }}>
                  🗑
                </button>
                <a href={entry.url} target="_blank" rel="noopener noreferrer">
                  {formatUrl(entry.url)}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No bookmarks found.</p>
        )}
      </div>
    </div>
  );
}
