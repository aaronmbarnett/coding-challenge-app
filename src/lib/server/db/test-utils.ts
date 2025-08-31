import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { sql } from 'drizzle-orm';

/**
 * Create an isolated in-memory database for testing
 * Each test gets its own database instance to prevent interference
 */
export function createTestDatabase() {
  // Create in-memory SQLite database
  const client = new Database(':memory:');
  
  // Enable foreign keys by default
  client.pragma('foreign_keys = ON');
  
  const db = drizzle(client, { schema });
  
  // Use Drizzle's built-in schema generation instead of manual SQL
  setupTestSchema(client);
  
  return { db, client };
}

/**
 * Setup the database schema for testing using the exact same schema as production
 */
function setupTestSchema(client: Database.Database) {
  // Create tables using the exact same schema as defined in schema.ts
  // This matches the actual schema structure
  
  client.exec(`
    CREATE TABLE user (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'candidate',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE invitation (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      token_hash BLOB NOT NULL,
      expires_at INTEGER NOT NULL,
      consumed_at INTEGER,
      created_by TEXT NOT NULL REFERENCES user(id),
      created_at INTEGER NOT NULL
    );

    CREATE TABLE session (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES user(id),
      expires_at INTEGER NOT NULL
    );

    CREATE TABLE challenges (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description_md TEXT NOT NULL,
      languages_csv TEXT NOT NULL,
      starter_code TEXT,
      time_limit_sec INTEGER,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE challenge_tests (
      id TEXT PRIMARY KEY,
      challenge_id TEXT NOT NULL REFERENCES challenges(id),
      kind TEXT NOT NULL DEFAULT 'io',
      input TEXT,
      expected TEXT,
      harness_code TEXT,
      weight INTEGER NOT NULL DEFAULT 1,
      hidden INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE sessions (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL REFERENCES user(id),
      total_duration_sec INTEGER NOT NULL,
      started_at INTEGER,
      ends_at INTEGER,
      status TEXT NOT NULL DEFAULT 'pending'
    );

    CREATE TABLE attempts (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES sessions(id),
      challenge_id TEXT NOT NULL REFERENCES challenges(id),
      started_at INTEGER,
      submitted_at INTEGER,
      status TEXT NOT NULL DEFAULT 'locked',
      test_run_count INTEGER NOT NULL DEFAULT 0,
      last_test_run_at INTEGER
    );

    CREATE TABLE submissions (
      id TEXT PRIMARY KEY,
      attempt_id TEXT NOT NULL REFERENCES attempts(id),
      code TEXT NOT NULL,
      language TEXT NOT NULL,
      judge0_id TEXT,
      passed INTEGER NOT NULL,
      total INTEGER NOT NULL,
      stdout TEXT,
      stderr TEXT,
      time_ms INTEGER,
      created_at INTEGER NOT NULL
    );
  `);
}

/**
 * Create a test database and return cleanup function
 * Usage:
 *   const { db, cleanup } = setupTestDb();
 *   // ... run tests
 *   cleanup();
 */
export function setupTestDb() {
  const { db, client } = createTestDatabase();
  
  const cleanup = () => {
    try {
      client.close();
    } catch (error) {
      // Database might already be closed, ignore
    }
  };
  
  return { db, cleanup };
}

/**
 * Test data factory functions
 */
export const testFactories = {
  async createUser(db: ReturnType<typeof createTestDatabase>['db'], overrides: Partial<typeof schema.user.$inferInsert> = {}) {
    const [user] = await db
      .insert(schema.user)
      .values({
        email: 'test@example.com',
        role: 'candidate',
        ...overrides
      })
      .returning();
    return user;
  },

  async createChallenge(db: ReturnType<typeof createTestDatabase>['db'], overrides: Partial<typeof schema.challenges.$inferInsert> = {}) {
    const [challenge] = await db
      .insert(schema.challenges)
      .values({
        title: 'Test Challenge',
        descriptionMd: '# Test Description',
        languagesCsv: 'javascript,python',
        ...overrides
      })
      .returning();
    return challenge;
  },

  async createSession(db: ReturnType<typeof createTestDatabase>['db'], candidateId: string, overrides: Partial<typeof schema.sessions.$inferInsert> = {}) {
    const [session] = await db
      .insert(schema.sessions)
      .values({
        candidateId,
        totalDurationSec: 3600,
        status: 'active',
        ...overrides
      })
      .returning();
    return session;
  },

  async createAttempt(db: ReturnType<typeof createTestDatabase>['db'], sessionId: string, challengeId: string, overrides: Partial<typeof schema.attempts.$inferInsert> = {}) {
    const [attempt] = await db
      .insert(schema.attempts)
      .values({
        sessionId,
        challengeId,
        status: 'in_progress',
        ...overrides
      })
      .returning();
    return attempt;
  },

  async createTestCase(db: ReturnType<typeof createTestDatabase>['db'], challengeId: string, overrides: Partial<typeof schema.challengeTests.$inferInsert> = {}) {
    const [testCase] = await db
      .insert(schema.challengeTests)
      .values({
        challengeId,
        kind: 'io',
        input: 'test input',
        expectedOutput: 'test output',
        weight: 1,
        hidden: 0,
        ...overrides
      })
      .returning();
    return testCase;
  }
};