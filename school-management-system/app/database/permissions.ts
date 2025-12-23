import { permission } from "./customTypes/typeObject.ts";
import { pgTable, serial, varchar, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { roles } from "./role.ts";

export const permissionsTable = pgTable('permissions', {
    id: serial('id').primaryKey(),
    description: varchar('description', { length: 512 }).notNull(),
    permissionsAllowed: permission('permissions_allowed').notNull(),
    roleId: integer("role_id").references(() => roles.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const permissionsRelations = relations(permissionsTable, ({ one }) => ({
    role: one(roles, {
        fields: [permissionsTable.roleId],
        references: [roles.id],
    }),
}));