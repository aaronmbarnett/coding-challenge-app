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

export const challenges = sqliteTable('challenges', {
  id: text('id').primaryKey().$defaultFn(createId),
  title: text('title').notNull(),
  descriptionMd: text('description_md').notNull(),
  languagesCsv: text('languages_csv').notNull(), // e.g. "javascript,python"
  starterCode: text('starter_code'),
  timeLimitSec: integer('time_limit_sec'), // optional per-challenge limit
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
});

export const challengeTests = sqliteTable('challenge_tests', {
  id: text('id').primaryKey().$defaultFn(createId),
  challengeId: text('challenge_id')
    .references(() => challenges.id)
    .notNull(),
  kind: text('kind', { enum: ['io', 'harness'] })
    .notNull()
    .default('io'),
  input: text('input'), // used for I/O style
  expectedOutput: text('expected'), // used for I/O style
  harnessCode: text('harness_code'), // used for harness style
  weight: integer('weight').notNull().default(1),
  hidden: integer('hidden').notNull().default(1) // 1=true
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey().$defaultFn(createId),
  candidateId: text('candidate_id')
    .references(() => user.id)
    .notNull(),
  totalDurationSec: integer('total_duration_sec').notNull(), // whole exam window
  startedAt: integer('started_at', { mode: 'timestamp_ms' }),
  endsAt: integer('ends_at', { mode: 'timestamp_ms' }),
  status: text('status', { enum: ['pending', 'active', 'submitted', 'expired'] })
    .notNull()
    .default('pending')
});

export const attempts = sqliteTable('attempts', {
  id: text('id').primaryKey().$defaultFn(createId),
  sessionId: text('session_id')
    .references(() => sessions.id)
    .notNull(),
  challengeId: text('challenge_id')
    .references(() => challenges.id)
    .notNull(),
  startedAt: integer('started_at', { mode: 'timestamp_ms' }),
  submittedAt: integer('submitted_at', { mode: 'timestamp_ms' }),
  status: text('status', { enum: ['locked', 'in_progress', 'submitted'] })
    .notNull()
    .default('locked'),
  testRunCount: integer('test_run_count').notNull().default(0),
  lastTestRunAt: integer('last_test_run_at', { mode: 'timestamp_ms' })
});

export const submissions = sqliteTable('submissions', {
  id: text('id').primaryKey().$defaultFn(createId),
  attemptId: text('attempt_id')
    .references(() => attempts.id)
    .notNull(),
  code: text('code').notNull(),
  language: text('language').notNull(),
  judge0Id: text('judge0_id'),
  passed: integer('passed').notNull().default(0),
  total: integer('total').notNull().default(0),
  stdout: text('stdout'),
  stderr: text('stderr'),
  timeMs: integer('time_ms'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Invitation = typeof invitation.$inferSelect;
