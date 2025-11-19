CREATE TABLE `lead_conversions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`projectId` int NOT NULL,
	`dealValue` decimal(15,2),
	`convertedAt` timestamp NOT NULL DEFAULT (now()),
	`notes` text,
	`conversionStatus` enum('won','lost') NOT NULL DEFAULT 'won',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `lead_conversions_id` PRIMARY KEY(`id`)
);
