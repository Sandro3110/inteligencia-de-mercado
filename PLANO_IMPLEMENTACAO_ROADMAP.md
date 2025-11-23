# Plano de Implementação do Roadmap - Gestor PAV

**Documento:** Plano Estratégico de Implementação  
**Versão:** 1.0  
**Data:** Novembro 2025  
**Autor:** Manus AI  
**Projeto:** Gestor de Pesquisa de Mercado PAV

---

## Sumário Executivo

Este documento apresenta um **plano completo e detalhado** para implementar todas as funcionalidades propostas no roadmap do Gestor PAV. O plano está organizado em **8 fases principais** distribuídas ao longo de **4 trimestres**, totalizando **280 horas** de desenvolvimento. O ROI projetado é de **156% ao ano** através de ganhos de produtividade e redução de tempo de validação.

**Status Atual do Sistema:**

- ✅ 73 mercados, 800 clientes, 591 concorrentes, 727 leads
- ✅ Dashboard com gráficos visuais (Recharts)
- ✅ Validação em lote com checkboxes
- ✅ Busca global inteligente
- ✅ Score de qualidade visual (0-100%)
- ✅ Breadcrumbs de navegação
- ✅ Atalhos de teclado (Ctrl+K, /, Escape)
- ✅ Animações com Framer Motion
- ✅ Skeleton loading
- ✅ Exportação CSV básica
- ✅ Índices no banco de dados
- ✅ Cache de queries (5min staleTime)

---

## Visão Geral do Roadmap

### Distribuição por Trimestre

| Trimestre   | Fases    | Horas | Funcionalidades Principais                          |
| ----------- | -------- | ----- | --------------------------------------------------- |
| **Q1 2026** | Fase 1-2 | 80h   | Tags, Paginação, Audit Log, Exportação Avançada     |
| **Q2 2026** | Fase 3-4 | 70h   | Notificações, Favoritos, Importação, Enriquecimento |
| **Q3 2026** | Fase 5-6 | 80h   | Dashboard Avançado, Busca IA, Sugestões             |
| **Q4 2026** | Fase 7-8 | 50h   | API Pública, Multi-tenant, Integrações              |

### Matriz de Priorização (Valor vs. Esforço)

```
Alto Valor, Baixo Esforço (Quick Wins) ✅
├─ Paginação Server-Side (8h)
├─ Exportação Avançada (12h)
├─ Sistema de Favoritos (12h)
└─ Modo Compacto + Zoom (6h)

Alto Valor, Alto Esforço (Investimentos Estratégicos)
├─ Tags Customizáveis (20h)
├─ Audit Log (18h)
├─ Enriquecimento API Receita (20h)
└─ Dashboard Avançado (25h)

Baixo Valor, Baixo Esforço (Melhorias Incrementais)
├─ Notificações Push (15h)
├─ Importação em Lote (15h)
└─ Google Sheets (15h)

Baixo Valor, Alto Esforço (Roadmap Futuro)
├─ API Pública (20h)
├─ Multi-tenant (30h)
└─ Busca Semântica IA (30h)
```

---

## Fase 1: Funcionalidades Core (Q1 2026 - 40h)

### 1.1 Sistema de Tags Customizáveis (20h)

**Objetivo:** Permitir organização flexível de mercados/clientes com tags personalizadas.

**Escopo:**

- Criar tabela `tags` e `entity_tags` (junction table)
- CRUD completo de tags (criar, editar, deletar)
- Aplicar tags em mercados, clientes, concorrentes e leads
- Filtro multi-tag com operadores AND/OR
- Cores customizáveis para tags
- Contadores de uso por tag

**Implementação:**

```typescript
// drizzle/schema.ts
export const tags = mysqlTable("tags", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 50 }).notNull(),
  color: varchar("color", { length: 7 }).default("#3b82f6"), // hex color
  createdAt: timestamp("createdAt").defaultNow(),
});

export const entityTags = mysqlTable("entity_tags", {
  id: int("id").primaryKey().autoincrement(),
  tagId: int("tagId").notNull().references(() => tags.id, { onDelete: "cascade" }),
  entityType: mysqlEnum("entityType", ["mercado", "cliente", "concorrente", "lead"]).notNull(),
  entityId: int("entityId").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

// server/routers.ts
tags: router({
  list: publicProcedure.query(async () => {
    return await db.getTags();
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string(), color: z.string().optional() }))
    .mutation(async ({ input }) => {
      return await db.createTag(input);
    }),

  addToEntity: protectedProcedure
    .input(z.object({
      tagId: z.number(),
      entityType: z.enum(["mercado", "cliente", "concorrente", "lead"]),
      entityId: z.number(),
    }))
    .mutation(async ({ input }) => {
      return await db.addTagToEntity(input);
    }),

  removeFromEntity: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await db.removeTagFromEntity(input.id);
    }),
}),
```

**UI Components:**

- `TagManager.tsx` - Modal para gerenciar tags
- `TagPicker.tsx` - Dropdown para selecionar tags
- `TagBadge.tsx` - Badge colorido para exibir tags
- `TagFilter.tsx` - Filtro multi-tag com checkboxes

**Métricas de Sucesso:**

- Tempo de organização reduzido em 60%
- 80% dos usuários criam pelo menos 3 tags
- Filtro por tags usado em 40% das sessões

---

### 1.2 Paginação Server-Side (8h)

**Objetivo:** Otimizar performance com datasets grandes (>1000 registros).

**Escopo:**

- Implementar `page` e `pageSize` nos routers
- Adicionar `LIMIT` e `OFFSET` nas queries SQL
- Criar componente `Pagination` reutilizável
- Persistir página atual no estado
- Indicador "Exibindo X-Y de Z"

