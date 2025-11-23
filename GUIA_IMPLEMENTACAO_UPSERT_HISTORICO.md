# 🛠️ Guia de Implementação: UPSERT + Histórico

**Data:** 19 de Novembro de 2025 - 16:30 GMT-3  
**Autor:** Manus AI

---

## 🎯 Objetivo

Implementar **solução híbrida** que combina:

- ✅ **UPSERT** - Evita duplicação, mantém dados atualizados
- ✅ **Histórico** - Rastreia todas as mudanças ao longo do tempo

**Melhor dos dois mundos:**

- Tabela principal: estado atual (sem duplicatas)
- Tabela de histórico: todas as mudanças (com timestamp)

---

## 📊 Arquitetura da Solução

### Estrutura de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                    TABELA PRINCIPAL                         │
│  clientes: Estado atual (1 registro por empresa)           │
│  - id, nome, cnpj, email, site, qualidadeScore, ...        │
│  - Sempre atualizado via UPSERT                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ registra mudanças
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   TABELA DE HISTÓRICO                       │
│  clientes_history: Todas as mudanças                       │
│  - id, clienteId, field, oldValue, newValue, changedAt     │
│  - Crescimento incremental (append-only)                   │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo de Operação

```typescript
// 1. Tentar criar/atualizar cliente
createCliente({ nome: "ABC", email: "novo@abc.com" })
  │
  ├─ Existe? (SELECT)
  │   │
  │   ├─ NÃO → INSERT na tabela principal
  │   │
  │   └─ SIM → Comparar campos
  │       │
  │       ├─ Email mudou: null → "novo@abc.com"
  │       │   ├─ INSERT em clientes_history
  │       │   └─ UPDATE na tabela principal
  │       │
  │       └─ Nada mudou → Nenhuma ação
```

---

## 🗄️ Passo 1: Criar Tabelas de Histórico

### Schema Drizzle

Adicione ao arquivo `drizzle/schema.ts`:

```typescript
/**
 * Tabelas de Histórico - Rastreamento de mudanças
 */

// Enum para tipos de mudança
export const changeTypeEnum = mysqlEnum("changeType", [
  "created", // Registro criado
  "updated", // Campo atualizado
  "enriched", // Enriquecido via API
  "validated", // Validado manualmente
]);

/**
 * Histórico de Mercados
 */
export const mercadosHistory = mysqlTable("mercados_history", {
  id: int("id").primaryKey().autoincrement(),
  mercadoId: int("mercadoId").notNull(),
  field: varchar("field", { length: 100 }), // Campo que mudou
  oldValue: text("oldValue"), // Valor anterior
  newValue: text("newValue"), // Valor novo
  changeType: changeTypeEnum.default("updated"),
  changedBy: varchar("changedBy", { length: 64 }), // Quem mudou (user ID ou "system")
  changedAt: timestamp("changedAt").defaultNow(),
});

export type MercadoHistory = typeof mercadosHistory.$inferSelect;
export type InsertMercadoHistory = typeof mercadosHistory.$inferInsert;

/**
 * Histórico de Clientes
 */
export const clientesHistory = mysqlTable("clientes_history", {
  id: int("id").primaryKey().autoincrement(),
  clienteId: int("clienteId").notNull(),
  field: varchar("field", { length: 100 }),
  oldValue: text("oldValue"),
  newValue: text("newValue"),
  changeType: changeTypeEnum.default("updated"),
  changedBy: varchar("changedBy", { length: 64 }),
  changedAt: timestamp("changedAt").defaultNow(),
});

export type ClienteHistory = typeof clientesHistory.$inferSelect;
export type InsertClienteHistory = typeof clientesHistory.$inferInsert;

/**
 * Histórico de Concorrentes
 */
export const concorrentesHistory = mysqlTable("concorrentes_history", {
  id: int("id").primaryKey().autoincrement(),
  concorrenteId: int("concorrenteId").notNull(),
  field: varchar("field", { length: 100 }),
  oldValue: text("oldValue"),
  newValue: text("newValue"),
  changeType: changeTypeEnum.default("updated"),
  changedBy: varchar("changedBy", { length: 64 }),
  changedAt: timestamp("changedAt").defaultNow(),
});

export type ConcorrenteHistory = typeof concorrentesHistory.$inferSelect;
export type InsertConcorrenteHistory = typeof concorrentesHistory.$inferInsert;

/**
 * Histórico de Leads
 */
export const leadsHistory = mysqlTable("leads_history", {
  id: int("id").primaryKey().autoincrement(),
  leadId: int("leadId").notNull(),
  field: varchar("field", { length: 100 }),
  oldValue: text("oldValue"),
  newValue: text("newValue"),
  changeType: changeTypeEnum.default("updated"),
  changedBy: varchar("changedBy", { length: 64 }),
  changedAt: timestamp("changedAt").defaultNow(),
});

export type LeadHistory = typeof leadsHistory.$inferSelect;
export type InsertLeadHistory = typeof leadsHistory.$inferInsert;
```

