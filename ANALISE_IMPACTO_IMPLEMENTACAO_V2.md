# Análise de Impacto - Implementação Sistema V2

**Autor:** Manus AI  
**Data:** 30 de novembro de 2024  
**Objetivo:** Mapear mudanças necessárias para implementar Sistema de Enriquecimento V2

---

## Sumário Executivo

A implementação do Sistema de Enriquecimento V2 requer mudanças **APENAS no backend**, especificamente no processo de enriquecimento (`/app/api/enrichment/process/route.ts`). **O frontend NÃO precisa ser alterado**, pois a estrutura de dados (schema das tabelas) permanece compatível.

**Principais Conclusões:**

1. ✅ **Frontend:** Nenhuma mudança necessária (100% compatível)
2. ✅ **Schema do Banco:** Nenhuma mudança necessária (campos já existem)
3. ⚠️ **Backend:** Substituir função `generateAllDataOptimized()` por Sistema V2 (5 prompts modulares)
4. ⚠️ **Processo:** Adicionar geocodificação automática e gravação de produtos

**Complexidade:** Baixa (apenas 1 arquivo principal a modificar)  
**Risco:** Baixo (mudança isolada, sem impacto em outras partes)  
**Tempo Estimado:** 2-4 horas de desenvolvimento + 1-2 horas de testes

---

## 1. Análise do Frontend

### 1.1 Componentes que Consomem Dados Enriquecidos

Foram identificados 3 componentes principais que exibem dados enriquecidos:

| Componente     | Caminho                                                        | Dados Consumidos                                      |
| -------------- | -------------------------------------------------------------- | ----------------------------------------------------- |
| **Dashboard**  | `/app/(app)/dashboard/page.tsx`                                | KPIs (contadores de leads, concorrentes, mercados)    |
| **Mapa**       | `/app/(app)/map/page.tsx`                                      | Localização de clientes, leads e concorrentes         |
| **Resultados** | `/app/(app)/projects/[id]/surveys/[surveyId]/results/page.tsx` | Listagens de leads, concorrentes, produtos e mercados |

### 1.2 Campos Utilizados pelo Frontend

**Leads:**

- `nome`, `setor`, `cidade`, `uf`, `site`, `email`, `telefone`
- `qualidadeScore`, `qualidadeClassificacao`, `leadStage`
- `validationStatus`

**Concorrentes:**

- `nome`, `descricao`, `cidade`, `uf`, `site`
- `porte`, `faturamentoEstimado`, `setor`
- `qualidadeScore`, `qualidadeClassificacao`, `validationStatus`

**Produtos:**

- `nome`, `descricao`, `categoria`, `preco`, `unidade`

**Mercados:**

- `nome`, `categoria`, `segmentacao`, `tamanhoMercado`
- `crescimentoAnual`, `tendencias`, `principaisPlayers`

### 1.3 Compatibilidade com Sistema V2

✅ **100% COMPATÍVEL**

Todos os campos utilizados pelo frontend já existem no schema do banco de dados e serão preenchidos pelo Sistema V2. Nenhuma mudança é necessária no frontend.

**Campos Novos do V2 (não utilizados pelo frontend atual):**

- `mercados.tendencias` (array de 5 tendências) - **JÁ EXISTE** no schema como `text`
- `mercados.principaisPlayers` (array de 10 players) - **JÁ EXISTE** no schema como `text`
- `mercados.crescimentoAnual` (percentual) - **JÁ EXISTE** no schema como `text`

**Conclusão:** O frontend continuará funcionando normalmente sem nenhuma alteração.

---

## 2. Análise do Schema do Banco

### 2.1 Tabelas Afetadas