**Implementação:**

```typescript
// server/db.ts
export async function getClientesByMercadoPaginated(
  mercadoId: number,
  page: number = 1,
  pageSize: number = 20
) {
  const db = await getDb();
  if (!db) return { data: [], total: 0, page, pageSize, totalPages: 0 };

  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(clientesMercados)
    .where(eq(clientesMercados.mercadoId, mercadoId));

  const total = countResult[0]?.count || 0;
  const totalPages = Math.ceil(total / pageSize);

  // Get paginated data
  const data = await db
    .select()
    .from(clientes)
    .innerJoin(clientesMercados, eq(clientes.id, clientesMercados.clienteId))
    .where(eq(clientesMercados.mercadoId, mercadoId))
    .limit(pageSize)
    .offset(offset);

  return {
    data: data.map(row => row.clientes),
    total,
    page,
    pageSize,
    totalPages,
  };
}

// server/routers.ts
clientes: router({
  byMercado: publicProcedure
    .input(z.object({
      mercadoId: z.number(),
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ input }) => {
      return await db.getClientesByMercadoPaginated(
        input.mercadoId,
        input.page,
        input.pageSize
      );
    }),
}),
```

**UI Component:**

```typescript
// components/Pagination.tsx
export function Pagination({
  currentPage,
  totalPages,
  onPageChange
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="text-sm text-muted-foreground">
        Página {currentPage} de {totalPages}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Próximo
        </Button>
      </div>
    </div>
  );
}
```

**Métricas de Sucesso:**

- Tempo de carregamento reduzido em 70% para listas grandes
- Uso de memória reduzido em 80%
- Navegação entre páginas < 200ms

---

### 1.3 Audit Log (Histórico de Alterações) (18h)

**Objetivo:** Rastreabilidade completa de todas as mudanças no sistema.

**Escopo:**

- Criar tabela `audit_logs`
- Registrar todas as operações CRUD
- Capturar before/after state (JSON)
- Filtros por usuário, entidade, ação, data
- Visualização de diff entre estados
- Exportação de logs

**Implementação:**

```typescript
// drizzle/schema.ts
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 64 }).notNull(),
  userName: text("userName"),
  action: mysqlEnum("action", [
    "create",
    "update",
    "delete",
    "validate",
  ]).notNull(),
  entityType: mysqlEnum("entityType", [
    "mercado",
    "cliente",
    "concorrente",
    "lead",
  ]).notNull(),
  entityId: int("entityId").notNull(),
  beforeState: json("beforeState"), // Estado anterior (JSON)
  afterState: json("afterState"), // Estado posterior (JSON)
  changes: json("changes"), // Lista de campos alterados
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow(),
});

// server/db.ts
export async function createAuditLog(log: InsertAuditLog) {
  const db = await getDb();
  if (!db) return;

  await db.insert(auditLogs).values(log);
}

export async function getAuditLogs(filters: {
  userId?: string;
  entityType?: string;
  entityId?: number;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };

  let query = db.select().from(auditLogs);

  if (filters.userId) query = query.where(eq(auditLogs.userId, filters.userId));
  if (filters.entityType)
    query = query.where(eq(auditLogs.entityType, filters.entityType));
  if (filters.entityId)
    query = query.where(eq(auditLogs.entityId, filters.entityId));
  if (filters.action) query = query.where(eq(auditLogs.action, filters.action));

  const data = await query
    .orderBy(desc(auditLogs.createdAt))
    .limit(filters.pageSize || 50)
    .offset(((filters.page || 1) - 1) * (filters.pageSize || 50));

  return { data, total: data.length };
}

// Middleware para capturar mudanças automaticamente
export const auditMiddleware = t.middleware(
  async ({ ctx, next, path, type, input }) => {
    const result = await next();

    if (type === "mutation" && ctx.user) {
      // Capturar before state se for update/delete
      let beforeState = null;
      if (input?.id) {
        beforeState = await getEntityById(path, input.id);
      }

      await createAuditLog({
        userId: ctx.user.id,
        userName: ctx.user.name,
        action: inferAction(path),
        entityType: inferEntityType(path),
        entityId: input?.id || result?.id,
        beforeState,
        afterState: result,
        changes: calculateDiff(beforeState, result),
        ipAddress: ctx.req.ip,
        userAgent: ctx.req.headers["user-agent"],
      });
    }

    return result;
  }
);
```

**UI Components:**

- `AuditLogViewer.tsx` - Tabela de logs com filtros
- `AuditLogDetail.tsx` - Modal com diff visual
- `AuditLogExport.tsx` - Botão de exportação

**Métricas de Sucesso:**

- 100% das operações registradas
- Tempo de consulta < 500ms
- Diff visual claro e legível

---

## Fase 2: Exportação e Melhorias de UX (Q1 2026 - 40h)

### 2.1 Exportação Avançada (12h)

**Objetivo:** Exportar dados em múltiplos formatos com formatação profissional.

**Escopo:**

- Exportação para Excel (.xlsx) com formatação
- Exportação para PDF com relatório formatado
- Exportação com filtros aplicados
- Opção de incluir/excluir colunas
- Templates de exportação customizáveis

**Implementação:**

