# TODO - Sprint 1: Entidades Completo (ZERO PLACEHOLDERS)

**Data:** 04/12/2025  
**Objetivo:** Implementação 100% funcional do fluxo Gestão → Browse → Detalhes de Entidades

---

## Fase 1: Validar Schema (dim_entidade)

- [ ] Consultar schema completo de dim_entidade (48 campos)
- [ ] Validar tipos de dados de cada campo
- [ ] Validar relacionamentos (fato_entidade_contexto, dim_status_qualificacao, dim_importacao)
- [ ] Documentar campos obrigatórios vs opcionais
- [ ] Validar índices e constraints

---

## Fase 2: API /api/entidades

- [ ] Criar arquivo `/api/entidades.js`
- [ ] Implementar query base com JOIN em fato_entidade_contexto
- [ ] Implementar filtro `tipo` (cliente|lead|concorrente)
- [ ] Implementar filtro `projeto_id`
- [ ] Implementar filtro `pesquisa_id`
- [ ] Implementar filtro `busca` (nome, CNPJ, email)
- [ ] Implementar filtro `cidade`
- [ ] Implementar filtro `uf`
- [ ] Implementar filtro `setor`
- [ ] Implementar filtro `porte`
- [ ] Implementar filtro `score_min` e `score_max`
- [ ] Implementar filtro `enriquecido` (boolean)
- [ ] Implementar filtro `data_inicio` e `data_fim`
- [ ] Implementar filtro `validacao_cnpj`
- [ ] Implementar filtro `validacao_email`
- [ ] Implementar filtro `validacao_telefone`
- [ ] Implementar paginação (limit, offset)
- [ ] Retornar todos os 48 campos de dim_entidade
- [ ] Retornar total count
- [ ] Adicionar tratamento de erros

---

## Fase 3: Validação Matemática API

- [ ] Testar API sem filtros (total geral)
- [ ] Validar total com query direta no banco
- [ ] Testar filtro `tipo=cliente`
- [ ] Validar com COUNT no banco
- [ ] Testar filtro `projeto_id=17`
- [ ] Validar com COUNT no banco
- [ ] Testar combinação `tipo=cliente&projeto_id=17`
- [ ] Validar com COUNT no banco
- [ ] Testar filtro `busca=Alpha`
- [ ] Validar resultado
- [ ] Testar filtro `score_min=50&score_max=100`
- [ ] Validar resultado
- [ ] Testar paginação (limit=10, offset=0)
- [ ] Validar resultado
- [ ] Documentar todos os testes

---

## Fase 4: DesktopTurboPage (passar filtros)

- [ ] Abrir `/client/src/pages/DesktopTurboPage.tsx`
- [ ] Atualizar `handleRowClick` para passar `projeto_id` e `pesquisa_id`
- [ ] Passar `tipo` conforme linha clicada (clientes→cliente, leads→lead, etc)
- [ ] Construir URL com query params: `/entidades?tipo=X&projeto_id=Y&pesquisa_id=Z`
- [ ] Testar navegação no browser

---

## Fase 5: EntidadesListPage

- [ ] Criar arquivo `/client/src/pages/EntidadesListPage.tsx`
- [ ] Criar hook `useEntidades` para buscar dados
- [ ] Ler query params da URL (tipo, projeto_id, pesquisa_id)
- [ ] Implementar estado de filtros específicos
- [ ] Implementar input de busca textual (debounce 500ms)
- [ ] Implementar autocomplete de cidade (buscar cidades do banco)
- [ ] Implementar select de UF (buscar UFs do banco)
- [ ] Implementar autocomplete de setor (buscar setores do banco)
- [ ] Implementar select de porte (buscar portes do banco)
- [ ] Implementar range slider de score (0-100)
- [ ] Implementar toggle de enriquecido (Sim/Não/Todos)
- [ ] Implementar date range de criação
- [ ] Implementar checkboxes de validações
- [ ] Exibir badges de filtros ativos
- [ ] Implementar botão "Limpar Filtros"
- [ ] Implementar lista de entidades (12 campos conforme spec)
- [ ] Implementar duplo click → abrir EntidadeDetailsSheet
- [ ] Implementar paginação
- [ ] Implementar loading states
- [ ] Implementar empty states
- [ ] Implementar error states

---

## Fase 6: EntidadeDetailsSheet

- [ ] Criar arquivo `/client/src/components/EntidadeDetailsSheet.tsx`
- [ ] Criar hook `useEntidadeDetails` para buscar dados completos
- [ ] Implementar Sheet do shadcn/ui (largura 800px)
- [ ] Implementar Tabs com 6 abas