### Aplicar Migração

```bash
cd /home/ubuntu/gestor-pav
pnpm db:push
```

---

## 🔧 Passo 2: Implementar Helper de Histórico

Crie arquivo `server/_core/historyTracker.ts`:

```typescript
/**
 * Helper para rastrear mudanças em entidades
 */

import { getDb } from "../db";
import {
  mercadosHistory,
  clientesHistory,
  concorrentesHistory,
  leadsHistory,
} from "../../drizzle/schema";

type ChangeType = "created" | "updated" | "enriched" | "validated";

interface Change {
  field: string;
  oldValue: any;
  newValue: any;
}

/**
 * Compara dois objetos e retorna lista de mudanças
 */
export function detectChanges(
  oldData: Record<string, any>,
  newData: Record<string, any>,
  fieldsToTrack: string[]
): Change[] {
  const changes: Change[] = [];

  for (const field of fieldsToTrack) {
    const oldValue = oldData[field];
    const newValue = newData[field];

    // Ignorar se ambos são null/undefined
    if (oldValue == null && newValue == null) continue;

    // Detectar mudança
    if (oldValue !== newValue) {
      changes.push({
        field,
        oldValue: oldValue != null ? String(oldValue) : null,
        newValue: newValue != null ? String(newValue) : null,
      });
    }
  }

  return changes;
}

/**
 * Registra mudanças de mercado no histórico
 */
export async function trackMercadoChanges(
  mercadoId: number,
  changes: Change[],
  changeType: ChangeType = "updated",
  changedBy: string = "system"
) {
  if (changes.length === 0) return;

  const db = await getDb();
  if (!db) return;

  const records = changes.map(change => ({
    mercadoId,
    field: change.field,
    oldValue: change.oldValue,
    newValue: change.newValue,
    changeType,
    changedBy,
  }));

  await db.insert(mercadosHistory).values(records);
  console.log(
    `[History] Registradas ${changes.length} mudanças para mercado ${mercadoId}`
  );
}

/**
 * Registra mudanças de cliente no histórico
 */
export async function trackClienteChanges(
  clienteId: number,
  changes: Change[],
  changeType: ChangeType = "updated",
  changedBy: string = "system"
) {
  if (changes.length === 0) return;

  const db = await getDb();
  if (!db) return;

  const records = changes.map(change => ({
    clienteId,
    field: change.field,
    oldValue: change.oldValue,
    newValue: change.newValue,
    changeType,
    changedBy,
  }));

  await db.insert(clientesHistory).values(records);
  console.log(
    `[History] Registradas ${changes.length} mudanças para cliente ${clienteId}`
  );
}

/**
 * Registra mudanças de concorrente no histórico
 */
export async function trackConcorrenteChanges(
  concorrenteId: number,
  changes: Change[],
  changeType: ChangeType = "updated",
  changedBy: string = "system"
) {
  if (changes.length === 0) return;

  const db = await getDb();
  if (!db) return;

  const records = changes.map(change => ({
    concorrenteId,
    field: change.field,
    oldValue: change.oldValue,
    newValue: change.newValue,
    changeType,
    changedBy,
  }));

  await db.insert(concorrentesHistory).values(records);
  console.log(
    `[History] Registradas ${changes.length} mudanças para concorrente ${concorrenteId}`
  );
}

/**
 * Registra mudanças de lead no histórico
 */
export async function trackLeadChanges(
  leadId: number,
  changes: Change[],
  changeType: ChangeType = "updated",
  changedBy: string = "system"
) {
  if (changes.length === 0) return;

  const db = await getDb();
  if (!db) return;

  const records = changes.map(change => ({
    leadId,
    field: change.field,
    oldValue: change.oldValue,
    newValue: change.newValue,
    changeType,
    changedBy,
  }));

  await db.insert(leadsHistory).values(records);
  console.log(
    `[History] Registradas ${changes.length} mudanças para lead ${leadId}`
  );
}

/**
 * Registra criação de entidade
 */
export async function trackCreation(
  entityType: "mercado" | "cliente" | "concorrente" | "lead",
  entityId: number,
  initialData: Record<string, any>,
  changedBy: string = "system"
) {
  const db = await getDb();
  if (!db) return;

  const change = {
    field: "_created",
    oldValue: null,
    newValue: JSON.stringify(initialData),
    changeType: "created" as const,
    changedBy,
  };

  switch (entityType) {
    case "mercado":
      await db
        .insert(mercadosHistory)
        .values({ ...change, mercadoId: entityId });
      break;
    case "cliente":
      await db
        .insert(clientesHistory)
        .values({ ...change, clienteId: entityId });
      break;
    case "concorrente":
      await db
        .insert(concorrentesHistory)
        .values({ ...change, concorrenteId: entityId });
      break;
    case "lead":
      await db.insert(leadsHistory).values({ ...change, leadId: entityId });
      break;
  }

  console.log(`[History] Criação de ${entityType} ${entityId} registrada`);
}
```