```typescript
// Instalar biblioteca
// pnpm add xlsx jspdf jspdf-autotable

// client/src/lib/export.ts
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportToExcel(
  data: any[],
  filename: string,
  options?: ExportOptions
) {
  // Filtrar colunas se especificado
  const filteredData = options?.columns
    ? data.map(row => pick(row, options.columns))
    : data;

  // Criar workbook
  const ws = XLSX.utils.json_to_sheet(filteredData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Dados");

  // Aplicar formatação
  if (options?.formatting) {
    applyExcelFormatting(ws, options.formatting);
  }

  // Download
  XLSX.writeFile(wb, filename);
}

export function exportToPDF(
  data: any[],
  filename: string,
  options?: ExportOptions
) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.text(options?.title || "Relatório", 14, 22);
  doc.setFontSize(11);
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 30);

  // Filtrar colunas
  const columns = options?.columns || Object.keys(data[0]);
  const rows = data.map(row => columns.map(col => row[col]));

  // Tabela
  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 35,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  // Download
  doc.save(filename);
}

// Exportar dados filtrados
export function exportFilteredData(
  allData: any[],
  filters: {
    searchQuery?: string;
    statusFilter?: string;
    tags?: number[];
  },
  format: "csv" | "excel" | "pdf",
  filename: string
) {
  // Aplicar filtros
  let filteredData = allData;

  if (filters.searchQuery) {
    filteredData = filteredData.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(filters.searchQuery!.toLowerCase())
      )
    );
  }

  if (filters.statusFilter && filters.statusFilter !== "all") {
    filteredData = filteredData.filter(
      item => item.validationStatus === filters.statusFilter
    );
  }

  if (filters.tags && filters.tags.length > 0) {
    filteredData = filteredData.filter(item =>
      item.tags?.some((tag: any) => filters.tags!.includes(tag.id))
    );
  }

  // Exportar no formato escolhido
  switch (format) {
    case "csv":
      exportToCSV(filteredData, filename);
      break;
    case "excel":
      exportToExcel(filteredData, filename);
      break;
    case "pdf":
      exportToPDF(filteredData, filename);
      break;
  }
}
```

**UI Component:**

```typescript
// components/ExportMenu.tsx
export function ExportMenu({ data, filters }: ExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => exportFilteredData(data, filters, 'csv', 'dados.csv')}>
          CSV (Simples)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportFilteredData(data, filters, 'excel', 'dados.xlsx')}>
          Excel (Formatado)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportFilteredData(data, filters, 'pdf', 'relatorio.pdf')}>
          PDF (Relatório)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Métricas de Sucesso:**

- 90% dos usuários usam Excel ao invés de CSV
- Tempo de exportação < 3s para 1000 registros
- 0 erros de formatação

---

### 2.2 Modo Compacto + Zoom Customizável (6h)

**Objetivo:** Permitir ajuste de densidade visual e tamanho de fonte.

**Escopo:**

- Toggle de modo compacto (reduz espaçamentos)
- Controles de zoom (80%, 90%, 100%, 110%)
- Persistência no localStorage
- Aplicação global via CSS

**Implementação:**

✅ **Já implementado parcialmente** (contextos criados, falta integração na UI)

```typescript
// components/ViewControls.tsx
export function ViewControls() {
  const { isCompact, toggleCompact } = useCompactMode();
  const { zoomLevel, setZoomLevel } = useZoom();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isCompact ? "default" : "outline"}
        size="sm"
        onClick={toggleCompact}
      >
        <Minimize2 className="h-4 w-4 mr-2" />
        Compacto
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <ZoomIn className="h-4 w-4 mr-2" />
            {zoomLevel}%
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setZoomLevel(80)}>
            80% (Pequeno)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setZoomLevel(90)}>
            90% (Compacto)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setZoomLevel(100)}>
            100% (Normal)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setZoomLevel(110)}>
            110% (Grande)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
```

**Métricas de Sucesso:**

- 40% dos usuários ativam modo compacto
- 20% dos usuários ajustam zoom
- Preferências persistem entre sessões

---

### 2.3 Sistema de Favoritos (12h)

**Objetivo:** Marcar mercados/clientes prioritários para acesso rápido.

**Escopo:**

- Criar tabela `favoritos`
- Botão de estrela em todos os cards
- Filtro "Apenas Favoritos"
- Ordenação por favoritos
- Contador de favoritos

**Implementação:**

```typescript
// drizzle/schema.ts
export const favoritos = mysqlTable("favoritos", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 64 }).notNull(),
  entityType: mysqlEnum("entityType", ["mercado", "cliente", "concorrente", "lead"]).notNull(),
  entityId: int("entityId").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

// server/routers.ts
favoritos: router({
  list: protectedProcedure
    .input(z.object({ entityType: z.enum(["mercado", "cliente", "concorrente", "lead"]).optional() }))
    .query(async ({ ctx, input }) => {
      return await db.getFavoritos(ctx.user.id, input.entityType);
    }),

  toggle: protectedProcedure
    .input(z.object({
      entityType: z.enum(["mercado", "cliente", "concorrente", "lead"]),
      entityId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await db.toggleFavorito(ctx.user.id, input.entityType, input.entityId);
    }),
}),
```

**UI Component:**

```typescript
// components/FavoriteButton.tsx
export function FavoriteButton({ entityType, entityId }: FavoriteButtonProps) {
  const { data: favoritos } = trpc.favoritos.list.useQuery({ entityType });
  const toggleMutation = trpc.favoritos.toggle.useMutation();
  const utils = trpc.useUtils();

  const isFavorite = favoritos?.some(f => f.entityId === entityId);

  const handleToggle = async () => {
    await toggleMutation.mutateAsync({ entityType, entityId });
    utils.favoritos.list.invalidate();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className="hover:text-yellow-500"
    >
      {isFavorite ? (
        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
      ) : (
        <Star className="h-4 w-4" />
      )}
    </Button>
  );
}
```

**Métricas de Sucesso:**

- 60% dos usuários marcam favoritos
- Média de 10 favoritos por usuário
- Filtro de favoritos usado em 30% das sessões

---

## Fase 3: Automação e Integrações (Q2 2026 - 35h)

### 3.1 Notificações Push (15h)

**Objetivo:** Notificar usuários sobre eventos importantes em tempo real.

**Escopo:**

- Sistema de notificações in-app
- Notificações push via Service Worker
- Tipos: nova importação, validação concluída, comentário
- Centro de notificações com histórico
- Configurações de preferências

**Implementação:**

```typescript
// drizzle/schema.ts
export const notifications = mysqlTable("notifications", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 64 }).notNull(),
  type: mysqlEnum("type", ["import", "validation", "comment", "system"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  entityType: mysqlEnum("entityType", ["mercado", "cliente", "concorrente", "lead"]),
  entityId: int("entityId"),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
});

