console.log("main.tsx is loading");

// Test if basic DOM manipulation works
const root = document.getElementById("root");
if (root) {
  console.log("Root element found");
  root.innerHTML = '<h1 style="color: red; background: yellow; padding: 20px;">BASIC DOM TEST - If you see this, JavaScript works but React has issues</h1>';
} else {
  console.error("Root element not found");
}

// Also try React
import { createRoot } from "react-dom/client";
import TestApp from "./TestApp";
import "./index.css";

console.log("About to create React root");
try {
  createRoot(document.getElementById("root")!).render(<TestApp />);
  console.log("React component rendered successfully");
} catch (error) {
  console.error("React render failed:", error);
}
