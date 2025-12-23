import { integer, pgTable,pgEnum, timestamp, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { groupes } from "./groupe.ts"; 
import { users } from "./user.ts"; 
import { rooms } from "./room.ts"; 
import { modules } from "./module.ts"; 

export const sessionTypes = pgEnum("session_types", ["normal", "exam"]);


export const sessions = pgTable("sessions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  date: date("date").notNull(),
  groupeId: integer("groupe_id").references(() => groupes.id, { onDelete: "set null" }),
  teacherId: integer("teacher_id").references(() => users.id, { onDelete: "set null" }),
  roomId: integer("room_id").references(() => rooms.id, { onDelete: "set null" }),
  moduleId: integer("module_id").references(() => modules.id, { onDelete: "set null" }),
  startDateTime: timestamp("start_date_time").notNull(),
  endDateTime: timestamp("end_date_time").notNull(),
  sessionType: sessionTypes("session_type").notNull(), 
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  class: one(groupes, { fields: [sessions.groupeId], references: [groupes.id] }),
  teacher: one(users, { fields: [sessions.teacherId], references: [users.id] }),
  room: one(rooms, { fields: [sessions.roomId], references: [rooms.id] }),
  module: one(modules, { fields: [sessions.moduleId], references: [modules.id] }),
}));
