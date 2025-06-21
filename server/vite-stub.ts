// Stub file for production builds - prevents vite import errors
import { type Express } from "express";
import { type Server } from "http";

export async function setupVite(app: Express, server: Server) {
  // This should never be called in production
  throw new Error("Vite setup should only be called in development mode");
}