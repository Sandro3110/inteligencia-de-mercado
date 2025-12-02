CREATE TABLE "dim_geografia" (
	"id" serial PRIMARY KEY NOT NULL,
	"cidade" varchar(255) NOT NULL,
	"uf" varchar(2) NOT NULL,
	"regiao" varchar(50) NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dim_mercados" (
	"id" serial PRIMARY KEY NOT NULL,
	"mercado_hash" varchar(255),
	"nome" varchar(255) NOT NULL,
	"categoria" varchar(100) NOT NULL,
	"segmentacao" varchar(50),
	"tamanho_mercado" text,
	"crescimento_anual" text,
	"tendencias" text,
	"principais_players" text,
	"pesquisa_id" integer NOT NULL,
	"project_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dim_produtos" (
	"id" serial PRIMARY KEY NOT NULL,
	"produto_hash" varchar(255),
	"nome" varchar(255) NOT NULL,
	"categoria" varchar(100) NOT NULL,
	"descricao" text,
	"preco" text,
	"unidade" varchar(50),
	"ativo" boolean DEFAULT true,
	"mercado_id" integer,
	"pesquisa_id" integer NOT NULL,
	"project_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "entidade_competidores" (
	"id" serial PRIMARY KEY NOT NULL,
	"entidade_id" integer NOT NULL,
	"competidor_id" integer NOT NULL,
	"mercado_id" integer NOT NULL,
	"nivel_competicao" varchar(50),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "entidade_competidores_check" CHECK (entidade_id != competidor_id)
);
--> statement-breakpoint
CREATE TABLE "entidade_produtos" (
	"id" serial PRIMARY KEY NOT NULL,
	"entidade_id" integer NOT NULL,
	"produto_id" integer NOT NULL,
	"tipo_relacao" varchar(50),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fato_entidades" (
	"id" serial PRIMARY KEY NOT NULL,
	"tipo_entidade" varchar(20) NOT NULL,
	"entidade_hash" varchar(255),
	"nome" varchar(255) NOT NULL,
	"cnpj" varchar(20),
	"pesquisa_id" integer NOT NULL,
	"project_id" integer NOT NULL,
	"geografia_id" integer NOT NULL,
	"mercado_id" integer NOT NULL,
	"email" varchar(500),
	"telefone" varchar(50),
	"site_oficial" varchar(500),
	"linkedin" varchar(500),
	"instagram" varchar(500),
	"cnae" varchar(20),
	"porte" varchar(50),
	"segmentacao_b2b_b2c" varchar(10),
	"faturamento_declarado" text,
	"faturamento_estimado" text,
	"numero_estabelecimentos" text,
	"qualidade_score" integer,
	"qualidade_classificacao" varchar(50),
	"status_qualificacao" varchar(50) DEFAULT 'prospect',
	"validation_status" varchar(50) DEFAULT 'pending',
	"validation_notes" text,
	"validated_by" varchar(64),
	"validated_at" timestamp,
	"lead_stage" varchar(50),
	"stage_updated_at" timestamp,
	"cliente_origem_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "fato_entidades_tipo_check" CHECK (tipo_entidade IN ('cliente', 'lead', 'concorrente')),
	CONSTRAINT "fato_entidades_qualidade_check" CHECK (qualidade_score >= 0 AND qualidade_score <= 100),
	CONSTRAINT "fato_entidades_status_qualificacao_check" CHECK (status_qualificacao IN ('ativo', 'inativo', 'prospect', 'lead_qualificado', 'lead_desqualificado'))
);
--> statement-breakpoint
CREATE TABLE "fato_entidades_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"entidade_id" integer NOT NULL,
	"data_snapshot" jsonb NOT NULL,
	"change_type" varchar(50) NOT NULL,
	"changed_by" varchar(64),
	"changed_at" timestamp DEFAULT now(),
	CONSTRAINT "fato_entidades_history_type_check" CHECK (change_type IN ('created', 'updated', 'deleted'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX "dim_geografia_cidade_uf_unique" ON "dim_geografia" USING btree ("cidade","uf");--> statement-breakpoint
CREATE INDEX "idx_dim_geografia_uf" ON "dim_geografia" USING btree ("uf");--> statement-breakpoint
CREATE INDEX "idx_dim_geografia_regiao" ON "dim_geografia" USING btree ("regiao");--> statement-breakpoint
CREATE INDEX "idx_dim_geografia_cidade_uf" ON "dim_geografia" USING btree ("cidade","uf");--> statement-breakpoint
CREATE UNIQUE INDEX "dim_mercados_hash_unique" ON "dim_mercados" USING btree ("mercado_hash");--> statement-breakpoint
CREATE INDEX "idx_dim_mercados_pesquisa" ON "dim_mercados" USING btree ("pesquisa_id");--> statement-breakpoint
CREATE INDEX "idx_dim_mercados_project" ON "dim_mercados" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_dim_mercados_categoria" ON "dim_mercados" USING btree ("categoria");--> statement-breakpoint
CREATE INDEX "idx_dim_mercados_hash" ON "dim_mercados" USING btree ("mercado_hash");--> statement-breakpoint
CREATE INDEX "idx_dim_mercados_pesquisa_categoria" ON "dim_mercados" USING btree ("pesquisa_id","categoria");--> statement-breakpoint
CREATE UNIQUE INDEX "dim_produtos_hash_unique" ON "dim_produtos" USING btree ("produto_hash");--> statement-breakpoint
CREATE INDEX "idx_dim_produtos_pesquisa" ON "dim_produtos" USING btree ("pesquisa_id");--> statement-breakpoint
CREATE INDEX "idx_dim_produtos_project" ON "dim_produtos" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_dim_produtos_categoria" ON "dim_produtos" USING btree ("categoria");--> statement-breakpoint
CREATE INDEX "idx_dim_produtos_mercado" ON "dim_produtos" USING btree ("mercado_id");--> statement-breakpoint
CREATE INDEX "idx_dim_produtos_hash" ON "dim_produtos" USING btree ("produto_hash");--> statement-breakpoint
CREATE INDEX "idx_dim_produtos_pesquisa_categoria" ON "dim_produtos" USING btree ("pesquisa_id","categoria");--> statement-breakpoint
CREATE UNIQUE INDEX "entidade_competidores_unique" ON "entidade_competidores" USING btree ("entidade_id","competidor_id","mercado_id");--> statement-breakpoint
CREATE INDEX "idx_entidade_competidores_entidade" ON "entidade_competidores" USING btree ("entidade_id");--> statement-breakpoint
CREATE INDEX "idx_entidade_competidores_competidor" ON "entidade_competidores" USING btree ("competidor_id");--> statement-breakpoint
CREATE INDEX "idx_entidade_competidores_mercado" ON "entidade_competidores" USING btree ("mercado_id");--> statement-breakpoint
CREATE UNIQUE INDEX "entidade_produtos_unique" ON "entidade_produtos" USING btree ("entidade_id","produto_id");--> statement-breakpoint
CREATE INDEX "idx_entidade_produtos_entidade" ON "entidade_produtos" USING btree ("entidade_id");--> statement-breakpoint
CREATE INDEX "idx_entidade_produtos_produto" ON "entidade_produtos" USING btree ("produto_id");--> statement-breakpoint
CREATE INDEX "idx_entidade_produtos_tipo" ON "entidade_produtos" USING btree ("tipo_relacao");--> statement-breakpoint
CREATE UNIQUE INDEX "fato_entidades_hash_unique" ON "fato_entidades" USING btree ("entidade_hash");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_tipo" ON "fato_entidades" USING btree ("tipo_entidade");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_pesquisa" ON "fato_entidades" USING btree ("pesquisa_id");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_project" ON "fato_entidades" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_geografia" ON "fato_entidades" USING btree ("geografia_id");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_mercado" ON "fato_entidades" USING btree ("mercado_id");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_hash" ON "fato_entidades" USING btree ("entidade_hash");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_qualidade" ON "fato_entidades" USING btree ("qualidade_score");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_cnpj" ON "fato_entidades" USING btree ("cnpj");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_tipo_pesquisa" ON "fato_entidades" USING btree ("tipo_entidade","pesquisa_id");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_tipo_mercado" ON "fato_entidades" USING btree ("tipo_entidade","mercado_id");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_cliente_origem" ON "fato_entidades" USING btree ("cliente_origem_id");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_geografia_mercado" ON "fato_entidades" USING btree ("geografia_id","mercado_id");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_status_qualificacao" ON "fato_entidades" USING btree ("status_qualificacao");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_tipo_status" ON "fato_entidades" USING btree ("tipo_entidade","status_qualificacao");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_pesquisa_status" ON "fato_entidades" USING btree ("pesquisa_id","status_qualificacao");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_mercado_status" ON "fato_entidades" USING btree ("mercado_id","status_qualificacao");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_geografia_status" ON "fato_entidades" USING btree ("geografia_id","status_qualificacao");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_tipo_pesquisa_status" ON "fato_entidades" USING btree ("tipo_entidade","pesquisa_id","status_qualificacao");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_history_entidade" ON "fato_entidades_history" USING btree ("entidade_id");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_history_changed_at" ON "fato_entidades_history" USING btree ("changed_at");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_history_change_type" ON "fato_entidades_history" USING btree ("change_type");