import "./global.css";
import "./suppressDevWarnings";
import { createRoot } from "react-dom/client";
import App from "./App";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Create root only once
const root = createRoot(rootElement);
root.render(<App />);