### Aba 1: Dados Cadastrais
- [ ] Seção Identificação (nome, nome_fantasia, tipo, hash)
- [ ] Seção Documentos (cnpj com validação)
- [ ] Seção Contato (email, telefone, site com botões)
- [ ] Seção Localização (cidade, uf com botão mapa)
- [ ] Seção Dados Comerciais (porte, setor, produto_principal, segmentacao)
- [ ] Seção Estrutura (filiais, lojas, funcionários)

### Aba 2: Qualidade de Dados
- [ ] Gauge de score geral (0-100%)
- [ ] Lista de validações (CNPJ, Email, Telefone)
- [ ] Lista de campos faltantes
- [ ] Botão "Enriquecer com IA"
- [ ] Botão "Preencher Manualmente"
- [ ] Exibir data da última validação
- [ ] Exibir status de qualificação

### Aba 3: Enriquecimento IA
- [ ] Exibir status de enriquecimento
- [ ] Se não enriquecido: mostrar botão + custo estimado
- [ ] Se enriquecido: mostrar dados + data + usuário
- [ ] Exibir cache hit/miss
- [ ] Botão "Ver Prompt Usado"
- [ ] Botão "Enriquecer Novamente"
- [ ] Botão "Limpar Cache"
- [ ] Histórico de enriquecimentos

### Aba 4: Produtos e Mercados
- [ ] Buscar produtos vinculados (fato_entidade_produto)
- [ ] Exibir lista de produtos
- [ ] Botão "Adicionar Produto"
- [ ] Botão "Ver Detalhes" (cada produto)
- [ ] Botão "Remover" (cada produto)
- [ ] Buscar mercados vinculados (dim_mercado)
- [ ] Exibir lista de mercados
- [ ] Botão "Adicionar Mercado"
- [ ] Botão "Ver Detalhes" (cada mercado)
- [ ] Botão "Remover" (cada mercado)

### Aba 5: Rastreabilidade
- [ ] Seção Origem (tipo, arquivo, processo, data, usuário)
- [ ] Link para importação (se importacao_id existir)
- [ ] Seção Auditoria (created_at, created_by, updated_at, updated_by)
- [ ] Histórico de alterações (audit logs)
- [ ] Botão "Ver Log Completo"

### Aba 6: Ações
- [ ] Seção Ações Rápidas (Editar, Enriquecer, Converter)
- [ ] Seção Exportar (PDF, JSON, Excel)
- [ ] Seção Outras Ações (Duplicar, Arquivar)
- [ ] Seção Zona de Perigo (Deletar)
- [ ] Implementar modal de confirmação para ações destrutivas

---

## Fase 7: Validação Matemática Frontend

- [ ] Testar EntidadesListPage sem filtros
- [ ] Validar total com API
- [ ] Testar com filtro tipo=cliente
- [ ] Validar total com API
- [ ] Testar com filtros herdados (projeto_id, pesquisa_id)
- [ ] Validar total com API
- [ ] Testar filtro de busca
- [ ] Validar resultado com API
- [ ] Testar filtro de score
- [ ] Validar resultado com API
- [ ] Testar duplo click
- [ ] Validar dados no sheet com API
- [ ] Testar paginação
- [ ] Validar dados com API

---

## Fase 8: Teste End-to-End

- [ ] Abrir Gestão de Conteúdo
- [ ] Selecionar projeto "Dados Gerais"
- [ ] Selecionar pesquisa "Importação Geral"
- [ ] Clicar em "Clientes"
- [ ] Validar URL com query params
- [ ] Validar filtros herdados exibidos
- [ ] Validar total de clientes (20)
- [ ] Aplicar filtro de busca "Alpha"
- [ ] Validar resultado (1 cliente)
- [ ] Duplo click na linha
- [ ] Validar sheet aberto
- [ ] Validar dados na aba "Dados Cadastrais"
- [ ] Validar dados na aba "Qualidade"
- [ ] Validar dados na aba "Enriquecimento"
- [ ] Validar dados na aba "Produtos e Mercados"
- [ ] Validar dados na aba "Rastreabilidade"
- [ ] Testar botões da aba "Ações"
- [ ] Fechar sheet
- [ ] Limpar filtros
- [ ] Validar total volta para 20

---

## Fase 9: Commit e Deploy

- [ ] Revisar código
- [ ] Remover console.logs
- [ ] Verificar TypeScript (zero erros)
- [ ] Fazer commit com mensagem descritiva
- [ ] Push para GitHub
- [ ] Aguardar build do Vercel

---

## Fase 10: Validação em Produção

- [ ] Acessar https://intelmarket.app/desktop-turbo
- [ ] Testar fluxo completo em produção
- [ ] Validar filtros funcionando
- [ ] Validar duplo click funcionando
- [ ] Validar sheet com dados corretos
- [ ] Validar todas as abas
- [ ] Gerar relatório de validação

---

**REGRA ABSOLUTA: ZERO PLACEHOLDERS, ZERO TODOs NO CÓDIGO**
