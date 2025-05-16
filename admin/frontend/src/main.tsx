import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const element = document.getElementById("root");
if (!element) throw new Error("Root element not found");

const root = createRoot(element);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);

export default root;
