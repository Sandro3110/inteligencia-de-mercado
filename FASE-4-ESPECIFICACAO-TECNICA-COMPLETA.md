# 📋 FASE 4 - ESPECIFICAÇÃO TÉCNICA COMPLETA

**Data:** 01/12/2025  
**Status:** PRONTO PARA IMPLEMENTAÇÃO  
**Tempo Estimado:** 25-35h

---

## ✅ DECISÕES CONFIRMADAS

| # | Decisão | Valor |
|---|---------|-------|
| 1 | Tamanho máximo | 250k linhas (~50 MB) |
| 2 | Duplicatas (CNPJ) | Pular linha |
| 3 | Jobs | Híbrido (sync até 10k) |
| 4 | Campos obrigatórios | nome + projeto_id |
| 5 | Projeto/Pesquisa | Seleção na UI (não no CSV) |
| 6 | Mapeamento | Auto-detecção + manual |
| 7 | Geografia não encontrada | Busca fuzzy (>80%) |
| 8 | Preview | Inteligente com estatísticas |
| 9 | Enriquecimento | Opcional (checkbox) |

---

## 🗄️ PARTE 1: SCHEMA E MIGRATIONS

### **1.1. Nova Tabela: dim_importacao**

```sql
CREATE TABLE dim_importacao (
  id SERIAL PRIMARY KEY,
  
  -- Contexto (obrigatório)
  projeto_id INTEGER NOT NULL REFERENCES dim_projeto(id) ON DELETE CASCADE,
  pesquisa_id INTEGER NOT NULL REFERENCES dim_pesquisa(id) ON DELETE CASCADE,
  
  -- Arquivo
  nome_arquivo VARCHAR(255) NOT NULL,
  tipo_arquivo VARCHAR(10) NOT NULL CHECK (tipo_arquivo IN ('csv', 'xlsx')),
  tamanho_bytes BIGINT,
  caminho_s3 VARCHAR(500),                  -- Backup do arquivo no S3
  
  -- Estatísticas
  total_linhas INTEGER NOT NULL,
  linhas_processadas INTEGER DEFAULT 0,
  linhas_sucesso INTEGER DEFAULT 0,
  linhas_erro INTEGER DEFAULT 0,
  linhas_duplicadas INTEGER DEFAULT 0,
  linhas_geografia_fuzzy INTEGER DEFAULT 0,
  
  -- Controle
  status VARCHAR(20) NOT NULL DEFAULT 'pendente' 
    CHECK (status IN ('pendente', 'processando', 'concluido', 'falhou', 'cancelado')),
  erro_mensagem TEXT,
  progresso_percentual INTEGER DEFAULT 0 CHECK (progresso_percentual >= 0 AND progresso_percentual <= 100),
  
  -- Configurações
  mapeamento_colunas JSONB,                -- {"Razão Social": "nome", "CNPJ": "cnpj", ...}
  opcoes JSONB,                            -- {"ignorar_duplicatas": true, "fuzzy_match": true, ...}
  
  -- Execução
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_seconds INTEGER,
  
  -- Auditoria
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL REFERENCES users(id),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by VARCHAR(255) REFERENCES users(id)
);

-- Índices
CREATE INDEX idx_importacao_projeto ON dim_importacao(projeto_id);
CREATE INDEX idx_importacao_pesquisa ON dim_importacao(pesquisa_id);
CREATE INDEX idx_importacao_status ON dim_importacao(status);
CREATE INDEX idx_importacao_created_at ON dim_importacao(created_at DESC);
CREATE INDEX idx_importacao_created_by ON dim_importacao(created_by);
```

---

### **1.2. Nova Tabela: importacao_erros**

