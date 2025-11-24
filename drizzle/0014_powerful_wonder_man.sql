CREATE TABLE `alert_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`alertType` enum('error_rate','high_quality_lead','market_threshold') NOT NULL,
	`condition` text NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`lastTriggeredAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `alert_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `alert_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertConfigId` int NOT NULL,
	`projectId` int NOT NULL,
	`alertType` enum('error_rate','high_quality_lead','market_threshold') NOT NULL,
	`condition` text NOT NULL,
	`message` text NOT NULL,
	`triggeredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alert_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduled_enrichments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`scheduledAt` timestamp NOT NULL,
	`recurrence` enum('once','daily','weekly') NOT NULL DEFAULT 'once',
	`batchSize` int DEFAULT 50,
	`maxClients` int,
	`timeout` int DEFAULT 3600,
	`scheduleStatus` enum('pending','running','completed','cancelled','error') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`lastRunAt` timestamp,
	`nextRunAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `scheduled_enrichments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `enrichment_runs` ADD `status` enum('running','paused','completed','error') DEFAULT 'running' NOT NULL;--> statement-breakpoint
ALTER TABLE `enrichment_runs` DROP COLUMN `enrichmentStatus`;