# 🚀 PLANO DE REFATORAÇÃO COMPLETA

**Data:** 02 de Dezembro de 2025  
**Objetivo:** Implementar TODAS as melhorias da auditoria técnica  
**Qualidade:** 100% produção, zero placeholders  
**Tempo Estimado:** 3-4 dias

---

## 📋 CHECKLIST GERAL

### **FASE 1: Schema do Banco de Dados**
- [ ] Criar dim_tempo (2020-2030)
- [ ] Adicionar campos temporais ao fato
- [ ] Adicionar métricas de negócio ao fato
- [ ] Implementar hierarquias (geografia, mercado)
- [ ] Criar dim_canal
- [ ] Adicionar índices de performance
- [ ] Atualizar schema Drizzle
- [ ] Criar migrations SQL

### **FASE 2: DAL e Importação**
- [ ] Atualizar DAL para novos campos
- [ ] Ajustar importação para preencher tempo_id
- [ ] Calcular métricas iniciais na importação
- [ ] Atualizar validações

### **FASE 3: Enriquecimento**
- [ ] Atualizar P1 (Cliente) - adicionar métricas
- [ ] Atualizar P2 (Mercado) - adicionar hierarquias
- [ ] Atualizar P3 (Produtos) - adicionar métricas
- [ ] Atualizar P4 (Concorrentes) - adicionar métricas
- [ ] Atualizar P5 (Leads) - adicionar métricas
- [ ] Atualizar P6 (Validação) - validar novas métricas
- [ ] Atualizar funções de gravação

### **FASE 4: UI/Frontend**
- [ ] Dashboard com KPIs reais
- [ ] Gráficos temporais (linha do tempo)
- [ ] Drill-down hierárquico
- [ ] Filtros por métricas
- [ ] Tabelas com novas colunas

### **FASE 5: Testes**
- [ ] Testar migrations
- [ ] Testar importação
- [ ] Testar enriquecimento
- [ ] Testar UI
- [ ] Validar performance

---

## 🗄️ FASE 1: SCHEMA DO BANCO DE DADOS

### **1.1. Criar dim_tempo**

