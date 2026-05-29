import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import UrbanBricks from "./UrbanBricks.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UrbanBricks />
  </StrictMode>
);
