# 📘 Racional Completo da API de Enriquecimento

**Data:** 19 de Novembro de 2025 - 15:45 GMT-3  
**Versão:** 1.0  
**Autor:** Manus AI (Documentação Técnica)

---

## 🎯 Visão Geral

O sistema de enriquecimento processa clientes em **7 etapas sequenciais**, usando **3 APIs principais**:

1. **Gemini LLM** (Google) - Análise de texto e identificação de mercados
2. **ReceitaWS** (Brasil) - Dados oficiais de CNPJ
3. **SerpAPI** (Google Search) - Busca de concorrentes e leads *(configurado mas não usado)*

---

## 📊 Fluxo Completo de Enriquecimento

### Etapa 1: Criar/Reusar Projeto

**Objetivo:** Organizar dados em projetos isolados

**Lógica:**
```typescript
if (input.projectId) {
  // Reusar projeto existente
  project = await getProjectById(input.projectId);
} else {
  // Criar novo projeto
  project = await createProject({
    nome: input.projectName,
    descricao: input.projectDescription
  });
}
```

**Output:** `{ id: number, nome: string }`

---

### Etapa 2: Identificar Mercados Únicos

**Objetivo:** Agrupar clientes por mercado usando LLM

**API Usada:** Gemini LLM

**Prompt do Sistema:**
```
Você é um especialista em análise de mercado. 
Identifique o mercado/setor para o produto fornecido.
```

**Prompt do Usuário:**
```
Produto: ${produto}

Retorne JSON com: {
  "mercado": "nome do mercado",
  "categoria": "categoria",
  "segmentacao": "B2B ou B2C"
}
```

**Schema de Resposta:**
```json
{
  "type": "json_schema",
  "json_schema": {
    "name": "market_identification",
    "strict": true,
    "schema": {
      "type": "object",
      "properties": {
        "mercado": { "type": "string" },
        "categoria": { "type": "string" },
        "segmentacao": { 
          "type": "string", 
          "enum": ["B2B", "B2C", "B2B2C"] 
        }
      },
      "required": ["mercado", "categoria", "segmentacao"]
    }
  }
}
```

**Lógica:**
1. Extrai produtos únicos dos clientes
2. Para cada produto, chama Gemini LLM
3. Cria registro em `mercados_unicos` se não existir
4. Retorna `Map<mercadoNome, mercadoId>`

**Exemplo de Resposta:**
```json
{
  "mercado": "Embalagens Plásticas",
  "categoria": "Manufatura",
  "segmentacao": "B2B"
}
```

---

### Etapa 3: Enriquecer Clientes

**Objetivo:** Completar dados dos clientes usando ReceitaWS + Gemini

**APIs Usadas:**
1. **ReceitaWS** (dados oficiais de CNPJ)
2. **Gemini LLM** (identificação de mercado por cliente)

#### 3.1. Consulta ReceitaWS

**Condições:**
- Cliente tem CNPJ
- CNPJ tem 14 dígitos (após limpar formatação)

**Endpoint:**
```
GET https://receitaws.com.br/v1/cnpj/{cnpj}
```

**Rate Limit:** 3 requisições por minuto

**Dados Extraídos:**
```typescript
{
  nome: receitaData.fantasia || receitaData.nome,
  razaoSocial: receitaData.nome,
  cnpj: receitaData.cnpj,
  porte: extractPorte(receitaData), // ME, EPP, DEMAIS
  endereco: extractEndereco(receitaData), // Completo formatado
  cnae: extractCNAE(receitaData), // Código + descrição
  email: receitaData.email,
  telefone: receitaData.telefone,
  situacao: receitaData.situacao // ATIVA, BAIXADA, etc
}
```

**Cache:**
- Dados salvos em `enrichment_cache` por CNPJ
- TTL: 30 dias
- Fonte: `receitaws`

#### 3.2. Identificação de Mercado por Cliente

**API Usada:** Gemini LLM

