CREATE TABLE `coffee_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(40) NOT NULL,
	`name` varchar(80) NOT NULL,
	`description` varchar(240) NOT NULL,
	`voteCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coffee_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `coffee_items_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(80) NOT NULL,
	`bio` varchar(240) NOT NULL,
	`imageUrl` varchar(2048) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quote_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quoteId` varchar(64) NOT NULL,
	`text` text NOT NULL,
	`author` varchar(240) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quote_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(40) NOT NULL,
	`name` varchar(80) NOT NULL,
	`role` varchar(100) NOT NULL,
	`available` boolean NOT NULL DEFAULT true,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `team_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `team_members_slug_unique` UNIQUE(`slug`)
);
