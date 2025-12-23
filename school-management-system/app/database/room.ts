import { pgTable, serial, varchar, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { events } from './event.ts';
import { sessions } from './session.ts';

export const rooms = pgTable('rooms', {
  id: serial('id').primaryKey(),
  roomNumber: varchar('room_number', { length: 155 }).notNull().unique(),
  capacity: integer('capacity').notNull(),
  roomType: varchar('room_type', { length: 255 }).notNull(),
  facility: varchar('facility', { length: 255 }).notNull(),
  isAvailable: boolean('is_available').default(true).notNull(),
});

export const roomRelations = relations(rooms, ({ many }) => ({
  events: many(events),
  sessions: many(sessions),
}));