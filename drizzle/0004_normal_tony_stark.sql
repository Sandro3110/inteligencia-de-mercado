CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`cor` varchar(7) DEFAULT '#3b82f6',
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `clientes` ADD `projectId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `concorrentes` ADD `projectId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` ADD `projectId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `mercados_unicos` ADD `projectId` int NOT NULL;