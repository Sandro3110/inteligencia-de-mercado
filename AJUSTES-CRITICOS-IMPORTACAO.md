# 🔴 AJUSTES CRÍTICOS - ESPECIFICAÇÃO DE IMPORTAÇÃO

**Data:** 01/12/2025  
**Motivo:** Esclarecimento sobre campos obrigatórios e papel do enriquecimento

---

## ⚠️ MUDANÇA CRÍTICA IDENTIFICADA

### **ANTES (incorreto):**
```
Campos obrigatórios na importação:
- nome
- projeto_id
```

### **DEPOIS (correto):**
```
Campos obrigatórios na importação:
- nome
- projeto_id (selecionado na UI, não no CSV)
- status_qualificacao_id (ativo/inativo/prospect)
```

---

## 📋 NOVA DEFINIÇÃO: CAMPOS OBRIGATÓRIOS

### **1. Nome**
- **Tipo:** string
- **Obrigatório:** ✅ SIM
- **Origem:** CSV
- **Exemplo:** "Empresa XYZ Ltda"

### **2. Projeto ID**
- **Tipo:** integer (FK)
- **Obrigatório:** ✅ SIM
- **Origem:** UI (dropdown)
- **Nota:** NÃO vem do CSV, usuário seleciona antes do upload

### **3. Status Qualificação**
- **Tipo:** integer (FK para dim_status_qualificacao)
- **Obrigatório:** ✅ SIM
- **Origem:** CSV (coluna "Status" ou similar)
- **Valores aceitos:**
  - "Ativo" → status_qualificacao_id = 1
  - "Inativo" → status_qualificacao_id = 2
  - "Prospect" → status_qualificacao_id = 3
  - (ou outros códigos: quente, morno, frio, descartado, etc)

---

## 🔵 CAMPOS OPCIONAIS (PREENCHIDOS PELO ENRIQUECIMENTO)

**Todos os outros campos são OPCIONAIS na importação:**

### **Campos de Identificação:**
- cnpj (opcional)
- email (opcional)
- telefone (opcional)
- site (opcional)

### **Campos de Localização:**
- cidade (opcional)
- uf (opcional)
- geografia_id (opcional)

### **Campos de Negócio:**
- mercado_id (opcional)
- cnae (opcional)
- porte (opcional)
- faturamento_estimado (opcional)
- num_funcionarios (opcional)

### **Campos de Produtos/Competidores:**
- produtos (opcional)
- competidores (opcional)

**✅ IMPORTANTE:** O processo de **ENRIQUECIMENTO (FASE 5)** é que vai preencher esses campos usando IA!

---

## 🎯 FLUXO COMPLETO

### **FASE 4: IMPORTAÇÃO** (atual)
```
Entrada:
- CSV com colunas: Nome, Status
- Projeto selecionado na UI
- Pesquisa selecionada na UI

Saída:
- Entidades criadas com:
  ✅ nome
  ✅ projeto_id
  ✅ pesquisa_id (via fato_entidade_contexto)
  ✅ status_qualificacao_id
  ⚪ Todos os outros campos vazios/null
```

### **FASE 5: ENRIQUECIMENTO** (próxima)
```
Entrada:
- Entidades importadas (com campos vazios)

Processo:
- IA busca informações (CNPJ, endereço, mercado, etc)
- Preenche campos vazios
- Atualiza score de qualidade

Saída:
- Entidades enriquecidas com:
  ✅ nome
  ✅ projeto_id
  ✅ status_qualificacao_id
  ✅ cnpj (preenchido pela IA)
  ✅ email (preenchido pela IA)
  ✅ telefone (preenchido pela IA)
  ✅ cidade/uf (preenchido pela IA)
  ✅ mercado_id (preenchido pela IA)
  ✅ produtos (preenchido pela IA)
  ✅ etc...
```

---

## 🔧 AJUSTES NECESSÁRIOS NA ESPECIFICAÇÃO

### **1. Validação de Campos Obrigatórios**

