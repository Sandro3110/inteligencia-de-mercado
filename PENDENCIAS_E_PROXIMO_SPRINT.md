# Pendências do Sprint 1 e Planejamento do Sprint 2

**Data:** 04/12/2025  
**Projeto:** Dashboard de Qualidade de Dados - Inteligência de Mercado

---

## ❌ PENDÊNCIAS DO SPRINT 1

### 1. Funcionalidades Não Implementadas (Placeholders)

#### 1.1. Ações do EntidadeDetailsSheet (7 ações)

**Localização:** `EntidadeDetailsSheet.tsx` - Aba "Ações"

**Status:** 🔴 **Todas as ações são placeholders (apenas mostram toast)**

**Ações pendentes:**

1. **✏️ Editar Dados**
   - Abrir modal/sheet de edição
   - Formulário com todos os campos editáveis
   - Validação de CNPJ
   - Salvar alterações via API PUT `/api/entidades/:id`

2. **⚡ Enriquecer com IA**
   - Integrar com serviço de enriquecimento
   - Buscar dados complementares (faturamento, funcionários, etc.)
   - Atualizar registro com dados enriquecidos
   - Marcar `enriquecido = true`

3. **📥 Exportar Dados**
   - Gerar arquivo CSV/Excel com dados da entidade
   - Download automático
   - Incluir todas as abas (cadastrais, qualidade, etc.)

4. **📧 Enviar Email**
   - Abrir modal de composição de email
   - Preencher automaticamente o destinatário
   - Integrar com serviço de email (SendGrid/Resend)