| Tabela              | Campos Atuais                                                                                 | Campos V2                         | Status        |
| ------------------- | --------------------------------------------------------------------------------------------- | --------------------------------- | ------------- |
| **clientes**        | nome, cnpj, site, cidade, uf, setor, descricao                                                | Mesmos campos                     | ✅ Compatível |
| **leads**           | nome, cnpj, site, cidade, uf, setor, email, telefone                                          | Mesmos campos                     | ✅ Compatível |
| **concorrentes**    | nome, cnpj, site, cidade, uf, setor, produto, porte                                           | Mesmos campos                     | ✅ Compatível |
| **produtos**        | nome, descricao, categoria, preco, unidade                                                    | Mesmos campos                     | ✅ Compatível |
| **mercados_unicos** | nome, categoria, segmentacao, tamanhoMercado, crescimentoAnual, tendencias, principaisPlayers | Mesmos campos + novos preenchidos | ✅ Compatível |

### 2.2 Campos Adicionais do V2

O Sistema V2 preenche campos que já existem no schema mas não eram preenchidos pelo sistema atual:

**mercados_unicos:**

- `crescimentoAnual` (text) - **JÁ EXISTE**, V2 irá preencher
- `tendencias` (text) - **JÁ EXISTE**, V2 irá preencher como JSON array
- `principaisPlayers` (text) - **JÁ EXISTE**, V2 irá preencher como JSON array

**produtos:**

- `nome`, `descricao`, `categoria` - **JÁ EXISTEM**, V2 irá preencher (sistema atual não gera produtos)

### 2.3 Migrações Necessárias

✅ **NENHUMA MIGRAÇÃO NECESSÁRIA**

Todos os campos necessários já existem no schema. O Sistema V2 apenas irá preencher campos que antes ficavam vazios.

---

## 3. Análise do Backend

### 3.1 Arquivo Principal a Modificar

**`/app/api/enrichment/process/route.ts`**

Este é o **único arquivo** que precisa ser modificado para implementar o Sistema V2.

### 3.2 Função Atual vs Sistema V2

**ATUAL:**

```typescript
async function generateAllDataOptimized(cliente: Cliente, apiKey: string): Promise<any> {
  // 1 prompt único que gera tudo de uma vez
  // Retorna: { clienteEnriquecido, mercados: [{ mercado, concorrentes, leads }] }
}
```

**SISTEMA V2:**

```typescript
// 5 prompts modulares
async function prompt1_enriquecerCliente(cliente: Cliente): Promise<ClienteEnriquecido>;
async function prompt2_identificarMercado(cliente: ClienteEnriquecido): Promise<Mercado>;
async function prompt3_enriquecerMercado(mercado: Mercado): Promise<MercadoEnriquecido>;
async function prompt4_identificarConcorrentes(mercado: MercadoEnriquecido): Promise<Concorrente[]>;
async function prompt5_identificarLeads(
  mercado: MercadoEnriquecido,
  concorrentes: Concorrente[]
): Promise<Lead[]>;
```

### 3.3 Mudanças Necessárias

**3.3.1 Substituir `generateAllDataOptimized()`**

Remover a função atual e substituir pelas 5 funções do Sistema V2 (já implementadas em `/prompts_v2/`).

**3.3.2 Adicionar Geocodificação**

Após Prompt 1, adicionar chamada para geocodificação automática:

```typescript
const clienteEnriquecido = await prompt1_enriquecerCliente(cliente);

// Geocodificar se cidade/UF foram preenchidos
if (clienteEnriquecido.cidade && clienteEnriquecido.uf) {
  const coords = await geocodificar(clienteEnriquecido.cidade, clienteEnriquecido.uf);
  clienteEnriquecido.latitude = coords.lat;
  clienteEnriquecido.longitude = coords.lng;
}
```

**3.3.3 Adicionar Gravação de Produtos**

Após Prompt 2, adicionar inserção de produtos no banco:

```typescript
const produtos = await prompt2_identificarProdutos(clienteEnriquecido);

for (const produto of produtos) {
  await db.insert(produtos).values({
    projectId: pesquisa.projectId,
    pesquisaId,
    clienteId: cliente.id,
    mercadoId: mercado.id,
    ...produto,
  });
}
```

**3.3.4 Implementar Ciclo Fechado (Leads)**

