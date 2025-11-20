# 📊 Análise Completa da Estrutura do Banco de Dados

## Gestor PAV - Pesquisa de Mercado

---

## 🗂️ ESTRUTURA DE TABELAS

### 1. **TABELAS CORE (Sistema)**

#### `users` 
**Função:** Autenticação e controle de acesso  
**Registros:** Variável (usuários do sistema)  
**Campos principais:**
- `id` (PK)
- `name`, `email`
- `role` (user/admin)
- `loginMethod`

#### `projects`
**Função:** Workspaces/projetos separados  
**Registros:** 1 (projeto "Agro")  
**Campos principais:**
- `id` (PK)
- `nome`, `descricao`
- `cor` (hex color)
- `ativo` (1/0)

---

### 2. **TABELAS DE DADOS PRINCIPAIS**

#### `clientes` ⭐ **TABELA CENTRAL**
**Função:** Base de clientes originais (importados)  
**Registros:** **806 clientes**  
**Status atual:** Todos limpos (sem enriquecimento)

**Campos de dados originais:**
- ✅ `nome` - 806 (100%)
- ✅ `cnpj` - [verificar %]
- ✅ `siteOficial` - [verificar %]
- ✅ `produtoPrincipal` - [verificar %]
- ✅ `cidade` - [verificar %]
- ⚠️ `email` - [verificar %]
- ⚠️ `telefone` - [verificar %]

**Campos de enriquecimento:**
- `qualidadeScore` - NULL (após limpeza)
- `qualidadeClassificacao` - NULL (após limpeza)
- `validationStatus` - NULL (após limpeza)
- `validatedBy`, `validatedAt` - NULL

**Campos adicionais:**
- `segmentacaoB2bB2c`, `linkedin`, `instagram`
- `uf`, `regiao`, `cnae`, `porte`
- `faturamentoDeclarado`, `numeroEstabelecimentos`
- `clienteHash` (unicidade)

---

#### `mercados_unicos`
**Função:** Mercados identificados durante enriquecimento  
**Registros:** **0** (limpo)  
**Relação:** 1 mercado → N clientes (via `clientes_mercados`)

**Campos:**
- `nome` (ex: "Agronegócio", "Varejo Alimentício")
- `segmentacao` (B2B/B2C/B2G)
- `categoria`
- `tamanhoMercado`, `crescimentoAnual`, `tendencias`
- `principaisPlayers`
- `quantidadeClientes` (contador)
- `mercadoHash` (unicidade)

---

#### `clientes_mercados` (Junction Table)
**Função:** Associação N:N entre clientes e mercados  
**Registros:** **0** (limpo)  
**Relação:** 1 cliente pode atuar em múltiplos mercados

---

#### `produtos`
**Função:** Produtos/serviços dos clientes por mercado  
**Registros:** **0** (limpo)  
**Relação:** 1 cliente → N produtos por mercado

**Campos:**
- `nome`, `descricao`, `categoria`
- `preco`, `unidade`
- ⚠️ **`ativo`** - Campo que estava com bug (sempre 0)
  - ✅ **BUG FIX 3:** Agora setado como 1 por padrão

---

#### `concorrentes`
**Função:** Concorrentes identificados por mercado  
**Registros:** **0** (limpo)  
**Relação:** 1 mercado → N concorrentes

**Campos:**
- `nome`, `cnpj`, `site`
- ⚠️ **`produto`** - Campo que estava vazio
  - ✅ **BUG FIX 1:** Agora usa `concorrenteData.descricao` da OpenAI
- `cidade`, `uf`, `porte`
- `faturamentoEstimado`, `faturamentoDeclarado`
- ⚠️ **`qualidadeScore`** - Sempre 65
  - ✅ **BUG FIX 2:** Agora calcula com 6 critérios (50-100)
