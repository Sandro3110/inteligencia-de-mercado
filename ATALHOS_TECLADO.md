# Atalhos de Teclado - Gestor PAV

Documentação completa de todos os atalhos de teclado disponíveis no sistema.

---

## 🧭 Navegação Principal

| Atalho | Ação | Descrição |
|--------|------|-----------|
| `Ctrl + 1` | Dashboard | Navega para a página inicial do Dashboard |
| `Ctrl + M` | Mercados | Acessa a visualização de Mercados |
| `Ctrl + 3` | Analytics | Abre a página de Analytics |
| `Ctrl + 4` | ROI | Navega para análise de ROI |
| `Ctrl + E` | Exportação | Acessa o histórico de exportações |
| `Ctrl + G` | Gerenciar Projetos | Abre a página de gerenciamento de projetos |

---

## ⚡ Ações Rápidas

| Atalho | Ação | Descrição |
|--------|------|-----------|
| `Ctrl + R` | **Atualizar Dados** | Força refresh manual de todos os dados (NOVO!) |
| `Ctrl + K` | Busca Global | Abre o campo de busca global |
| `Ctrl + N` | Novo Projeto | Inicia criação de novo projeto de enriquecimento |
| `Ctrl + P` | Seletor de Projetos | Abre dropdown para trocar de projeto (NOVO!) |
| `Ctrl + S` | Seletor de Pesquisas | Abre dropdown para trocar de pesquisa (NOVO!) |

---

## 🏛️ Interface

| Atalho | Ação | Descrição |
|--------|------|-----------|
| `Ctrl + B` | Toggle Sidebar | Expande/colapsa o menu lateral |
| `Ctrl + /` | Ajuda de Atalhos | Mostra este modal de atalhos |
| `?` | Ajuda de Atalhos | Alternativa para mostrar atalhos |
| `Esc` | Fechar Modal | Fecha qualquer modal ou dialog aberto |

---

## 🆕 Novidades da Fase 76

### 1. **Ctrl + R - Refresh Manual**
- Atualiza todos os dados do sistema instantaneamente
- Previne reload da página (não usa o Ctrl+R padrão do navegador)
- Exibe toast de confirmação após atualização
- Funciona em qualquer página do sistema

### 2. **Auto-refresh Inteligente**
- Toggle disponível no sidebar (botão "Auto/Manual")
- Atualiza dados automaticamente a cada 5 minutos
- Só atualiza quando aba está visível (economiza recursos)
- Preferência salva no localStorage
- Indicador visual quando ativo (ícone pulsante)

### 3. **Indicador de Dados Desatualizados**
- Badge ⚠️ aparece quando dados têm >10 minutos
- Cor laranja/amarela para chamar atenção
- Animação de pulse para destacar
- Tooltip explicativo ao passar mouse

### 4. **Ctrl + P / Ctrl + S - Seletores Rápidos**
- `Ctrl + P`: Abre dropdown de projetos sem usar mouse
- `Ctrl + S`: Abre dropdown de pesquisas sem usar mouse
- Navegação 100% por teclado

---

## 📋 Conflitos Evitados

Os seguintes atalhos foram **evitados** para não conflitar com atalhos nativos do navegador:

- `Ctrl + T` (nova aba)
- `Ctrl + W` (fechar aba)
- `Ctrl + Tab` (trocar aba)
- `Ctrl + F` (buscar na página)
- `Ctrl + H` (histórico)
- `Ctrl + D` (adicionar favorito)

---

## 🎯 Boas Práticas

1. **Use `Ctrl + R`** em vez do botão "Atualizar Dados" para agilizar workflow
2. **Ative auto-refresh** se trabalha com dados em tempo real
3. **Use `Ctrl + P/S`** para trocar contexto rapidamente
4. **Pressione `?`** sempre que esquecer um atalho
5. **`Esc`** é seu amigo para fechar qualquer modal

---

## 🔧 Configurações

### Auto-refresh
- **Padrão**: Desativado
- **Intervalo**: 5 minutos
- **Persistência**: Salvo no localStorage
- **Inteligência**: Pausa quando aba está inativa

### Atalhos de Teclado
- **Sempre ativos**: Sim (exceto quando digitando em inputs)
- **Customizáveis**: Não (fixos no código)
- **Case-sensitive**: Não

---

## 📝 Changelog

### Fase 76 (Atual)
- ✅ Adicionado `Ctrl + R` para refresh manual
- ✅ Implementado auto-refresh inteligente (5min)
- ✅ Indicador de dados desatualizados (>10min)
- ✅ Adicionado `Ctrl + P` (seletor de projetos)
- ✅ Adicionado `Ctrl + S` (seletor de pesquisas)
- ✅ Adicionado `Ctrl + M` (ir para Mercados)
- ✅ Adicionado `Ctrl + E` (ir para Exportação)
- ✅ Adicionado `Ctrl + G` (ir para Gerenciar Projetos)
- ✅ Reorganizado modal de ajuda por categorias

### Fase 75
- Implementado sistema de contexto de trabalho
- Botão manual de atualização no sidebar

### Fases Anteriores
- `Ctrl + K`: Busca global
- `Ctrl + N`: Novo projeto
- `Ctrl + B`: Toggle sidebar
- `Ctrl + 1-4`: Navegação rápida

---

## 🐛 Problemas Conhecidos

Nenhum problema conhecido no momento.

---

## 💡 Sugestões Futuras

- [ ] Permitir customização de atalhos pelo usuário
- [ ] Adicionar atalhos para ações dentro de modals (ex: Enter para confirmar)
- [ ] Implementar atalho para focar busca dentro de tabelas
- [ ] Adicionar atalho para exportação rápida (Ctrl + Shift + E)
- [ ] Implementar navegação por tabs com Ctrl + Tab (dentro do app)

---

**Última atualização**: Fase 76 - Melhorias de UX e Atalhos de Teclado
