// Debug: Add immediate DOM manipulation to test basic functionality
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif; background: white; color: black; min-height: 100vh;">
        <h1>DOM Test - RateMyKOL</h1>
        <p>This is a direct DOM manipulation test.</p>
        <p>If you see this, HTML/CSS is working.</p>
        <p>React loading will happen next...</p>
      </div>
    `;
  }
});

import { createRoot } from "react-dom/client";
import SimpleApp from "./SimpleApp";
import "./index.css";

setTimeout(() => {
  try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found");
    }
    
    const root = createRoot(rootElement);
    root.render(<SimpleApp />);
  } catch (error) {
    console.error("Failed to render React app:", error);
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif; background: red; color: white;">
          <h1>React Error</h1>
          <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
          <p>Check the console for more details.</p>
        </div>
      `;
    }
  }
}, 100);
