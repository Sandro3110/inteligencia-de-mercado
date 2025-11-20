CREATE TABLE `project_audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` varchar(64),
	`action` enum('created','updated','hibernated','reactivated','deleted') NOT NULL,
	`changes` text,
	`metadata` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `project_audit_log_id` PRIMARY KEY(`id`)
);