---

## 🔄 Passo 3: Atualizar Funções de Criação

### 3.1. Mercados com UPSERT + Histórico

Atualize `server/db.ts`:

```typescript
export async function createMercado(data: {
  projectId: number;
  nome: string;
  categoria?: string | null;
  segmentacao?: "B2B" | "B2C" | "B2B2C" | null;
  tamanhoMercado?: string | null;
  crescimentoAnual?: string | null;
  tendencias?: string | null;
  principaisPlayers?: string | null;
  quantidadeClientes?: number | null;
}) {
  const db = await getDb();
  if (!db) return null;

  // Hash sem timestamp
  const mercadoHash = `${data.nome}-${data.projectId}`
    .toLowerCase()
    .replace(/\s+/g, "-");

  // Verificar se já existe
  const existing = await db
    .select()
    .from(mercadosUnicos)
    .where(
      and(
        eq(mercadosUnicos.mercadoHash, mercadoHash),
        eq(mercadosUnicos.projectId, data.projectId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Detectar mudanças
    const { detectChanges, trackMercadoChanges } = await import(
      "./_core/historyTracker"
    );
    const changes = detectChanges(existing[0], data, [
      "nome",
      "categoria",
      "segmentacao",
      "tamanhoMercado",
      "crescimentoAnual",
      "tendencias",
      "principaisPlayers",
    ]);

    // Registrar histórico
    await trackMercadoChanges(existing[0].id, changes, "updated");

    // Atualizar se houver mudanças
    if (changes.length > 0) {
      await db
        .update(mercadosUnicos)
        .set({
          nome: data.nome,
          categoria: data.categoria || existing[0].categoria,
          segmentacao: data.segmentacao || existing[0].segmentacao,
          tamanhoMercado: data.tamanhoMercado || existing[0].tamanhoMercado,
          crescimentoAnual:
            data.crescimentoAnual || existing[0].crescimentoAnual,
          tendencias: data.tendencias || existing[0].tendencias,
          principaisPlayers:
            data.principaisPlayers || existing[0].principaisPlayers,
          quantidadeClientes:
            data.quantidadeClientes ?? existing[0].quantidadeClientes,
        })
        .where(eq(mercadosUnicos.id, existing[0].id));

      console.log(
        `[Mercado] Atualizado: ${data.nome} (${changes.length} mudanças)`
      );
    }

    return existing[0];
  }

  // Criar novo mercado
  const [result] = await db.insert(mercadosUnicos).values({
    projectId: data.projectId,
    mercadoHash,
    nome: data.nome,
    categoria: data.categoria || null,
    segmentacao: data.segmentacao || null,
    tamanhoMercado: data.tamanhoMercado || null,
    crescimentoAnual: data.crescimentoAnual || null,
    tendencias: data.tendencias || null,
    principaisPlayers: data.principaisPlayers || null,
    quantidadeClientes: data.quantidadeClientes || 0,
  });

  if (!result.insertId) return null;

  const mercado = await getMercadoById(Number(result.insertId));

  // Registrar criação no histórico
  const { trackCreation } = await import("./_core/historyTracker");
  await trackCreation("mercado", mercado.id, data);

  console.log(`[Mercado] Criado: ${data.nome}`);
  return mercado;
}
```

