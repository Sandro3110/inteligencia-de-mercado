CREATE TABLE `export_history` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`context` text,
	`filters` json,
	`format` enum('csv','excel','pdf','json') NOT NULL,
	`outputType` enum('simple','complete','report') NOT NULL,
	`recordCount` int NOT NULL,
	`fileUrl` text NOT NULL,
	`fileSize` int NOT NULL,
	`generationTime` int,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `export_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `export_templates` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`templateType` enum('market','client','competitive','lead') NOT NULL,
	`config` json NOT NULL,
	`isSystem` boolean DEFAULT false,
	`userId` varchar(64),
	`usageCount` int DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `export_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interpretation_cache` (
	`id` varchar(64) NOT NULL,
	`inputHash` varchar(64) NOT NULL,
	`input` text NOT NULL,
	`interpretation` json NOT NULL,
	`hitCount` int DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `interpretation_cache_id` PRIMARY KEY(`id`),
	CONSTRAINT `interpretation_cache_inputHash_unique` UNIQUE(`inputHash`)
);
--> statement-breakpoint
CREATE TABLE `query_cache` (
	`id` varchar(64) NOT NULL,
	`queryHash` varchar(64) NOT NULL,
	`query` text NOT NULL,
	`results` json NOT NULL,
	`recordCount` int NOT NULL,
	`hitCount` int DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `query_cache_id` PRIMARY KEY(`id`),
	CONSTRAINT `query_cache_queryHash_unique` UNIQUE(`queryHash`)
);
--> statement-breakpoint
CREATE TABLE `saved_filters_export` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`filters` json NOT NULL,
	`isPublic` boolean DEFAULT false,
	`shareToken` varchar(64),
	`usageCount` int DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `saved_filters_export_id` PRIMARY KEY(`id`)
);
