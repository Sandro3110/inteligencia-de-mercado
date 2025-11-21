# 🧪 ROTEIRO COMPLETO DE TESTES - FLUXO DE ENRIQUECIMENTO

**Gestor PAV - Sistema de Enriquecimento de Dados de Mercado**

Data: 21/11/2025  
Versão: 1.0

---

## 🎯 OBJETIVO

Este roteiro tem como objetivo **validar cada etapa do fluxo de enriquecimento** desde a entrada de dados até a apresentação nos dashboards, identificando pontos de falha e garantindo que o sistema funcione end-to-end.

---

## 📋 ESTRUTURA DOS TESTES

Cada teste segue o formato:

```
✅ TESTE XX: Nome do Teste
├─ Pré-requisitos: O que precisa estar configurado
├─ Passos: Como executar o teste
├─ Resultado Esperado: O que deve acontecer
├─ Resultado Obtido: [A PREENCHER]
└─ Status: [ ] Não testado | [✅] Passou | [❌] Falhou | [⚠️] Parcial
```

---

## 🧩 CATEGORIA 1: CONFIGURAÇÃO INICIAL

### ✅ TESTE 01: Verificar Variáveis de Ambiente

**Pré-requisitos**: Nenhum

**Passos**:

1. Acessar `/enrichment-config`
2. Verificar se campos de API keys estão visíveis
3. Verificar se há mensagem de configuração pendente

**Resultado Esperado**:

- Página carrega sem erros
- Campos de OpenAI API Key, ReceitaWS API Key, SerpAPI Key visíveis
- Se não configurado, exibe alerta

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 02: Salvar Configuração de APIs

**Pré-requisitos**: Ter chaves de API válidas

**Passos**:

1. Acessar `/enrichment-config`
2. Inserir OpenAI API Key válida
3. Inserir ReceitaWS API Key (opcional)
4. Inserir SerpAPI Key (opcional)
5. Clicar em "Salvar Configuração"

**Resultado Esperado**:

- Toast de sucesso: "Configuração salva com sucesso"
- Dados persistidos no banco (`enrichment_configs`)
- API keys criptografadas

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 03: Testar Chaves de API

**Pré-requisitos**: Ter configuração salva

**Passos**:

1. Acessar `/enrichment-config`
2. Clicar em "Testar Chaves"
3. Aguardar validação

**Resultado Esperado**:

- Loading spinner durante teste
- Toast de sucesso para chaves válidas
- Toast de erro para chaves inválidas
- Indicador visual de status (verde/vermelho)

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

## 🧩 CATEGORIA 2: CRIAÇÃO DE PROJETO E PESQUISA

### ✅ TESTE 04: Criar Novo Projeto

**Pré-requisitos**: Estar logado

**Passos**:

1. Acessar `/wizard` (Step 1)
2. Clicar em "Criar Novo Projeto"
3. Preencher nome: "Teste Enriquecimento"
4. Preencher descrição: "Projeto de teste"
5. Clicar em "Criar"

**Resultado Esperado**:

- Modal fecha automaticamente
- Novo projeto aparece no select
- Projeto automaticamente selecionado
- Botão "Próximo" habilitado

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 05: Wizard - Step 1 (Seleção de Projeto)

**Pré-requisitos**: Ter pelo menos 1 projeto criado

**Passos**:

1. Acessar `/wizard`
2. Verificar lista de projetos
3. Selecionar projeto "Teste Enriquecimento"
4. Clicar em "Próximo"

**Resultado Esperado**:

- Lista de projetos carrega corretamente
- Projetos hibernados aparecem com badge "Adormecido"
- Ao selecionar projeto, botão "Próximo" habilita
- Navega para Step 2

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 06: Wizard - Step 2 (Configuração de Parâmetros)

**Pré-requisitos**: Ter passado pelo Step 1

**Passos**:

1. Preencher nome da pesquisa: "Pesquisa Teste 001"
2. Preencher descrição: "Teste de enriquecimento completo"
3. Verificar configurações padrão
4. Clicar em "Próximo"

**Resultado Esperado**:

