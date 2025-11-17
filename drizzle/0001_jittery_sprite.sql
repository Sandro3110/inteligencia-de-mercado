CREATE TABLE `clientes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clienteHash` varchar(64),
	`nome` varchar(255) NOT NULL,
	`cnpj` varchar(20),
	`siteOficial` varchar(500),
	`produtoPrincipal` text,
	`segmentacaoB2bB2c` varchar(20),
	`email` varchar(320),
	`telefone` varchar(50),
	`linkedin` varchar(500),
	`instagram` varchar(500),
	`cidade` varchar(100),
	`uf` varchar(2),
	`cnae` varchar(20),
	`validationStatus` enum('pending','rich','needs_adjustment','discarded') DEFAULT 'pending',
	`validationNotes` text,
	`validatedBy` varchar(64),
	`validatedAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `clientes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clientes_mercados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clienteId` int NOT NULL,
	`mercadoId` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `clientes_mercados_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `concorrentes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`concorrenteHash` varchar(64),
	`mercadoId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`cnpj` varchar(20),
	`site` varchar(500),
	`produto` text,
	`porte` varchar(50),
	`faturamentoEstimado` varchar(100),
	`qualidadeScore` int,
	`qualidadeClassificacao` varchar(50),
	`validationStatus` enum('pending','rich','needs_adjustment','discarded') DEFAULT 'pending',
	`validationNotes` text,
	`validatedBy` varchar(64),
	`validatedAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `concorrentes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadHash` varchar(64),
	`mercadoId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`cnpj` varchar(20),
	`site` varchar(500),
	`email` varchar(320),
	`telefone` varchar(50),
	`tipo` varchar(20),
	`porte` varchar(50),
	`regiao` varchar(100),
	`setor` varchar(100),
	`qualidadeScore` int,
	`qualidadeClassificacao` varchar(50),
	`validationStatus` enum('pending','rich','needs_adjustment','discarded') DEFAULT 'pending',
	`validationNotes` text,
	`validatedBy` varchar(64),
	`validatedAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mercados_unicos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mercadoHash` varchar(64),
	`nome` varchar(255) NOT NULL,
	`segmentacao` varchar(50),
	`categoria` varchar(100),
	`tamanhoMercado` text,
	`crescimentoAnual` varchar(50),
	`tendencias` text,
	`principaisPlayers` text,
	`quantidadeClientes` int DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `mercados_unicos_id` PRIMARY KEY(`id`)
);