```sql
CREATE TABLE importacao_erros (
  id SERIAL PRIMARY KEY,
  importacao_id INTEGER NOT NULL REFERENCES dim_importacao(id) ON DELETE CASCADE,
  
  -- Linha
  linha_numero INTEGER NOT NULL,
  linha_dados JSONB NOT NULL,              -- Dados originais da linha
  
  -- Erro
  campo_erro VARCHAR(100),                 -- Campo que causou erro (ex: "cnpj")
  tipo_erro VARCHAR(50) NOT NULL           -- 'validacao' | 'duplicata' | 'fk' | 'geografia' | 'outro'
    CHECK (tipo_erro IN ('validacao', 'duplicata', 'fk', 'geografia', 'outro')),
  mensagem_erro TEXT NOT NULL,
  
  -- Sugestão (para fuzzy match)
  sugestao_correcao JSONB,                 -- {"campo": "cidade", "original": "Sao Paulo", "sugerido": "São Paulo", "similaridade": 95}
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_importacao_erros_importacao ON importacao_erros(importacao_id);
CREATE INDEX idx_importacao_erros_tipo ON importacao_erros(tipo_erro);
```

---

### **1.3. Ajuste em dim_entidade**

**Campo a adicionar:**
```sql
ALTER TABLE dim_entidade 
ADD COLUMN importacao_id INTEGER REFERENCES dim_importacao(id) ON DELETE SET NULL;

CREATE INDEX idx_entidade_importacao ON dim_entidade(importacao_id);
```

**Justificativa:** Rastrear de qual importação veio cada entidade.

---

### **1.4. Migration Completa**

**Arquivo:** `drizzle/migrations/0002_add_importacao_tables.sql`

```sql
-- ============================================================================
-- MIGRATION: Adicionar tabelas de importação
-- Data: 2025-12-01
-- Descrição: Tabelas para controle de importação de entidades via CSV/Excel
-- ============================================================================

-- 1. Criar dim_importacao
CREATE TABLE dim_importacao (
  id SERIAL PRIMARY KEY,
  projeto_id INTEGER NOT NULL REFERENCES dim_projeto(id) ON DELETE CASCADE,
  pesquisa_id INTEGER NOT NULL REFERENCES dim_pesquisa(id) ON DELETE CASCADE,
  nome_arquivo VARCHAR(255) NOT NULL,
  tipo_arquivo VARCHAR(10) NOT NULL CHECK (tipo_arquivo IN ('csv', 'xlsx')),
  tamanho_bytes BIGINT,
  caminho_s3 VARCHAR(500),
  total_linhas INTEGER NOT NULL,
  linhas_processadas INTEGER DEFAULT 0,
  linhas_sucesso INTEGER DEFAULT 0,
  linhas_erro INTEGER DEFAULT 0,
  linhas_duplicadas INTEGER DEFAULT 0,
  linhas_geografia_fuzzy INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente' 
    CHECK (status IN ('pendente', 'processando', 'concluido', 'falhou', 'cancelado')),
  erro_mensagem TEXT,
  progresso_percentual INTEGER DEFAULT 0 CHECK (progresso_percentual >= 0 AND progresso_percentual <= 100),
  mapeamento_colunas JSONB,
  opcoes JSONB,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_seconds INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL REFERENCES users(id),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by VARCHAR(255) REFERENCES users(id)
);

-- 2. Criar importacao_erros
CREATE TABLE importacao_erros (
  id SERIAL PRIMARY KEY,
  importacao_id INTEGER NOT NULL REFERENCES dim_importacao(id) ON DELETE CASCADE,
  linha_numero INTEGER NOT NULL,
  linha_dados JSONB NOT NULL,
  campo_erro VARCHAR(100),
  tipo_erro VARCHAR(50) NOT NULL 
    CHECK (tipo_erro IN ('validacao', 'duplicata', 'fk', 'geografia', 'outro')),
  mensagem_erro TEXT NOT NULL,
  sugestao_correcao JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. Adicionar importacao_id em dim_entidade
ALTER TABLE dim_entidade 
ADD COLUMN importacao_id INTEGER REFERENCES dim_importacao(id) ON DELETE SET NULL;

-- 4. Criar índices
CREATE INDEX idx_importacao_projeto ON dim_importacao(projeto_id);
CREATE INDEX idx_importacao_pesquisa ON dim_importacao(pesquisa_id);
CREATE INDEX idx_importacao_status ON dim_importacao(status);
CREATE INDEX idx_importacao_created_at ON dim_importacao(created_at DESC);
CREATE INDEX idx_importacao_created_by ON dim_importacao(created_by);

CREATE INDEX idx_importacao_erros_importacao ON importacao_erros(importacao_id);
CREATE INDEX idx_importacao_erros_tipo ON importacao_erros(tipo_erro);

CREATE INDEX idx_entidade_importacao ON dim_entidade(importacao_id);

-- 5. Comentários
COMMENT ON TABLE dim_importacao IS 'Controle de processos de importação de entidades via CSV/Excel';
COMMENT ON TABLE importacao_erros IS 'Erros ocorridos durante importação, linha por linha';
COMMENT ON COLUMN dim_entidade.importacao_id IS 'ID da importação que criou esta entidade (se aplicável)';
```

