# 🚀 PLANO DE IMPLEMENTAÇÃO - IntelMarket v2.0

## 🎯 OBJETIVO

Transformar o IntelMarket em uma plataforma de **Business Intelligence de classe mundial** com:

- ✅ Arquitetura dimensional (Star Schema)
- ✅ Governança de dados completa
- ✅ Performance otimizada (queries <100ms)
- ✅ Qualidade de dados garantida
- ✅ Escalabilidade para milhões de registros

---

## 📋 PRINCÍPIOS DE ENGENHARIA

### 1. **Qualidade de Dados**

- Validação em todas as camadas (banco, API, frontend)
- Auditoria completa (quem, quando, o quê)
- Deduplicação via hash
- Integridade referencial obrigatória

### 2. **Governança**

- Campos padronizados (mesmo nome em todas as tabelas)
- Constraints para validação automática
- Histórico de mudanças (fato_entidades_history)
- Metadados completos (created_at, updated_at, validated_by)

### 3. **Performance**

- Índices compostos otimizados
- Queries com EXPLAIN ANALYZE
- Paginação em todas as listas
- Cache quando apropriado

### 4. **Arquitetura da Informação**

- Cubo dimensional navegável
- Relacionamentos N:N estruturados
- Normalização de dimensões
- Separação fato/dimensão clara

---

## 🏗️ FASES DE IMPLEMENTAÇÃO

---

## **FASE 1: FUNDAÇÃO DE DADOS** ✅ (CONCLUÍDA)

### 1.1. Estrutura do Banco ✅

- [x] Criar dim_geografia (5.570 cidades)
- [x] Criar dim_mercados
- [x] Criar dim_produtos
- [x] Criar fato_entidades (unificada)
- [x] Criar entidade_produtos (N:N)
- [x] Criar entidade_competidores (N:N)
- [x] Criar fato_entidades_history (auditoria)

### 1.2. Integridade e Validação ✅

- [x] PRIMARY KEYs em todas as tabelas
- [x] FOREIGN KEYs obrigatórias
- [x] UNIQUE constraints (hash, compostos)
- [x] CHECK constraints (validação de valores)
- [x] Campo status_qualificacao

### 1.3. Performance ✅

- [x] 20 índices em fato_entidades
- [x] 6 índices compostos com status_qualificacao
- [x] Índices em todas as dimensões
- [x] Índices em relacionamentos N:N

### 1.4. Documentação ✅

- [x] Arquitetura dimensional
- [x] Mapeamento de campos
- [x] Validação estrutural
- [x] Índices otimizados

**STATUS:** ✅ **100% CONCLUÍDA**

---

## **FASE 2: CAMADA DE DADOS (Data Layer)**

### 2.1. Schema Drizzle ORM

**Objetivo:** Atualizar ORM para refletir nova estrutura

**Tarefas:**

- [ ] Substituir `schema.ts` por `schema-new.ts`
- [ ] Adicionar tipos TypeScript para todas as tabelas
- [ ] Criar helpers de query (getClientesAtivos, etc.)
- [ ] Criar migrations Drizzle