**Prompt do Sistema:**
```
Identifique o mercado para este produto.
```

**Prompt do Usuário:**
```
Produto: ${cliente.produto}
```

**Lógica:**
1. LLM retorna texto livre com nome do mercado
2. Sistema busca match com mercados já criados (case-insensitive)
3. Associa cliente ao mercado via `clientes_mercados`

#### 3.3. Cálculo de Score de Qualidade

**Função:** `calculateQualityScore()`

**Pesos dos Campos:**
```typescript
const FIELD_WEIGHTS = {
  cnpj: 20,        // 20%
  email: 15,       // 15%
  telefone: 10,    // 10%
  site: 15,        // 15%
  linkedin: 10,    // 10%
  instagram: 5,    // 5%
  produto: 15,     // 15%
  cidade: 3,       // 3%
  uf: 2,           // 2%
  cnae: 3,         // 3%
  porte: 2,        // 2%
};
// Total: 100%
```

**Classificação:**
- **80-100:** Excelente (verde)
- **60-79:** Bom (azul)
- **40-59:** Regular (amarelo)
- **0-39:** Ruim (vermelho)

**Exemplo de Cálculo:**
```typescript
Cliente com:
- CNPJ: ✓ (+20)
- Email: ✗ (0)
- Telefone: ✗ (0)
- Site: ✗ (0)
- Produto: ✓ (+15)
= Score: 35 (Ruim)
```

#### 3.4. Criação do Cliente

**Dados Salvos:**
```typescript
{
  projectId: number,
  nome: string, // ReceitaWS ou input
  cnpj: string | null,
  siteOficial: string | null, // ReceitaWS ou input
  email: string | null, // ReceitaWS
  telefone: string | null, // ReceitaWS
  cidade: string | null, // ReceitaWS
  uf: string | null, // ReceitaWS
  produtoPrincipal: string | null, // Input
  qualidadeScore: number, // Calculado
  qualidadeClassificacao: string, // Excelente/Bom/Regular/Ruim
  validationStatus: 'pending' // Sempre pending no início
}
```

---

### Etapa 4: Buscar Concorrentes

**Objetivo:** Encontrar empresas concorrentes por mercado

**API Configurada:** SerpAPI (Google Search)  
**Status:** Código existe mas **não está sendo usado** (você confirmou)

#### 4.1. Busca via SerpAPI (CÓDIGO EXISTENTE)

**Função:** `searchCompetitors(mercadoNome, location, num)`

**Query Construída:**
```
"${mercadoNome}" empresas Brasil -site:wikipedia.org -site:youtube.com
```

**Parâmetros:**
```typescript
{
  q: query,
  location: location || 'Brazil',
  num: num || 10,
  hl: 'pt-br',
  gl: 'br',
  api_key: process.env.SERPAPI_KEY
}
```

**Filtros Aplicados:**
1. `filterRealCompanies()` - Remove artigos/notícias
2. `filterDuplicates()` - Remove clientes existentes
3. Limita a 20 concorrentes por mercado

**Dados Extraídos:**
```typescript
{
  nome: result.title,
  site: result.link,
  descricao: result.snippet,
  produto: mercadoNome,
  qualidadeScore: calculado,
  qualidadeClassificacao: string
}
```

#### 4.2. Realidade Atual (Gemini)

Como você **não usa SerpAPI**, os 10.352 concorrentes foram **gerados pelo Gemini**.

**Hipótese de Implementação:**
```typescript
// Gemini gera concorrentes fictícios
const response = await invokeLLM({
  messages: [{
    role: 'system',
    content: 'Gere 20 empresas concorrentes realistas'
  }, {
    role: 'user',
    content: `Mercado: ${mercadoNome}\nRetorne JSON com array de empresas`
  }],
  response_format: { type: 'json_schema', ... }
});
```

**Problema:**
- Gemini **inventa** CNPJs, sites, emails
- Dados parecem reais mas são **fictícios**
- Score 100 mas **validade desconhecida**

