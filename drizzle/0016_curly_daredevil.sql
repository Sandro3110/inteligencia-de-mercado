CREATE TABLE `activity_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`activityType` varchar(50) NOT NULL,
	`description` text,
	`metadata` json,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `activity_log_id` PRIMARY KEY(`id`)
);
