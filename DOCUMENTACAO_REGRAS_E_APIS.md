# Documentação: Regras de Enriquecimento e APIs do Gestor PAV

**Autor:** Manus AI  
**Data:** 18 de novembro de 2025  
**Versão:** 1.0

---

## Sumário Executivo

Este documento detalha as regras de negócio, algoritmos de enriquecimento de dados e integrações de APIs utilizadas no **Gestor PAV** (Pesquisa de Mercado). O sistema implementa um processo estruturado de identificação, classificação e validação de mercados, clientes, concorrentes e leads, utilizando cálculos de score de qualidade baseados em completude de dados e integrações com serviços externos para enriquecimento automatizado.

---

## 1. Sistema de Score de Qualidade

O Gestor PAV implementa um **sistema de pontuação de qualidade** (0-100 pontos) que avalia a completude dos dados de cada entidade (clientes, concorrentes, leads). Este score é fundamental para priorizar esforços de enriquecimento e identificar registros que necessitam de dados adicionais.

### 1.1 Algoritmo de Cálculo

O cálculo do score é realizado pela função `calculateQualityScore()` localizada em `shared/qualityScore.ts`. A pontuação é distribuída entre os campos conforme a tabela abaixo:

| Campo         | Peso (pontos) | Descrição                                       |
| ------------- | ------------- | ----------------------------------------------- |
| **CNPJ**      | 20            | Identificador fiscal único da empresa           |
| **Email**     | 15            | Contato eletrônico principal                    |
| **Site**      | 15            | Website oficial da empresa                      |
| **Produto**   | 15            | Produto ou serviço principal oferecido          |
| **Telefone**  | 10            | Número de contato telefônico                    |
| **LinkedIn**  | 10            | Perfil corporativo na rede social profissional  |
| **Instagram** | 5             | Presença em mídia social                        |
| **Cidade**    | 3             | Localização geográfica (município)              |
| **CNAE**      | 3             | Classificação Nacional de Atividades Econômicas |
| **UF**        | 2             | Unidade Federativa (estado)                     |
| **Porte**     | 2             | Classificação de tamanho da empresa             |
| **Total**     | **100**       | Soma total dos pesos                            |

### 1.2 Classificação por Faixa de Score

Após o cálculo, o score é classificado em quatro categorias pela função `classifyQuality()`:

| Faixa de Score | Classificação | Cor Visual                  | Variante UI   |
| -------------- | ------------- | --------------------------- | ------------- |
| 80-100         | **Excelente** | Verde (`text-green-500`)    | `default`     |
| 60-79          | **Bom**       | Azul (`text-blue-500`)      | `secondary`   |
| 40-59          | **Regular**   | Amarelo (`text-yellow-500`) | `outline`     |
| 0-39           | **Ruim**      | Vermelho (`text-red-500`)   | `destructive` |

### 1.3 Validações de Formato

O sistema implementa validações de formato para garantir a integridade dos dados:

**CNPJ (Cadastro Nacional da Pessoa Jurídica)**

- Função: `isValidCNPJFormat()`
- Regra: Deve conter exatamente 14 dígitos numéricos (após remoção de caracteres especiais)
- Exemplo válido: `12.345.678/0001-90` → `12345678000190`

**Email**

- Função: `isValidEmailFormat()`
- Regra: Deve seguir o padrão `usuario@dominio.extensao`
- Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**Telefone**

- Função: `isValidPhoneFormat()`
- Regra: Deve conter entre 10 e 11 dígitos (formato brasileiro com DDD)
- Exemplo válido: `(11) 98765-4321` → `11987654321`

### 1.4 Identificação de Campos Faltantes

A função `getMissingFields()` retorna uma lista dos campos ausentes ou vazios, permitindo que o sistema identifique quais dados precisam ser coletados para melhorar o score de qualidade de cada registro.

---

## 2. Regras de Identificação e Classificação

### 2.1 Mercados

**Definição:** Um mercado representa um segmento específico da indústria onde a empresa pode atuar.

**Estrutura de Dados:**

