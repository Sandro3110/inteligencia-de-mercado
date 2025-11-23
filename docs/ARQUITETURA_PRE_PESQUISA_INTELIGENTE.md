# Arquitetura: Pré-Pesquisa Inteligente com IA

**Autor:** Manus AI  
**Data:** 20 de Novembro de 2025  
**Versão:** 2.0 (Redesenhada)  
**Status:** Proposta para Validação

---

## 📋 Sumário Executivo

Este documento apresenta a **arquitetura redesenhada** da funcionalidade de pré-pesquisa com IA, incorporando quatro melhorias críticas solicitadas pelo usuário. A nova arquitetura transforma a pré-pesquisa em um sistema **inteligente, persistente e conversacional**, capaz de processar linguagem natural, separar múltiplos clientes, refinar contexto através de perguntas e garantir aprovação antes de gravar dados.

### Melhorias Implementadas

A arquitetura v2.0 introduz quatro melhorias fundamentais sobre a versão inicial:

**1. Prompt de Persistência com Retry Inteligente**

Quando a IA retorna dados com completude inferior a 50%, o sistema não desiste. Em vez disso, executa até **3 tentativas de refinamento**, cada uma com um prompt mais específico e direcionado. Por exemplo, se a primeira tentativa retornar apenas nome e produto, a segunda tentativa foca explicitamente em buscar CNPJ, site e localização.

**2. Processamento Multi-Cliente em Linguagem Natural**

O usuário pode fornecer um texto livre descrevendo múltiplos clientes, e a IA automaticamente identifica, separa e processa cada empresa individualmente. Por exemplo, o input "pesquisei cooperativas agrícolas de café em Minas Gerais e distribuidoras de insumos em São Paulo" resulta em múltiplas pesquisas estruturadas, uma para cada entidade identificada.

**3. Aprovação Obrigatória Antes de Gravar**

Todos os dados retornados pela IA passam por uma **interface de revisão obrigatória** antes de serem gravados no banco. O usuário pode editar qualquer campo, descartar resultados individuais ou solicitar nova pesquisa. Nenhum dado é persistido sem confirmação explícita do usuário.

**4. Refinamento de Contexto em 3 Níveis**

Quando o usuário fornece um contexto genérico (ex: "cooperativas agrícolas"), a IA inicia um **diálogo de refinamento** em até 3 níveis, fazendo perguntas específicas para estreitar a pesquisa. Por exemplo: Nível 1 pergunta o setor (café, soja, algodão), Nível 2 pergunta o estado, Nível 3 pergunta a cidade ou região. Apenas após o refinamento completo, a IA executa a pré-pesquisa.

---

## 🎯 Análise de Viabilidade e Segurança

### Melhoria 1: Prompt de Persistência

**Viabilidade:** ✅ Alta  
**Segurança:** ✅ Segura  
**Complexidade:** 🟡 Média

O retry inteligente é totalmente viável através de chamadas sequenciais à API da OpenAI com prompts progressivamente mais específicos. A cada tentativa, o sistema analisa quais campos estão faltando e ajusta o prompt para focar nesses campos. O limite de 3 tentativas evita loops infinitos e controla custos de API.

**Riscos Identificados:**

- **Custo de API:** Cada retry consome tokens adicionais. Mitigação: Limitar a 3 tentativas e implementar cache.
- **Latência:** Múltiplos retries aumentam o tempo de resposta. Mitigação: Exibir progresso visual ao usuário.

**Conclusão:** Implementação segura e recomendada.

### Melhoria 2: Processamento Multi-Cliente

**Viabilidade:** ✅ Alta  
**Segurança:** ⚠️ Requer Validação  
**Complexidade:** 🟡 Média

A IA é capaz de identificar e separar múltiplas entidades em um texto através de structured output (JSON array). O sistema pode processar cada entidade individualmente e retornar resultados separados. No entanto, há risco de interpretação incorreta quando o texto é ambíguo.

**Riscos Identificados:**

- **Interpretação Ambígua:** Texto mal escrito pode resultar em separação incorreta. Mitigação: Interface de revisão obrigatória permite correção.
- **Limite de Entidades:** Textos muito longos podem exceder limite de tokens. Mitigação: Limitar a 10 entidades por request.
- **Custo de API:** Processar múltiplas entidades em paralelo aumenta custo. Mitigação: Processar sequencialmente com delay.

**Conclusão:** Implementação viável com validação obrigatória do usuário.

### Melhoria 3: Aprovação Obrigatória

**Viabilidade:** ✅ Alta  
**Segurança:** ✅ Essencial  
**Complexidade:** 🟢 Baixa