---

### Etapa 5: Buscar Leads

**Objetivo:** Encontrar potenciais clientes por mercado

**API Configurada:** SerpAPI (Google Search)  
**Status:** Código existe mas **não está sendo usado** (você confirmou)

#### 5.1. Busca via SerpAPI (CÓDIGO EXISTENTE)

**Função:** `searchLeads(mercadoNome, tipo, num)`

**Query Construída:**
```
"${mercadoNome}" ${tipo} Brasil -site:wikipedia.org -site:youtube.com
```

**Tipo:** `fornecedores` (padrão)

**Filtros Aplicados:**
1. `filterRealCompanies()` - Remove artigos/notícias
2. `filterDuplicates()` - Remove clientes e concorrentes existentes
3. Limita a 20 leads por mercado

**Dados Extraídos:**
```typescript
{
  nome: result.title,
  site: result.link,
  tipo: 'B2B',
  regiao: 'Brasil',
  setor: mercadoNome,
  qualidadeScore: calculado,
  qualidadeClassificacao: string,
  stage: 'novo'
}
```

#### 5.2. Realidade Atual (Gemini)

Como você **não usa SerpAPI**, os 10.330 leads foram **gerados pelo Gemini**.

**Hipótese de Implementação:**
```typescript
// Gemini gera leads fictícios
const response = await invokeLLM({
  messages: [{
    role: 'system',
    content: 'Gere 20 leads realistas (fornecedores)'
  }, {
    role: 'user',
    content: `Mercado: ${mercadoNome}\nRetorne JSON com array de leads`
  }],
  response_format: { type: 'json_schema', ... }
});
```

**Problema:**
- Gemini **inventa** CNPJs, sites, emails
- Dados parecem reais mas são **fictícios**
- Score 100 mas **validade desconhecida**

---

### Etapa 6: Calcular Estatísticas

**Objetivo:** Agregar métricas do processamento

**Cálculos:**
```typescript
{
  mercadosCount: mercadosMap.size,
  clientesCount: clientesEnriquecidos.length,
  concorrentesCount: concorrentes.length,
  leadsCount: leadsEncontrados.length,
  avgQualityScore: Math.round(
    clientesEnriquecidos.reduce((sum, c) => sum + c.qualidadeScore, 0) / 
    clientesEnriquecidos.length
  )
}
```

---

### Etapa 7: Finalizar e Notificar

**Objetivo:** Registrar conclusão e notificar usuário

**Ações:**
1. Atualizar `enrichment_runs` com status `completed`
2. Registrar duração em segundos
3. Enviar notificação ao owner via `notifyOwner()`

**Notificação:**
```typescript
{
  title: `✅ Enriquecimento Concluído - ${projectName}`,
  content: `
    O enriquecimento foi concluído com sucesso!
    
    • ${clientesCount} clientes processados
    • ${mercadosCount} mercados identificados
    • ${concorrentesCount} concorrentes encontrados
    • ${leadsCount} leads gerados
    • Tempo total: ${minutes} minutos
  `
}
```

---

## 🔧 APIs Detalhadas

### 1. Gemini LLM (Google)

**Modelo:** `gemini-2.5-flash`

**Configuração:**
```typescript
{
  model: "gemini-2.5-flash",
  max_tokens: 32768,
  thinking: {
    budget_tokens: 128
  }
}
```

**Endpoint:**
```
POST ${BUILT_IN_FORGE_API_URL}/llm/invoke
Authorization: Bearer ${BUILT_IN_FORGE_API_KEY}
```

**Usos no Sistema:**
1. **Identificação de mercados** (Etapa 2)
2. **Associação cliente-mercado** (Etapa 3)
3. **Geração de concorrentes** (Etapa 4 - hipótese)
4. **Geração de leads** (Etapa 5 - hipótese)

**Vantagens:**
- ✅ Rápido e barato
- ✅ Excelente para análise de texto
- ✅ JSON schema estruturado