| Campo                | Tipo    | Descrição                                    |
| -------------------- | ------- | -------------------------------------------- |
| `id`                 | Integer | Identificador único                          |
| `projectId`          | Integer | Projeto ao qual o mercado pertence           |
| `mercadoHash`        | String  | Hash único para identificação                |
| `nome`               | String  | Nome descritivo do mercado                   |
| `segmentacao`        | String  | Tipo de segmentação (B2B, B2C, B2B2C)        |
| `categoria`          | String  | Categoria industrial                         |
| `tamanhoMercado`     | String  | Estimativa de tamanho (pequeno/médio/grande) |
| `crescimentoAnual`   | String  | Taxa de crescimento estimada                 |
| `tendencias`         | Text    | Tendências observadas no mercado             |
| `principaisPlayers`  | Text    | Principais empresas atuantes                 |
| `quantidadeClientes` | Integer | Número de clientes identificados             |

**Regras de Identificação:**

- Mercados são identificados através de análise de CNAE, produtos e segmentação
- Cada mercado possui um hash único (`mercadoHash`) para evitar duplicações
- A quantidade de clientes é atualizada automaticamente conforme novos clientes são associados

### 2.2 Clientes

**Definição:** Empresas que já atuam no mercado identificado e são potenciais clientes.

**Estrutura de Dados:**

| Campo               | Tipo     | Descrição                                                        |
| ------------------- | -------- | ---------------------------------------------------------------- |
| `id`                | Integer  | Identificador único                                              |
| `projectId`         | Integer  | Projeto ao qual o cliente pertence                               |
| `clienteHash`       | String   | Hash único para identificação                                    |
| `nome`              | String   | Razão social ou nome fantasia                                    |
| `cnpj`              | String   | CNPJ da empresa                                                  |
| `siteOficial`       | String   | Website oficial                                                  |
| `produtoPrincipal`  | String   | Produto ou serviço principal                                     |
| `segmentacaoB2bB2c` | Enum     | Tipo de negócio (B2B, B2C, B2B2C)                                |
| `email`             | String   | Email de contato                                                 |
| `telefone`          | String   | Telefone de contato                                              |
| `linkedin`          | String   | URL do perfil LinkedIn                                           |
| `instagram`         | String   | URL do perfil Instagram                                          |
| `cidade`            | String   | Cidade sede                                                      |
| `uf`                | String   | Estado (UF)                                                      |
| `cnae`              | String   | Código CNAE                                                      |
| `validationStatus`  | Enum     | Status de validação (pending, rich, needs_adjustment, discarded) |
| `validationNotes`   | Text     | Observações da validação                                         |
| `validatedAt`       | DateTime | Data da última validação                                         |

**Regras de Classificação:**

- Clientes são associados a um ou mais mercados através da tabela `clientes_mercados`
- Status de validação inicial: `pending`
- Score de qualidade é calculado automaticamente com base nos campos preenchidos
- Clientes com score ≥ 60 são priorizados para contato

### 2.3 Concorrentes

**Definição:** Empresas que competem diretamente no mesmo mercado.

**Estrutura de Dados:**

| Campo                    | Tipo    | Descrição                                      |
| ------------------------ | ------- | ---------------------------------------------- |
| `id`                     | Integer | Identificador único                            |
| `projectId`              | Integer | Projeto ao qual o concorrente pertence         |
| `concorrenteHash`        | String  | Hash único para identificação                  |
| `mercadoId`              | Integer | Mercado onde atua                              |
| `nome`                   | String  | Nome da empresa concorrente                    |
| `cnpj`                   | String  | CNPJ da empresa                                |
| `site`                   | String  | Website                                        |
| `produto`                | String  | Produto ou serviço oferecido                   |
| `porte`                  | Enum    | Porte da empresa (MEI, Pequena, Média, Grande) |
| `faturamentoEstimado`    | String  | Estimativa de faturamento anual                |
| `qualidadeScore`         | Integer | Score de qualidade (0-100)                     |
| `qualidadeClassificacao` | String  | Classificação textual da qualidade             |
| `validationStatus`       | Enum    | Status de validação                            |

**Regras de Identificação:**

- Concorrentes são identificados através de análise de CNAE similar e produtos concorrentes
- Cada concorrente está associado a um mercado específico
- Score de qualidade ajuda a identificar concorrentes mais relevantes

### 2.4 Leads

**Definição:** Empresas potenciais que ainda não foram qualificadas como clientes.

**Estrutura de Dados:**

