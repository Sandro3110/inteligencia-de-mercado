# Lógica de Enriquecimento Modular - Gemini LLM

## 📋 Visão Geral

Sistema de enriquecimento sequencial em 5 etapas usando **apenas Gemini LLM**, processando 801 clientes base com regras de unicidade em cada camada.

---

## 🔄 Fluxo Sequencial

```
CLIENTES (801) 
    ↓ Etapa 1: Enriquecimento
CLIENTES ENRIQUECIDOS (801)
    ↓ Etapa 2: Identificação
MERCADOS ÚNICOS (N)
    ↓ Etapa 3: Mapeamento
PRODUTOS (cliente × produto × mercado)
    ↓ Etapa 4: Busca
CONCORRENTES ÚNICOS (M)
    ↓ Etapa 5: Busca Semântica
LEADS B2B/B2C/B2B2C (P)
```

---

## 📊 Etapa 1: Enriquecimento de Clientes

### Objetivo
Preencher campos vazios da tabela `clientes` usando dados existentes (nome, CNPJ, produtoPrincipal).

### Input
```json
{
  "nome": "Empresa XYZ Ltda",
  "cnpj": "12.345.678/0001-90",
  "produtoPrincipal": "Embalagens plásticas"
}
```

### Prompt Gemini
```
Você é um especialista em inteligência de mercado B2B brasileiro.

Com base nos dados abaixo, preencha os campos faltantes:
- Nome: {nome}
- CNPJ: {cnpj}
- Produto Principal: {produtoPrincipal}

Retorne um JSON com:
{
  "siteOficial": "URL do site oficial (pesquise se necessário)",
  "segmentacaoB2bB2c": "B2B | B2C | B2B2C",
  "email": "email de contato comercial",
  "telefone": "telefone principal",
  "linkedin": "URL do LinkedIn da empresa",
  "instagram": "URL do Instagram (se aplicável)",
  "cidade": "cidade da sede",
  "uf": "UF da sede",
  "cnae": "código CNAE principal",
  "porte": "MEI | Pequena | Média | Grande"
}

Seja preciso e use dados reais. Se não encontrar, retorne null.
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
  "cnae": "2222-6/00",
  "porte": "Média"
}
```

### Regras
- ✅ Atualizar apenas campos NULL/vazios
- ✅ Manter dados existentes intactos
- ✅ Validar formato de email, telefone, URLs
- ✅ Calcular qualidadeScore (0-100) baseado em campos preenchidos

---

## 📊 Etapa 2: Identificação de Mercados

### Objetivo
Identificar todos os mercados em que o cliente atua e criar registros únicos na tabela `mercados_unicos`.

### Input
```json
{
  "nome": "Empresa XYZ Ltda",
  "produtoPrincipal": "Embalagens plásticas",
  "segmentacaoB2bB2c": "B2B",
  "cnae": "2222-6/00"
}
```

### Prompt Gemini
```
Você é um especialista em segmentação de mercado B2B brasileiro.

Analise a empresa abaixo e identifique TODOS os mercados em que ela atua:
- Nome: {nome}
- Produto Principal: {produtoPrincipal}
- Segmentação: {segmentacaoB2bB2c}
- CNAE: {cnae}

Retorne um array JSON com 1-5 mercados:
[
  {
    "nome": "Nome do mercado (ex: Embalagens Plásticas)",
    "segmentacao": "B2B | B2C | B2B2C",
    "categoria": "Categoria CNAE ou setor",
    "tamanhoMercado": "Descrição do tamanho (ex: R$ 5 bilhões/ano)",
    "crescimentoAnual": "Taxa de crescimento (ex: 8% ao ano)",
    "tendencias": "Principais tendências do mercado",
    "principaisPlayers": "Top 5 empresas do mercado"
  }
]

Seja específico e baseado em dados reais do mercado brasileiro.
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
    "tendencias": "Sustentabilidade, plástico biodegradável, economia circular",
    "principaisPlayers": "Braskem, Amcor, Bemis, Sealed Air, Dixie Toga"
  },
  {
    "nome": "Embalagens para Cosméticos",
    "segmentacao": "B2B",
    "categoria": "Indústria de Transformação - Plásticos",
    "tamanhoMercado": "R$ 3 bilhões/ano no Brasil",
    "crescimentoAnual": "4,2% ao ano",
    "tendencias": "Embalagens premium, design diferenciado, sustentabilidade",
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

## 📊 Etapa 3: Criação de Produtos

### Objetivo
Mapear produtos específicos que o cliente oferece para cada mercado, criando chave única `cliente × produto × mercado`.

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

Analise a empresa e seus mercados de atuação:
- Cliente: {clienteNome}
- Produto Principal: {produtoPrincipal}
- Mercados: {mercados}

Para CADA mercado, liste 2-5 produtos específicos que a empresa oferece:
[
  {
    "mercadoId": 10,
    "nome": "Nome específico do produto",
    "descricao": "Descrição técnica do produto",
    "categoria": "Categoria do produto",
    "preco": "Faixa de preço estimada (ex: R$ 0,50 - R$ 2,00/unidade)",
    "unidade": "kg | litro | unidade | m² | etc"
  }
]

Seja específico e técnico. Produtos devem ser reais e comercializados no Brasil.
```

