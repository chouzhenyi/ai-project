CREATE TABLE `ai_cache` (
	`id` text PRIMARY KEY NOT NULL,
	`item_name` text NOT NULL,
	`category` text,
	`result` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `alerts` (
	`id` text PRIMARY KEY NOT NULL,
	`item_id` text,
	`type` text NOT NULL,
	`message` text NOT NULL,
	`severity` text NOT NULL,
	`resolved` integer DEFAULT false NOT NULL,
	`resolved_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`parent_id` text,
	`icon` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category_id` text,
	`brand` text,
	`model` text,
	`quantity` real DEFAULT 1 NOT NULL,
	`unit` text DEFAULT '个' NOT NULL,
	`photo_paths` text,
	`location_id` text,
	`production_date` text,
	`expiry_date` text,
	`storage_requirements` text,
	`notes` text,
	`qr_code` text,
	`min_stock` real,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `items_qr_code_unique` ON `items` (`qr_code`);--> statement-breakpoint
CREATE TABLE `locations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`parent_id` text,
	`type` text NOT NULL,
	`qr_code` text,
	`photo_path` text,
	`conditions` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `locations_qr_code_unique` ON `locations` (`qr_code`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`item_id` text NOT NULL,
	`type` text NOT NULL,
	`quantity_change` real NOT NULL,
	`quantity_before` real NOT NULL,
	`quantity_after` real NOT NULL,
	`from_location_id` text,
	`to_location_id` text,
	`destination` text,
	`destination_type` text,
	`operator` text DEFAULT '家人' NOT NULL,
	`photo_paths` text,
	`notes` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`from_location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE no action
);
