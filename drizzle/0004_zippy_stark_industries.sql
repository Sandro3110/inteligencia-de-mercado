CREATE TABLE `saved_filters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(64) NOT NULL,
	`name` varchar(100) NOT NULL,
	`filtersJson` text NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `saved_filters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `saved_filters` ADD CONSTRAINT `saved_filters_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;