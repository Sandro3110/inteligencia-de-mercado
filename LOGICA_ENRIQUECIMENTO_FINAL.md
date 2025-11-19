# Sistema de Enriquecimento Modular - Gemini LLM (VERSÃO FINAL)

## 📋 Visão Geral

Sistema de enriquecimento sequencial em 5 etapas usando **apenas Gemini LLM**, processando 801 clientes base com regras de unicidade em cada camada.

**Configuração**: 5 concorrentes e 5 leads por cliente

---

## 🔄 Fluxo Sequencial

```
CLIENTES (801) 
    ↓ Etapa 1: Enriquecimento
CLIENTES ENRIQUECIDOS (801)
    ↓ Etapa 2: Identificação
MERCADOS ÚNICOS (~1.401)
    ↓ Etapa 3: Mapeamento
PRODUTOS (~6.006)
    ↓ Etapa 4: Busca
CONCORRENTES ÚNICOS (~1.602)
    ↓ Etapa 5: Busca Semântica
LEADS ÚNICOS (~2.403)
```

**Resultado Final**: ~12.213 registros | Tempo: ~11,8h | Custo: ~$1 USD

---

## 📊 ETAPA 1: Enriquecimento de Clientes

### Objetivo
Preencher campos vazios da tabela `clientes` (26 campos) usando dados existentes.

### Input
```json
{
  "id": 1,
  "nome": "Empresa XYZ Ltda",
  "cnpj": "12.345.678/0001-90",
  "produtoPrincipal": "Embalagens plásticas"
}
```

### Prompt Gemini
```
Você é um especialista em inteligência de mercado B2B brasileiro.

Com base nos dados abaixo, preencha os campos faltantes com informações REAIS e PRECISAS:
- Nome: {nome}
- CNPJ: {cnpj}
- Produto Principal: {produtoPrincipal}

Retorne APENAS um JSON válido (sem markdown, sem explicações):
{
  "siteOficial": "URL do site oficial (pesquise se necessário)",
  "segmentacaoB2bB2c": "B2B | B2C | B2B2C",
  "email": "email de contato comercial",
  "telefone": "telefone principal com DDD",
  "linkedin": "URL do LinkedIn da empresa",
  "instagram": "URL do Instagram (se aplicável, senão null)",
  "cidade": "cidade da sede",
  "uf": "UF da sede (2 letras maiúsculas)",
  "regiao": "Norte | Nordeste | Centro-Oeste | Sudeste | Sul",
  "cnae": "código CNAE principal (formato: 0000-0/00)",
  "porte": "MEI | Pequena | Média | Grande",
  "faturamentoDeclarado": "Faturamento anual declarado (ex: R$ 50 milhões/ano) ou null",
  "numeroEstabelecimentos": "Número de filiais/unidades (inteiro) ou null"
}

REGRAS:
- Use dados reais e atualizados do mercado brasileiro
- Se não encontrar informação confiável, retorne null
- Telefone deve ter formato: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX
- Email deve ser válido e preferencialmente comercial
- Região deve corresponder ao estado (UF)
```

### Output Esperado
```json
{
  "siteOficial": "https://empresaxyz.com.br",
  "segmentacaoB2bB2c": "B2B",
  "email": "contato@empresaxyz.com.br",
  "telefone": "(11) 3456-7890",
  "linkedin": "https://linkedin.com/company/empresaxyz",
  "instagram": null,
  "cidade": "São Paulo",
  "uf": "SP",
  "regiao": "Sudeste",
  "cnae": "2222-6/00",
  "porte": "Média",
  "faturamentoDeclarado": "R$ 50 milhões/ano",
  "numeroEstabelecimentos": 3
}
```

### Regras de Atualização
- ✅ Atualizar apenas campos NULL/vazios
- ✅ Manter dados existentes intactos
- ✅ Validar formato de email, telefone, URLs
- ✅ Calcular qualidadeScore (0-100) após enriquecimento

