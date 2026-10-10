import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { spawn } from "node:child_process";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { publicPlatformScript } from "./publicConfig";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { registerAppRoutes } from "../appRoutes";

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  const notesService = spawn(process.env.PYTHON_BIN || "python3", ["python/notes_service.py"], {
    cwd: process.cwd(),
    env: { ...process.env, NOTES_PORT: process.env.NOTES_PORT || "3001" },
    stdio: "inherit",
  });
  notesService.on("error", error => console.error("Could not start the Python notes service:", error.message));
  notesService.on("exit", (code, signal) => {
    if (code !== 0 && code !== null) console.error(`Python notes service exited with code ${code}`);
    if (signal) console.error(`Python notes service stopped by ${signal}`);
  });
  const stopNotesService = () => { if (!notesService.killed) notesService.kill("SIGTERM"); };
  process.once("SIGINT", stopNotesService);
  process.once("SIGTERM", stopNotesService);
  registerAppRoutes(app);
  app.get("/api/platform/config.js", (_req, res) => {
    res.set("Cache-Control", "no-store").type("application/javascript").send(publicPlatformScript());
  });
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number(process.env.PORT || "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
  server.on("error", error => { console.error("Server failed:", error.message); process.exit(1); });
  server.listen(port, "0.0.0.0", () => console.log(`Server listening on port ${port}`));
}

startServer().catch(error => { console.error(error); process.exit(1); });