A aprovação obrigatória é uma **best practice crítica** para qualquer sistema que usa IA para gerar dados estruturados. Implementação é direta através de interface de revisão com botões de confirmação/edição/descarte.

**Benefícios:**

- **Controle Total:** Usuário mantém controle sobre dados gravados
- **Correção de Erros:** Permite corrigir interpretações incorretas da IA
- **Confiança:** Aumenta confiança do usuário no sistema

**Conclusão:** Implementação obrigatória e altamente recomendada.

### Melhoria 4: Refinamento de Contexto em 3 Níveis

**Viabilidade:** ✅ Alta  
**Segurança:** ✅ Segura  
**Complexidade:** 🔴 Alta

O refinamento conversacional em 3 níveis é viável através de um wizard interativo onde a IA gera perguntas contextuais baseadas no input inicial. Cada resposta do usuário é usada para refinar a próxima pergunta, criando um funil de especificidade.

**Riscos Identificados:**

- **Complexidade de UX:** Wizard de 3 níveis pode ser cansativo. Mitigação: Permitir pular níveis se usuário já sabe a resposta.
- **Perguntas Irrelevantes:** IA pode fazer perguntas não aplicáveis. Mitigação: Permitir opção "Não se aplica" em cada nível.
- **Custo de API:** Cada nível consome tokens. Mitigação: Usar modelo mais barato para geração de perguntas.

**Conclusão:** Implementação viável com UX cuidadosamente desenhada.

---

## 🏗️ Arquitetura Redesenhada

### Visão Geral dos Fluxos

A arquitetura redesenhada introduz **4 fluxos principais** que podem ser combinados:

```
┌─────────────────────────────────────────────────────────────┐
│              FLUXO 1: PRÉ-PESQUISA SIMPLES                   │
│  Input: Nome ou Site → IA Pesquisa → Revisão → Gravar       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│         FLUXO 2: PRÉ-PESQUISA COM RETRY INTELIGENTE          │
│  Input → IA (Tentativa 1) → Completude < 50%? →             │
│  → IA (Tentativa 2 Refinada) → Completude < 50%? →          │
│  → IA (Tentativa 3 Refinada) → Revisão → Gravar             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│       FLUXO 3: PROCESSAMENTO MULTI-CLIENTE                   │
│  Input: Texto Livre → IA Separa Entidades →                 │
│  → Para cada entidade: IA Pesquisa → Revisão → Gravar       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│        FLUXO 4: REFINAMENTO DE CONTEXTO (3 NÍVEIS)           │
│  Input: Contexto Genérico → IA Pergunta Nível 1 →           │
│  → Usuário Responde → IA Pergunta Nível 2 →                 │
│  → Usuário Responde → IA Pergunta Nível 3 →                 │
│  → Usuário Responde → IA Pesquisa Refinada →                │
│  → Revisão → Gravar                                          │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo Integrado Completo

O sistema combina todos os fluxos em uma experiência unificada:

```
INÍCIO
  ↓
┌─────────────────────────────────────────┐
│ Usuário fornece input                   │
│ (nome, site, texto livre ou contexto)   │
└─────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────┐
│ IA analisa tipo de input                │
│ - Específico (nome/site)?               │
│ - Multi-cliente (texto livre)?          │
│ - Genérico (contexto)?                  │
└─────────────────────────────────────────┘
  ↓
  ├─── SE ESPECÍFICO ───────────────────────┐
  │                                          │
  │  ┌────────────────────────────────────┐ │
  │  │ IA executa pré-pesquisa            │ │
  │  └────────────────────────────────────┘ │
  │    ↓                                     │
  │  ┌────────────────────────────────────┐ │
  │  │ Completude >= 50%?                 │ │
  │  └────────────────────────────────────┘ │
  │    ↓                                     │
  │    ├─ SIM → Prosseguir                  │
  │    └─ NÃO → RETRY (até 3x)              │
  │                                          │
  ├─── SE MULTI-CLIENTE ────────────────────┤
  │                                          │
  │  ┌────────────────────────────────────┐ │
  │  │ IA separa entidades                │ │
  │  └────────────────────────────────────┘ │
  │    ↓                                     │
  │  ┌────────────────────────────────────┐ │
  │  │ Para cada entidade:                │ │
  │  │   - IA executa pré-pesquisa        │ │
  │  │   - Aplica RETRY se necessário     │ │
  │  └────────────────────────────────────┘ │
  │                                          │
  └─── SE GENÉRICO (CONTEXTO) ──────────────┤
                                             │
    ┌────────────────────────────────────┐  │
    │ WIZARD DE REFINAMENTO (3 NÍVEIS)   │  │
    └────────────────────────────────────┘  │
      ↓                                      │
    ┌────────────────────────────────────┐  │
    │ Nível 1: IA faz pergunta           │  │
    │ (ex: Qual setor? café/soja/etc)    │  │
    └────────────────────────────────────┘  │
      ↓                                      │
    ┌────────────────────────────────────┐  │
    │ Usuário responde                   │  │
    └────────────────────────────────────┘  │
      ↓                                      │
    ┌────────────────────────────────────┐  │
    │ Nível 2: IA faz pergunta           │  │
    │ (ex: Qual estado?)                 │  │
    └────────────────────────────────────┘  │
      ↓                                      │
    ┌────────────────────────────────────┐  │
    │ Usuário responde                   │  │
    └────────────────────────────────────┘  │
      ↓                                      │
    ┌────────────────────────────────────┐  │
    │ Nível 3: IA faz pergunta           │  │
    │ (ex: Cidade/região específica?)    │  │
    └────────────────────────────────────┘  │
      ↓                                      │
    ┌────────────────────────────────────┐  │
    │ Usuário responde                   │  │
    └────────────────────────────────────┘  │
      ↓                                      │
    ┌────────────────────────────────────┐  │
    │ IA executa pré-pesquisa refinada   │  │
    └────────────────────────────────────┘  │
      ↓                                      │
  ────┴──────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────┐
