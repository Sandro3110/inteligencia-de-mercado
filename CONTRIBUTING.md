# Guia de Contribuição - Intelmarket

Bem-vindo ao projeto Intelmarket! Este guia explica como contribuir com o desenvolvimento do sistema.

---

## 📋 Estrutura de Branches

O projeto utiliza o modelo Git Flow simplificado:

- **`main`** - Branch de produção (sempre estável)
- **`develop`** - Branch de desenvolvimento (integração contínua)
- **`feature/*`** - Novas funcionalidades
- **`bugfix/*`** - Correções de bugs
- **`hotfix/*`** - Correções urgentes em produção

---

## 🚀 Fluxo de Trabalho

### 1. Nova Funcionalidade

```bash
# Criar branch a partir de develop
git checkout develop
git pull origin develop
git checkout -b feature/nome-da-funcionalidade

# Desenvolver e commitar
git add .
git commit -m "feat: descrição da funcionalidade"

# Push e criar Pull Request
git push origin feature/nome-da-funcionalidade
```

### 2. Correção de Bug

```bash
# Criar branch a partir de develop
git checkout develop
git pull origin develop
git checkout -b bugfix/nome-do-bug

# Corrigir e commitar
git add .
git commit -m "fix: descrição da correção"

# Push e criar Pull Request
git push origin bugfix/nome-do-bug
```

### 3. Hotfix (Correção Urgente)

```bash
# Criar branch a partir de main
git checkout main
git pull origin main
git checkout -b hotfix/nome-do-hotfix

# Corrigir e commitar
git add .
git commit -m "fix: correção urgente"

# Push e criar Pull Request para main E develop
git push origin hotfix/nome-do-hotfix
```

---

## 📝 Padrão de Commits (Conventional Commits)

Use o formato: `tipo: descrição`

**Tipos:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Atualização de documentação
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Tarefas de manutenção

**Exemplos:**
```
feat: adicionar filtro por região no dashboard
fix: corrigir erro de validação no formulário de cliente
docs: atualizar guia de instalação
refactor: otimizar query de busca de mercados
test: adicionar testes para módulo de enriquecimento
chore: atualizar dependências do projeto
```

---

## 🔍 Code Review

Todas as mudanças devem passar por revisão antes do merge:

1. Criar Pull Request com descrição clara
2. Aguardar revisão do orquestrador ou time
3. Implementar feedbacks solicitados
4. Aguardar aprovação final
5. Merge será feito pelo orquestrador

---

## ✅ Checklist Antes do Pull Request

- [ ] Código segue os padrões do projeto
- [ ] Testes foram adicionados/atualizados
- [ ] Documentação foi atualizada
- [ ] Commit messages seguem o padrão
- [ ] Branch está atualizada com develop
- [ ] Build está passando sem erros

---

## 🗄️ Alterações no Banco de Dados

Para alterações no schema do banco:

1. Criar migration com nome descritivo:
   ```bash
   YYYYMMDD_HHMM_descricao_da_mudanca.sql
   ```

2. Testar migration localmente (se possível)

3. Aplicar via orquestrador no Supabase

4. Atualizar TypeScript types:
   ```bash
   pnpm db:push
   ```

5. Documentar mudança no Notion

---

## 📚 Documentação

Toda funcionalidade nova deve incluir:

- Comentários no código quando necessário
- Atualização do README (se aplicável)
- Documentação no Notion
- Exemplos de uso

---

## 🐛 Reportar Bugs

Para reportar bugs:

1. Verificar se já não foi reportado
2. Criar issue no GitHub com:
   - Descrição clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)
   - Ambiente (navegador, SO, etc.)

---

## 💡 Sugerir Melhorias

Para sugerir melhorias:

1. Criar issue no GitHub com tag `enhancement`
2. Descrever o problema que a melhoria resolve
3. Propor solução (se tiver)
4. Aguardar discussão e aprovação

---

## 🤝 Contato

Para dúvidas ou suporte:

- **Orquestrador:** Manus AI
- **GitHub:** https://github.com/Sandro3110/inteligencia-de-mercado
- **Notion:** https://www.notion.so/2b49d3ac869d81b38cdef098d8cb4394

---

**Obrigado por contribuir com o Intelmarket!** 🎉