| Campo                    | Tipo    | Descrição                                                                      |
| ------------------------ | ------- | ------------------------------------------------------------------------------ |
| `id`                     | Integer | Identificador único                                                            |
| `projectId`              | Integer | Projeto ao qual o lead pertence                                                |
| `leadHash`               | String  | Hash único para identificação                                                  |
| `mercadoId`              | Integer | Mercado de interesse                                                           |
| `nome`                   | String  | Nome da empresa                                                                |
| `cnpj`                   | String  | CNPJ (se disponível)                                                           |
| `site`                   | String  | Website                                                                        |
| `email`                  | String  | Email de contato                                                               |
| `telefone`               | String  | Telefone de contato                                                            |
| `tipo`                   | Enum    | Tipo de lead (inbound, outbound, referral)                                     |
| `porte`                  | Enum    | Porte estimado da empresa                                                      |
| `regiao`                 | String  | Região geográfica                                                              |
| `setor`                  | String  | Setor de atuação                                                               |
| `qualidadeScore`         | Integer | Score de qualidade (0-100)                                                     |
| `qualidadeClassificacao` | String  | Classificação textual                                                          |
| `validationStatus`       | Enum    | Status de validação                                                            |
| `stage`                  | Enum    | Estágio no funil (new, contacted, qualified, proposal, negotiation, won, lost) |

**Regras de Classificação:**

- Leads com score ≥ 60 são considerados "qualificados"
- Leads com score < 40 necessitam de enriquecimento antes do contato
- O campo `stage` permite rastreamento do progresso no funil de vendas

---

## 3. APIs e Integrações Externas

O Gestor PAV utiliza diversas APIs para enriquecimento automatizado de dados e funcionalidades avançadas.

### 3.1 Manus Forge API

**Base URL:** Configurado via variável de ambiente `BUILT_IN_FORGE_API_URL`  
**Autenticação:** Bearer Token via `BUILT_IN_FORGE_API_KEY`

A Forge API é a principal integração do sistema, fornecendo múltiplos serviços:

#### 3.1.1 Serviço de LLM (Large Language Model)

**Endpoint:** `/v1/chat/completions`  
**Arquivo:** `server/_core/llm.ts`  
**Função:** `invokeLLM()`

**Uso no Sistema:**

- Análise e classificação automatizada de textos
- Extração de informações estruturadas de descrições de empresas
- Geração de resumos e insights sobre mercados
- Suporte a respostas estruturadas via JSON Schema

**Exemplo de Uso:**

```typescript
const response = await invokeLLM({
  messages: [
    { role: "system", content: "Você é um analista de mercado." },
    {
      role: "user",
      content: "Analise esta empresa e identifique o mercado principal.",
    },
  ],
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "market_analysis",
      schema: {
        type: "object",
        properties: {
          market: { type: "string" },
          segment: { type: "string" },
        },
      },
    },
  },
});
```

#### 3.1.2 Serviço de Geração de Imagens

**Endpoint:** `/images.v1.ImageService/GenerateImage`  
**Arquivo:** `server/_core/imageGeneration.ts`  
**Função:** `generateImage()`

**Uso no Sistema:**

- Geração de imagens para visualização de dados
- Criação de assets visuais para relatórios
- Edição de imagens existentes

**Parâmetros:**

- `prompt`: Descrição textual da imagem desejada
- `originalImages`: Array de imagens para edição (opcional)

#### 3.1.3 Serviço de Transcrição de Áudio

**Endpoint:** `/v1/audio/transcriptions`  
**Arquivo:** `server/_core/voiceTranscription.ts`  
**Função:** `transcribeAudio()`

**Uso no Sistema:**

- Transcrição de reuniões e chamadas com clientes
- Conversão de notas de voz em texto
- Análise de conteúdo de áudio

**Limitações:**

- Tamanho máximo: 16MB
- Formatos suportados: webm, mp3, wav, ogg, m4a

#### 3.1.4 Serviço de Storage (S3)

**Endpoints:**

- Upload: `/v1/storage/upload`
- Download: `/v1/storage/downloadUrl`

**Arquivo:** `server/storage.ts`  
**Funções:** `storagePut()`, `storageGet()`

**Uso no Sistema:**

- Armazenamento de documentos anexados a clientes/leads
- Upload de planilhas de importação
- Backup de dados exportados

#### 3.1.5 Serviço de Data API

**Endpoint:** `/webdevtoken.v1.WebDevService/CallApi`  
**Arquivo:** `server/_core/dataApi.ts`  
**Função:** `callDataApi()`

**Uso no Sistema:**

- Enriquecimento de dados de CNPJ via APIs públicas
- Consulta de informações cadastrais de empresas
- Validação de dados fiscais