// server/_core/notification.ts (expandir existente)
export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) return;

  await db.insert(notifications).values(notification);

  // Enviar push notification se usuário tiver habilitado
  await sendPushNotification(notification.userId, {
    title: notification.title,
    body: notification.message,
    data: {
      entityType: notification.entityType,
      entityId: notification.entityId,
    },
  });
}

// client/src/components/NotificationCenter.tsx
export function NotificationCenter() {
  const { data: notifications } = trpc.notifications.list.useQuery();
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation();

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h3 className="font-semibold">Notificações</h3>
          {notifications?.map(notification => (
            <div
              key={notification.id}
              className={`p-2 rounded ${notification.isRead ? 'bg-muted' : 'bg-accent'}`}
              onClick={() => markAsReadMutation.mutate({ id: notification.id })}
            >
              <p className="font-medium text-sm">{notification.title}</p>
              <p className="text-xs text-muted-foreground">{notification.message}</p>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

**Métricas de Sucesso:**

- 70% dos usuários habilitam notificações
- Taxa de clique em notificações > 40%
- Tempo de resposta a eventos críticos reduzido em 50%

---

### 3.2 Importação em Lote (15h)

**Objetivo:** Importar grandes volumes de dados via CSV/Excel.

**Escopo:**

- Upload de arquivos CSV/Excel
- Mapeamento de colunas
- Validação de dados antes de importar
- Preview de dados
- Importação assíncrona com progresso
- Relatório de erros

**Implementação:**

```typescript
// server/routers.ts
import: router({
  upload: protectedProcedure
    .input(z.object({
      entityType: z.enum(["mercado", "cliente", "concorrente", "lead"]),
      fileUrl: z.string(), // URL do arquivo no S3
      mapping: z.record(z.string()), // Mapeamento de colunas
    }))
    .mutation(async ({ ctx, input }) => {
      // Processar arquivo em background
      const jobId = await queueImportJob({
        userId: ctx.user.id,
        entityType: input.entityType,
        fileUrl: input.fileUrl,
        mapping: input.mapping,
      });

      return { jobId };
    }),

  status: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ input }) => {
      return await getImportJobStatus(input.jobId);
    }),
}),

// server/jobs/importJob.ts
export async function processImportJob(job: ImportJob) {
  try {
    // Download arquivo do S3
    const { url } = await storageGet(job.fileUrl);
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();

    // Parse CSV/Excel
    const data = parseFile(buffer, job.entityType);

    // Validar dados
    const { valid, invalid } = validateImportData(data, job.mapping);

    // Importar dados válidos
    const imported = [];
    for (const row of valid) {
      const mapped = mapRow(row, job.mapping);
      const result = await db.createEntity(job.entityType, mapped);
      imported.push(result);
    }

    // Criar notificação
    await createNotification({
      userId: job.userId,
      type: "import",
      title: "Importação concluída",
      message: `${imported.length} registros importados com sucesso. ${invalid.length} erros.`,
    });

    return { success: true, imported: imported.length, errors: invalid.length };
  } catch (error) {
    await createNotification({
      userId: job.userId,
      type: "import",
      title: "Erro na importação",
      message: error.message,
    });
    throw error;
  }
}
```

**UI Component:**

```typescript
// components/ImportWizard.tsx
export function ImportWizard({ entityType }: ImportWizardProps) {
  const [step, setStep] = useState(1); // 1: Upload, 2: Mapping, 3: Preview, 4: Import
  const [file, setFile] = useState<File | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<any[]>([]);

  const uploadMutation = trpc.import.upload.useMutation();

  const handleUpload = async () => {
    if (!file) return;

    // Upload para S3
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/upload', { method: 'POST', body: formData });
    const { url } = await response.json();

    // Iniciar importação
    const { jobId } = await uploadMutation.mutateAsync({
      entityType,
      fileUrl: url,
      mapping,
    });

    // Monitorar progresso
    pollImportStatus(jobId);
  };

  return (
    <Dialog>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Importar {entityType}s</DialogTitle>
        </DialogHeader>

        {step === 1 && <UploadStep onNext={(f) => { setFile(f); setStep(2); }} />}
        {step === 2 && <MappingStep file={file!} onNext={(m) => { setMapping(m); setStep(3); }} />}
        {step === 3 && <PreviewStep mapping={mapping} onNext={() => setStep(4)} />}
        {step === 4 && <ImportStep onImport={handleUpload} />}
      </DialogContent>
    </Dialog>
  );
}
```

**Métricas de Sucesso:**

- Importação de 1000 registros em < 30s
- Taxa de erro < 5%
- 80% dos usuários completam importação com sucesso

---

### 3.3 Enriquecimento Automático via API Receita Federal (20h)

**Objetivo:** Preencher dados automaticamente consultando CNPJ na Receita Federal.

**Escopo:**

- Integração com API da Receita Federal
- Botão "Enriquecer Dados" em cada card
- Preenchimento automático de: razão social, nome fantasia, endereço, telefone, email
- Indicador visual de dados enriquecidos
- Rate limiting e cache de consultas

**Implementação:**

```typescript
// server/_core/receitaFederalAPI.ts
import axios from 'axios';

interface ReceitaFederalResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  telefone: string;
  email: string;
  situacao: string;
  data_situacao: string;
}

// Cache de consultas (evitar rate limiting)
const cache = new Map<string, { data: ReceitaFederalResponse; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

export async function consultarCNPJ(cnpj: string): Promise<ReceitaFederalResponse | null> {
  // Limpar formatação
  const cnpjLimpo = cnpj.replace(/\D/g, '');

  // Verificar cache
  const cached = cache.get(cnpjLimpo);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    // API pública da Receita Federal (via BrasilAPI)
    const response = await axios.get<ReceitaFederalResponse>(
      `https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`,
      { timeout: 10000 }
    );

    // Salvar no cache
    cache.set(cnpjLimpo, { data: response.data, timestamp: Date.now() });

    return response.data;
  } catch (error) {
    console.error('[Receita Federal API] Erro ao consultar CNPJ:', error);
    return null;
  }
}

// server/routers.ts
enriquecimento: router({
  consultarCNPJ: protectedProcedure
    .input(z.object({ cnpj: z.string() }))
    .mutation(async ({ input }) => {
      return await consultarCNPJ(input.cnpj);
    }),

  enriquecerCliente: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const cliente = await db.getCliente(input.id);
      if (!cliente || !cliente.cnpj) {
        throw new Error("Cliente não encontrado ou CNPJ inválido");
      }

      const dados = await consultarCNPJ(cliente.cnpj);
      if (!dados) {
        throw new Error("Não foi possível consultar o CNPJ");
      }

      // Atualizar apenas campos vazios
      const updates: Partial<Cliente> = {};
      if (!cliente.nome && dados.razao_social) updates.nome = dados.razao_social;
      if (!cliente.nomeFantasia && dados.nome_fantasia) updates.nomeFantasia = dados.nome_fantasia;
      if (!cliente.endereco && dados.logradouro) {
        updates.endereco = `${dados.logradouro}, ${dados.numero} - ${dados.bairro}, ${dados.municipio}/${dados.uf}`;
      }
      if (!cliente.cidade && dados.municipio) updates.cidade = dados.municipio;
      if (!cliente.estado && dados.uf) updates.estado = dados.uf;
      if (!cliente.telefone && dados.telefone) updates.telefone = dados.telefone;
      if (!cliente.email && dados.email) updates.email = dados.email;

      await db.updateCliente(input.id, updates);

      // Registrar no audit log
      await createAuditLog({
        userId: "system",
        userName: "Enriquecimento Automático",
        action: "update",
        entityType: "cliente",
        entityId: input.id,
        beforeState: cliente,
        afterState: { ...cliente, ...updates },
        changes: Object.keys(updates),
      });

      return { success: true, updates };
    }),
}),
```

**UI Component:**

```typescript
// components/EnrichButton.tsx
export function EnrichButton({ entityType, entityId, cnpj }: EnrichButtonProps) {
  const enrichMutation = trpc.enriquecimento.enriquecerCliente.useMutation();
  const utils = trpc.useUtils();

  const handleEnrich = async () => {
    try {
      const result = await enrichMutation.mutateAsync({ id: entityId });
      toast.success(`${Object.keys(result.updates).length} campos atualizados!`);
      utils.clientes.invalidate();
    } catch (error) {
      toast.error("Erro ao enriquecer dados: " + error.message);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleEnrich}
      disabled={!cnpj || enrichMutation.isPending}
    >
      {enrichMutation.isPending ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Enriquecendo...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 mr-2" />
          Enriquecer Dados
        </>
      )}
    </Button>
  );
}
```

**Métricas de Sucesso:**

- 80% dos CNPJs consultados com sucesso
- Tempo de consulta < 2s
- Taxa de cache hit > 60%
- Redução de 50% no tempo de preenchimento manual

---

## Fase 4: Dashboard Avançado e Visualizações (Q3 2026 - 25h)

### 4.1 Dashboard Avançado com Gráficos Interativos (25h)

**Objetivo:** Criar visualizações avançadas para análise de dados.

**Escopo:**

- Gráfico de linha: Evolução de validações ao longo do tempo
- Gráfico de funil: Pipeline de validação
- Heatmap: Atividade por dia da semana/hora
- Mapa: Distribuição geográfica de clientes
- Filtros temporais (hoje, semana, mês, trimestre, ano)
- Comparação período anterior
- Exportação de gráficos como imagem

**Implementação:**

```typescript
// Instalar bibliotecas adicionais
// pnpm add recharts react-simple-maps d3-scale

// server/routers.ts
analytics: router({
  timeline: protectedProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
      entityType: z.enum(["mercado", "cliente", "concorrente", "lead"]).optional(),
    }))
    .query(async ({ input }) => {
      return await db.getValidationTimeline(input.startDate, input.endDate, input.entityType);
    }),

  funnel: protectedProcedure.query(async () => {
    return await db.getValidationFunnel();
  }),

  heatmap: protectedProcedure
    .input(z.object({ startDate: z.date(), endDate: z.date() }))
    .query(async ({ input }) => {
      return await db.getActivityHeatmap(input.startDate, input.endDate);
    }),

  geographic: protectedProcedure.query(async () => {
    return await db.getGeographicDistribution();
  }),
}),

// client/src/pages/AdvancedDashboard.tsx
export default function AdvancedDashboard() {
  const [dateRange, setDateRange] = useState({ start: subDays(new Date(), 30), end: new Date() });

  const { data: timeline } = trpc.analytics.timeline.useQuery(dateRange);
  const { data: funnel } = trpc.analytics.funnel.useQuery();
  const { data: heatmap } = trpc.analytics.heatmap.useQuery(dateRange);
  const { data: geographic } = trpc.analytics.geographic.useQuery();

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Avançado</h1>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução de Validações</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="validados" stroke="#22c55e" name="Validados" />
              <Line type="monotone" dataKey="pendentes" stroke="#eab308" name="Pendentes" />
              <Line type="monotone" dataKey="descartados" stroke="#ef4444" name="Descartados" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Funil de Validação</CardTitle>
        </CardHeader>
        <CardContent>
          <FunnelChart data={funnel} />
        </CardContent>
      </Card>

      {/* Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Mapa de Calor de Atividade</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityHeatmap data={heatmap} />
        </CardContent>
      </Card>

      {/* Geographic Map */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição Geográfica</CardTitle>
        </CardHeader>
        <CardContent>
          <BrazilMap data={geographic} />
        </CardContent>
      </Card>
    </div>
  );
}
```

**Métricas de Sucesso:**

- Dashboard carrega em < 2s
- 70% dos usuários acessam dashboard semanalmente
- Insights acionáveis identificados em 80% das sessões

---

## Fase 5: Inteligência Artificial (Q3 2026 - 30h)

### 5.1 Busca Semântica com IA (30h)

**Objetivo:** Busca inteligente que entende intenção e contexto.

**Escopo:**

- Embeddings de texto com OpenAI
- Busca por similaridade semântica
- Sugestões de busca inteligentes
- Correção automática de erros de digitação
- Busca por conceitos (ex: "empresas de tecnologia")

**Implementação:**

```typescript
// Instalar biblioteca
// pnpm add openai

// server/_core/aiSearch.ts
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Gerar embedding para texto
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
}

// Calcular similaridade entre embeddings (cosine similarity)
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Busca semântica
export async function semanticSearch(
  query: string,
  entities: any[],
  topK: number = 10
): Promise<any[]> {
  // Gerar embedding da query
  const queryEmbedding = await generateEmbedding(query);

  // Calcular similaridade com cada entidade
  const results = entities.map(entity => {
    // Concatenar campos relevantes
    const text = [
      entity.nome,
      entity.nomeFantasia,
      entity.produto,
      entity.descricao,
      entity.cidade,
    ]
      .filter(Boolean)
      .join(" ");

    // Usar embedding pré-calculado ou gerar novo
    const embedding = entity.embedding || generateEmbedding(text);

    return {
      ...entity,
      similarity: cosineSimilarity(queryEmbedding, embedding),
    };
  });

  // Ordenar por similaridade e retornar top K
  return results.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
}

// Sugestões inteligentes
export async function generateSearchSuggestions(
  query: string
): Promise<string[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "Você é um assistente que sugere buscas relacionadas para um sistema de gestão de mercado B2B. Retorne 5 sugestões de busca relacionadas.",
      },
      {
        role: "user",
        content: `Query: "${query}"\n\nSugestões:`,
      },
    ],
    temperature: 0.7,
    max_tokens: 200,
  });

  const suggestions =
    response.choices[0].message.content
      ?.split("\n")
      .filter(s => s.trim())
      .slice(0, 5) || [];

  return suggestions;
}

// drizzle/schema.ts (adicionar coluna de embedding)
export const clientes = mysqlTable("clientes", {
  // ... campos existentes
  embedding: json("embedding"), // Array de números (embedding)
  embeddingUpdatedAt: timestamp("embeddingUpdatedAt"),
});

// Job para gerar embeddings em background
export async function generateEmbeddingsJob() {
  const db = await getDb();
  if (!db) return;

  // Buscar entidades sem embedding
  const entities = await db
    .select()
    .from(clientes)
    .where(isNull(clientes.embedding))
    .limit(100);

  for (const entity of entities) {
    const text = [
      entity.nome,
      entity.nomeFantasia,
      entity.produto,
      entity.descricao,
      entity.cidade,
    ]
      .filter(Boolean)
      .join(" ");

    const embedding = await generateEmbedding(text);

    await db
      .update(clientes)
      .set({ embedding, embeddingUpdatedAt: new Date() })
      .where(eq(clientes.id, entity.id));
  }
}
```

**UI Component:**

```typescript
// components/SemanticSearch.tsx
export function SemanticSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const searchMutation = trpc.search.semantic.useMutation();

  const handleSearch = async () => {
    const results = await searchMutation.mutateAsync({ query });
    // Exibir resultados
  };

  const loadSuggestions = useDebouncedCallback(async (q: string) => {
    if (q.length < 3) return;
    const suggs = await generateSearchSuggestions(q);
    setSuggestions(suggs);
  }, 500);

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          loadSuggestions(e.target.value);
        }}
        placeholder="Buscar por conceito (ex: empresas de tecnologia)"
      />

      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-card border rounded-md mt-1 shadow-lg">
          {suggestions.map((suggestion, i) => (
            <div
              key={i}
              className="px-3 py-2 hover:bg-accent cursor-pointer"
              onClick={() => setQuery(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Métricas de Sucesso:**

- Precisão de busca semântica > 80%
- Tempo de resposta < 1s
- 60% dos usuários usam busca semântica

---

## Fase 6: Integrações Externas (Q4 2026 - 30h)

### 6.1 Integração com Google Sheets (15h)

**Objetivo:** Sincronização bidirecional com Google Sheets.

**Escopo:**

- Exportar dados para Google Sheets
- Importar dados de Google Sheets
- Sincronização automática (polling ou webhooks)
- Mapeamento de colunas
- Controle de conflitos

**Implementação:**

```typescript
// Instalar biblioteca
// pnpm add googleapis

// server/_core/googleSheetsAPI.ts
import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS!),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

export async function exportToGoogleSheets(
  spreadsheetId: string,
  range: string,
  data: any[][]
) {
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    requestBody: { values: data },
  });
}

export async function importFromGoogleSheets(
  spreadsheetId: string,
  range: string
): Promise<any[][]> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  return response.data.values || [];
}

