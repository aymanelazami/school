import { pgTable, serial, varchar, integer } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';
import { niveaux } from "./niveau.ts";
import { users } from "./user.ts";

export const groupes = pgTable("groupes", {
  id: serial("id").primaryKey(),
  groupeName: varchar("groupe_name", { length: 100 }).notNull(),
  level_id: integer("level_id")
    .notNull()
    .references(() => niveaux.id, { onDelete: "cascade" }),
});

export const groupeRelations = relations(groupes, ({ one, many }) => ({
  niveau: one(niveaux, {
    fields: [groupes.level_id],
    references: [niveaux.id],
  }),
  users: many(users),
}));