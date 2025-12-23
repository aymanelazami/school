import { pgTable, serial, varchar, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { events } from './event.ts';

export const attendanceLists = pgTable('attendance_lists', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    eventId: integer('event_id')
        .references(() => events.id, { onDelete: 'cascade' }) // FK obligatoire
        .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const attendanceListRelations = relations(attendanceLists, ({ one }) => ({
    event: one(events, {
        fields: [attendanceLists.eventId],
        references: [events.id],
    }),
}));