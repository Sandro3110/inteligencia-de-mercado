# Análise do Schema do Banco

## Tabelas Relevantes para o Mapa

### 1. CLIENTES

**Campos de Geolocalização:**

- `latitude` → numeric (nullable)
- `longitude` → numeric (nullable)
- `geocodedAt` → timestamp (nullable)

**Campos de Identificação:**

- `id` → integer (PK)
- `nome` → varchar (NOT NULL)
- `cnpj` → varchar (nullable)
- `clienteHash` → varchar (nullable)

**Campos de Localização:**

- `cidade` → varchar (nullable)
- `uf` → varchar (nullable)
- `regiao` → varchar (nullable)

**Campos de Relacionamento:**

- `projectId` → integer (NOT NULL)
- `pesquisaId` → integer (nullable)

**Campos de Qualidade:**

- `qualidadeScore` → integer (nullable)
- `qualidadeClassificacao` → varchar (nullable)

---

### 2. LEADS

**Campos de Geolocalização:**

- `latitude` → numeric (nullable)
- `longitude` → numeric (nullable)
- `geocodedAt` → timestamp (nullable)

**Campos de Identificação:**

- `id` → integer (PK)
- `nome` → varchar (NOT NULL)
- `cnpj` → varchar (nullable)
- `leadHash` → varchar (nullable)

**Campos de Localização:**

- `cidade` → varchar (nullable)
- `uf` → varchar (nullable)
- `regiao` → varchar (nullable)

**Campos de Relacionamento:**

- `projectId` → integer (NOT NULL)
- `pesquisaId` → integer (nullable)
- `mercadoId` → integer (NOT NULL)

**Campos de Qualidade:**

- `qualidadeScore` → integer (nullable)
- `qualidadeClassificacao` → varchar (nullable)
- `leadStage` → varchar (nullable)

---

### 3. CONCORRENTES

**Campos de Geolocalização:**

- `latitude` → numeric (nullable)
- `longitude` → numeric (nullable)
- `geocodedAt` → timestamp (nullable)

**Campos de Identificação:**

- `id` → integer (PK)
- `nome` → varchar (NOT NULL)
- `cnpj` → varchar (nullable)
- `concorrenteHash` → varchar (nullable)

**Campos de Localização:**

- `cidade` → varchar (nullable)
- `uf` → varchar (nullable)

**Campos de Relacionamento:**

- `projectId` → integer (NOT NULL)
- `pesquisaId` → integer (nullable)
- `mercadoId` → integer (NOT NULL)

**Campos de Qualidade:**

- `qualidadeScore` → integer (nullable)
- `qualidadeClassificacao` → varchar (nullable)

---

### 4. PESQUISAS

**Campos de Identificação:**

- `id` → integer (PK)
- `nome` → varchar (NOT NULL)
- `projectId` → integer (NOT NULL)

**Campos de Status:**

- `status` → varchar (nullable)
- `ativo` → integer (NOT NULL)

**Campos de Contagem:**

- `totalClientes` → integer (nullable)
- `clientesEnriquecidos` → integer (nullable)

---

### 5. PROJECTS

**Campos de Identificação:**

- `id` → integer (PK)
- `nome` → varchar (NOT NULL)

**Campos de Status:**

- `status` → varchar (NOT NULL)
- `ativo` → integer (NOT NULL)

---

## Estrutura de Dados para o Mapa

### Formato de Entidade no Mapa:

```typescript
interface MapEntity {
  id: number;
  type: 'cliente' | 'lead' | 'concorrente';
  nome: string;
  latitude: number; // Convertido de numeric (string) para number
  longitude: number; // Convertido de numeric (string) para number
  cidade: string | null;
  uf: string | null;
  qualidadeScore: number | null;
  qualidadeClassificacao: string | null;
  // Campos específicos por tipo
  cnpj?: string | null;
  porte?: string | null;
  setor?: string | null;
}
```

### Filtros Disponíveis:

```typescript
interface MapFilters {
  projectId?: number | null;
  pesquisaId?: number | null;
  entityTypes: ('cliente' | 'lead' | 'concorrente')[];
  estado?: string | null;
  cidade?: string | null;
  setor?: string | null;
  porte?: string | null;
  qualidade?: string | null;
}
```

---

## Observações Importantes

1. ✅ **Latitude/Longitude são `numeric` no Postgres**
   - Retornam como strings (ex: "-23.55050000")
   - DEVEM ser convertidos para `number` com `parseFloat()`
   - DEVEM ser validados com `isNaN()` antes de usar

2. ✅ **Relacionamentos:**
   - Clientes → pesquisaId (nullable)
   - Leads → pesquisaId (nullable) + mercadoId (NOT NULL)
   - Concorrentes → pesquisaId (nullable) + mercadoId (NOT NULL)

3. ✅ **Filtros:**
   - Por projeto: `projectId`
   - Por pesquisa: `pesquisaId`
   - Por localização: `cidade`, `uf`
   - Por qualidade: `qualidadeScore`, `qualidadeClassificacao`

4. ❌ **Campos que NÃO existem:**
   - `clientes.clienteId` (é só `id`)
   - `leads.clienteId` (tem `mercadoId` e `pesquisaId`)
   - `concorrentes.clienteId` (tem `mercadoId` e `pesquisaId`)