**Validação:**

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit push
```

**Critério de Sucesso:**

- ✅ Zero erros de TypeScript
- ✅ Migrations aplicadas sem erro
- ✅ Tipos inferidos corretamente

**Tempo Estimado:** 1-2h

---

### 2.2. Camada de Acesso a Dados (DAL)

**Objetivo:** Criar abstrações para acesso aos dados

**Tarefas:**

- [ ] Criar `server/dal/entidades.ts`
  - `getEntidades(filters)` - query unificada
  - `getClientes(filters)` - wrapper com tipo='cliente'
  - `getLeads(filters)` - wrapper com tipo='lead'
  - `getConcorrentes(filters)` - wrapper com tipo='concorrente'
- [ ] Criar `server/dal/dimensoes.ts`
  - `getGeografiaByCity(cidade, uf)` - buscar/criar geografia
  - `getMercadoByHash(hash)` - buscar/criar mercado
  - `getProdutoByHash(hash)` - buscar/criar produto

- [ ] Criar `server/dal/relacionamentos.ts`
  - `linkEntidadeProduto(entidadeId, produtoId)`
  - `linkEntidadeCompetidor(entidadeId, competidorId, mercadoId)`

**Validação:**

```typescript
// Teste unitário
const clientes = await getClientes({ pesquisaId: 1, status: 'ativo' });
expect(clientes.length).toBeGreaterThan(0);
```

**Critério de Sucesso:**

- ✅ Todas as queries testadas
- ✅ Paginação implementada
- ✅ Filtros funcionando
- ✅ Performance <100ms

**Tempo Estimado:** 3-4h

---

### 2.3. Scripts de Importação

**Objetivo:** Criar pipeline de importação de dados

**Tarefas:**

- [ ] Criar `scripts/import-csv.ts`
  - Ler CSV de clientes
  - Validar campos obrigatórios
  - Buscar/criar geografia_id
  - Buscar/criar mercado_id
  - Gerar entidade_hash (MD5)
  - Inserir em fato_entidades
  - Log de erros e sucessos

- [ ] Criar `scripts/validate-data.ts`
  - Verificar órfãos (sem geografia, sem mercado)
  - Verificar duplicatas (por hash)
  - Verificar integridade referencial
  - Gerar relatório de qualidade

- [ ] Criar `scripts/enrich-missing.ts`
  - Identificar registros sem mercado
  - Identificar registros sem geografia
  - Enriquecer automaticamente
  - Atualizar qualidade_score

**Validação:**

```bash
# Importar CSV de teste
pnpm tsx scripts/import-csv.ts test-data.csv

# Validar qualidade
pnpm tsx scripts/validate-data.ts

# Resultado esperado:
# ✅ 100 registros importados
# ✅ 0 órfãos
# ✅ 0 duplicatas
# ✅ 100% integridade referencial
```

**Critério de Sucesso:**

- ✅ Importação de 1.000 registros em <10s
- ✅ Zero órfãos
- ✅ Zero duplicatas
- ✅ 100% integridade referencial

**Tempo Estimado:** 4-5h

---

### 2.4. Limpeza de Código Obsoleto

**Objetivo:** Remover código, componentes e páginas obsoletas

**Tarefas:**

#### 2.4.1. Identificar Código Obsoleto

- [ ] Listar tabelas antigas não usadas (clientes, leads, concorrentes antigas)
- [ ] Listar routers obsoletos
- [ ] Listar componentes não usados
- [ ] Listar páginas obsoletas
- [ ] Listar imports não utilizados

**Script de Análise:**

```bash
# Encontrar imports não usados
pnpm dlx depcheck

# Encontrar arquivos não referenciados
pnpm dlx unimported

# Análise de código morto
pnpm dlx ts-prune
```

#### 2.4.2. Remover Código Obsoleto

- [ ] **Banco de Dados:**
  - Dropar views antigas (se existirem)
  - Dropar stored procedures obsoletas
  - Documentar tabelas removidas

- [ ] **Backend (server/):**
  - Remover routers obsoletos
  - Remover services não usados
  - Remover helpers antigos
  - Limpar imports não utilizados

- [ ] **Frontend (app/):**
  - Remover páginas obsoletas
  - Remover componentes não usados
  - Remover hooks antigos
  - Limpar CSS não utilizado

- [ ] **Schemas:**
  - Remover `schema-old.ts`
  - Remover tipos TypeScript obsoletos
  - Limpar validações Zod antigas

#### 2.4.3. Refatorar Imports

- [ ] Atualizar todos os imports para nova estrutura
- [ ] Usar path aliases consistentes (@/server, @/shared)
- [ ] Remover imports circulares
- [ ] Organizar imports (externos → internos → relativos)

#### 2.4.4. Documentar Mudanças

- [ ] Criar BREAKING-CHANGES.md
- [ ] Listar arquivos removidos
- [ ] Listar endpoints deprecados
- [ ] Criar guia de migração

**Validação:**

```bash
# Verificar build sem erros
pnpm build

# Verificar TypeScript
pnpm tsc --noEmit

# Verificar linting
pnpm lint

