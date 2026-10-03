import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const levelProjects = sqliteTable('level_projects', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').notNull(),
  name: text('name').notNull(),
  document: text('document').notNull(),
  revision: integer('revision').notNull().default(1),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, table => [index('idx_level_projects_owner_updated').on(table.ownerId, table.updatedAt)]);