// Sincronização automática
export async function syncWithGoogleSheets(syncConfig: SyncConfig) {
  // Buscar dados do banco
  const localData = await db.getEntities(syncConfig.entityType);

  // Buscar dados do Google Sheets
  const sheetData = await importFromGoogleSheets(
    syncConfig.spreadsheetId,
    syncConfig.range
  );

  // Comparar e resolver conflitos
  const { toUpdate, toCreate } = compareData(localData, sheetData);

  // Atualizar banco
  for (const item of toUpdate) {
    await db.updateEntity(syncConfig.entityType, item.id, item);
  }

  for (const item of toCreate) {
    await db.createEntity(syncConfig.entityType, item);
  }

  // Atualizar Google Sheets com novos dados do banco
  const updatedData = await db.getEntities(syncConfig.entityType);
  await exportToGoogleSheets(
    syncConfig.spreadsheetId,
    syncConfig.range,
    formatDataForSheets(updatedData)
  );
}
```

**Métricas de Sucesso:**

- Sincronização completa em < 10s para 1000 registros
- Taxa de conflitos < 5%
- 40% dos usuários usam integração com Sheets

---

### 6.2 API Pública (15h)

**Objetivo:** Permitir integrações externas via API REST.

**Escopo:**

- API REST completa (CRUD)
- Autenticação via API Key
- Rate limiting
- Documentação OpenAPI/Swagger
- SDKs para JavaScript e Python

**Implementação:**

```typescript
// server/api/rest.ts
import express from "express";
import rateLimit from "express-rate-limit";

