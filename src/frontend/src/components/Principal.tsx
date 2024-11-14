import { useInternetIdentity } from "ic-use-internet-identity";

export default function Principal({ principal }: { principal?: string }) {
  const { identity } = useInternetIdentity();

  if (!identity || !principal) return null;

  // Get the last 3 characters of the principal
  const principalSuffix = principal.slice(-3);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        whiteSpace: "nowrap",
      }}
    >
      Your principal: ...{principalSuffix}
    </div>
  );
}
