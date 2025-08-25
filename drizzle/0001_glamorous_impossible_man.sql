CREATE TABLE `attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`challenge_id` text NOT NULL,
	`started_at` integer,
	`submitted_at` integer,
	`status` text DEFAULT 'locked' NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`challenge_id`) REFERENCES `challenges`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `challenge_tests` (
	`id` text PRIMARY KEY NOT NULL,
	`challenge_id` text NOT NULL,
	`kind` text DEFAULT 'io' NOT NULL,
	`input` text,
	`expected` text,
	`harness_code` text,
	`weight` integer DEFAULT 1 NOT NULL,
	`hidden` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`challenge_id`) REFERENCES `challenges`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `challenges` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description_md` text NOT NULL,
	`languages_csv` text NOT NULL,
	`starter_code` text,
	`time_limit_sec` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`candidate_id` text NOT NULL,
	`total_duration_sec` integer NOT NULL,
	`started_at` integer,
	`ends_at` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	FOREIGN KEY (`candidate_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`attempt_id` text NOT NULL,
	`code` text NOT NULL,
	`language` text NOT NULL,
	`judge0_id` text,
	`passed` integer DEFAULT 0 NOT NULL,
	`total` integer DEFAULT 0 NOT NULL,
	`stdout` text,
	`stderr` text,
	`time_ms` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`attempt_id`) REFERENCES `attempts`(`id`) ON UPDATE no action ON DELETE no action
);
