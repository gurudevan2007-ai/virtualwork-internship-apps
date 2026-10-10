import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/** Users table backing the starter's optional auth flow. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const notes = mysqlTable("notes", {
  id: int("id").autoincrement().primaryKey(),
  body: text("body").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const profiles = mysqlTable("profiles", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  bio: varchar("bio", { length: 240 }).notNull(),
  imageUrl: varchar("imageUrl", { length: 2048 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const coffeeItems = mysqlTable("coffee_items", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 40 }).notNull().unique(),
  name: varchar("name", { length: 80 }).notNull(),
  description: varchar("description", { length: 240 }).notNull(),
  voteCount: int("voteCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const quoteHistory = mysqlTable("quote_history", {
  id: int("id").autoincrement().primaryKey(),
  quoteId: varchar("quoteId", { length: 64 }).notNull(),
  text: text("text").notNull(),
  author: varchar("author", { length: 240 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const teamMembers = mysqlTable("team_members", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 40 }).notNull().unique(),
  name: varchar("name", { length: 80 }).notNull(),
  role: varchar("role", { length: 100 }).notNull(),
  available: boolean("available").default(true).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
