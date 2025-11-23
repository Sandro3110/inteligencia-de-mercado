# Estrutura Completa do Banco de Dados - Gestor PAV

## 📊 Visão Geral

O banco possui **11 tabelas principais** organizadas em 4 categorias:

1. **Autenticação**: users
2. **Organização**: projects, tags, entity_tags, saved_filters, project_templates, notifications
3. **Entidades de Negócio**: mercados_unicos, clientes, concorrentes, leads
4. **Relacionamentos**: clientes_mercados
5. **Cache**: enrichment_cache

---

## 🎯 Tabelas de Entidades de Negócio (Foco do Enriquecimento)

### 1. **MERCADOS_UNICOS** (Mercados)

Tabela central que agrupa clientes, concorrentes e leads por segmento de mercado.

**Campos para preencher:**

- ✅ `id` - Auto-incremento
- ✅ `projectId` - ID do projeto
- ✅ `mercadoHash` - Hash único (nome normalizado)
- ✅ `nome` - Nome do mercado (ex: "Embalagens Plásticas B2B")
- ⚠️ `segmentacao` - B2B, B2C ou B2B2C
- ⚠️ `categoria` - Categoria principal (ex: "Indústria", "Comércio")
- ⚠️ `tamanhoMercado` - Tamanho estimado em R$ ou unidades
- ⚠️ `crescimentoAnual` - Taxa de crescimento anual (%)
- ⚠️ `tendencias` - Tendências do mercado (texto livre)
- ⚠️ `principaisPlayers` - Principais empresas do mercado
- ✅ `quantidadeClientes` - Contador automático
- ✅ `createdAt` - Data de criação

**Campos vazios atualmente:** segmentacao, categoria, tamanhoMercado, crescimentoAnual, tendencias, principaisPlayers

---

### 2. **CLIENTES** (Clientes)

Empresas que são clientes da PAV.

**Campos para preencher:**

- ✅ `id` - Auto-incremento
- ✅ `projectId` - ID do projeto
- ✅ `clienteHash` - Hash único (nome + CNPJ + projectId)
- ✅ `nome` - Razão social
- ✅ `cnpj` - CNPJ formatado
- ⚠️ `siteOficial` - URL do site
- ⚠️ `produtoPrincipal` - Produto/serviço principal
- ⚠️ `segmentacaoB2bB2c` - B2B, B2C ou B2B2C
- ⚠️ `email` - Email corporativo
- ⚠️ `telefone` - Telefone principal
- ⚠️ `linkedin` - URL do LinkedIn
- ⚠️ `instagram` - URL do Instagram
- ⚠️ `cidade` - Cidade
- ⚠️ `uf` - Estado (sigla)
- ⚠️ `cnae` - Código CNAE principal
- ⚠️ `porte` - Micro, Pequena, Média, Grande
- ⚠️ `qualidadeScore` - Score de 0-100
- ⚠️ `qualidadeClassificacao` - Baixa, Média, Alta
- ✅ `validationStatus` - pending, rich, needs_adjustment, discarded
- ⚠️ `validationNotes` - Notas de validação
- ⚠️ `validatedBy` - ID do usuário que validou
- ⚠️ `validatedAt` - Data de validação
- ✅ `createdAt` - Data de criação

**Campos vazios atualmente:** siteOficial, produtoPrincipal, segmentacaoB2bB2c, email, telefone, linkedin, instagram, cidade, uf, cnae, porte, qualidadeScore, qualidadeClassificacao

---

### 3. **CONCORRENTES** (Concorrentes)

Empresas concorrentes identificadas por mercado.

**Campos para preencher:**

- ✅ `id` - Auto-incremento
- ✅ `projectId` - ID do projeto
- ✅ `concorrenteHash` - Hash único (nome + CNPJ + projectId)
- ✅ `mercadoId` - ID do mercado
- ✅ `nome` - Nome da empresa
- ⚠️ `cnpj` - CNPJ formatado
- ⚠️ `site` - URL do site
- ⚠️ `produto` - Produtos/serviços oferecidos
- ⚠️ `porte` - Micro, Pequena, Média, Grande
- ⚠️ `faturamentoEstimado` - Faturamento anual estimado
- ⚠️ `qualidadeScore` - Score de 0-100
- ⚠️ `qualidadeClassificacao` - Baixa, Média, Alta
- ✅ `validationStatus` - pending, rich, needs_adjustment, discarded
- ⚠️ `validationNotes` - Notas de validação
- ⚠️ `validatedBy` - ID do usuário que validou
- ⚠️ `validatedAt` - Data de validação
- ✅ `createdAt` - Data de criação

