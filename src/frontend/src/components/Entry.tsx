import { useEffect, useState } from "react";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../declarations/backend/backend.did"; // Import the backend service type
import { useBackend } from "../ic/Actors"; // Custom hook to get the backend actor
import { useInternetIdentity } from "ic-use-internet-identity"; // Importing the useInternetIdentity hook

type Entry = {
  url: string;
  clickCount: bigint;
  lastClicked: string | null; // Add lastClicked to the Entry type
  time: string; // Add time to the Entry type for initial insertion timestamp
};

export function Entry() {
  const { actor: backend } = useBackend() as { actor: ActorSubclass<_SERVICE> };
  const { identity } = useInternetIdentity(); // Getting the identity from Internet Identity
  const [url, setURL] = useState<string>(""); // Single input field for URL
  const [entries, setEntries] = useState<Entry[]>([]); // State to hold all entries
  const [isAscending, setIsAscending] = useState<boolean>(true); // State to track alphabetical sort order
  const [isCountAscending, setIsCountAscending] = useState<boolean>(true); // State to track click count sort order
  const [isLastVisitAscending, setIsLastVisitAscending] = useState<boolean>(true); // State to track last visit sort order

  const [isEditMode, setIsEditMode] = useState<boolean>(false); // State to track display mode (original or formatted)
  const [editedEntries, setEditedEntries] = useState<{ [index: number]: string }>({}); // Track edits for each entry

  // Fetch all entries when the component mounts
  useEffect(() => {
    async function fetchEntries() {
      if (backend && identity) {
        const allEntries = await backend.getAllEntries();
        const sortedEntries = allEntries
          .map((entry) => ({
            url: entry[0],
            clickCount: BigInt(entry[1].clickCount),
            lastClicked: entry[1].lastClicked[0] ?? null, // Optional lastClicked timestamp
            time: entry[1].time, // Initial insertion timestamp
          }))
          .sort((a, b) => {
            // Sort by the `time` field in descending order (newest first)
            const timeA = parseInt(a.time, 10);
            const timeB = parseInt(b.time, 10);
            return timeB - timeA; // Descending order
          });

        setEntries(sortedEntries);
      }
    }
    fetchEntries();
  }, [backend, identity]);

  // Function to insert a new entry
  async function handleInsert() {
    if (!backend || !identity) return;
    await backend.insert(url);

    // Add the new entry at the beginning of the entries list
    setEntries([
      { url: url, clickCount: BigInt(0), lastClicked: null, time: Math.floor(Date.now() / 1000).toString() },
      ...entries,
    ]);
    setURL("");
  }

  // Function to delete an entry
  async function handleDelete(url: string) {
    if (!backend || !identity) return;
    await backend.deleteEntry(url); // Call backend to delete the entry
    setEntries(entries.filter((entry) => entry.url !== url)); // Remove the deleted entry from the list
  }

  // Function to increment click count when URL is clicked
  const handleClickCountIncrement = async (url: string) => {
    if (!backend || !identity) return;
    await backend.incrementClickCount(url);

    // Set lastClicked to the current Unix timestamp in seconds
    const timestamp = Math.floor(Date.now() / 1000).toString(); // Get the current Unix timestamp (in seconds)
    setEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.url === url ? { ...entry, clickCount: entry.clickCount + BigInt(1), lastClicked: timestamp } : entry
      )
    );
  };

  // Function to format display URL by removing "https://", "http://", "www.", and trailing slashes only for display
  const formatUrl = (url: string) => {
    return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  };

  // Calculate elapsed time and format it as seconds, minutes, hours, or days
  const formatElapsedTime = (lastClicked: string | null) => {
    if (!lastClicked) return "0";
    const currentTimestamp = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds
    const lastClickedTimestamp = parseInt(lastClicked, 10); // Convert lastClicked to an integer
    const elapsedSeconds = currentTimestamp - lastClickedTimestamp; // Calculate the difference in seconds

    if (elapsedSeconds >= 86400) {
      // 86400 seconds = 1 day
      const elapsedDays = Math.floor(elapsedSeconds / 86400);
      return `${elapsedDays}d`; // Display in days if 1 day or more
    } else if (elapsedSeconds >= 3600) {
      // 3600 seconds = 1 hour
      const elapsedHours = Math.floor(elapsedSeconds / 3600);
      return `${elapsedHours}h`; // Display in hours if 1 hour or more
    } else if (elapsedSeconds >= 60) {
      const elapsedMinutes = Math.floor(elapsedSeconds / 60);
      return `${elapsedMinutes}m`; // Display in minutes if 60 seconds or more
    }

    return `${elapsedSeconds}s`; // Display in seconds if less than 60 seconds
  };

  // Function to sort entries alphabetically based on the formatted URL (without http, www, etc.)
  const handleSortAlphabetically = () => {
    const sortedEntries = [...entries].sort((a, b) => {
      const formattedA = formatUrl(a.url);
      const formattedB = formatUrl(b.url);
      return isAscending ? formattedA.localeCompare(formattedB) : formattedB.localeCompare(formattedA);
    });
    setEntries(sortedEntries);
    setIsAscending(!isAscending); // Toggle alphabetical sort order for next click
  };

  // Function to sort entries by click count
  const handleSortByClickCount = () => {
    const sortedEntries = [...entries].sort((a, b) =>
      isCountAscending ? Number(a.clickCount - b.clickCount) : Number(b.clickCount - a.clickCount)
    );
    setEntries(sortedEntries);
    setIsCountAscending(!isCountAscending); // Toggle click count sort order for next click
  };

  // Function to sort entries by last visit time
  const handleSortByLastVisit = () => {
    const currentTimestamp = Math.floor(Date.now() / 1000); // Get current Unix timestamp in seconds
    const sortedEntries = [...entries].sort((a, b) => {
      const elapsedA = a.lastClicked ? currentTimestamp - parseInt(a.lastClicked, 10) : Infinity;
      const elapsedB = b.lastClicked ? currentTimestamp - parseInt(b.lastClicked, 10) : Infinity;
      return isLastVisitAscending ? elapsedA - elapsedB : elapsedB - elapsedA;
    });
    setEntries(sortedEntries);
    setIsLastVisitAscending(!isLastVisitAscending); // Toggle last visit sort order for next click
  };

  // Toggle between displaying original URLs and formatted URLs, saving any unsaved edits
  const handleToggleEdit = () => {
    saveAllEdits(); // Save edits before toggling
    setIsEditMode(!isEditMode);
  };

  // Handle URL edit change for a specific entry
  const handleEditChange = (index: number, value: string) => {
    setEditedEntries((prev) => ({ ...prev, [index]: value }));
  };

  // Save the edited URL when focus is lost or mode is toggled
  const handleBlurSave = (index: number) => {
    const updatedUrl = editedEntries[index];
    if (updatedUrl) {
      setEntries((prevEntries) =>
        prevEntries.map((entry, i) =>
          i === index
            ? { url: updatedUrl, clickCount: entry.clickCount, lastClicked: entry.lastClicked, time: entry.time }
            : entry
        )
      );
      setEditedEntries((prev) => {
        const newEdits = { ...prev };
        delete newEdits[index];
        return newEdits;
      });
    }
  };

  // Save all edits for each entry
  const saveAllEdits = () => {
    setEntries((prevEntries) =>
      prevEntries.map((entry, index) => ({
        url: editedEntries[index] || entry.url,
        clickCount: entry.clickCount,
        lastClicked: entry.lastClicked,
        time: entry.time,
      }))
    );
    setEditedEntries({});
  };

  if (!identity) {
    return <div>Please log in using your Internet Identity</div>; // Show a message if no identity is found
  }

  return (
    <div className="entry-container" style={{ maxWidth: "100vw", width: "min(100%, 200vw)", margin: "0 auto" }}>
      <input
        type="text"
        placeholder="URL"
        value={url}
        onChange={(e) => setURL(e.target.value)}
        style={{ width: "100%" }}
      />
      <button onClick={handleInsert}>Save</button>

      <div>
        <button onClick={handleSortByClickCount} style={{ margin: "1rem" }}>
          Count {isCountAscending ? "↑" : "↓"} {/* Display Count ↑ or ↓ based on click count sort order */}
        </button>
        <button onClick={handleSortByLastVisit} style={{ margin: "1rem" }}>
          Last Visit {isLastVisitAscending ? "↑" : "↓"} {/* Display Last Visit ↑ or ↓ based on last visit sort order */}
        </button>
        <button onClick={handleSortAlphabetically} style={{ margin: "1rem" }}>
          {isAscending ? "ABC" : "ZYX"} {/* Display ABC or ZYX based on alphabetical sort order */}
        </button>
        <button onClick={handleToggleEdit} style={{ margin: "1rem" }}>
          {isEditMode ? "Save" : "Edit"}
        </button>
        {entries.length > 0 ? (
          <ul>
            {entries.map((entry, index) => (
              <li key={index} style={{ display: "flex", alignItems: "center", width: "100%" }}>
                {isEditMode && (
                  <button onClick={() => handleDelete(entry.url)} style={{ marginRight: "0.5rem" }}>
                    🗑️
                  </button>
                )}
                {!isEditMode ? (
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleClickCountIncrement(entry.url)}
                    style={{ flex: 1, width: "100%" }}
                  >
                    {formatUrl(entry.url)} ({entry.clickCount.toString()}, {formatElapsedTime(entry.lastClicked)})
                  </a>
                ) : (
                  <input
                    type="text"
                    value={editedEntries[index] ?? entry.url}
                    onChange={(e) => handleEditChange(index, e.target.value)}
                    onBlur={() => handleBlurSave(index)}
                    style={{ flex: 1, width: "100%" }}
                  />
                )}
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