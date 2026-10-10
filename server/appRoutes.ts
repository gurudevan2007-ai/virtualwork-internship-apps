import type { Express, Request, Response } from "express";
import { asc, desc, eq, sql } from "drizzle-orm";
import { coffeeItems, profiles, quoteHistory, teamMembers } from "../drizzle/schema";
import { getDb } from "./db";

function fail(res: Response, message: string, status = 500) {
  res.status(status).json({ error: message });
}

async function requireDb(res: Response) {
  const db = await getDb();
  if (!db) fail(res, "The managed database is not available right now.", 503);
  return db;
}

async function seedCoffee(db: NonNullable<Awaited<ReturnType<typeof getDb>>>) {
  const samples = [
    { slug: "espresso", name: "Espresso", description: "Short, bright, and full of focus." },
    { slug: "flatwhite", name: "Flat white", description: "Silky milk, balanced coffee, no fuss." },
    { slug: "cappuccino", name: "Cappuccino", description: "A little foam makes room for a pause." },
    { slug: "coldbrew", name: "Cold brew", description: "Slow-steeped and refreshingly smooth." },
  ];
  await db.insert(coffeeItems).values(samples).onDuplicateKeyUpdate({ set: { slug: sql`values(slug)` } });
}

async function seedTeam(db: NonNullable<Awaited<ReturnType<typeof getDb>>>) {
  const samples = [
    { slug: "avery-lane", name: "Avery Lane", role: "Product designer", available: true },
    { slug: "jordan-kim", name: "Jordan Kim", role: "Frontend developer", available: true },
    { slug: "riley-patel", name: "Riley Patel", role: "API engineer", available: false },
    { slug: "morgan-reed", name: "Morgan Reed", role: "Project lead", available: true },
  ];
  await db.insert(teamMembers).values(samples).onDuplicateKeyUpdate({ set: { slug: sql`values(slug)` } });
}

async function forwardNotes(req: Request, res: Response) {
  try {
    const response = await fetch(`http://127.0.0.1:${process.env.NOTES_PORT || "3001"}/notes`, {
      method: req.method,
      headers: req.method === "POST" ? { "Content-Type": "application/json" } : undefined,
      body: req.method === "POST" ? JSON.stringify(req.body) : undefined,
      signal: AbortSignal.timeout(15000),
    });
    const body = await response.json();
    res.status(response.status).json(body);
  } catch (error) {
    console.error("Python notes backend unavailable:", error instanceof Error ? error.message : error);
    fail(res, "The Python notes backend is not responding yet. Please try again.", 503);
  }
}

export function registerAppRoutes(app: Express) {
  app.get("/api/notes", (req, res) => void forwardNotes(req, res));
  app.post("/api/notes", (req, res) => void forwardNotes(req, res));

  app.post("/api/profiles", async (req, res) => {
    try {
      const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
      const bio = typeof req.body?.bio === "string" ? req.body.bio.trim() : "";
      const imageUrl = typeof req.body?.imageUrl === "string" ? req.body.imageUrl.trim() : "";
      if (!name || name.length > 80) return fail(res, "Please enter a name under 80 characters.", 400);
      if (!bio || bio.length > 240) return fail(res, "Please enter a bio under 240 characters.", 400);
      let parsed: URL;
      try { parsed = new URL(imageUrl); } catch { return fail(res, "Enter a valid image URL.", 400); }
      if (!new Set(["http:", "https:"]).has(parsed.protocol)) return fail(res, "Image URLs must use HTTP or HTTPS.", 400);
      const db = await requireDb(res); if (!db) return;
      const inserted = await db.insert(profiles).values({ name, bio, imageUrl }).$returningId();
      const id = inserted[0]?.id;
      if (!id) return fail(res, "The profile card could not be created.");
      res.status(201).json({ profile: { id, name, bio, imageUrl, createdAt: new Date().toISOString() } });
    } catch (error) { console.error("Profile create failed:", error); fail(res, "The profile card could not be created."); }
  });

  app.get("/api/coffee/items", async (_req, res) => {
    try {
      const db = await requireDb(res); if (!db) return;
      await seedCoffee(db);
      const items = await db.select().from(coffeeItems).orderBy(asc(coffeeItems.id));
      res.json({ items });
    } catch (error) { console.error("Coffee list failed:", error); fail(res, "The coffee list could not be loaded."); }
  });

  app.post("/api/coffee/items/:id/vote", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isSafeInteger(id) || id < 1) return fail(res, "That coffee item is not valid.", 400);
      const db = await requireDb(res); if (!db) return;
      await seedCoffee(db);
      await db.update(coffeeItems).set({ voteCount: sql`${coffeeItems.voteCount} + 1` }).where(eq(coffeeItems.id, id));
      const [item] = await db.select().from(coffeeItems).where(eq(coffeeItems.id, id)).limit(1);
      if (!item) return fail(res, "That coffee item could not be found.", 404);
      res.json({ item });
    } catch (error) { console.error("Coffee vote failed:", error); fail(res, "Your vote could not be saved."); }
  });

  app.get("/api/quotes/history", async (_req, res) => {
    try {
      const db = await requireDb(res); if (!db) return;
      const quotes = await db.select().from(quoteHistory).orderBy(desc(quoteHistory.createdAt), desc(quoteHistory.id)).limit(30);
      res.json({ quotes });
    } catch (error) { console.error("Quote history failed:", error); fail(res, "Quote history could not be loaded."); }
  });

  app.post("/api/quotes/random", async (_req, res) => {
    try {
      const db = await requireDb(res); if (!db) return;
      const response = await fetch("https://dummyjson.com/quotes/random", { signal: AbortSignal.timeout(10000), headers: { Accept: "application/json" } });
      if (!response.ok) return fail(res, "The quote service is temporarily unavailable.", 502);
      const data = await response.json() as { id?: number; quote?: string; author?: string };
      const text = typeof data.quote === "string" ? data.quote.trim() : "";
      const author = typeof data.author === "string" ? data.author.trim() : "";
      if (!text || !author || typeof data.id !== "number") return fail(res, "The quote service returned an incomplete result.", 502);
      const inserted = await db.insert(quoteHistory).values({ quoteId: String(data.id), text, author }).$returningId();
      const id = inserted[0]?.id;
      if (!id) return fail(res, "The quote could not be saved.");
      res.status(201).json({ quote: { id, quoteId: String(data.id), text, author, createdAt: new Date().toISOString() } });
    } catch (error) { console.error("Random quote request failed:", error); fail(res, "The quote could not be fetched and saved.", 502); }
  });

  app.get("/api/team", async (_req, res) => {
    try {
      const db = await requireDb(res); if (!db) return;
      await seedTeam(db);
      const members = await db.select().from(teamMembers).orderBy(asc(teamMembers.id));
      res.json({ members });
    } catch (error) { console.error("Team list failed:", error); fail(res, "The team could not be loaded."); }
  });

  app.patch("/api/team/:id/availability", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isSafeInteger(id) || id < 1 || typeof req.body?.available !== "boolean") return fail(res, "A valid member and availability value are required.", 400);
      const db = await requireDb(res); if (!db) return;
      await seedTeam(db);
      await db.update(teamMembers).set({ available: req.body.available, updatedAt: new Date() }).where(eq(teamMembers.id, id));
      const [member] = await db.select().from(teamMembers).where(eq(teamMembers.id, id)).limit(1);
      if (!member) return fail(res, "That team member could not be found.", 404);
      res.json({ member });
    } catch (error) { console.error("Team availability update failed:", error); fail(res, "The availability update could not be saved."); }
  });
}