- ✅ **`qualidadeClassificacao`** - Novo campo (Excelente/Bom/Regular/Ruim)
- `validationStatus`, `validatedBy`, `validatedAt`
- `concorrenteHash` (unicidade)

---

#### `leads`
**Função:** Leads potenciais identificados por mercado  
**Registros:** **0** (limpo)  
**Relação:** 1 mercado → N leads

**Campos:**
- `nome`, `cnpj`, `site`, `email`, `telefone`
- `tipo` (potencial: Alto/Médio/Baixo)
- `cidade`, `uf`, `regiao`, `setor`, `porte`
- ⚠️ **`qualidadeScore`** - Sempre 65
  - ✅ **BUG FIX 2:** Agora calcula com 6 critérios (50-100)
- ✅ **`qualidadeClassificacao`** - Novo campo
- ✅ **`stage`** - Novo campo (novo/em_contato/negociacao/fechado/perdido)
- `validationStatus`, `validatedBy`, `validatedAt`
- `leadHash` (unicidade)

---

### 3. **TABELAS DE ORGANIZAÇÃO**

#### `tags`
**Função:** Tags personalizadas para organização  
**Registros:** 0  
**Uso:** Categorização flexível de entidades

#### `entity_tags` (Junction Table)
**Função:** Associação entidades ↔ tags  
**Registros:** 0  
**Suporta:** mercado, cliente, concorrente, lead

#### `saved_filters`
**Função:** Filtros salvos por usuário  
**Registros:** 0  
**Uso:** Salvar combinações de filtros complexas

---

### 4. **TABELAS DE SISTEMA**

#### `notifications`
**Função:** Notificações e alertas  
**Registros:** 0  
**Uso:** Alertas de enriquecimento, validações, etc.

#### `project_templates`
**Função:** Templates de configuração de projetos  
**Registros:** 0  
**Uso:** Reutilizar configurações

---

## 🔍 ANÁLISE DE QUALIDADE DOS DADOS ORIGINAIS

### Clientes (806 total)

| Campo | Quantidade | % Preenchido | Status |
|-------|------------|--------------|--------|
| Nome | 806 | 100% | ✅ Completo |
| CNPJ | ? | ?% | ⚠️ Verificar |
| Site Oficial | ? | ?% | ⚠️ Verificar |
| Produto Principal | ? | ?% | ⚠️ Verificar |
| Cidade | ? | ?% | ⚠️ Verificar |
| Email | ? | ?% | ⚠️ Verificar |
| Telefone | ? | ?% | ⚠️ Verificar |
| Quality Score | 0 | 0% | ✅ Limpo (será calculado) |
| Classificação | 0 | 0% | ✅ Limpo (será calculado) |

---

## 🚨 PROBLEMAS IDENTIFICADOS

### ❌ **PROBLEMA CRÍTICO: Campos dos clientes originais podem estar vazios**

**Sintoma:** Não sabemos a qualidade dos dados originais dos 806 clientes

**Campos em risco:**
1. `cnpj` - Essencial para validação ReceitaWS
2. `siteOficial` - Importante para enriquecimento
3. `produtoPrincipal` - Essencial para identificar mercados
4. `cidade` - Importante para segmentação regional
5. `email`, `telefone` - Importantes para contato

**Impacto:**
- Se muitos clientes não têm CNPJ → Não podemos validar com ReceitaWS
- Se muitos não têm produto → Dificulta identificação de mercados
- Se muitos não têm cidade → Dificulta análise regional

**Ação necessária:**
✅ Executar query de análise de qualidade dos dados originais
✅ Identificar % de preenchimento de cada campo crítico
✅ Decidir estratégia de enriquecimento baseado na qualidade

---

## 📋 FLUXO DE ENRIQUECIMENTO ATUAL

### Entrada:
- **806 clientes** com dados básicos (nome, cnpj?, produto?, cidade?)

