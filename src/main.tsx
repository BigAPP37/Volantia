import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Suppress non-critical logs in production
if (import.meta.env.PROD) {
  console.log = () => {};
  console.warn = () => {};
  console.info = () => {};
  console.debug = () => {};
}

createRoot(document.getElementById("root")!).render(<App />);
