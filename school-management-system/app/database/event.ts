import { pgTable, serial, varchar, timestamp, integer, date, time } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { attendanceLists } from './attendanceList.ts';
import { rooms } from './room.ts';



export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  type: varchar('type', { length: 100 }).notNull(),
  date: date('date').notNull(),
  startTime: time('start_time').notNull(), // Format hh:mm:ss
  endTime: time('end_time').notNull(),     // Format hh:mm:ss
  roomId: integer('room_id').references(() => rooms.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const eventsRelations = relations(events, ({ one, many }) => ({
  attendanceLists: many(attendanceLists),
  room: one(rooms, {
    fields: [events.roomId],
    references: [rooms.id],
  }),
}));