**Desvantagens:**
- ❌ Pode gerar dados fictícios
- ❌ Não valida CNPJs reais
- ❌ Não busca dados na web

---

### 2. ReceitaWS (Brasil)

**Endpoint:**
```
GET https://receitaws.com.br/v1/cnpj/{cnpj}
```

**Rate Limit:** 3 requisições/minuto

**Resposta (Exemplo):**
```json
{
  "status": "OK",
  "cnpj": "26.519.600/0001-54",
  "tipo": "MATRIZ",
  "nome": "EMPRESA EXEMPLO LTDA",
  "fantasia": "EXEMPLO",
  "porte": "EPP",
  "abertura": "01/01/2020",
  "natureza_juridica": "206-2 - Sociedade Empresária Limitada",
  "atividade_principal": [{
    "code": "22.22-6/00",
    "text": "Fabricação de embalagens plásticas"
  }],
  "logradouro": "RUA EXEMPLO",
  "numero": "123",
  "bairro": "CENTRO",
  "municipio": "SÃO PAULO",
  "uf": "SP",
  "cep": "01234-567",
  "email": "contato@exemplo.com.br",
  "telefone": "(11) 1234-5678",
  "situacao": "ATIVA"
}
```

**Campos Usados:**
- `nome` → razão social
- `fantasia` → nome fantasia
- `cnpj` → CNPJ formatado
- `porte` → ME, EPP, DEMAIS
- `email` → email oficial
- `telefone` → telefone oficial
- `municipio` → cidade
- `uf` → estado
- `atividade_principal[0]` → CNAE

**Vantagens:**
- ✅ Dados oficiais da Receita Federal
- ✅ CNPJs sempre válidos
- ✅ Gratuito (com rate limit)

**Desvantagens:**
- ❌ Rate limit baixo (3/min)
- ❌ Nem todos os CNPJs têm email/telefone
- ❌ Pode estar desatualizado

**Status Atual:**
- ✅ Código implementado
- ⚠️ **Não está enriquecendo clientes** (0% têm email/telefone)
- 🔍 **Necessário investigar por que não funciona**

---

### 3. SerpAPI (Google Search)

**Endpoint:**
```
GET https://serpapi.com/search
```

**Parâmetros:**
```typescript
{
  q: string,           // Query de busca
  location: string,    // "Brazil"
  num: number,         // Número de resultados (max 100)
  hl: 'pt-br',        // Idioma
  gl: 'br',           // País
  api_key: string     // SERPAPI_KEY
}
```

**Resposta (Exemplo):**
```json
{
  "organic_results": [{
    "position": 1,
    "title": "Empresa Exemplo - Embalagens",
    "link": "https://exemplo.com.br",
    "snippet": "Fabricamos embalagens plásticas...",
    "displayed_link": "exemplo.com.br"
  }]
}
```

**Vantagens:**
- ✅ Dados reais da web (Google Search)
- ✅ Empresas realmente existem
- ✅ Sites acessíveis

**Desvantagens:**
- ❌ Pago (custo por busca)
- ❌ Pode retornar artigos/notícias
- ❌ Necessário filtrar resultados

**Status Atual:**
- ✅ Código implementado
- ❌ **Não está sendo usado** (você confirmou)
- ❌ `SERPAPI_KEY` pode não estar configurada

---

## 🚨 Problemas Identificados

### 1. ReceitaWS Não Enriquece Clientes

**Evidência:**
- 0% dos clientes têm email
- 0% dos clientes têm telefone
- 0% dos clientes têm cidade/UF

**Possíveis Causas:**

**A) Rate Limit Excedido**
```typescript
// 450 clientes processados em 6,5 horas
// = 1,15 clientes/minuto
// ReceitaWS permite 3 req/min
// ✅ Não é rate limit
```

