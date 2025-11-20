CREATE TABLE `pesquisas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`dataImportacao` timestamp DEFAULT (now()),
	`totalClientes` int DEFAULT 0,
	`clientesEnriquecidos` int DEFAULT 0,
	`status` enum('importado','enriquecendo','concluido','erro') DEFAULT 'importado',
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `pesquisas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `clientes` ADD `pesquisaId` int;--> statement-breakpoint
ALTER TABLE `concorrentes` ADD `pesquisaId` int;--> statement-breakpoint
ALTER TABLE `leads` ADD `pesquisaId` int;--> statement-breakpoint
ALTER TABLE `mercados_unicos` ADD `pesquisaId` int;--> statement-breakpoint
ALTER TABLE `produtos` ADD `pesquisaId` int;