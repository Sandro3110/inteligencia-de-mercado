CREATE TABLE `entity_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tagId` int NOT NULL,
	`entityType` enum('mercado','cliente','concorrente','lead') NOT NULL,
	`entityId` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `entity_tags_id` PRIMARY KEY(`id`)
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
ALTER TABLE `entity_tags` ADD CONSTRAINT `entity_tags_tagId_tags_id_fk` FOREIGN KEY (`tagId`) REFERENCES `tags`(`id`) ON DELETE cascade ON UPDATE no action;