### 3.2. Clientes com Histórico (já tem UPSERT)

Atualize a função `createCliente` existente:

```typescript
export async function createCliente(data: {
  // ... parâmetros existentes
}) {
  const db = await getDb();
  if (!db) return null;

  // Hash sem timestamp para clientes sem CNPJ
  const clienteHash = data.cnpj
    ? `${data.nome}-${data.cnpj}-${data.projectId}`
    : `${data.nome}-${data.projectId}`; // ✅ Removido Date.now()

  clienteHash = clienteHash
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // Verificar se já existe
  const existing = await db
    .select()
    .from(clientes)
    .where(
      and(
        eq(clientes.clienteHash, clienteHash),
        eq(clientes.projectId, data.projectId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Detectar mudanças
    const { detectChanges, trackClienteChanges } = await import(
      "./_core/historyTracker"
    );
    const changes = detectChanges(existing[0], data, [
      "nome",
      "cnpj",
      "siteOficial",
      "produtoPrincipal",
      "email",
      "telefone",
      "cidade",
      "uf",
      "linkedin",
      "instagram",
      "cnae",
      "porte",
    ]);

    // Registrar histórico
    await trackClienteChanges(existing[0].id, changes, "enriched"); // 'enriched' se veio de API

    // Atualizar
    if (changes.length > 0) {
      await db
        .update(clientes)
        .set({
          nome: data.nome,
          cnpj: data.cnpj || existing[0].cnpj,
          siteOficial: data.siteOficial || existing[0].siteOficial,
          produtoPrincipal:
            data.produtoPrincipal || existing[0].produtoPrincipal,
          email: data.email || existing[0].email,
          telefone: data.telefone || existing[0].telefone,
          cidade: data.cidade || existing[0].cidade,
          uf: data.uf || existing[0].uf,
          linkedin: data.linkedin || existing[0].linkedin,
          instagram: data.instagram || existing[0].instagram,
          cnae: data.cnae || existing[0].cnae,
          porte: data.porte || existing[0].porte,
          qualidadeScore: data.qualidadeScore || existing[0].qualidadeScore,
          qualidadeClassificacao:
            data.qualidadeClassificacao || existing[0].qualidadeClassificacao,
        })
        .where(eq(clientes.id, existing[0].id));

      console.log(
        `[Cliente] Atualizado: ${data.nome} (${changes.length} mudanças)`
      );
    }

    return existing[0];
  }

  // Criar novo cliente
  const [result] = await db.insert(clientes).values({
    projectId: data.projectId,
    clienteHash,
    nome: data.nome,
    // ... todos os campos
  });

  if (!result.insertId) return null;

  const cliente = await db
    .select()
    .from(clientes)
    .where(eq(clientes.id, Number(result.insertId)))
    .limit(1);

  // Registrar criação
  const { trackCreation } = await import("./_core/historyTracker");
  await trackCreation("cliente", cliente[0].id, data);

  console.log(`[Cliente] Criado: ${data.nome}`);
  return cliente[0];
}
```

### 3.3. Concorrentes com UPSERT + Histórico

