CREATE TABLE `enrichment_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`enrichmentQueueStatus` enum('pending','processing','completed','error') DEFAULT 'pending',
	`priority` int DEFAULT 0,
	`clienteData` json NOT NULL,
	`result` json,
	`errorMessage` text,
	`createdAt` timestamp DEFAULT (now()),
	`startedAt` timestamp,
	`completedAt` timestamp,
	CONSTRAINT `enrichment_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `projects` ADD `executionMode` enum('parallel','sequential') DEFAULT 'sequential';--> statement-breakpoint
ALTER TABLE `projects` ADD `maxParallelJobs` int DEFAULT 3;