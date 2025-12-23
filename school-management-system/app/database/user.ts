import { pgTable, serial, varchar, timestamp, boolean, integer, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { city } from './city.ts';
import { roles } from './role.ts';
import { groupes } from './groupe.ts';
import { filieres } from './filiere.ts';
import { grades } from './grade.ts';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  birthDate: date('birth_date').notNull(), 
  email: varchar('email', { length: 255 }).notNull().unique(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  address: varchar('address', { length: 255 }).notNull(),
  zipCode: varchar('zip_code', { length: 10 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(false),
  emailVerified: boolean('email_verified').default(false),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  twoFactorSecret: varchar('two_factor_secret', { length: 255 }),
  twoFactorBackupCodes: varchar('two_factor_backup_codes', { length: 500 }),
  roleId: integer('role_id').references(() => roles.id), 
  groupeId: integer('groupe_id').references(() => groupes.id),
  programId: integer('program_id').references(() => filieres.id), 
  cityId: integer('city_id').references(() => city.id), 
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  city: one(city, {
    fields: [users.cityId],
    references: [city.id],
  }),
  groupe: one(groupes, {
    fields: [users.groupeId],
    references: [groupes.id],
  }),
  program: one(filieres, {
    fields: [users.programId],
    references: [filieres.id],
  }),
  teacherGrades: many(grades, { relationName: 'teacherGrades' }),
  studentGrades: many(grades, { relationName: 'studentGrades' }),
}));