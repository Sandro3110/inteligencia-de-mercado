# 📊 GUIA DE CARGA DE DADOS INICIAIS

Este guia explica como popular as tabelas dimensionais com dados essenciais.

---

## 🎯 SCRIPTS DISPONÍVEIS

### 1. **seed-dim-tempo.sql**
Popula a tabela `dim_tempo` com calendário completo de 2024 a 2026.

**Dados gerados:**
- 1.096 dias (3 anos)
- Informações de ano, mês, trimestre, semana
- Nomes de meses e dias da semana
- Marcação de feriados nacionais
- Marcação de fins de semana
- Marcação de dias úteis

### 2. **seed-dim-mercado.sql**
Popula a tabela `dim_mercado` com 50 segmentos de mercado B2B.

**Categorias:**
- Tecnologia (5 segmentos)
- Varejo (5 segmentos)
- Serviços (5 segmentos)
- Indústria (5 segmentos)
- Saúde (5 segmentos)
- Educação (5 segmentos)
- Financeiro (5 segmentos)
- Construção (5 segmentos)
- Agronegócio (5 segmentos)
- Logística (5 segmentos)

---

## 🚀 COMO EXECUTAR

### **OPÇÃO A: Supabase SQL Editor (RECOMENDADO)**

1. **Acesse o Supabase SQL Editor:**
   https://supabase.com/dashboard/project/ecnzlynmuerbmqingyfl/editor

2. **Execute os scripts na ordem:**

   **a) dim_tempo:**
   - Copie todo o conteúdo de `seed-dim-tempo.sql`
   - Cole no SQL Editor
   - Clique em **RUN** (ou Ctrl+Enter)
   - Aguarde ~10 segundos
   - Verifique: "1096 rows affected"

   **b) dim_mercado:**
   - Copie todo o conteúdo de `seed-dim-mercado.sql`
   - Cole no SQL Editor
   - Clique em **RUN**
   - Aguarde ~2 segundos
   - Verifique: "50 rows affected"

3. **Verificar resultados:**
   ```sql
   -- Contar registros
   SELECT COUNT(*) FROM dim_tempo;   -- Deve retornar 1096
   SELECT COUNT(*) FROM dim_mercado; -- Deve retornar 50
   ```

---

### **OPÇÃO B: Via psql (Linha de Comando)**

```bash
# Conectar ao Supabase
psql "postgresql://postgres:[SUA_SENHA]@db.ecnzlynmuerbmqingyfl.supabase.co:5432/postgres"

# Executar scripts
\i scripts/seed-dim-tempo.sql
\i scripts/seed-dim-mercado.sql

# Verificar
SELECT COUNT(*) FROM dim_tempo;
SELECT COUNT(*) FROM dim_mercado;
```

---

### **OPÇÃO C: Via Node.js (Automático)**

```bash
# Configurar DATABASE_URL no .env
echo "DATABASE_URL=postgresql://postgres:[SUA_SENHA]@db.ecnzlynmuerbmqingyfl.supabase.co:5432/postgres" >> .env

# Executar scripts
node scripts/seed-dim-tempo.mjs
# (Nota: seed-dim-mercado.mjs ainda não foi criado)
```

---

## ✅ VERIFICAÇÃO

Após executar os scripts, verifique se os dados foram carregados:

```sql
-- dim_tempo
SELECT 
  COUNT(*) as total_dias,
  COUNT(*) FILTER (WHERE eh_dia_util = true) as dias_uteis,
  COUNT(*) FILTER (WHERE eh_feriado = true) as feriados
FROM dim_tempo;

-- Resultado esperado:
-- total_dias: 1096
-- dias_uteis: ~780
-- feriados: 24

-- dim_mercado
SELECT 
  tipo,
  COUNT(*) as total
FROM dim_mercado
GROUP BY tipo
ORDER BY tipo;

-- Resultado esperado:
-- 10 tipos, 5 segmentos cada
```

---

## 📊 PRÓXIMOS PASSOS

Após carregar os dados iniciais:

1. **Recarregue o dashboard** em https://www.intelmarket.app
2. Os KPIs ainda mostrarão 0 (normal, pois não há projetos/pesquisas)
3. **Próxima etapa:** Implementar formulários para criar projetos e pesquisas

---

## 🔧 TROUBLESHOOTING

### **Erro: "relation dim_tempo does not exist"**
- Verifique se as migrations foram executadas
- Execute: `pnpm db:push` no projeto local

### **Erro: "duplicate key value violates unique constraint"**
- Os dados já foram carregados anteriormente
- Use `ON CONFLICT DO NOTHING` (já está nos scripts)

### **Erro de conexão**
- Verifique se a DATABASE_URL está correta
- Verifique se o IP está liberado no Supabase
- Use o SQL Editor do Supabase (mais fácil)

---

## 📝 NOTAS

- ✅ Scripts são **idempotentes** (podem ser executados múltiplas vezes)
- ✅ Usam `ON CONFLICT DO NOTHING` para evitar duplicatas
- ✅ Não sobrescrevem dados existentes
- ✅ Seguros para executar em produção

---

**Pronto! Seus dados dimensionais estão carregados!** 🎉