Modificar Prompt 5 para considerar `principaisPlayers` do mercado:

```typescript
const leads = await prompt5_identificarLeads(
  mercadoEnriquecido,
  concorrentes,
  mercadoEnriquecido.principaisPlayers // <-- Novo parâmetro
);
```

### 3.4 Estrutura do Novo Processo

```
1. Buscar cliente
2. Prompt 1: Enriquecer cliente (nome, CNPJ, site, cidade, UF, setor, descrição)
3. Geocodificação: Obter lat/lng se cidade/UF preenchidos
4. Gravar cliente enriquecido no banco
5. Prompt 2: Identificar mercado (nome, categoria, segmentação, tamanho)
6. Gravar mercado no banco
7. Prompt 3: Enriquecer mercado (crescimento, tendências, players)
8. Atualizar mercado no banco
9. Prompt 2b: Identificar produtos (3 produtos)
10. Gravar produtos no banco
11. Prompt 4: Identificar concorrentes (5 concorrentes)
12. Gravar concorrentes no banco
13. Prompt 5: Identificar leads (5 leads, aproveitando players)
14. Gravar leads no banco
15. Atualizar job com progresso
```

---

## 4. Análise de APIs e Routers

### 4.1 Routers tRPC Afetados

✅ **NENHUM ROUTER PRECISA SER MODIFICADO**

Os routers tRPC (`/server/routers.ts` e `/server/routers/results.ts`) apenas consultam dados do banco. Como o schema permanece compatível, os routers continuarão funcionando normalmente.

**Routers Analisados:**

- `results.getLeads` - ✅ Compatível
- `results.getConcorrentes` - ✅ Compatível
- `results.getMercados` - ✅ Compatível
- `produtos.byCliente` - ✅ Compatível
- `produtos.byMercado` - ✅ Compatível
- `analytics.*` - ✅ Compatível

### 4.2 Funções de Banco Afetadas

✅ **NENHUMA FUNÇÃO PRECISA SER MODIFICADA**

As funções de consulta em `/server/db.ts` apenas leem dados do banco. Como o schema permanece compatível, as funções continuarão funcionando normalmente.

**Funções Analisadas:**

- `getMercados()` - ✅ Compatível
- `getLeadsByMercado()` - ✅ Compatível
- `getConcorrentesByMercado()` - ✅ Compatível
- `getProdutosByCliente()` - ✅ Compatível
- `getAllLeads()` - ✅ Compatível

---

## 5. Resumo de Mudanças

### 5.1 O que NÃO Precisa Mudar

✅ **Frontend (0 arquivos)**

- Nenhum componente React
- Nenhuma página
- Nenhum hook ou context

✅ **Schema do Banco (0 migrações)**

- Nenhuma tabela nova
- Nenhum campo novo
- Nenhuma migração

✅ **Routers tRPC (0 arquivos)**

- Nenhum endpoint
- Nenhuma validação
- Nenhum tipo

✅ **Funções de Banco (0 arquivos)**

- Nenhuma query
- Nenhum helper
- Nenhuma agregação

### 5.2 O que Precisa Mudar

⚠️ **Backend (1 arquivo principal)**

**`/app/api/enrichment/process/route.ts`**

- [ ] Substituir `generateAllDataOptimized()` por 5 prompts modulares
- [ ] Adicionar geocodificação após Prompt 1
- [ ] Adicionar gravação de produtos após Prompt 2
- [ ] Implementar ciclo fechado em Prompt 5
- [ ] Ajustar estrutura de retorno dos prompts
- [ ] Atualizar logs e tratamento de erros

**Arquivos Novos a Criar:**

- [ ] `/app/api/enrichment/prompts_v2.ts` - Implementação dos 5 prompts
- [ ] `/app/api/enrichment/geocoding.ts` - Função de geocodificação
- [ ] `/app/api/enrichment/types.ts` - Tipos TypeScript do V2

**Arquivos de Teste:**

- [ ] `/app/api/enrichment/__tests__/prompts_v2.test.ts` - Testes unitários
- [ ] `/app/api/enrichment/__tests__/integration.test.ts` - Testes de integração