---

## 📦 PARTE 2: DAL

### **2.1. DAL de Importação**

**Arquivo:** `server/dal/importacao.ts`

**Funções principais:**

```typescript
// CRUD
- createImportacao(input: CreateImportacaoInput): Promise<Importacao>
- getImportacaoById(id: number): Promise<Importacao | null>
- listImportacoes(filters: ImportacaoFilters): Promise<ResultadoPaginado<Importacao>>
- updateImportacao(id: number, input: UpdateImportacaoInput): Promise<Importacao>
- deleteImportacao(id: number): Promise<void>

// Controle de status
- startImportacao(id: number, userId: string): Promise<Importacao>
- completeImportacao(id: number, stats: Stats): Promise<Importacao>
- failImportacao(id: number, error: string): Promise<Importacao>
- cancelImportacao(id: number): Promise<Importacao>

// Estatísticas
- getImportacoesPorProjeto(projetoId: number): Promise<Importacao[]>
- getImportacoesPorPesquisa(pesquisaId: number): Promise<Importacao[]>
- getEstatisticasGerais(): Promise<Stats>

// Erros
- addErro(importacaoId: number, erro: ErroInput): Promise<void>
- getErros(importacaoId: number): Promise<ImportacaoErro[]>
- getErrosPorTipo(importacaoId: number, tipo: TipoErro): Promise<ImportacaoErro[]>
```

---

### **2.2. Ajustes no DAL de Entidades**

**Arquivo:** `server/dal/dimensoes/entidade.ts`

**Funções a adicionar:**

```typescript
// Importação em batch
- createEntidadesBatch(entidades: CreateEntidadeInput[]): Promise<Entidade[]>
- validateEntidadeBatch(entidade: any): Promise<ValidationResult>

// Busca por importação
- getEntidadesPorImportacao(importacaoId: number): Promise<Entidade[]>

// Estatísticas de importação
- countEntidadesPorImportacao(importacaoId: number): Promise<number>
```

---

### **2.3. DAL de Geografia (ajustes)**

**Arquivo:** `server/dal/dimensoes/geografia.ts`

**Funções a adicionar:**

```typescript
// Busca fuzzy aprimorada
- findCidadeFuzzy(cidade: string, uf: string, threshold: number = 80): Promise<Geografia | null>
- suggestCidades(cidade: string, uf: string, limit: number = 5): Promise<Geografia[]>
```

---

## 🔌 PARTE 3: ROUTERS TRPC

### **3.1. Router de Entidades**

**Arquivo:** `server/routers/entidades.ts`

**Endpoints:**

```typescript
export const entidadesRouter = router({
  // CRUD
  list: publicProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      busca: z.string().optional(),
      tipoEntidade: z.enum(['cliente', 'lead', 'concorrente']).optional(),
      projetoId: z.number().optional(),
      pesquisaId: z.number().optional(),
      importacaoId: z.number().optional(),
      orderBy: z.enum(['nome', 'created_at']).default('created_at'),
      orderDirection: z.enum(['asc', 'desc']).default('desc'),
    }))
    .query(async ({ input }) => {
      return await listEntidades(input);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getEntidadeById(input.id);
    }),

  create: publicProcedure
    .input(z.object({
      nome: z.string().min(3).max(255),
      tipoEntidade: z.enum(['cliente', 'lead', 'concorrente']),
      cnpj: z.string().optional(),
      // ... outros campos
    }))
    .mutation(async ({ input, ctx }) => {
      return await createEntidade({ ...input, createdBy: ctx.userId });
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      // ... campos para atualizar
    }))
    .mutation(async ({ input, ctx }) => {
      return await updateEntidade(input.id, { ...input, updatedBy: ctx.userId });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return await deleteEntidade(input.id, ctx.userId);
    }),

  // Busca específica
  buscaPorCnpj: publicProcedure
    .input(z.object({ cnpj: z.string() }))
    .query(async ({ input }) => {
      return await getEntidadeByCnpj(input.cnpj);
    }),

  // Deduplicação
  sugerirMerge: publicProcedure
    .input(z.object({
      nome: z.string(),
      cidade: z.string().optional(),
      uf: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return await sugerirMerge(input.nome, input.cidade, input.uf);
    }),
});
```