**B) CNPJs Inválidos**
```typescript
// Verificar se CNPJs têm 14 dígitos
SELECT COUNT(*) FROM clientes 
WHERE cnpj IS NOT NULL 
  AND LENGTH(REPLACE(cnpj, '.', '')) != 14;
```

**C) Erro Silencioso no Código**
```typescript
// Código tem try/catch que pode estar engolindo erros
try {
  const receitaData = await consultarCNPJ(cnpjLimpo);
  // Se retornar null, não há log de erro
} catch (error) {
  // Erro silencioso
}
```

**D) Cache Retornando Dados Vazios**
```typescript
// Se cache tem dados sem email/telefone, não consulta ReceitaWS
const dadosEnriquecidos = await getCachedEnrichment(cnpjLimpo);
if (dadosEnriquecidos) {
  // Usa cache mesmo se incompleto
}
```

**Solução:**
1. Adicionar logs detalhados
2. Verificar CNPJs no banco
3. Limpar cache de enriquecimento
4. Testar manualmente com CNPJ real

---

### 2. Concorrentes e Leads São Fictícios

**Evidência:**
- 10.352 concorrentes com 100% de completude
- 10.330 leads com 100% de completude
- Todos os campos preenchidos (CNPJ, email, site, etc)

**Causa:**
- SerpAPI não está sendo usado
- Gemini está gerando dados fictícios

**Impacto:**
- ❌ CNPJs podem ser inválidos
- ❌ Emails podem não existir
- ❌ Sites podem não ser acessíveis
- ❌ Empresas podem não existir

**Solução:**
1. **Opção A:** Configurar e usar SerpAPI
2. **Opção B:** Validar dados gerados pelo Gemini
3. **Opção C:** Desabilitar geração de concorrentes/leads

---

### 3. Score de Qualidade Enganoso

**Problema:**
```typescript
// Cliente com score 100
{
  cnpj: null,        // 0 pontos
  email: null,       // 0 pontos
  telefone: null,    // 0 pontos
  site: null,        // 0 pontos
  produto: "Embalagens plásticas flexíveis..." // 15 pontos
}
// Score real: 15 (Ruim)
// Score mostrado: 100 (Excelente)
```

**Causa:**
- Fórmula de cálculo não está sendo aplicada corretamente
- Ou dados estão sendo preenchidos artificialmente

**Solução:**
1. Revisar função `calculateQualityScore()`
2. Adicionar logs de cálculo
3. Validar dados antes de calcular score

---

## 💡 Recomendações de Recalibração

### Prioridade ALTA

#### 1. Corrigir ReceitaWS

**Ação:** Investigar por que não está enriquecendo

**Passos:**
1. Adicionar logs detalhados:
```typescript
console.log('[ReceitaWS] Consultando CNPJ:', cnpj);
console.log('[ReceitaWS] Resposta:', receitaData);
console.log('[ReceitaWS] Email encontrado:', receitaData?.email);
```

2. Testar manualmente:
```typescript
// Criar script de teste
const { consultarCNPJ } = require('./server/_core/receitaws');
const cnpj = '26519600000154'; // CNPJ real
const data = await consultarCNPJ(cnpj);
console.log(data);
```

3. Verificar cache:
```sql
SELECT * FROM enrichment_cache 
WHERE cnpj = '26519600000154';
```

4. Limpar cache se necessário:
```sql
DELETE FROM enrichment_cache 
WHERE fonte = 'receitaws' 
  AND (email IS NULL OR email = '');
```

#### 2. Validar Dados Gerados pelo Gemini

**Ação:** Verificar se concorrentes/leads são reais