### Output Esperado
```json
[
  {
    "mercadoId": 10,
    "nome": "Pote Plástico Transparente 500ml",
    "descricao": "Pote plástico transparente em PP, tampa rosqueável, ideal para alimentos",
    "categoria": "Embalagens Rígidas",
    "preco": "R$ 0,80 - R$ 1,50/unidade",
    "unidade": "unidade"
  },
  {
    "mercadoId": 10,
    "nome": "Filme Stretch PVC para Alimentos",
    "descricao": "Filme plástico aderente para conservação de alimentos, rolo 30cm x 100m",
    "categoria": "Embalagens Flexíveis",
    "preco": "R$ 8,00 - R$ 15,00/rolo",
    "unidade": "rolo"
  },
  {
    "mercadoId": 11,
    "nome": "Frasco Airless 30ml para Cosméticos",
    "descricao": "Frasco airless em PP, sistema de bomba, ideal para cremes e séruns",
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

## 📊 Etapa 4: Busca de Concorrentes

### Objetivo
Identificar empresas concorrentes que atuam com os mesmos produtos e mercados, criando registros únicos na tabela `concorrentes`.

### Input
```json
{
  "produtos": [
    {
      "id": 1,
      "nome": "Pote Plástico Transparente 500ml",
      "mercadoId": 10,
      "mercadoNome": "Embalagens Plásticas para Alimentos"
    },
    {
      "id": 2,
      "nome": "Filme Stretch PVC para Alimentos",
      "mercadoId": 10,
      "mercadoNome": "Embalagens Plásticas para Alimentos"
    }
  ],
  "clientesExistentes": ["Empresa XYZ Ltda", "Empresa ABC S.A.", ...]
}
```

### Prompt Gemini
```
Você é um especialista em mapeamento competitivo B2B brasileiro.

Identifique 10-15 empresas CONCORRENTES que atuam com os produtos abaixo:
{produtos}

REGRAS IMPORTANTES:
- NÃO incluir empresas da lista: {clientesExistentes}
- NÃO incluir distribuidores ou revendedores (apenas fabricantes)
- Focar em empresas brasileiras
- Empresas devem ser REAIS e ativas no mercado

Retorne um array JSON:
[
  {
    "mercadoId": 10,
    "nome": "Nome da empresa concorrente",
    "cnpj": "CNPJ (se disponível, senão null)",
    "site": "URL do site oficial",
    "produto": "Principais produtos que oferece",
    "cidade": "Cidade da sede",
    "uf": "UF da sede",
    "porte": "MEI | Pequena | Média | Grande",
    "faturamentoEstimado": "Faturamento anual estimado"
  }
]

Seja preciso e use dados reais do mercado brasileiro.
```

### Output Esperado
```json
[
  {
  "mercadoId": 10,
  "nome": "Plasútil Embalagens Ltda",
  "cnpj": "98.765.432/0001-10",
  "site": "https://plasutil.com.br",
  "produto": "Potes plásticos, tampas, embalagens para alimentos",
  "cidade": "São Paulo",
  "uf": "SP",
  "porte": "Média",
  "faturamentoEstimado": "R$ 50-100 milhões/ano"
  },
  {
  "mercadoId": 10,
  "nome": "Embraplas Indústria de Plásticos",
  "cnpj": "87.654.321/0001-20",
  "site": "https://embraplas.com.br",
  "produto": "Filmes plásticos, embalagens flexíveis, stretch",
  "cidade": "Campinas",
  "uf": "SP",
  "porte": "Grande",
  "faturamentoEstimado": "R$ 200-500 milhões/ano"
  }
]
```

### Regras de Unicidade
- ✅ Hash: `nome-mercadoId` (normalizado)
- ✅ Verificar se concorrente já existe antes de inserir
- ✅ Um concorrente pode atuar em múltiplos mercados (registros separados)
- ✅ **CRÍTICO**: Concorrente NÃO pode estar na tabela `clientes`
- ✅ Validar CNPJ: se fornecido, verificar se não pertence a cliente existente
- ✅ Calcular qualidadeScore baseado em campos preenchidos

### Validação Cruzada
```sql
-- Antes de inserir concorrente, verificar:
SELECT COUNT(*) FROM clientes 
WHERE LOWER(nome) = LOWER('{nome_concorrente}') 
   OR cnpj = '{cnpj_concorrente}';