---

### **3.2. Router de Importação**

**Arquivo:** `server/routers/importacao.ts`

**Endpoints:**

```typescript
export const importacaoRouter = router({
  // Upload e preview
  upload: publicProcedure
    .input(z.object({
      projetoId: z.number(),
      pesquisaId: z.number(),
      arquivo: z.string(), // base64 ou URL
      nomeArquivo: z.string(),
      tipoArquivo: z.enum(['csv', 'xlsx']),
    }))
    .mutation(async ({ input, ctx }) => {
      // 1. Salvar arquivo temporário
      // 2. Parse do arquivo
      // 3. Retornar preview (primeiras 100 linhas)
      return await uploadArquivo(input, ctx.userId);
    }),

  preview: publicProcedure
    .input(z.object({
      importacaoId: z.number(),
      limit: z.number().default(100),
    }))
    .query(async ({ input }) => {
      return await getPreview(input.importacaoId, input.limit);
    }),

  // Mapeamento
  autoDetectColunas: publicProcedure
    .input(z.object({
      importacaoId: z.number(),
    }))
    .query(async ({ input }) => {
      return await autoDetectColunas(input.importacaoId);
    }),

  salvarMapeamento: publicProcedure
    .input(z.object({
      importacaoId: z.number(),
      mapeamento: z.record(z.string()), // {"Razão Social": "nome", ...}
    }))
    .mutation(async ({ input }) => {
      return await salvarMapeamento(input.importacaoId, input.mapeamento);
    }),

  // Validação
  validar: publicProcedure
    .input(z.object({
      importacaoId: z.number(),
    }))
    .mutation(async ({ input }) => {
      return await validarImportacao(input.importacaoId);
    }),

  // Execução
  executar: publicProcedure
    .input(z.object({
      importacaoId: z.number(),
      opcoes: z.object({
        ignorarDuplicatas: z.boolean().default(true),
        fuzzyMatch: z.boolean().default(true),
        enriquecerAposImportar: z.boolean().default(false),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      return await executarImportacao(input.importacaoId, input.opcoes, ctx.userId);
    }),

  // Monitoramento
  status: publicProcedure
    .input(z.object({ importacaoId: z.number() }))
    .query(async ({ input }) => {
      return await getImportacaoById(input.importacaoId);
    }),

  listar: publicProcedure
    .input(z.object({
      projetoId: z.number().optional(),
      pesquisaId: z.number().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      return await listImportacoes(input);
    }),

  erros: publicProcedure
    .input(z.object({
      importacaoId: z.number(),
      tipoErro: z.enum(['validacao', 'duplicata', 'fk', 'geografia', 'outro']).optional(),
    }))
    .query(async ({ input }) => {
      if (input.tipoErro) {
        return await getErrosPorTipo(input.importacaoId, input.tipoErro);
      }
      return await getErros(input.importacaoId);
    }),
});
```

---

## 🎨 PARTE 4: UI

### **4.1. Páginas**

**4.1.1. ImportacaoPage** (`client/src/pages/ImportacaoPage.tsx`)

**Fluxo:**
1. Selecionar Projeto (dropdown)
2. Selecionar Pesquisa (dropdown filtrado por projeto)
3. Upload de arquivo (drag-and-drop ou botão)
4. Preview automático
5. Mapeamento de colunas
6. Validação
7. Executar importação
8. Monitoramento (progress bar)
9. Relatório final

