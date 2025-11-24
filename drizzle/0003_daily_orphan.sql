CREATE TABLE `entity_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tagId` int NOT NULL,
	`entityType` enum('mercado','cliente','concorrente','lead') NOT NULL,
	`entityId` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `entity_tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `saved_filters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(64) NOT NULL,
	`name` varchar(100) NOT NULL,
	`filtersJson` text NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `saved_filters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`color` varchar(7) DEFAULT '#3b82f6',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `leads` ADD `leadStage` enum('novo','em_contato','negociacao','fechado','perdido') DEFAULT 'novo';--> statement-breakpoint
ALTER TABLE `leads` ADD `stageUpdatedAt` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `entity_tags` ADD CONSTRAINT `entity_tags_tagId_tags_id_fk` FOREIGN KEY (`tagId`) REFERENCES `tags`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `saved_filters` ADD CONSTRAINT `saved_filters_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;