**Exemplo de Integração:**

```typescript
const empresaData = await callDataApi("cnpj-lookup", {
  cnpj: "12345678000190",
});
```

#### 3.1.6 Serviço de Notificações

**Endpoint:** `/v1/notifications/send`  
**Arquivo:** `server/_core/notification.ts`  
**Função:** `notifyOwner()`

**Uso no Sistema:**

- Alertas de novos leads qualificados
- Notificações de validações pendentes
- Avisos de erros críticos no sistema

### 3.2 OAuth e Autenticação

**Base URL:** Configurado via `OAUTH_SERVER_URL`  
**Arquivo:** `server/_core/sdk.ts`

**Endpoints:**

- `/webdev.v1.WebDevAuthPublicService/ExchangeToken`: Troca de código OAuth por token
- `/webdev.v1.WebDevAuthPublicService/GetUserInfo`: Obtenção de informações do usuário
- `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`: Validação de JWT

**Fluxo de Autenticação:**

1. Usuário é redirecionado para portal OAuth
2. Após autorização, código é trocado por token JWT
3. Token é armazenado em cookie seguro
4. Cada requisição valida o token e carrega dados do usuário

---

## 4. Processo de Enriquecimento de Dados

### 4.1 Fluxo de Identificação

```
1. Importação Inicial
   ↓
2. Cálculo de Score de Qualidade
   ↓
3. Classificação por Faixa
   ↓
4. Priorização (Score ≥ 60 primeiro)
   ↓
5. Enriquecimento via APIs
   ↓
6. Recálculo de Score
   ↓
7. Validação Manual (se necessário)
   ↓
8. Status: "rich" (pronto para uso)
```

### 4.2 Estratégias de Enriquecimento

**Para Clientes e Leads:**

1. **Consulta de CNPJ:** Busca dados cadastrais completos via Data API
2. **Web Scraping:** Extração de informações de websites oficiais
3. **Análise de Redes Sociais:** Coleta de dados de LinkedIn e Instagram
4. **Validação de Contatos:** Verificação de emails e telefones

**Para Mercados:**

1. **Análise de Tendências:** Uso de LLM para identificar tendências de mercado
2. **Mapeamento de Concorrentes:** Identificação automatizada de players principais
3. **Estimativa de Tamanho:** Cálculo baseado em número de empresas ativas

### 4.3 Regras de Validação

**Status de Validação:**

| Status             | Descrição                      | Ação Requerida              |
| ------------------ | ------------------------------ | --------------------------- |
| `pending`          | Aguardando validação inicial   | Revisar dados e classificar |
| `rich`             | Dados completos e validados    | Nenhuma (pronto para uso)   |
| `needs_adjustment` | Requer correção ou complemento | Enriquecer campos faltantes |
| `discarded`        | Descartado (não relevante)     | Nenhuma (arquivado)         |

**Critérios para Status "rich":**

- Score de qualidade ≥ 60
- Campos obrigatórios preenchidos: CNPJ, Nome, Email ou Telefone
- Dados validados manualmente ou via API

---

## 5. Sistema Multi-Projetos

### 5.1 Estrutura

O sistema suporta múltiplos projetos isolados, permitindo que diferentes pesquisas de mercado sejam gerenciadas separadamente.

**Tabela `projects`:**

| Campo       | Tipo     | Descrição                           |
| ----------- | -------- | ----------------------------------- |
| `id`        | Integer  | Identificador único                 |
| `nome`      | String   | Nome do projeto                     |
| `descricao` | Text     | Descrição detalhada                 |
| `cor`       | String   | Cor para identificação visual (hex) |
| `ativo`     | Boolean  | Status ativo/inativo (soft delete)  |
| `createdAt` | DateTime | Data de criação                     |
| `updatedAt` | DateTime | Data da última atualização          |

### 5.2 Isolamento de Dados

Todas as entidades (mercados, clientes, concorrentes, leads) possuem um campo `projectId` que garante o isolamento completo entre projetos. As queries do sistema automaticamente filtram dados pelo projeto selecionado.

**Exemplo de Query com Filtro:**

```typescript
const mercados = await getMercados({
  projectId: 1, // Projeto "Embalagens"
  search: "plástico",
});
```

### 5.3 Gerenciamento de Projetos

**Operações Disponíveis:**