### Processo (enrichmentOptimized.ts):
1. **Identificar mercados** (via OpenAI)
   - Analisa nome + produto principal
   - Cria registros em `mercados_unicos`
   - Associa em `clientes_mercados`

2. **Criar produtos** (via OpenAI)
   - Lista produtos/serviços do cliente
   - Cria registros em `produtos`
   - ✅ Campo `ativo` = 1 (corrigido)

3. **Encontrar concorrentes** (via OpenAI)
   - Identifica concorrentes diretos por mercado
   - Cria registros em `concorrentes`
   - ✅ Campo `produto` preenchido (corrigido)
   - ✅ Quality score calculado (corrigido)

4. **Gerar leads** (via OpenAI)
   - Identifica potenciais clientes por mercado
   - Cria registros em `leads`
   - ✅ Quality score calculado (corrigido)
   - ✅ Stage inicial = 'novo' (corrigido)

### Saída esperada:
- **806 clientes** enriquecidos
- **~200-300 mercados** únicos
- **~1500-2000 produtos**
- **~1500-2000 concorrentes**
- **~1500-2000 leads**

---

## ✅ CORREÇÕES APLICADAS (Checkpoint 99e73081)

### Bug Fix 1: Campo produto em concorrentes
**Antes:** `produto` sempre vazio  
**Depois:** Usa `concorrenteData.descricao` retornado pela OpenAI

### Bug Fix 2: Quality Score melhorado
**Antes:** Sempre 65 (fixo)  
**Depois:** Calcula com 6 critérios (50-100)
- hasNome (+10)
- hasProduto (+15)
- hasPorte (+10)
- hasCidade (+5)
- hasSite (+5)
- hasCNPJ (+5)

**Classificação automática:**
- 90-100: Excelente
- 75-89: Bom
- 60-74: Regular
- <60: Ruim

### Bug Fix 3: Campo ativo em produtos
**Antes:** Sempre 0 (inativo)  
**Depois:** Sempre 1 (ativo) por padrão

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

### 1. **URGENTE: Analisar qualidade dos dados originais**
```sql
-- Executar query de análise completa
SELECT 
  'Com CNPJ' as campo,
  COUNT(*) as quantidade,
  ROUND(COUNT(*) * 100.0 / 806, 1) as percentual
FROM clientes
WHERE projectId = 1 AND cnpj IS NOT NULL AND cnpj != '';
-- Repetir para todos os campos críticos
```

### 2. **Validar estratégia de enriquecimento**
- Se <50% tem CNPJ → Não usar ReceitaWS
- Se <70% tem produto → Melhorar prompt OpenAI
- Se <50% tem cidade → Adicionar enriquecimento de localização

### 3. **Testar enriquecimento com 5 clientes**
- Validar 3 bugs corrigidos
- Verificar qualidade dos dados gerados
- Ajustar prompts se necessário

### 4. **Enriquecimento em massa (806 clientes)**
- Usar `enrichClientesParallel()`
- Monitorar progresso
- Validar resultados

---

## 📊 MÉTRICAS DE SUCESSO

### Qualidade dos dados enriquecidos:
- ✅ 100% produtos com campo `ativo` = 1
- ✅ 100% concorrentes com campo `produto` preenchido
- ✅ Quality scores variando entre 50-100 (não fixo em 65)
- ✅ Classificações distribuídas (Excelente/Bom/Regular/Ruim)

### Volume esperado:
- 806 clientes enriquecidos
- ~200-300 mercados únicos
- ~1500-2000 produtos
- ~1500-2000 concorrentes
- ~1500-2000 leads

### Performance:
- ~60s por cliente (1 chamada OpenAI)
- ~48.600s total (~13.5 horas para 806 clientes)
- Processamento paralelo (5 clientes simultâneos)
- Tempo real: ~2.7 horas

---

**Documento gerado em:** 2024-01-XX  
**Versão do sistema:** 99e73081  
**Status:** Base limpa, pronta para enriquecimento
