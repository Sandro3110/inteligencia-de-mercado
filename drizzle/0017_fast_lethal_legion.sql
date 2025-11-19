ALTER TABLE `saved_filters` ADD `projectId` int;--> statement-breakpoint
ALTER TABLE `saved_filters` ADD `isPublic` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `saved_filters` ADD `shareToken` varchar(64);