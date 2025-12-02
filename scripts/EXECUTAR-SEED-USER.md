# 🔧 EXECUTAR SEED: Usuário Sistema

## ⚠️ **IMPORTANTE: EXECUTE ESTE SCRIPT PRIMEIRO!**

Este script cria o usuário "Sistema" (ID=1) necessário para resolver a foreign key constraint em `dim_projeto.created_by`.

---

## 📋 **PASSO A PASSO:**

### **1. Acesse o Supabase SQL Editor**
https://supabase.com/dashboard/project/ecnzlynmuerbmqingyfl/editor

### **2. Copie e cole o conteúdo de `seed-user-sistema.sql`**

```sql
INSERT INTO users (
  id,
  email,
  name,
  role,
  created_at,
  updated_at
) VALUES (
  1,
  'sistema@intelmarket.app',
  'Sistema',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', 1, true);

SELECT id, email, name, role FROM users WHERE id = 1;
```

### **3. Clique em RUN**

### **4. Verifique o resultado**
Deve retornar:
```
id | email                     | name    | role
1  | sistema@intelmarket.app   | Sistema | admin
```

---

## ✅ **APÓS EXECUTAR:**

O formulário de criar projeto vai funcionar corretamente!

**Teste:**
1. Acesse: https://www.intelmarket.app/projetos/novo
2. Preencha o formulário
3. Clique em "Criar Projeto"
4. Deve redirecionar para a lista de projetos

---

## 🔍 **VERIFICAR SE JÁ EXISTE:**

```sql
SELECT id, email, name, role FROM users WHERE id = 1;
```

Se retornar vazio, execute o seed.
Se retornar o usuário, está pronto!
