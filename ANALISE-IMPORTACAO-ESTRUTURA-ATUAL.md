# 🔍 ANÁLISE: O QUE JÁ TEMOS PARA IMPORTAÇÃO

**Data:** 01/12/2025  
**Objetivo:** Avaliar estrutura atual do banco e DAL para identificar o que já está pronto para importação

---

## ✅ O QUE JÁ ESTÁ DEFINIDO E PRONTO

### **1. SCHEMA DO BANCO (dim_entidade)**

A tabela `dim_entidade` já está **100% preparada para importação**:

#### **Campos Principais**
```typescript
- id: serial (auto-increment)
- entidadeHash: varchar(64) UNIQUE NOT NULL  // MD5 para deduplicação
- tipoEntidade: varchar(20) NOT NULL         // cliente | lead | concorrente
- nome: varchar(255) NOT NULL
- nomeFantasia: varchar(255)
- cnpj: varchar(18) UNIQUE                   // Validação de duplicata
- email: varchar(255)
- telefone: varchar(20)
- site: varchar(255)
- numFiliais: integer DEFAULT 0
- numLojas: integer DEFAULT 0
- numFuncionarios: integer
```

#### **Campos de Rastreabilidade (ORIGEM)**
```typescript
- origemTipo: varchar(20) NOT NULL           // 'importacao' | 'ia_prompt' | 'api' | 'manual'
- origemArquivo: varchar(255)                // Nome do arquivo CSV/Excel
- origemProcesso: varchar(100)               // ID do processo de importação
- origemPrompt: text                         // Prompt usado (se IA)
- origemConfianca: integer                   // 0-100 (confiança da fonte)
- origemData: timestamp NOT NULL             // Data da importação
- origemUsuarioId: integer                   // Quem importou
```

#### **Campos de Auditoria**
```typescript
- createdAt: timestamp NOT NULL
- createdBy: varchar(255)                    // FK para users.id
- updatedAt: timestamp NOT NULL
- updatedBy: varchar(255)
- deletedAt: timestamp                       // Soft delete
- deletedBy: varchar(255)
```

**✅ CONCLUSÃO:** Schema 100% pronto para importação com rastreabilidade completa!

---

### **2. DAL DE ENTIDADES (server/dal/dimensoes/entidade.ts)**

O DAL já tem **funções essenciais** para importação:

#### **Funções Disponíveis**

**CRUD Básico:**
- ✅ `createEntidade(input)` - Criar entidade com validações
- ✅ `getEntidadeById(id)` - Buscar por ID
- ✅ `listEntidades(filters)` - Listar com filtros e paginação
- ✅ `updateEntidade(id, input)` - Atualizar
- ✅ `deleteEntidade(id)` - Soft delete

**Deduplicação:**
- ✅ `getEntidadeByCnpj(cnpj)` - Buscar por CNPJ
- ✅ `getEntidadeByHash(hash)` - Buscar por hash
- ✅ `findOrCreateEntidade(input)` - Upsert (buscar ou criar)
- ✅ `sugerirMerge(nome, cidade?, uf?)` - Detectar duplicatas por similaridade

**Validações:**
- ✅ Validação de CNPJ (formato + dígitos verificadores)
- ✅ Geração de hash único (MD5)
- ✅ Cálculo de similaridade (Levenshtein)
- ✅ Threshold de 60% para sugerir merge

**✅ CONCLUSÃO:** DAL tem 80% das funções necessárias!

---

### **3. HELPERS DISPONÍVEIS**

#### **Hash (server/dal/helpers/hash.ts)**
- ✅ `generateHash(input)` - MD5 de string
- ✅ `generateEntidadeHash(cnpj?, nome?, cidade?, uf?)` - Hash específico

#### **Validators (server/dal/helpers/validators.ts)**
- ✅ `validateCnpj(cnpj)` - Validação completa de CNPJ
- ✅ `validateEmail(email)` - Validação de email
- ✅ `validateTelefone(telefone)` - Validação de telefone
- ✅ `validateUrl(url)` - Validação de site
- ✅ `normalizeCnpj(cnpj)` - Normalização (remove pontos/traços)

#### **Deduplication (server/dal/helpers/deduplication.ts)**
- ✅ `calculateSimilarity(str1, str2)` - Levenshtein distance
- ✅ `calculateJaccardSimilarity(str1, str2)` - Jaccard index
- ✅ `normalizeString(str)` - Normalização para comparação

**✅ CONCLUSÃO:** Helpers completos e prontos!