**Componentes:**
- `<FileUpload />` - Drag-and-drop
- `<PreviewTable />` - Tabela com primeiras 100 linhas
- `<ColumnMapper />` - Mapeamento drag-and-drop
- `<ValidationSummary />` - Estatísticas de validação
- `<ProgressBar />` - Progresso da importação
- `<ErrorReport />` - Relatório de erros

---

**4.1.2. ImportacoesListPage** (`client/src/pages/ImportacoesListPage.tsx`)

**Funcionalidades:**
- Listar todas as importações
- Filtrar por projeto/pesquisa/status
- Ver detalhes de cada importação
- Download de relatório de erros
- Retry de importações falhadas

---

**4.1.3. EntidadesPage** (atualizar existente)

**Adicionar:**
- Filtro por importação
- Coluna "Origem" (importação/IA/manual)
- Link para importação de origem
- Score de qualidade visual

---

### **4.2. Componentes Reutilizáveis**

**4.2.1. FileUpload**
```tsx
<FileUpload
  accept=".csv,.xlsx"
  maxSize={50 * 1024 * 1024} // 50 MB
  onUpload={(file) => handleUpload(file)}
/>
```

**4.2.2. ColumnMapper**
```tsx
<ColumnMapper
  csvColumns={['Razão Social', 'CNPJ', 'Cidade', 'UF']}
  dbFields={['nome', 'cnpj', 'cidade', 'uf']}
  autoDetected={autoMapping}
  onChange={(mapping) => setMapping(mapping)}
/>
```

**4.2.3. ValidationSummary**
```tsx
<ValidationSummary
  total={1234}
  validas={1150}
  erros={84}
  duplicatas={15}
  geografiaFuzzy={23}
/>
```

---

## 🔧 PARTE 5: PARSERS

### **5.1. CSV Parser**

**Biblioteca:** Papa Parse

```typescript
import Papa from 'papaparse';

export async function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (results) => {
        resolve({
          headers: results.meta.fields || [],
          rows: results.data,
          errors: results.errors,
        });
      },
      error: (error) => reject(error),
    });
  });
}
```

---

### **5.2. Excel Parser**

**Biblioteca:** xlsx

```typescript
import * as XLSX from 'xlsx';

export async function parseExcel(file: File): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  const headers = data[0] as string[];
  const rows = data.slice(1).map(row => {
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
  
  return { headers, rows, errors: [] };
}
```

---

## 🤖 PARTE 6: AUTO-DETECÇÃO DE COLUNAS

```typescript
export function autoDetectColumn(
  header: string,
  sampleValues: string[]
): string | null {
  const normalized = header.toLowerCase().trim();
  
  // CNPJ
  if (
    normalized.includes('cnpj') ||
    sampleValues.some(v => /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(v))
  ) {
    return 'cnpj';
  }
  
  // Nome
  if (
    normalized.includes('razao') ||
    normalized.includes('nome') ||
    normalized.includes('empresa')
  ) {
    return 'nome';
  }
  
  // Email
  if (normalized.includes('email') || sampleValues.some(v => /@/.test(v))) {
    return 'email';
  }
  
  // Telefone
  if (
    normalized.includes('telefone') ||
    normalized.includes('fone') ||
    normalized.includes('celular')
  ) {
    return 'telefone';
  }
  
  // Site
  if (
    normalized.includes('site') ||
    normalized.includes('website') ||
    sampleValues.some(v => /^https?:\/\//.test(v))
  ) {
    return 'site';
  }
  
  // Cidade
  if (normalized.includes('cidade') || normalized.includes('municipio')) {
    return 'cidade';
  }
  
  // UF
  if (
    normalized.includes('uf') ||
    normalized.includes('estado') ||
    sampleValues.every(v => v?.length === 2)
  ) {
    return 'uf';
  }
  
  return null;
}
```

---

## 📊 PARTE 7: VALIDAÇÃO

