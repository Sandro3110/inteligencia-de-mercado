CREATE TABLE `job_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int,
	`jobType` varchar(50) NOT NULL,
	`avgDurationMs` int NOT NULL,
	`totalJobs` int DEFAULT 0,
	`lastUpdated` timestamp DEFAULT (now()),
	CONSTRAINT `job_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `enrichment_queue` ADD `retryCount` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `enrichment_queue` ADD `lastError` text;