---

### **4. TABELAS RELACIONADAS**

#### **dim_geografia (5.570 cidades)**
- ✅ Populada e pronta
- ✅ Permite busca por cidade+UF
- ✅ Busca fuzzy disponível no DAL

#### **dim_mercado**
- ✅ Estrutura pronta
- ✅ Hash único
- ✅ DAL com findOrCreate

#### **dim_produto**
- ✅ Estrutura pronta
- ✅ Hash único
- ✅ DAL com findOrCreate

#### **fato_entidade_contexto**
- ✅ Relaciona entidade + projeto + pesquisa
- ✅ Campos de qualidade (score, classificação)
- ✅ Unique constraint (entidade + projeto + pesquisa)

**✅ CONCLUSÃO:** Todas as tabelas relacionadas prontas!

---

## ❌ O QUE ESTÁ FALTANDO (GAPS)

### **GAP #1: Tabela de Controle de Importações**

**Problema:** Não temos tabela para rastrear processos de importação.

**Proposta:** Criar `dim_importacao`

```sql
CREATE TABLE dim_importacao (
  id SERIAL PRIMARY KEY,
  projeto_id INTEGER NOT NULL REFERENCES dim_projeto(id),
  pesquisa_id INTEGER NOT NULL REFERENCES dim_pesquisa(id),
  nome_arquivo VARCHAR(255) NOT NULL,
  tipo_arquivo VARCHAR(10) NOT NULL,        -- 'csv' | 'xlsx'
  tamanho_bytes BIGINT,
  total_linhas INTEGER NOT NULL,
  linhas_processadas INTEGER DEFAULT 0,
  linhas_sucesso INTEGER DEFAULT 0,
  linhas_erro INTEGER DEFAULT 0,
  linhas_duplicadas INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente',  -- 'pendente' | 'processando' | 'concluido' | 'falhou'
  erro_mensagem TEXT,
  mapeamento_colunas JSONB,                -- {csv_col: db_field}
  opcoes JSONB,                            -- {ignorar_duplicatas: true, ...}
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_seconds INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by VARCHAR(255)
);
```

**Benefícios:**
- Rastreabilidade completa
- Histórico de importações
- Estatísticas (sucesso/erro/duplicatas)
- Permite retry de importações falhadas

---

### **GAP #2: Tabela de Erros de Importação**

**Problema:** Não temos onde armazenar erros linha por linha.

**Proposta:** Criar `importacao_erros`

```sql
CREATE TABLE importacao_erros (
  id SERIAL PRIMARY KEY,
  importacao_id INTEGER NOT NULL REFERENCES dim_importacao(id) ON DELETE CASCADE,
  linha_numero INTEGER NOT NULL,
  linha_dados JSONB NOT NULL,              -- Dados da linha original
  campo_erro VARCHAR(100),                 -- Campo que causou erro
  tipo_erro VARCHAR(50) NOT NULL,          -- 'validacao' | 'duplicata' | 'fk' | 'outro'
  mensagem_erro TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_importacao_erros_importacao ON importacao_erros(importacao_id);
```

**Benefícios:**
- Debug facilitado
- Relatório de erros detalhado
- Permite correção e re-importação

---

### **GAP #3: Router TRPC de Entidades**

**Problema:** Não temos endpoints TRPC para entidades.

**Faltando:**
- `entidades.list` - Listar com filtros
- `entidades.getById` - Buscar por ID
- `entidades.create` - Criar manual
- `entidades.update` - Atualizar
- `entidades.delete` - Deletar
- `entidades.buscaPorCnpj` - Buscar por CNPJ
- `entidades.sugerirMerge` - Detectar duplicatas

---

### **GAP #4: Router TRPC de Importação**

**Problema:** Não temos endpoints para importação.

**Faltando:**
- `importacao.upload` - Upload de arquivo
- `importacao.preview` - Preview dos dados
- `importacao.validar` - Validar dados
- `importacao.mapearColunas` - Mapear colunas
- `importacao.executar` - Executar importação
- `importacao.status` - Status da importação
- `importacao.listar` - Listar importações
- `importacao.erros` - Listar erros

---

### **GAP #5: Parsers de CSV/Excel**

**Problema:** Não temos código para ler CSV/Excel.

**Faltando:**
- Parser de CSV (Papa Parse)
- Parser de Excel (xlsx)
- Detecção de encoding
- Detecção de delimitador
- Validação de formato

---

### **GAP #6: UI de Importação**

**Problema:** Não temos interface para importação.

