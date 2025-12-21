import fs from "node:fs";
import path from "node:path";
import { type Server } from "node:http";
import express, { type Express } from "express";
import runApp from "./app";

/**
 * This matches the signature expected by runApp in your project.
 * It takes the Express app and the HTTP server instance.
 */
export async function serveStatic(app: Express, _server: Server) {
  const distPath = path.resolve(process.cwd(), "dist", "public");

  if (!fs.existsSync(distPath)) {
    console.warn(`Static directory not found at: ${distPath}`);
  }

  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    // If it's an API route that wasn't found, return 404
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: "API route not found" });
    }
    
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Build not found. Please run 'npm run build'.");
    }
  });
}

/**
 * This is the magic for Vercel. 
 * We call runApp and pass serveStatic as the 'setup' function.
 */
const init = runApp(serveStatic);

export default init;