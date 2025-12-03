# 🐛 PROBLEMAS E AJUSTES REPORTADOS

**Data:** 03/12/2025  
**Status:** Aguardando confirmação para implementar  

---

## 📋 BLOCO 1: UI/UX - Login + Sidebar + Dashboard + Base de Dados

### Problemas da Tela de Login:
- [ ] **P1.1:** Elemento de login não está centralizado na tela
- [ ] **P1.2:** Fundo deve ter cor sólida (remover gradientes/imagens)
- [ ] **P1.3:** Existe elemento oculto gerando espaço em branco abaixo da tela

### Problemas do Sidebar:
- [ ] **P1.4:** Sidebar ultrapassando limite da tela - opções de Ajuda ficando ocultas
- [ ] **P1.5:** Toggle Dark/Light sobrepondo as últimas opções do menu

### Problemas do Dashboard:
- [ ] **P1.6:** Remover card de "Cidades"
- [ ] **P1.7:** Adicionar 3 novos cards de resumo:
  - Card 1: Total de Clientes + Leads + Concorrentes (combinado)
  - Card 2: Total de Produtos
  - Card 3: Total de Mercados
- [ ] **P1.8:** Reduzir tamanho dos cards de "Ações Rápidas" para caber tudo na mesma tela (sem scroll)

### Problemas da Base de Dados (EntidadesPage):
- [ ] **P1.9:** Duplo click na linha deve abrir modal/card com todas as informações da entidade
  - Incluir botão "Voltar"
  - Incluir botão "Copiar" (copiar dados para clipboard)
- [ ] **P1.10:** Filtros não estão funcionando (Todos, Cliente, Leads, Concorrentes)
  - Frontend está correto, backend ignora parâmetro `tipo`
- [ ] **P1.11:** Barra de busca não está funcionando (digita e continua mostrando todos)
  - Frontend está correto, backend ignora parâmetro `busca`
- [ ] **P1.12:** Remover botão "Nova Entidade" do header da página
- [ ] **P1.13:** Adicionar botões de exportação Excel/CSV
  - Exportar dados filtrados (respeitar busca e tipo)
  - Formato profissional com colunas formatadas
  - Usar componente ExportButton existente
- [ ] **P1.14:** Botões de paginação não funcionam (Anterior/Próxima sem efeito)
  - Frontend está correto, backend ignora parâmetros `limit` e `offset`

### Arquivos afetados:
- `client/src/pages/LoginPage.tsx`
- `client/src/components/Layout.tsx`
- `client/src/pages/HomePage.tsx`
- `client/src/pages/EntidadesPage.tsx`
- `api/trpc.js` (endpoint entidades.list e dashboard.stats)
- `api/exportar-relatorio.js` (adicionar tipo "entidades")

### Prioridade: 🔴 ALTA (UX crítico)

---

## ✅ STATUS:
- **Problemas coletados:** 14
- **Blocos em andamento:** 1
- **Blocos prontos:** 0
- **Blocos deployados:** 0

---

## 🎯 CAUSAS RAIZ IDENTIFICADAS:

### Backend `api/trpc.js` - endpoint `entidades.list` (linha 676-682):
❌ **Ignora TODOS os parâmetros do frontend:**
- `busca` → não implementado
- `tipo` → não implementado
- `limit` → usa 100 fixo
- `offset` → não implementado

**Resultado:** Sempre retorna os mesmos 100 registros, sem filtros, sem busca, sem paginação.

---

**Última atualização:** 03/12/2025 - Pronto para implementar