```typescript
export async function validateLinha(
  linha: any,
  mapeamento: Record<string, string>,
  importacaoId: number
): Promise<ValidationResult> {
  const erros: ErroValidacao[] = [];
  
  // 1. Validar campos obrigatórios
  if (!linha[mapeamento.nome]) {
    erros.push({
      campo: 'nome',
      tipo: 'validacao',
      mensagem: 'Nome é obrigatório',
    });
  }
  
  // 2. Validar CNPJ (se fornecido)
  if (linha[mapeamento.cnpj]) {
    const cnpj = normalizeCnpj(linha[mapeamento.cnpj]);
    if (!validateCnpj(cnpj)) {
      erros.push({
        campo: 'cnpj',
        tipo: 'validacao',
        mensagem: 'CNPJ inválido',
      });
    } else {
      // Verificar duplicata
      const existe = await getEntidadeByCnpj(cnpj);
      if (existe) {
        erros.push({
          campo: 'cnpj',
          tipo: 'duplicata',
          mensagem: `CNPJ já existe (ID: ${existe.id})`,
        });
      }
    }
  }
  
  // 3. Validar email (se fornecido)
  if (linha[mapeamento.email] && !validateEmail(linha[mapeamento.email])) {
    erros.push({
      campo: 'email',
      tipo: 'validacao',
      mensagem: 'Email inválido',
    });
  }
  
  // 4. Validar geografia (fuzzy match)
  if (linha[mapeamento.cidade] && linha[mapeamento.uf]) {
    const geografia = await findCidadeFuzzy(
      linha[mapeamento.cidade],
      linha[mapeamento.uf],
      80
    );
    
    if (!geografia) {
      erros.push({
        campo: 'cidade',
        tipo: 'geografia',
        mensagem: 'Cidade não encontrada',
      });
    } else if (geografia.cidade !== linha[mapeamento.cidade]) {
      // Fuzzy match encontrado
      erros.push({
        campo: 'cidade',
        tipo: 'geografia',
        mensagem: `Sugestão: "${geografia.cidade}" (similaridade: ${geografia.similaridade}%)`,
        sugestao: {
          campo: 'cidade',
          original: linha[mapeamento.cidade],
          sugerido: geografia.cidade,
          similaridade: geografia.similaridade,
        },
      });
    }
  }
  
  return {
    valida: erros.length === 0,
    erros,
  };
}
```

---

## 🚀 PARTE 8: EXECUÇÃO DA IMPORTAÇÃO