- `createProject()`: Criação de novo projeto
- `getProjects()`: Listagem de projetos ativos
- `getProjectById()`: Busca por ID
- `updateProject()`: Atualização de dados
- `deleteProject()`: Soft delete (marca como inativo)

---

## 6. Métricas e Dashboard

### 6.1 Estatísticas Globais

O sistema calcula automaticamente as seguintes métricas:

**Totais por Entidade:**

- Total de mercados identificados
- Total de clientes mapeados
- Total de concorrentes catalogados
- Total de leads gerados

**Distribuição por Status:**

- Registros com status "rich" (prontos)
- Registros "pending" (aguardando validação)
- Registros "discarded" (descartados)

**Progresso por Mercado:**

- Top 10 mercados por número de clientes
- Percentual de validação por mercado
- Taxa de conversão de leads

### 6.2 Análises Disponíveis

**Distribuição de Segmentação:**

- Contagem de clientes B2B vs B2C vs B2B2C
- Análise de preferência de mercado

**Timeline de Validações:**

- Histórico de validações nos últimos 30 dias
- Velocidade de processamento

**Qualidade Média:**

- Score médio por tipo de entidade
- Evolução do score ao longo do tempo

---

## 7. Boas Práticas e Recomendações

### 7.1 Para Enriquecimento de Dados

1. **Priorize por Score:** Comece enriquecendo registros com score entre 40-60 (maior ROI)
2. **Use APIs com Moderação:** Implemente rate limiting para evitar bloqueios
3. **Valide Manualmente:** Registros críticos devem passar por validação humana
4. **Atualize Regularmente:** Dados de empresas mudam; estabeleça rotina de atualização

### 7.2 Para Identificação de Mercados

1. **Análise de CNAE:** Use códigos CNAE como ponto de partida
2. **Validação Cruzada:** Confirme mercados através de múltiplas fontes
3. **Segmentação Clara:** Defina claramente B2B vs B2C para cada mercado
4. **Monitoramento de Tendências:** Use LLM para análise periódica de tendências

### 7.3 Para Gestão de Leads

1. **Qualificação Rápida:** Leads com score < 40 devem ser enriquecidos antes do contato
2. **Rastreamento de Stage:** Mantenha o campo `stage` sempre atualizado
3. **Notas de Validação:** Documente razões para descarte ou ajustes necessários
4. **Follow-up Automatizado:** Configure notificações para leads qualificados

---

## 8. Limitações Conhecidas

### 8.1 Técnicas

- **Transcrição de Áudio:** Limite de 16MB por arquivo
- **Geração de Imagens:** Tempo de processamento pode variar (5-20 segundos)
- **Rate Limiting:** APIs externas podem ter limites de requisições

### 8.2 Funcionais

- **Validação de CNPJ:** Apenas formato, não valida dígitos verificadores
- **Deduplicação:** Baseada em hash; mudanças mínimas podem gerar duplicatas
- **Histórico:** Não há versionamento de alterações em registros

---

## 9. Roadmap Futuro

### 9.1 Melhorias Planejadas

**Enriquecimento Automatizado:**

- Integração com APIs de dados empresariais (Receita Federal, SERASA)
- Web scraping automatizado de websites corporativos
- Análise de sentimento em redes sociais

**Inteligência Artificial:**

- Classificação automatizada de mercados via ML
- Predição de score de qualidade final
- Recomendação de leads prioritários

**Análises Avançadas:**

- Dashboard comparativo entre projetos
- Análise de competitividade por mercado
- Previsão de crescimento de mercados

### 9.2 Integrações Futuras

- CRM (Salesforce, HubSpot, Pipedrive)
- Ferramentas de email marketing (Mailchimp, SendGrid)
- Plataformas de enriquecimento de dados (Clearbit, ZoomInfo)

---

## 10. Conclusão

O Gestor PAV implementa um sistema robusto e escalável para pesquisa de mercado, combinando regras de negócio bem definidas com integrações de APIs modernas. O sistema de score de qualidade permite priorização eficiente de esforços, enquanto o suporte a multi-projetos garante flexibilidade para diferentes iniciativas de pesquisa.

A arquitetura modular facilita a adição de novas fontes de dados e regras de enriquecimento, tornando o sistema adaptável às necessidades futuras da organização.

---

**Documento gerado por:** Manus AI  
**Última atualização:** 18 de novembro de 2025  
**Versão do sistema:** 06bc2b2e
