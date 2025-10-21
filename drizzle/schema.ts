import { mysqlEnum, mysqlTable, text, timestamp, varchar, int } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Croche items table for storing materials like yarn, needles, etc.
 */
export const crocheItems = mysqlTable("croche_items", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  quantity: int("quantity").notNull().default(0),
  price: int("price").notNull().default(0), // stored in centavos (cents)
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type CrocheItem = typeof crocheItems.$inferSelect;
export type InsertCrocheItem = typeof crocheItems.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  crocheItems: many(crocheItems),
}));

export const crocheItemsRelations = relations(crocheItems, ({ one }) => ({
  user: one(users, {
    fields: [crocheItems.userId],
    references: [users.id],
  }),
}));