### 5.3 Estimativa de Esforço

| Tarefa                               | Complexidade | Tempo Estimado |
| ------------------------------------ | ------------ | -------------- |
| Criar `/prompts_v2.ts` com 5 prompts | Média        | 2 horas        |
| Criar `/geocoding.ts`                | Baixa        | 30 minutos     |
| Criar `/types.ts`                    | Baixa        | 30 minutos     |
| Modificar `/route.ts`                | Média        | 1 hora         |
| Criar testes unitários               | Média        | 1 hora         |
| Criar testes de integração           | Alta         | 1 hora         |
| Testar manualmente                   | Baixa        | 1 hora         |
| **TOTAL**                            | -            | **7 horas**    |

---

## 6. Plano de Implementação

### 6.1 Fase 1: Preparação (1 hora)

**1.1 Criar Estrutura de Arquivos**

```bash
mkdir -p /app/api/enrichment/__tests__
touch /app/api/enrichment/prompts_v2.ts
touch /app/api/enrichment/geocoding.ts
touch /app/api/enrichment/types.ts
```

**1.2 Copiar Prompts do Diretório `/prompts_v2/`**

- Copiar conteúdo de `prompt1_cliente.ts` → `prompts_v2.ts`
- Copiar conteúdo de `prompt2_mercado.ts` → `prompts_v2.ts`
- Copiar conteúdo de `prompt3_mercado_enriquecimento.ts` → `prompts_v2.ts`
- Copiar conteúdo de `prompt4_concorrentes.ts` → `prompts_v2.ts`
- Copiar conteúdo de `prompt5_leads.ts` → `prompts_v2.ts`

**1.3 Definir Tipos TypeScript**

```typescript
// types.ts
export interface ClienteEnriquecido {
  nome: string;
  cnpj: string | null;
  site: string | null;
  cidade: string;
  uf: string;
  setor: string;
  descricao: string;
  latitude?: number;
  longitude?: number;
}

export interface Mercado {
  nome: string;
  categoria: string;
  segmentacao: string;
  tamanhoMercado: string;
}

export interface MercadoEnriquecido extends Mercado {
  crescimentoAnual: string;
  tendencias: string[];
  principaisPlayers: string[];
}

export interface Produto {
  nome: string;
  descricao: string;
  publicoAlvo: string;
  diferenciais: string[];
}

export interface Concorrente {
  nome: string;
  cnpj: string | null;
  site: string | null;
  cidade: string;
  uf: string;
  produtoPrincipal: string;
}

export interface Lead {
  nome: string;
  cnpj: string | null;
  site: string | null;
  cidade: string;
  uf: string;
  produtoInteresse: string;
  fonte: 'PLAYER_DO_MERCADO' | 'PESQUISA_ADICIONAL';
}
```

### 6.2 Fase 2: Implementação dos Prompts (2 horas)

**2.1 Implementar `prompts_v2.ts`**

Consolidar os 5 prompts em um único arquivo com funções exportáveis:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function prompt1_enriquecerCliente(cliente: {
  nome: string;
  cnpj?: string;
  cidade?: string;
  produtoPrincipal?: string;
}): Promise<ClienteEnriquecido> {
  const prompt = `...`; // Copiar de prompt1_cliente.ts

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
}

// Repetir para prompt2, prompt3, prompt4, prompt5
```

**2.2 Implementar `geocoding.ts`**

```typescript
export async function geocodificar(
  cidade: string,
  uf: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const address = `${cidade}, ${uf}, Brasil`;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].geometry.location;
    }
    return null;
  } catch (error) {
    console.error('[Geocoding] Error:', error);
    return null;
  }
}
```

### 6.3 Fase 3: Modificar Processo Principal (1 hora)

**3.1 Modificar `/app/api/enrichment/process/route.ts`**

Substituir o loop de processamento:

```typescript
// ANTES (Sistema Atual)
for (const cliente of clientesToEnrich) {
  const enrichmentData = await generateAllDataOptimized(cliente, apiKey);

  await db
    .update(clientes)
    .set({
      ...enrichmentData.clienteEnriquecido,
      validationStatus: 'approved',
    })
    .where(eq(clientes.id, cliente.id));

  for (const mercadoData of enrichmentData.mercados) {
    // Insert mercado, concorrentes, leads
  }
}

