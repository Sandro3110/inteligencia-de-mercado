CREATE TABLE `enrichment_cache` (
	`cnpj` varchar(14) NOT NULL,
	`dadosJson` text NOT NULL,
	`fonte` varchar(50),
	`dataAtualizacao` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `enrichment_cache_cnpj` PRIMARY KEY(`cnpj`)
);
