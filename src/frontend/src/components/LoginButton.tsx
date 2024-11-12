import Spinner from "./Spinner";
import { useInternetIdentity } from "ic-use-internet-identity";

export function LoginButton() {
  const { isLoggingIn, login, clear, identity } = useInternetIdentity();

  // If the user is logged in, clear the identity. Otherwise, log in.
  function handleClick() {
    if (identity) {
      clear();
    } else {
      login();
    }
  }

  const text = () => {
    if (identity) {
      return "Logout";
    } else if (isLoggingIn) {
      return (
        <>
          Logging in
          <Spinner className="ml-2" />
        </>
      );
    }
    return "Login";
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoggingIn}
      style={{
        padding: "0.5rem 1rem",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "0.25rem",
        cursor: isLoggingIn ? "wait" : "pointer",
      }}
    >
      {text()}
    </button>
  );
}
