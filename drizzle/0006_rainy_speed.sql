CREATE TABLE `project_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`config` text NOT NULL,
	`isDefault` int NOT NULL DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `project_templates_id` PRIMARY KEY(`id`)
);