-- Se COUNT > 0, DESCARTAR o concorrente
```

---

## 📊 Etapa 5: Busca de Leads (Busca Semântica)

### Objetivo
Identificar empresas que são **potenciais compradores** dos produtos oferecidos por clientes e concorrentes (B2B, B2C ou B2B2C).

### Input
```json
{
  "produtos": [
    {
      "nome": "Pote Plástico Transparente 500ml",
      "categoria": "Embalagens Rígidas",
      "mercadoNome": "Embalagens Plásticas para Alimentos"
    },
    {
      "nome": "Filme Stretch PVC para Alimentos",
      "categoria": "Embalagens Flexíveis",
      "mercadoNome": "Embalagens Plásticas para Alimentos"
    }
  ],
  "clientesExistentes": ["Empresa XYZ Ltda", ...],
  "concorrentesExistentes": ["Plasútil Embalagens Ltda", ...]
}
```

### Prompt Gemini
```
Você é um especialista em prospecção de leads B2B/B2C brasileiro.

Analise os produtos abaixo e identifique 15-20 empresas que são POTENCIAIS COMPRADORES:
{produtos}

REGRAS DE BUSCA SEMÂNTICA:
- Quem COMPRA esses produtos? (não quem fabrica)
- Exemplos para "Embalagens Plásticas para Alimentos":
  * Indústrias alimentícias (laticínios, doces, congelados)
  * Restaurantes e food services
  * Supermercados e atacadistas
  * Marcas de alimentos (B2B)
  * Consumidores finais (B2C - se aplicável)

REGRAS IMPORTANTES:
- NÃO incluir empresas das listas: {clientesExistentes} e {concorrentesExistentes}
- Focar em empresas brasileiras REAIS e ativas
- Diversificar portes (pequenas, médias, grandes)
- Incluir diferentes segmentos (B2B, B2C, B2B2C)

Retorne um array JSON:
[
  {
    "mercadoId": 10,
    "nome": "Nome da empresa lead",
    "cnpj": "CNPJ (se disponível, senão null)",
    "site": "URL do site oficial",
    "email": "Email de contato comercial",
    "telefone": "Telefone principal",
    "tipo": "Cliente Potencial | Parceiro | Distribuidor",
    "cidade": "Cidade da sede",
    "uf": "UF da sede",
    "porte": "MEI | Pequena | Média | Grande",
    "regiao": "Região de atuação",
    "setor": "Setor de atuação (ex: Alimentos e Bebidas)"
  }
]

Seja preciso e use dados reais do mercado brasileiro.
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
  "regiao": "Sudeste",
  "setor": "Varejo - Supermercados"
  },
  {
  "mercadoId": 10,
  "nome": "Doceria Artesanal Doce Sabor",
  "cnpj": null,
  "site": "https://docesabor.com.br",
  "email": "contato@docesabor.com.br",
  "telefone": "(11) 98765-4321",
  "tipo": "Cliente Potencial",
  "cidade": "São Paulo",
  "uf": "SP",
  "porte": "Pequena",
  "regiao": "Sudeste",
  "setor": "Alimentos e Bebidas - Confeitaria"
  }
]
```

### Regras de Unicidade
- ✅ Hash: `nome-mercadoId` (normalizado)
- ✅ Verificar se lead já existe antes de inserir
- ✅ Um lead pode atuar em múltiplos mercados (registros separados)
- ✅ **CRÍTICO**: Lead NÃO pode estar nas tabelas `clientes` ou `concorrentes`
- ✅ Validar CNPJ: se fornecido, verificar se não pertence a cliente/concorrente
- ✅ Calcular qualidadeScore baseado em campos preenchidos

### Validação Cruzada
```sql
-- Antes de inserir lead, verificar:
SELECT COUNT(*) FROM (
  SELECT nome, cnpj FROM clientes
  UNION ALL
  SELECT nome, cnpj FROM concorrentes
) AS combined
WHERE LOWER(nome) = LOWER('{nome_lead}') 
   OR (cnpj IS NOT NULL AND cnpj = '{cnpj_lead}');