---

## 📊 ETAPA 2: Identificação de Mercados

### Objetivo
Identificar todos os mercados em que o cliente atua e criar registros únicos na tabela `mercados_unicos`.

### Input
```json
{
  "clienteId": 1,
  "nome": "Empresa XYZ Ltda",
  "produtoPrincipal": "Embalagens plásticas",
  "segmentacaoB2bB2c": "B2B",
  "cnae": "2222-6/00",
  "cidade": "São Paulo",
  "uf": "SP"
}
```

### Prompt Gemini
```
Você é um especialista em segmentação de mercado B2B brasileiro.

Analise a empresa abaixo e identifique de 1 a 5 mercados ESPECÍFICOS em que ela atua:
- Nome: {nome}
- Produto Principal: {produtoPrincipal}
- Segmentação: {segmentacaoB2bB2c}
- CNAE: {cnae}
- Localização: {cidade}/{uf}

Retorne APENAS um array JSON válido (sem markdown, sem explicações):
[
  {
    "nome": "Nome específico do mercado (ex: Embalagens Plásticas para Alimentos)",
    "segmentacao": "B2B | B2C | B2B2C",
    "categoria": "Categoria CNAE ou setor industrial",
    "tamanhoMercado": "Tamanho do mercado no Brasil (ex: R$ 5 bilhões/ano)",
    "crescimentoAnual": "Taxa de crescimento (ex: 8% ao ano)",
    "tendencias": "Principais tendências atuais do mercado (máx 200 caracteres)",
    "principaisPlayers": "Top 5 empresas do mercado separadas por vírgula"
  }
]

REGRAS:
- Retornar entre 1 e 5 mercados
- Mercados devem ser ESPECÍFICOS (não genéricos como "Plásticos")
- Use dados reais e atualizados do mercado brasileiro
- Seja preciso nos valores de tamanho de mercado e crescimento
```

### Output Esperado
```json
[
  {
    "nome": "Embalagens Plásticas para Alimentos",
    "segmentacao": "B2B",
    "categoria": "Indústria de Transformação - Plásticos",
    "tamanhoMercado": "R$ 12 bilhões/ano no Brasil",
    "crescimentoAnual": "6,5% ao ano",
    "tendencias": "Sustentabilidade, plástico biodegradável, economia circular, redução de peso",
    "principaisPlayers": "Braskem, Amcor, Bemis, Sealed Air, Dixie Toga"
  },
  {
    "nome": "Embalagens para Cosméticos",
    "segmentacao": "B2B",
    "categoria": "Indústria de Transformação - Plásticos",
    "tamanhoMercado": "R$ 3 bilhões/ano no Brasil",
    "crescimentoAnual": "4,2% ao ano",
    "tendencias": "Embalagens premium, design diferenciado, sustentabilidade, refil",
    "principaisPlayers": "Wheaton, Gerresheimer, Aptar, Albéa, RPC Group"
  }
]
```

### Regras de Unicidade
- ✅ Hash: `nome-projectId` (normalizado, lowercase, sem caracteres especiais)
- ✅ Verificar se mercado já existe antes de inserir
- ✅ Se existir, reusar ID do mercado existente
- ✅ Criar registro em `clientes_mercados` (clienteId, mercadoId)
- ✅ Evitar duplicação: verificar se associação já existe

---

## 📊 ETAPA 3: Criação de Produtos

### Objetivo
Mapear produtos específicos que o cliente oferece para cada mercado.

### Input
```json
{
  "clienteId": 1,
  "clienteNome": "Empresa XYZ Ltda",
  "produtoPrincipal": "Embalagens plásticas",
  "mercados": [
    {"id": 10, "nome": "Embalagens Plásticas para Alimentos"},
    {"id": 11, "nome": "Embalagens para Cosméticos"}
  ]
}
```

