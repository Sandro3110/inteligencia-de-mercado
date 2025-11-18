# Fluxo Automatizado de Enriquecimento de Dados

## 📋 Visão Geral

O Fluxo de Enriquecimento é um processo automatizado que transforma uma lista simples de clientes em um projeto completo com dados enriquecidos, mercados identificados, concorrentes e leads qualificados.

## 🎯 Objetivo

Permitir que o usuário:
1. Insira uma lista de clientes (nome, CNPJ, site, produto)
2. Dispare um processo automatizado que:
   - Identifica mercados/setores automaticamente
   - Enriquece dados via APIs públicas
   - Busca concorrentes e leads
   - Calcula scores de qualidade
3. Receba um novo projeto pronto para análise

## 🔄 Etapas do Fluxo

### 1. Criação do Projeto
**Entrada:** Nome do projeto  
**Processo:** Cria um novo registro na tabela `projects`  
**Saída:** `projectId` para associar todos os dados

### 2. Identificação de Mercados
**Entrada:** Lista de produtos dos clientes  
**Processo:**  
- Extrai produtos únicos da lista
- Para cada produto, usa LLM (GPT-4) para identificar:
  - Nome do mercado/setor
  - Categoria
  - Segmentação (B2B/B2C/B2B2C)
- Cria registros únicos na tabela `mercados_unicos`

**API Utilizada:** Manus Forge LLM API  
**Prompt Example:**
```
Produto: Embalagens plásticas para alimentos

Retorne JSON com:
{
  "mercado": "Indústria de Embalagens Plásticas",
  "categoria": "Embalagens",
  "segmentacao": "B2B"
}
```

### 3. Enriquecimento de Clientes
**Entrada:** Lista de clientes com dados parciais  
**Processo:**  
- Para cada cliente:
  1. Identifica o mercado correspondente (via LLM)
  2. Se tiver CNPJ, busca dados via ReceitaWS/Data API:
     - Razão social completa
     - Endereço (cidade, UF)
     - CNAE
     - Porte da empresa
  3. Calcula score de qualidade (0-100)
  4. Cria registro na tabela `clientes`
  5. Associa cliente ao mercado (`clientes_mercados`)

**APIs Utilizadas:**
- Manus Forge LLM API (identificação de mercado)
- Manus Forge Data API (enriquecimento de CNPJ)

**Cálculo de Qualidade:**
```typescript
// Pesos dos campos (total = 100 pontos)
- nome: 10 pontos
- cnpj válido: 15 pontos
- site: 10 pontos
- email: 10 pontos
- telefone: 10 pontos
- cidade/uf: 10 pontos
- cnae: 10 pontos
- porte: 10 pontos
- produto: 10 pontos
- linkedin/instagram: 5 pontos cada
```

**Classificação:**
- 80-100: Excelente
- 60-79: Bom
- 40-59: Regular
- 0-39: Ruim

### 4. Busca de Concorrentes
**Entrada:** Lista de mercados identificados  
**Processo:**  
- Para cada mercado:
  1. Usa LLM para gerar lista de concorrentes potenciais
  2. Para cada concorrente:
     - Busca dados via Data API
     - Calcula score de qualidade
     - Cria registro na tabela `concorrentes`

**API Utilizada:** Manus Forge LLM API + Data API

**Prompt Example:**
```
Mercado: Indústria de Embalagens Plásticas
Segmentação: B2B

Liste 5 principais concorrentes neste mercado no Brasil.
Retorne JSON com:
{
  "concorrentes": [
    {
      "nome": "Nome da empresa",
      "produto": "Produto principal",
      "porte": "Grande|Média|Pequena"
    }
  ]
}
```

### 5. Busca de Leads
**Entrada:** Lista de mercados identificados  
**Processo:**  
- Para cada mercado:
  1. Identifica segmentação (B2B/B2C)
  2. Usa LLM para gerar lista de leads qualificados
  3. Para cada lead:
     - Busca dados via Data API
     - Calcula score de qualidade
     - Define stage inicial: "novo"
     - Cria registro na tabela `leads`

**API Utilizada:** Manus Forge LLM API + Data API

**Critérios de Qualificação:**
- B2B: Empresas com perfil de comprador corporativo
- B2C: Empresas com perfil de consumidor final
- Porte compatível com o mercado
- Região de atuação relevante

### 6. Cálculo de Estatísticas
**Processo:**  
- Conta total de registros criados:
  - Mercados
  - Clientes
  - Concorrentes
  - Leads
- Calcula score médio de qualidade dos clientes
- Gera resumo do processamento

### 7. Finalização
**Saída:**  
```json
{
  "status": "completed",
  "message": "Processamento concluído com sucesso!",
  "data": {
    "projectId": 1,
    "mercadosCount": 3,
    "clientesCount": 15,
    "concorrentesCount": 12,
    "leadsCount": 25,
    "avgQualityScore": 72
  }
}
```

