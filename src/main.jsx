import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import OfferForm from "./OfferForm.jsx";

createRoot(document.getElementById("react-root")).render(
  <StrictMode>
    <OfferForm />
  </StrictMode>
);