### Prompt Gemini
```
Você é um especialista em catálogo de produtos B2B.

Analise a empresa e liste de 2 a 5 produtos ESPECÍFICOS que ela oferece para CADA mercado:
- Cliente: {clienteNome}
- Produto Principal: {produtoPrincipal}
- Mercados: {mercados}

Retorne APENAS um array JSON válido (sem markdown, sem explicações):
[
  {
    "mercadoId": 10,
    "nome": "Nome específico e técnico do produto",
    "descricao": "Descrição técnica detalhada do produto (máx 300 caracteres)",
    "categoria": "Categoria do produto",
    "preco": "Faixa de preço estimada (ex: R$ 0,50 - R$ 2,00/unidade)",
    "unidade": "kg | litro | unidade | m² | rolo | caixa | etc"
  }
]

REGRAS:
- Retornar 2-5 produtos POR mercado
- Produtos devem ser ESPECÍFICOS e TÉCNICOS (não genéricos)
- Produtos devem ser REAIS e comercializados no Brasil
- Preços devem ser realistas para o mercado brasileiro
- Incluir produtos para TODOS os mercados fornecidos
```

### Output Esperado
```json
[
  {
    "mercadoId": 10,
    "nome": "Pote Plástico Transparente 500ml",
    "descricao": "Pote plástico transparente em PP, tampa rosqueável, ideal para alimentos, resistente a micro-ondas",
    "categoria": "Embalagens Rígidas",
    "preco": "R$ 0,80 - R$ 1,50/unidade",
    "unidade": "unidade"
  },
  {
    "mercadoId": 10,
    "nome": "Filme Stretch PVC para Alimentos",
    "descricao": "Filme plástico aderente para conservação de alimentos, rolo 30cm x 100m, transparente",
    "categoria": "Embalagens Flexíveis",
    "preco": "R$ 8,00 - R$ 15,00/rolo",
    "unidade": "rolo"
  },
  {
    "mercadoId": 11,
    "nome": "Frasco Airless 30ml para Cosméticos",
    "descricao": "Frasco airless em PP, sistema de bomba, ideal para cremes e séruns, acabamento premium",
    "categoria": "Embalagens Premium",
    "preco": "R$ 3,50 - R$ 6,00/unidade",
    "unidade": "unidade"
  }
]
```

### Regras de Unicidade
- ✅ Chave única: `clienteId + mercadoId + nome` (normalizado)
- ✅ Verificar se produto já existe antes de inserir
- ✅ Um cliente pode ter múltiplos produtos no mesmo mercado
- ✅ Mesmo produto pode existir para clientes diferentes (registros separados)

---

## 📊 ETAPA 4: Busca de Concorrentes

### Objetivo
Identificar 5 empresas concorrentes que atuam com os mesmos produtos e mercados.

### Input
```json
{
  "clienteId": 1,
  "clienteNome": "Empresa XYZ Ltda",
  "mercados": [
    {
      "id": 10,
      "nome": "Embalagens Plásticas para Alimentos",
      "produtos": ["Pote Plástico 500ml", "Filme Stretch PVC"]
    }
  ],
  "clientesExistentes": ["Empresa XYZ Ltda", "Empresa ABC S.A.", ...]
}
```

### Prompt Gemini
```
Você é um especialista em mapeamento competitivo B2B brasileiro.

Identifique EXATAMENTE 5 empresas CONCORRENTES REAIS que fabricam produtos similares:
- Cliente: {clienteNome}
- Mercados e Produtos: {mercados}

Retorne APENAS um array JSON válido com 5 concorrentes (sem markdown, sem explicações):
[
  {
    "mercadoId": 10,
    "nome": "Nome completo da empresa concorrente",
    "cnpj": "CNPJ completo (se disponível, senão null)",
    "site": "URL do site oficial",
    "produto": "Principais produtos que oferece (máx 200 caracteres)",
    "cidade": "Cidade da sede",
    "uf": "UF da sede (2 letras maiúsculas)",
    "porte": "MEI | Pequena | Média | Grande",
    "faturamentoEstimado": "Faturamento anual estimado (ex: R$ 50-100 milhões/ano)",
    "faturamentoDeclarado": "Faturamento declarado oficial (se disponível, senão null)",
    "numeroEstabelecimentos": "Número de filiais/unidades (inteiro) ou null"
  }
]

REGRAS CRÍTICAS:
- Retornar EXATAMENTE 5 concorrentes
- NÃO incluir empresas desta lista: {clientesExistentes}
- NÃO incluir distribuidores ou revendedores (apenas FABRICANTES)
- Empresas devem ser REAIS, ativas e brasileiras
- Priorizar concorrentes diretos (mesmo porte e região)
- Se não encontrar 5 concorrentes diretos, incluir concorrentes indiretos
```