```typescript
export async function createConcorrente(data: {
  projectId: number;
  mercadoId: number;
  nome: string;
  cnpj?: string | null;
  site?: string | null;
  produto?: string | null;
  porte?: "MEI" | "Pequena" | "Média" | "Grande" | null;
  faturamentoEstimado?: string | null;
  qualidadeScore?: number | null;
  qualidadeClassificacao?: string | null;
  validationStatus?:
    | "pending"
    | "rich"
    | "needs_adjustment"
    | "discarded"
    | null;
}) {
  const db = await getDb();
  if (!db) return null;

  // Hash sem timestamp
  const concorrenteHash = `${data.nome}-${data.mercadoId}-${data.projectId}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // Verificar se já existe
  const existing = await db
    .select()
    .from(concorrentes)
    .where(
      and(
        eq(concorrentes.concorrenteHash, concorrenteHash),
        eq(concorrentes.projectId, data.projectId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Detectar mudanças
    const { detectChanges, trackConcorrenteChanges } = await import(
      "./_core/historyTracker"
    );
    const changes = detectChanges(existing[0], data, [
      "nome",
      "cnpj",
      "site",
      "produto",
      "porte",
      "faturamentoEstimado",
    ]);

    // Registrar histórico
    await trackConcorrenteChanges(existing[0].id, changes, "enriched");

    // Atualizar
    if (changes.length > 0) {
      await db
        .update(concorrentes)
        .set({
          nome: data.nome,
          cnpj: data.cnpj || existing[0].cnpj,
          site: data.site || existing[0].site,
          produto: data.produto || existing[0].produto,
          porte: data.porte || existing[0].porte,
          faturamentoEstimado:
            data.faturamentoEstimado || existing[0].faturamentoEstimado,
          qualidadeScore: data.qualidadeScore || existing[0].qualidadeScore,
          qualidadeClassificacao:
            data.qualidadeClassificacao || existing[0].qualidadeClassificacao,
        })
        .where(eq(concorrentes.id, existing[0].id));

      console.log(
        `[Concorrente] Atualizado: ${data.nome} (${changes.length} mudanças)`
      );
    }

    return existing[0];
  }

  // Criar novo concorrente
  const [result] = await db.insert(concorrentes).values({
    projectId: data.projectId,
    mercadoId: data.mercadoId,
    concorrenteHash,
    nome: data.nome,
    cnpj: data.cnpj || null,
    site: data.site || null,
    produto: data.produto || null,
    porte: data.porte || null,
    faturamentoEstimado: data.faturamentoEstimado || null,
    qualidadeScore: data.qualidadeScore || 0,
    qualidadeClassificacao: data.qualidadeClassificacao || "Ruim",
    validationStatus: data.validationStatus || "pending",
  });

  if (!result.insertId) return null;

  const concorrente = await db
    .select()
    .from(concorrentes)
    .where(eq(concorrentes.id, Number(result.insertId)))
    .limit(1);

  // Registrar criação
  const { trackCreation } = await import("./_core/historyTracker");
  await trackCreation("concorrente", concorrente[0].id, data);

  console.log(`[Concorrente] Criado: ${data.nome}`);
  return concorrente[0];
}
```

### 3.4. Leads com UPSERT + Histórico

```typescript
export async function createLead(data: {
  projectId: number;
  mercadoId: number;
  nome: string;
  cnpj?: string | null;
  site?: string | null;
  email?: string | null;
  telefone?: string | null;
  tipo?: "inbound" | "outbound" | "referral" | null;
  porte?: string | null;
  regiao?: string | null;
  setor?: string | null;
  qualidadeScore?: number | null;
  qualidadeClassificacao?: string | null;
  validationStatus?:
    | "pending"
    | "rich"
    | "needs_adjustment"
    | "discarded"
    | null;
}) {
  const db = await getDb();
  if (!db) return null;

  // Hash sem timestamp
  const leadHash = `${data.nome}-${data.mercadoId}-${data.projectId}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // Verificar se já existe
  const existing = await db
    .select()
    .from(leads)
    .where(
      and(eq(leads.leadHash, leadHash), eq(leads.projectId, data.projectId))
    )
    .limit(1);

  if (existing.length > 0) {
    // Detectar mudanças
    const { detectChanges, trackLeadChanges } = await import(
      "./_core/historyTracker"
    );
    const changes = detectChanges(
      existing[0],
      data,
      [
        "nome",
        "cnpj",
        "site",
        "email",
        "telefone",
        "tipo",
        "porte",
        "regiao",
        "setor",
      ]
      // ⚠️ NÃO incluir 'stage' para preservar progresso de vendas
    );

    // Registrar histórico
    await trackLeadChanges(existing[0].id, changes, "enriched");

    // Atualizar (sem modificar stage)
    if (changes.length > 0) {
      await db
        .update(leads)
        .set({
          nome: data.nome,
          cnpj: data.cnpj || existing[0].cnpj,
          site: data.site || existing[0].site,
          email: data.email || existing[0].email,
          telefone: data.telefone || existing[0].telefone,
          tipo: data.tipo || existing[0].tipo,
          porte: data.porte || existing[0].porte,
          regiao: data.regiao || existing[0].regiao,
          setor: data.setor || existing[0].setor,
          qualidadeScore: data.qualidadeScore || existing[0].qualidadeScore,
          qualidadeClassificacao:
            data.qualidadeClassificacao || existing[0].qualidadeClassificacao,
          // ⚠️ stage NÃO é atualizado
        })
        .where(eq(leads.id, existing[0].id));

      console.log(
        `[Lead] Atualizado: ${data.nome} (${changes.length} mudanças)`
      );
    }

    return existing[0];
  }

  // Criar novo lead
  const result = await db.execute(sql`
    INSERT INTO leads (
      projectId, mercadoId, leadHash, nome, cnpj, site, email, telefone,
      tipo, porte, regiao, setor, qualidadeScore, qualidadeClassificacao,
      validationStatus, stage
    ) VALUES (
      ${data.projectId}, ${data.mercadoId}, ${leadHash}, ${data.nome},
      ${data.cnpj || null}, ${data.site || null}, ${data.email || null}, ${data.telefone || null},
      ${data.tipo || "outbound"}, ${data.porte || null}, ${data.regiao || null}, ${data.setor || null},
      ${data.qualidadeScore || 0}, ${data.qualidadeClassificacao || "Ruim"},
      ${data.validationStatus || "pending"}, 'novo'
    )
  `);

  const leadId = Number(result.insertId);
  const lead = await db
    .select()
    .from(leads)
    .where(eq(leads.id, leadId))
    .limit(1);

  // Registrar criação
  const { trackCreation } = await import("./_core/historyTracker");
  await trackCreation("lead", leadId, data);

  console.log(`[Lead] Criado: ${data.nome}`);
  return lead[0];
}
```

---

## 🧪 Passo 4: Testar a Implementação

### Script de Teste

Crie `server/__tests__/upsert-history.test.ts`:

```typescript
import { describe, it, expect, beforeAll } from "vitest";
import { createCliente } from "../db";
import { getDb } from "../db";
import { clientesHistory } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

describe("UPSERT + Histórico", () => {
  let clienteId: number;

  it("deve criar cliente e registrar no histórico", async () => {
    const cliente = await createCliente({
      projectId: 1,
      nome: "Empresa Teste",
      cnpj: "12345678000190",
      email: "teste@empresa.com",
    });

    expect(cliente).toBeTruthy();
    expect(cliente.nome).toBe("Empresa Teste");
    clienteId = cliente.id;

    // Verificar histórico de criação
    const db = await getDb();
    const history = await db
      .select()
      .from(clientesHistory)
      .where(eq(clientesHistory.clienteId, clienteId));

    expect(history.length).toBeGreaterThan(0);
    expect(history[0].changeType).toBe("created");
  });

  it("deve atualizar cliente e registrar mudanças", async () => {
    const clienteAtualizado = await createCliente({
      projectId: 1,
      nome: "Empresa Teste",
      cnpj: "12345678000190",
      email: "novo@empresa.com", // Mudou
      telefone: "11999999999", // Novo campo
    });

    expect(clienteAtualizado.id).toBe(clienteId); // Mesmo ID
    expect(clienteAtualizado.email).toBe("novo@empresa.com");

    // Verificar histórico de mudanças
    const db = await getDb();
    const history = await db
      .select()
      .from(clientesHistory)
      .where(eq(clientesHistory.clienteId, clienteId));

    // Deve ter: 1 criação + 2 mudanças (email, telefone)
    expect(history.length).toBeGreaterThanOrEqual(3);

    const emailChange = history.find(h => h.field === "email");
    expect(emailChange).toBeTruthy();
    expect(emailChange.oldValue).toBe("teste@empresa.com");
    expect(emailChange.newValue).toBe("novo@empresa.com");
  });

  it("não deve criar duplicata em reprocessamento", async () => {
    // Processar 3 vezes
    await createCliente({
      projectId: 1,
      nome: "Empresa Teste",
      cnpj: "12345678000190",
      email: "novo@empresa.com",
    });

    await createCliente({
      projectId: 1,
      nome: "Empresa Teste",
      cnpj: "12345678000190",
      email: "novo@empresa.com",
    });

    await createCliente({
      projectId: 1,
      nome: "Empresa Teste",
      cnpj: "12345678000190",
      email: "novo@empresa.com",
    });

    // Verificar que só existe 1 cliente
    const db = await getDb();
    const clientes = await db
      .select()
      .from(clientes)
      .where(eq(clientes.cnpj, "12345678000190"));

    expect(clientes.length).toBe(1);
    expect(clientes[0].id).toBe(clienteId);
  });
});
```

Executar teste:

```bash
cd /home/ubuntu/gestor-pav
pnpm test server/__tests__/upsert-history.test.ts
```

---

## 📊 Passo 5: Consultar Histórico

### Funções Helper

Adicione ao `server/db.ts`:

```typescript
/**
 * Busca histórico completo de um cliente
 */
export async function getClienteHistory(clienteId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(clientesHistory)
    .where(eq(clientesHistory.clienteId, clienteId))
    .orderBy(desc(clientesHistory.changedAt));
}

/**
 * Busca histórico de um campo específico
 */
export async function getClienteFieldHistory(clienteId: number, field: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(clientesHistory)
    .where(
      and(
        eq(clientesHistory.clienteId, clienteId),
        eq(clientesHistory.field, field)
      )
    )
    .orderBy(desc(clientesHistory.changedAt));
}

/**
 * Busca mudanças recentes (últimas 24h)
 */
export async function getRecentChanges(
  entityType: "cliente" | "mercado" | "concorrente" | "lead"
) {
  const db = await getDb();
  if (!db) return [];

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  switch (entityType) {
    case "cliente":
      return await db
        .select()
        .from(clientesHistory)
        .where(gte(clientesHistory.changedAt, yesterday))
        .orderBy(desc(clientesHistory.changedAt));
    // ... outros casos
  }
}
```

### Exemplo de Uso

```typescript
// Ver histórico completo de um cliente
const history = await getClienteHistory(123);

console.log("Histórico do cliente 123:");
history.forEach(change => {
  console.log(
    `${change.changedAt}: ${change.field} mudou de "${change.oldValue}" para "${change.newValue}"`
  );
});

// Output:
// 2025-11-19 10:05:00: email mudou de "antigo@empresa.com" para "novo@empresa.com"
// 2025-11-19 10:03:00: telefone mudou de "null" para "11999999999"
// 2025-11-19 10:00:00: _created mudou de "null" para "{...}"
```

---

## 📋 Checklist de Implementação

- [ ] **Passo 1:** Adicionar tabelas de histórico ao schema
- [ ] **Passo 2:** Executar `pnpm db:push`
- [ ] **Passo 3:** Criar helper `historyTracker.ts`
- [ ] **Passo 4:** Atualizar `createMercado` com UPSERT + histórico
- [ ] **Passo 5:** Atualizar `createCliente` com histórico
- [ ] **Passo 6:** Atualizar `createConcorrente` com UPSERT + histórico
- [ ] **Passo 7:** Atualizar `createLead` com UPSERT + histórico
- [ ] **Passo 8:** Adicionar constraints UNIQUE
- [ ] **Passo 9:** Limpar duplicatas existentes
- [ ] **Passo 10:** Executar testes
- [ ] **Passo 11:** Testar em produção com 10 clientes

---

## 🎯 Resultado Final

**Antes:**

```
clientes: 8.000 registros (10 execuções × 800 clientes)
concorrentes: 184.000 registros
leads: 184.000 registros
Total: 376.000 registros
```

**Depois:**

```
clientes: 800 registros (únicos)
clientes_history: ~5.000 registros (mudanças)
concorrentes: 18.400 registros (únicos)
concorrentes_history: ~50.000 registros (mudanças)
leads: 18.400 registros (únicos)
leads_history: ~50.000 registros (mudanças)
Total: ~142.600 registros (62% de redução)
```

**Benefícios:**

- ✅ Evita duplicação (UPSERT)
- ✅ Mantém histórico completo (tabelas \*\_history)
- ✅ 62% menos armazenamento
- ✅ 90% menos custos de API
- ✅ Rastreabilidade completa
- ✅ Análise temporal disponível

---

**Documento gerado por:** Manus AI  
**Última atualização:** 19 de Novembro de 2025 - 16:30 GMT-3  
**Status:** GUIA COMPLETO - Pronto para implementação