**Campos vazios atualmente:** cnpj, site, produto, porte, faturamentoEstimado, qualidadeScore, qualidadeClassificacao

---

### 4. **LEADS** (Leads B2B)

Potenciais clientes identificados por mercado.

**Campos para preencher:**

- ✅ `id` - Auto-incremento
- ✅ `projectId` - ID do projeto
- ✅ `leadHash` - Hash único (nome + CNPJ + projectId)
- ✅ `mercadoId` - ID do mercado
- ✅ `nome` - Nome da empresa
- ⚠️ `cnpj` - CNPJ formatado
- ⚠️ `site` - URL do site
- ⚠️ `email` - Email de contato
- ⚠️ `telefone` - Telefone de contato
- ⚠️ `tipo` - fornecedor, distribuidor, parceiro
- ⚠️ `porte` - Micro, Pequena, Média, Grande
- ⚠️ `regiao` - Região geográfica
- ⚠️ `setor` - Setor de atuação
- ⚠️ `qualidadeScore` - Score de 0-100
- ⚠️ `qualidadeClassificacao` - Baixa, Média, Alta
- ✅ `stage` - novo, em_contato, negociacao, fechado, perdido
- ✅ `stageUpdatedAt` - Data de atualização do stage
- ✅ `validationStatus` - pending, rich, needs_adjustment, discarded
- ⚠️ `validationNotes` - Notas de validação
- ⚠️ `validatedBy` - ID do usuário que validou
- ⚠️ `validatedAt` - Data de validação
- ✅ `createdAt` - Data de criação

**Campos vazios atualmente:** cnpj, site, email, telefone, tipo, porte, regiao, setor, qualidadeScore, qualidadeClassificacao

---

## 🎯 Estratégia de Enriquecimento com Gemini

### Fontes de Dados

1. **ReceitaWS** (via cache) - CNPJ, razão social, porte, CNAE, endereço
2. **SerpAPI** (Google Search) - Site, produtos, presença digital
3. **Gemini LLM** - Análise e preenchimento inteligente de campos textuais

### Fluxo Proposto

```
1. CLIENTE (input: nome + CNPJ)
   ↓
   ReceitaWS → cnpj, nome, porte, cnae, cidade, uf
   ↓
   SerpAPI → siteOficial, linkedin, instagram
   ↓
   Gemini → produtoPrincipal, segmentacaoB2bB2c, qualidadeScore
   ↓
   Salvar CLIENTE completo

2. MERCADO (input: produto do cliente)
   ↓
   Gemini → nome, segmentacao, categoria, tamanhoMercado,
            crescimentoAnual, tendencias, principaisPlayers
   ↓
   Salvar MERCADO completo

3. CONCORRENTES (input: mercado)
   ↓
   SerpAPI → lista de empresas (nome + site)
   ↓
   ReceitaWS → cnpj, porte (via scraping do site)
   ↓
   Gemini → produto, faturamentoEstimado, qualidadeScore
   ↓
   Salvar CONCORRENTES completos

4. LEADS (input: mercado)
   ↓
   SerpAPI → lista de fornecedores (nome + site)
   ↓
   Scraping → cnpj, email, telefone
   ↓
   Gemini → tipo, porte, regiao, setor, qualidadeScore
   ↓
   Salvar LEADS completos
```

---

## 📈 Score de Qualidade

**Cálculo do qualidadeScore (0-100):**

### Clientes

- CNPJ válido: 20 pontos
- Site oficial: 15 pontos
- Email: 10 pontos
- Telefone: 10 pontos
- LinkedIn: 10 pontos
- Produto principal: 15 pontos
- Cidade/UF: 10 pontos
- CNAE: 10 pontos

### Concorrentes

- CNPJ válido: 25 pontos
- Site: 20 pontos
- Produto: 20 pontos
- Porte: 15 pontos
- Faturamento estimado: 20 pontos

### Leads

- CNPJ válido: 20 pontos
- Site: 15 pontos
- Email: 20 pontos
- Telefone: 20 pontos
- Tipo definido: 10 pontos
- Porte: 10 pontos
- Setor: 5 pontos

**Classificação:**

- 0-40: Baixa
- 41-70: Média
- 71-100: Alta

---

## 🔄 Próximos Passos

1. ✅ Documentar estrutura completa
2. ⏳ Criar função de enriquecimento com Gemini
3. ⏳ Testar com 1 cliente
4. ⏳ Validar qualidade dos dados
5. ⏳ Processar lote pequeno (10-20 clientes)