### Output Esperado
```json
[
  {
    "mercadoId": 10,
    "nome": "Plasútil Embalagens Ltda",
    "cnpj": "98.765.432/0001-10",
    "site": "https://plasutil.com.br",
    "produto": "Potes plásticos, tampas, embalagens para alimentos, filmes stretch",
    "cidade": "São Paulo",
    "uf": "SP",
    "porte": "Média",
    "faturamentoEstimado": "R$ 50-100 milhões/ano",
    "faturamentoDeclarado": "R$ 75 milhões/ano",
    "numeroEstabelecimentos": 3
  },
  {
    "mercadoId": 10,
    "nome": "Embraplas Indústria de Plásticos",
    "cnpj": "87.654.321/0001-20",
    "site": "https://embraplas.com.br",
    "produto": "Filmes plásticos, embalagens flexíveis, stretch, bobinas",
    "cidade": "Campinas",
    "uf": "SP",
    "porte": "Grande",
    "faturamentoEstimado": "R$ 200-500 milhões/ano",
    "faturamentoDeclarado": null,
    "numeroEstabelecimentos": 12
  }
]
```

### Regras de Unicidade e Validação
- ✅ Hash: `nome-cnpj` (normalizado)
- ✅ Verificar se concorrente já existe antes de inserir
- ✅ **CRÍTICO**: Concorrente NÃO pode estar na tabela `clientes`
- ✅ Validar CNPJ: se fornecido, verificar se não pertence a cliente existente
- ✅ Um concorrente pode atuar em múltiplos mercados (registros separados por mercado)

### Validação Cruzada (Backend)
```sql
SELECT COUNT(*) FROM clientes 
WHERE LOWER(TRIM(nome)) = LOWER(TRIM(?))
   OR (cnpj IS NOT NULL AND cnpj = ?);
-- Se COUNT > 0, DESCARTAR o concorrente
```

---

## 📊 ETAPA 5: Busca de Leads (Busca Semântica)

### Objetivo
Identificar 5 empresas que são **potenciais compradores** dos produtos (B2B, B2C ou B2B2C).

### Input
```json
{
  "clienteId": 1,
  "mercados": [
    {
      "id": 10,
      "nome": "Embalagens Plásticas para Alimentos",
      "produtos": ["Pote Plástico 500ml", "Filme Stretch PVC"]
    }
  ],
  "clientesExistentes": ["Empresa XYZ Ltda", ...],
  "concorrentesExistentes": ["Plasútil Embalagens Ltda", ...]
}
```