```sql
CREATE TABLE dim_tempo (
  id SERIAL PRIMARY KEY,
  data DATE UNIQUE NOT NULL,
  ano INTEGER NOT NULL,
  trimestre INTEGER NOT NULL CHECK (trimestre BETWEEN 1 AND 4),
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  semana INTEGER NOT NULL CHECK (semana BETWEEN 1 AND 53),
  dia_mes INTEGER NOT NULL CHECK (dia_mes BETWEEN 1 AND 31),
  dia_ano INTEGER NOT NULL CHECK (dia_ano BETWEEN 1 AND 366),
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Domingo
  nome_mes VARCHAR(20) NOT NULL,
  nome_mes_curto VARCHAR(3) NOT NULL,
  nome_dia_semana VARCHAR(20) NOT NULL,
  nome_dia_semana_curto VARCHAR(3) NOT NULL,
  eh_feriado BOOLEAN DEFAULT FALSE,
  eh_fim_semana BOOLEAN DEFAULT FALSE,
  eh_dia_util BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tempo_data ON dim_tempo(data);
CREATE INDEX idx_tempo_ano_mes ON dim_tempo(ano, mes);
CREATE INDEX idx_tempo_ano_trimestre ON dim_tempo(ano, trimestre);

-- Popular dim_tempo (2020-2030)
INSERT INTO dim_tempo (data, ano, trimestre, mes, semana, dia_mes, dia_ano, dia_semana, nome_mes, nome_mes_curto, nome_dia_semana, nome_dia_semana_curto, eh_fim_semana, eh_dia_util)
SELECT 
  d::date AS data,
  EXTRACT(YEAR FROM d) AS ano,
  EXTRACT(QUARTER FROM d) AS trimestre,
  EXTRACT(MONTH FROM d) AS mes,
  EXTRACT(WEEK FROM d) AS semana,
  EXTRACT(DAY FROM d) AS dia_mes,
  EXTRACT(DOY FROM d) AS dia_ano,
  EXTRACT(DOW FROM d) AS dia_semana,
  CASE EXTRACT(MONTH FROM d)
    WHEN 1 THEN 'Janeiro' WHEN 2 THEN 'Fevereiro' WHEN 3 THEN 'Março'
    WHEN 4 THEN 'Abril' WHEN 5 THEN 'Maio' WHEN 6 THEN 'Junho'
    WHEN 7 THEN 'Julho' WHEN 8 THEN 'Agosto' WHEN 9 THEN 'Setembro'
    WHEN 10 THEN 'Outubro' WHEN 11 THEN 'Novembro' WHEN 12 THEN 'Dezembro'
  END AS nome_mes,
  CASE EXTRACT(MONTH FROM d)
    WHEN 1 THEN 'Jan' WHEN 2 THEN 'Fev' WHEN 3 THEN 'Mar'
    WHEN 4 THEN 'Abr' WHEN 5 THEN 'Mai' WHEN 6 THEN 'Jun'
    WHEN 7 THEN 'Jul' WHEN 8 THEN 'Ago' WHEN 9 THEN 'Set'
    WHEN 10 THEN 'Out' WHEN 11 THEN 'Nov' WHEN 12 THEN 'Dez'
  END AS nome_mes_curto,
  CASE EXTRACT(DOW FROM d)
    WHEN 0 THEN 'Domingo' WHEN 1 THEN 'Segunda-feira' WHEN 2 THEN 'Terça-feira'
    WHEN 3 THEN 'Quarta-feira' WHEN 4 THEN 'Quinta-feira' WHEN 5 THEN 'Sexta-feira'
    WHEN 6 THEN 'Sábado'
  END AS nome_dia_semana,
  CASE EXTRACT(DOW FROM d)
    WHEN 0 THEN 'Dom' WHEN 1 THEN 'Seg' WHEN 2 THEN 'Ter'
    WHEN 3 THEN 'Qua' WHEN 4 THEN 'Qui' WHEN 5 THEN 'Sex'
    WHEN 6 THEN 'Sáb'
  END AS nome_dia_semana_curto,
  EXTRACT(DOW FROM d) IN (0, 6) AS eh_fim_semana,
  EXTRACT(DOW FROM d) NOT IN (0, 6) AS eh_dia_util
FROM generate_series('2020-01-01'::date, '2030-12-31'::date, '1 day'::interval) d;

-- Marcar feriados nacionais brasileiros (exemplo 2024-2025)
UPDATE dim_tempo SET eh_feriado = TRUE, eh_dia_util = FALSE 
WHERE (mes = 1 AND dia_mes = 1) -- Ano Novo
   OR (mes = 4 AND dia_mes = 21) -- Tiradentes
   OR (mes = 5 AND dia_mes = 1) -- Dia do Trabalho
   OR (mes = 9 AND dia_mes = 7) -- Independência
   OR (mes = 10 AND dia_mes = 12) -- Nossa Senhora Aparecida
   OR (mes = 11 AND dia_mes = 2) -- Finados
   OR (mes = 11 AND dia_mes = 15) -- Proclamação da República
   OR (mes = 12 AND dia_mes = 25); -- Natal
```

---

### **1.2. Adicionar Campos Temporais ao Fato**

```sql
ALTER TABLE fato_entidade_contexto 
  ADD COLUMN tempo_id INTEGER REFERENCES dim_tempo(id),
  ADD COLUMN data_qualificacao DATE NOT NULL DEFAULT CURRENT_DATE;

CREATE INDEX idx_fato_contexto_tempo ON fato_entidade_contexto(tempo_id);
CREATE INDEX idx_fato_contexto_data ON fato_entidade_contexto(data_qualificacao);

-- Popular tempo_id baseado em data_qualificacao
UPDATE fato_entidade_contexto 
SET tempo_id = (SELECT id FROM dim_tempo WHERE data = fato_entidade_contexto.data_qualificacao);
```

---

### **1.3. Adicionar Métricas de Negócio ao Fato**

```sql
ALTER TABLE fato_entidade_contexto ADD COLUMN
  -- Métricas Financeiras
  receita_potencial_anual DECIMAL(15,2),
  ticket_medio_estimado DECIMAL(12,2),
  ltv_estimado DECIMAL(15,2), -- Lifetime Value
  cac_estimado DECIMAL(12,2), -- Custo de Aquisição de Cliente
  
  -- Scores e Probabilidades
  score_fit INTEGER CHECK (score_fit BETWEEN 0 AND 100),
  probabilidade_conversao DECIMAL(5,2) CHECK (probabilidade_conversao BETWEEN 0 AND 100),
  score_priorizacao INTEGER CHECK (score_priorizacao BETWEEN 0 AND 100),
  
  -- Ciclo de Venda
  ciclo_venda_estimado_dias INTEGER,
  
  -- Segmentação
  segmento_rfm VARCHAR(3), -- AAA, AAB, etc
  segmento_abc VARCHAR(1) CHECK (segmento_abc IN ('A', 'B', 'C')),
  eh_cliente_ideal BOOLEAN DEFAULT FALSE,
  
  -- Flags de Conversão
  convertido_em_cliente BOOLEAN DEFAULT FALSE,
  data_conversao DATE,
  
  -- Observações Enriquecidas
  justificativa_score TEXT,
  recomendacoes TEXT;

CREATE INDEX idx_fato_contexto_score_fit ON fato_entidade_contexto(score_fit);
CREATE INDEX idx_fato_contexto_receita ON fato_entidade_contexto(receita_potencial_anual);
CREATE INDEX idx_fato_contexto_segmento ON fato_entidade_contexto(segmento_abc);
```

