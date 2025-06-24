import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export function serveStatic(app: Express) {
  // In production, the built files are in dist/public
  // In development, they would be in client/dist
  const distPath = process.env.NODE_ENV === 'production' 
    ? path.resolve(import.meta.dirname, "../dist/public")
    : path.resolve(import.meta.dirname, "../client/dist");

  if (!fs.existsSync(distPath)) {
    console.error(`Build directory not found: ${distPath}`);
    console.log("Available directories:", fs.readdirSync(path.resolve(import.meta.dirname, "..")));
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  console.log(`Serving static files from: ${distPath}`);
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}