-- Se COUNT > 0, DESCARTAR o lead
```

---

## 🎯 Sistema de Controle e Checkpoint

### Controle de Execução
```json
{
  "enrichmentRunId": 1,
  "projectId": 1,
  "status": "running | paused | completed | error",
  "currentStep": "clientes | mercados | produtos | concorrentes | leads",
  "totalClients": 801,
  "processedClients": 150,
  "progress": 18.7,
  "startedAt": "2025-11-19T16:30:00Z",
  "estimatedCompletion": "2025-11-19T20:45:00Z"
}
```

### Checkpoint Entre Etapas
- ✅ Salvar progresso após cada cliente processado
- ✅ Permitir pausar/retomar em qualquer etapa
- ✅ Rollback automático em caso de erro crítico
- ✅ Notificações a cada 25% de progresso (200 clientes)

### Logs Detalhados
```json
{
  "timestamp": "2025-11-19T16:35:22Z",
  "clienteId": 45,
  "clienteNome": "Empresa XYZ Ltda",
  "step": "mercados",
  "action": "created",
  "details": {
    "mercadosCriados": 2,
    "mercadosReusados": 1,
    "produtosCriados": 5
  }
}
```

---

## 📈 Métricas de Qualidade

### Score de Qualidade (0-100)
```javascript
function calculateQualityScore(entity) {
  const weights = {
    // Clientes
    cnpj: 20,
    email: 15,
    telefone: 10,
    site: 15,
    linkedin: 10,
    cidade: 5,
    uf: 5,
    cnae: 10,
    porte: 10,
    
    // Concorrentes
    cnpj: 25,
    site: 20,
    produto: 15,
    porte: 15,
    faturamentoEstimado: 25,
    
    // Leads
    cnpj: 20,
    email: 20,
    telefone: 15,
    site: 15,
    tipo: 10,
    porte: 10,
    setor: 10
  };
  
  let score = 0;
  for (const field in weights) {
    if (entity[field] && entity[field] !== null && entity[field] !== '') {
      score += weights[field];
    }
  }
  return score;
}
```

### Classificação
- **90-100**: Excelente (dados completos e validados)
- **70-89**: Bom (maioria dos campos preenchidos)
- **50-69**: Regular (campos essenciais preenchidos)
- **0-49**: Ruim (muitos campos faltando)

---

## 🚀 Resumo de Execução

### Ordem de Processamento
1. **Etapa 1**: Enriquecer 801 clientes (preencher campos vazios)
2. **Etapa 2**: Identificar mercados únicos (1-5 por cliente → ~1.000-2.000 mercados)
3. **Etapa 3**: Criar produtos (2-5 por mercado → ~3.000-8.000 produtos)
4. **Etapa 4**: Buscar concorrentes (10-15 por produto → ~10.000-20.000 concorrentes únicos)
5. **Etapa 5**: Buscar leads (15-20 por produto → ~15.000-30.000 leads únicos)

### Tempo Estimado
- **Etapa 1**: ~2-3 horas (801 clientes × 10-15s/cliente)
- **Etapa 2**: ~2-3 horas (801 clientes × 10-15s/cliente)
- **Etapa 3**: ~3-4 horas (2.000 mercados × 5-8s/mercado)
- **Etapa 4**: ~6-8 horas (8.000 produtos × 3-5s/produto)
- **Etapa 5**: ~8-10 horas (8.000 produtos × 4-6s/produto)

**Total**: ~21-28 horas de processamento contínuo

### Custos Estimados (Gemini API)
- **Input**: ~50M tokens (prompts + contexto)
- **Output**: ~30M tokens (respostas JSON)
- **Total**: ~80M tokens × $0.00015/1k tokens = **~$12 USD**

---

## ✅ Validações Finais

### Antes de Aprovar
- [ ] Prompts Gemini estão claros e específicos?
- [ ] Regras de unicidade estão bem definidas?
- [ ] Validações cruzadas (cliente ≠ concorrente ≠ lead) estão corretas?
- [ ] Sistema de checkpoint está robusto?
- [ ] Métricas de qualidade fazem sentido?
- [ ] Tempo e custo estimados são aceitáveis?

### Ajustes Possíveis
- Quantidade de concorrentes/leads por produto
- Campos obrigatórios vs opcionais
- Pesos do score de qualidade
- Frequência de checkpoints
- Critérios de validação cruzada

---

**Aguardando sua aprovação para iniciar a implementação! 🚀**