### Prompt Gemini
```
Você é um especialista em prospecção de leads B2B/B2C brasileiro.

Identifique EXATAMENTE 5 empresas REAIS que são POTENCIAIS COMPRADORES dos produtos:
- Mercados e Produtos: {mercados}

BUSCA SEMÂNTICA - Quem COMPRA esses produtos?
Exemplos para "Embalagens Plásticas para Alimentos":
- Indústrias alimentícias (laticínios, doces, congelados)
- Restaurantes e food services
- Supermercados e atacadistas
- Marcas de alimentos (B2B)

Retorne APENAS um array JSON válido com 5 leads (sem markdown, sem explicações):
[
  {
    "mercadoId": 10,
    "nome": "Nome completo da empresa lead",
    "cnpj": "CNPJ completo (se disponível, senão null)",
    "site": "URL do site oficial",
    "email": "Email de contato comercial",
    "telefone": "Telefone principal com DDD",
    "tipo": "Cliente Potencial | Parceiro | Distribuidor",
    "cidade": "Cidade da sede",
    "uf": "UF da sede (2 letras maiúsculas)",
    "porte": "MEI | Pequena | Média | Grande",
    "faturamentoDeclarado": "Faturamento declarado (se disponível, senão null)",
    "numeroEstabelecimentos": "Número de filiais/unidades (inteiro) ou null",
    "regiao": "Norte | Nordeste | Centro-Oeste | Sudeste | Sul",
    "setor": "Setor de atuação (ex: Alimentos e Bebidas - Laticínios)"
  }
]

REGRAS CRÍTICAS:
- Retornar EXATAMENTE 5 leads
- NÃO incluir empresas destas listas: {clientesExistentes} e {concorrentesExistentes}
- Empresas devem ser REAIS, ativas e brasileiras
- Diversificar portes (pequenas, médias, grandes)
- Diversificar regiões do Brasil
- Focar em empresas que COMPRAM (não que fabricam)
```

### Output Esperado
```json
[
  {
    "mercadoId": 10,
    "nome": "Laticínios Bom Gosto Ltda",
    "cnpj": "76.543.210/0001-30",
    "site": "https://bomgosto.com.br",
    "email": "compras@bomgosto.com.br",
    "telefone": "(11) 4567-8901",
    "tipo": "Cliente Potencial",
    "cidade": "São Paulo",
    "uf": "SP",
    "porte": "Média",
    "faturamentoDeclarado": "R$ 30 milhões/ano",
    "numeroEstabelecimentos": 2,
    "regiao": "Sudeste",
    "setor": "Alimentos e Bebidas - Laticínios"
  },
  {
    "mercadoId": 10,
    "nome": "Rede de Supermercados Super Preço",
    "cnpj": "65.432.109/0001-40",
    "site": "https://superpreco.com.br",
    "email": "fornecedores@superpreco.com.br",
    "telefone": "(21) 3456-7890",
    "tipo": "Distribuidor",
    "cidade": "Rio de Janeiro",
    "uf": "RJ",
    "porte": "Grande",
    "faturamentoDeclarado": null,
    "numeroEstabelecimentos": 45,
    "regiao": "Sudeste",
    "setor": "Varejo - Supermercados"
  }
]
```

### Regras de Unicidade e Validação
- ✅ Hash: `nome-cnpj` (normalizado)
- ✅ Verificar se lead já existe antes de inserir
- ✅ **CRÍTICO**: Lead NÃO pode estar em `clientes` ou `concorrentes`
- ✅ Validar CNPJ: se fornecido, verificar se não pertence a cliente/concorrente
- ✅ Um lead pode atuar em múltiplos mercados (registros separados por mercado)

### Validação Cruzada (Backend)
```sql
SELECT COUNT(*) FROM (
  SELECT nome, cnpj FROM clientes
  UNION ALL
  SELECT nome, cnpj FROM concorrentes
) AS combined
WHERE LOWER(TRIM(nome)) = LOWER(TRIM(?))
   OR (cnpj IS NOT NULL AND cnpj = ?);
-- Se COUNT > 0, DESCARTAR o lead
```

---

## 🎯 Sistema de Controle e Checkpoint

