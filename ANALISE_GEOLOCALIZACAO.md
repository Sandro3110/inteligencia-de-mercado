# Análise: Preparação para Mapa Interativo com Geolocalização

**Data:** 21/11/2025  
**Objetivo:** Verificar estado atual do banco de dados e funções de enriquecimento para implementar mapa interativo

---

## 📊 1. Estado Atual do Banco de Dados

### **Tabelas Analisadas**

| Tabela           | Total Registros | Com Cidade | Com UF | Com Ambos (Cidade + UF) |
| ---------------- | --------------- | ---------- | ------ | ----------------------- |
| **clientes**     | 3               | 3          | 3      | 3 (100%)                |
| **concorrentes** | 0               | 0          | 0      | 0                       |
| **leads**        | 0               | 0          | 0      | 0                       |

### **Campos Existentes no Schema**

✅ **Clientes** (`drizzle/schema.ts` linha 131-159):

```typescript
cidade: varchar({ length: 100 }),
uf: varchar({ length: 2 }),
```

✅ **Concorrentes** (`drizzle/schema.ts` linha 204-205):

```typescript
cidade: varchar({ length: 100 }),
uf: varchar({ length: 2 }),
```

✅ **Leads** (`drizzle/schema.ts` linha 408-409):

```typescript
cidade: varchar({ length: 100 }),
uf: varchar({ length: 2 }),
```

### **Conclusão Banco:**

✅ **Todos os campos necessários já existem!**  
✅ **Os 3 clientes de teste já têm cidade e UF preenchidos**

---

## 🔍 2. Análise das Funções de Enriquecimento

### **Fluxo Atual de Enriquecimento**

**Arquivo:** `server/enrichmentFlow.ts`

**Processo identificado:**

1. **Consulta ReceitaWS** (linha 458):
   - Busca dados completos do CNPJ
   - ReceitaWS retorna: `municipio`, `uf`, `logradouro`, `numero`, `bairro`, `cep`

2. **Extração de Dados** (linha 460-470):

   ```typescript
   dadosEnriquecidos = {
     nome: receitaData.fantasia || receitaData.nome,
     razaoSocial: receitaData.nome,
     cnpj: receitaData.cnpj,
     porte: extractPorte(receitaData),
     endereco: extractEndereco(receitaData), // ⚠️ PROBLEMA AQUI
     cnae: extractCNAE(receitaData),
     email: receitaData.email,
     telefone: receitaData.telefone,
     situacao: receitaData.situacao,
   };
   ```

3. **Salvamento no Banco** (linha 536-537):
   ```typescript
   cidade: dadosEnriquecidos?.cidade || null,  // ⚠️ cidade não existe em dadosEnriquecidos
   uf: dadosEnriquecidos?.uf || null,          // ⚠️ uf não existe em dadosEnriquecidos
   ```

---

## 🚨 3. PROBLEMA IDENTIFICADO

### **Gap Crítico:**

**O ReceitaWS retorna `municipio` e `uf`, mas o código não está extraindo esses campos para `dadosEnriquecidos`!**

**Arquivo:** `server/_core/receitaws.ts` (linha 145-157)

A função `extractEndereco()` concatena TUDO em uma string:

```typescript
export function extractEndereco(data: ReceitaWSResponse): string {
  const parts = [
    data.logradouro,
    data.numero,
    data.complemento,
    data.bairro,
    data.municipio, // ← Cidade está aqui
    data.uf, // ← UF está aqui
    data.cep,
  ].filter(Boolean);

  return parts.join(", "); // ← Vira string única "Rua X, 123, Bairro Y, São Paulo, SP, 01234-567"
}
```

**Resultado:**

- `dadosEnriquecidos.endereco` = "Rua X, 123, Bairro Y, São Paulo, SP, 01234-567" ✅
- `dadosEnriquecidos.cidade` = **UNDEFINED** ❌
- `dadosEnriquecidos.uf` = **UNDEFINED** ❌

**Por isso no banco:**

```typescript
cidade: dadosEnriquecidos?.cidade || null,  // Sempre NULL
uf: dadosEnriquecidos?.uf || null,          // Sempre NULL
```

---

## ✅ 4. SOLUÇÃO PROPOSTA

### **Opção 1: Adicionar campos separados em `dadosEnriquecidos`** (RECOMENDADO)

**Modificar `server/enrichmentFlow.ts` linha 460-470:**

```typescript
dadosEnriquecidos = {
  nome: receitaData.fantasia || receitaData.nome,
  razaoSocial: receitaData.nome,
  cnpj: receitaData.cnpj,
  porte: extractPorte(receitaData),
  endereco: extractEndereco(receitaData),
  cidade: receitaData.municipio, // ← ADICIONAR
  uf: receitaData.uf, // ← ADICIONAR
  cep: receitaData.cep, // ← ADICIONAR (bônus)
  cnae: extractCNAE(receitaData),
  email: receitaData.email,
  telefone: receitaData.telefone,
  situacao: receitaData.situacao,
};
```

**Vantagens:**

- ✅ Simples e direto
- ✅ Mantém compatibilidade com código existente
- ✅ Cidade e UF ficam separados para geocoding

