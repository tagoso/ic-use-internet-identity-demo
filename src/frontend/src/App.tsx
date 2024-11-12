import { useEffect, useState } from "react";

import { TextSaver } from "./components/TextSaver";
import { LoginButton } from "./components/LoginButton";
import Principal from "./components/Principal";
import { useBackend } from "./ic/Actors";
import { useInternetIdentity } from "ic-use-internet-identity";

function App() {
  const { identity } = useInternetIdentity();
  const { actor: backend } = useBackend();
  const [principal, setPrincipal] = useState<string>();

  // Clear the principal when the identity is cleared
  useEffect(() => {
    if (!identity) setPrincipal(undefined);
  }, [identity]);

  // Get the principal from the backend when an identity is available
  useEffect(() => {
    if (identity && backend && !principal) {
      backend.whoami().then((p) => setPrincipal(p));
    }
  }, [backend, identity, principal]);

  return (
    <div className="flex flex-col items-center w-full gap-5 p-10 font-sans text-base italic md:items-start md:gap-10 md:text-base">
      <LoginButton />
      {!identity && <div className="text-center">You are not logged in.</div>}
      <Principal principal={principal} />
      <TextSaver />
    </div>
  );
}

export default App;
