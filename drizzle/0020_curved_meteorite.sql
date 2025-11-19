ALTER TABLE `clientes` ADD `regiao` varchar(100);--> statement-breakpoint
ALTER TABLE `clientes` ADD `faturamentoDeclarado` text;--> statement-breakpoint
ALTER TABLE `clientes` ADD `numeroEstabelecimentos` int;--> statement-breakpoint
ALTER TABLE `concorrentes` ADD `faturamentoDeclarado` text;--> statement-breakpoint
ALTER TABLE `concorrentes` ADD `numeroEstabelecimentos` int;--> statement-breakpoint
ALTER TABLE `leads` ADD `faturamentoDeclarado` text;--> statement-breakpoint
ALTER TABLE `leads` ADD `numeroEstabelecimentos` int;