- Campos de nome e descrição aceitam texto
- Configurações padrão pré-preenchidas
- Validação de campos obrigatórios
- Navega para Step 3

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 07: Wizard - Step 3 (Escolha de Método)

**Pré-requisitos**: Ter passado pelo Step 2

**Passos**:

1. Verificar opções disponíveis:
   - Upload de arquivo
   - Entrada manual
   - Importação de pesquisa anterior
2. Selecionar "Entrada manual"
3. Clicar em "Próximo"

**Resultado Esperado**:

- 3 opções de método visíveis
- Ao selecionar, card destaca visualmente
- Botão "Próximo" habilita
- Navega para Step 4

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 08: Wizard - Step 4 (Inserção de Dados - Manual)

**Pré-requisitos**: Ter selecionado "Entrada manual" no Step 3

**Passos**:

1. Colar lista de clientes no textarea:
   ```
   Empresa A, 12345678000190
   Empresa B, 98765432000110
   Empresa C, 11223344000155
   ```
2. Verificar preview dos dados
3. Clicar em "Iniciar Enriquecimento"

**Resultado Esperado**:

- Textarea aceita texto
- Preview mostra 3 clientes detectados
- Validação de formato (nome, CNPJ)
- CNPJs inválidos destacados em vermelho
- Botão "Iniciar Enriquecimento" habilitado

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 09: Wizard - Step 4 (Upload de Arquivo CSV)

**Pré-requisitos**: Ter selecionado "Upload de arquivo" no Step 3

**Passos**:

1. Preparar arquivo CSV:
   ```csv
   nome,cnpj
   Empresa A,12345678000190
   Empresa B,98765432000110
   Empresa C,11223344000155
   ```
2. Fazer upload do arquivo
3. Verificar preview
4. Clicar em "Iniciar Enriquecimento"

**Resultado Esperado**:

- Upload aceita .csv e .xlsx
- Preview mostra dados do arquivo
- Validação de colunas (nome, cnpj)
- Mensagem de erro se formato inválido

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

## 🧩 CATEGORIA 3: PROCESSAMENTO DE ENRIQUECIMENTO

### ✅ TESTE 10: Iniciar Enriquecimento (3 clientes)

**Pré-requisitos**:

- Ter configuração de API salva
- Ter completado wizard com 3 clientes

**Passos**:

1. Clicar em "Iniciar Enriquecimento" no Step 4
2. Aguardar redirecionamento para `/enrichment-progress`
3. Observar progresso em tempo real

**Resultado Esperado**:

- Redirecionamento automático para página de progresso
- Barra de progresso inicia em 0%
- Contador de clientes: 0/3
- Status: "Processando..."
- Logs de atividade aparecem em tempo real

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 11: Monitoramento de Progresso em Tempo Real

**Pré-requisitos**: Enriquecimento em andamento

**Passos**:

1. Observar atualização da barra de progresso
2. Verificar logs de atividade
3. Verificar estatísticas:
   - Tempo decorrido
   - Tempo estimado
   - Clientes processados
   - Taxa de sucesso

**Resultado Esperado**:

- Barra de progresso atualiza a cada 5 segundos
- Logs aparecem em ordem cronológica
- Estatísticas calculadas corretamente
- Sem erros no console

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 12: Pausar Enriquecimento

**Pré-requisitos**: Enriquecimento em andamento

**Passos**:

1. Clicar em botão "Pausar"
2. Aguardar confirmação
3. Verificar status

**Resultado Esperado**:

- Botão "Pausar" muda para "Retomar"
- Status muda para "Pausado"
- Progresso para de atualizar
- Toast: "Enriquecimento pausado"

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 13: Retomar Enriquecimento

**Pré-requisitos**: Enriquecimento pausado

**Passos**:

1. Clicar em botão "Retomar"
2. Aguardar confirmação
3. Verificar retomada

**Resultado Esperado**:

- Botão "Retomar" muda para "Pausar"
- Status muda para "Processando..."
- Progresso retoma do ponto onde parou
- Toast: "Enriquecimento retomado"

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 14: Cancelar Enriquecimento

**Pré-requisitos**: Enriquecimento em andamento ou pausado