**ANTES:**
```typescript
// Validar campos obrigatórios
if (!linha[mapeamento.nome]) {
  erros.push({ campo: 'nome', mensagem: 'Nome é obrigatório' });
}
```

**DEPOIS:**
```typescript
// Validar campos obrigatórios
if (!linha[mapeamento.nome]) {
  erros.push({ campo: 'nome', mensagem: 'Nome é obrigatório' });
}

if (!linha[mapeamento.status]) {
  erros.push({ campo: 'status', mensagem: 'Status é obrigatório' });
}

// Validar se status é válido
const statusValidos = ['ativo', 'inativo', 'prospect', 'quente', 'morno', 'frio', 'descartado'];
const statusNormalizado = linha[mapeamento.status]?.toLowerCase().trim();
if (!statusValidos.includes(statusNormalizado)) {
  erros.push({ 
    campo: 'status', 
    mensagem: `Status inválido. Valores aceitos: ${statusValidos.join(', ')}` 
  });
}
```

---

### **2. Mapeamento de Status**

**Criar helper para mapear status:**

```typescript
export function mapearStatusQualificacao(statusTexto: string): number {
  const mapa: Record<string, number> = {
    'ativo': 1,
    'inativo': 2,
    'prospect': 3,
    'quente': 4,
    'morno': 5,
    'frio': 6,
    'descartado': 7,
  };
  
  const normalizado = statusTexto.toLowerCase().trim();
  const statusId = mapa[normalizado];
  
  if (!statusId) {
    throw new Error(`Status "${statusTexto}" não reconhecido`);
  }
  
  return statusId;
}
```

---

### **3. Auto-detecção de Colunas**

**Adicionar detecção de "Status":**

```typescript
export function autoDetectColumn(
  header: string,
  sampleValues: string[]
): string | null {
  const normalized = header.toLowerCase().trim();
  
  // ... (código existente)
  
  // Status
  if (
    normalized.includes('status') ||
    normalized.includes('qualificacao') ||
    normalized.includes('situacao')
  ) {
    return 'status';
  }
  
  // ... (resto do código)
}
```

---

### **4. Criação de Entidade**

**ANTES:**
```typescript
const entidade = await createEntidade({
  nome: linha[mapeamento.nome],
  cnpj: linha[mapeamento.cnpj],
  email: linha[mapeamento.email],
  // ... todos os campos
});
```

**DEPOIS:**
```typescript
const entidade = await createEntidade({
  // Obrigatórios
  nome: linha[mapeamento.nome],
  tipoEntidade: 'lead', // Default (pode ser ajustado depois)
  
  // Opcionais (só incluir se fornecidos no CSV)
  cnpj: linha[mapeamento.cnpj] || null,
  email: linha[mapeamento.email] || null,
  telefone: linha[mapeamento.telefone] || null,
  site: linha[mapeamento.site] || null,
  
  // Origem
  origemTipo: 'importacao',
  origemArquivo: importacao.nomeArquivo,
  origemProcesso: `IMP-${importacaoId}`,
  origemData: new Date(),
  origemUsuarioId: userId,
  importacaoId: importacaoId,
  createdBy: userId,
});

// Criar contexto com status
await createEntidadeContexto({
  entidadeId: entidade.id,
  projetoId: importacao.projetoId,
  pesquisaId: importacao.pesquisaId,
  statusQualificacaoId: mapearStatusQualificacao(linha[mapeamento.status]),
  qualidadeScore: 20, // Score baixo (só tem nome + status)
  qualidadeClassificacao: 'baixa',
  createdBy: userId,
});
```

---

### **5. Preview Inteligente**

**Adicionar coluna "Status" no preview:**

```tsx
<PreviewTable>
  <thead>
    <tr>
      <th>Linha</th>
      <th>Nome</th>
      <th>Status</th>
      <th>CNPJ</th>
      <th>Cidade</th>
      <th>Validação</th>
    </tr>
  </thead>
  <tbody>
    {rows.map((row, i) => (
      <tr key={i}>
        <td>{i + 1}</td>
        <td>{row.nome}</td>
        <td>
          <Badge variant={getStatusVariant(row.status)}>
            {row.status}
          </Badge>
        </td>
        <td>{row.cnpj || '-'}</td>
        <td>{row.cidade || '-'}</td>
        <td>
          {row.valida ? (
            <CheckCircle className="text-green-500" />
          ) : (
            <XCircle className="text-red-500" />
          )}
        </td>
      </tr>
    ))}
  </tbody>
</PreviewTable>
```

