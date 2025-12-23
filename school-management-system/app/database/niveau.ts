import { pgTable, serial, varchar, integer } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';
import { groupes } from "./groupe.ts";
import { filieres } from "./filiere.ts";
import { modules } from "./module.ts"; // Keep this import

export const niveaux = pgTable("niveaux", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  programId: integer("program_id").notNull(),
  academicYear: varchar("academic_year", { length: 20 }).notNull(),
  creditsRequired: integer("credits_required").notNull(),
});

export const niveauxRelations = relations(niveaux, ({ one, many }) => ({ // Use niveauxRelations
  groupes: many(groupes), // Keep this
  filiere: one(filieres, {
    fields: [niveaux.programId],
    references: [filieres.id],
  }),
  modules: many(modules), // Keep this
}));