---

### **1.4. Implementar Hierarquias**

```sql
-- Hierarquia Geográfica
ALTER TABLE dim_geografia ADD COLUMN
  pais VARCHAR(50) DEFAULT 'Brasil',
  macrorregiao VARCHAR(50), -- Norte, Nordeste, Centro-Oeste, Sudeste, Sul
  mesorregiao VARCHAR(100),
  microrregiao VARCHAR(100);

-- Popular macrorregiao baseado em UF
UPDATE dim_geografia SET macrorregiao = CASE
  WHEN uf IN ('AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO') THEN 'Norte'
  WHEN uf IN ('AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE') THEN 'Nordeste'
  WHEN uf IN ('DF', 'GO', 'MT', 'MS') THEN 'Centro-Oeste'
  WHEN uf IN ('ES', 'MG', 'RJ', 'SP') THEN 'Sudeste'
  WHEN uf IN ('PR', 'RS', 'SC') THEN 'Sul'
END;

CREATE INDEX idx_geografia_macrorregiao ON dim_geografia(macrorregiao);

-- Hierarquia de Mercado
ALTER TABLE dim_mercado ADD COLUMN
  setor VARCHAR(100), -- Tecnologia, Indústria, Comércio, etc
  subsetor VARCHAR(100), -- Software, Hardware, etc
  nicho VARCHAR(100); -- ERP, CRM, etc

CREATE INDEX idx_mercado_setor ON dim_mercado(setor);
CREATE INDEX idx_mercado_subsetor ON dim_mercado(subsetor);

-- Atualizar mercados existentes (exemplo)
UPDATE dim_mercado SET 
  setor = 'Tecnologia',
  subsetor = 'Software',
  nicho = 'Gestão Empresarial'
WHERE nome LIKE '%ERP%' OR nome LIKE '%Gestão%';
```

---

### **1.5. Criar dim_canal**

```sql
CREATE TABLE dim_canal (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- importacao | enriquecimento_ia | api | manual | indicacao
  descricao TEXT,
  custo_medio DECIMAL(12,2), -- Custo médio por lead deste canal
  taxa_conversao_media DECIMAL(5,2), -- Taxa de conversão histórica
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INTEGER,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INTEGER
);

-- Popular canais padrão
INSERT INTO dim_canal (codigo, nome, tipo, descricao) VALUES
  ('import-csv', 'Importação CSV', 'importacao', 'Leads importados via arquivo CSV'),
  ('import-excel', 'Importação Excel', 'importacao', 'Leads importados via arquivo Excel'),
  ('enrich-ai', 'Enriquecimento IA', 'enriquecimento_ia', 'Leads descobertos via enriquecimento com IA'),
  ('manual', 'Cadastro Manual', 'manual', 'Leads cadastrados manualmente'),
  ('api-externa', 'API Externa', 'api', 'Leads importados via API externa'),
  ('indicacao', 'Indicação', 'indicacao', 'Leads vindos de indicação');

-- Adicionar canal_id ao fato
ALTER TABLE fato_entidade_contexto 
  ADD COLUMN canal_id INTEGER REFERENCES dim_canal(id);

CREATE INDEX idx_fato_contexto_canal ON fato_entidade_contexto(canal_id);
```

---

### **1.6. Adicionar Índices de Performance**

