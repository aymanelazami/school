import { pgTable, serial, timestamp, integer, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './user.ts';
import { modules } from './module.ts';
import { sessions } from './session.ts';

export const grades = pgTable('grades', {
  id: serial('id').primaryKey(),
  grade: decimal('grade').notNull(),
  teacherID: integer('teacher_id')
    .references(() => users.id, { onDelete: 'set null' }),
  studentID: integer('student_id')
    .references(() => users.id, { onDelete: 'cascade' }),
  moduleId: integer("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  seanceID: integer('seance_id').references(() => sessions.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const gradesRelations = relations(grades, ({ one }) => ({
  teacher: one(users, {
    fields: [grades.teacherID],
    references: [users.id],
    relationName: 'teacherGrades',
  }),
  student: one(users, {
    fields: [grades.studentID],
    references: [users.id],
    relationName: 'studentGrades',
  }),
  module: one(modules, {
    fields: [grades.moduleId],
    references: [modules.id],
  }),
  session: one(sessions, {
    fields: [grades.seanceID],
    references: [sessions.id],
  }),
}));