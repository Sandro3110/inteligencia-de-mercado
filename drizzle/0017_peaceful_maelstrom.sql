CREATE TABLE `clientes_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clienteId` int NOT NULL,
	`field` varchar(100),
	`oldValue` text,
	`newValue` text,
	`changeType` enum('created','updated','enriched','validated') DEFAULT 'updated',
	`changedBy` varchar(64),
	`changedAt` timestamp DEFAULT (now()),
	CONSTRAINT `clientes_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `concorrentes_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`concorrenteId` int NOT NULL,
	`field` varchar(100),
	`oldValue` text,
	`newValue` text,
	`changeType` enum('created','updated','enriched','validated') DEFAULT 'updated',
	`changedBy` varchar(64),
	`changedAt` timestamp DEFAULT (now()),
	CONSTRAINT `concorrentes_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`field` varchar(100),
	`oldValue` text,
	`newValue` text,
	`changeType` enum('created','updated','enriched','validated') DEFAULT 'updated',
	`changedBy` varchar(64),
	`changedAt` timestamp DEFAULT (now()),
	CONSTRAINT `leads_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mercados_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mercadoId` int NOT NULL,
	`field` varchar(100),
	`oldValue` text,
	`newValue` text,
	`changeType` enum('created','updated','enriched','validated') DEFAULT 'updated',
	`changedBy` varchar(64),
	`changedAt` timestamp DEFAULT (now()),
	CONSTRAINT `mercados_history_id` PRIMARY KEY(`id`)
);