## 🖥️ Interface Web

### Acesso
URL: `/enrichment`

### Campos de Input

**1. Nome do Projeto**
- Campo obrigatório
- Máximo 255 caracteres
- Exemplo: "Embalagens 2024"

**2. Lista de Clientes**
- Formato: `Nome|CNPJ|Site|Produto` (um por linha)
- CNPJ, Site e Produto são opcionais
- Exemplo:
```
Empresa ABC|12.345.678/0001-90|www.empresaabc.com.br|Embalagens plásticas
Indústria XYZ|98.765.432/0001-10|www.industriaxyz.com|Caixas de papelão
Fábrica 123||www.fabrica123.com|Embalagens metálicas
```

### Botão de Ação
- **Texto:** "Iniciar Processamento"
- **Ação:** Dispara o fluxo completo
- **Estado:** Desabilitado durante processamento
- **Feedback:** Spinner + "Processando..."

### Resultado
Após conclusão, exibe:
- ✅ Status de sucesso/erro
- ✅ Estatísticas do processamento
- ✅ Botão "Ver Projeto Criado" (redireciona para o projeto)

## 🔧 Implementação Técnica

### Backend

**Arquivo:** `server/enrichmentFlow.ts`  
**Função Principal:** `executeEnrichmentFlow(input, onProgress)`

**Parâmetros:**
```typescript
type EnrichmentInput = {
  clientes: Array<{
    nome: string;
    cnpj?: string;
    site?: string;
    produto?: string;
  }>;
  projectName: string;
};
```

**Callback de Progresso:**
```typescript
type ProgressCallback = (progress: {
  status: 'processing' | 'completed' | 'error';
  message: string;
  currentStep: number;
  totalSteps: number;
  data?: {...};
}) => void;
```

### Router tRPC

**Endpoint:** `enrichment.execute`  
**Tipo:** Mutation  
**Input:** `EnrichmentInput`  
**Output:** `EnrichmentProgress`

**Exemplo de Uso:**
```typescript
const result = await trpc.enrichment.execute.mutateAsync({
  projectName: "Meu Projeto",
  clientes: [
    { nome: "Empresa A", cnpj: "12345678000190", produto: "Embalagens" }
  ]
});
```

### Frontend

**Arquivo:** `client/src/pages/EnrichmentFlow.tsx`  
**Componentes Utilizados:**
- `Card` - Container principal
- `Input` - Campo de nome do projeto
- `textarea` - Lista de clientes
- `Button` - Ação de processar
- `Alert` - Exibição de resultado

## 📊 Diagrama do Fluxo

```
┌─────────────────┐
│  Input Clientes │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Criar Projeto   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Identificar     │◄─── LLM API
│ Mercados        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Enriquecer      │◄─── Data API
│ Clientes        │     (ReceitaWS)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Buscar          │◄─── LLM API
│ Concorrentes    │     + Data API
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Buscar Leads    │◄─── LLM API
│                 │     + Data API
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Calcular        │
│ Estatísticas    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Projeto Criado  │
│ (Pronto!)       │
└─────────────────┘
```

## 🚀 Melhorias Futuras

### 1. Upload de Planilha
- Permitir upload de arquivo Excel/CSV
- Mapear colunas automaticamente
- Validar dados antes do processamento

### 2. Progresso em Tempo Real
- Implementar WebSockets ou Server-Sent Events
- Exibir barra de progresso detalhada
- Mostrar cada etapa sendo executada

### 3. Configuração Avançada
- Permitir escolher quais etapas executar
- Configurar quantidade de concorrentes/leads
- Definir critérios de qualificação personalizados

### 4. Validação Pré-Processamento
- Validar CNPJs antes de iniciar
- Verificar duplicatas
- Sugerir correções automáticas

### 5. Relatório Detalhado
- Gerar PDF com resumo do processamento
- Incluir gráficos de distribuição
- Listar problemas encontrados

## 📝 Notas de Implementação

### Limitações Atuais
1. **Busca de Concorrentes e Leads:** Implementação simplificada (retorna arrays vazios)
2. **Progresso em Tempo Real:** Não implementado (apenas resultado final)
3. **Validação de CNPJ:** Básica (apenas formato)
4. **Tratamento de Erros:** Genérico (pode ser melhorado)

### Próximos Passos
1. Implementar busca real de concorrentes via LLM
2. Implementar busca real de leads via Data API
3. Adicionar validação robusta de dados
4. Criar testes unitários para cada etapa
5. Adicionar logs detalhados para debugging

## 🔗 Referências

- **Documentação de APIs:** `/DOCUMENTACAO_REGRAS_E_APIS.md`
- **Cálculo de Qualidade:** `shared/qualityScore.ts`
- **Schema do Banco:** `drizzle/schema.ts`
- **Routers tRPC:** `server/routers.ts`