```typescript
export async function executarImportacao(
  importacaoId: number,
  opcoes: OpcoesImportacao,
  userId: string
): Promise<ResultadoImportacao> {
  // 1. Iniciar importação
  await startImportacao(importacaoId, userId);
  
  // 2. Buscar dados da importação
  const importacao = await getImportacaoById(importacaoId);
  const arquivo = await readFile(importacao.caminhoS3);
  const { rows } = await parseFile(arquivo, importacao.tipoArquivo);
  
  // 3. Processar linha por linha
  let sucesso = 0;
  let erro = 0;
  let duplicadas = 0;
  let geografiaFuzzy = 0;
  
  for (let i = 0; i < rows.length; i++) {
    const linha = rows[i];
    
    try {
      // Validar
      const validacao = await validateLinha(linha, importacao.mapeamentoColunas, importacaoId);
      
      if (!validacao.valida) {
        // Registrar erros
        for (const err of validacao.erros) {
          if (err.tipo === 'duplicata' && opcoes.ignorarDuplicatas) {
            duplicadas++;
            continue;
          }
          
          await addErro(importacaoId, {
            linhaNumero: i + 2, // +2 porque linha 1 é header
            linhaDados: linha,
            campoErro: err.campo,
            tipoErro: err.tipo,
            mensagemErro: err.mensagem,
            sugestaoCorrecao: err.sugestao,
          });
        }
        erro++;
        continue;
      }
      
      // Criar entidade
      const entidade = await createEntidade({
        nome: linha[importacao.mapeamentoColunas.nome],
        cnpj: linha[importacao.mapeamentoColunas.cnpj],
        // ... outros campos
        origemTipo: 'importacao',
        origemArquivo: importacao.nomeArquivo,
        origemProcesso: `IMP-${importacaoId}`,
        origemData: new Date(),
        origemUsuarioId: userId,
        importacaoId: importacaoId,
        createdBy: userId,
      });
      
      sucesso++;
      
      // Atualizar progresso
      if (i % 100 === 0) {
        await updateImportacao(importacaoId, {
          linhasProcessadas: i,
          progressoPercentual: Math.floor((i / rows.length) * 100),
        });
      }
    } catch (err) {
      erro++;
      await addErro(importacaoId, {
        linhaNumero: i + 2,
        linhaDados: linha,
        tipoErro: 'outro',
        mensagemErro: err.message,
      });
    }
  }
  
  // 4. Finalizar importação
  await completeImportacao(importacaoId, {
    linhasProcessadas: rows.length,
    linhasSucesso: sucesso,
    linhasErro: erro,
    linhasDuplicadas: duplicadas,
    linhasGeografiaFuzzy: geografiaFuzzy,
  });
  
  // 5. Enriquecimento (se solicitado)
  if (opcoes.enriquecerAposImportar) {
    // Criar job de enriquecimento (FASE 5)
    await criarJobEnriquecimento(importacaoId);
  }
  
  return {
    sucesso,
    erro,
    duplicadas,
    geografiaFuzzy,
  };
}
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### **Backend**

- [ ] Criar migration `0002_add_importacao_tables.sql`
- [ ] Executar migration no banco
- [ ] Atualizar `drizzle/schema.ts` com novas tabelas
- [ ] Criar `server/dal/importacao.ts` (15 funções)
- [ ] Atualizar `server/dal/dimensoes/entidade.ts` (3 funções)
- [ ] Atualizar `server/dal/dimensoes/geografia.ts` (2 funções)
- [ ] Criar `server/routers/entidades.ts` (7 endpoints)
- [ ] Criar `server/routers/importacao.ts` (10 endpoints)
- [ ] Criar `server/parsers/csv.ts`
- [ ] Criar `server/parsers/excel.ts`
- [ ] Criar `server/validators/importacao.ts`
- [ ] Criar `server/utils/autoDetect.ts`
- [ ] Atualizar `server/routers/index.ts` (adicionar routers)

### **Frontend**

- [ ] Criar `client/src/pages/ImportacaoPage.tsx`
- [ ] Criar `client/src/pages/ImportacoesListPage.tsx`
- [ ] Atualizar `client/src/pages/EntidadesPage.tsx`
- [ ] Criar `client/src/components/FileUpload.tsx`
- [ ] Criar `client/src/components/PreviewTable.tsx`
- [ ] Criar `client/src/components/ColumnMapper.tsx`
- [ ] Criar `client/src/components/ValidationSummary.tsx`
- [ ] Criar `client/src/components/ProgressBar.tsx`
- [ ] Criar `client/src/components/ErrorReport.tsx`
- [ ] Atualizar `client/src/App.tsx` (adicionar rotas)

### **Dependências**

- [ ] Instalar `papaparse` e `@types/papaparse`
- [ ] Instalar `xlsx`

---

## ⏱️ CRONOGRAMA DETALHADO

### **Semana 1 (8-12h)**
- Dia 1-2: Migrations + Schema + DAL (6h)
- Dia 3-4: Routers TRPC (6h)

### **Semana 2 (8-12h)**
- Dia 1-2: Parsers + Validators (4h)
- Dia 3-4: UI de Upload + Preview (8h)

### **Semana 3 (6-8h)**
- Dia 1-2: Mapeamento + Auto-detecção (4h)
- Dia 3-4: Validação + Execução (4h)

### **Semana 4 (3-5h)**
- Dia 1: UI de Entidades (3h)
- Dia 2: Testes e ajustes (2h)

**Total:** 25-37h

---

## ✅ PRONTO PARA IMPLEMENTAÇÃO!

**Todas as decisões confirmadas:**
- ✅ Schema completo
- ✅ Migrations prontas
- ✅ Índices definidos
- ✅ DAL especificado
- ✅ Routers TRPC especificados
- ✅ UI especificada
- ✅ Parsers especificados
- ✅ Validações especificadas
- ✅ Cronograma definido

**Aguardo aprovação para começar implementação!** 🚀