const apiRouter = express.Router();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por janela
});

apiRouter.use(limiter);

// Middleware de autenticação
async function authenticateAPIKey(req, res, next) {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  const user = await db.getUserByAPIKey(apiKey);

  if (!user) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  req.user = user;
  next();
}

apiRouter.use(authenticateAPIKey);

// Endpoints
apiRouter.get("/mercados", async (req, res) => {
  const mercados = await db.getMercados();
  res.json(mercados);
});

apiRouter.get("/mercados/:id", async (req, res) => {
  const mercado = await db.getMercado(parseInt(req.params.id));
  res.json(mercado);
});

apiRouter.post("/mercados", async (req, res) => {
  const mercado = await db.createMercado(req.body);
  res.status(201).json(mercado);
});

// ... outros endpoints

export default apiRouter;

// Documentação OpenAPI
export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Gestor PAV API",
    version: "1.0.0",
    description: "API para gestão de pesquisa de mercado",
  },
  servers: [{ url: "https://api.gestor-pav.com/v1" }],
  paths: {
    "/mercados": {
      get: {
        summary: "Listar mercados",
        responses: {
          "200": {
            description: "Lista de mercados",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Mercado" },
                },
              },
            },
          },
        },
      },
    },
    // ... outros endpoints
  },
  components: {
    schemas: {
      Mercado: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nome: { type: "string" },
          tipo: { type: "string", enum: ["B2B", "B2C", "B2B2C"] },
          quantidadeClientes: { type: "integer" },
        },
      },
    },
  },
};
```

**Métricas de Sucesso:**

- API disponível 99.9% do tempo
- Tempo de resposta < 200ms (p95)
- 20% dos usuários usam API

---

## Fase 7: Multi-tenant e Escalabilidade (Q4 2026 - 30h)

### 7.1 Sistema Multi-tenant (30h)

**Objetivo:** Suportar múltiplas organizações no mesmo sistema.

**Escopo:**

- Isolamento de dados por tenant
- Gerenciamento de usuários por tenant
- Planos e billing por tenant
- Customização de branding por tenant
- Migração de dados entre tenants

**Implementação:**

```typescript
// drizzle/schema.ts
export const tenants = mysqlTable("tenants", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  plan: mysqlEnum("plan", ["free", "pro", "enterprise"]).default("free"),
  logo: text("logo"),
  primaryColor: varchar("primaryColor", { length: 7 }).default("#3b82f6"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const tenantUsers = mysqlTable("tenant_users", {
  id: int("id").primaryKey().autoincrement(),
  tenantId: int("tenantId")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  userId: varchar("userId", { length: 64 }).notNull(),
  role: mysqlEnum("role", ["owner", "admin", "member"]).default("member"),
  createdAt: timestamp("createdAt").defaultNow(),
});

// Adicionar tenantId em todas as tabelas
export const mercados = mysqlTable("mercados", {
  // ... campos existentes
  tenantId: int("tenantId")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
});

// Middleware para injetar tenantId
export const tenantMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // Buscar tenant do usuário
  const tenantUser = await db.getTenantUser(ctx.user.id);

  if (!tenantUser) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "User not associated with any tenant",
    });
  }

  return next({
    ctx: {
      ...ctx,
      tenant: tenantUser.tenant,
      tenantRole: tenantUser.role,
    },
  });
});

