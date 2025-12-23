import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './user.ts';
import { permissionsTable } from './permissions.ts';

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: varchar('role_name', { length: 255 }).notNull().unique(), 
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
  permissionsTable: many(permissionsTable)
}));