# Verificar testes
pnpm test
```

**Critério de Sucesso:**

- ✅ Build sem warnings
- ✅ Zero imports não utilizados
- ✅ Zero código morto
- ✅ Redução de 20%+ no tamanho do bundle

**Tempo Estimado:** 3-4h

---

## **FASE 3: CAMADA DE API (API Layer)**

### 3.1. Refatorar Routers TRPC

**Objetivo:** Atualizar endpoints para usar nova estrutura

**Tarefas:**

#### 3.1.1. Router: Geoposição

- [ ] Refatorar `server/routers/map-hierarchical.ts`
  - Usar `fato_entidades` + `dim_geografia`
  - Adicionar filtro `status_qualificacao`
  - Otimizar query com índices compostos
  - Adicionar paginação

**Query Exemplo:**

```typescript
const dados = await db
  .select({
    regiao: dimGeografia.regiao,
    uf: dimGeografia.uf,
    cidade: dimGeografia.cidade,
    total: sql<number>`COUNT(*)`,
    ativos: sql<number>`SUM(CASE WHEN ${fatoEntidades.status_qualificacao} = 'ativo' THEN 1 ELSE 0 END)`,
  })
  .from(fatoEntidades)
  .innerJoin(dimGeografia, eq(dimGeografia.id, fatoEntidades.geografia_id))
  .where(and(eq(fatoEntidades.tipo_entidade, 'cliente'), eq(fatoEntidades.pesquisa_id, pesquisaId)))
  .groupBy(dimGeografia.regiao, dimGeografia.uf, dimGeografia.cidade);
```

**Validação:**

```bash
# Testar endpoint
curl http://localhost:3000/api/trpc/mapHierarchical.getByRegion?input={"pesquisaId":1}

# Verificar performance
EXPLAIN ANALYZE SELECT ... (deve usar índice)
```

**Critério de Sucesso:**

- ✅ Query <50ms
- ✅ Usa índice correto
- ✅ Paginação funciona
- ✅ Filtros funcionam

---

#### 3.1.2. Router: Setores

- [ ] Refatorar `server/routers/sector-drill-down.ts`
  - Usar `fato_entidades` + `dim_mercados`
  - Adicionar filtro `status_qualificacao`
  - Drill-down: Categoria → Mercado → Entidades

**Query Exemplo:**

```typescript
const setores = await db
  .select({
    categoria: dimMercados.categoria,
    mercado: dimMercados.nome,
    total_clientes: sql<number>`COUNT(DISTINCT CASE WHEN ${fatoEntidades.tipo_entidade} = 'cliente' THEN ${fatoEntidades.id} END)`,
    total_leads: sql<number>`COUNT(DISTINCT CASE WHEN ${fatoEntidades.tipo_entidade} = 'lead' THEN ${fatoEntidades.id} END)`,
    total_concorrentes: sql<number>`COUNT(DISTINCT CASE WHEN ${fatoEntidades.tipo_entidade} = 'concorrente' THEN ${fatoEntidades.id} END)`,
  })
  .from(fatoEntidades)
  .innerJoin(dimMercados, eq(dimMercados.id, fatoEntidades.mercado_id))
  .where(eq(fatoEntidades.pesquisa_id, pesquisaId))
  .groupBy(dimMercados.categoria, dimMercados.nome);
```

---

#### 3.1.3. Router: Produtos

- [ ] Refatorar `server/routers/product-drill-down.ts`
  - Usar `fato_entidades` + `dim_produtos` + `entidade_produtos`
  - Adicionar filtro `status_qualificacao`
  - Drill-down: Categoria → Produto → Entidades

**Query Exemplo:**

```typescript
const produtos = await db
  .select({
    categoria: dimProdutos.categoria,
    produto: dimProdutos.nome,
    total_entidades: sql<number>`COUNT(DISTINCT ${entidadeProdutos.entidade_id})`,
  })
  .from(dimProdutos)
  .innerJoin(entidadeProdutos, eq(entidadeProdutos.produto_id, dimProdutos.id))
  .innerJoin(fatoEntidades, eq(fatoEntidades.id, entidadeProdutos.entidade_id))
  .where(and(eq(fatoEntidades.pesquisa_id, pesquisaId), eq(fatoEntidades.tipo_entidade, 'cliente')))
  .groupBy(dimProdutos.categoria, dimProdutos.nome);