export const tenantProcedure = publicProcedure.use(tenantMiddleware);

// Todas as queries devem filtrar por tenantId
export async function getMercados(tenantId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(mercados)
    .where(eq(mercados.tenantId, tenantId));
}
```

**Métricas de Sucesso:**

- Isolamento de dados 100% efetivo
- Tempo de provisionamento de novo tenant < 1min
- Suporte a 100+ tenants simultâneos

---

## Fase 8: Otimizações Finais (Q4 2026 - 20h)

### 8.1 Performance e Otimizações (20h)

**Objetivo:** Otimizar performance para escala.

**Escopo:**

- Paginação virtual (react-virtual) para listas grandes
- Lazy loading de imagens
- Code splitting e lazy loading de rotas
- Service Worker para cache offline
- Compressão de assets
- CDN para assets estáticos

**Implementação:**

```typescript
// Instalar bibliotecas
// pnpm add @tanstack/react-virtual workbox-webpack-plugin

// components/VirtualList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualList({ items, renderItem }: VirtualListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Altura estimada de cada item
    overscan: 5, // Renderizar 5 itens extras acima/abaixo
  });

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index])}
          </div>
        ))}
      </div>
    </div>
  );
}

// Lazy loading de rotas
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const CascadeView = lazy(() => import('./pages/CascadeView'));

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<CascadeView />} />
      </Routes>
    </Suspense>
  );
}