```sql
-- Índices nas tabelas fato
CREATE INDEX idx_fato_contexto_projeto ON fato_entidade_contexto(projeto_id);
CREATE INDEX idx_fato_contexto_pesquisa ON fato_entidade_contexto(pesquisa_id);
CREATE INDEX idx_fato_contexto_entidade ON fato_entidade_contexto(entidade_id);
CREATE INDEX idx_fato_contexto_mercado ON fato_entidade_contexto(mercado_id);
CREATE INDEX idx_fato_contexto_geografia ON fato_entidade_contexto(geografia_id);
CREATE INDEX idx_fato_contexto_status ON fato_entidade_contexto(status_qualificacao_id);
CREATE INDEX idx_fato_contexto_qualidade ON fato_entidade_contexto(qualidade_score);

-- Índices nas dimensões
CREATE INDEX idx_entidade_tipo ON dim_entidade(tipo_entidade);
CREATE INDEX idx_entidade_cnpj ON dim_entidade(cnpj) WHERE cnpj IS NOT NULL;
CREATE INDEX idx_entidade_hash ON dim_entidade(entidade_hash);
CREATE INDEX idx_geografia_uf ON dim_geografia(uf);
CREATE INDEX idx_mercado_hash ON dim_mercado(mercado_hash);
CREATE INDEX idx_produto_hash ON dim_produto(produto_hash);

-- Índices compostos para queries comuns
CREATE INDEX idx_fato_contexto_projeto_pesquisa ON fato_entidade_contexto(projeto_id, pesquisa_id);
CREATE INDEX idx_fato_contexto_mercado_geografia ON fato_entidade_contexto(mercado_id, geografia_id);
CREATE INDEX idx_fato_contexto_tempo_mercado ON fato_entidade_contexto(tempo_id, mercado_id);
```

---

### **1.7. Adicionar Métricas às Tabelas Fato Secundárias**

```sql
-- fato_entidade_produto
ALTER TABLE fato_entidade_produto ADD COLUMN
  volume_vendas_estimado DECIMAL(15,2),
  margem_estimada DECIMAL(5,2), -- %
  penetracao_mercado DECIMAL(5,2), -- %
  eh_produto_principal BOOLEAN DEFAULT FALSE;

-- fato_entidade_competidor
ALTER TABLE fato_entidade_competidor ADD COLUMN
  share_of_voice DECIMAL(5,2), -- %
  vantagem_competitiva_score INTEGER CHECK (vantagem_competitiva_score BETWEEN 0 AND 100),
  ameaca_nivel VARCHAR(20) CHECK (ameaca_nivel IN ('baixa', 'media', 'alta', 'critica'));
```

---

## 📄 ARQUIVOS A CRIAR/ATUALIZAR

### **Migrations SQL**
1. `001_create_dim_tempo.sql`
2. `002_add_temporal_fields.sql`
3. `003_add_business_metrics.sql`
4. `004_add_hierarchies.sql`
5. `005_create_dim_canal.sql`
6. `006_create_indexes.sql`
7. `007_add_secondary_metrics.sql`

### **Schema Drizzle**
1. `drizzle/schema.ts` - Atualizar com todos os novos campos

### **DAL**
1. `server/dal/tempo.dal.ts` - NOVO
2. `server/dal/canal.dal.ts` - NOVO
3. `server/dal/entidade.dal.ts` - ATUALIZAR
4. `server/dal/contexto.dal.ts` - ATUALIZAR

### **Enriquecimento**
1. `server/prompts/p1-cliente.ts` - ATUALIZAR
2. `server/prompts/p2-mercado.ts` - ATUALIZAR
3. `server/prompts/p3-produtos.ts` - ATUALIZAR
4. `server/prompts/p4-concorrentes.ts` - ATUALIZAR
5. `server/prompts/p5-leads.ts` - ATUALIZAR
6. `server/prompts/p6-validacao.ts` - ATUALIZAR
7. `server/lib/calcular-metricas.ts` - NOVO

### **UI**
1. `client/src/pages/Dashboard.tsx` - NOVO
2. `client/src/components/KPICard.tsx` - NOVO
3. `client/src/components/TimelineChart.tsx` - NOVO
4. `client/src/components/HierarchyDrilldown.tsx` - NOVO

---

## 🎯 ORDEM DE EXECUÇÃO

### **DIA 1: Schema e Migrations**
1. Criar migrations SQL
2. Executar migrations no banco
3. Atualizar schema Drizzle
4. Testar schema

### **DIA 2: DAL e Importação**
1. Criar DAL para dim_tempo e dim_canal
2. Atualizar DAL de entidade e contexto
3. Ajustar importação
4. Testar importação

### **DIA 3: Enriquecimento**
1. Atualizar 6 prompts
2. Criar função de cálculo de métricas
3. Atualizar funções de gravação
4. Testar enriquecimento

### **DIA 4: UI**
1. Criar dashboard com KPIs
2. Criar gráficos temporais
3. Implementar drill-down
4. Testar UI

---

**Próximo passo:** Iniciar implementação do schema! 🚀
