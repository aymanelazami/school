import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import "./index.css";

console.log("Entry client executing...");

startTransition(() => {
  console.log("Starting hydration...");
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  );
  console.log("Hydration scheduled.");
});