**Faltando:**
- Página de upload
- Preview de dados
- Mapeamento de colunas (drag-and-drop)
- Progress bar
- Relatório de erros
- Listagem de importações

---

### **GAP #7: UI de Entidades**

**Problema:** Não temos interface para gestão de entidades.

**Faltando:**
- Página de listagem
- Filtros avançados
- Página de detalhes
- Formulário de edição
- Gestão de produtos
- Gestão de competidores

---

## 💡 SUGESTÕES E MELHORIAS

### **SUGESTÃO #1: Importação em Background (Jobs)**

**Problema:** Importações grandes podem travar o navegador.

**Solução:** Usar sistema de filas (BullMQ)

**Fluxo:**
1. Upload do arquivo → salva em disco
2. Cria job na fila
3. Worker processa em background
4. Frontend monitora via WebSocket/polling

**Benefícios:**
- Não trava navegador
- Permite importações grandes (100k+ linhas)
- Retry automático em caso de erro
- Múltiplas importações simultâneas

---

### **SUGESTÃO #2: Templates de Mapeamento**

**Problema:** Usuário precisa mapear colunas toda vez.

**Solução:** Salvar templates de mapeamento

**Exemplo:**
```json
{
  "nome": "Template Padrão",
  "mapeamento": {
    "Razão Social": "nome",
    "Nome Fantasia": "nomeFantasia",
    "CNPJ": "cnpj",
    "E-mail": "email",
    "Telefone": "telefone",
    "Site": "site",
    "Cidade": "cidade",
    "UF": "uf"
  }
}
```

**Benefícios:**
- Agiliza importações recorrentes
- Reduz erros de mapeamento
- Compartilhável entre usuários

---

### **SUGESTÃO #3: Auto-detecção de Colunas**

**Problema:** Usuário precisa mapear manualmente.

**Solução:** IA para detectar colunas automaticamente

**Lógica:**
```typescript
function autoDetectColumn(header: string, sample: string[]): string | null {
  const normalized = header.toLowerCase().trim();
  
  // CNPJ
  if (normalized.includes('cnpj') || sample.some(v => /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(v))) {
    return 'cnpj';
  }
  
  // Email
  if (normalized.includes('email') || sample.some(v => /@/.test(v))) {
    return 'email';
  }
  
  // Telefone
  if (normalized.includes('telefone') || normalized.includes('fone')) {
    return 'telefone';
  }
  
  // ... etc
}
```

**Benefícios:**
- Experiência mais fluida
- Menos cliques
- Menos erros

---

### **SUGESTÃO #4: Validação Progressiva**

**Problema:** Usuário só descobre erros após importar.

**Solução:** Validar durante preview

**Fluxo:**
1. Upload → Parse → Preview
2. **Validar cada linha** (CNPJ, email, etc)
3. Mostrar erros **antes** de importar
4. Permitir correção inline
5. Importar apenas linhas válidas

**Benefícios:**
- Menos frustrações
- Menos re-trabalho
- Maior taxa de sucesso

---

### **SUGESTÃO #5: Estratégias de Duplicatas**

**Problema:** Como lidar com duplicatas?

**Soluções:**

**A) Ignorar duplicatas** (padrão)
- Pula linha se CNPJ já existe

**B) Atualizar duplicatas**
- Atualiza campos vazios
- Preserva campos preenchidos

**C) Sobrescrever duplicatas**
- Substitui todos os campos

**D) Criar nova versão**
- Mantém histórico
- Marca versão anterior como obsoleta

**Recomendação:** Permitir escolha via UI

---

### **SUGESTÃO #6: Enriquecimento Automático Pós-Importação**

**Problema:** Dados importados geralmente estão incompletos.

**Solução:** Oferecer enriquecimento automático

**Fluxo:**
1. Importação concluída
2. Mostrar: "X entidades importadas. Deseja enriquecer com IA?"
3. Se sim → cria job de enriquecimento
4. Busca dados faltantes (mercado, produtos, etc)

**Benefícios:**
- Dados mais completos
- Menos trabalho manual
- Integração natural com FASE 5

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### **Backend**

- [ ] Criar tabela `dim_importacao`
- [ ] Criar tabela `importacao_erros`
- [ ] Criar DAL de importação
- [ ] Criar router TRPC de entidades (7 endpoints)
- [ ] Criar router TRPC de importação (8 endpoints)
- [ ] Implementar parser de CSV (Papa Parse)
- [ ] Implementar parser de Excel (xlsx)
- [ ] Implementar upload de arquivos (multipart)
- [ ] Implementar validação de dados
- [ ] Implementar detecção de duplicatas
- [ ] Implementar auto-detecção de colunas
- [ ] Implementar sistema de jobs (opcional)

