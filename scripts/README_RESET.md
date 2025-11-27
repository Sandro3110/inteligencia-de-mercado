# 🔄 RESET DO BANCO DE DADOS - IntelMarket

## 📋 O que este script faz?

1. ✅ **Aprova e configura `sandrodireto@gmail.com` como admin**
2. ✅ **Apaga todos os outros usuários**
3. ✅ **Limpa todos os dados de teste** (projetos, pesquisas, mercados, leads, etc.)
4. ✅ **Reseta sequences** (IDs começam do 1 novamente)

---

## 🚀 COMO EXECUTAR

### Opção 1: Supabase SQL Editor (RECOMENDADO)

1. Acesse: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new

2. Copie **TODO** o conteúdo do arquivo `RESET_ADMIN_E_LIMPAR.sql`

3. Cole no SQL Editor

4. Clique em **"RUN"**

5. Verifique os resultados na parte inferior:
   - ✅ Admin configurado
   - ✅ Total de usuários: 1
   - ✅ Dados restantes: 0

---

## ✅ RESULTADO ESPERADO

### Usuários
- **Total:** 1 usuário
- **Email:** sandrodireto@gmail.com
- **Role:** admin
- **Ativo:** 1 (aprovado)

### Dados
- **Projetos:** 0
- **Pesquisas:** 0
- **Mercados:** 0
- **Leads:** 0
- **Todos os outros dados:** 0

---

## 🔍 VERIFICAÇÃO

Após executar o script, você pode verificar se tudo está correto:

```sql
-- Verificar admin
SELECT email, nome, role, ativo, liberado_em 
FROM users 
WHERE email = 'sandrodireto@gmail.com';

-- Verificar total de usuários
SELECT COUNT(*) as total FROM users;

-- Verificar dados
SELECT 
  (SELECT COUNT(*) FROM projects) as projects,
  (SELECT COUNT(*) FROM pesquisas) as pesquisas,
  (SELECT COUNT(*) FROM mercados_unicos) as mercados,
  (SELECT COUNT(*) FROM leads) as leads;
```

---

## ⚠️ ATENÇÃO

**Este script é DESTRUTIVO!**

- ❌ Apaga TODOS os usuários exceto sandrodireto@gmail.com
- ❌ Apaga TODOS os dados de teste
- ❌ Não há como reverter após executar

**Use apenas em ambiente de desenvolvimento/teste!**

---

## 🎯 APÓS EXECUTAR

1. ✅ Faça login com `sandrodireto@gmail.com`
2. ✅ Você terá acesso total como admin
3. ✅ Pode começar a usar o sistema do zero
4. ✅ Novos cadastros precisarão de sua aprovação

---

## 📝 LOGS

O script mostra 3 verificações no final:

1. **Admin configurado** - Dados do admin
2. **Total de usuários** - Deve ser 1
3. **Dados restantes** - Deve ser 0 em todas as tabelas

---

## 🆘 PROBLEMAS?

### Erro: "relation does not exist"
- Alguma tabela não existe no banco
- Comente a linha com `--` e execute novamente

### Erro: "foreign key constraint"
- Ordem das deleções está incorreta
- Execute linha por linha para identificar

### Admin não aparece
- Usuário não foi criado ainda
- Faça cadastro manual primeiro

---

**Desenvolvido por:** Manus AI  
**Data:** 27 de Novembro de 2025
