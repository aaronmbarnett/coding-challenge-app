import { sqliteTable, integer, text, blob } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

export const user = sqliteTable('user', {
  id: text('id').primaryKey().$defaultFn(createId),

  email: text('email').notNull().unique(),
  role: text('role', { enum: ['admin', 'candidate'] })
    .notNull()
    .default('candidate'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
});

export const invitation = sqliteTable('invitation', {
  id: text('id').primaryKey().$defaultFn(createId),
  email: text('email').notNull(),
  //store hash only: never the raw token
  tokenHash: blob('token_hash', { mode: 'buffer' }).notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  consumedAt: integer('consumed_at', { mode: 'timestamp_ms' }),
  createdBy: text('created_by')
    .notNull()
    .references(() => user.id),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull()
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Invitation = typeof invitation.$inferSelect;
