import { Entry } from "./components/Entry";
import { LoginButton } from "./components/LoginButton";
import Principal from "./components/Principal";
import { useInternetIdentity } from "ic-use-internet-identity";

function App() {
  const { identity } = useInternetIdentity();

  // Get the principal (user ID) from the identity directly
  const principal = identity ? identity.getPrincipal().toText() : undefined;

  return (
    <div className="flex flex-col w-full gap-5 p-10 font-sans text-base items-start">
      <div style={{ display: "flex", alignItems: "center" }}>
        <LoginButton />
        {!identity && <div className="text-center">You are not logged in.</div>}
        {identity && <Principal principal={principal} />}
      </div>
      {identity && <Entry />}
    </div>
  );
}

export default App;
