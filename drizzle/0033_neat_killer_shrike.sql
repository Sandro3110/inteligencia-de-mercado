CREATE TABLE `hibernation_warnings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`warningDate` timestamp NOT NULL DEFAULT (now()),
	`scheduledHibernationDate` timestamp NOT NULL,
	`daysInactive` int NOT NULL,
	`notificationSent` int NOT NULL DEFAULT 0,
	`postponed` int NOT NULL DEFAULT 0,
	`postponedUntil` timestamp,
	`hibernated` int NOT NULL DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `hibernation_warnings_id` PRIMARY KEY(`id`)
);