### Tabela de Controle: `enrichment_runs`
```sql
CREATE TABLE enrichment_runs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  projectId INT NOT NULL,
  status ENUM('running', 'paused', 'completed', 'error') DEFAULT 'running',
  currentStep ENUM('clientes', 'mercados', 'produtos', 'concorrentes', 'leads'),
  totalClients INT NOT NULL,
  processedClients INT DEFAULT 0,
  progress DECIMAL(5,2) DEFAULT 0,
  startedAt TIMESTAMP DEFAULT NOW(),
  completedAt TIMESTAMP NULL,
  errorMessage TEXT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Controle de Execução
```json
{
  "enrichmentRunId": 1,
  "projectId": 1,
  "status": "running",
  "currentStep": "clientes",
  "totalClients": 801,
  "processedClients": 150,
  "progress": 18.7,
  "startedAt": "2025-11-19T16:30:00Z",
  "estimatedCompletion": "2025-11-20T04:18:00Z"
}
```

### Checkpoint Entre Etapas
- ✅ Salvar progresso após cada cliente processado
- ✅ Permitir pausar/retomar em qualquer etapa
- ✅ Rollback automático em caso de erro crítico
- ✅ Notificações a cada 25% de progresso (200 clientes)

---

## 📈 Métricas de Qualidade

### Score de Qualidade (0-100)

**Clientes**:
```javascript
const weights = {
  cnpj: 15,
  email: 10,
  telefone: 8,
  siteOficial: 10,
  linkedin: 7,
  cidade: 5,
  uf: 5,
  regiao: 5,
  cnae: 10,
  porte: 10,
  faturamentoDeclarado: 10,
  numeroEstabelecimentos: 5
};
```

**Concorrentes**:
```javascript
const weights = {
  cnpj: 20,
  site: 15,
  produto: 15,
  cidade: 5,
  uf: 5,
  porte: 10,
  faturamentoDeclarado: 15,
  numeroEstabelecimentos: 5,
  faturamentoEstimado: 10
};
```

**Leads**:
```javascript
const weights = {
  cnpj: 15,
  email: 15,
  telefone: 10,
  site: 10,
  cidade: 5,
  uf: 5,
  tipo: 10,
  porte: 10,
  faturamentoDeclarado: 10,
  numeroEstabelecimentos: 5,
  setor: 5
};
```

### Classificação
- **90-100**: Excelente (dados completos e validados)
- **70-89**: Bom (maioria dos campos preenchidos)
- **50-69**: Regular (campos essenciais preenchidos)
- **0-49**: Ruim (muitos campos faltando)

---

## 🚀 Resumo de Execução

### Estimativas Finais
- **Clientes enriquecidos**: 801
- **Mercados únicos**: ~1.401
- **Produtos**: ~6.006
- **Concorrentes únicos**: ~1.602
- **Leads únicos**: ~2.403
- **TOTAL**: ~12.213 registros

### Tempo Estimado
- **Etapa 1**: ~2,7h (801 clientes × 12s)
- **Etapa 2**: ~2,2h (801 clientes × 10s)
- **Etapa 3**: ~3,3h (2.002 mercados × 6s)
- **Etapa 4**: ~1,8h (801 clientes × 8s)
- **Etapa 5**: ~1,8h (801 clientes × 8s)
- **TOTAL**: ~11,8 horas

### Custo Estimado
- **Input**: 2,8M tokens
- **Output**: 3,8M tokens
- **Total**: 6,6M tokens
- **Custo**: ~$1,00 USD

---

## ✅ Checklist de Implementação

### Backend
- [ ] Criar funções de enriquecimento em `server/enrichment.ts`
- [ ] Criar routers tRPC para enriquecimento
- [ ] Implementar sistema de controle e checkpoint
- [ ] Implementar validações cruzadas (cliente ≠ concorrente ≠ lead)
- [ ] Implementar cálculo de qualidadeScore
- [ ] Criar logs detalhados de execução

### Testes
- [ ] Teste 1: Enriquecer 1 cliente completo (todas as 5 etapas)
- [ ] Teste 2: Enriquecer 10 clientes (validar unicidade e performance)
- [ ] Teste 3: Enriquecer 50 clientes (validar checkpoint e retomada)

---

**Sistema pronto para implementação! 🚀**
