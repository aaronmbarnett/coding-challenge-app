ALTER TABLE `attempts` ADD `test_run_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `attempts` ADD `last_test_run_at` integer;