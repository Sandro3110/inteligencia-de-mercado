CREATE TABLE `produtos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`clienteId` int NOT NULL,
	`mercadoId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`categoria` varchar(100),
	`preco` decimal(10,2),
	`unidade` varchar(50),
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `produtos_id` PRIMARY KEY(`id`)
);