### **Frontend**

- [ ] Criar página de upload
- [ ] Criar componente de preview
- [ ] Criar componente de mapeamento de colunas
- [ ] Criar progress bar
- [ ] Criar página de relatório de erros
- [ ] Criar página de listagem de importações
- [ ] Criar página de listagem de entidades
- [ ] Criar página de detalhes de entidade
- [ ] Criar formulário de edição de entidade
- [ ] Criar filtros avançados

---

## 🎯 RECOMENDAÇÕES FINAIS

### **Ordem de Implementação Sugerida**

**Semana 1:**
1. Criar tabelas (dim_importacao, importacao_erros)
2. Criar DAL de importação
3. Criar router TRPC de entidades
4. Criar router TRPC de importação (básico)

**Semana 2:**
5. Implementar parsers (CSV + Excel)
6. Implementar upload de arquivos
7. Implementar validação de dados
8. Criar UI de upload + preview

**Semana 3:**
9. Implementar mapeamento de colunas
10. Implementar auto-detecção
11. Criar UI de mapeamento
12. Criar progress bar

**Semana 4:**
13. Implementar detecção de duplicatas
14. Criar UI de entidades (listagem + detalhes)
15. Criar relatório de erros
16. Testes e ajustes

---

## ❓ DÚVIDAS E DECISÕES NECESSÁRIAS

### **DÚVIDA #1: Tamanho Máximo de Arquivo**

**Pergunta:** Qual o tamanho máximo de arquivo permitido?

**Opções:**
- A) 10 MB (seguro, ~50k linhas)
- B) 50 MB (médio, ~250k linhas)
- C) 100 MB (grande, ~500k linhas)
- D) Ilimitado (com jobs em background)

**Minha recomendação:** **B) 50 MB** (com opção de jobs para arquivos maiores)

---

### **DÚVIDA #2: Estratégia de Duplicatas Padrão**

**Pergunta:** O que fazer com duplicatas por padrão?

**Opções:**
- A) Ignorar (pular linha)
- B) Atualizar (merge de campos)
- C) Sobrescrever (substituir tudo)
- D) Perguntar ao usuário

**Minha recomendação:** **A) Ignorar** (mais seguro) + opção de escolha na UI

---

### **DÚVIDA #3: Usar Jobs em Background?**

**Pergunta:** Implementar sistema de filas desde o início?

**Opções:**
- A) Sim (BullMQ + Redis)
- B) Não (processamento síncrono)
- C) Híbrido (síncrono até 10k linhas, async depois)

**Minha recomendação:** **C) Híbrido** (implementar async depois se necessário)

---

### **DÚVIDA #4: Campos Obrigatórios na Importação**

**Pergunta:** Quais campos são obrigatórios no CSV?

**Minha sugestão:**
- ✅ **Obrigatórios:** nome, tipoEntidade
- ⚠️ **Altamente recomendados:** cnpj, cidade, uf
- 🔵 **Opcionais:** todos os outros

**Razão:** Permite importação flexível mas garante dados mínimos

---

### **DÚVIDA #5: Enriquecimento Automático Pós-Importação?**

**Pergunta:** Oferecer enriquecimento automático após importação?

**Opções:**
- A) Sim, sempre perguntar
- B) Sim, mas opcional
- C) Não, deixar para FASE 5

**Minha recomendação:** **B) Sim, mas opcional** (checkbox na UI)

---

## 📊 RESUMO EXECUTIVO

### **O QUE TEMOS:**
- ✅ Schema 100% pronto
- ✅ DAL 80% pronto
- ✅ Helpers 100% prontos
- ✅ Validações prontas
- ✅ Deduplicação pronta

### **O QUE FALTA:**
- ❌ 2 tabelas (dim_importacao, importacao_erros)
- ❌ 2 routers TRPC (entidades, importação)
- ❌ Parsers (CSV, Excel)
- ❌ Upload de arquivos
- ❌ UI completa

### **TEMPO ESTIMADO:**
- **Otimista:** 15-20h
- **Realista:** 25-35h
- **Pessimista:** 40-50h

### **PRIORIDADE:**
🔴 **ALTA** - Importação é pré-requisito para enriquecimento e visualização

---

**Aguardo suas respostas para as 5 dúvidas!** 🚀
