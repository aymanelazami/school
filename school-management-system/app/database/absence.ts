import { pgTable, serial, varchar, integer, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./user.ts";
import { sessions } from "./session.ts";

export const AbsenceStatus = {
  PRESENT: "present",
  ABSENT: "absent",
  RETARD : "retard"
} as const;

export function isValidStatus(status: string): boolean {
  if (!status) return false;
  const normalized = status.trim().toLowerCase();
  return Object.values(AbsenceStatus).includes(normalized as any);
}


export const absences = pgTable("absences", {
  id: serial("id").primaryKey(),
  status: varchar("status", { length: 50 }).notNull(), 
  teacher_id: integer("teacher_id").notNull(),         
  student_id: integer("student_id").notNull(),         // FK -> users.id
  session_id: integer("session_id").notNull().references(() => sessions.id), // FK -> sessions.id
  justification: text("justification"),                // nullable
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const absencesRelations = relations(absences, ({ one }) => ({
  student: one(users, {
    fields: [absences.student_id],
    references: [users.id],
  }),
  teacher: one(users, {
    fields: [absences.teacher_id],
    references: [users.id],
  }),
  session: one(sessions, {
    fields: [absences.session_id],
    references: [sessions.id],
  }),
}));