// DEPOIS (Sistema V2)
import {
  prompt1_enriquecerCliente,
  prompt2_identificarMercado,
  prompt3_enriquecerMercado,
  prompt4_identificarConcorrentes,
  prompt5_identificarLeads,
  prompt2b_identificarProdutos,
} from './prompts_v2';
import { geocodificar } from './geocoding';

for (const cliente of clientesToEnrich) {
  // 1. Enriquecer cliente
  const clienteEnriquecido = await prompt1_enriquecerCliente(cliente);

  // 2. Geocodificar
  if (clienteEnriquecido.cidade && clienteEnriquecido.uf) {
    const coords = await geocodificar(clienteEnriquecido.cidade, clienteEnriquecido.uf);
    if (coords) {
      clienteEnriquecido.latitude = coords.lat;
      clienteEnriquecido.longitude = coords.lng;
    }
  }

  // 3. Gravar cliente
  await db
    .update(clientes)
    .set({
      ...clienteEnriquecido,
      validationStatus: 'approved',
    })
    .where(eq(clientes.id, cliente.id));

  // 4. Identificar mercado
  const mercado = await prompt2_identificarMercado(clienteEnriquecido);

  // 5. Gravar mercado
  const [mercadoInserido] = await db
    .insert(mercadosUnicos)
    .values({
      pesquisaId,
      projectId: pesquisa.projectId,
      ...mercado,
    })
    .returning();

  // 6. Enriquecer mercado
  const mercadoEnriquecido = await prompt3_enriquecerMercado(mercado);

  // 7. Atualizar mercado
  await db
    .update(mercadosUnicos)
    .set({
      crescimentoAnual: mercadoEnriquecido.crescimentoAnual,
      tendencias: JSON.stringify(mercadoEnriquecido.tendencias),
      principaisPlayers: JSON.stringify(mercadoEnriquecido.principaisPlayers),
    })
    .where(eq(mercadosUnicos.id, mercadoInserido.id));

  // 8. Identificar produtos
  const produtos = await prompt2b_identificarProdutos(clienteEnriquecido);

  // 9. Gravar produtos
  for (const produto of produtos) {
    await db.insert(produtos).values({
      projectId: pesquisa.projectId,
      pesquisaId,
      clienteId: cliente.id,
      mercadoId: mercadoInserido.id,
      ...produto,
    });
  }

  // 10. Identificar concorrentes
  const concorrentes = await prompt4_identificarConcorrentes(mercadoEnriquecido);

  // 11. Gravar concorrentes
  for (const concorrente of concorrentes) {
    await db.insert(concorrentes).values({
      pesquisaId,
      projectId: pesquisa.projectId,
      mercadoId: mercadoInserido.id,
      ...concorrente,
    });
  }

  // 12. Identificar leads (com ciclo fechado)
  const leads = await prompt5_identificarLeads(
    mercadoEnriquecido,
    concorrentes,
    mercadoEnriquecido.principaisPlayers
  );

  // 13. Gravar leads
  for (const lead of leads) {
    await db.insert(leads).values({
      pesquisaId,
      projectId: pesquisa.projectId,
      mercadoId: mercadoInserido.id,
      ...lead,
    });
  }

  successCount++;
}
```

### 6.4 Fase 4: Testes (2 horas)

**4.1 Testes Unitários**

Criar `/app/api/enrichment/__tests__/prompts_v2.test.ts`:

```typescript
import { prompt1_enriquecerCliente } from '../prompts_v2';