```

**Tempo Estimado:** 6-8h (todos os routers)

---

### 3.2. Criar Endpoints de Qualidade

**Objetivo:** Expor métricas de qualidade de dados

**Tarefas:**

- [ ] Criar `server/routers/data-quality.ts`
  - `getQualityMetrics(pesquisaId)` - métricas gerais
  - `getOrphans(pesquisaId)` - registros órfãos
  - `getDuplicates(pesquisaId)` - duplicatas
  - `getValidationStatus(pesquisaId)` - status de validação

**Métricas:**

```typescript
{
  total_registros: 1000,
  com_geografia: 950,  // 95%
  com_mercado: 920,    // 92%
  com_produtos: 800,   // 80%
  validados: 600,      // 60%
  qualidade_media: 85, // score médio
  orfaos: 50,          // 5%
  duplicatas: 0        // 0%
}
```

**Tempo Estimado:** 2-3h

---

### 3.3. Revisão e Otimização de Prompts de Enriquecimento

**Objetivo:** Aproveitar nova estrutura para enriquecimento mais rico e preciso

#### 3.3.1. Análise da Estrutura Atual

- [ ] Auditar prompts atuais de enriquecimento
- [ ] Identificar campos subutilizados
- [ ] Mapear oportunidades de melhoria
- [ ] Analisar taxa de sucesso por campo

**Métricas Atuais:**

```typescript
{
  taxa_preenchimento: {
    nome: 100%,
    cnpj: 85%,
    cidade: 70%,
    mercado: 60%,  // ⚠️ Baixo!
    produtos: 30%, // ⚠️ Muito baixo!
    faturamento: 40%, // ⚠️ Baixo!
  }
}
```

---

#### 3.3.2. Redesenhar Prompts de Enriquecimento

**Objetivo:** Aproveitar estrutura dimensional para enriquecimento contextual

##### A) Prompt: Identificação de Mercado

**Antes (limitado):**

```
Identifique o setor da empresa {nome}
```

**Depois (estruturado):**

```
Análise a empresa "{nome}" (CNPJ: {cnpj}, Cidade: {cidade}/{uf}).

Retorne em JSON:
{
  "mercado": {
    "nome": "Nome do mercado específico",
    "categoria": "B2B | B2C | B2B2C",
    "segmentacao": "Segmento detalhado",
    "tamanho_mercado": "Estimativa em R$",
    "crescimento_anual": "% de crescimento",
    "tendencias": ["tendência 1", "tendência 2"],
    "principais_players": ["player 1", "player 2"]
  },
  "confianca": 0-100
}
```

**Validação:**

- ✅ Buscar mercado existente por hash
- ✅ Criar novo mercado se não existir
- ✅ Vincular entidade ao mercado
- ✅ Registrar confiança do enriquecimento

---

##### B) Prompt: Identificação de Produtos

**Antes (limitado):**

```
Quais produtos a empresa {nome} oferece?
```

**Depois (estruturado):**

```
Análise os produtos/serviços da empresa "{nome}" (Mercado: {mercado.nome}, Site: {site}).

Retorne em JSON:
{
  "produtos": [
    {
      "nome": "Nome do produto",
      "categoria": "Categoria do produto",
      "descricao": "Descrição detalhada",
      "preco": "Faixa de preço (se disponível)",
      "unidade": "unidade | kg | litro | m² | serviço",
      "ativo": true,
      "tipo_relacao": "fabrica | vende | distribui | usa"
    }
  ],
  "confianca": 0-100
}
```

**Validação:**

- ✅ Buscar produto existente por hash
- ✅ Criar novo produto se não existir
- ✅ Vincular entidade ao produto (N:N)
- ✅ Registrar tipo de relação

---

##### C) Prompt: Identificação de Concorrentes

**Antes (não existia):**

```
(sem enriquecimento de concorrentes)
```

**Depois (estruturado):**

```
Identifique os 5 principais concorrentes diretos da empresa "{nome}" no mercado "{mercado.nome}" em {cidade}/{uf}.

