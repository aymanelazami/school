import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './user.ts';

export const city = pgTable('cities', {
  id: serial('id').primaryKey(),
  name: varchar('city_name', { length: 255 }).notNull().unique(), 
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const cityRelations = relations(city, ({ many }) => ({
  users: many(users),
}));