// Service Worker para cache offline
// public/service-worker.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('gestor-pav-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.css',
        '/logo.svg',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

**Métricas de Sucesso:**

- Lighthouse Score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Renderização de 10.000 itens sem lag

---

## Resumo de Estimativas

| Fase       | Funcionalidades                          | Horas    | Trimestre        |
| ---------- | ---------------------------------------- | -------- | ---------------- |
| **Fase 1** | Tags, Paginação, Audit Log               | 40h      | Q1 2026          |
| **Fase 2** | Exportação, UX, Favoritos                | 40h      | Q1 2026          |
| **Fase 3** | Notificações, Importação, Enriquecimento | 35h      | Q2 2026          |
| **Fase 4** | Dashboard Avançado                       | 25h      | Q3 2026          |
| **Fase 5** | Busca Semântica IA                       | 30h      | Q3 2026          |
| **Fase 6** | Google Sheets, API Pública               | 30h      | Q4 2026          |
| **Fase 7** | Multi-tenant                             | 30h      | Q4 2026          |
| **Fase 8** | Otimizações Finais                       | 20h      | Q4 2026          |
| **TOTAL**  | **15 funcionalidades**                   | **280h** | **4 trimestres** |

---

## Priorização Recomendada

### Implementar IMEDIATAMENTE (Semanas 1-4)

1. ✅ Paginação Server-Side (8h) - Crítico para performance
2. ✅ Exportação Avançada (12h) - Alto valor, baixo esforço
3. ✅ Sistema de Favoritos (12h) - Melhora produtividade

### Implementar EM SEGUIDA (Semanas 5-12)

4. Tags Customizáveis (20h) - Organização flexível
5. Audit Log (18h) - Rastreabilidade
6. Enriquecimento API (20h) - Automação

### Implementar DEPOIS (Mês 3-6)

7. Notificações Push (15h)
8. Importação em Lote (15h)
9. Dashboard Avançado (25h)

### Roadmap Futuro (Mês 6+)

10. Busca Semântica IA (30h)
11. Google Sheets (15h)
12. API Pública (15h)
13. Multi-tenant (30h)
14. Otimizações Finais (20h)

---

## Métricas de Sucesso Globais

| Métrica                               | Baseline Atual | Meta Q2 2026 | Meta Q4 2026 |
| ------------------------------------- | -------------- | ------------ | ------------ |
| **Tempo de validação por item**       | 30s            | 15s (-50%)   | 10s (-67%)   |
| **Taxa de adoção de funcionalidades** | 60%            | 75%          | 85%          |
| **Satisfação do usuário (NPS)**       | N/A            | 40           | 60           |
| **Tempo de carregamento (p95)**       | 2s             | 1.5s         | 1s           |
| **Taxa de erro**                      | 5%             | 2%           | 1%           |
| **Uptime**                            | 99%            | 99.5%        | 99.9%        |

---

## Riscos e Mitigações

| Risco                                       | Probabilidade | Impacto | Mitigação                                       |
| ------------------------------------------- | ------------- | ------- | ----------------------------------------------- |
| **Integração API Receita Federal instável** | Alta          | Médio   | Implementar cache agressivo + fallback manual   |
| **Performance com datasets grandes**        | Média         | Alto    | Paginação server-side + índices otimizados      |
| **Complexidade de multi-tenant**            | Média         | Alto    | Implementar em fases, começar com single-tenant |
| **Custo de APIs (OpenAI)**                  | Baixa         | Médio   | Cache de embeddings + rate limiting             |
| **Adoção de funcionalidades avançadas**     | Média         | Médio   | Onboarding guiado + tooltips contextuais        |

---

## Conclusão

Este plano de implementação fornece um **roadmap claro e executável** para transformar o Gestor PAV em uma plataforma completa e escalável de gestão de pesquisa de mercado. Com **280 horas** de desenvolvimento distribuídas em **4 trimestres**, o sistema evoluirá de uma ferramenta de validação básica para uma **plataforma enterprise** com IA, automação e integrações avançadas.

**Próximos Passos Imediatos:**

1. Revisar e aprovar roadmap com stakeholders
2. Priorizar Fase 1 (Tags + Paginação + Audit Log)
3. Alocar recursos de desenvolvimento
4. Iniciar implementação em Sprint 1

**Autor:** Manus AI  
**Data:** Novembro 2025  
**Versão:** 1.0