Retorne em JSON:
{
  "concorrentes": [
    {
      "nome": "Nome do concorrente",
      "cnpj": "CNPJ (se disponível)",
      "cidade": "Cidade",
      "uf": "UF",
      "site": "URL do site",
      "nivel_competicao": "direto | indireto | substituto",
      "diferencial": "Principal diferencial competitivo"
    }
  ],
  "confianca": 0-100
}
```

**Validação:**

- ✅ Buscar concorrente existente por hash
- ✅ Criar novo concorrente em fato_entidades (tipo='concorrente')
- ✅ Vincular via entidade_competidores (N:N)
- ✅ Registrar nível de competição

---

##### D) Prompt: Enriquecimento Financeiro

**Antes (limitado):**

```
Qual o faturamento da empresa {nome}?
```

**Depois (estruturado):**

```
Análise financeira da empresa "{nome}" (CNPJ: {cnpj}, Porte: {porte}, Mercado: {mercado.nome}).

Retorne em JSON:
{
  "financeiro": {
    "faturamento_declarado": "Valor oficial (se disponível)",
    "faturamento_estimado": "Estimativa baseada em porte/mercado",
    "numero_estabelecimentos": "Quantidade de unidades",
    "numero_funcionarios": "Estimativa de funcionários",
    "fonte": "Receita Federal | Estimativa | Site da empresa"
  },
  "confianca": 0-100
}
```

---

##### E) Prompt: Cálculo de Qualidade

**Novo (não existia):**

```
Avalie a qualidade dos dados da entidade "{nome}":

Dados disponíveis:
- Nome: {nome}
- CNPJ: {cnpj}
- Geografia: {cidade}/{uf}
- Mercado: {mercado.nome}
- Produtos: {produtos.length} produtos
- Contatos: Email={email}, Telefone={telefone}, Site={site}
- Redes: LinkedIn={linkedin}, Instagram={instagram}
- Financeiro: Faturamento={faturamento}

Retorne em JSON:
{
  "qualidade_score": 0-100,
  "qualidade_classificacao": "A | B | C | D",
  "campos_faltantes": ["campo1", "campo2"],
  "campos_duvidosos": ["campo3"],
  "sugestoes_melhoria": ["sugestão 1", "sugestão 2"]
}

