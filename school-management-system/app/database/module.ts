import { pgTable, serial, varchar, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { niveaux } from './niveau.ts';
import { filieres } from './filiere.ts';
import { sessions } from './session.ts';

export const modules = pgTable('modules', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull().unique(),
  description: varchar('description', { length: 255 }).notNull(),
  credits: integer('credits').notNull(),
  creditRequired: integer('credit_required').notNull(),
  niveauId: integer('niveau_id')
    .notNull()
    .references(() => niveaux.id, { onDelete: 'cascade' }),
  filiereId: integer("filiere_id")
    .notNull()
    .references(() => filieres.id, { onDelete: "cascade" }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const modulesRelations = relations(modules, ({ one, many }) => ({
  niveau: one(niveaux, {
    fields: [modules.niveauId],
    references: [niveaux.id],
  }),
  filiere: one(filieres, {
    fields: [modules.filiereId],
    references: [filieres.id],
  }),
  sessions: many(sessions), 
}));
