import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@bcgov/bc-sans/css/BC_Sans.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/global.scss";

import App from "@/App";

const element = document.getElementById("root");
if (!element) throw new Error("Root element not found");

const root = createRoot(element);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);

export default root;