Critérios:
- A (90-100): Dados completos e verificados
- B (70-89): Dados completos, alguns não verificados
- C (50-69): Dados parciais, necessita enriquecimento
- D (0-49): Dados insuficientes
```

---

#### 3.3.3. Implementar Sistema de Enriquecimento em Camadas

**Objetivo:** Enriquecimento progressivo e contextual

**Camadas:**

1. **Camada 1: Dados Básicos** (obrigatório)
   - Nome, CNPJ, Geografia
   - Qualidade mínima: 40%

2. **Camada 2: Contexto de Mercado** (importante)
   - Mercado, Segmentação, Porte
   - Qualidade mínima: 60%

3. **Camada 3: Produtos e Serviços** (importante)
   - Produtos, Tipo de relação
   - Qualidade mínima: 70%

4. **Camada 4: Competição** (opcional)
   - Concorrentes, Nível de competição
   - Qualidade mínima: 80%

5. **Camada 5: Financeiro** (opcional)
   - Faturamento, Estabelecimentos
   - Qualidade mínima: 90%

**Fluxo:**

```typescript
async function enrichEntity(entidadeId: number) {
  // Camada 1: Básico
  const basico = await enrichBasico(entidadeId);
  if (basico.qualidade < 40) throw new Error('Dados básicos insuficientes');

  // Camada 2: Mercado (usa dados da Camada 1)
  const mercado = await enrichMercado(entidadeId, basico);

  // Camada 3: Produtos (usa dados da Camada 2)
  const produtos = await enrichProdutos(entidadeId, mercado);

  // Camada 4: Concorrentes (usa dados da Camada 2)
  const concorrentes = await enrichConcorrentes(entidadeId, mercado);

  // Camada 5: Financeiro (usa dados de todas as camadas)
  const financeiro = await enrichFinanceiro(entidadeId, { basico, mercado, produtos });

  // Calcular qualidade final
  const qualidade = calcularQualidade({ basico, mercado, produtos, concorrentes, financeiro });

  return qualidade;
}
```

---

#### 3.3.4. Implementar Cache Inteligente

**Objetivo:** Evitar re-enriquecimento desnecessário

**Estratégias:**

1. **Cache por Hash:**
   - Mercado: cache por `mercado_hash`
   - Produto: cache por `produto_hash`
   - Entidade: cache por `entidade_hash`

2. **Cache Temporal:**
   - Dados básicos: cache 30 dias
   - Dados de mercado: cache 90 dias
   - Dados financeiros: cache 180 dias

3. **Cache Contextual:**
   - Se CNPJ existe → buscar dados da Receita Federal (cache permanente)
   - Se cidade existe → buscar em dim_geografia (cache permanente)
   - Se mercado existe → reusar (cache permanente)

**Implementação:**

```typescript
async function getMercadoOrEnrich(nome: string, categoria: string) {
  const hash = md5(`${nome}-${categoria}`);

  // Buscar em cache (dim_mercados)
  const cached = await db
    .select()
    .from(dimMercados)
    .where(eq(dimMercados.mercado_hash, hash))
    .limit(1);

  if (cached.length > 0) {
    return cached[0]; // ✅ Cache hit!
  }

  // Enriquecer
  const enriched = await llm.enrich(`Analise o mercado "${nome}" categoria "${categoria}"...`);

  // Salvar em cache
  const [mercado] = await db
    .insert(dimMercados)
    .values({ ...enriched, mercado_hash: hash })
    .returning();

  return mercado;
}
```

---

#### 3.3.5. Implementar Validação Cruzada

**Objetivo:** Aumentar confiança dos dados

**Estratégias:**

1. **Validação por Múltiplas Fontes:**

   ```typescript
   const faturamento1 = await enrichFromSource1(cnpj);
   const faturamento2 = await enrichFromSource2(cnpj);
   const faturamento3 = await enrichFromSource3(cnpj);

   // Se 2+ fontes concordam → alta confiança
   if (faturamento1 === faturamento2 || faturamento1 === faturamento3) {
     return { valor: faturamento1, confianca: 90 };
   }

   // Se todas divergem → baixa confiança
   return { valor: median([faturamento1, faturamento2, faturamento3]), confianca: 50 };
   ```

2. **Validação por Regras de Negócio:**

   ```typescript
   // Regra: Faturamento deve ser compatível com porte
   if (porte === 'MEI' && faturamento > 81000) {
     return { erro: 'Faturamento incompatível com porte MEI', confianca: 0 };
   }
   ```

3. **Validação por Contexto:**
   ```typescript
   // Regra: Mercado deve ser compatível com CNAE
   const cnaeEsperado = getCNAEByMercado(mercado.nome);
   if (cnae !== cnaeEsperado) {
     return { warning: 'CNAE diverge do mercado', confianca: 60 };
   }
   ```

---

#### 3.3.6. Criar Dashboard de Enriquecimento

**Objetivo:** Monitorar qualidade do enriquecimento

**Métricas:**

- Taxa de sucesso por campo
- Tempo médio de enriquecimento
- Confiança média por camada
- Custo de API por registro
- Taxa de cache hit

**Implementação:**

```typescript
// server/routers/enrichment-metrics.ts
export const enrichmentMetrics = {
  getTaxaSucesso: async (pesquisaId: number) => {
    return db
      .select({
        campo: sql<string>`'nome'`,
        preenchidos: sql<number>`COUNT(*) FILTER (WHERE nome IS NOT NULL)`,
        total: sql<number>`COUNT(*)`,
        taxa: sql<number>`ROUND(COUNT(*) FILTER (WHERE nome IS NOT NULL)::numeric / COUNT(*) * 100, 2)`,
      })
      .from(fatoEntidades)
      .where(eq(fatoEntidades.pesquisa_id, pesquisaId));
  },

  getQualidadeMedia: async (pesquisaId: number) => {
    return db
      .select({
        qualidade_media: sql<number>`AVG(qualidade_score)`,
        classificacao_a: sql<number>`COUNT(*) FILTER (WHERE qualidade_classificacao = 'A')`,
        classificacao_b: sql<number>`COUNT(*) FILTER (WHERE qualidade_classificacao = 'B')`,
        classificacao_c: sql<number>`COUNT(*) FILTER (WHERE qualidade_classificacao = 'C')`,
        classificacao_d: sql<number>`COUNT(*) FILTER (WHERE qualidade_classificacao = 'D')`,
      })
      .from(fatoEntidades)
      .where(eq(fatoEntidades.pesquisa_id, pesquisaId));
  },
};
```

---

**Validação:**

```bash
# Testar enriquecimento de 100 registros
pnpm tsx scripts/test-enrichment.ts

