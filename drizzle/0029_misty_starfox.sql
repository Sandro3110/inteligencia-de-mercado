CREATE TABLE `intelligent_alerts_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`circuitBreakerThreshold` int NOT NULL DEFAULT 10,
	`errorRateThreshold` int NOT NULL DEFAULT 10,
	`processingTimeThreshold` int NOT NULL DEFAULT 60,
	`notifyOnCompletion` int NOT NULL DEFAULT 1,
	`notifyOnCircuitBreaker` int NOT NULL DEFAULT 1,
	`notifyOnErrorRate` int NOT NULL DEFAULT 1,
	`notifyOnProcessingTime` int NOT NULL DEFAULT 1,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `intelligent_alerts_configs_id` PRIMARY KEY(`id`),
	CONSTRAINT `intelligent_alerts_configs_projectId_unique` UNIQUE(`projectId`)
);
--> statement-breakpoint
CREATE TABLE `intelligent_alerts_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`alertType` enum('circuit_breaker','error_rate','processing_time','completion') NOT NULL,
	`severity` enum('info','warning','critical') NOT NULL DEFAULT 'info',
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`metricValue` text,
	`threshold` text,
	`jobId` int,
	`clientsProcessed` int,
	`totalClients` int,
	`isRead` int NOT NULL DEFAULT 0,
	`isDismissed` int NOT NULL DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`readAt` timestamp,
	`dismissedAt` timestamp,
	CONSTRAINT `intelligent_alerts_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `llm_provider_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`activeProvider` enum('openai','gemini','anthropic') NOT NULL DEFAULT 'openai',
	`openaiApiKey` text,
	`openaiModel` varchar(100) DEFAULT 'gpt-4o',
	`openaiEnabled` int NOT NULL DEFAULT 1,
	`geminiApiKey` text,
	`geminiModel` varchar(100) DEFAULT 'gemini-2.0-flash-exp',
	`geminiEnabled` int NOT NULL DEFAULT 0,
	`anthropicApiKey` text,
	`anthropicModel` varchar(100) DEFAULT 'claude-3-5-sonnet-20241022',
	`anthropicEnabled` int NOT NULL DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `llm_provider_configs_id` PRIMARY KEY(`id`)
);
