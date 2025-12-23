import { pgTable, serial, varchar, boolean } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';
import { niveaux } from "./niveau.ts";
import { users } from "./user.ts";
import { modules } from "./module.ts";

export const filieres = pgTable("filieres", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description:varchar("description",{ length: 255 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const filiereRelations = relations(filieres, ({ many, one }) => ({
  niveaux: many(niveaux),
  users: many(users),
  modules: many(modules),
}));