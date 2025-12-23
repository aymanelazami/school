 import { integer, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import {users} from './user.ts';
import { relations } from 'drizzle-orm';

export const documents = pgTable("documents", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name").notNull(),
  documentType: varchar("document_type").notNull(),
  filePath: varchar("file_path").notNull(),
  size: integer(),
  uploadDate: timestamp("upload_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: integer('user_id').references(()=>users.id, { onDelete: 'set null' })
});


export const documentsRelation = relations(documents, ({ one }) => ({
    user: one(users, {
        fields: [documents.userId],
        references: [users.id],
    })
}));