---

### **6. Estatísticas de Qualidade**

**Após importação, mostrar:**

```
✅ 1.234 entidades importadas com sucesso!

📊 Qualidade dos Dados:
- Apenas nome + status: 1.150 (93%) ⚠️ BAIXA QUALIDADE
- Com CNPJ: 84 (7%)
- Com cidade/UF: 45 (4%)
- Com email: 23 (2%)

💡 Recomendação: Execute o enriquecimento para completar os dados!

[✓] Enriquecer agora com IA
```

---

## 📊 EXEMPLO DE CSV MÍNIMO

**CSV válido (apenas obrigatórios):**
```csv
Nome,Status
Empresa A,Ativo
Empresa B,Prospect
Empresa C,Inativo
```

**CSV completo (com opcionais):**
```csv
Nome,Status,CNPJ,Email,Telefone,Cidade,UF
Empresa A,Ativo,12.345.678/0001-90,contato@empresaa.com,(11) 1234-5678,São Paulo,SP
Empresa B,Prospect,,,,,
Empresa C,Inativo,98.765.432/0001-10,,,Rio de Janeiro,RJ
```

---

## 🎯 IMPACTO NO SCORE DE QUALIDADE

### **Após Importação (FASE 4):**
```typescript
function calcularQualidadeImportacao(entidade: any): number {
  let score = 0;
  
  // Nome (obrigatório)
  score += 20;
  
  // Status (obrigatório)
  score += 10;
  
  // Opcionais (se fornecidos no CSV)
  if (entidade.cnpj) score += 15;
  if (entidade.email) score += 10;
  if (entidade.telefone) score += 10;
  if (entidade.site) score += 5;
  if (entidade.geografiaId) score += 10;
  
  return score; // Máximo: 80 (se tudo fornecido no CSV)
}
```

**Resultado típico:** 20-40 pontos (BAIXA qualidade)

---

### **Após Enriquecimento (FASE 5):**
```typescript
function calcularQualidadeEnriquecimento(entidade: any, contexto: any): number {
  let score = 30; // Base (nome + status)
  
  // Identificação
  if (entidade.cnpj) score += 15;
  if (entidade.email) score += 10;
  if (entidade.telefone) score += 10;
  if (entidade.site) score += 5;
  
  // Localização
  if (contexto.geografiaId) score += 10;
  
  // Negócio
  if (contexto.mercadoId) score += 10;
  if (contexto.cnae) score += 5;
  if (contexto.porte) score += 5;
  
  // Produtos/Competidores
  const numProdutos = await countProdutos(contexto.id);
  const numCompetidores = await countCompetidores(contexto.id);
  if (numProdutos > 0) score += 10;
  if (numCompetidores > 0) score += 10;
  
  return Math.min(score, 100); // Máximo: 100
}
```

**Resultado típico:** 70-95 pontos (ALTA qualidade)

---

## ✅ RESUMO DOS AJUSTES

| Item | Antes | Depois |
|------|-------|--------|
| **Campos obrigatórios** | nome + projeto_id | nome + projeto_id + status |
| **Campos opcionais** | Todos os outros | Todos os outros |
| **Validação de status** | ❌ Não existia | ✅ Validar valores aceitos |
| **Mapeamento de status** | ❌ Não existia | ✅ Mapear texto → ID |
| **Auto-detecção** | 7 tipos | 8 tipos (+ status) |
| **Score de qualidade** | Não definido | 20-40 (importação) → 70-95 (enriquecimento) |
| **Preview** | Sem status | Com status destacado |

---

## 🚀 PRÓXIMO PASSO

**Atualizar especificação técnica completa com esses ajustes?**

**Ou você tem mais algum ponto a esclarecer?**
