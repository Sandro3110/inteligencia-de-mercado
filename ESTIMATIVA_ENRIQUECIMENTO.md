# Estimativa de Enriquecimento - 5 Concorrentes e 5 Leads por Cliente

## 📊 Tamanho Final do Banco de Dados

| Entidade                | Registros   | Observação                                       |
| ----------------------- | ----------- | ------------------------------------------------ |
| **Clientes**            | 801         | Base existente (enriquecida)                     |
| **Mercados únicos**     | ~1.401      | Deduplicação de ~2.002 identificações            |
| **Clientes × Mercados** | ~2.002      | Associações (tabela junction)                    |
| **Produtos**            | ~6.006      | Chave única: cliente × produto × mercado         |
| **Concorrentes únicos** | ~1.602      | Deduplicação de 4.005 identificações (60% reuso) |
| **Leads únicos**        | ~2.403      | Deduplicação de 4.005 identificações (40% reuso) |
| **TOTAL**               | **~12.213** | **Registros no banco de dados**                  |

---

## 🔄 Detalhamento por Etapa

### Etapa 1: Enriquecimento de Clientes

- **Input**: 801 clientes com nome, CNPJ, produto principal
- **Output**: 801 clientes com todos os campos preenchidos
- **Campos adicionados**: site, email, telefone, LinkedIn, Instagram, cidade, UF, CNAE, porte
- **Tempo**: ~2,7 horas (12s por cliente)

### Etapa 2: Identificação de Mercados

- **Input**: 801 clientes enriquecidos
- **Output**: ~2.002 identificações de mercados (1-5 por cliente, média 2,5)
- **Deduplicação**: ~1.401 mercados únicos (30% de sobreposição)
- **Associações**: ~2.002 registros em `clientes_mercados`
- **Tempo**: ~2,2 horas (10s por cliente)

### Etapa 3: Criação de Produtos

- **Input**: ~2.002 associações cliente-mercado
- **Output**: ~6.006 produtos (2-5 por associação, média 3)
- **Chave única**: `clienteId + mercadoId + nome`
- **Tempo**: ~3,3 horas (6s por associação)

### Etapa 4: Busca de Concorrentes

- **Input**: 801 clientes
- **Output**: 4.005 identificações (5 por cliente)
- **Deduplicação**: ~1.602 concorrentes únicos (60% de reuso)
  - Empresas grandes aparecem múltiplas vezes
  - Ex: Braskem, Amcor, Bemis aparecem para vários clientes
- **Validação**: Concorrente NÃO pode estar em `clientes`
- **Tempo**: ~1,8 horas (8s por cliente)

### Etapa 5: Busca de Leads

- **Input**: 801 clientes
- **Output**: 4.005 identificações (5 por cliente)
- **Deduplicação**: ~2.403 leads únicos (40% de reuso)
  - Mais diversidade que concorrentes
  - Leads variam mais por região e segmento
- **Validação**: Lead NÃO pode estar em `clientes` ou `concorrentes`
- **Tempo**: ~1,8 horas (8s por cliente)

---

## ⏱️ Tempo Total de Processamento

| Etapa                   | Tempo      | Requisições   |
| ----------------------- | ---------- | ------------- |
| 1. Enriquecer clientes  | 2,7h       | 801 × 12s     |
| 2. Identificar mercados | 2,2h       | 801 × 10s     |
| 3. Criar produtos       | 3,3h       | 2.002 × 6s    |
| 4. Buscar concorrentes  | 1,8h       | 801 × 8s      |
| 5. Buscar leads         | 1,8h       | 801 × 8s      |
| **TOTAL**               | **~11,8h** | **~0,5 dias** |

**Observação**: Tempo contínuo sem pausas. Com checkpoints e pausas, pode levar 1-2 dias.

---

## 💰 Custo Estimado (Gemini API)

| Tipo      | Tokens          | Custo          |
| --------- | --------------- | -------------- |
| Input     | 2,8M tokens     | $0,42          |
| Output    | 3,8M tokens     | $0,58          |
| **TOTAL** | **6,6M tokens** | **~$1,00 USD** |

**Preço base**: $0,15 por 1M tokens (Gemini 1.5 Flash)

---

## 📈 Crescimento do Banco de Dados

### Estado Atual

- 801 clientes
- 0 mercados
- 0 produtos
- 0 concorrentes
- 0 leads
- **Total**: 801 registros

### Estado Final (após enriquecimento)

- 801 clientes (enriquecidos)
- 1.401 mercados únicos
- 6.006 produtos
- 1.602 concorrentes únicos
- 2.403 leads únicos
- **Total**: 12.213 registros

**Crescimento**: **15,2x** (de 801 para 12.213 registros)

---

## 🎯 Regras de Unicidade

### Mercados

- **Hash**: `nome-projectId` (normalizado, lowercase)
- **Verificação**: Antes de inserir, verificar se hash já existe
- **Reuso**: Se mercado existe, reusar ID existente
- **Taxa de deduplicação**: ~30% (2.002 → 1.401)

### Produtos

- **Chave única**: `clienteId + mercadoId + nome` (normalizado)
- **Verificação**: Antes de inserir, verificar se chave já existe
- **Reuso**: Não há reuso (cada produto é único por cliente)
- **Taxa de deduplicação**: 0% (todos são únicos)

### Concorrentes

- **Hash**: `nome-cnpj` (normalizado)
- **Verificação**:
  1. Verificar se hash já existe em `concorrentes`
  2. Verificar se nome/CNPJ existe em `clientes` (CRÍTICO)
- **Reuso**: Se concorrente existe, reusar ID existente
- **Taxa de deduplicação**: ~60% (4.005 → 1.602)

### Leads

- **Hash**: `nome-cnpj` (normalizado)
- **Verificação**:
  1. Verificar se hash já existe em `leads`
  2. Verificar se nome/CNPJ existe em `clientes` (CRÍTICO)
  3. Verificar se nome/CNPJ existe em `concorrentes` (CRÍTICO)
- **Reuso**: Se lead existe, reusar ID existente
- **Taxa de deduplicação**: ~40% (4.005 → 2.403)

---

## ✅ Validações Cruzadas

### Concorrente NÃO pode ser Cliente

```sql
SELECT COUNT(*) FROM clientes
WHERE LOWER(TRIM(nome)) = LOWER(TRIM(?))
   OR (cnpj IS NOT NULL AND cnpj = ?);
-- Se COUNT > 0, DESCARTAR concorrente
```

### Lead NÃO pode ser Cliente ou Concorrente

```sql
SELECT COUNT(*) FROM (
  SELECT nome, cnpj FROM clientes
  UNION ALL
  SELECT nome, cnpj FROM concorrentes
) AS combined
WHERE LOWER(TRIM(nome)) = LOWER(TRIM(?))
   OR (cnpj IS NOT NULL AND cnpj = ?);
-- Se COUNT > 0, DESCARTAR lead
```

---

## 🚀 Próximos Passos

1. **Aprovar estimativas** ✅
2. **Implementar sistema de enriquecimento modular**
3. **Criar sistema de controle e checkpoint**
4. **Testar com amostra (10-20 clientes)**
5. **Executar enriquecimento completo (801 clientes)**
6. **Validar resultados e qualidade**
7. **Criar relatório final**

---

**Estimativas aprovadas? Podemos começar a implementação! 🚀**