**Passos**:

1. Clicar em botão "Cancelar"
2. Confirmar no modal
3. Verificar cancelamento

**Resultado Esperado**:

- Modal de confirmação aparece
- Ao confirmar, status muda para "Cancelado"
- Progresso para completamente
- Toast: "Enriquecimento cancelado"
- Botão "Voltar para Home" aparece

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 15: Conclusão de Enriquecimento

**Pré-requisitos**: Enriquecimento em andamento (aguardar conclusão)

**Passos**:

1. Aguardar progresso chegar a 100%
2. Verificar mensagem de conclusão
3. Verificar estatísticas finais
4. Clicar em "Ver Resultados"

**Resultado Esperado**:

- Barra de progresso chega a 100%
- Status muda para "Concluído"
- Estatísticas finais exibidas:
  - Total de clientes: 3
  - Sucesso: 3
  - Erros: 0
  - Tempo total: ~30-40 segundos
- Botão "Ver Resultados" redireciona para `/cascade`

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

## 🧩 CATEGORIA 4: VALIDAÇÃO DE DADOS NO BANCO

### ✅ TESTE 16: Verificar Criação de Pesquisa

**Pré-requisitos**: Enriquecimento concluído

**Passos**:

1. Abrir banco de dados
2. Executar query:
   ```sql
   SELECT * FROM pesquisas
   WHERE nome = 'Pesquisa Teste 001'
   ORDER BY createdAt DESC LIMIT 1;
   ```

**Resultado Esperado**:

- 1 registro encontrado
- Campos preenchidos:
  - `id` (número)
  - `nome` = "Pesquisa Teste 001"
  - `descricao` = "Teste de enriquecimento completo"
  - `projectId` = ID do projeto de teste
  - `createdAt` (timestamp)

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 17: Verificar Criação de Clientes

**Pré-requisitos**: Enriquecimento concluído

**Passos**:

1. Executar query:
   ```sql
   SELECT * FROM clientes
   WHERE pesquisaId = [ID_DA_PESQUISA];
   ```

**Resultado Esperado**:

- 3 registros encontrados
- Campos enriquecidos preenchidos:
  - `nome` (original)
  - `cnpj` (original)
  - `siteOficial` (enriquecido)
  - `produtoPrincipal` (enriquecido)
  - `cidade` (enriquecido)
  - `uf` (enriquecido)
  - `regiao` (enriquecido)
  - `porte` (enriquecido)
  - `email` (enriquecido, se disponível)
  - `telefone` (enriquecido, se disponível)
  - `latitude` (enriquecido)
  - `longitude` (enriquecido)
  - `qualidadeScore` > 0

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 18: Verificar Criação de Mercados

**Pré-requisitos**: Enriquecimento concluído

**Passos**:

1. Executar query:
   ```sql
   SELECT m.*, COUNT(mc.clienteId) as totalClientes
   FROM mercados m
   LEFT JOIN mercado_clientes mc ON m.id = mc.mercadoId
   WHERE m.projectId = [ID_DO_PROJETO]
   GROUP BY m.id;
   ```

**Resultado Esperado**:

- Pelo menos 1 mercado criado
- Campos preenchidos:
  - `nome` (ex: "Embalagens Industriais")
  - `descricao` (detalhada)
  - `tamanhoEstimado` (ex: "R$ 500M - R$ 1B")
  - `tendencia` (ex: "Crescimento")
  - `nivelConcorrencia` (ex: "Alto")
- `totalClientes` >= 1

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 19: Verificar Associação Cliente-Mercado

**Pré-requisitos**: Enriquecimento concluído

**Passos**:

1. Executar query:
   ```sql
   SELECT mc.*, c.nome as clienteNome, m.nome as mercadoNome
   FROM mercado_clientes mc
   JOIN clientes c ON mc.clienteId = c.id
   JOIN mercados m ON mc.mercadoId = m.id
   WHERE c.pesquisaId = [ID_DA_PESQUISA];
   ```

**Resultado Esperado**:

- Pelo menos 3 registros (1 por cliente)
- Cada cliente associado a pelo menos 1 mercado
- Campos `clienteId` e `mercadoId` válidos

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 20: Verificar Criação de Produtos

**Pré-requisitos**: Enriquecimento concluído

**Passos**:

1. Executar query:
   ```sql
   SELECT p.*, c.nome as clienteNome
   FROM produtos p
   JOIN clientes c ON p.clienteId = c.id
   WHERE c.pesquisaId = [ID_DA_PESQUISA];
   ```

**Resultado Esperado**:

- Pelo menos 3 produtos criados (1 por cliente)
- Campos preenchidos:
  - `nome` (ex: "Embalagem PET")
  - `categoria` (ex: "Embalagens Plásticas")
  - `descricao` (detalhada)
  - `precoEstimado` (ex: "R$ 5,00 - R$ 10,00")
  - `clienteId` (válido)
  - `mercadoId` (válido)
  - `pesquisaId` (válido)

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 21: Verificar Criação de Concorrentes

**Pré-requisitos**: Enriquecimento concluído

**Passos**:

1. Executar query:
   ```sql
   SELECT co.*, m.nome as mercadoNome
   FROM concorrentes co
   JOIN mercados m ON co.mercadoId = m.id
   WHERE co.pesquisaId = [ID_DA_PESQUISA];
   ```

**Resultado Esperado**:

- Pelo menos 3 concorrentes criados
- Campos preenchidos:
  - `nome` (ex: "Concorrente XYZ")
  - `site` (se disponível)
  - `produto` (ex: "Embalagens de vidro")
  - `porte` (ex: "Grande")
  - `faturamentoEstimado` (se disponível)
  - `diferenciais` (texto)
  - `pontosFracos` (texto)
  - `qualidadeScore` > 0

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 22: Verificar Criação de Leads

**Pré-requisitos**: Enriquecimento concluído

**Passos**:

1. Executar query:
   ```sql
   SELECT l.*, m.nome as mercadoNome
   FROM leads l
   JOIN mercados m ON l.mercadoId = m.id
   WHERE l.pesquisaId = [ID_DA_PESQUISA];
   ```

**Resultado Esperado**:

- Pelo menos 3 leads criados
- Campos preenchidos:
  - `nome` (ex: "Lead ABC")
  - `site` (se disponível)
  - `tipo` (ex: "Potencial Cliente")
  - `porte` (ex: "Médio")
  - `setor` (ex: "Alimentos")
  - `localizacao` (ex: "São Paulo, SP")
  - `potencial` (ex: "Alto")
  - `qualidadeScore` > 0

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 23: Verificar Registro de Enrichment Run

**Pré-requisitos**: Enriquecimento concluído

**Passos**:

1. Executar query:
   ```sql
   SELECT * FROM enrichment_runs
   WHERE projectId = [ID_DO_PROJETO]
   ORDER BY startedAt DESC LIMIT 1;
   ```

**Resultado Esperado**:

- 1 registro encontrado
- Campos preenchidos:
  - `status` = "completed"
  - `totalClientes` = 3
  - `clientesEnriquecidos` = 3
  - `startedAt` (timestamp)
  - `completedAt` (timestamp)
  - `durationSeconds` > 0
  - `errorMessage` = NULL

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 24: Verificar Cache de Enriquecimento

**Pré-requisitos**: Enriquecimento concluído

**Passos**:

1. Executar query:
   ```sql
   SELECT * FROM enrichment_cache
   WHERE cnpj IN ('12345678000190', '98765432000110', '11223344000155');
   ```

**Resultado Esperado**:

- 3 registros encontrados (1 por CNPJ)
- Campos preenchidos:
  - `cnpj` (14 dígitos)
  - `data` (JSON com dados enriquecidos)
  - `createdAt` (timestamp)
  - `expiresAt` (timestamp, 30 dias depois)

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

## 🧩 CATEGORIA 5: VISUALIZAÇÃO NOS DASHBOARDS

### ✅ TESTE 25: Dashboard Home - Cards de Projetos

**Pré-requisitos**: Enriquecimento concluído

**Passos**:

1. Acessar `/`
2. Localizar card do projeto "Teste Enriquecimento"
3. Verificar estatísticas

**Resultado Esperado**:

- Card do projeto visível
- Estatísticas corretas:
  - Total de clientes: 3
  - Total de mercados: >= 1
  - Total de pesquisas: >= 1
  - Última atividade: hoje
- Botão "Ver Detalhes" funcional

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 26: CascadeView - Accordion de Mercados

**Pré-requisitos**: Enriquecimento concluído

**Passos**:

1. Acessar `/cascade`
2. Selecionar projeto "Teste Enriquecimento"
3. Selecionar pesquisa "Pesquisa Teste 001"
4. Expandir primeiro mercado

**Resultado Esperado**:

- Lista de mercados carrega
- Cada mercado mostra:
  - Nome do mercado
  - Descrição
  - Contador de clientes/concorrentes/leads
- Ao expandir, mostra tabs: Clientes | Concorrentes | Leads
- Animação suave de expansão

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 27: CascadeView - Tab Clientes

**Pré-requisitos**: Mercado expandido no CascadeView

**Passos**:

1. Clicar na tab "Clientes"
2. Verificar lista de clientes
3. Clicar em um cliente

**Resultado Esperado**:

- Lista de clientes do mercado
- Cada cliente mostra:
  - Nome
  - CNPJ
  - Cidade/UF
  - Quality Score (badge colorido)
  - Tags (se houver)
- Ao clicar, redireciona para `/cliente/:id`

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 28: CascadeView - Tab Concorrentes

**Pré-requisitos**: Mercado expandido no CascadeView

**Passos**:

1. Clicar na tab "Concorrentes"
2. Verificar lista de concorrentes
3. Clicar em um concorrente

**Resultado Esperado**:

- Lista de concorrentes do mercado
- Cada concorrente mostra:
  - Nome
  - Site (se disponível)
  - Porte
  - Produto
  - Quality Score
- Ao clicar, redireciona para `/concorrente/:id`

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 29: CascadeView - Tab Leads

**Pré-requisitos**: Mercado expandido no CascadeView

**Passos**:

1. Clicar na tab "Leads"
2. Verificar lista de leads
3. Clicar em um lead

**Resultado Esperado**:

- Lista de leads do mercado
- Cada lead mostra:
  - Nome
  - Tipo
  - Potencial
  - Localização
  - Quality Score
- Ao clicar, redireciona para `/lead/:id`

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 30: ClienteDetalhes - Dados Enriquecidos

**Pré-requisitos**: Ter clicado em um cliente

**Passos**:

1. Verificar seções da página:
   - Informações Básicas
   - Dados Enriquecidos
   - Mercados Associados
   - Produtos
   - Histórico de Mudanças
   - Mapa de Localização

**Resultado Esperado**:

- Todas as seções carregam sem erro
- Informações Básicas:
  - Nome, CNPJ, Quality Score
- Dados Enriquecidos:
  - Site, Email, Telefone
  - Cidade, UF, Região
  - Porte, Produto Principal
  - LinkedIn, Instagram
- Mapa mostra localização (se latitude/longitude disponíveis)
- Histórico mostra mudanças (se houver)

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 31: MercadoDetalhes - Visão Geral

**Pré-requisitos**: Ter clicado em um mercado

**Passos**:

1. Verificar informações do mercado
2. Verificar gráficos
3. Verificar listas de clientes/concorrentes/leads

**Resultado Esperado**:

- Informações do mercado:
  - Nome, Descrição
  - Tamanho Estimado
  - Tendência
  - Nível de Concorrência
  - Barreiras de Entrada
  - Oportunidades
- Gráficos:
  - Distribuição de clientes por região
  - Quality score médio
- Listas completas de clientes/concorrentes/leads

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 32: TendenciasDashboard - Análise de Qualidade

**Pré-requisitos**: Enriquecimento concluído

**Passos**:

1. Acessar `/tendencias`
2. Selecionar projeto "Teste Enriquecimento"
3. Selecionar período: "Últimos 30 dias"
4. Verificar gráficos e insights

**Resultado Esperado**:

- Gráfico de linha mostra evolução de qualidade
- Cards de insights:
  - Melhor tendência
  - Pior tendência
  - Qualidade média
- Tabela de mercados com maior variação
- Alertas de queda de qualidade (se houver)

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

## 🧩 CATEGORIA 6: FUNCIONALIDADES AVANÇADAS

### ✅ TESTE 33: Busca dentro do Accordion

**Pré-requisitos**: Mercado expandido no CascadeView

**Passos**:

1. Expandir mercado
2. Ir para tab "Clientes"
3. Digitar nome de cliente no campo de busca
4. Verificar filtragem em tempo real

**Resultado Esperado**:

- Campo de busca visível
- Filtragem acontece em tempo real (debounce 300ms)
- Contador atualiza: "Mostrando X de Y"
- Botão "Limpar busca" aparece quando há texto
- Busca não afeta outros mercados

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 34: Comparação de Mercados

**Pré-requisitos**: Ter pelo menos 2 mercados criados

**Passos**:

1. Acessar `/cascade`
2. Selecionar checkbox de 2 mercados
3. Clicar em "Comparar Selecionados"
4. Verificar modal de comparação

**Resultado Esperado**:

- Checkboxes funcionam
- Limite de 3 mercados selecionados
- Modal abre com comparação lado a lado
- Gráficos comparativos:
  - Total de clientes
  - Total de concorrentes
  - Total de leads
  - Quality score médio
- Tabela de comparação detalhada
- Botão "Exportar PDF"

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 35: Ações em Lote - Validar Selecionados

**Pré-requisitos**: Mercado expandido com clientes

**Passos**:

1. Expandir mercado
2. Tab "Clientes"
3. Selecionar 2 clientes (checkboxes)
4. Clicar em "Validar Selecionados"
5. Confirmar no modal

**Resultado Esperado**:

- Checkboxes funcionam
- Checkbox "Selecionar todos" funciona
- Botão "Validar Selecionados" habilitado
- Modal de confirmação aparece
- Ao confirmar:
  - Toast: "2 clientes validados"
  - Status dos clientes muda para "Validado"
  - Cache invalida e lista atualiza

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 36: Exportação de Dados Filtrados

**Pré-requisitos**: Ter dados no CascadeView

**Passos**:

1. Aplicar filtros (ex: apenas clientes com quality > 80)
2. Clicar em "Exportar"
3. Selecionar formato: CSV
4. Verificar download

**Resultado Esperado**:

- Dropdown de formatos: CSV | Excel | PDF
- Ao selecionar CSV:
  - Download inicia automaticamente
  - Arquivo contém apenas dados filtrados
  - Metadados incluídos (data, filtros, total)
  - Toast: "Arquivo exportado: clientes_filtrados_2025-11-21.csv"

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 37: Histórico de Enriquecimento

**Pré-requisitos**: Ter executado pelo menos 1 enriquecimento

**Passos**:

1. Acessar `/enrichment-progress`
2. Clicar em "Histórico"
3. Verificar lista de runs anteriores

**Resultado Esperado**:

- Lista de runs ordenada por data (mais recente primeiro)
- Cada run mostra:
  - Data/hora de início
  - Status (Concluído/Erro/Cancelado)
  - Total de clientes
  - Duração
  - Taxa de sucesso
- Ao clicar em um run, mostra detalhes

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 38: Agendamento de Enriquecimento

**Pré-requisitos**: Ter projeto e dados prontos

**Passos**:

1. Acessar `/enrichment-scheduler`
2. Selecionar projeto
3. Configurar agendamento:
   - Data: amanhã
   - Hora: 10:00
   - Recorrência: Nenhuma
4. Adicionar clientes
5. Salvar agendamento

**Resultado Esperado**:

- Formulário de agendamento completo
- Validação de data (não permitir passado)
- Opções de recorrência: Nenhuma | Diária | Semanal | Mensal
- Ao salvar:
  - Toast: "Agendamento criado"
  - Registro em `scheduled_enrichments`
  - Aparece na lista de agendamentos

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

## 🧩 CATEGORIA 7: TRATAMENTO DE ERROS