---

### **Opção 2: Criar funções auxiliares no receitaws.ts**

**Adicionar em `server/_core/receitaws.ts`:**

```typescript
/**
 * Extrai cidade (município)
 */
export function extractCidade(data: ReceitaWSResponse): string | null {
  return data.municipio || null;
}

/**
 * Extrai UF
 */
export function extractUF(data: ReceitaWSResponse): string | null {
  return data.uf || null;
}

/**
 * Extrai CEP
 */
export function extractCEP(data: ReceitaWSResponse): string | null {
  return data.cep || null;
}
```

**Depois usar no enrichmentFlow.ts:**

```typescript
dadosEnriquecidos = {
  // ... outros campos
  endereco: extractEndereco(receitaData),
  cidade: extractCidade(receitaData),
  uf: extractUF(receitaData),
  cep: extractCEP(receitaData),
  // ...
};
```

**Vantagens:**

- ✅ Mais organizado
- ✅ Reutilizável em outros lugares
- ✅ Consistente com padrão `extractPorte()`, `extractCNAE()`

---

## 🗺️ 5. PRÓXIMOS PASSOS PARA O MAPA

### **Fase 1: Corrigir Enriquecimento (URGENTE)**

1. ✅ Implementar Opção 1 ou 2 acima
2. ✅ Testar com novo enriquecimento
3. ✅ Verificar se cidade/UF são salvos corretamente

### **Fase 2: Adicionar Campos de Geolocalização**

```sql
ALTER TABLE clientes ADD COLUMN latitude DECIMAL(10, 8);
ALTER TABLE clientes ADD COLUMN longitude DECIMAL(11, 8);
ALTER TABLE clientes ADD COLUMN geocoded_at TIMESTAMP;

ALTER TABLE concorrentes ADD COLUMN latitude DECIMAL(10, 8);
ALTER TABLE concorrentes ADD COLUMN longitude DECIMAL(11, 8);
ALTER TABLE concorrentes ADD COLUMN geocoded_at TIMESTAMP;

ALTER TABLE leads ADD COLUMN latitude DECIMAL(10, 8);
ALTER TABLE leads ADD COLUMN longitude DECIMAL(11, 8);
ALTER TABLE leads ADD COLUMN geocoded_at TIMESTAMP;
```

### **Fase 3: Implementar Geocoding**

- Criar função para converter "cidade, UF" → lat/lng
- Usar API gratuita: Nominatim (OpenStreetMap)
- Exemplo: "São Paulo, SP" → `-23.5505, -46.6333`

### **Fase 4: Criar Página do Mapa**

- Leaflet.js para renderizar mapa
- Carregar marcadores dinamicamente
- Filtros por tipo, estado, qualidade

---

## 📋 6. CHECKLIST DE AÇÕES

### **Imediato (Hoje):**

- [ ] Corrigir `enrichmentFlow.ts` para extrair cidade/UF
- [ ] Adicionar campos `latitude`, `longitude`, `geocoded_at` no schema
- [ ] Rodar `pnpm db:push` para aplicar mudanças

### **Curto Prazo (Esta Semana):**

- [ ] Criar função de geocoding
- [ ] Geocodificar registros existentes (3 clientes)
- [ ] Testar geocoding com novos enriquecimentos

### **Médio Prazo (Próxima Semana):**

- [ ] Criar página `/inteligencia-geografica`
- [ ] Implementar mapa básico com Leaflet
- [ ] Adicionar filtros dinâmicos
- [ ] Implementar clustering de marcadores

---

## 🎯 7. RECOMENDAÇÃO FINAL

**Começar pela Opção 1 (mais simples):**

1. Editar `server/enrichmentFlow.ts` linha 460
2. Adicionar 3 linhas:
   ```typescript
   cidade: receitaData.municipio,
   uf: receitaData.uf,
   cep: receitaData.cep,
   ```
3. Testar com novo enriquecimento
4. Verificar se dados aparecem no banco

**Depois disso, adicionar campos de lat/lng e partir para o geocoding!**

---

## 📌 Observações Importantes

1. **ReceitaWS já fornece cidade e UF** - não precisamos de API adicional para isso
2. **Para geocoding (lat/lng)**, precisaremos de API externa:
   - Nominatim (gratuito, 1 req/seg)
   - Google Geocoding (pago, mais preciso)
   - HERE Geocoding (freemium)

3. **Dados existentes:** Os 3 clientes já têm cidade/UF, mas provavelmente foram inseridos manualmente. Novos enriquecimentos não estão pegando esses dados automaticamente.

4. **Concorrentes e Leads:** Atualmente vêm de busca do Google/LLM, não têm CNPJ, então **não passam pelo ReceitaWS**. Precisaremos de estratégia diferente para geocodificar esses (usar apenas cidade/UF do texto).

---

**Status:** ⚠️ **Ação necessária antes de implementar mapa**  
**Prioridade:** 🔴 **ALTA** - Sem cidade/UF, o mapa não funciona  
**Tempo estimado:** 30 minutos para correção + 2 horas para adicionar geocoding
