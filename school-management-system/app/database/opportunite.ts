import { pgTable, serial, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
export const opportunityTypeEnum = pgEnum('opportunity_type', ['stage', "offre d'emploi"]);

export const opportunities = pgTable('opportunities', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    type: opportunityTypeEnum('type').notNull(),
    description: text('description'),
    company: varchar('company', { length: 255 }),
    location: varchar('location', { length: 255 }),
    profile: text('profile'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});