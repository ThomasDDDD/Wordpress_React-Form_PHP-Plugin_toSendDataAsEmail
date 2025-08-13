import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import OfferForm from "./OfferForm.jsx";
import useAutoResizeIframe from "./UseAutoResizeIframe.jsx";

function AppWrapper() {
  useAutoResizeIframe();
  return <OfferForm />;
}

createRoot(document.getElementById("react-root")).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>
);