# Resultado esperado:
# ✅ Camada 1 (Básico): 100% sucesso
# ✅ Camada 2 (Mercado): 95%+ sucesso
# ✅ Camada 3 (Produtos): 80%+ sucesso
# ✅ Camada 4 (Concorrentes): 70%+ sucesso
# ✅ Camada 5 (Financeiro): 60%+ sucesso
# ✅ Qualidade média: 75+ (classificação B)
# ✅ Tempo médio: <5s por registro
# ✅ Taxa de cache hit: 60%+
```

**Critério de Sucesso:**

- ✅ Taxa de preenchimento de mercado: 95%+
- ✅ Taxa de preenchimento de produtos: 80%+
- ✅ Qualidade média: 75+ (B)
- ✅ Tempo de enriquecimento: <5s/registro
- ✅ Taxa de cache hit: 60%+
- ✅ Custo de API: <R$0,10/registro

**Tempo Estimado:** 8-10h

---

## **FASE 4: CAMADA DE APRESENTAÇÃO (UI Layer)**

### 4.1. Atualizar Componentes

**Objetivo:** Refatorar frontend para usar novos endpoints

**Tarefas:**

#### 4.1.1. Página: Geoposição

- [ ] Atualizar `app/(app)/map/page.tsx`
  - Adicionar filtro de status_qualificacao
  - Atualizar tipos TypeScript
  - Adicionar indicadores de qualidade
  - Mostrar métricas (ativos/inativos/prospects)

#### 4.1.2. Página: Setores

- [ ] Atualizar `app/(app)/sectors/page.tsx`
  - Adicionar filtro de status_qualificacao
  - Mostrar drill-down: Categoria → Mercado → Entidades
  - Adicionar gráficos (clientes/leads/concorrentes)

#### 4.1.3. Página: Produtos

- [ ] Atualizar `app/(app)/products/page.tsx`
  - Adicionar filtro de status_qualificacao
  - Mostrar drill-down: Categoria → Produto → Entidades
  - Adicionar relacionamento N:N visual

#### 4.1.4. Nova Página: Qualidade de Dados

- [ ] Criar `app/(app)/data-quality/page.tsx`
  - Dashboard de qualidade
  - Lista de órfãos
  - Lista de duplicatas
  - Ações de correção

**Tempo Estimado:** 8-10h

---

### 4.2. Componentes Reutilizáveis

**Objetivo:** Criar componentes para drill-down

**Tarefas:**

- [ ] Criar `components/DrillDownTable.tsx`
  - Tabela com expansão hierárquica
  - Filtros integrados
  - Paginação
  - Export (CSV, Excel)

- [ ] Criar `components/StatusFilter.tsx`
  - Filtro de status_qualificacao
  - Multi-seleção
  - Contadores por status

- [ ] Criar `components/QualityIndicator.tsx`
  - Badge de qualidade (A/B/C/D)
  - Tooltip com detalhes
  - Cor baseada em score

**Tempo Estimado:** 4-5h

---

## **FASE 5: TESTES E VALIDAÇÃO**

### 5.1. Testes Unitários

**Objetivo:** Garantir qualidade do código

**Tarefas:**

- [ ] Testar DAL (server/dal/\*.test.ts)
- [ ] Testar Routers (server/routers/\*.test.ts)
- [ ] Testar Scripts (scripts/\*.test.ts)

**Cobertura Mínima:** 80%

**Tempo Estimado:** 6-8h

---

### 5.2. Testes de Performance

**Objetivo:** Validar performance de queries

**Tarefas:**

- [ ] Criar `scripts/benchmark.ts`
  - Testar queries com 1k, 10k, 100k registros
  - Medir tempo de resposta
  - Verificar uso de índices (EXPLAIN ANALYZE)
  - Gerar relatório

**Critérios:**

- ✅ Query simples: <50ms
- ✅ Query com JOIN: <100ms
- ✅ Query com agregação: <200ms
- ✅ Drill-down completo: <500ms

**Tempo Estimado:** 3-4h

---

### 5.3. Testes de Integração

**Objetivo:** Validar fluxo completo

**Tarefas:**

- [ ] Testar importação → visualização
- [ ] Testar drill-down em todas as páginas
- [ ] Testar filtros combinados
- [ ] Testar paginação
- [ ] Testar export

**Tempo Estimado:** 4-5h

---

### 5.4. Testes de Qualidade de Dados

**Objetivo:** Validar integridade

**Tarefas:**

- [ ] Importar base real (10k registros)
- [ ] Verificar órfãos (deve ser 0%)
- [ ] Verificar duplicatas (deve ser 0%)
- [ ] Verificar integridade referencial (deve ser 100%)
- [ ] Verificar performance (queries <100ms)

**Tempo Estimado:** 2-3h

---

## **FASE 6: DOCUMENTAÇÃO E DEPLOY**

### 6.1. Documentação Técnica

**Objetivo:** Documentar arquitetura e uso

**Tarefas:**

- [ ] Atualizar README.md
- [ ] Criar ARCHITECTURE.md
- [ ] Criar DATA-DICTIONARY.md (dicionário de dados)
- [ ] Criar API-REFERENCE.md
- [ ] Criar IMPORT-GUIDE.md (guia de importação)

**Tempo Estimado:** 4-5h

---

### 6.2. Documentação de Usuário

**Objetivo:** Guias para usuários finais

**Tarefas:**

- [ ] Criar USER-GUIDE.md
- [ ] Criar vídeo tutorial (importação)
- [ ] Criar vídeo tutorial (drill-down)
- [ ] Criar FAQ

**Tempo Estimado:** 3-4h

---

### 6.3. Deploy e Rollout

**Objetivo:** Colocar v2.0 em produção

**Tarefas:**

- [ ] Criar checkpoint final
- [ ] Testar em staging
- [ ] Migrar dados de produção
- [ ] Deploy em produção
- [ ] Monitorar performance
- [ ] Coletar feedback

**Tempo Estimado:** 2-3h

---

## 📊 RESUMO DE TEMPO

| Fase                              | Tempo Estimado | Status            |
| --------------------------------- | -------------- | ----------------- |
| **FASE 1:** Fundação de Dados     | 8-10h          | ✅ CONCLUÍDA      |
| **FASE 2:** Camada de Dados       | 15-20h         | ⏳ Pendente       |
| **FASE 3:** Camada de API         | 16-21h         | ⏳ Pendente       |
| **FASE 4:** Camada de UI          | 12-15h         | ⏳ Pendente       |
| **FASE 5:** Testes e Validação    | 15-20h         | ⏳ Pendente       |
| **FASE 6:** Documentação e Deploy | 9-12h          | ⏳ Pendente       |
| **TOTAL**                         | **74-96h**     | **10% Concluído** |

---

## 🎯 CRITÉRIOS DE SUCESSO FINAL

### Performance:

- ✅ Queries <100ms (média)
- ✅ Drill-down completo <500ms
- ✅ Importação: 1.000 registros/segundo

### Qualidade:

- ✅ 0% órfãos
- ✅ 0% duplicatas
- ✅ 100% integridade referencial
- ✅ 80%+ cobertura de testes

### Governança:

- ✅ Auditoria completa (quem, quando, o quê)
- ✅ Validação em todas as camadas
- ✅ Documentação completa

### Escalabilidade:

- ✅ Suporta 1M+ registros
- ✅ Performance linear
- ✅ Índices otimizados

---

## 🚀 PRÓXIMO PASSO

**Você aprova este plano?**

Se sim, começamos pela **FASE 2.1: Schema Drizzle ORM** (1-2h)

Vamos avançar passo a passo com validação em cada etapa! 🎯
