# Teste Visual dos Seletores - Fase 103

## Estado Inicial

**Projeto Selecionado:** Ground
**Pesquisa Selecionada:** "Selecione um projeto" (não selecionada)
**Página:** CascadeView (Visão Geral)
**Mercados Exibidos:** 7 mercados (todos com 0 clientes/concorrentes/leads)

## Problemas Identificados

### 1. **Seletor de Pesquisa Não Funciona**

- Mostra "Selecione um projeto" mesmo com projeto "Ground" selecionado
- Deveria mostrar lista de pesquisas do projeto Ground
- Badge "Ativa" aparece mas seletor está vazio

### 2. **Dados Zerados**

- Todos os mercados mostram "0 clientes • 0 concorrentes • 0 leads"
- Isso indica que:
  - Ou não há pesquisa selecionada (correto comportamento)
  - Ou o filtro por pesquisaId não está funcionando

### 3. **PesquisaSelector Recebe projectId?**

- No AppSidebar, linha 459: `<PesquisaSelector />`
- **FALTA PASSAR O projectId!**
- Deveria ser: `<PesquisaSelector projectId={selectedProjectId} />`

## Próximos Passos

1. ✅ Corrigir AppSidebar para passar projectId ao PesquisaSelector
2. ⬜ Testar seleção de pesquisa
3. ⬜ Verificar se dados atualizam ao trocar projeto
4. ⬜ Verificar se dados atualizam ao trocar pesquisa
5. ⬜ Adicionar invalidação de cache ao trocar seleção
