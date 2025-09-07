# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SvelteKit-based coding challenge administration platform where admins can create programming challenges and candidates take timed coding assessments. The application uses SQLite with Drizzle ORM and implements a complete challenge lifecycle from creation to submission evaluation.

## Key Commands

**Development:**
- `npm run dev` - Start development server
- `npm run dev -- --open` - Start dev server and open browser

**Database Operations:**
- `npm run db:studio` - Open Drizzle Studio for database inspection
- `npm run db:generate` - Generate migration files from schema changes
- `npm run db:push` - Push schema changes directly to database
- `npm run db:migrate` - Run pending migrations

**Code Quality:**
- `npm run format` - Format code with Prettier
- `npm run lint` - Check formatting and run ESLint
- `npm run check` - Run TypeScript and Svelte checks
- `npm run check:watch` - Run checks in watch mode

**Testing:**
- `npm run test:unit` - Run Vitest unit tests
- `npm run test:e2e` - Run Playwright e2e tests
- `npm run test` - Run both unit and e2e tests

## Architecture Overview

**Database Schema (src/lib/server/db/schema.ts):**
The application follows a comprehensive challenge management flow:
- `users` - Admin and candidate accounts with role-based access
- `invitations` - Magic link invitation system (stores hashed tokens only)
- `challenges` - Coding problems with markdown descriptions and multi-language support
- `challengeTests` - Test cases supporting both I/O pairs and test harnesses
- `sessions` - Timed exam sessions linking candidates to challenges
- `attempts` - Individual challenge attempts within sessions (tracks timing and status)
- `submissions` - Code submissions with Judge0 integration for execution results

**Authentication System:**
Implements magic link authentication with invitation-based user onboarding (`src/lib/server/auth/magic-link.ts`). Admins create invitations via `/admin/invitations`, sending time-limited magic links to candidates. The verification flow at `/auth/verify` validates tokens, creates user accounts, and establishes sessions. Still retains simplified cookie-based dev authentication (`src/lib/server/auth/session.ts`) for quick admin development iteration. All server routes have access to `event.locals.user` and `event.locals.db` via the global handle in `hooks.server.ts`.

**Route Structure:**
- `/admin/*` - Protected admin area with layout-level route guards
- `/admin/challenges` - Challenge CRUD with nested routes for editing and test case management
- `/admin/challenges/[id]/tests` - Dedicated test case management interface
- `/admin/invitations` - Magic link invitation management for candidate onboarding
- `/auth/verify` - Magic link token verification and user authentication
- `/login` - Simple admin login (dev credentials: admin@example.com / admin123)

**Component Architecture:**
Admin UI is componentized with reusable components in `src/lib/components/admin/` for challenge management, test cases, and forms. Components follow the pattern of separating presentation from logic.

**Database Integration:**
- Database instance is injected into `event.locals.db` via hooks.server.ts
- Uses Drizzle ORM with SQLite (local.db file)
- All server-side routes can access the database via `locals.db`
- Schema uses CUID2 for primary keys and timestamp_ms mode for dates

**Development Patterns:**
- Server actions handle form submissions with proper validation and redirect patterns
- `throw redirect()` must be outside try/catch blocks for proper SvelteKit flow control
- Form data handling uses `Object.fromEntries(formData)` pattern for cleaner code
- Route guards implemented via layout server load functions

## Environment Configuration

Required environment variables:
- `DATABASE_URL` - SQLite database path (defaults to "local.db")
- `SESSION_SECRET` - Used for cookie signing (has dev default)

The application runs entirely on SQLite and requires no external services for basic functionality. Judge0 integration is prepared in the schema but not yet implemented.