│ INTERFACE DE REVISÃO OBRIGATÓRIA        │
│                                         │
│ Para cada resultado:                    │
│  - Exibir todos os campos               │
│  - Permitir edição inline               │
│  - Mostrar completude (X/10)            │
│  - Botões: [✓ Confirmar] [✗ Descartar] │
│            [🔄 Pesquisar novamente]     │
└─────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────┐
│ Usuário aprova dados?                   │
└─────────────────────────────────────────┘
  ↓
  ├─ SIM → Gravar no banco
  └─ NÃO → Voltar para edição ou descartar
  ↓
FIM
```

---

## 🔄 Fluxo 1: Pré-Pesquisa Simples (Baseline)

Este é o fluxo básico já testado com sucesso. Serve como baseline para os demais fluxos.

### Entrada

Usuário fornece **nome da empresa OU site**.

**Exemplos:**

- `"Cooperativa de Insumos de Holambra"`
- `"https://www.cih.com.br"`

### Processamento

Sistema envia prompt estruturado para OpenAI solicitando 10 campos de dados.

### Saída

JSON estruturado com até 10 campos preenchidos.

### Interface de Revisão

Sistema exibe card com todos os dados para revisão do usuário.

---

## 🔁 Fluxo 2: Retry Inteligente com Prompt de Persistência

### Objetivo

Melhorar completude de dados quando a primeira tentativa retorna informações insuficientes.

### Gatilho

Completude < 50% (menos de 5 campos preenchidos de 10).

### Lógica de Retry

O sistema executa até **3 tentativas progressivas**, cada uma com prompt mais específico:

**Tentativa 1 (Baseline):**

```
Prompt genérico solicitando todos os 10 campos.
```

**SE completude < 50% → Tentativa 2 (Refinada):**

```
Prompt focado nos campos faltantes:
"Na primeira tentativa, encontramos apenas [campos preenchidos].
Agora, foque especificamente em encontrar:
- CNPJ
- Site oficial
- Cidade e UF
- Telefone e email
Pesquise em fontes oficiais como Receita Federal, site da empresa, etc."
```

**SE completude < 50% → Tentativa 3 (Ultra-Refinada):**

```
Prompt com estratégias alternativas:
"Ainda faltam [campos faltantes].
Tente estratégias alternativas:
- Para CNPJ: Busque em 'CNPJ [nome da empresa]' ou Receita Federal
- Para site: Busque em '[nome da empresa] site oficial'
- Para contato: Busque em páginas de contato ou redes sociais
- Para localização: Busque em Google Maps ou cadastros públicos"
```

**SE completude < 50% após 3 tentativas:**

```
Sistema aceita resultado parcial e exibe aviso ao usuário:
"⚠️ Não foi possível encontrar todos os dados.
Completude: X/10 campos (X%)
Você pode editar manualmente os campos faltantes."
```

### Exemplo Prático

**Input:** `"Empresa XYZ Ltda"` (empresa pequena, poucos dados públicos)

**Tentativa 1:**

```json
{
  "nome": "Empresa XYZ Ltda",
  "produto": "Serviços de consultoria",
  "cidade": "São Paulo",
  "uf": "SP"
  // Demais campos: null
}
```

**Completude:** 4/10 (40%) → **Retry ativado**

**Tentativa 2 (Prompt refinado focando em CNPJ, site, contato):**

```json
{
  "nome": "Empresa XYZ Ltda",
  "cnpj": "12.345.678/0001-90", // ✅ Encontrado
  "site": "https://www.empresaxyz.com.br", // ✅ Encontrado
  "produto": "Serviços de consultoria",
  "cidade": "São Paulo",
  "uf": "SP",
  "telefone": "(11) 1234-5678" // ✅ Encontrado
  // Demais campos: null
}
```

**Completude:** 7/10 (70%) → **Sucesso! Prosseguir**

### Implementação Técnica

```typescript
async function prePesquisaComRetry(
  query: string,
  maxTentativas: number = 3
): Promise<EmpresaInfo> {
  let resultado: EmpresaInfo | null = null;
  let tentativa = 0;

  while (tentativa < maxTentativas) {
    tentativa++;

    // Construir prompt baseado na tentativa
    const prompt = construirPrompt(query, tentativa, resultado);

    // Executar pesquisa
    resultado = await executarPesquisa(prompt);

    // Calcular completude
    const completude = calcularCompletude(resultado);

    console.log(`Tentativa ${tentativa}: ${completude}% de completude`);

    // Se completude >= 50%, sucesso
    if (completude >= 50) {
      return resultado;
    }

    // Se última tentativa, retornar resultado parcial
    if (tentativa === maxTentativas) {
      console.warn(`Completude final: ${completude}% (abaixo do ideal)`);
      return resultado;
    }

    // Aguardar 2 segundos antes do próximo retry
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return resultado!;
}

function construirPrompt(
  query: string,
  tentativa: number,
  resultadoAnterior: EmpresaInfo | null
): string {
  if (tentativa === 1) {
    // Prompt baseline
    return promptBaseline(query);
  }

  if (tentativa === 2) {
    // Prompt refinado focando em campos faltantes
    const camposFaltantes = identificarCamposFaltantes(resultadoAnterior);
    return promptRefinado(query, camposFaltantes);
  }

  if (tentativa === 3) {
    // Prompt ultra-refinado com estratégias alternativas
    const camposFaltantes = identificarCamposFaltantes(resultadoAnterior);
    return promptUltraRefinado(query, camposFaltantes);
  }

  return promptBaseline(query);
}
```

---

## 🗂️ Fluxo 3: Processamento Multi-Cliente em Linguagem Natural

### Objetivo

Permitir que usuário forneça um texto livre descrevendo múltiplos clientes, e a IA automaticamente separe e processe cada um individualmente.

### Entrada

Texto livre em linguagem natural descrevendo uma ou mais empresas.

**Exemplos:**

**Exemplo 1 (Múltiplas entidades explícitas):**

```
"Pesquisei cooperativas agrícolas de café em Minas Gerais e
distribuidoras de insumos em São Paulo"
```

**Exemplo 2 (Lista informal):**

```
"Quero pesquisar a Cooperativa de Holambra, a Carga Pesada
Distribuidora e a Braskem"
```

**Exemplo 3 (Descrição contextual):**

```
"Empresas do setor de embalagens plásticas para alimentos na
região Sul, especialmente no Paraná e Santa Catarina"
```

### Processamento - Fase 1: Separação de Entidades

A IA analisa o texto e identifica **entidades distintas** (empresas ou grupos de empresas).

**Prompt de Separação:**

```
Você é um assistente de análise de texto especializado em identificar
empresas e contextos de pesquisa.

INPUT: "[texto do usuário]"

Sua tarefa é identificar e separar todas as entidades (empresas ou
grupos de empresas) mencionadas no texto.

Para cada entidade identificada, retorne:
{
  "tipo": "especifica" | "contexto",
  "query": "string de pesquisa",
  "contexto_adicional": "informações adicionais (opcional)"
}

Tipos:
- "especifica": Nome específico de empresa (ex: "Cooperativa de Holambra")
- "contexto": Descrição genérica (ex: "cooperativas agrícolas de café em MG")

Retorne um array JSON com todas as entidades identificadas.
```

**Output esperado para Exemplo 1:**

```json
[
  {
    "tipo": "contexto",
    "query": "cooperativas agrícolas de café",
    "contexto_adicional": "Minas Gerais"
  },
  {
    "tipo": "contexto",
    "query": "distribuidoras de insumos",
    "contexto_adicional": "São Paulo"
  }
]
```

**Output esperado para Exemplo 2:**

```json
[
  {
    "tipo": "especifica",
    "query": "Cooperativa de Holambra",
    "contexto_adicional": null
  },
  {
    "tipo": "especifica",
    "query": "Carga Pesada Distribuidora",
    "contexto_adicional": null
  },
  {
    "tipo": "especifica",
    "query": "Braskem",
    "contexto_adicional": null
  }
]
```

### Processamento - Fase 2: Pré-Pesquisa Individual

Para cada entidade identificada:

**SE tipo === "especifica":**

- Executar pré-pesquisa direta (Fluxo 1)
- Aplicar retry se necessário (Fluxo 2)

**SE tipo === "contexto":**

- Executar refinamento de contexto (Fluxo 4)
- Após refinamento, executar pré-pesquisa

### Interface de Revisão Multi-Cliente

Sistema exibe **lista de cards**, um para cada entidade processada:

```
┌─────────────────────────────────────────────────────────┐
│  Resultados da Pré-Pesquisa (3 empresas encontradas)    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌───────────────────────────────────────────┐         │
│  │ 1. Cooperativa de Insumos de Holambra     │         │
│  │ ✅ 10/10 campos (100%)                     │         │
│  │                                            │         │
│  │ Nome: Cooperativa de Insumos...  [Editar] │         │
│  │ CNPJ: 46.331.066/0001-00         [Editar] │         │
│  │ ...                                        │         │
│  │                                            │         │
│  │ [✓ Confirmar] [✗ Descartar] [🔄 Refazer]  │         │
│  └───────────────────────────────────────────┘         │
│                                                          │
│  ┌───────────────────────────────────────────┐         │
│  │ 2. Carga Pesada Distribuidora             │         │
│  │ ✅ 10/10 campos (100%)                     │         │
│  │                                            │         │
│  │ Nome: Carga Pesada Distribuidora... [Editar] │      │
│  │ CNPJ: 08.835.655/0001-90         [Editar] │         │
│  │ ...                                        │         │
│  │                                            │         │
│  │ [✓ Confirmar] [✗ Descartar] [🔄 Refazer]  │         │
│  └───────────────────────────────────────────┘         │
│                                                          │
│  ┌───────────────────────────────────────────┐         │
│  │ 3. Braskem S.A.                           │         │
│  │ ⚠️  7/10 campos (70%)                      │         │
│  │                                            │         │
│  │ Nome: Braskem S.A.               [Editar] │         │
│  │ CNPJ: 42.150.391/0001-70         [Editar] │         │
│  │ Telefone: [vazio]                [Editar] │         │
│  │ ...                                        │         │
│  │                                            │         │
│  │ [✓ Confirmar] [✗ Descartar] [🔄 Refazer]  │         │
│  └───────────────────────────────────────────┘         │
│                                                          │
│  [✓ Confirmar Todos] [✗ Cancelar]                       │
└─────────────────────────────────────────────────────────┘
```

### Limite de Segurança

Para evitar abusos e controlar custos:

- **Máximo de 10 entidades por request**
- Se texto contém > 10 entidades, sistema alerta usuário e solicita refinamento

---

## 🎯 Fluxo 4: Refinamento de Contexto em 3 Níveis

### Objetivo

Transformar inputs genéricos em pesquisas específicas através de um diálogo guiado de refinamento.

### Gatilho

Usuário fornece **contexto genérico** sem especificar empresa concreta.

**Exemplos de inputs genéricos:**

- `"cooperativas agrícolas"`
- `"distribuidoras de insumos"`
- `"empresas de embalagens plásticas"`

### Wizard de Refinamento (3 Níveis)

O sistema inicia um diálogo interativo para refinar o contexto:

```
NÍVEL 1: Especificação de Setor/Produto
  ↓
NÍVEL 2: Especificação Geográfica (Estado)
  ↓
NÍVEL 3: Especificação Geográfica (Cidade/Região)
  ↓
PRÉ-PESQUISA REFINADA
```

### Exemplo Prático: "Cooperativas Agrícolas"

**Input do Usuário:**

```
"cooperativas agrícolas"
```

**Sistema detecta contexto genérico e inicia wizard:**

---

**NÍVEL 1: Especificação de Setor**

**IA gera pergunta contextual:**

```
🤖 Para refinar a pesquisa, preciso de mais detalhes.

Cooperativas agrícolas de qual setor específico?

Opções comuns:
• Café
• Soja
• Algodão
• Milho
• Frutas e hortaliças
• Pecuária (leite/carne)
• Insumos agrícolas
• Outro (especifique)

Você pode selecionar uma opção ou digitar livremente.
```

**Usuário responde:**

```
"Café"
```

**Sistema registra:** `setor = "Café"`

---

**NÍVEL 2: Especificação Geográfica (Estado)**

**IA gera pergunta contextual:**

```
🤖 Cooperativas agrícolas de café em qual estado?

Principais estados produtores de café:
• Minas Gerais
• São Paulo
• Espírito Santo
• Bahia
• Paraná
• Todos os estados
• Outro (especifique)

Você pode selecionar uma opção ou digitar livremente.
```

**Usuário responde:**

```
"Minas Gerais"
```

**Sistema registra:** `estado = "Minas Gerais"`

---

**NÍVEL 3: Especificação Geográfica (Cidade/Região)**

**IA gera pergunta contextual:**

```
🤖 Cooperativas agrícolas de café em Minas Gerais.

Há alguma cidade ou região específica?

Principais regiões cafeeiras de MG:
• Sul de Minas
• Cerrado Mineiro
• Matas de Minas
• Chapada de Minas
• Todas as regiões
• Cidade específica (especifique)

Você pode selecionar uma opção ou digitar livremente.
```

**Usuário responde:**

```
"Sul de Minas"
```

**Sistema registra:** `regiao = "Sul de Minas"`

---

**CONTEXTO REFINADO FINAL:**

```
Cooperativas agrícolas de café em Minas Gerais, região Sul de Minas
```

**Sistema executa pré-pesquisa com contexto refinado:**

A IA agora busca especificamente cooperativas que atendam todos os critérios:

- Tipo: Cooperativa agrícola
- Setor: Café
- Estado: Minas Gerais
- Região: Sul de Minas

**Resultados esperados (exemplos):**

1. Coopercitrus - Sul de Minas
2. Cooxupé - Cooperativa Regional de Cafeicultores em Guaxupé
3. Minasul - Cooperativa dos Cafeicultores da Zona de Varginha

### Geração Dinâmica de Perguntas

As perguntas de cada nível são **geradas dinamicamente pela IA** baseadas no contexto acumulado.

**Prompt de Geração de Pergunta (Nível 1):**

```
Você é um assistente de refinamento de pesquisa de mercado.

O usuário forneceu o contexto: "[input do usuário]"

Gere uma pergunta de refinamento para o NÍVEL 1 (Especificação de Setor/Produto).

A pergunta deve:
- Ser clara e objetiva
- Oferecer 5-8 opções comuns relevantes ao contexto
- Permitir resposta livre
- Incluir opção "Outro (especifique)"

Retorne JSON:
{
  "pergunta": "texto da pergunta",
  "opcoes": ["opção 1", "opção 2", ..., "Outro (especifique)"]
}
```

**Prompt de Geração de Pergunta (Nível 2):**

```
Você é um assistente de refinamento de pesquisa de mercado.

Contexto acumulado:
- Input original: "[input do usuário]"
- Setor: "[resposta nível 1]"

Gere uma pergunta de refinamento para o NÍVEL 2 (Especificação Geográfica - Estado).

A pergunta deve:
- Considerar o setor escolhido
- Oferecer estados relevantes para aquele setor
- Incluir opção "Todos os estados"
- Permitir resposta livre

Retorne JSON:
{
  "pergunta": "texto da pergunta",
  "opcoes": ["estado 1", "estado 2", ..., "Todos os estados", "Outro"]
}
```

**Prompt de Geração de Pergunta (Nível 3):**

```
Você é um assistente de refinamento de pesquisa de mercado.

Contexto acumulado:
- Input original: "[input do usuário]"
- Setor: "[resposta nível 1]"
- Estado: "[resposta nível 2]"

Gere uma pergunta de refinamento para o NÍVEL 3 (Especificação Geográfica - Cidade/Região).

A pergunta deve:
- Considerar setor e estado escolhidos
- Oferecer regiões ou cidades relevantes
- Incluir opção "Todas as regiões"
- Permitir resposta livre

Retorne JSON:
{
  "pergunta": "texto da pergunta",
  "opcoes": ["região 1", "região 2", ..., "Todas as regiões", "Cidade específica"]
}
```

### Opções de Navegação no Wizard

Em cada nível, usuário pode:

- **Responder:** Avançar para próximo nível
- **Pular:** Avançar sem especificar (mantém contexto genérico)
- **Voltar:** Retornar ao nível anterior para mudar resposta
- **Cancelar:** Abortar refinamento e voltar para entrada manual

### Interface do Wizard

```
┌─────────────────────────────────────────────────────────┐
│  Refinamento de Contexto - Nível 2 de 3                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Contexto atual:                                        │
│  Cooperativas agrícolas → Café                          │
│                                                          │
│  🤖 Cooperativas agrícolas de café em qual estado?      │
│                                                          │
│  Principais estados produtores de café:                 │
│                                                          │
│  ○ Minas Gerais                                         │
│  ○ São Paulo                                            │
│  ○ Espírito Santo                                       │
│  ○ Bahia                                                │
│  ○ Paraná                                               │
│  ○ Todos os estados                                     │
│  ○ Outro: [_______________]                             │
│                                                          │
│  [← Voltar] [Pular →] [Cancelar]     [Próximo →]       │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Interface de Aprovação Obrigatória

### Princípio Fundamental

**Nenhum dado gerado por IA é gravado no banco sem aprovação explícita do usuário.**

### Componentes da Interface

**1. Card de Revisão Individual**

Para cada empresa pesquisada, exibir card com:

```
┌───────────────────────────────────────────────────────┐
│ Empresa ABC Ltda                                      │
│ ✅ 10/10 campos (100% completo)                        │
├───────────────────────────────────────────────────────┤
│                                                        │
│ Nome:         [Empresa ABC Ltda____________] [Editar] │
│ CNPJ:         [12.345.678/0001-90__________] [Editar] │
│ Site:         [https://www.empresaabc.com__] [Editar] │
│ Produto:      [Embalagens plásticas________] [Editar] │
│ Cidade:       [São Paulo___________________] [Editar] │
│ UF:           [SP__________________________] [Editar] │
│ Telefone:     [(11) 1234-5678______________] [Editar] │
│ Email:        [contato@empresaabc.com______] [Editar] │
│ Segmentação:  [B2B_________________________] [Editar] │
│ Porte:        [Médio_______________________] [Editar] │
│                                                        │
│ ⚠️  Revise os dados antes de confirmar.               │
│                                                        │
│ [✓ Confirmar e Adicionar]                             │
│ [✗ Descartar]                                         │
│ [🔄 Pesquisar Novamente]                              │
└───────────────────────────────────────────────────────┘
```

**2. Edição Inline**

Ao clicar em qualquer campo ou botão [Editar]:

```
┌───────────────────────────────────────────────────────┐
│ Nome:  [Empresa ABC Ltda____________]                 │
│        ↑ Campo em modo de edição                      │
│        [✓ Salvar] [✗ Cancelar]                        │
└───────────────────────────────────────────────────────┘
```

**3. Indicadores Visuais**

- **✅ Verde:** Campo preenchido e válido
- **⚠️ Amarelo:** Campo preenchido mas com aviso (ex: "Recomendamos verificar CNPJ")
- **❌ Vermelho:** Campo inválido (ex: CNPJ com formato incorreto)
- **⬜ Cinza:** Campo vazio

**4. Validação em Tempo Real**

Ao editar campo, validação ocorre instantaneamente:

- **CNPJ:** Valida formato e dígitos verificadores
- **Site:** Valida URL e opcionalmente verifica acessibilidade
- **Email:** Valida formato
- **UF:** Valida se é sigla de estado válida

**5. Ações Disponíveis**

**✓ Confirmar e Adicionar:**

- Valida todos os campos
- Se válido: Adiciona à lista de clientes aprovados
- Se inválido: Exibe erros e impede confirmação

**✗ Descartar:**

- Remove resultado da lista
- Não grava no banco

**🔄 Pesquisar Novamente:**

- Executa nova pré-pesquisa com mesmo input
- Útil se primeira pesquisa retornou dados incorretos

**6. Lista de Clientes Aprovados**

Após confirmar múltiplos clientes:

```
┌───────────────────────────────────────────────────────┐
│ Clientes Aprovados (3)                                │
├───────────────────────────────────────────────────────┤
│                                                        │
│ 1. ✅ Empresa ABC Ltda (10/10 campos)                 │
│    [Ver detalhes] [Editar] [Remover]                  │
│                                                        │
│ 2. ✅ Empresa XYZ S.A. (9/10 campos)                  │
│    [Ver detalhes] [Editar] [Remover]                  │
│                                                        │
│ 3. ⚠️  Empresa 123 Ltda (6/10 campos)                 │
│    [Ver detalhes] [Editar] [Remover]                  │
│                                                        │
│ [+ Adicionar Mais Clientes]                           │
│ [✓ Gravar Todos no Banco]                             │
│ [✗ Cancelar Tudo]                                     │
└───────────────────────────────────────────────────────┘
```

**7. Confirmação Final**

Ao clicar em "Gravar Todos no Banco":

```
┌───────────────────────────────────────────────────────┐
│ Confirmação Final                                     │
├───────────────────────────────────────────────────────┤
│                                                        │
│ Você está prestes a gravar 3 clientes no banco:      │
│                                                        │
│ • Empresa ABC Ltda (100% completo)                    │
│ • Empresa XYZ S.A. (90% completo)                     │
│ • Empresa 123 Ltda (60% completo)                     │
│                                                        │
│ ⚠️  Esta ação não pode ser desfeita.                  │
│                                                        │
│ Deseja continuar?                                     │
│                                                        │
│ [✓ Sim, Gravar Agora]  [✗ Cancelar]                   │
└───────────────────────────────────────────────────────┘
```

---

## 🔒 Considerações de Segurança

### 1. Validação de Dados

**Problema:** IA pode retornar dados malformados ou maliciosos.

**Mitigação:**

- Schema validation com Zod em todos os outputs
- Sanitização de strings (remover scripts, SQL injection)
- Validação de URLs (whitelist de protocolos: http/https)
- Validação de CNPJ (dígitos verificadores)

### 2. Limite de Requisições

**Problema:** Usuário pode abusar do sistema fazendo milhares de requests.

**Mitigação:**

- Rate limiting: Máximo 10 pré-pesquisas por minuto por usuário
- Máximo 100 pré-pesquisas por dia por usuário
- Cooldown de 2 segundos entre requests

### 3. Custo de API

**Problema:** Múltiplos retries e refinamentos aumentam custo.

**Mitigação:**

- Limite de 3 retries por pesquisa
- Cache de resultados (TTL 24h)
- Usar modelo mais barato (gpt-4o-mini) para perguntas de refinamento
- Usar modelo mais caro (gpt-4o) apenas para pré-pesquisa final

### 4. Privacidade de Dados

**Problema:** Dados sensíveis podem ser enviados para OpenAI.

**Mitigação:**

- Não enviar dados já existentes no banco para IA
- Apenas enviar queries de pesquisa (nomes de empresas públicas)
- Logs de API não devem conter dados sensíveis

### 5. Aprovação Obrigatória

**Problema:** Dados incorretos da IA podem ser gravados automaticamente.

**Mitigação:**

- **Interface de revisão obrigatória** (já implementada)
- Nenhum dado gravado sem confirmação explícita
- Validação final antes de gravar no banco

---

## 📊 Resumo de Viabilidade

| Melhoria                  | Viabilidade | Segurança                | Complexidade | Recomendação                    |
| ------------------------- | ----------- | ------------------------ | ------------ | ------------------------------- |
| **Retry Inteligente**     | ✅ Alta     | ✅ Segura                | 🟡 Média     | ✅ Implementar                  |
| **Multi-Cliente**         | ✅ Alta     | ⚠️ Validação Obrigatória | 🟡 Média     | ✅ Implementar com revisão      |
| **Aprovação Obrigatória** | ✅ Alta     | ✅ Essencial             | 🟢 Baixa     | ✅ Obrigatória                  |
| **Refinamento 3 Níveis**  | ✅ Alta     | ✅ Segura                | 🔴 Alta      | ✅ Implementar com UX cuidadosa |

---

## 🚀 Próximos Passos

### Fase 1: Implementação de Retry Inteligente (2-3 dias)

1. Criar função `prePesquisaComRetry` com lógica de 3 tentativas
2. Implementar prompts progressivos (baseline, refinado, ultra-refinado)
3. Adicionar indicador de progresso na UI ("Tentativa 2 de 3...")
4. Testar com casos de baixa completude

### Fase 2: Implementação de Multi-Cliente (3-4 dias)

1. Criar endpoint de separação de entidades
2. Implementar processamento paralelo de entidades
3. Criar interface de revisão multi-cliente (lista de cards)
4. Testar com textos complexos

### Fase 3: Implementação de Aprovação Obrigatória (2 dias)

1. Criar componente de card de revisão com edição inline
2. Implementar validações em tempo real
3. Criar lista de clientes aprovados
4. Implementar confirmação final antes de gravar

### Fase 4: Implementação de Refinamento 3 Níveis (5-6 dias)

1. Criar wizard de refinamento com navegação entre níveis
2. Implementar geração dinâmica de perguntas via IA
3. Criar interface de seleção de opções + resposta livre
4. Integrar contexto refinado com pré-pesquisa
5. Testar fluxo completo com contextos genéricos

### Fase 5: Testes End-to-End (3 dias)

1. Testar retry com empresas de baixa visibilidade
2. Testar multi-cliente com textos complexos
3. Testar refinamento com diversos contextos
4. Validar aprovação obrigatória em todos os fluxos

**Estimativa Total:** 15-18 dias de desenvolvimento

---

**Documento preparado por:** Manus AI  
**Data:** 20 de Novembro de 2025  
**Status:** Aguardando validação do usuário  
**Próximo Passo:** Aprovação para iniciar implementação
