# Pendências Priorizadas - Fases 1 e 2

## 🔴 Bloqueada (Tratar ao Final)

### API de Produtos
- **Status:** Bloqueada após 11 tentativas
- **Problema:** API retorna `null`
- **Ação:** Investigar logs do Vercel
- **Tempo estimado:** 2-3h com acesso aos logs

---

## ✅ Em Implementação

### 1. Ações do Sheet de Entidades (8-10h)

#### 1.1 Editar Dados ⏳
- Criar modal de edição
- Formulário com validação
- API PUT /api/entidades/:id
- Atualizar cache após salvar

#### 1.2 Exportar Dados ⏳
- Gerar CSV com dados da entidade
- Download automático
- Incluir dados relacionados

#### 1.3 Abrir Website ⏳
- Validar URL
- Abrir em nova aba
- Tratar URLs sem protocolo

#### 1.4 Excluir Entidade ⏳
- Modal de confirmação
- API DELETE /api/entidades/:id
- Soft delete (deleted_at)
- Atualizar lista após exclusão

---

## 🟡 Próximas (Após Ações)

### 2. Validação de Qualidade (2-3h)
- Persistir score no banco
- Calcular automaticamente
- Atualizar em tempo real

### 3. Relacionamentos N:N (3-4h)
- Vincular produtos a entidades
- Vincular mercados a produtos
- Interface de gerenciamento

### 4. Bugs (1.5-2.5h)
- Fix EMFILE (muitos arquivos abertos)
- Persistir filtros na URL
- Loading states

---

**Total estimado:** 15-20h (excluindo API de produtos)