**Script de Validação:**
```typescript
// validate-sample.ts
import { consultarCNPJ } from './server/_core/receitaws';

// Buscar 50 concorrentes aleatórios
const concorrentes = await db.select()
  .from(concorrentes)
  .orderBy(sql`RAND()`)
  .limit(50);

let validos = 0;
let invalidos = 0;

for (const conc of concorrentes) {
  if (!conc.cnpj) {
    invalidos++;
    continue;
  }
  
  const data = await consultarCNPJ(conc.cnpj);
  if (data && data.status === 'OK') {
    validos++;
  } else {
    invalidos++;
  }
  
  // Respeitar rate limit (3/min)
  await new Promise(resolve => setTimeout(resolve, 20000));
}

console.log(`Válidos: ${validos}/50 (${validos*2}%)`);
console.log(`Inválidos: ${invalidos}/50 (${invalidos*2}%)`);
```

**Decisão baseada em resultado:**
- **>80% válidos:** Gemini está gerando dados reais (improvável)
- **50-80% válidos:** Ajustar prompts do Gemini
- **<50% válidos:** Integrar SerpAPI ou desabilitar geração

#### 3. Recalibrar Score de Qualidade

**Ação:** Ajustar pesos e validação

**Proposta:**
```typescript
const FIELD_WEIGHTS = {
  // Campos críticos (dados de contato)
  cnpj: 25,        // ↑ 20 → 25
  email: 20,       // ↑ 15 → 20
  telefone: 15,    // ↑ 10 → 15
  
  // Campos importantes (presença online)
  site: 15,        // = 15
  linkedin: 10,    // = 10
  
  // Campos secundários
  produto: 10,     // ↓ 15 → 10
  instagram: 3,    // ↓ 5 → 3
  cidade: 1,       // ↓ 3 → 1
  uf: 1,           // ↓ 2 → 1
  cnae: 0,         // ↓ 3 → 0 (removido)
  porte: 0,        // ↓ 2 → 0 (removido)
};
// Total: 100%
```

**Justificativa:**
- Dados de contato são mais valiosos que produto
- CNAE e porte têm pouco valor prático
- Score deve refletir "quão fácil é entrar em contato"

---

### Prioridade MÉDIA

#### 4. Integrar SerpAPI (Se Necessário)

**Ação:** Configurar SerpAPI para buscar dados reais

**Passos:**
1. Obter API key em https://serpapi.com
2. Configurar variável de ambiente:
```bash
SERPAPI_KEY=your_key_here
```

3. Testar conexão:
```typescript
import { testSerpApiConnection } from './server/_core/serpApi';
const ok = await testSerpApiConnection();
console.log('SerpAPI OK:', ok);
```

4. Ajustar queries de busca:
```typescript
// Concorrentes
const query = `"${mercadoNome}" empresas Brasil -site:wikipedia.org`;

// Leads
const query = `"${mercadoNome}" fornecedores Brasil -site:wikipedia.org`;
```

5. Validar resultados:
```typescript
// Verificar se são empresas reais
const filtered = filterRealCompanies(results);
console.log(`Empresas reais: ${filtered.length}/${results.length}`);
```

#### 5. Implementar Validação de Dados

**Ação:** Validar CNPJs, emails e sites antes de salvar

**Validações:**
```typescript
// 1. Validar CNPJ
if (cnpj) {
  const isValid = await consultarCNPJ(cnpj);
  if (!isValid) {
    console.warn(`CNPJ inválido: ${cnpj}`);
    cnpj = null; // Não salvar CNPJ inválido
  }
}

// 2. Validar email
if (email) {
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValid) {
    console.warn(`Email inválido: ${email}`);
    email = null;
  }
}

// 3. Validar site
if (site) {
  try {
    const response = await fetch(site, { method: 'HEAD', timeout: 5000 });
    if (!response.ok) {
      console.warn(`Site inacessível: ${site}`);
      site = null;
    }
  } catch (error) {
    console.warn(`Site inválido: ${site}`);
    site = null;
  }
}
```

#### 6. Adicionar Logs Detalhados

**Ação:** Melhorar observabilidade do processo