5. **🌐 Abrir Website**
   - Validar se campo `website` existe
   - Abrir em nova aba
   - Tratar URLs sem protocolo (adicionar https://)

6. **🔄 Atualizar Dados**
   - Buscar dados atualizados de fontes externas
   - Comparar com dados atuais
   - Mostrar diff de alterações
   - Confirmar antes de salvar

7. **🗑️ Excluir Entidade**
   - Modal de confirmação com aviso de perigo
   - Verificar dependências (produtos, projetos, etc.)
   - Soft delete (marcar como inativo) ou hard delete
   - API DELETE `/api/entidades/:id`

**Estimativa:** 8-10 horas

---

#### 1.2. Ações de Enriquecimento (Aba 3)

**Localização:** `EntidadeDetailsSheet.tsx` - Aba "Enriquecimento"

**Status:** 🔴 **3 ações são placeholders**

**Ações pendentes:**

1. **⚡ Enriquecer com IA** (duplicada da Aba 6)
2. **🔄 Atualizar Dados** (duplicada da Aba 6)
3. **🌐 Buscar na Web**
   - Abrir busca no Google com nome da empresa
   - Ou integrar com API de busca
   - Mostrar resultados inline

**Estimativa:** 2-3 horas (se reutilizar implementação da Aba 6)

---

#### 1.3. Edição de Entidades

**Localização:** Não existe

**Status:** 🔴 **Não implementado**

**Requisitos:**
- Modal/Sheet de edição com formulário completo
- Validação de campos obrigatórios
- Validação de CNPJ (formato e dígitos verificadores)
- Validação de email
- Validação de telefone
- API PUT `/api/entidades/:id`
- Feedback de sucesso/erro

**Estimativa:** 6-8 horas

---

#### 1.4. Exclusão de Entidades

**Localização:** Não existe

**Status:** 🔴 **Não implementado**

**Requisitos:**
- Modal de confirmação com aviso de perigo
- Verificar dependências antes de excluir
- API DELETE `/api/entidades/:id`
- Remover da lista após exclusão
- Feedback de sucesso/erro

**Estimativa:** 2-3 horas

---

### 2. Funcionalidades Parcialmente Implementadas

#### 2.1. Validação de Qualidade

**Localização:** `EntidadeDetailsSheet.tsx` - Aba "Qualidade"

**Status:** 🟡 **Implementado visualmente, mas não persiste no banco**

**Problemas:**
- Score de qualidade é calculado no frontend (não persiste)
- Validações são hardcoded (não vêm do banco)
- Não há histórico de qualidade ao longo do tempo

**Pendências:**
- Criar tabela `fato_qualidade_entidade` para persistir scores
- Criar API para calcular e salvar score
- Criar trigger no banco para recalcular score ao atualizar entidade
- Adicionar gráfico de evolução do score

**Estimativa:** 4-5 horas

---

#### 2.2. Produtos e Mercados

**Localização:** `EntidadeDetailsSheet.tsx` - Aba "Produtos"

**Status:** 🟡 **Estrutura criada, mas sem dados**

**Problemas:**
- Não há relacionamento entre `dim_entidade` e `dim_produto`
- Não há relacionamento entre `dim_entidade` e `dim_mercado`
- Estado vazio implementado, mas sem ação para adicionar

**Pendências:**
- Criar tabela `fato_entidade_produto` (relacionamento N:N)
- Criar tabela `fato_entidade_mercado` (relacionamento N:N)
- Criar API `/api/entidades/:id/produtos`
- Criar API `/api/entidades/:id/mercados`
- Implementar modal para adicionar produtos/mercados
- Implementar remoção de produtos/mercados

**Estimativa:** 6-8 horas

---

### 3. Bugs Conhecidos

#### 3.1. Erro no Dev Server (EMFILE)

**Localização:** Dev server local

**Status:** 🟡 **Não afeta produção, mas dificulta desenvolvimento**

**Erro:**
```
Error: EMFILE: too many open files, watch '/home/ubuntu/data-quality-dashboard/vite.config.ts'
```

**Causa:** Limite de arquivos abertos no sistema operacional

**Soluções possíveis:**
1. Aumentar limite com `ulimit -n 10000`
2. Usar polling no Vite: `server: { watch: { usePolling: true } }`
3. Excluir `node_modules` do watch

**Estimativa:** 30 minutos

---

#### 3.2. Filtros não persistem ao voltar

**Localização:** `EntidadesListPage.tsx`

**Status:** 🟡 **Funciona, mas perde estado ao navegar**

**Problema:**
- Usuário aplica filtros
- Abre detalhes de uma entidade
- Fecha o sheet
- Filtros são mantidos (OK)
- Mas se navegar para outra página e voltar, perde os filtros

**Solução:**
- Salvar filtros no `localStorage`
- Ou adicionar filtros na URL (query params)
- Restaurar ao carregar a página

**Estimativa:** 1-2 horas

---

### 4. Melhorias de UX Identificadas

#### 4.1. Loading States

**Status:** 🟡 **Parcialmente implementado**

**Problemas:**
- Tabela não mostra skeleton durante carregamento
- Sheet não mostra loading ao abrir
- Filtros não mostram feedback ao aplicar

**Melhorias:**
- Adicionar skeleton na tabela
- Adicionar spinner no sheet
- Adicionar feedback visual nos filtros

**Estimativa:** 2-3 horas

---

#### 4.2. Mensagens de Erro

**Status:** 🔴 **Não implementado**

**Problemas:**
- Erros de API não são exibidos ao usuário
- Apenas console.error()
- Usuário não sabe o que aconteceu

**Melhorias:**
- Toast de erro ao falhar API
- Mensagem amigável (não técnica)
- Botão "Tentar novamente"

**Estimativa:** 1-2 horas

---

#### 4.3. Exportação em Massa

**Status:** 🔴 **Não implementado**

**Requisito:**
- Checkbox para selecionar múltiplas entidades
- Botão "Exportar selecionados"
- Gerar CSV/Excel com todas as entidades selecionadas

**Estimativa:** 3-4 horas

---

#### 4.4. Busca Avançada

**Status:** 🔴 **Não implementado**

**Requisito:**
- Modal de busca avançada
- Combinar múltiplos filtros com operadores (AND/OR)
- Salvar filtros favoritos
- Compartilhar URL com filtros

**Estimativa:** 6-8 horas

---

### 5. Testes Não Realizados

**Status:** 🔴 **Zero testes automatizados**

**Pendências:**
- Testes unitários das APIs
- Testes de integração (API + Banco)
- Testes E2E (Playwright/Cypress)
- Testes de validação de dados

**Estimativa:** 10-12 horas

---

## 📊 RESUMO DE PENDÊNCIAS

| Categoria | Itens | Estimativa Total |
|-----------|-------|------------------|
| Ações do Sheet | 7 ações | 8-10h |
| Edição/Exclusão | 2 funcionalidades | 8-11h |
| Qualidade de Dados | 1 funcionalidade | 4-5h |
| Produtos/Mercados | 1 funcionalidade | 6-8h |
| Bugs | 2 bugs | 1.5-2.5h |
| Melhorias UX | 4 melhorias | 12-17h |
| Testes | 1 suite completa | 10-12h |
| **TOTAL** | **18 itens** | **50-65.5h** |

---

## 🚀 SPRINT 2 - PRODUTOS

### Objetivo

Implementar sistema completo de **Browse e Detalhes de Produtos** seguindo o mesmo padrão de qualidade do Sprint 1 (Entidades).

---

### Escopo Definido

#### 1. API `/api/produtos` (6h)

**Arquivo:** `/api/produtos.ts`

**Requisitos:**

**Campos a retornar (todos de `dim_produto`):**
- `produto_id` (PK)
- `nome`
- `descricao`
- `categoria`
- `subcategoria`
- `preco`
- `moeda`
- `unidade`
- `sku`
- `ean`
- `ncm`
- `ativo`
- `data_cadastro`
- `data_atualizacao`
- `criado_por`
- `atualizado_por`

**Filtros a implementar:**
1. `busca` (nome, SKU, EAN)
2. `categoria`
3. `subcategoria`
4. `preco_min`
5. `preco_max`
6. `ativo` (true/false)
7. `data_inicio`
8. `data_fim`
9. `entidade_id` (filtro contextual - produtos de uma entidade)
10. `projeto_id` (filtro contextual)

**Paginação:**
- `limit` (padrão: 50)
- `offset` (padrão: 0)
- Retornar `total` count

**Validação matemática:**
- Verificar total de produtos no banco
- Validar filtros com queries SQL manuais
- Garantir 100% de precisão

**Estimativa:** 6 horas

---

#### 2. Hook `useProdutos` (1h)

**Arquivo:** `/client/src/hooks/useProdutos.ts`

**Requisitos:**
- Fetch da API `/api/produtos`
- Gerenciamento de estado (loading, error, data)
- Suporte a todos os filtros
- Paginação
- Refetch manual

**Estimativa:** 1 hora

---

#### 3. Browse de Produtos (8h)

**Arquivo:** `/client/src/pages/ProdutosListPage.tsx`

**Requisitos:**

**Layout:**
- Header com título "Produtos" e botão "Voltar"
- Seção de filtros (8 filtros)
- Contador de filtros ativos
- Tabela com 8 colunas
- Paginação
- Footer LGPD

**Filtros:**
1. Busca (nome, SKU, EAN)
2. Categoria (select)
3. Subcategoria (select)
4. Preço Mínimo (number)
5. Preço Máximo (number)
6. Ativo (select: Todos/Ativo/Inativo)
7. Data Início (date)
8. Data Fim (date)

**Tabela (colunas):**
1. Nome
2. SKU
3. Categoria
4. Subcategoria
5. Preço
6. Unidade
7. Ativo (badge)
8. Ações (ícone de detalhes)

**Interações:**
- Duplo click na linha → Abre `ProdutoDetailsSheet`
- Botão "Limpar" → Remove todos os filtros
- Paginação → Navega entre páginas

**Exibição dual:**
- "Exibindo 1-50 de 150 (500 total)"
- Primeiro número: filtrados
- Segundo número: total no banco

**Estimativa:** 8 horas

---

#### 4. Sheet de Detalhes (10h)

**Arquivo:** `/client/src/components/ProdutoDetailsSheet.tsx`

**Requisitos:**

**Estrutura:**
- Sheet lateral (direita)
- Header com nome do produto e botão fechar
- 5 abas com conteúdo completo

---

##### Aba 1: Informações Gerais (2h)

**Seções:**

1. **Identificação**
   - Nome
   - SKU
   - EAN
   - NCM
   - Status (badge ativo/inativo)

2. **Classificação**
   - Categoria
   - Subcategoria

3. **Precificação**
   - Preço
   - Moeda
   - Unidade de medida

4. **Descrição**
   - Descrição completa (textarea readonly)

**Estimativa:** 2 horas

---

##### Aba 2: Entidades Relacionadas (3h)

**Requisitos:**
- Listar entidades que possuem este produto
- Tabela com: Nome, CNPJ, Tipo, Cidade
- Click na linha → Abre `EntidadeDetailsSheet`
- Se vazio: "Nenhuma entidade vinculada a este produto"

**API necessária:**
- GET `/api/produtos/:id/entidades`

**Estimativa:** 3 horas

---

##### Aba 3: Mercados de Atuação (2h)

**Requisitos:**
- Listar mercados onde este produto é comercializado
- Cards com: Nome do mercado, Descrição
- Se vazio: "Nenhum mercado vinculado a este produto"

**API necessária:**
- GET `/api/produtos/:id/mercados`

**Estimativa:** 2 horas

---

##### Aba 4: Rastreabilidade (1h)

**Seções:**

1. **Origem dos Dados**
   - Fonte
   - Data de cadastro
   - Última atualização

2. **Auditoria**
   - Criado por
   - Atualizado por

**Estimativa:** 1 hora

---

##### Aba 5: Ações (2h)

**Ações disponíveis:**

1. **✏️ Editar Produto** (placeholder)
   - Toast: "Funcionalidade em desenvolvimento"

2. **📥 Exportar Dados** (placeholder)
   - Toast: "Funcionalidade em desenvolvimento"

3. **🔗 Vincular Entidade** (placeholder)
   - Toast: "Funcionalidade em desenvolvimento"

4. **🗑️ Excluir Produto** (placeholder)
   - Toast: "Funcionalidade em desenvolvimento"

**Estimativa:** 2 horas

---

#### 5. Navegação Contextual (2h)

**Requisitos:**

**Gestão de Conteúdo → Produtos:**
- Adicionar card "Produtos" no `DesktopTurboPage`
- Totalizador: "X produtos cadastrados"
- Click → Navega para `/produtos/list`

**Entidade → Produtos:**
- No `EntidadeDetailsSheet`, aba "Produtos"
- Click em um produto → Abre `ProdutoDetailsSheet`

**Produto → Entidades:**
- No `ProdutoDetailsSheet`, aba "Entidades"
- Click em uma entidade → Abre `EntidadeDetailsSheet`

**Estimativa:** 2 horas

---

#### 6. Validação Matemática (1h)

**Checklist:**

1. **Banco → Backend**
   ```sql
   SELECT COUNT(*) FROM dim_produto; -- Total
   SELECT COUNT(*) FROM dim_produto WHERE ativo = true; -- Ativos
   ```

2. **Backend → Frontend**
   - API retorna total correto
   - Frontend exibe total correto

3. **Filtros**
   - Cada filtro retorna quantidade correta
   - Combinação de filtros funciona corretamente

4. **Navegação Contextual**
   - Filtros passados via URL funcionam
   - Totalizadores na Gestão de Conteúdo estão corretos

**Estimativa:** 1 hora

---

#### 7. Testes Manuais (2h)

**Cenários de teste:**

1. **Browse básico**
   - Acessar `/produtos/list`
   - Verificar se todos os produtos aparecem
   - Verificar paginação

2. **Filtros**
   - Aplicar cada filtro individualmente
   - Combinar múltiplos filtros
   - Limpar filtros

3. **Detalhes**
   - Duplo click em um produto
   - Navegar entre as 5 abas
   - Verificar se todos os dados aparecem

4. **Navegação contextual**
   - Gestão de Conteúdo → Produtos
   - Entidade → Produtos → Detalhes
   - Produto → Entidades → Detalhes

5. **Validação matemática**
   - Conferir totalizadores
   - Conferir contadores de filtros

**Estimativa:** 2 horas

---

### Arquivos a Criar/Modificar

**Novos arquivos (5):**
1. `/api/produtos.ts` (API)
2. `/client/src/hooks/useProdutos.ts` (Hook)
3. `/client/src/pages/ProdutosListPage.tsx` (Browse)
4. `/client/src/components/ProdutoDetailsSheet.tsx` (Detalhes)
5. `/client/src/types/produto.ts` (Types)

**Arquivos a modificar (2):**
1. `/client/src/pages/DesktopTurboPage.tsx` (adicionar card Produtos)
2. `/client/src/components/EntidadeDetailsSheet.tsx` (adicionar click em produtos)

---

### Estimativa Total do Sprint 2

| Tarefa | Estimativa |
|--------|-----------|
| API `/api/produtos` | 6h |
| Hook `useProdutos` | 1h |
| Browse de Produtos | 8h |
| Sheet de Detalhes | 10h |
| Navegação Contextual | 2h |
| Validação Matemática | 1h |
| Testes Manuais | 2h |
| **TOTAL** | **30h** |

---

### Critérios de Sucesso

✅ API retorna todos os produtos corretamente  
✅ Filtros funcionam 100%  
✅ Browse exibe dados corretamente  
✅ Sheet abre e todas as abas funcionam  
✅ Navegação contextual funciona  
✅ Validação matemática 100% precisa  
✅ Zero placeholders funcionais (apenas nas ações)  
✅ Código commitado e em produção  

---

### Riscos Identificados

1. **Relacionamentos N:N não existem**
   - Tabelas `fato_entidade_produto` e `fato_produto_mercado` podem não existir
   - **Mitigação:** Criar tabelas se necessário

2. **Dados de teste insuficientes**
   - Pode haver poucos produtos no banco
   - **Mitigação:** Criar script de seed com produtos de exemplo

3. **Complexidade das abas de relacionamento**
   - Abas "Entidades" e "Mercados" requerem APIs adicionais
   - **Mitigação:** Implementar estado vazio primeiro, APIs depois

---

## 📅 CRONOGRAMA SUGERIDO

### Sprint 2 - Produtos (30h)

**Semana 1 (16h):**
- Dia 1 (8h): API + Hook + Início do Browse
- Dia 2 (8h): Finalizar Browse + Início do Sheet

**Semana 2 (14h):**
- Dia 3 (8h): Finalizar Sheet (5 abas)
- Dia 4 (6h): Navegação contextual + Validação + Testes

---

### Sprint 3 - Ações de Entidades (20h)

**Objetivo:** Implementar as 7 ações pendentes do `EntidadeDetailsSheet`

**Tarefas:**
1. Editar Dados (6h)
2. Enriquecer com IA (4h)
3. Exportar Dados (2h)
4. Enviar Email (3h)
5. Abrir Website (1h)
6. Atualizar Dados (2h)
7. Excluir Entidade (2h)

---

### Sprint 4 - Melhorias de UX (12h)

**Objetivo:** Resolver bugs e implementar melhorias de experiência

**Tarefas:**
1. Loading states (3h)
2. Mensagens de erro (2h)
3. Exportação em massa (4h)
4. Filtros persistentes (2h)
5. Fix EMFILE bug (1h)

---

### Sprint 5 - Qualidade e Relacionamentos (14h)

**Objetivo:** Persistir qualidade e implementar relacionamentos

**Tarefas:**
1. Persistir score de qualidade (5h)
2. Relacionamento Entidade-Produto (4h)
3. Relacionamento Entidade-Mercado (3h)
4. Gráfico de evolução de qualidade (2h)

---

## 📊 BACKLOG TOTAL

| Sprint | Objetivo | Estimativa | Status |
|--------|----------|-----------|--------|
| Sprint 1 | Entidades (Browse + Detalhes) | 10h | ✅ Concluído |
| Sprint 2 | Produtos (Browse + Detalhes) | 30h | 🔵 Próximo |
| Sprint 3 | Ações de Entidades | 20h | ⚪ Planejado |
| Sprint 4 | Melhorias de UX | 12h | ⚪ Planejado |
| Sprint 5 | Qualidade e Relacionamentos | 14h | ⚪ Planejado |
| **TOTAL** | **5 sprints** | **86h** | **12% concluído** |

---

## 🎯 PRIORIZAÇÃO

### Alta Prioridade (Fazer Agora)
1. ✅ Sprint 1 - Entidades (CONCLUÍDO)
2. 🔵 Sprint 2 - Produtos
3. 🔵 Sprint 3 - Ações de Entidades

### Média Prioridade (Fazer Depois)
4. 🟡 Sprint 4 - Melhorias de UX
5. 🟡 Sprint 5 - Qualidade e Relacionamentos

### Baixa Prioridade (Fazer Eventualmente)
6. ⚪ Busca Avançada
7. ⚪ Testes Automatizados
8. ⚪ Documentação Técnica

---

## 📝 CONCLUSÃO

O **Sprint 1 foi um sucesso**, mas deixou **18 pendências** identificadas que totalizam **50-65h** de trabalho adicional.

O **Sprint 2 (Produtos)** está bem definido e deve seguir o mesmo padrão de qualidade, com **30h estimadas**.

Os **Sprints 3-5** resolverão as pendências do Sprint 1 e adicionarão funcionalidades críticas, totalizando **46h adicionais**.

**Total do backlog:** 86h (5 sprints)  
**Progresso atual:** 12% (1/5 sprints concluídos)

---

**Próxima ação:** Iniciar Sprint 2 - Produtos