describe('Prompt 1 - Enriquecer Cliente', () => {
  it('deve preservar CNPJ original', async () => {
    const cliente = {
      nome: 'TOTVS S.A.',
      cnpj: '53113791000122',
      produtoPrincipal: 'Software ERP',
    };

    const resultado = await prompt1_enriquecerCliente(cliente);

    expect(resultado.cnpj).toBe('53113791000122');
  });

  it('deve retornar null para CNPJ desconhecido', async () => {
    const cliente = {
      nome: 'Empresa Fictícia XYZ',
      produtoPrincipal: 'Produto desconhecido',
    };

    const resultado = await prompt1_enriquecerCliente(cliente);

    expect(resultado.cnpj).toBeNull();
  });
});
```

**4.2 Testes de Integração**

Criar `/app/api/enrichment/__tests__/integration.test.ts`:

```typescript
import { processEnrichment } from '../route';

describe('Processo de Enriquecimento V2', () => {
  it('deve enriquecer cliente completo', async () => {
    // Mock do banco de dados
    // Mock do OpenAI
    // Executar processo
    // Validar resultado
  });
});
```

### 6.5 Fase 5: Validação e Deploy (1 hora)

**5.1 Teste Manual**

- [ ] Criar job de enriquecimento com 1 cliente
- [ ] Executar processo
- [ ] Validar que cliente foi enriquecido corretamente
- [ ] Validar que mercado foi criado e enriquecido
- [ ] Validar que 3 produtos foram criados
- [ ] Validar que 5 concorrentes foram criados
- [ ] Validar que 5 leads foram criados
- [ ] Validar que ciclo fechado funcionou (leads de players)

**5.2 Teste em Lote**

- [ ] Criar job com 10 clientes
- [ ] Executar processo
- [ ] Validar score médio ≥ 90%
- [ ] Validar taxa de aproveitamento 50-70%
- [ ] Validar custo ~$0.036 por cliente

**5.3 Deploy**

- [ ] Fazer commit das mudanças
- [ ] Criar PR no GitHub
- [ ] Executar CI/CD
- [ ] Deploy em produção

---

## 7. Riscos e Mitigações

### 7.1 Riscos Identificados

| Risco                         | Probabilidade | Impacto | Mitigação                                     |
| ----------------------------- | ------------- | ------- | --------------------------------------------- |
| Timeout em chamadas OpenAI    | Média         | Médio   | Implementar retry com backoff exponencial     |
| Custo maior que esperado      | Baixa         | Médio   | Monitorar custos em tempo real, limitar batch |
| Geocodificação falhar         | Média         | Baixo   | Tratar erro e continuar sem coordenadas       |
| Formato de resposta incorreto | Baixa         | Alto    | Validar JSON com Zod antes de gravar          |
| Job travado por erro          | Média         | Alto    | Implementar timeout e rollback parcial        |

### 7.2 Plano de Rollback

Se algo der errado após deploy:

1. **Reverter deploy** para versão anterior (sistema atual)
2. **Limpar dados** gerados pelo V2 (se necessário)
3. **Investigar logs** para identificar causa raiz
4. **Corrigir problema** em ambiente de desenvolvimento
5. **Re-testar** antes de novo deploy

---

## 8. Conclusão

A implementação do Sistema V2 é **simples e de baixo risco**, pois:

1. ✅ **Frontend não precisa mudar** (100% compatível)
2. ✅ **Schema não precisa mudar** (campos já existem)
3. ✅ **Apenas 1 arquivo principal** a modificar (`route.ts`)
4. ✅ **Mudança isolada** (não afeta outras partes do sistema)
5. ✅ **Testável** (testes unitários e de integração)

**Recomendação:** Prosseguir com implementação seguindo o plano de 5 fases (7 horas totais).

---

**Próximos Passos:**

1. Revisar este documento com a equipe
2. Aprovar plano de implementação
3. Iniciar Fase 1 (Preparação)
4. Executar Fases 2-5 sequencialmente
5. Validar e fazer deploy

---

**Autor:** Manus AI  
**Versão:** 1.0  
**Data:** 30 de novembro de 2024