**Logs Sugeridos:**
```typescript
// Início do processamento
console.log(`[Enrichment] Processando cliente ${i+1}/${total}: ${cliente.nome}`);

// ReceitaWS
console.log(`[ReceitaWS] Consultando CNPJ: ${cnpj}`);
console.log(`[ReceitaWS] Dados encontrados:`, {
  nome: data.nome,
  email: data.email,
  telefone: data.telefone,
  cidade: data.municipio
});

// Gemini
console.log(`[Gemini] Identificando mercado para: ${produto}`);
console.log(`[Gemini] Mercado identificado: ${mercado}`);

// Score
console.log(`[Score] Calculado: ${score} (${classificacao})`);
console.log(`[Score] Campos preenchidos:`, {
  cnpj: !!cnpj,
  email: !!email,
  telefone: !!telefone,
  site: !!site
});
```

---

### Prioridade BAIXA

#### 7. Otimizar Performance

**Ação:** Reduzir tempo de processamento

**Otimizações:**
1. **Paralelizar chamadas independentes:**
```typescript
// Ao invés de sequencial
for (const cliente of clientes) {
  await enrichCliente(cliente);
}

// Usar Promise.all em lotes
const BATCH_SIZE = 10;
for (let i = 0; i < clientes.length; i += BATCH_SIZE) {
  const batch = clientes.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(c => enrichCliente(c)));
}
```

2. **Cache agressivo:**
```typescript
// Cachear mercados identificados
const mercadoCache = new Map<string, string>();

// Cachear dados da ReceitaWS por 90 dias
await setCachedEnrichment(cnpj, data, 'receitaws', 90 * 24 * 60 * 60);
```

3. **Reduzir chamadas ao Gemini:**
```typescript
// Agrupar produtos similares
const produtosAgrupados = agruparProdutosSimilares(produtos);
// Identificar mercado uma vez por grupo
```

#### 8. Adicionar Retry Logic

**Ação:** Tentar novamente em caso de falha

**Implementação:**
```typescript
async function enrichClienteWithRetry(cliente: Cliente, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await enrichCliente(cliente);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      console.warn(`[Retry] Tentativa ${attempt}/${maxRetries} falhou para ${cliente.nome}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}
```

---

## 📋 Checklist de Recalibração

### Antes de Retomar Run

- [ ] **Investigar ReceitaWS** - Por que não enriquece?
- [ ] **Validar amostra** - 50 concorrentes/leads são reais?
- [ ] **Recalibrar score** - Ajustar pesos dos campos
- [ ] **Adicionar logs** - Melhorar observabilidade
- [ ] **Testar com 10 clientes** - Validar correções

### Melhorias Opcionais

- [ ] **Integrar SerpAPI** - Se dados do Gemini são fictícios
- [ ] **Implementar validações** - CNPJ, email, site
- [ ] **Otimizar performance** - Paralelização e cache
- [ ] **Adicionar retry logic** - Resiliência a falhas

---

## 🎯 Decisão Recomendada

**PAUSAR e CORRIGIR** antes de continuar:

1. ✅ **Investigar ReceitaWS** (2 horas)
   - Adicionar logs
   - Testar manualmente
   - Limpar cache se necessário

2. ✅ **Validar amostra de dados** (1 hora)
   - 50 concorrentes
   - 50 leads
   - Calcular taxa de validade

3. ✅ **Recalibrar baseado em resultados** (2-4 horas)
   - Se ReceitaWS funcionar → Continuar
   - Se dados são fictícios → Integrar SerpAPI
   - Ajustar score de qualidade

4. ✅ **Testar com 50 clientes** (1 hora)
   - Validar correções
   - Verificar qualidade
   - Confirmar custos

5. ✅ **Executar novo run** (11,5 horas)
   - Processar 800 clientes
   - Monitorar qualidade
   - Validar resultados

**Tempo total estimado:** 17-20 horas (vs 6h desperdiçadas sem correções)

---

**Documento gerado por:** Manus AI  
**Última atualização:** 19 de Novembro de 2025 - 15:45 GMT-3  
**Status:** RACIONAL COMPLETO - Aguardando revisão do usuário