### ✅ TESTE 39: Enriquecimento sem Configuração de API

**Pré-requisitos**: Remover configuração de API

**Passos**:

1. Acessar `/enrichment-config`
2. Deletar configuração (se houver botão)
3. Tentar iniciar enriquecimento pelo wizard

**Resultado Esperado**:

- Ao tentar iniciar enriquecimento:
  - Erro: "Configuração de API não encontrada"
  - Modal de alerta com link para `/enrichment-config`
  - Enriquecimento não inicia

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 40: Enriquecimento com API Key Inválida

**Pré-requisitos**: Configurar API key inválida

**Passos**:

1. Acessar `/enrichment-config`
2. Inserir API key inválida: "sk-invalid-key"
3. Salvar
4. Iniciar enriquecimento

**Resultado Esperado**:

- Enriquecimento inicia
- Primeiro cliente falha com erro de autenticação
- Status do run: "error"
- Mensagem de erro clara: "API key inválida"
- Sugestão de ação: "Verifique sua configuração"

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 41: Enriquecimento com CNPJ Inválido

**Pré-requisitos**: Wizard configurado

**Passos**:

1. No Step 4, inserir cliente com CNPJ inválido:
   ```
   Empresa Teste, 12345678901234
   ```
2. Tentar iniciar enriquecimento

**Resultado Esperado**:

- Validação detecta CNPJ inválido
- CNPJ destacado em vermelho no preview
- Mensagem de erro: "CNPJ inválido (deve ter 14 dígitos)"
- Botão "Iniciar Enriquecimento" desabilitado
- Opção de corrigir ou remover linha

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 42: Enriquecimento com Cliente Duplicado

**Pré-requisitos**: Ter cliente já enriquecido

**Passos**:

1. Criar nova pesquisa
2. Inserir mesmo cliente (mesmo CNPJ)
3. Iniciar enriquecimento

**Resultado Esperado**:

- Enriquecimento detecta duplicação
- Opções:
  - Usar dados do cache (rápido)
  - Re-enriquecer (novo)
- Se usar cache:
  - Processamento instantâneo
  - Dados consistentes
  - Toast: "Dados recuperados do cache"

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 43: Falha de Conexão com API

**Pré-requisitos**: Simular falha de rede

**Passos**:

1. Desconectar internet (ou usar DevTools para simular offline)
2. Iniciar enriquecimento

**Resultado Esperado**:

- Erro de conexão detectado
- Retry automático (3 tentativas)
- Se todas falharem:
  - Status: "error"
  - Mensagem: "Falha de conexão. Verifique sua internet."
  - Opção de tentar novamente

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 44: Rate Limiting de API

**Pré-requisitos**: Enriquecer muitos clientes rapidamente

**Passos**:

1. Criar pesquisa com 100 clientes
2. Iniciar enriquecimento
3. Observar comportamento ao atingir rate limit

**Resultado Esperado**:

- Sistema detecta erro 429 (Too Many Requests)
- Implementa backoff exponencial
- Aguarda tempo sugerido pela API
- Retoma automaticamente
- Logs mostram: "Rate limit atingido. Aguardando 60s..."

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

## 🧩 CATEGORIA 8: PERFORMANCE E ESCALABILIDADE

### ✅ TESTE 45: Enriquecimento de 10 Clientes

**Pré-requisitos**: Configuração válida

**Passos**:

1. Criar pesquisa com 10 clientes
2. Iniciar enriquecimento
3. Medir tempo total

**Resultado Esperado**:

- Tempo total: 80-120 segundos
- Tempo médio por cliente: 8-12 segundos
- Taxa de sucesso: >= 90%
- Sem erros de memória
- Progresso atualiza suavemente

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 46: Enriquecimento de 50 Clientes (Batch)

**Pré-requisitos**: Configuração válida

**Passos**:

1. Criar pesquisa com 50 clientes
2. Iniciar enriquecimento
3. Verificar processamento em batches

**Resultado Esperado**:

- Processamento em batches de 10-20 clientes
- Tempo total: 400-600 segundos (~7-10 minutos)
- Progresso atualiza a cada batch
- Logs mostram: "Batch 1/5 concluído"
- Sem travamentos ou timeouts

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 47: Processamento Paralelo

**Pré-requisitos**: Batch de 50 clientes

**Passos**:

1. Verificar logs do servidor
2. Confirmar processamento paralelo (concurrency)

**Resultado Esperado**:

- Logs mostram múltiplos clientes sendo processados simultaneamente
- Concurrency: 3-5 clientes por vez
- Tempo total menor que processamento sequencial
- Sem race conditions ou conflitos

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 48: Cache de Enriquecimento

**Pré-requisitos**: Ter clientes já enriquecidos

**Passos**:

1. Criar nova pesquisa com mesmos CNPJs
2. Iniciar enriquecimento
3. Medir tempo de processamento

**Resultado Esperado**:

- Clientes com cache processam instantaneamente (<1s)
- Logs mostram: "Cache HIT para CNPJ 12345678000190"
- Tempo total drasticamente reduzido
- Dados consistentes com enriquecimento anterior

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

## 🧩 CATEGORIA 9: INTEGRAÇÃO E COMUNICAÇÃO

### ✅ TESTE 49: WebSocket - Notificações em Tempo Real

**Pré-requisitos**: Enriquecimento em andamento

**Passos**:

1. Abrir DevTools > Network > WS
2. Verificar conexão WebSocket
3. Observar mensagens recebidas

**Resultado Esperado**:

- Conexão WebSocket estabelecida
- Mensagens recebidas:
  - `enrichment_progress` (a cada 5s)
  - `enrichment_complete` (ao concluir)
- Payload contém:
  - `pesquisaId`
  - `progress` (0-100)
  - `status`
  - `stats`

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

### ✅ TESTE 50: Notificações de Alerta

**Pré-requisitos**: Configurar alerta de qualidade baixa

**Passos**:

1. Acessar configurações de alertas
2. Configurar: "Alertar se quality score < 50"
3. Enriquecer cliente com qualidade baixa
4. Verificar notificação

**Resultado Esperado**:

- Notificação aparece no canto superior direito
- Título: "⚠️ Alerta de Qualidade"
- Mensagem: "Cliente X tem quality score baixo (45)"
- Ação: "Ver Detalhes"
- Notificação persiste no banco (`notifications`)

**Resultado Obtido**: [A PREENCHER]

**Status**: [ ] Não testado

---

## 📊 RESUMO DE TESTES

### Estatísticas

- **Total de Testes**: 50
- **Não Testados**: [ ]
- **Passaram**: [ ]
- **Falharam**: [ ]
- **Parciais**: [ ]

### Taxa de Sucesso

```
Taxa de Sucesso = (Passaram / Total) * 100%
Taxa de Sucesso = ( ___ / 50) * 100% = ___%
```

---

## 🐛 BUGS ENCONTRADOS

### Bug #1: [TÍTULO]

- **Teste**: TESTE XX
- **Descrição**: [Descrever o bug]
- **Passos para Reproduzir**: [Listar passos]
- **Resultado Esperado**: [O que deveria acontecer]
- **Resultado Obtido**: [O que aconteceu]
- **Severidade**: [ ] Crítico | [ ] Alto | [ ] Médio | [ ] Baixo
- **Status**: [ ] Aberto | [ ] Em Análise | [ ] Corrigido | [ ] Fechado

---

## ✅ CHECKLIST FINAL

Antes de considerar o sistema pronto para produção:

- [ ] Todos os 50 testes executados
- [ ] Taxa de sucesso >= 95%
- [ ] Bugs críticos corrigidos
- [ ] Documentação atualizada
- [ ] Testes E2E automatizados criados
- [ ] Performance validada (10, 50, 100 clientes)
- [ ] Tratamento de erros robusto
- [ ] Logs e monitoramento implementados
- [ ] Backup e recuperação testados
- [ ] Segurança validada (API keys criptografadas)

---

**Documento criado em**: 21/11/2025  
**Última atualização**: 21/11/2025  
**Versão**: 1.0  
**Responsável**: [A PREENCHER]
