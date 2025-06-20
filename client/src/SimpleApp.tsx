import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function SimpleApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ 
        padding: "20px", 
        fontSize: "24px", 
        color: "black",
        backgroundColor: "white",
        minHeight: "100vh"
      }}>
        <h1>RateMyKOL Loading Test</h1>
        <p>If you see this, the basic app structure works.</p>
        <p>Testing query client integration...</p>
      </div>
    </QueryClientProvider>
  );
}

export default SimpleApp;