import {
  eq,
  sql,
  and,
  or,
  like,
  count,
  desc,
  gte,
  lte,
  inArray,
  isNull,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getServerlessDb } from "./lib/drizzle-serverless";
import {
  InsertUser,
  users,
  projects,
  Project,
  InsertProject,
  pesquisas,
  Pesquisa,
  InsertPesquisa,
  mercadosUnicos,
  clientes,
  clientesMercados,
  concorrentes,
  leads,
  produtos,
  projectTemplates,
  ProjectTemplate,
  InsertProjectTemplate,
  notifications,
  Notification,
  InsertNotification,
  MercadoUnico,
  Cliente,
  Concorrente,
  Lead,
  activityLog,
  ActivityLog,
  InsertActivityLog,
  enrichmentConfigs,
  EnrichmentConfig,
  InsertEnrichmentConfig,
  projectAuditLog,
  ProjectAuditLog,
  InsertProjectAuditLog,
  hibernationWarnings,
  HibernationWarning,
  InsertHibernationWarning,
  notificationPreferences,
  reportSchedules,
  ReportSchedule,
  InsertReportSchedule,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { now, toPostgresTimestamp } from "./dateUtils";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  // Em ambiente serverless (Vercel), usar conexão otimizada
  if (process.env.VERCEL) {
    return getServerlessDb();
  }
  
  // Em ambiente tradicional (Railway/local), usar conexão normal
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================
// USER HELPERS
// ============================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: Partial<InsertUser> = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    // Campos opcionais do novo schema
    if (user.email !== undefined) {
      values.email = user.email;
      updateSet.email = user.email;
    }
    if (user.nome !== undefined) {
      values.nome = user.nome;
      updateSet.nome = user.nome;
    }
    if (user.empresa !== undefined) {
      values.empresa = user.empresa;
      updateSet.empresa = user.empresa;
    }
    if (user.cargo !== undefined) {
      values.cargo = user.cargo;
      updateSet.cargo = user.cargo;
    }
    if (user.setor !== undefined) {
      values.setor = user.setor;
      updateSet.setor = user.setor;
    }
    if (user.senhaHash !== undefined) {
      values.senhaHash = user.senhaHash;
      updateSet.senhaHash = user.senhaHash;
    }

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = "admin";
        values.role = "admin";
        updateSet.role = "admin";
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = now();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: string) {
  return getUser(id);
}

export async function updateUserLastSignIn(id: string, lastSignedIn: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }

  await db.update(users).set({ lastSignedIn }).where(eq(users.id, id));
}

// ============================================
// DASHBOARD HELPERS
// ============================================

export async function getDashboardStats(projectId?: number) {
  const db = await getDb();
  if (!db) return null;

  // Filtrar por projeto se especificado
  const mercadosQuery = projectId
    ? db
        .select({ count: count() })
        .from(mercadosUnicos)
        .where(eq(mercadosUnicos.projectId, projectId))
    : db.select({ count: count() }).from(mercadosUnicos);
  const [mercadosCount] = await mercadosQuery;

  const clientesQuery = projectId
    ? db
        .select({ count: count() })
        .from(clientes)
        .where(eq(clientes.projectId, projectId))
    : db.select({ count: count() }).from(clientes);
  const [clientesCount] = await clientesQuery;

  const concorrentesQuery = projectId
    ? db
        .select({ count: count() })
        .from(concorrentes)
        .where(eq(concorrentes.projectId, projectId))
    : db.select({ count: count() }).from(concorrentes);
  const [concorrentesCount] = await concorrentesQuery;

  const leadsQuery = projectId
    ? db
        .select({ count: count() })
        .from(leads)
        .where(eq(leads.projectId, projectId))
    : db.select({ count: count() }).from(leads);
  const [leadsCount] = await leadsQuery;

  // Contagem por status de validação
  const clientesStatusQuery = db
    .select({
      status: clientes.validationStatus,
      count: count(),
    })
    .from(clientes);
  if (projectId) {
    clientesStatusQuery.where(eq(clientes.projectId, projectId));
  }
  const clientesStatus = await clientesStatusQuery.groupBy(
    clientes.validationStatus
  );

  const concorrentesStatusQuery = db
    .select({
      status: concorrentes.validationStatus,
      count: count(),
    })
    .from(concorrentes);
  if (projectId) {
    concorrentesStatusQuery.where(eq(concorrentes.projectId, projectId));
  }
  const concorrentesStatus = await concorrentesStatusQuery.groupBy(
    concorrentes.validationStatus
  );

  const leadsStatusQuery = db
    .select({
      status: leads.validationStatus,
      count: count(),
    })
    .from(leads);
  if (projectId) {
    leadsStatusQuery.where(eq(leads.projectId, projectId));
  }
  const leadsStatus = await leadsStatusQuery.groupBy(leads.validationStatus);

  return {
    totals: {
      mercados: mercadosCount.count,
      clientes: clientesCount.count,
      concorrentes: concorrentesCount.count,
      leads: leadsCount.count,
    },
    validation: {
      clientes: clientesStatus,
      concorrentes: concorrentesStatus,
      leads: leadsStatus,
    },
  };
}

// ============================================
// MERCADO HELPERS
// ============================================

export async function getMercados(params?: {
  projectId?: number;
  pesquisaId?: number;
  search?: string;
  categoria?: string;
  segmentacao?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(mercadosUnicos);

  // Filtrar por pesquisa (prioridade) ou projeto
  const conditions = [];
  if (params?.pesquisaId) {
    conditions.push(eq(mercadosUnicos.pesquisaId, params.pesquisaId));
  } else if (params?.projectId) {
    conditions.push(eq(mercadosUnicos.projectId, params.projectId));
  }
  if (params?.search) {
    conditions.push(
      or(
        like(mercadosUnicos.nome, `%${params.search}%`),
        like(mercadosUnicos.categoria, `%${params.search}%`)
      )!
    );
  }
  if (params?.categoria) {
    conditions.push(like(mercadosUnicos.categoria, `%${params.categoria}%`));
  }
  if (params?.segmentacao) {
    conditions.push(eq(mercadosUnicos.segmentacao, params.segmentacao));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)!) as any;
  }

  if (params?.limit) {
    query = query.limit(params.limit) as any;
  }

  if (params?.offset) {
    query = query.offset(params.offset) as any;
  }

  return query;
}

export async function getMercadoById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(mercadosUnicos)
    .where(eq(mercadosUnicos.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// ============================================
// CLIENTE HELPERS
// ============================================

export async function getAllClientes(params?: {
  projectId?: number;
  pesquisaId?: number;
  validationStatus?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (params?.pesquisaId) {
    conditions.push(eq(clientes.pesquisaId, params.pesquisaId));
  } else if (params?.projectId) {
    conditions.push(eq(clientes.projectId, params.projectId));
  }
  if (params?.validationStatus) {
    conditions.push(
      eq(clientes.validationStatus, params.validationStatus as any)
    );
  }

  if (conditions.length > 0) {
    return await db
      .select()
      .from(clientes)
      .where(and(...conditions)!);
  }

  return await db.select().from(clientes);
}

export async function getClientesByMercado(
  mercadoId: number,
  validationStatus?: string
) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(clientesMercados.mercadoId, mercadoId)];

  if (validationStatus) {
    conditions.push(eq(clientes.validationStatus, validationStatus as any));
  }

  return db
    .select({
      id: clientes.id,
      nome: clientes.nome,
      cnpj: clientes.cnpj,
      siteOficial: clientes.siteOficial,
      produtoPrincipal: clientes.produtoPrincipal,
      segmentacaoB2BB2C: clientes.segmentacaoB2BB2C,
      email: clientes.email,
      telefone: clientes.telefone,
      cidade: clientes.cidade,
      uf: clientes.uf,
      validationStatus: clientes.validationStatus,
      validationNotes: clientes.validationNotes,
      validatedAt: clientes.validatedAt,
    })
    .from(clientes)
    .innerJoin(clientesMercados, eq(clientes.id, clientesMercados.clienteId))
    .where(and(...conditions));
}

export async function getClientesByMercadoPaginated(
  mercadoId: number,
  validationStatus?: string,
  page: number = 1,
  pageSize: number = 20
) {
  const db = await getDb();
  if (!db) return { data: [], total: 0, page, pageSize, totalPages: 0 };

  const conditions = [eq(clientesMercados.mercadoId, mercadoId)];

  if (validationStatus) {
    conditions.push(eq(clientes.validationStatus, validationStatus as any));
  }

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(clientes)
    .innerJoin(clientesMercados, eq(clientes.id, clientesMercados.clienteId))
    .where(and(...conditions));

  const total = Number(countResult[0]?.count || 0);
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;

  // Get paginated data
  const data = await db
    .select({
      id: clientes.id,
      nome: clientes.nome,
      cnpj: clientes.cnpj,
      siteOficial: clientes.siteOficial,
      produtoPrincipal: clientes.produtoPrincipal,
      segmentacaoB2BB2C: clientes.segmentacaoB2BB2C,
      email: clientes.email,
      telefone: clientes.telefone,
      cidade: clientes.cidade,
      uf: clientes.uf,
      validationStatus: clientes.validationStatus,
      validationNotes: clientes.validationNotes,
      validatedAt: clientes.validatedAt,
    })
    .from(clientes)
    .innerJoin(clientesMercados, eq(clientes.id, clientesMercados.clienteId))
    .where(and(...conditions))
    .limit(pageSize)
    .offset(offset);

  return { data, total, page, pageSize, totalPages };
}

export async function updateClienteValidation(
  id: number,
  status: string,
  notes?: string,
  userId?: string
) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(clientes)
    .set({
      validationStatus: status as any,
      validationNotes: notes,
      validatedBy: userId,
      validatedAt: now(),
    })
    .where(eq(clientes.id, id));

  return { success: true };
}

// ============================================
// CONCORRENTE HELPERS
// ============================================

export async function getAllConcorrentes(params?: {
  projectId?: number;
  pesquisaId?: number;
  validationStatus?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (params?.pesquisaId) {
    conditions.push(eq(concorrentes.pesquisaId, params.pesquisaId));
  } else if (params?.projectId) {
    conditions.push(eq(concorrentes.projectId, params.projectId));
  }
  if (params?.validationStatus) {
    conditions.push(
      eq(concorrentes.validationStatus, params.validationStatus as any)
    );
  }

  if (conditions.length > 0) {
    return await db
      .select()
      .from(concorrentes)
      .where(and(...conditions)!);
  }

  return await db.select().from(concorrentes);
}

export async function getConcorrentesByMercado(
  mercadoId: number,
  validationStatus?: string
) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(concorrentes.mercadoId, mercadoId)];

  if (validationStatus) {
    conditions.push(eq(concorrentes.validationStatus, validationStatus as any));
  }

  return db
    .select()
    .from(concorrentes)
    .where(and(...conditions));
}

export async function getConcorrentesByMercadoPaginated(
  mercadoId: number,
  validationStatus?: string,
  page: number = 1,
  pageSize: number = 20
) {
  const db = await getDb();
  if (!db) return { data: [], total: 0, page, pageSize, totalPages: 0 };

  const conditions = [eq(concorrentes.mercadoId, mercadoId)];

  if (validationStatus) {
    conditions.push(eq(concorrentes.validationStatus, validationStatus as any));
  }

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(concorrentes)
    .where(and(...conditions));

  const total = Number(countResult[0]?.count || 0);
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;

  // Get paginated data
  const data = await db
    .select()
    .from(concorrentes)
    .where(and(...conditions))
    .limit(pageSize)
    .offset(offset);

  return { data, total, page, pageSize, totalPages };
}

export async function updateConcorrenteValidation(
  id: number,
  status: string,
  notes?: string,
  userId?: string
) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(concorrentes)
    .set({
      validationStatus: status as any,
      validationNotes: notes,
      validatedBy: userId,
      validatedAt: now(),
    })
    .where(eq(concorrentes.id, id));

  return { success: true };
}

// ============================================
// LEAD HELPERS
// ============================================

export async function getAllLeads(params?: {
  projectId?: number;
  pesquisaId?: number;
  validationStatus?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (params?.pesquisaId) {
    conditions.push(eq(leads.pesquisaId, params.pesquisaId));
  } else if (params?.projectId) {
    conditions.push(eq(leads.projectId, params.projectId));
  }
  if (params?.validationStatus) {
    conditions.push(eq(leads.validationStatus, params.validationStatus as any));
  }

  if (conditions.length > 0) {
    return await db
      .select()
      .from(leads)
      .where(and(...conditions)!);
  }

  return await db.select().from(leads);
}

export async function getLeadsByMercado(
  mercadoId: number,
  validationStatus?: string
) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(leads.mercadoId, mercadoId)];

  if (validationStatus) {
    conditions.push(eq(leads.validationStatus, validationStatus as any));
  }

  return db
    .select()
    .from(leads)
    .where(and(...conditions));
}

export async function getLeadsByMercadoPaginated(
  mercadoId: number,
  validationStatus?: string,
  page: number = 1,
  pageSize: number = 20
) {
  const db = await getDb();
  if (!db) return { data: [], total: 0, page, pageSize, totalPages: 0 };

  const conditions = [eq(leads.mercadoId, mercadoId)];

  if (validationStatus) {
    conditions.push(eq(leads.validationStatus, validationStatus as any));
  }

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(leads)
    .where(and(...conditions));

  const total = Number(countResult[0]?.count || 0);
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;

  // Get paginated data
  const data = await db
    .select()
    .from(leads)
    .where(and(...conditions))
    .limit(pageSize)
    .offset(offset);

  return { data, total, page, pageSize, totalPages };
}

export async function updateLeadValidation(
  id: number,
  status: string,
  notes?: string,
  userId?: string
) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(leads)
    .set({
      validationStatus: status as any,
      validationNotes: notes,
      validatedBy: userId,
      validatedAt: now(),
    })
    .where(eq(leads.id, id));

  return { success: true };
}

// ============================================
// ANALYTICS HELPERS
// ============================================

export async function getAnalyticsProgress() {
  const db = await getDb();
  if (!db) {
    return {
      totalMercados: 0,
      totalClientes: 0,
      totalConcorrentes: 0,
      totalLeads: 0,
      validados: 0,
      pendentes: 0,
      invalidados: 0,
      progressoPorMercado: [],
      statusDistribution: {
        validado: 0,
        pendente: 0,
        invalidado: 0,
      },
    };
  }

  try {
    // Contar totais
    const [mercadosCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(mercadosUnicos);
    const [clientesCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(clientes);
    const [concorrentesCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(concorrentes);
    const [leadsCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(leads);

    // Contar por status (clientes + concorrentes + leads)
    const [clientesRich] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(clientes)
      .where(eq(clientes.validationStatus, "rich"));

    const [clientesPendentes] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(clientes)
      .where(eq(clientes.validationStatus, "pending"));

    const [clientesDiscarded] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(clientes)
      .where(eq(clientes.validationStatus, "discarded"));

    const [concorrentesRich] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(concorrentes)
      .where(eq(concorrentes.validationStatus, "rich"));

    const [concorrentesPendentes] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(concorrentes)
      .where(eq(concorrentes.validationStatus, "pending"));

    const [concorrentesDiscarded] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(concorrentes)
      .where(eq(concorrentes.validationStatus, "discarded"));

    const [leadsRich] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(leads)
      .where(eq(leads.validationStatus, "rich"));

    const [leadsPendentes] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(leads)
      .where(eq(leads.validationStatus, "pending"));

    const [leadsDiscarded] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(leads)
      .where(eq(leads.validationStatus, "discarded"));

    const totalRich =
      (clientesRich?.count || 0) +
      (concorrentesRich?.count || 0) +
      (leadsRich?.count || 0);

    const totalPendentes =
      (clientesPendentes?.count || 0) +
      (concorrentesPendentes?.count || 0) +
      (leadsPendentes?.count || 0);

    const totalDiscarded =
      (clientesDiscarded?.count || 0) +
      (concorrentesDiscarded?.count || 0) +
      (leadsDiscarded?.count || 0);

    // Progresso por mercado (top 10)
    const progressoPorMercado = await db
      .select({
        mercadoNome: mercadosUnicos.nome,
        total: sql<number>`COUNT(DISTINCT ${clientes.id})`,
        validados: sql<number>`SUM(CASE WHEN ${clientes.validationStatus} = 'validado' THEN 1 ELSE 0 END)`,
      })
      .from(mercadosUnicos)
      .leftJoin(
        clientesMercados,
        eq(mercadosUnicos.id, clientesMercados.mercadoId)
      )
      .leftJoin(clientes, eq(clientesMercados.clienteId, clientes.id))
      .groupBy(mercadosUnicos.id, mercadosUnicos.nome)
      .orderBy(sql`COUNT(DISTINCT ${clientes.id}) DESC`)
      .limit(10);

    return {
      totalMercados: mercadosCount?.count || 0,
      totalClientes: clientesCount?.count || 0,
      totalConcorrentes: concorrentesCount?.count || 0,
      totalLeads: leadsCount?.count || 0,
      rich: totalRich,
      pending: totalPendentes,
      discarded: totalDiscarded,
      progressoPorMercado: progressoPorMercado.map(p => ({
        mercado: p.mercadoNome,
        total: Number(p.total),
        validados: Number(p.validados),
        percentual:
          Number(p.total) > 0
            ? Math.round((Number(p.validados) / Number(p.total)) * 100)
            : 0,
      })),
      statusDistribution: {
        rich: totalRich,
        pending: totalPendentes,
        discarded: totalDiscarded,
        needs_adjustment: 0, // TODO: implementar contagem
      },
    };
  } catch (error) {
    console.error("[Database] Failed to get analytics progress:", error);
    throw error;
  }
}

// ============================================
// TAG HELPERS
// ============================================

export async function getAllTags() {
  const db = await getDb();
  if (!db) return [];

  const { tags } = await import("../drizzle/schema");
  return await db.select().from(tags);
}

export async function createTag(name: string, color: string = "#3b82f6") {
  const db = await getDb();
  if (!db) return null;

  const { tags } = await import("../drizzle/schema");
  await db.insert(tags).values({ name, color });

  // Get the last inserted tag
  const inserted = await db
    .select()
    .from(tags)
    .orderBy(sql`id DESC`)
    .limit(1);
  return inserted[0] || null;
}

export async function deleteTag(tagId: number) {
  const db = await getDb();
  if (!db) return null;

  const { tags } = await import("../drizzle/schema");
  await db.delete(tags).where(eq(tags.id, tagId));
  return { success: true };
}

export async function getEntityTags(entityType: string, entityId: number) {
  const db = await getDb();
  if (!db) return [];

  const { entityTags, tags } = await import("../drizzle/schema");

  const results = await db
    .select({
      id: entityTags.id,
      tagId: tags.id,
      name: tags.name,
      color: tags.color,
    })
    .from(entityTags)
    .innerJoin(tags, eq(entityTags.tagId, tags.id))
    .where(
      and(
        eq(entityTags.entityType, entityType as any),
        eq(entityTags.entityId, entityId)
      )
    );

  return results;
}

export async function addTagToEntity(
  tagId: number,
  entityType: string,
  entityId: number
) {
  const db = await getDb();
  if (!db) return null;

  const { entityTags } = await import("../drizzle/schema");

  // Check if already exists
  const existing = await db
    .select()
    .from(entityTags)
    .where(
      and(
        eq(entityTags.tagId, tagId),
        eq(entityTags.entityType, entityType as any),
        eq(entityTags.entityId, entityId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return { success: true, alreadyExists: true };
  }

  await db.insert(entityTags).values({
    tagId,
    entityType: entityType as any,
    entityId,
  });

  return { success: true, alreadyExists: false };
}

export async function removeTagFromEntity(
  tagId: number,
  entityType: string,
  entityId: number
) {
  const db = await getDb();
  if (!db) return null;

  const { entityTags } = await import("../drizzle/schema");

  await db
    .delete(entityTags)
    .where(
      and(
        eq(entityTags.tagId, tagId),
        eq(entityTags.entityType, entityType as any),
        eq(entityTags.entityId, entityId)
      )
    );

  return { success: true };
}

export async function getEntitiesByTag(tagId: number, entityType: string) {
  const db = await getDb();
  if (!db) return [];

  const { entityTags } = await import("../drizzle/schema");

  const results = await db
    .select()
    .from(entityTags)
    .where(
      and(
        eq(entityTags.tagId, tagId),
        eq(entityTags.entityType, entityType as any)
      )
    );

  return results.map(r => r.entityId);
}

// ============================================
// Saved Filters Functions
// ============================================

export async function getSavedFilters(userId: string) {
  const db = await getDb();
  if (!db) return [];

  const { savedFilters } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  return await db
    .select()
    .from(savedFilters)
    .where(eq(savedFilters.userId, userId));
}

export async function createSavedFilter(data: {
  userId: string;
  name: string;
  filtersJson: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { savedFilters } = await import("../drizzle/schema");

  await db.insert(savedFilters).values(data);
}

export async function deleteSavedFilter(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { savedFilters } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  await db.delete(savedFilters).where(eq(savedFilters.id, id));
}

// ============================================
// Dashboard Analytics Functions
// ============================================

export async function getDistribuicaoGeografica() {
  const db = await getDb();
  if (!db) return [];

  const { clientes } = await import("../drizzle/schema");
  const { sql } = await import("drizzle-orm");

  const result = await db
    .select({
      uf: clientes.uf,
      count: sql<number>`count(*)`.as("count"),
    })
    .from(clientes)
    .where(sql`${clientes.uf} IS NOT NULL AND ${clientes.uf} != ''`)
    .groupBy(clientes.uf)
    .orderBy(sql`count DESC`);

  return result;
}

export async function getDistribuicaoSegmentacao() {
  const db = await getDb();
  if (!db) return [];

  const { clientes } = await import("../drizzle/schema");
  const { sql } = await import("drizzle-orm");

  const result = await db
    .select({
      segmentacao: clientes.segmentacaoB2BB2C,
      count: sql<number>`count(*)`.as("count"),
    })
    .from(clientes)
    .where(sql`${clientes.segmentacaoB2BB2C} IS NOT NULL`)
    .groupBy(clientes.segmentacaoB2BB2C);

  return result;
}

export async function getTimelineValidacoes(days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  const { clientes } = await import("../drizzle/schema");
  const { sql } = await import("drizzle-orm");

  const result = await db
    .select({
      date: sql<string>`${clientes.validatedAt}::date`.as("date"),
      count: sql<number>`count(*)`.as("count"),
    })
    .from(clientes)
    .where(
      sql`${clientes.validatedAt} >= CURRENT_TIMESTAMP - INTERVAL '1 day' * ${days}`
    )
    .groupBy(sql`date`)
    .orderBy(sql`date ASC`);

  return result;
}

export async function getFunilConversao() {
  const db = await getDb();
  if (!db) return { leads: 0, clientes: 0, validados: 0 };

  const { leads, clientes } = await import("../drizzle/schema");
  const { sql, count } = await import("drizzle-orm");

  const [leadsCount] = await db.select({ value: count() }).from(leads);
  const [clientesCount] = await db.select({ value: count() }).from(clientes);
  const [validadosCount] = await db
    .select({ value: count() })
    .from(clientes)
    .where(sql`${clientes.validationStatus} = 'rich'`);

  return {
    leads: leadsCount.value,
    clientes: clientesCount.value,
    validados: validadosCount.value,
  };
}

export async function getTop10Mercados() {
  const db = await getDb();
  if (!db) return [];

  const { mercadosUnicos } = await import("../drizzle/schema");
  const { desc } = await import("drizzle-orm");

  const result = await db
    .select({
      nome: mercadosUnicos.nome,
      quantidadeClientes: mercadosUnicos.quantidadeClientes,
    })
    .from(mercadosUnicos)
    .orderBy(desc(mercadosUnicos.quantidadeClientes))
    .limit(10);

  return result;
}

// ========== Kanban Functions ==========

export async function updateLeadStage(
  leadId: number,
  stage: "novo" | "em_contato" | "negociacao" | "fechado" | "perdido"
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update lead stage: database not available");
    return;
  }

  await db
    .update(leads)
    .set({
      stage,
      stageUpdatedAt: now(),
    })
    .where(eq(leads.id, leadId));
}

export async function getLeadsByStage(mercadoId: number) {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot get leads by stage: database not available"
    );
    return [];
  }

  const result = await db
    .select()
    .from(leads)
    .where(eq(leads.mercadoId, mercadoId));

  return result;
}

// ============================================
// PROJECT HELPERS
// ============================================

export async function getProjects(): Promise<Project[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.ativo, 1))
      .orderBy(projects.id);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get projects:", error);
    return [];
  }
}

export async function getProjectById(id: number): Promise<Project | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to get project:", error);
    return undefined;
  }
}

export async function createProject(
  data: InsertProject,
  userId?: string | null
): Promise<Project | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(projects).values(data);
    const insertId = Number(result[0].insertId);
    const project = (await getProjectById(insertId)) || null;

    // Log de auditoria
    if (project) {
      await logProjectChange(insertId, userId || null, "created", undefined, {
        nome: data.nome,
        descricao: data.descricao,
        cor: data.cor,
      });
    }

    return project;
  } catch (error) {
    console.error("[Database] Failed to create project:", error);
    return null;
  }
}

export async function updateProject(
  id: number,
  data: Partial<InsertProject>,
  userId?: string | null
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Buscar dados antigos para comparação
    const oldProject = await getProjectById(id);

    await db
      .update(projects)
      .set({ ...data, updatedAt: now() })
      .where(eq(projects.id, id));

    // Log de auditoria com comparação
    if (oldProject) {
      const changes: Record<string, { before: unknown; after: unknown }> = {};

      if (data.nome !== undefined && data.nome !== oldProject.nome) {
        changes.nome = { before: oldProject.nome, after: data.nome };
      }
      if (
        data.descricao !== undefined &&
        data.descricao !== oldProject.descricao
      ) {
        changes.descricao = {
          before: oldProject.descricao,
          after: data.descricao,
        };
      }
      if (data.cor !== undefined && data.cor !== oldProject.cor) {
        changes.cor = { before: oldProject.cor, after: data.cor };
      }

      if (Object.keys(changes).length > 0) {
        await logProjectChange(id, userId || null, "updated", changes);
      }
    }

    return true;
  } catch (error) {
    console.error("[Database] Failed to update project:", error);
    return false;
  }
}

export async function deleteProject(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Soft delete - apenas marca como inativo
    await db
      .update(projects)
      .set({ ativo: 0, updatedAt: now() })
      .where(eq(projects.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete project:", error);
    return false;
  }
}

/**
 * Verifica se um projeto pode ser deletado (está vazio/não enriquecido)
 * Fase 56.2 - Função de Deletar Projetos Não Enriquecidos
 */
export async function canDeleteProject(
  projectId: number
): Promise<{ canDelete: boolean; reason?: string; stats?: unknown }> {
  const db = await getDb();
  if (!db) return { canDelete: false, reason: "Database not available" };

  try {
    // Contar pesquisas do projeto
    const pesquisasCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(pesquisas)
      .where(eq(pesquisas.projectId, projectId));

    const totalPesquisas = Number(pesquisasCount[0]?.count || 0);

    // Contar clientes do projeto
    const clientesCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(clientes)
      .where(eq(clientes.projectId, projectId));

    const totalClientes = Number(clientesCount[0]?.count || 0);

    // Contar mercados do projeto
    const mercadosCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(mercadosUnicos)
      .where(eq(mercadosUnicos.projectId, projectId));

    const totalMercados = Number(mercadosCount[0]?.count || 0);

    const stats = {
      pesquisas: totalPesquisas,
      clientes: totalClientes,
      mercados: totalMercados,
    };

    // Projeto pode ser deletado se não tiver nenhum dado
    const isEmpty =
      totalPesquisas === 0 && totalClientes === 0 && totalMercados === 0;

    if (!isEmpty) {
      return {
        canDelete: false,
        reason: "Projeto contém dados (pesquisas, clientes ou mercados)",
        stats,
      };
    }

    return { canDelete: true, stats };
  } catch (error) {
    console.error(
      "[Database] Failed to check if project can be deleted:",
      error
    );
    return { canDelete: false, reason: "Erro ao verificar projeto" };
  }
}

/**
 * Deleta permanentemente um projeto vazio (hard delete)
 * Fase 56.2 - Função de Deletar Projetos Não Enriquecidos
 */
export async function deleteEmptyProject(
  projectId: number,
  userId?: string | null
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    // Verificar se pode deletar
    const check = await canDeleteProject(projectId);
    if (!check.canDelete) {
      return {
        success: false,
        error: check.reason || "Projeto não pode ser deletado",
      };
    }

    // Buscar dados do projeto antes de deletar
    const project = await getProjectById(projectId);

    // Hard delete do projeto
    await db.delete(projects).where(eq(projects.id, projectId));

    // Log de auditoria
    if (project) {
      await logProjectChange(projectId, userId || null, "deleted", undefined, {
        nome: project.nome,
        descricao: project.descricao,
        reason: "empty_project",
      });
    }

    console.log(`[Database] Project ${projectId} deleted successfully`);
    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to delete empty project:", error);
    return { success: false, error: "Erro ao deletar projeto" };
  }
}

/**
 * Hiberna um projeto (coloca em modo somente leitura)
 * Fase 57: Sistema de Hibernação de Projetos
 */
export async function hibernateProject(
  projectId: number,
  userId?: string | null
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    // Verificar se projeto existe e está ativo
    const project = await getProjectById(projectId);
    if (!project) {
      return { success: false, error: "Projeto não encontrado" };
    }

    if (project.status === "hibernated") {
      return { success: false, error: "Projeto já está adormecido" };
    }

    // Atualizar status para hibernated
    await db
      .update(projects)
      .set({ status: "hibernated", updatedAt: now() })
      .where(eq(projects.id, projectId));

    // Log de auditoria
    await logProjectChange(projectId, userId || null, "hibernated", {
      status: { before: "active", after: "hibernated" },
    });

    console.log(`[Database] Project ${projectId} hibernated successfully`);
    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to hibernate project:", error);
    return { success: false, error: "Erro ao adormecer projeto" };
  }
}

/**
 * Reativa um projeto adormecido
 * Fase 57: Sistema de Hibernação de Projetos
 */
export async function reactivateProject(
  projectId: number,
  userId?: string | null
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    // Verificar se projeto existe e está hibernado
    const project = await getProjectById(projectId);
    if (!project) {
      return { success: false, error: "Projeto não encontrado" };
    }

    if (project.status === "active") {
      return { success: false, error: "Projeto já está ativo" };
    }

    // Atualizar status para active
    await db
      .update(projects)
      .set({ status: "active", updatedAt: now() })
      .where(eq(projects.id, projectId));

    // Log de auditoria
    await logProjectChange(projectId, userId || null, "reactivated", {
      status: { before: "hibernated", after: "active" },
    });

    console.log(`[Database] Project ${projectId} reactivated successfully`);
    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to reactivate project:", error);
    return { success: false, error: "Erro ao reativar projeto" };
  }
}

/**
 * Verifica se um projeto está adormecido
 * Fase 57: Sistema de Hibernação de Projetos
 */
export async function isProjectHibernated(projectId: number): Promise<boolean> {
  const project = await getProjectById(projectId);
  return project?.status === "hibernated";
}

/**
 * Atualiza o timestamp de última atividade do projeto
 * Fase 58.1: Arquivamento Automático por Inatividade
 */
export async function updateProjectActivity(projectId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(projects)
    .set({ lastActivityAt: now() })
    .where(eq(projects.id, projectId));
}

/**
 * Busca projetos inativos (sem atividade há X dias)
 * Fase 58.1: Arquivamento Automático por Inatividade
 */
export async function getInactiveProjects(
  inactiveDays: number
): Promise<Project[]> {
  const db = await getDb();
  if (!db) return [];

  const cutoffDateObj = new Date();
  cutoffDateObj.setDate(cutoffDateObj.getDate() - inactiveDays);
  const cutoffDate = toPostgresTimestamp(cutoffDateObj);

  const result = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.ativo, 1),
        eq(projects.status, "active"),
        sql`${projects.lastActivityAt} < ${cutoffDate}`
      )!
    );

  return result;
}

/**
 * Registra uma mudança no log de auditoria de projetos
 * Fase 58.2: Histórico de Mudanças e Log de Auditoria
 */
export async function logProjectChange(
  projectId: number,
  userId: string | null,
  action: "created" | "updated" | "hibernated" | "reactivated" | "deleted",
  changes?: Record<string, { before: unknown; after: unknown }>,
  metadata?: Record<string, any>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(projectAuditLog).values({
    projectId,
    userId: userId || null,
    action,
    changes: changes ? JSON.stringify(changes) : null,
    metadata: metadata ? JSON.stringify(metadata) : null,
  });
}

/**
 * Busca o histórico de auditoria de um projeto
 * Fase 58.2: Histórico de Mudanças e Log de Auditoria
 */
export async function getProjectAuditLog(
  projectId: number,
  options?: {
    action?: "created" | "updated" | "hibernated" | "reactivated" | "deleted";
    limit?: number;
    offset?: number;
  }
): Promise<{ logs: ProjectAuditLog[]; total: number }> {
  const db = await getDb();
  if (!db) return { logs: [], total: 0 };

  // Construir condições de filtro
  const conditions = [eq(projectAuditLog.projectId, projectId)];

  if (options?.action) {
    conditions.push(eq(projectAuditLog.action, options.action));
  }

  const whereClause =
    conditions.length > 1 ? and(...conditions)! : conditions[0];

  let query = db.select().from(projectAuditLog).where(whereClause);

  // Contar total
  const countQuery = db
    .select({ count: count() })
    .from(projectAuditLog)
    .where(eq(projectAuditLog.projectId, projectId));

  const [{ count: total }] = (await countQuery) as any;

  // Aplicar ordenação e paginação
  query = query.orderBy(desc(projectAuditLog.createdAt)) as any;

  if (options?.limit) {
    query = query.limit(options.limit) as any;
  }

  if (options?.offset) {
    query = query.offset(options.offset) as any;
  }

  const logs = await query;

  // Parsear JSON de changes e metadata
  const parsedLogs = logs.map(log => ({
    ...log,
    changes: log.changes
      ? typeof log.changes === "string"
        ? JSON.parse(log.changes)
        : log.changes
      : null,
    metadata: log.metadata
      ? typeof log.metadata === "string"
        ? JSON.parse(log.metadata)
        : log.metadata
      : null,
  }));

  return { logs: parsedLogs, total: Number(total) };
}

/**
 * Duplica um projeto (copia estrutura sem dados)
 * Fase 58.3: Duplicação de Projetos
 */
export async function duplicateProject(
  projectId: number,
  newName: string,
  options?: {
    copyMarkets?: boolean;
  }
): Promise<{ success: boolean; newProjectId?: number; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    // Buscar projeto original
    const originalProject = await getProjectById(projectId);
    if (!originalProject) {
      return { success: false, error: "Projeto não encontrado" };
    }

    // Criar novo projeto
    const [result] = await db.insert(projects).values({
      nome: newName,
      descricao: originalProject.descricao,
      cor: originalProject.cor,
      ativo: 1,
      status: "active",
      lastActivityAt: now(),
    });

    const newProjectId = Number(result.insertId);

    // Copiar mercados únicos se solicitado
    if (options?.copyMarkets) {
      const markets = await db
        .select()
        .from(mercadosUnicos)
        .where(eq(mercadosUnicos.projectId, projectId));

      for (const market of markets) {
        await db.insert(mercadosUnicos).values({
          projectId: newProjectId,
          pesquisaId: null, // Não copiar pesquisaId
          mercadoHash: market.mercadoHash,
          nome: market.nome,
          segmentacao: market.segmentacao,
          categoria: market.categoria,
          tamanhoMercado: market.tamanhoMercado,
          crescimentoAnual: market.crescimentoAnual,
          tendencias: market.tendencias,
          principaisPlayers: market.principaisPlayers,
          quantidadeClientes: 0, // Resetar contador
        });
      }
    }

    return { success: true, newProjectId };
  } catch (error: unknown) {
    console.error("[Database] Failed to duplicate project:", error);
    return { success: false, error: error.message };
  }
}

// ============================================
// PESQUISA HELPERS
// ============================================

export async function getPesquisas(projectId?: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    let query = db.select().from(pesquisas);

    const conditions = [eq(pesquisas.ativo, 1)];
    if (projectId) {
      conditions.push(eq(pesquisas.projectId, projectId));
    }

    const result = await query
      .where(and(...conditions)!)
      .orderBy(pesquisas.nome);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get pesquisas:", error);
    return [];
  }
}

export async function getPesquisaById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db
      .select()
      .from(pesquisas)
      .where(eq(pesquisas.id, id))
      .limit(1);
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to get pesquisa:", error);
    return undefined;
  }
}

export async function getPesquisasByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select()
      .from(pesquisas)
      .where(and(eq(pesquisas.projectId, projectId), eq(pesquisas.ativo, 1)))
      .orderBy(pesquisas.dataImportacao);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get pesquisas by project:", error);
    return [];
  }
}

export async function deletePesquisa(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Soft delete: marca como inativo
    await db.update(pesquisas).set({ ativo: 0 }).where(eq(pesquisas.id, id));

    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to delete pesquisa:", error);
    throw error;
  }
}

export async function createPesquisa(data: {
  projectId: number;
  nome: string;
  descricao?: string | null;
  totalClientes?: number;
  status?: "importado" | "enriquecendo" | "em_andamento" | "concluido" | "erro";
  qtdConcorrentesPorMercado?: number;
  qtdLeadsPorMercado?: number;
  qtdProdutosPorCliente?: number;
}): Promise<Pesquisa | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const [result] = await db.insert(pesquisas).values({
      projectId: data.projectId,
      nome: data.nome,
      descricao: data.descricao || null,
      totalClientes: data.totalClientes || 0,
      status: data.status || "importado",
      qtdConcorrentesPorMercado: data.qtdConcorrentesPorMercado || 5,
      qtdLeadsPorMercado: data.qtdLeadsPorMercado || 10,
      qtdProdutosPorCliente: data.qtdProdutosPorCliente || 3,
    });

    if (!result.insertId) return null;

    const pesquisa = await getPesquisaById(Number(result.insertId));
    console.log(`[Pesquisa] Criada: ${data.nome} (ID: ${result.insertId})`);
    return pesquisa || null;
  } catch (error) {
    console.error("[Database] Failed to create pesquisa:", error);
    return null;
  }
}

export async function updatePesquisaStatus(
  pesquisaId: number,
  status: "importado" | "enriquecendo" | "em_andamento" | "concluido" | "erro"
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db
      .update(pesquisas)
      .set({ status, updatedAt: now() })
      .where(eq(pesquisas.id, pesquisaId));
    console.log(`[Pesquisa] Status atualizado: ${pesquisaId} -> ${status}`);
  } catch (error) {
    console.error("[Database] Failed to update pesquisa status:", error);
  }
}

export async function getDashboardStatsByPesquisa(pesquisaId: number) {
  const db = await getDb();
  if (!db) return null;

  const mercadosQuery = db
    .select({ count: count() })
    .from(mercadosUnicos)
    .where(eq(mercadosUnicos.pesquisaId, pesquisaId));
  const [mercadosCount] = await mercadosQuery;

  const clientesQuery = db
    .select({ count: count() })
    .from(clientes)
    .where(eq(clientes.pesquisaId, pesquisaId));
  const [clientesCount] = await clientesQuery;

  const concorrentesQuery = db
    .select({ count: count() })
    .from(concorrentes)
    .where(eq(concorrentes.pesquisaId, pesquisaId));
  const [concorrentesCount] = await concorrentesQuery;

  const leadsQuery = db
    .select({ count: count() })
    .from(leads)
    .where(eq(leads.pesquisaId, pesquisaId));
  const [leadsCount] = await leadsQuery;

  return {
    totals: {
      mercados: mercadosCount.count,
      clientes: clientesCount.count,
      concorrentes: concorrentesCount.count,
      leads: leadsCount.count,
    },
  };
}

// ============================================
// CRUD - MERCADOS
// ============================================

export async function createMercado(data: {
  projectId: number;
  pesquisaId?: number | null;
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

  // Hash sem timestamp para garantir unicidade
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
    pesquisaId: data.pesquisaId || null,
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
  if (!mercado) return null;

  // Registrar criação no histórico
  const { trackCreation } = await import("./_core/historyTracker");
  await trackCreation("mercado", mercado.id, data);

  console.log(`[Mercado] Criado: ${data.nome}`);
  return mercado;
}

export async function updateMercado(
  id: number,
  data: {
    nome?: string;
    categoria?: string;
    segmentacao?: string;
    tamanhoMercado?: string;
    crescimentoAnual?: string;
    tendencias?: string;
    principaisPlayers?: string;
  }
) {
  const db = await getDb();
  if (!db) return null;

  const updateData: Record<string, unknown> = {};
  if (data.nome !== undefined) updateData.nome = data.nome;
  if (data.categoria !== undefined) updateData.categoria = data.categoria;
  if (data.segmentacao !== undefined) updateData.segmentacao = data.segmentacao;
  if (data.tamanhoMercado !== undefined)
    updateData.tamanhoMercado = data.tamanhoMercado;
  if (data.crescimentoAnual !== undefined)
    updateData.crescimentoAnual = data.crescimentoAnual;
  if (data.tendencias !== undefined) updateData.tendencias = data.tendencias;
  if (data.principaisPlayers !== undefined)
    updateData.principaisPlayers = data.principaisPlayers;

  await db
    .update(mercadosUnicos)
    .set(updateData)
    .where(eq(mercadosUnicos.id, id));

  return await getMercadoById(id);
}

export async function deleteMercado(id: number) {
  const db = await getDb();
  if (!db) return false;

  // Delete associated records first (cascade)
  await db.delete(clientesMercados).where(eq(clientesMercados.mercadoId, id));
  await db.delete(concorrentes).where(eq(concorrentes.mercadoId, id));
  await db.delete(leads).where(eq(leads.mercadoId, id));

  // Delete the mercado itself
  await db.delete(mercadosUnicos).where(eq(mercadosUnicos.id, id));

  return true;
}

// ============================================
// CRUD - CLIENTES
// ============================================

export async function createCliente(data: {
  projectId: number;
  pesquisaId?: number | null;
  nome: string;
  cnpj?: string | null;
  siteOficial?: string | null;
  produtoPrincipal?: string | null;
  segmentacaoB2BB2C?: "B2B" | "B2C" | "B2B2C" | null;
  email?: string | null;
  telefone?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  cidade?: string | null;
  uf?: string | null;
  cnae?: string | null;
  porte?: "MEI" | "Pequena" | "Média" | "Grande" | null;
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

  // Hash sem timestamp (usar apenas nome-projectId se não tiver CNPJ)
  const clienteHash = data.cnpj
    ? `${data.nome}-${data.cnpj}-${data.projectId}`
    : `${data.nome}-${data.projectId}`;

  const normalizedHash = clienteHash
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // Verificar se já existe um cliente com esse hash
  const existing = await db
    .select()
    .from(clientes)
    .where(
      and(
        eq(clientes.clienteHash, normalizedHash),
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
    await trackClienteChanges(existing[0].id, changes, "enriched");

    // Atualizar cliente existente
    if (changes.length > 0) {
      await db
        .update(clientes)
        .set({
          nome: data.nome,
          cnpj: data.cnpj || existing[0].cnpj,
          siteOficial: data.siteOficial || existing[0].siteOficial,
          produtoPrincipal:
            data.produtoPrincipal || existing[0].produtoPrincipal,
          segmentacaoB2BB2C:
            data.segmentacaoB2BB2C || existing[0].segmentacaoB2BB2C,
          email: data.email || existing[0].email,
          telefone: data.telefone || existing[0].telefone,
          linkedin: data.linkedin || existing[0].linkedin,
          instagram: data.instagram || existing[0].instagram,
          cidade: data.cidade || existing[0].cidade,
          uf: data.uf || existing[0].uf,
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
    pesquisaId: data.pesquisaId || null,
    clienteHash: normalizedHash,
    nome: data.nome,
    cnpj: data.cnpj || null,
    siteOficial: data.siteOficial || null,
    produtoPrincipal: data.produtoPrincipal || null,
    segmentacaoB2BB2C: data.segmentacaoB2BB2C || null,
    email: data.email || null,
    telefone: data.telefone || null,
    linkedin: data.linkedin || null,
    instagram: data.instagram || null,
    cidade: data.cidade || null,
    uf: data.uf || null,
    cnae: data.cnae || null,
    porte: data.porte || null,
    qualidadeScore: data.qualidadeScore || 0,
    qualidadeClassificacao: data.qualidadeClassificacao || "Ruim",
    validationStatus: data.validationStatus || "pending",
  });

  if (!result.insertId) return null;

  const [cliente] = await db
    .select()
    .from(clientes)
    .where(eq(clientes.id, Number(result.insertId)));

  // Registrar criação no histórico
  const { trackCreation } = await import("./_core/historyTracker");
  await trackCreation("cliente", cliente.id, data);

  console.log(`[Cliente] Criado: ${data.nome}`);
  return cliente;
}

export async function associateClienteToMercado(
  clienteId: number,
  mercadoId: number
) {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.insert(clientesMercados).values({
      clienteId,
      mercadoId,
    });

    // Atualizar contagem de clientes no mercado
    await db.execute(sql`
      UPDATE mercados_unicos 
      SET quantidadeClientes = (
        SELECT COUNT(*) FROM clientes_mercados WHERE mercadoId = ${mercadoId}
      )
      WHERE id = ${mercadoId}
    `);

    return true;
  } catch (error) {
    console.error("Error associating cliente to mercado:", error);
    return false;
  }
}

export async function updateCliente(
  id: number,
  data: Partial<{
    nome: string;
    cnpj: string;
    siteOficial: string;
    produtoPrincipal: string;
    segmentacaoB2BB2C: string;
    email: string;
    telefone: string;
    linkedin: string;
    instagram: string;
    cidade: string;
    uf: string;
    cnae: string;
    porte: string;
    qualidadeScore: number;
    qualidadeClassificacao: string;
    validationStatus: string;
  }>
) {
  const db = await getDb();
  if (!db) return null;

  const updateData: Record<string, unknown> = {};
  Object.keys(data).forEach(key => {
    if (data[key as keyof typeof data] !== undefined) {
      updateData[key] = data[key as keyof typeof data];
    }
  });

  await db.update(clientes).set(updateData).where(eq(clientes.id, id));

  const [cliente] = await db.select().from(clientes).where(eq(clientes.id, id));
  return cliente;
}

export async function deleteCliente(id: number) {
  const db = await getDb();
  if (!db) return false;

  // Delete associations first
  await db.delete(clientesMercados).where(eq(clientesMercados.clienteId, id));

  // Delete the cliente itself
  await db.delete(clientes).where(eq(clientes.id, id));

  return true;
}

// ============================================
// CRUD - CONCORRENTES
// ============================================

export async function createConcorrente(data: {
  projectId: number;
  pesquisaId?: number | null;
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

  // Hash sem timestamp para garantir unicidade
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

    // Atualizar se houver mudanças
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
    pesquisaId: data.pesquisaId || null,
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

  const [concorrente] = await db
    .select()
    .from(concorrentes)
    .where(eq(concorrentes.id, Number(result.insertId)));

  // Registrar criação no histórico
  const { trackCreation } = await import("./_core/historyTracker");
  await trackCreation("concorrente", concorrente.id, data);

  console.log(`[Concorrente] Criado: ${data.nome}`);
  return concorrente;
}

export async function updateConcorrente(
  id: number,
  data: Partial<{
    nome: string;
    cnpj: string;
    site: string;
    produto: string;
    porte: string;
    faturamentoEstimado: string;
    qualidadeScore: number;
    qualidadeClassificacao: string;
    validationStatus: string;
  }>
) {
  const db = await getDb();
  if (!db) return null;

  const updateData: Record<string, unknown> = {};
  Object.keys(data).forEach(key => {
    if (data[key as keyof typeof data] !== undefined) {
      updateData[key] = data[key as keyof typeof data];
    }
  });

  await db.update(concorrentes).set(updateData).where(eq(concorrentes.id, id));

  const [concorrente] = await db
    .select()
    .from(concorrentes)
    .where(eq(concorrentes.id, id));
  return concorrente;
}

export async function deleteConcorrente(id: number) {
  const db = await getDb();
  if (!db) return false;

  await db.delete(concorrentes).where(eq(concorrentes.id, id));
  return true;
}

// ============================================
// CRUD - LEADS
// ============================================

export async function createLead(data: {
  projectId: number;
  pesquisaId?: number | null;
  mercadoId: number;
  nome: string;
  cnpj?: string | null;
  site?: string | null;
  email?: string | null;
  telefone?: string | null;
  tipo?: "inbound" | "outbound" | "referral" | null;
  porte?: "MEI" | "Pequena" | "Média" | "Grande" | null;
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

  // Hash sem timestamp para garantir unicidade
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
    // Detectar mudanças (NÃO incluir 'stage' para preservar progresso de vendas)
    const { detectChanges, trackLeadChanges } = await import(
      "./_core/historyTracker"
    );
    const changes = detectChanges(existing[0], data, [
      "nome",
      "cnpj",
      "site",
      "email",
      "telefone",
      "tipo",
      "porte",
      "regiao",
      "setor",
    ]);

    // Registrar histórico
    await trackLeadChanges(existing[0].id, changes, "enriched");

    // Atualizar se houver mudanças (sem modificar stage)
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
          // ⚠️ stage NÃO é atualizado para preservar progresso de vendas
        })
        .where(eq(leads.id, existing[0].id));

      console.log(
        `[Lead] Atualizado: ${data.nome} (${changes.length} mudanças)`
      );
    }

    return existing[0];
  }

  // Criar novo lead
  const result = (await db.execute(sql`
    INSERT INTO leads (
      projectId, pesquisaId, mercadoId, leadHash, nome, cnpj, site, email, telefone,
      tipo, porte, regiao, setor, qualidadeScore, qualidadeClassificacao,
      validationStatus, stage
    ) VALUES (
      ${data.projectId}, ${data.pesquisaId || null}, ${data.mercadoId}, ${leadHash}, ${data.nome},
      ${data.cnpj || null}, ${data.site || null}, ${data.email || null}, ${data.telefone || null},
      ${data.tipo || null}, ${data.porte || null}, ${data.regiao || null}, ${data.setor || null},
      ${data.qualidadeScore || 0}, ${data.qualidadeClassificacao || "Ruim"},
      ${data.validationStatus || "pending"}, 'novo'
    )
  `)) as any;

  if (!result.insertId) return null;

  const [lead] = await db
    .select()
    .from(leads)
    .where(eq(leads.id, Number(result.insertId)));

  // Registrar criação no histórico
  const { trackCreation } = await import("./_core/historyTracker");
  await trackCreation("lead", lead.id, data);

  console.log(`[Lead] Criado: ${data.nome}`);
  return lead;
}

export async function updateLead(
  id: number,
  data: Partial<{
    nome: string;
    cnpj: string;
    site: string;
    email: string;
    telefone: string;
    tipo: string;
    porte: string;
    regiao: string;
    setor: string;
    qualidadeScore: number;
    qualidadeClassificacao: string;
    validationStatus: string;
    stage: string;
  }>
) {
  const db = await getDb();
  if (!db) return null;

  const updateData: Record<string, unknown> = {};
  Object.keys(data).forEach(key => {
    if (data[key as keyof typeof data] !== undefined) {
      updateData[key] = data[key as keyof typeof data];
    }
  });

  await db.update(leads).set(updateData).where(eq(leads.id, id));

  const [lead] = await db.select().from(leads).where(eq(leads.id, id));
  return lead;
}

export async function deleteLead(id: number) {
  const db = await getDb();
  if (!db) return false;

  await db.delete(leads).where(eq(leads.id, id));
  return true;
}

// ============================================
// CRUD - PROJECT TEMPLATES
// ============================================

export async function getAllTemplates() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(projectTemplates)
    .orderBy(projectTemplates.isDefault, projectTemplates.name);
}

export async function getTemplateById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const [template] = await db
    .select()
    .from(projectTemplates)
    .where(eq(projectTemplates.id, id));
  return template || null;
}

export async function createTemplate(data: {
  name: string;
  description?: string;
  config: string;
  isDefault?: number;
}) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(projectTemplates).values({
    name: data.name,
    description: data.description || null,
    config: data.config,
    isDefault: data.isDefault || 0,
  });

  if (!result.insertId) return null;

  return await getTemplateById(Number(result.insertId));
}

export async function updateTemplate(
  id: number,
  data: Partial<{
    name: string;
    description: string;
    config: string;
    isDefault: number;
  }>
) {
  const db = await getDb();
  if (!db) return null;

  const updateData: Record<string, unknown> = {};
  Object.keys(data).forEach(key => {
    if (data[key as keyof typeof data] !== undefined) {
      updateData[key] = data[key as keyof typeof data];
    }
  });

  if (Object.keys(updateData).length > 0) {
    await db
      .update(projectTemplates)
      .set(updateData)
      .where(eq(projectTemplates.id, id));
  }

  return await getTemplateById(id);
}

export async function deleteTemplate(id: number) {
  const db = await getDb();
  if (!db) return false;

  // Não permitir deletar templates padrão
  const template = await getTemplateById(id);
  if (template?.isDefault === 1) {
    throw new Error("Não é possível deletar templates padrão");
  }

  await db.delete(projectTemplates).where(eq(projectTemplates.id, id));
  return true;
}

// ============================================
// ADVANCED SEARCH - LEADS
// ============================================

export async function searchLeadsAdvanced(
  projectId: number,
  filter: unknown,
  page: number = 1,
  pageSize: number = 20
) {
  const db = await getDb();
  if (!db) return { data: [], total: 0, page, pageSize };

  const { buildDynamicQuery, validateFilter } = await import("./queryBuilder");

  // Validar filtro
  const validation = validateFilter(filter);
  if (!validation.valid) {
    throw new Error(validation.error || "Filtro inválido");
  }

  // Construir query dinâmica
  const whereClause = buildDynamicQuery(leads, filter);

  // Combinar filtro de projeto com filtros dinâmicos
  const finalWhere = whereClause
    ? and(eq(leads.projectId, projectId), whereClause)
    : eq(leads.projectId, projectId);

  // Base query
  const query = db
    .select()
    .from(leads)
    .where(finalWhere as any);

  // Contar total
  const countQuery = db
    .select({ count: count() })
    .from(leads)
    .where(
      whereClause
        ? (and(eq(leads.projectId, projectId), whereClause) as any)
        : eq(leads.projectId, projectId)
    );

  const [{ count: total }] = (await countQuery) as any;

  // Aplicar paginação
  const offset = (page - 1) * pageSize;
  const data = await query.limit(pageSize).offset(offset);

  return {
    data,
    total: Number(total),
    page,
    pageSize,
    totalPages: Math.ceil(Number(total) / pageSize),
  };
}

// ============================================
// ANALYTICS - DASHBOARD
// ============================================

export async function getLeadsByStageStats(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = (await db.execute(sql`
    SELECT 
      stage,
      COUNT(*) as count
    FROM leads
    WHERE projectId = ${projectId}
    GROUP BY stage
  `)) as any;

  return result.rows || result;
}

export async function getLeadsByMercadoStats(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = (await db.execute(sql`
    SELECT 
      m.nome as mercadoNome,
      COUNT(l.id) as leadCount
    FROM mercados_unicos m
    LEFT JOIN leads l ON l.mercadoId = m.id
    WHERE m.projectId = ${projectId}
    GROUP BY m.id, m.nome
    ORDER BY leadCount DESC
    LIMIT 10
  `)) as any;

  return result.rows || result;
}

export async function getQualityScoreEvolution(
  projectId: number,
  days: number = 30
) {
  const db = await getDb();
  if (!db) return [];

  const result = (await db.execute(sql`
    SELECT 
      createdAt::date as date,
      AVG(qualidadeScore) as avgScore,
      COUNT(*) as count
    FROM leads
    WHERE projectId = ${projectId}
      AND createdAt >= CURRENT_TIMESTAMP - INTERVAL '1 day' * ${days}
    GROUP BY createdAt::date
    ORDER BY date ASC
  `)) as any;

  return result.rows || result;
}

export async function getLeadsGrowthOverTime(
  projectId: number,
  days: number = 30
) {
  const db = await getDb();
  if (!db) return [];

  const result = (await db.execute(sql`
    SELECT 
      createdAt::date as date,
      COUNT(*) as count,
      SUM(COUNT(*)) OVER (ORDER BY createdAt::date) as cumulative
    FROM leads
    WHERE projectId = ${projectId}
      AND createdAt >= CURRENT_TIMESTAMP - INTERVAL '1 day' * ${days}
    GROUP BY createdAt::date
    ORDER BY date ASC
  `)) as any;

  return result.rows || result;
}

export async function getDashboardKPIs(projectId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = (await db.execute(sql`
    SELECT 
      COUNT(DISTINCT l.id) as totalLeads,
      COUNT(DISTINCT CASE WHEN l.stage = 'fechado' THEN l.id END) as closedLeads,
      AVG(l.qualidadeScore) as avgQualityScore,
      COUNT(DISTINCT m.id) as totalMercados,
      COUNT(DISTINCT c.id) as totalConcorrentes
    FROM leads l
    LEFT JOIN mercados_unicos m ON m.projectId = ${projectId}
    LEFT JOIN concorrentes c ON c.projectId = ${projectId}
    WHERE l.projectId = ${projectId}
  `)) as any;

  const row = (result.rows && result.rows[0]) || result[0];

  if (!row) return null;

  return {
    totalLeads: Number(row.totalLeads) || 0,
    closedLeads: Number(row.closedLeads) || 0,
    conversionRate:
      row.totalLeads > 0
        ? (Number(row.closedLeads) / Number(row.totalLeads)) * 100
        : 0,
    avgQualityScore: Number(row.avgQualityScore) || 0,
    totalMercados: Number(row.totalMercados) || 0,
    totalConcorrentes: Number(row.totalConcorrentes) || 0,
  };
}

// ============================================
// CRUD - NOTIFICATIONS
// ============================================

export async function createNotification(data: {
  userId?: string;
  projectId?: number;
  type:
    | "lead_quality"
    | "lead_closed"
    | "new_competitor"
    | "market_threshold"
    | "data_incomplete"
    | "enrichment"
    | "validation"
    | "export";
  title: string;
  message: string;
  entityType?: "mercado" | "cliente" | "concorrente" | "lead";
  entityId?: number;
}) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(notifications).values({
    userId: data.userId || null,
    projectId: data.projectId || null,
    type: data.type,
    title: data.title,
    message: data.message,
    entityType: data.entityType || null,
    entityId: data.entityId || null,
    isRead: 0,
  });

  if (!result.insertId) return null;

  const [notification] = await db
    .select()
    .from(notifications)
    .where(eq(notifications.id, Number(result.insertId)));
  return notification;
}

export async function getUserNotifications(userId: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(sql`createdAt DESC`)
    .limit(limit);
}

export async function getUnreadNotificationsCount(userId: string) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, 0)));

  return Number(result[0]?.count || 0);
}

export async function getNotificationStats(userId: string) {
  const db = await getDb();
  if (!db) return { total: 0, unread: 0, last24h: 0 };

  const [totalResult] = await db
    .select({ count: count() })
    .from(notifications)
    .where(eq(notifications.userId, userId));

  const [unreadResult] = await db
    .select({ count: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, 0)));

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const [last24hResult] = await db
    .select({ count: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        sql`${notifications.createdAt} >= ${yesterday}`
      )
    );

  return {
    total: Number(totalResult?.count || 0),
    unread: Number(unreadResult?.count || 0),
    last24h: Number(last24hResult?.count || 0),
  };
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(notifications)
    .set({ isRead: 1 })
    .where(eq(notifications.id, id));

  return true;
}

export async function markAllNotificationsAsRead(userId: string) {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(notifications)
    .set({ isRead: 1 })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, 0)));

  return true;
}

export async function deleteNotification(id: number) {
  const db = await getDb();
  if (!db) return false;

  await db.delete(notifications).where(eq(notifications.id, id));
  return true;
}

// ============================================
// NOTIFICATION TRIGGERS
// ============================================

/**
 * Trigger: Notificar quando lead tem alta qualidade
 */
export async function checkAndNotifyHighQualityLead(
  leadId: number,
  qualityScore: number,
  userId?: string
) {
  if (qualityScore >= 80) {
    const db = await getDb();
    if (!db) return;

    const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));
    if (!lead) return;

    await createNotification({
      userId,
      projectId: lead.projectId,
      type: "lead_quality",
      title: "🎯 Lead de Alta Qualidade!",
      message: `O lead "${lead.nome}" foi identificado com score de ${qualityScore}/100`,
      entityType: "lead",
      entityId: leadId,
    });
  }
}

/**
 * Trigger: Notificar quando lead é fechado
 */
export async function notifyLeadClosed(leadId: number, userId?: string) {
  const db = await getDb();
  if (!db) return;

  const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));
  if (!lead) return;

  await createNotification({
    userId,
    projectId: lead.projectId,
    type: "lead_closed",
    title: "✅ Lead Fechado!",
    message: `O lead "${lead.nome}" foi marcado como fechado`,
    entityType: "lead",
    entityId: leadId,
  });
}

/**
 * Trigger: Notificar quando novo concorrente é identificado
 */
export async function notifyNewCompetitor(
  concorrenteId: number,
  userId?: string
) {
  const db = await getDb();
  if (!db) return;

  const [concorrente] = await db
    .select()
    .from(concorrentes)
    .where(eq(concorrentes.id, concorrenteId));
  if (!concorrente) return;

  await createNotification({
    userId,
    projectId: concorrente.projectId,
    type: "new_competitor",
    title: "🔍 Novo Concorrente Identificado",
    message: `Concorrente "${concorrente.nome}" foi adicionado ao projeto`,
    entityType: "concorrente",
    entityId: concorrenteId,
  });
}

// ============================================
// ENRICHMENT PROGRESS HELPERS
// ============================================

/**
 * Retorna progresso do enriquecimento em tempo real
 */
export async function getEnrichmentProgress(projectId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Total de clientes no projeto
  const [totalResult] = await db
    .select({ count: count() })
    .from(clientes)
    .where(eq(clientes.projectId, projectId));
  const total = totalResult?.count || 0;

  // Clientes processados: clientes que têm mercados associados
  // (mercados são criados durante o enriquecimento)
  const [processedResult] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${clientes.id})` })
    .from(clientes)
    .innerJoin(clientesMercados, eq(clientesMercados.clienteId, clientes.id))
    .where(eq(clientes.projectId, projectId));

  const processed = Number(processedResult?.count || 0);

  // Mercados únicos do projeto
  const [mercadosResult] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${mercadosUnicos.id})` })
    .from(mercadosUnicos)
    .innerJoin(
      clientesMercados,
      eq(clientesMercados.mercadoId, mercadosUnicos.id)
    )
    .innerJoin(clientes, eq(clientes.id, clientesMercados.clienteId))
    .where(eq(clientes.projectId, projectId));
  const mercados = Number(mercadosResult?.count || 0);

  // Concorrentes do projeto
  const [concorrentesResult] = await db
    .select({ count: count() })
    .from(concorrentes)
    .where(eq(concorrentes.projectId, projectId));
  const concorrentesCount = concorrentesResult?.count || 0;

  // Leads do projeto
  const [leadsResult] = await db
    .select({ count: count() })
    .from(leads)
    .where(eq(leads.projectId, projectId));
  const leadsCount = leadsResult?.count || 0;

  const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;

  return {
    total,
    processed,
    remaining: total - processed,
    percentage,
    stats: {
      mercados,
      concorrentes: concorrentesCount,
      leads: leadsCount,
    },
  };
}

// ============================================
// ENRICHMENT RUNS HELPERS
// ============================================

/**
 * Cria novo registro de execução de enriquecimento
 */
export async function createEnrichmentRun(
  projectId: number,
  totalClients: number
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { enrichmentRuns } = await import("../drizzle/schema");

  const result = await db.insert(enrichmentRuns).values({
    projectId,
    totalClients,
    processedClients: 0,
    status: "running",
  });

  // Retornar o ID inserido
  return Number(result[0].insertId);
}

/**
 * Atualiza progresso de execução
 */
export async function updateEnrichmentRun(
  runId: number,
  data: {
    processedClients?: number;
    status?: "running" | "paused" | "completed" | "error";
    completedAt?: Date;
    durationSeconds?: number;
    errorMessage?: string;
    notifiedAt50?: number;
    notifiedAt75?: number;
    notifiedAt100?: number;
  }
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { enrichmentRuns } = await import("../drizzle/schema");

  // Convert Date to MySQL timestamp string
  const updateData: Record<string, unknown> = { ...data };
  if (data.completedAt) {
    updateData.completedAt = toPostgresTimestamp(data.completedAt);
  }

  await db
    .update(enrichmentRuns)
    .set(updateData)
    .where(eq(enrichmentRuns.id, runId));
}

/**
 * Busca histórico de execuções de um projeto
 */
export async function getEnrichmentHistory(
  projectId: number,
  limit: number = 10
) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const { enrichmentRuns } = await import("../drizzle/schema");

  return await db
    .select()
    .from(enrichmentRuns)
    .where(eq(enrichmentRuns.projectId, projectId))
    .orderBy(sql`${enrichmentRuns.startedAt} DESC`)
    .limit(limit);
}

/**
 * Busca execução em andamento de um projeto
 */
export async function getActiveEnrichmentRun(projectId: number) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const { enrichmentRuns } = await import("../drizzle/schema");

  const result = await db
    .select()
    .from(enrichmentRuns)
    .where(
      and(
        eq(enrichmentRuns.projectId, projectId),
        sql`${enrichmentRuns.status} IN ('running', 'paused')`
      )
    )
    .orderBy(sql`${enrichmentRuns.startedAt} DESC`)
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// ===== Scheduled Enrichments =====
import {
  scheduledEnrichments,
  InsertScheduledEnrichment,
} from "../drizzle/schema";

export async function createScheduledEnrichment(
  data: InsertScheduledEnrichment
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(scheduledEnrichments).values(data);
  return result.insertId;
}

export async function listScheduledEnrichments(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(scheduledEnrichments)
    .where(eq(scheduledEnrichments.projectId, projectId))
    .orderBy(scheduledEnrichments.scheduledAt);
}

export async function cancelScheduledEnrichment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(scheduledEnrichments)
    .set({ status: "cancelled" })
    .where(eq(scheduledEnrichments.id, id));
}

export async function deleteScheduledEnrichment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(scheduledEnrichments).where(eq(scheduledEnrichments.id, id));
}

// ========== Alert Configs Functions ==========

import {
  alertConfigs,
  InsertAlertConfig,
  alertHistory,
  InsertAlertHistory,
  leadConversions,
  InsertLeadConversion,
} from "../drizzle/schema";

export async function createAlertConfig(config: InsertAlertConfig) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(alertConfigs).values(config);
  return result;
}

export async function getAlertConfigs(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(alertConfigs)
    .where(eq(alertConfigs.projectId, projectId));
}

export async function updateAlertConfig(
  id: number,
  updates: Partial<InsertAlertConfig>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(alertConfigs)
    .set({ ...updates, updatedAt: now() })
    .where(eq(alertConfigs.id, id));
}

export async function deleteAlertConfig(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(alertConfigs).where(eq(alertConfigs.id, id));
}

// ============================================
// ALERT HISTORY HELPERS
// ============================================

export async function createAlertHistory(history: InsertAlertHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(alertHistory).values(history);
  return result;
}

export async function getAlertHistory(
  projectId: number,
  options?: { limit?: number; offset?: number; alertType?: string }
) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(alertHistory.projectId, projectId)];

  if (options?.alertType) {
    conditions.push(eq(alertHistory.alertType, options.alertType as any));
  }

  const results = await db
    .select()
    .from(alertHistory)
    .where(and(...conditions))
    .orderBy(desc(alertHistory.triggeredAt))
    .limit(options?.limit || 100)
    .offset(options?.offset || 0);

  return results;
}

// ============================================
// LEAD CONVERSIONS HELPERS
// ============================================

export async function createLeadConversion(conversion: InsertLeadConversion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(leadConversions).values(conversion);
  return result;
}

export async function getLeadConversions(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select()
    .from(leadConversions)
    .where(eq(leadConversions.projectId, projectId))
    .orderBy(desc(leadConversions.convertedAt));

  return results;
}

export async function deleteLeadConversion(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(leadConversions).where(eq(leadConversions.id, id));
}

// ============================================
// ROI METRICS HELPERS
// ============================================

export async function calculateROIMetrics(projectId: number) {
  const db = await getDb();
  if (!db) return null;

  // Total de leads
  const totalLeadsResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(leads)
    .where(eq(leads.projectId, projectId));
  const totalLeads = totalLeadsResult[0]?.count || 0;

  // Total de conversões (won)
  const conversionsResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(leadConversions)
    .where(
      and(
        eq(leadConversions.projectId, projectId),
        eq(leadConversions.status, "won")
      )
    );
  const totalConversions = conversionsResult[0]?.count || 0;

  // Valor total de deals
  const dealValueResult = await db
    .select({ total: sql<number>`SUM(dealValue)` })
    .from(leadConversions)
    .where(
      and(
        eq(leadConversions.projectId, projectId),
        eq(leadConversions.status, "won")
      )
    );
  const totalDealValue = dealValueResult[0]?.total || 0;

  // Taxa de conversão
  const conversionRate =
    totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0;

  // Valor médio de deal
  const averageDealValue =
    totalConversions > 0 ? totalDealValue / totalConversions : 0;

  // Conversões por mercado
  const conversionsByMarketResult = await db
    .select({
      mercadoId: leads.mercadoId,
      mercadoNome: mercadosUnicos.nome,
      conversions: sql<number>`COUNT(${leadConversions.id})`,
      totalValue: sql<number>`SUM(${leadConversions.dealValue})`,
    })
    .from(leadConversions)
    .innerJoin(leads, eq(leadConversions.leadId, leads.id))
    .innerJoin(mercadosUnicos, eq(leads.mercadoId, mercadosUnicos.id))
    .where(
      and(
        eq(leadConversions.projectId, projectId),
        eq(leadConversions.status, "won")
      )
    )
    .groupBy(leads.mercadoId, mercadosUnicos.nome)
    .orderBy(desc(sql`COUNT(${leadConversions.id})`));

  return {
    totalLeads,
    totalConversions,
    totalDealValue,
    conversionRate,
    averageDealValue,
    conversionsByMarket: conversionsByMarketResult,
  };
}

// ============================================
// FUNNEL DATA HELPERS
// ============================================

export async function getFunnelData(projectId: number) {
  const db = await getDb();
  if (!db) return null;

  // Contar leads por estágio
  const stageCountsResult = await db
    .select({
      stage: leads.stage,
      count: sql<number>`COUNT(*)`,
    })
    .from(leads)
    .where(eq(leads.projectId, projectId))
    .groupBy(leads.stage);

  // Mapear para objeto
  const stageCounts: Record<string, number> = {};
  stageCountsResult.forEach((row: Record<string, unknown>) => {
    stageCounts[row.stage] = row.count;
  });

  // Ordem dos estágios
  const stages = ["novo", "qualificado", "negociacao", "fechado", "perdido"];
  const funnelData = stages.map(stage => ({
    stage,
    count: stageCounts[stage] || 0,
  }));

  // Calcular taxas de conversão entre estágios
  const conversionRates = [];
  for (let i = 0; i < stages.length - 1; i++) {
    const currentStage = stages[i];
    const nextStage = stages[i + 1];
    const currentCount = stageCounts[currentStage] || 0;
    const nextCount = stageCounts[nextStage] || 0;
    const rate = currentCount > 0 ? (nextCount / currentCount) * 100 : 0;

    conversionRates.push({
      from: currentStage,
      to: nextStage,
      rate: parseFloat(rate.toFixed(2)),
    });
  }

  return {
    funnelData,
    conversionRates,
    totalLeads: Object.values(stageCounts).reduce(
      (sum, count) => sum + count,
      0
    ),
  };
}

/**
 * Activity Log Functions
 */
export async function logActivity(data: InsertActivityLog) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(activityLog).values(data);
    return true;
  } catch (error) {
    console.error("[Database] Failed to log activity:", error);
    return false;
  }
}

export async function getRecentActivities(
  projectId: number,
  limit: number = 30
) {
  const db = await getDb();
  if (!db) return [];

  try {
    const activities = await db
      .select()
      .from(activityLog)
      .where(eq(activityLog.projectId, projectId))
      .orderBy(desc(activityLog.createdAt))
      .limit(limit);

    return activities;
  } catch (error) {
    console.error("[Database] Failed to get recent activities:", error);
    return [];
  }
}

/**
 * Analytics Functions - Gráficos Interativos
 */

// Evolução temporal (mercados, clientes, leads por mês)
export async function getEvolutionData(
  projectId: number,
  months: number = 6,
  pesquisaId?: number
) {
  const db = await getDb();
  if (!db) return [];

  try {
    const pesquisaFilter = pesquisaId
      ? sql`AND pesquisaId = ${pesquisaId}`
      : sql``;

    const result = await db.execute(sql`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        COUNT(DISTINCT CASE WHEN table_name = 'mercados' THEN id END) as mercados,
        COUNT(DISTINCT CASE WHEN table_name = 'clientes' THEN id END) as clientes,
        COUNT(DISTINCT CASE WHEN table_name = 'leads' THEN id END) as leads
      FROM (
        SELECT id, createdAt, 'mercados' as table_name FROM mercados_unicos WHERE projectId = ${projectId} ${pesquisaFilter}
        UNION ALL
        SELECT id, createdAt, 'clientes' as table_name FROM clientes WHERE projectId = ${projectId} ${pesquisaFilter}
        UNION ALL
        SELECT id, createdAt, 'leads' as table_name FROM leads WHERE projectId = ${projectId} ${pesquisaFilter}
      ) combined
      WHERE createdAt >= CURRENT_TIMESTAMP - INTERVAL '1 month' * ${months}
      GROUP BY month
      ORDER BY month ASC
    `);

    return (result as any).rows as Array<{
      month: string;
      mercados: number;
      clientes: number;
      leads: number;
    }>;
  } catch (error) {
    console.error("[Database] Failed to get evolution data:", error);
    return [];
  }
}

// Distribuição geográfica (top 10 UFs)
export async function getGeographicDistribution(
  projectId: number,
  pesquisaId?: number
) {
  const db = await getDb();
  if (!db) return [];

  try {
    const pesquisaFilter = pesquisaId
      ? sql`AND pesquisaId = ${pesquisaId}`
      : sql``;

    const result = await db.execute(sql`
      SELECT 
        uf,
        COUNT(*) as count
      FROM (
        SELECT uf FROM clientes WHERE projectId = ${projectId} ${pesquisaFilter} AND uf IS NOT NULL
        UNION ALL
        SELECT uf FROM concorrentes WHERE projectId = ${projectId} ${pesquisaFilter} AND uf IS NOT NULL
        UNION ALL
        SELECT uf FROM leads WHERE projectId = ${projectId} ${pesquisaFilter} AND uf IS NOT NULL
      ) combined
      GROUP BY uf
      ORDER BY count DESC
      LIMIT 10
    `);

    return (result as any).rows as Array<{ uf: string; count: number }>;
  } catch (error) {
    console.error("[Database] Failed to get geographic distribution:", error);
    return [];
  }
}

// Distribuição por segmentação (B2B/B2C/Ambos)
export async function getSegmentationDistribution(
  projectId: number,
  pesquisaId?: number
) {
  const db = await getDb();
  if (!db) return [];

  try {
    const pesquisaFilter = pesquisaId
      ? sql`AND pesquisaId = ${pesquisaId}`
      : sql``;

    const result = await db.execute(sql`
      SELECT 
        segmentacao,
        COUNT(*) as count
      FROM mercados_unicos
      WHERE projectId = ${projectId} ${pesquisaFilter} AND segmentacao IS NOT NULL
      GROUP BY segmentacao
      ORDER BY count DESC
    `);

    return (result as any).rows as Array<{
      segmentacao: string;
      count: number;
    }>;
  } catch (error) {
    console.error("[Database] Failed to get segmentation distribution:", error);
    return [];
  }
}

// ============================================
// BUSCA GLOBAL UNIFICADA
// ============================================

export interface GlobalSearchResult {
  id: number;
  type: "mercado" | "cliente" | "concorrente" | "lead";
  title: string;
  subtitle?: string;
  metadata?: Record<string, any>;
}

export async function globalSearch(
  query: string,
  projectId?: number,
  limit: number = 20
): Promise<GlobalSearchResult[]> {
  const db = await getDb();
  if (!db) return [];

  const searchTerm = `%${query}%`;
  const results: GlobalSearchResult[] = [];

  try {
    // Buscar mercados
    const mercadosConditions = [sql`${mercadosUnicos.nome} LIKE ${searchTerm}`];
    if (projectId) {
      mercadosConditions.push(eq(mercadosUnicos.projectId, projectId));
    }

    const mercados = await db
      .select({
        id: mercadosUnicos.id,
        nome: mercadosUnicos.nome,
        segmentacao: mercadosUnicos.segmentacao,
      })
      .from(mercadosUnicos)
      .where(and(...mercadosConditions)!)
      .limit(limit);

    results.push(
      ...mercados.map(m => ({
        id: m.id,
        type: "mercado" as const,
        title: m.nome,
        subtitle: m.segmentacao || undefined,
        metadata: { segmentacao: m.segmentacao },
      }))
    );

    // Buscar clientes
    const clientesConditions = [
      or(
        sql`${clientes.nome} LIKE ${searchTerm}`,
        sql`${clientes.cnpj} LIKE ${searchTerm}`
      )!,
    ];
    if (projectId) {
      clientesConditions.push(eq(clientes.projectId, projectId));
    }

    const clientesResult = await db
      .select({
        id: clientes.id,
        nome: clientes.nome,
        cnpj: clientes.cnpj,
      })
      .from(clientes)
      .where(and(...clientesConditions)!)
      .limit(limit);

    results.push(
      ...clientesResult.map(c => ({
        id: c.id,
        type: "cliente" as const,
        title: c.nome,
        subtitle: c.cnpj || undefined,
        metadata: { cnpj: c.cnpj },
      }))
    );

    // Buscar concorrentes
    const concorrentesConditions = [
      or(
        sql`${concorrentes.nome} LIKE ${searchTerm}`,
        sql`${concorrentes.cnpj} LIKE ${searchTerm}`
      )!,
    ];
    if (projectId) {
      concorrentesConditions.push(eq(concorrentes.projectId, projectId));
    }

    const concorrentesResult = await db
      .select({
        id: concorrentes.id,
        nome: concorrentes.nome,
        cnpj: concorrentes.cnpj,
      })
      .from(concorrentes)
      .where(and(...concorrentesConditions)!)
      .limit(limit);

    results.push(
      ...concorrentesResult.map(c => ({
        id: c.id,
        type: "concorrente" as const,
        title: c.nome,
        subtitle: c.cnpj || undefined,
        metadata: { cnpj: c.cnpj },
      }))
    );

    // Buscar leads
    const leadsConditions = [
      or(
        sql`${leads.nome} LIKE ${searchTerm}`,
        sql`${leads.email} LIKE ${searchTerm}`,
        sql`${leads.telefone} LIKE ${searchTerm}`
      )!,
    ];
    if (projectId) {
      leadsConditions.push(eq(leads.projectId, projectId));
    }

    const leadsResult = await db
      .select({
        id: leads.id,
        nome: leads.nome,
        email: leads.email,
        telefone: leads.telefone,
      })
      .from(leads)
      .where(and(...leadsConditions)!)
      .limit(limit);

    results.push(
      ...leadsResult.map(l => ({
        id: l.id,
        type: "lead" as const,
        title: l.nome,
        subtitle: l.email || l.telefone || undefined,
        metadata: { email: l.email, telefone: l.telefone },
      }))
    );

    return results.slice(0, limit);
  } catch (error) {
    console.error("[Database] Global search failed:", error);
    return [];
  }
}

// ============================================
// PRODUTOS HELPERS
// ============================================

export async function createProduto(data: {
  projectId: number;
  clienteId: number;
  mercadoId: number;
  nome: string;
  descricao?: string | null;
  categoria?: string | null;
  preco?: string | null;
  unidade?: string | null;
  ativo?: number;
}) {
  const db = await getDb();
  if (!db) return null;

  try {
    const [produto] = await db.insert(produtos).values({
      projectId: data.projectId,
      clienteId: data.clienteId,
      mercadoId: data.mercadoId,
      nome: data.nome,
      descricao: data.descricao,
      categoria: data.categoria,
      preco: data.preco,
      unidade: data.unidade,
      ativo: data.ativo ?? 1,
      createdAt: now(),
      updatedAt: now(),
    });

    return produto;
  } catch (error) {
    console.error("[Database] Failed to create produto:", error);
    return null;
  }
}

export async function getProdutosByCliente(clienteId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select()
      .from(produtos)
      .where(eq(produtos.clienteId, clienteId))
      .orderBy(desc(produtos.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get produtos by cliente:", error);
    return [];
  }
}

export async function getProdutosByMercado(mercadoId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select()
      .from(produtos)
      .where(eq(produtos.mercadoId, mercadoId))
      .orderBy(desc(produtos.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get produtos by mercado:", error);
    return [];
  }
}

export async function getProdutosByProject(
  projectId: number,
  pesquisaId?: number
) {
  const db = await getDb();
  if (!db) return [];

  try {
    const conditions = [];
    if (pesquisaId) {
      conditions.push(eq(produtos.pesquisaId, pesquisaId));
    } else {
      conditions.push(eq(produtos.projectId, projectId));
    }

    const result = await db
      .select()
      .from(produtos)
      .where(and(...conditions)!)
      .orderBy(desc(produtos.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get produtos by project:", error);
    return [];
  }
}

export async function getProdutoById(id: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(produtos)
      .where(eq(produtos.id, id))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get produto by id:", error);
    return null;
  }
}

export async function updateProduto(
  id: number,
  data: {
    nome?: string;
    descricao?: string | null;
    categoria?: string | null;
    preco?: string | null;
    unidade?: string | null;
    ativo?: number;
  }
) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db
      .update(produtos)
      .set({
        ...data,
        updatedAt: now(),
      })
      .where(eq(produtos.id, id));

    return await getProdutoById(id);
  } catch (error) {
    console.error("[Database] Failed to update produto:", error);
    return null;
  }
}

export async function deleteProduto(id: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(produtos).where(eq(produtos.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete produto:", error);
    return false;
  }
}

// ============================================================================
// ENRICHMENT CONFIGS
// ============================================================================

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// Chave de criptografia (deve estar em variável de ambiente em produção)
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "default-32-char-key-change-me!!"; // 32 caracteres
const ALGORITHM = "aes-256-cbc";

/**
 * Criptografa uma string (API key)
 */
export function encryptApiKey(text: string): string {
  if (!text) return "";

  try {
    const iv = randomBytes(16);
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32));
    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Retorna IV + encrypted (separados por :)
    return iv.toString("hex") + ":" + encrypted;
  } catch (error) {
    console.error("[Encryption] Failed to encrypt:", error);
    return "";
  }
}

/**
 * Descriptografa uma string (API key)
 */
export function decryptApiKey(encrypted: string): string {
  if (!encrypted) return "";

  try {
    const parts = encrypted.split(":");
    if (parts.length !== 2) return "";

    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = parts[1];
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32));

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("[Decryption] Failed to decrypt:", error);
    return "";
  }
}

/**
 * Busca configuração de enriquecimento por projeto
 */
export async function getEnrichmentConfig(projectId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(enrichmentConfigs)
      .where(eq(enrichmentConfigs.projectId, projectId))
      .limit(1);

    if (result.length === 0) return null;

    const config = result[0];

    // Descriptografar API keys antes de retornar
    return {
      ...config,
      openaiApiKey: config.openaiApiKey
        ? decryptApiKey(config.openaiApiKey)
        : null,
      serpapiKey: config.serpapiKey ? decryptApiKey(config.serpapiKey) : null,
      receitawsKey: config.receitawsKey
        ? decryptApiKey(config.receitawsKey)
        : null,
    };
  } catch (error) {
    console.error("[Database] Failed to get enrichment config:", error);
    return null;
  }
}

/**
 * Salva ou atualiza configuração de enriquecimento
 */
export async function saveEnrichmentConfig(data: {
  projectId: number;
  openaiApiKey?: string | null;
  serpapiKey?: string | null;
  receitawsKey?: string | null;
  produtosPorMercado?: number;
  concorrentesPorMercado?: number;
  leadsPorMercado?: number;
  batchSize?: number;
  checkpointInterval?: number;
  enableDeduplication?: number;
  enableQualityScore?: number;
  enableAutoRetry?: number;
  maxRetries?: number;
}) {
  const db = await getDb();
  if (!db) return null;

  try {
    // Criptografar API keys antes de salvar
    const encryptedData: Record<string, unknown> = { ...data };

    if (data.openaiApiKey) {
      encryptedData.openaiApiKey = encryptApiKey(data.openaiApiKey);
    }
    if (data.serpapiKey) {
      encryptedData.serpapiKey = encryptApiKey(data.serpapiKey);
    }
    if (data.receitawsKey) {
      encryptedData.receitawsKey = encryptApiKey(data.receitawsKey);
    }

    // Verificar se já existe config para este projeto
    const existing = await db
      .select()
      .from(enrichmentConfigs)
      .where(eq(enrichmentConfigs.projectId, data.projectId))
      .limit(1);

    if (existing.length > 0) {
      // Update
      await db
        .update(enrichmentConfigs)
        .set({
          ...encryptedData,
          updatedAt: now(),
        })
        .where(eq(enrichmentConfigs.projectId, data.projectId));
    } else {
      // Insert
      await db.insert(enrichmentConfigs).values({
        ...encryptedData,
        projectId: data.projectId,
      });
    }

    return await getEnrichmentConfig(data.projectId);
  } catch (error) {
    console.error("[Database] Failed to save enrichment config:", error);
    return null;
  }
}

/**
 * Deleta configuração de enriquecimento
 */
export async function deleteEnrichmentConfig(projectId: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .delete(enrichmentConfigs)
      .where(eq(enrichmentConfigs.projectId, projectId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete enrichment config:", error);
    return false;
  }
}

// ============================================
// BATCH VALIDATION HELPERS
// ============================================

/**
 * Atualiza validação de múltiplos clientes em uma transação
 */
export async function batchUpdateClientesValidation(
  ids: number[],
  status: string,
  notes?: string,
  userId?: string
) {
  const db = await getDb();
  if (!db) return { success: false, count: 0 };

  try {
    // Usar transação para garantir atomicidade
    const result = await db
      .update(clientes)
      .set({
        validationStatus: status as any,
        validationNotes: notes,
        validatedBy: userId,
        validatedAt: now(),
      })
      .where(inArray(clientes.id, ids));

    return { success: true, count: ids.length };
  } catch (error) {
    console.error("[Database] Failed to batch update clientes:", error);
    return { success: false, count: 0 };
  }
}

/**
 * Atualiza validação de múltiplos concorrentes em uma transação
 */
export async function batchUpdateConcorrentesValidation(
  ids: number[],
  status: string,
  notes?: string,
  userId?: string
) {
  const db = await getDb();
  if (!db) return { success: false, count: 0 };

  try {
    const result = await db
      .update(concorrentes)
      .set({
        validationStatus: status as any,
        validationNotes: notes,
        validatedBy: userId,
        validatedAt: now(),
      })
      .where(inArray(concorrentes.id, ids));

    return { success: true, count: ids.length };
  } catch (error) {
    console.error("[Database] Failed to batch update concorrentes:", error);
    return { success: false, count: 0 };
  }
}

/**
 * Atualiza validação de múltiplos leads em uma transação
 */
export async function batchUpdateLeadsValidation(
  ids: number[],
  status: string,
  notes?: string,
  userId?: string
) {
  const db = await getDb();
  if (!db) return { success: false, count: 0 };

  try {
    const result = await db
      .update(leads)
      .set({
        validationStatus: status as any,
        validationNotes: notes,
        validatedBy: userId,
        validatedAt: now(),
      })
      .where(inArray(leads.id, ids));

    return { success: true, count: ids.length };
  } catch (error) {
    console.error("[Database] Failed to batch update leads:", error);
    return { success: false, count: 0 };
  }
}

// ============================================
// QUALITY TRENDS HELPERS
// ============================================

/**
 * Retorna evolução da qualidade por mercado ao longo do tempo
 */
export async function getQualityTrends(projectId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  try {
    const dataLimiteDate = new Date();
    dataLimiteDate.setDate(dataLimiteDate.getDate() - days);
    const dataLimite = toPostgresTimestamp(dataLimiteDate);

    // Buscar todos os mercados do projeto
    const mercadosResult = await db
      .select()
      .from(mercadosUnicos)
      .where(eq(mercadosUnicos.projectId, projectId));

    const trends = [];

    for (const mercado of mercadosResult) {
      // Buscar clientes, concorrentes e leads do mercado
      const clientesResult = await db
        .select()
        .from(clientes)
        .innerJoin(
          clientesMercados,
          eq(clientes.id, clientesMercados.clienteId)
        )
        .where(
          and(
            eq(clientesMercados.mercadoId, mercado.id),
            gte(clientes.createdAt, dataLimite)
          )
        );

      const concorrentesResult = await db
        .select()
        .from(concorrentes)
        .where(
          and(
            eq(concorrentes.mercadoId, mercado.id),
            gte(concorrentes.createdAt, dataLimite)
          )
        );

      const leadsResult = await db
        .select()
        .from(leads)
        .where(
          and(eq(leads.mercadoId, mercado.id), gte(leads.createdAt, dataLimite))
        );

      // Agrupar por data e calcular qualidade média
      const dataPoints: Record<string, { total: number; count: number }> = {};

      const processarEntidades = (entidades: unknown[]) => {
        entidades.forEach((e: Record<string, unknown>) => {
          const entity = e.clientes || e.concorrentes || e.leads || e;
          if (!entity.createdAt) return;

          const data = new Date(entity.createdAt).toISOString().split("T")[0];
          const qualidade = entity.qualidadeScore || 0;

          if (!dataPoints[data]) {
            dataPoints[data] = { total: 0, count: 0 };
          }

          dataPoints[data].total += qualidade;
          dataPoints[data].count += 1;
        });
      };

      processarEntidades(clientesResult);
      processarEntidades(concorrentesResult);
      processarEntidades(leadsResult);

      // Converter para array ordenado
      const dataPointsArray = Object.entries(dataPoints)
        .map(([data, stats]) => ({
          data,
          qualidadeMedia: Math.round(stats.total / stats.count),
        }))
        .sort((a, b) => a.data.localeCompare(b.data));

      trends.push({
        mercadoId: mercado.id,
        mercadoNome: mercado.nome,
        dataPoints: dataPointsArray,
      });
    }

    return trends;
  } catch (error) {
    console.error("[Database] Failed to get quality trends:", error);
    return [];
  }
}

/**
 * Busca estatísticas de atividade de projetos
 * Fase 59.2: Dashboard de Atividade de Projetos
 */
export async function getProjectsActivity(): Promise<{
  totalProjects: number;
  activeProjects: number;
  hibernatedProjects: number;
  inactiveProjects30: number;
  inactiveProjects60: number;
  inactiveProjects90: number;
  projectsWithActivity: Array<{
    id: number;
    nome: string;
    status: "active" | "hibernated";
    lastActivityAt: Date | null;
    daysSinceActivity: number | null;
    hasWarning: boolean;
    recentActions: Array<{
      action: string;
      createdAt: Date;
      userName: string | null;
    }>;
  }>;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalProjects: 0,
      activeProjects: 0,
      hibernatedProjects: 0,
      inactiveProjects30: 0,
      inactiveProjects60: 0,
      inactiveProjects90: 0,
      projectsWithActivity: [],
    };
  }

  // Estatísticas gerais
  const allProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.ativo, 1));

  const totalProjects = allProjects.length;
  const activeProjects = allProjects.filter(p => p.status === "active").length;
  const hibernatedProjects = allProjects.filter(
    p => p.status === "hibernated"
  ).length;

  // Projetos inativos por período
  const nowDate = new Date();
  const cutoff30 = new Date(nowDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  const cutoff60 = new Date(nowDate.getTime() - 60 * 24 * 60 * 60 * 1000);
  const cutoff90 = new Date(nowDate.getTime() - 90 * 24 * 60 * 60 * 1000);

  const cutoff30Str = toPostgresTimestamp(cutoff30);
  const cutoff60Str = toPostgresTimestamp(cutoff60);
  const cutoff90Str = toPostgresTimestamp(cutoff90);

  const inactiveProjects30 = allProjects.filter(
    p =>
      p.status === "active" &&
      p.lastActivityAt &&
      p.lastActivityAt < cutoff30Str
  ).length;

  const inactiveProjects60 = allProjects.filter(
    p =>
      p.status === "active" &&
      p.lastActivityAt &&
      p.lastActivityAt < cutoff60Str
  ).length;

  const inactiveProjects90 = allProjects.filter(
    p =>
      p.status === "active" &&
      p.lastActivityAt &&
      p.lastActivityAt < cutoff90Str
  ).length;

  // Buscar projetos com suas atividades recentes
  const projectsWithActivity = await Promise.all(
    allProjects.map(async project => {
      // Calcular dias desde última atividade
      let daysSinceActivity: number | null = null;
      if (project.lastActivityAt) {
        const lastActivityDate =
          typeof project.lastActivityAt === "string"
            ? new Date(project.lastActivityAt)
            : project.lastActivityAt;
        const diffMs = nowDate.getTime() - lastActivityDate.getTime();
        daysSinceActivity = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      }

      // Verificar se há aviso de hibernação pendente (não hibernado E não adiado)
      const warnings = await db
        .select()
        .from(hibernationWarnings)
        .where(
          and(
            eq(hibernationWarnings.projectId, project.id),
            eq(hibernationWarnings.hibernated, 0),
            eq(hibernationWarnings.postponed, 0)
          )!
        )
        .limit(1);

      const hasWarning = warnings.length > 0;

      // Buscar últimas 3 ações do log de auditoria
      const auditLogs = await db
        .select()
        .from(projectAuditLog)
        .where(eq(projectAuditLog.projectId, project.id))
        .orderBy(desc(projectAuditLog.createdAt))
        .limit(3);

      // Buscar nomes dos usuários
      const recentActions = await Promise.all(
        auditLogs.map(async log => {
          let userName: string | null = null;
          if (log.userId) {
            const user = await getUser(log.userId);
            userName = user?.nome || null;
          }
          return {
            action: log.action,
            createdAt: log.createdAt!,
            userName,
          };
        })
      );

      return {
        id: project.id,
        nome: project.nome,
        status: project.status,
        lastActivityAt: project.lastActivityAt
          ? new Date(project.lastActivityAt)
          : null,
        daysSinceActivity,
        hasWarning,
        recentActions: recentActions.map(action => ({
          ...action,
          createdAt: new Date(action.createdAt),
        })),
      };
    })
  );

  // Ordenar por dias de inatividade (mais inativos primeiro)
  projectsWithActivity.sort((a, b) => {
    if (a.daysSinceActivity === null) return 1;
    if (b.daysSinceActivity === null) return -1;
    return b.daysSinceActivity - a.daysSinceActivity;
  });

  return {
    totalProjects,
    activeProjects,
    hibernatedProjects,
    inactiveProjects30,
    inactiveProjects60,
    inactiveProjects90,
    projectsWithActivity,
  };
}

/**
 * Verifica projetos que devem receber aviso de hibernação
 * Fase 59.3: Sistema de Notificações Antes de Hibernar
 *
 * Lógica:
 * - Projetos ativos sem atividade há (X - 7) dias ou mais
 * - Ainda não receberam aviso OU aviso foi adiado e prazo expirou
 * - Serão hibernados em 7 dias se não houver atividade
 */
export async function checkProjectsForHibernation(
  inactiveDays: number = 30
): Promise<
  Array<{
    project: Project;
    daysSinceActivity: number;
    scheduledHibernationDate: Date;
  }>
> {
  const db = await getDb();
  if (!db) return [];

  const nowDate = new Date();
  const warningThreshold = inactiveDays - 7; // Avisar 7 dias antes
  const cutoffDate = new Date(
    nowDate.getTime() - warningThreshold * 24 * 60 * 60 * 1000
  );

  // Buscar projetos ativos inativos há (inactiveDays - 7) dias ou mais
  const inactiveProjects = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.ativo, 1),
        eq(projects.status, "active"),
        sql`${projects.lastActivityAt} < ${cutoffDate}`
      )!
    );

  const projectsToWarn: Array<{
    project: Project;
    daysSinceActivity: number;
    scheduledHibernationDate: Date;
  }> = [];

  for (const project of inactiveProjects) {
    if (!project.lastActivityAt) continue;

    // Calcular dias de inatividade
    const lastActivity = new Date(project.lastActivityAt);
    const diffMs = nowDate.getTime() - lastActivity.getTime();
    const daysSinceActivity = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Verificar se já existe aviso recente não adiado
    const existingWarning = await db
      .select()
      .from(hibernationWarnings)
      .where(
        and(
          eq(hibernationWarnings.projectId, project.id),
          eq(hibernationWarnings.hibernated, 0)
        )!
      )
      .orderBy(desc(hibernationWarnings.createdAt))
      .limit(1);

    // Se já existe aviso e não foi adiado, pular
    if (existingWarning.length > 0) {
      const warning = existingWarning[0];

      // Se foi adiado, verificar se o prazo expirou
      if (warning.postponed === 1 && warning.postponedUntil) {
        const postponedUntilDate = new Date(warning.postponedUntil);
        if (nowDate < postponedUntilDate) {
          continue; // Ainda está dentro do prazo de adiamento
        }
      } else if (warning.notificationSent === 1) {
        continue; // Já foi avisado e não foi adiado
      }
    }

    // Data agendada para hibernação (7 dias a partir de hoje)
    const scheduledHibernationDate = new Date(
      nowDate.getTime() + 7 * 24 * 60 * 60 * 1000
    );

    projectsToWarn.push({
      project,
      daysSinceActivity,
      scheduledHibernationDate,
    });
  }

  return projectsToWarn;
}

/**
 * Envia aviso de hibernação para o proprietário do sistema
 * Fase 59.3: Sistema de Notificações Antes de Hibernar
 */
export async function sendHibernationWarning(
  projectId: number,
  projectName: string,
  daysSinceActivity: number,
  scheduledHibernationDate: Date
): Promise<{ success: boolean; warningId?: number }> {
  const db = await getDb();
  if (!db) return { success: false };

  try {
    // Registrar aviso no banco
    const result = await db.insert(hibernationWarnings).values({
      projectId,
      warningDate: now(),
      scheduledHibernationDate: toPostgresTimestamp(scheduledHibernationDate),
      daysInactive: daysSinceActivity,
      notificationSent: 0, // Será marcado como 1 após envio
      postponed: 0,
      hibernated: 0,
    });

    const warningId = Number(result[0].insertId);

    // Enviar notificação para o proprietário
    const { notifyOwner } = await import("./_core/notification");

    const formattedDate = scheduledHibernationDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const notificationSuccess = await notifyOwner({
      title: `⚠️ Projeto "${projectName}" será hibernado em 7 dias`,
      content:
        `O projeto **${projectName}** está inativo há **${daysSinceActivity} dias** e será hibernado automaticamente em **${formattedDate}** se não houver atividade.\n\n` +
        `Para evitar a hibernação, acesse o projeto e realize qualquer ação (criar pesquisa, editar dados, etc.).\n\n` +
        `Você também pode adiar a hibernação por mais 30 dias no Dashboard de Atividade de Projetos.`,
    });

    // Atualizar status de envio
    if (notificationSuccess) {
      await db
        .update(hibernationWarnings)
        .set({ notificationSent: 1 })
        .where(eq(hibernationWarnings.id, warningId));
    }

    return { success: notificationSuccess, warningId };
  } catch (error) {
    console.error("[Database] Failed to send hibernation warning:", error);
    return { success: false };
  }
}

/**
 * Adia a hibernação de um projeto por X dias
 * Fase 59.3: Sistema de Notificações Antes de Hibernar
 */
export async function postponeHibernation(
  projectId: number,
  postponeDays: number = 30
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    // Buscar aviso mais recente não hibernado
    const warnings = await db
      .select()
      .from(hibernationWarnings)
      .where(
        and(
          eq(hibernationWarnings.projectId, projectId),
          eq(hibernationWarnings.hibernated, 0)
        )!
      )
      .orderBy(desc(hibernationWarnings.createdAt))
      .limit(1);

    if (warnings.length === 0) {
      return { success: false, error: "Nenhum aviso de hibernação encontrado" };
    }

    const warning = warnings[0];
    const postponedUntil = new Date(
      Date.now() + postponeDays * 24 * 60 * 60 * 1000
    );

    // Atualizar aviso
    await db
      .update(hibernationWarnings)
      .set({
        postponed: 1,
        postponedUntil: toPostgresTimestamp(postponedUntil),
      })
      .where(eq(hibernationWarnings.id, warning.id));

    // Atualizar lastActivityAt do projeto
    await updateProjectActivity(projectId);

    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to postpone hibernation:", error);
    return { success: false, error: "Erro ao adiar hibernação" };
  }
}

/**
 * Executa hibernação automática de projetos com avisos vencidos
 * Fase 59.3: Sistema de Notificações Antes de Hibernar
 */
export async function executeScheduledHibernations(
  userId?: string | null
): Promise<{ hibernated: number; errors: number }> {
  const db = await getDb();
  if (!db) return { hibernated: 0, errors: 0 };

  const nowTimestamp = now();
  let hibernated = 0;
  let errors = 0;

  try {
    // Buscar avisos com data de hibernação vencida
    const overdueWarnings = await db
      .select()
      .from(hibernationWarnings)
      .where(
        and(
          eq(hibernationWarnings.hibernated, 0),
          eq(hibernationWarnings.postponed, 0),
          sql`${hibernationWarnings.scheduledHibernationDate} <= ${nowTimestamp}`
        )!
      );

    for (const warning of overdueWarnings) {
      // Verificar se projeto ainda está ativo
      const project = await getProjectById(warning.projectId);
      if (!project || project.status !== "active") {
        // Marcar aviso como processado
        await db
          .update(hibernationWarnings)
          .set({ hibernated: 1 })
          .where(eq(hibernationWarnings.id, warning.id));
        continue;
      }

      // Hibernar projeto
      const result = await hibernateProject(warning.projectId, userId);

      if (result.success) {
        // Marcar aviso como processado
        await db
          .update(hibernationWarnings)
          .set({ hibernated: 1 })
          .where(eq(hibernationWarnings.id, warning.id));
        hibernated++;
      } else {
        errors++;
      }
    }

    return { hibernated, errors };
  } catch (error) {
    console.error(
      "[Database] Failed to execute scheduled hibernations:",
      error
    );
    return { hibernated, errors: errors + 1 };
  }
}

// ============================================
// NOTIFICATION PREFERENCES
// ============================================

/**
 * Get user notification preferences
 */
export async function getUserNotificationPreferences(userId: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    const { notificationPreferences } = await import("../drizzle/schema");
    return await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));
  } catch (error) {
    console.error("[DB] Error getting notification preferences:", error);
    return [];
  }
}

/**
 * Update or create notification preference
 */
export async function upsertNotificationPreference(data: {
  userId: string;
  type: string;
  enabled: boolean;
  channels?: { email?: boolean; push?: boolean; inApp?: boolean };
}) {
  const db = await getDb();
  if (!db) return null;

  try {
    const { notificationPreferences } = await import("../drizzle/schema");

    // Check if preference exists
    const existing = await db
      .select()
      .from(notificationPreferences)
      .where(
        and(
          eq(notificationPreferences.userId, data.userId),
          eq(notificationPreferences.type, data.type as any)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      await db
        .update(notificationPreferences)
        .set({
          enabled: data.enabled ? 1 : 0,
          channels: data.channels || { inApp: true },
        })
        .where(eq(notificationPreferences.id, existing[0].id));

      return {
        ...existing[0],
        enabled: data.enabled ? 1 : 0,
        channels: data.channels,
      };
    } else {
      // Create new
      const result = await db.insert(notificationPreferences).values({
        userId: data.userId,
        type: data.type as any,
        enabled: data.enabled ? 1 : 0,
        channels: data.channels || { inApp: true },
      });

      return {
        id: Number(result[0].insertId),
        userId: data.userId,
        type: data.type,
        enabled: data.enabled ? 1 : 0,
        channels: data.channels || { inApp: true },
      };
    }
  } catch (error) {
    console.error("[DB] Error upserting notification preference:", error);
    return null;
  }
}

/**
 * Reset notification preferences to defaults
 */
export async function resetNotificationPreferences(userId: string) {
  const db = await getDb();
  if (!db) return false;

  try {
    const { notificationPreferences } = await import("../drizzle/schema");

    // Delete all user preferences
    await db
      .delete(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));

    return true;
  } catch (error) {
    console.error("[DB] Error resetting notification preferences:", error);
    return false;
  }
}

/**
 * Check if user should receive notification based on preferences
 */
export async function shouldSendNotification(
  userId: string,
  notificationType: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return true; // Default to sending if DB unavailable

  try {
    const { notificationPreferences } = await import("../drizzle/schema");

    // Check specific type preference
    const typePreference = await db
      .select()
      .from(notificationPreferences)
      .where(
        and(
          eq(notificationPreferences.userId, userId),
          eq(notificationPreferences.type, notificationType as any)
        )
      )
      .limit(1);

    if (typePreference.length > 0) {
      return typePreference[0].enabled === 1;
    }

    // Check "all" preference
    const allPreference = await db
      .select()
      .from(notificationPreferences)
      .where(
        and(
          eq(notificationPreferences.userId, userId),
          eq(notificationPreferences.type, "all" as any)
        )
      )
      .limit(1);

    if (allPreference.length > 0) {
      return allPreference[0].enabled === 1;
    }

    // Default to enabled if no preference set
    return true;
  } catch (error) {
    console.error("[DB] Error checking notification preference:", error);
    return true; // Default to sending on error
  }
}

// ============================================
// RESEARCH DRAFTS HELPERS
// ============================================

// Tipo temporário para drafts (evitando problema de cache do TypeScript)
type ResearchDraft = {
  id: number;
  userId: string;
  projectId: number | null;
  draftData: unknown;
  currentStep: number;
  createdAt: Date;
  updatedAt: Date;
};

// Funções de gerenciamento de drafts de pesquisa (usando raw SQL temporariamente)
export async function saveResearchDraft(
  userId: string,
  draftData: unknown,
  currentStep: number,
  projectId?: number | null,
  progressStatus?: "started" | "in_progress" | "almost_done"
): Promise<ResearchDraft | null> {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot save research draft: database not available"
    );
    return null;
  }

  try {
    const draftJson = JSON.stringify(draftData);

    // Verificar se já existe um draft para este usuário
    let existing;
    if (projectId === null || projectId === undefined) {
      existing = await db.execute(sql`
        SELECT * FROM research_drafts 
        WHERE userId = ${userId} 
        AND projectId IS NULL
        LIMIT 1
      `);
    } else {
      existing = await db.execute(sql`
        SELECT * FROM research_drafts 
        WHERE userId = ${userId} 
        AND projectId = ${projectId}
        LIMIT 1
      `);
    }

    const existingRows = (existing as any)[0] || [];

    if (existingRows.length > 0) {
      // Atualizar draft existente
      const updateQuery = progressStatus
        ? sql`
          UPDATE research_drafts 
          SET draftData = ${draftJson}, 
              currentStep = ${currentStep},
              progressStatus = ${progressStatus},
              updatedAt = CURRENT_TIMESTAMP
          WHERE id = ${existingRows[0].id}
        `
        : sql`
          UPDATE research_drafts 
          SET draftData = ${draftJson}, 
              currentStep = ${currentStep},
              updatedAt = CURRENT_TIMESTAMP
          WHERE id = ${existingRows[0].id}
        `;

      await db.execute(updateQuery);

      return {
        id: existingRows[0].id,
        userId,
        projectId: projectId ?? null,
        draftData,
        currentStep,
        createdAt: existingRows[0].createdAt,
        updatedAt: new Date(),
      };
    } else {
      // Criar novo draft
      const insertQuery = progressStatus
        ? sql`
          INSERT INTO research_drafts (userId, projectId, draftData, currentStep, progressStatus)
          VALUES (${userId}, ${projectId ?? null}, ${draftJson}, ${currentStep}, ${progressStatus})
        `
        : sql`
          INSERT INTO research_drafts (userId, projectId, draftData, currentStep)
          VALUES (${userId}, ${projectId ?? null}, ${draftJson}, ${currentStep})
        `;

      const result = await db.execute(insertQuery);

      return {
        id: Number((result as any)[0].insertId),
        userId,
        projectId: projectId ?? null,
        draftData,
        currentStep,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  } catch (error) {
    console.error("[Database] Failed to save research draft:", error);
    return null;
  }
}

export async function getResearchDraft(
  userId: string,
  projectId?: number | null
): Promise<ResearchDraft | null> {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot get research draft: database not available"
    );
    return null;
  }

  try {
    let result;
    if (projectId === null || projectId === undefined) {
      result = await db.execute(sql`
        SELECT * FROM research_drafts 
        WHERE userId = ${userId} 
        AND projectId IS NULL
        LIMIT 1
      `);
    } else {
      result = await db.execute(sql`
        SELECT * FROM research_drafts 
        WHERE userId = ${userId} 
        AND projectId = ${projectId}
        LIMIT 1
      `);
    }

    const rows = (result as any)[0] || [];
    if (rows.length === 0) return null;

    const draft = rows[0];
    return {
      id: draft.id,
      userId: draft.userId,
      projectId: draft.projectId,
      draftData:
        typeof draft.draftData === "string"
          ? JSON.parse(draft.draftData)
          : draft.draftData,
      currentStep: draft.currentStep,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    };
  } catch (error) {
    console.error("[Database] Failed to get research draft:", error);
    return null;
  }
}

export async function deleteResearchDraft(draftId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot delete research draft: database not available"
    );
    return false;
  }

  try {
    await db.execute(sql`DELETE FROM research_drafts WHERE id = ${draftId}`);
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete research draft:", error);
    return false;
  }
}

export async function getUserDrafts(userId: string): Promise<ResearchDraft[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user drafts: database not available");
    return [];
  }

  try {
    const results = await db.execute(sql`
      SELECT * FROM research_drafts 
      WHERE userId = ${userId} 
      ORDER BY updatedAt DESC
    `);

    const rows = (results as any)[0] || [];
    return rows.map((draft: Record<string, unknown>) => ({
      id: draft.id,
      userId: draft.userId,
      projectId: draft.projectId,
      draftData:
        typeof draft.draftData === "string"
          ? JSON.parse(draft.draftData)
          : draft.draftData,
      currentStep: draft.currentStep,
      progressStatus: draft.progressStatus,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    }));
  } catch (error) {
    console.error("[Database] Failed to get user drafts:", error);
    return [];
  }
}

/**
 * Buscar rascunhos com filtros avançados
 * Fase 65.2
 */
export async function getFilteredDrafts(
  userId: string,
  filters?: {
    projectId?: number;
    progressStatus?: "started" | "in_progress" | "almost_done";
    daysAgo?: number; // Últimos X dias
    searchText?: string; // Busca no draftData
  }
): Promise<ResearchDraft[]> {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot get filtered drafts: database not available"
    );
    return [];
  }

  try {
    let query = sql`SELECT * FROM research_drafts WHERE userId = ${userId}`;

    // Filtro por projeto
    if (filters?.projectId) {
      query = sql`${query} AND projectId = ${filters.projectId}`;
    }

    // Filtro por status de progresso
    if (filters?.progressStatus) {
      query = sql`${query} AND progressStatus = ${filters.progressStatus}`;
    }

    // Filtro por data (últimos X dias)
    if (filters?.daysAgo) {
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - filters.daysAgo);
      const dateLimitStr = toPostgresTimestamp(dateLimit);
      query = sql`${query} AND createdAt >= ${dateLimitStr}`;
    }

    // Ordenar por data de atualização
    query = sql`${query} ORDER BY updatedAt DESC`;

    const results = await db.execute(query);
    const rows = (results as any)[0] || [];

    let drafts = rows.map((draft: Record<string, unknown>) => ({
      id: draft.id,
      userId: draft.userId,
      projectId: draft.projectId,
      draftData:
        typeof draft.draftData === "string"
          ? JSON.parse(draft.draftData)
          : draft.draftData,
      currentStep: draft.currentStep,
      progressStatus: draft.progressStatus,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    }));

    // Filtro por texto (busca no draftData)
    if (filters?.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      drafts = drafts.filter((draft: Record<string, unknown>) => {
        const dataStr = JSON.stringify(draft.draftData).toLowerCase();
        return dataStr.includes(searchLower);
      });
    }

    return drafts;
  } catch (error) {
    console.error("[Database] Failed to get filtered drafts:", error);
    return [];
  }
}

// ============================================
// SYSTEM SETTINGS HELPERS
// ============================================

export async function getSystemSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot get system setting: database not available"
    );
    return null;
  }

  try {
    const results = await db.execute(sql`
      SELECT settingValue FROM system_settings 
      WHERE settingKey = ${key}
      LIMIT 1
    `);

    const rows = (results as any)[0] || [];
    return rows.length > 0 ? rows[0].settingValue : null;
  } catch (error) {
    console.error("[Database] Failed to get system setting:", error);
    return null;
  }
}

export async function setSystemSetting(
  key: string,
  value: string,
  description?: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot set system setting: database not available"
    );
    return false;
  }

  try {
    await db.execute(sql`
      INSERT INTO system_settings (settingKey, settingValue, description)
      VALUES (${key}, ${value}, ${description || null})
      ON DUPLICATE KEY UPDATE 
        settingValue = ${value},
        description = ${description || null},
        updatedAt = CURRENT_TIMESTAMP
    `);
    return true;
  } catch (error) {
    console.error("[Database] Failed to set system setting:", error);
    return false;
  }
}

export async function getAllSystemSettings(): Promise<
  Array<{
    key: string;
    value: string | null;
    description: string | null;
  }>
> {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot get all system settings: database not available"
    );
    return [];
  }

  try {
    const results = await db.execute(sql`
      SELECT settingKey as \`key\`, settingValue as value, description 
      FROM system_settings
      ORDER BY settingKey
    `);

    const rows = (results as any)[0] || [];
    return rows;
  } catch (error) {
    console.error("[Database] Failed to get all system settings:", error);
    return [];
  }
}

// ============================================================
// GEOCOCKPIT - Atualização de Coordenadas
// ============================================================

export async function updateClienteCoordinates(
  id: number,
  latitude: number,
  longitude: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot update cliente coordinates: database not available"
    );
    return false;
  }

  try {
    await db.execute(sql`
      UPDATE clientes 
      SET latitude = ${latitude}, longitude = ${longitude}
      WHERE id = ${id}
    `);
    return true;
  } catch (error) {
    console.error("[Database] Failed to update cliente coordinates:", error);
    return false;
  }
}

export async function updateConcorrenteCoordinates(
  id: number,
  latitude: number,
  longitude: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot update concorrente coordinates: database not available"
    );
    return false;
  }

  try {
    await db.execute(sql`
      UPDATE concorrentes 
      SET latitude = ${latitude}, longitude = ${longitude}
      WHERE id = ${id}
    `);
    return true;
  } catch (error) {
    console.error(
      "[Database] Failed to update concorrente coordinates:",
      error
    );
    return false;
  }
}

export async function updateLeadCoordinates(
  id: number,
  latitude: number,
  longitude: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot update lead coordinates: database not available"
    );
    return false;
  }

  try {
    await db.execute(sql`
      UPDATE leads 
      SET latitude = ${latitude}, longitude = ${longitude}
      WHERE id = ${id}
    `);
    return true;
  } catch (error) {
    console.error("[Database] Failed to update lead coordinates:", error);
    return false;
  }
}

// ========================================
// ANÁLISE TERRITORIAL
// Fase 69.6 - Análise geográfica e insights territoriais
// ========================================

export async function getRegionAnalysis(
  projectId: number,
  pesquisaId?: number
) {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot get region analysis: database not available"
    );
    return { byUF: [], byCidade: [] };
  }

  try {
    // Análise por UF (estado)
    const byUFQuery = pesquisaId
      ? sql`
        SELECT 
          uf,
          COUNT(DISTINCT CASE WHEN source_table = 'clientes' THEN id END) as totalClientes,
          COUNT(DISTINCT CASE WHEN source_table = 'concorrentes' THEN id END) as totalConcorrentes,
          COUNT(DISTINCT CASE WHEN source_table = 'leads' THEN id END) as totalLeads,
          AVG(CASE WHEN qualityScore IS NOT NULL THEN qualityScore ELSE 0 END) as qualidadeMedia,
          COUNT(*) as total
        FROM (
          SELECT id, uf, qualityScore, 'clientes' as source_table
          FROM clientes 
          WHERE projectId = ${projectId} AND pesquisaId = ${pesquisaId} AND latitude IS NOT NULL
          UNION ALL
          SELECT id, uf, qualityScore, 'concorrentes' as source_table
          FROM concorrentes 
          WHERE projectId = ${projectId} AND pesquisaId = ${pesquisaId} AND latitude IS NOT NULL
          UNION ALL
          SELECT id, uf, qualityScore, 'leads' as source_table
          FROM leads 
          WHERE projectId = ${projectId} AND pesquisaId = ${pesquisaId} AND latitude IS NOT NULL
        ) as combined
        WHERE uf IS NOT NULL
        GROUP BY uf
        ORDER BY total DESC
      `
      : sql`
        SELECT 
          uf,
          COUNT(DISTINCT CASE WHEN source_table = 'clientes' THEN id END) as totalClientes,
          COUNT(DISTINCT CASE WHEN source_table = 'concorrentes' THEN id END) as totalConcorrentes,
          COUNT(DISTINCT CASE WHEN source_table = 'leads' THEN id END) as totalLeads,
          AVG(CASE WHEN qualityScore IS NOT NULL THEN qualityScore ELSE 0 END) as qualidadeMedia,
          COUNT(*) as total
        FROM (
          SELECT id, uf, qualityScore, 'clientes' as source_table
          FROM clientes 
          WHERE projectId = ${projectId} AND latitude IS NOT NULL
          UNION ALL
          SELECT id, uf, qualityScore, 'concorrentes' as source_table
          FROM concorrentes 
          WHERE projectId = ${projectId} AND latitude IS NOT NULL
          UNION ALL
          SELECT id, uf, qualityScore, 'leads' as source_table
          FROM leads 
          WHERE projectId = ${projectId} AND latitude IS NOT NULL
        ) as combined
        WHERE uf IS NOT NULL
        GROUP BY uf
        ORDER BY total DESC
      `;

    const byUFResult = await db.execute(byUFQuery);
    const byUF = (byUFResult as any)[0] || [];

    // Análise por Cidade (top 20)
    const byCidadeQuery = pesquisaId
      ? sql`
        SELECT 
          cidade,
          uf,
          COUNT(DISTINCT CASE WHEN source_table = 'clientes' THEN id END) as totalClientes,
          COUNT(DISTINCT CASE WHEN source_table = 'concorrentes' THEN id END) as totalConcorrentes,
          COUNT(DISTINCT CASE WHEN source_table = 'leads' THEN id END) as totalLeads,
          AVG(CASE WHEN qualityScore IS NOT NULL THEN qualityScore ELSE 0 END) as qualidadeMedia,
          COUNT(*) as total
        FROM (
          SELECT id, cidade, uf, qualityScore, 'clientes' as source_table
          FROM clientes 
          WHERE projectId = ${projectId} AND pesquisaId = ${pesquisaId} AND latitude IS NOT NULL
          UNION ALL
          SELECT id, cidade, uf, qualityScore, 'concorrentes' as source_table
          FROM concorrentes 
          WHERE projectId = ${projectId} AND pesquisaId = ${pesquisaId} AND latitude IS NOT NULL
          UNION ALL
          SELECT id, cidade, uf, qualityScore, 'leads' as source_table
          FROM leads 
          WHERE projectId = ${projectId} AND pesquisaId = ${pesquisaId} AND latitude IS NOT NULL
        ) as combined
        WHERE cidade IS NOT NULL
        GROUP BY cidade, uf
        ORDER BY total DESC
        LIMIT 20
      `
      : sql`
        SELECT 
          cidade,
          uf,
          COUNT(DISTINCT CASE WHEN source_table = 'clientes' THEN id END) as totalClientes,
          COUNT(DISTINCT CASE WHEN source_table = 'concorrentes' THEN id END) as totalConcorrentes,
          COUNT(DISTINCT CASE WHEN source_table = 'leads' THEN id END) as totalLeads,
          AVG(CASE WHEN qualityScore IS NOT NULL THEN qualityScore ELSE 0 END) as qualidadeMedia,
          COUNT(*) as total
        FROM (
          SELECT id, cidade, uf, qualityScore, 'clientes' as source_table
          FROM clientes 
          WHERE projectId = ${projectId} AND latitude IS NOT NULL
          UNION ALL
          SELECT id, cidade, uf, qualityScore, 'concorrentes' as source_table
          FROM concorrentes 
          WHERE projectId = ${projectId} AND latitude IS NOT NULL
          UNION ALL
          SELECT id, cidade, uf, qualityScore, 'leads' as source_table
          FROM leads 
          WHERE projectId = ${projectId} AND latitude IS NOT NULL
        ) as combined
        WHERE cidade IS NOT NULL
        GROUP BY cidade, uf
        ORDER BY total DESC
        LIMIT 20
      `;

    const byCidadeResult = await db.execute(byCidadeQuery);
    const byCidade = (byCidadeResult as any)[0] || [];

    return { byUF, byCidade };
  } catch (error) {
    console.error("[Database] Failed to get region analysis:", error);
    return { byUF: [], byCidade: [] };
  }
}

export async function getTerritorialInsights(
  projectId: number,
  pesquisaId?: number
) {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot get territorial insights: database not available"
    );
    return null;
  }

  try {
    // Estatísticas gerais
    const statsQuery = pesquisaId
      ? sql`
        SELECT 
          COUNT(DISTINCT uf) as totalEstados,
          COUNT(DISTINCT cidade) as totalCidades,
          COUNT(*) as totalRegistros,
          COUNT(DISTINCT CASE WHEN source_table = 'clientes' THEN id END) as totalClientes,
          COUNT(DISTINCT CASE WHEN source_table = 'concorrentes' THEN id END) as totalConcorrentes,
          COUNT(DISTINCT CASE WHEN source_table = 'leads' THEN id END) as totalLeads,
          AVG(CASE WHEN qualityScore IS NOT NULL THEN qualityScore ELSE 0 END) as qualidadeMediaGeral
        FROM (
          SELECT id, uf, cidade, qualityScore, 'clientes' as source_table
          FROM clientes 
          WHERE projectId = ${projectId} AND pesquisaId = ${pesquisaId} AND latitude IS NOT NULL
          UNION ALL
          SELECT id, uf, cidade, qualityScore, 'concorrentes' as source_table
          FROM concorrentes 
          WHERE projectId = ${projectId} AND pesquisaId = ${pesquisaId} AND latitude IS NOT NULL
          UNION ALL
          SELECT id, uf, cidade, qualityScore, 'leads' as source_table
          FROM leads 
          WHERE projectId = ${projectId} AND pesquisaId = ${pesquisaId} AND latitude IS NOT NULL
        ) as combined
      `
      : sql`
        SELECT 
          COUNT(DISTINCT uf) as totalEstados,
          COUNT(DISTINCT cidade) as totalCidades,
          COUNT(*) as totalRegistros,
          COUNT(DISTINCT CASE WHEN source_table = 'clientes' THEN id END) as totalClientes,
          COUNT(DISTINCT CASE WHEN source_table = 'concorrentes' THEN id END) as totalConcorrentes,
          COUNT(DISTINCT CASE WHEN source_table = 'leads' THEN id END) as totalLeads,
          AVG(CASE WHEN qualityScore IS NOT NULL THEN qualityScore ELSE 0 END) as qualidadeMediaGeral
        FROM (
          SELECT id, uf, cidade, qualityScore, 'clientes' as source_table
          FROM clientes 
          WHERE projectId = ${projectId} AND latitude IS NOT NULL
          UNION ALL
          SELECT id, uf, cidade, qualityScore, 'concorrentes' as source_table
          FROM concorrentes 
          WHERE projectId = ${projectId} AND latitude IS NOT NULL
          UNION ALL
          SELECT id, uf, cidade, qualityScore, 'leads' as source_table
          FROM leads 
          WHERE projectId = ${projectId} AND latitude IS NOT NULL
        ) as combined
      `;

    const statsResult = await db.execute(statsQuery);
    const stats = (statsResult as any)[0]?.[0] || {};

    // Região com maior concentração
    const topRegionQuery = pesquisaId
      ? sql`
        SELECT uf, COUNT(*) as total
        FROM (
          SELECT uf FROM clientes WHERE projectId = ${projectId} AND pesquisaId = ${pesquisaId} AND latitude IS NOT NULL
          UNION ALL
          SELECT uf FROM concorrentes WHERE projectId = ${projectId} AND pesquisaId = ${pesquisaId} AND latitude IS NOT NULL
          UNION ALL
          SELECT uf FROM leads WHERE projectId = ${projectId} AND pesquisaId = ${pesquisaId} AND latitude IS NOT NULL
        ) as combined
        WHERE uf IS NOT NULL
        GROUP BY uf
        ORDER BY total DESC
        LIMIT 1
      `
      : sql`
        SELECT uf, COUNT(*) as total
        FROM (
          SELECT uf FROM clientes WHERE projectId = ${projectId} AND latitude IS NOT NULL
          UNION ALL
          SELECT uf FROM concorrentes WHERE projectId = ${projectId} AND latitude IS NOT NULL
          UNION ALL
          SELECT uf FROM leads WHERE projectId = ${projectId} AND latitude IS NOT NULL
        ) as combined
        WHERE uf IS NOT NULL
        GROUP BY uf
        ORDER BY total DESC
        LIMIT 1
      `;

    const topRegionResult = await db.execute(topRegionQuery);
    const topRegion = (topRegionResult as any)[0]?.[0] || null;

    // Cidade com maior potencial (mais leads de alta qualidade)
    const topCityQuery = pesquisaId
      ? sql`
        SELECT cidade, uf, COUNT(*) as totalLeads, AVG(qualityScore) as qualidadeMedia
        FROM leads
        WHERE projectId = ${projectId} 
          AND pesquisaId = ${pesquisaId}
          AND latitude IS NOT NULL 
          AND qualityScore >= 70
        GROUP BY cidade, uf
        ORDER BY totalLeads DESC, qualidadeMedia DESC
        LIMIT 1
      `
      : sql`
        SELECT cidade, uf, COUNT(*) as totalLeads, AVG(qualityScore) as qualidadeMedia
        FROM leads
        WHERE projectId = ${projectId} 
          AND latitude IS NOT NULL 
          AND qualityScore >= 70
        GROUP BY cidade, uf
        ORDER BY totalLeads DESC, qualidadeMedia DESC
        LIMIT 1
      `;

    const topCityResult = await db.execute(topCityQuery);
    const topCity = (topCityResult as any)[0]?.[0] || null;

    return {
      ...stats,
      topRegion,
      topCity,
    };
  } catch (error) {
    console.error("[Database] Failed to get territorial insights:", error);
    return null;
  }
}

// ============================================
// REPORT SCHEDULES HELPERS
// Fase 65.1 - Agendamento de Relatórios
// ============================================

/**
 * Criar novo agendamento de relatório
 */
export async function createReportSchedule(
  data: InsertReportSchedule
): Promise<ReportSchedule> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(reportSchedules).values(data);
    const insertId = result[0].insertId;

    const created = await db
      .select()
      .from(reportSchedules)
      .where(eq(reportSchedules.id, insertId))
      .limit(1);

    return created[0];
  } catch (error) {
    console.error("[Database] Failed to create report schedule:", error);
    throw error;
  }
}

/**
 * Buscar agendamentos de um usuário
 */
export async function getReportSchedules(
  userId: string,
  projectId?: number
): Promise<ReportSchedule[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const conditions = [eq(reportSchedules.userId, userId)];

    if (projectId) {
      conditions.push(eq(reportSchedules.projectId, projectId));
    }

    const results = await db
      .select()
      .from(reportSchedules)
      .where(and(...conditions))
      .orderBy(desc(reportSchedules.createdAt));

    return results;
  } catch (error) {
    console.error("[Database] Failed to get report schedules:", error);
    return [];
  }
}

/**
 * Buscar agendamento por ID
 */
export async function getReportScheduleById(
  id: number
): Promise<ReportSchedule | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(reportSchedules)
      .where(eq(reportSchedules.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get report schedule:", error);
    return null;
  }
}

/**
 * Atualizar agendamento
 */
export async function updateReportSchedule(
  id: number,
  data: Partial<InsertReportSchedule>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db
      .update(reportSchedules)
      .set(data)
      .where(eq(reportSchedules.id, id));
  } catch (error) {
    console.error("[Database] Failed to update report schedule:", error);
    throw error;
  }
}

/**
 * Deletar agendamento
 */
export async function deleteReportSchedule(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.delete(reportSchedules).where(eq(reportSchedules.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete report schedule:", error);
    throw error;
  }
}

/**
 * Buscar agendamentos que precisam ser executados
 */
export async function getSchedulesToRun(): Promise<ReportSchedule[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const currentTime = now();
    const results = await db
      .select()
      .from(reportSchedules)
      .where(
        and(
          eq(reportSchedules.enabled, 1),
          sql`${reportSchedules.nextRunAt} <= ${currentTime}`
        )
      );

    return results;
  } catch (error) {
    console.error("[Database] Failed to get schedules to run:", error);
    return [];
  }
}

/**
 * Atualizar timestamp de última execução e calcular próxima execução
 */
export async function updateScheduleAfterRun(
  id: number,
  frequency: "weekly" | "monthly"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const currentTime = now();
    const currentDate = new Date();
    const nextRunDate = new Date(currentDate);

    if (frequency === "weekly") {
      nextRunDate.setDate(nextRunDate.getDate() + 7);
    } else if (frequency === "monthly") {
      nextRunDate.setMonth(nextRunDate.getMonth() + 1);
    }

    await db
      .update(reportSchedules)
      .set({
        lastRunAt: currentTime,
        nextRunAt: toPostgresTimestamp(nextRunDate),
      })
      .where(eq(reportSchedules.id, id));
  } catch (error) {
    console.error("[Database] Failed to update schedule after run:", error);
    throw error;
  }
}

// ============================================
// HEATMAP DE CONCENTRAÇÃO TERRITORIAL
// Fase 65.3
// ============================================

/**
 * Buscar densidade territorial por coordenadas
 * Agrupa entidades por região para visualização em heatmap
 */
export async function getTerritorialDensity(
  projectId: number,
  pesquisaId?: number,
  entityType?: "clientes" | "leads" | "concorrentes"
) {
  const db = await getDb();
  if (!db) return [];

  try {
    // Definir quais tabelas consultar
    const tables = entityType
      ? [entityType]
      : ["clientes", "leads", "concorrentes"];

    const densityData: unknown[] = [];

    for (const table of tables) {
      const query = pesquisaId
        ? sql`
          SELECT 
            latitude,
            longitude,
            cidade,
            uf,
            qualidadeScore,
            '${sql.raw(table)}' as entityType
          FROM ${sql.raw(table)}
          WHERE projectId = ${projectId}
            AND pesquisaId = ${pesquisaId}
            AND latitude IS NOT NULL
            AND longitude IS NOT NULL
        `
        : sql`
          SELECT 
            latitude,
            longitude,
            cidade,
            uf,
            qualidadeScore,
            '${sql.raw(table)}' as entityType
          FROM ${sql.raw(table)}
          WHERE projectId = ${projectId}
            AND latitude IS NOT NULL
            AND longitude IS NOT NULL
        `;

      const result = await db.execute(query);
      const rows = (result as any)[0] || [];
      densityData.push(...rows);
    }

    return densityData;
  } catch (error) {
    console.error("[Database] Failed to get territorial density:", error);
    return [];
  }
}

/**
 * Buscar estatísticas de densidade por região (UF)
 */
export async function getDensityStatsByRegion(
  projectId: number,
  pesquisaId?: number
) {
  const db = await getDb();
  if (!db) return [];

  try {
    const query = pesquisaId
      ? sql`
        SELECT 
          uf,
          COUNT(*) as total,
          AVG(qualidadeScore) as qualidadeMedia,
          SUM(CASE WHEN qualidadeScore >= 80 THEN 1 ELSE 0 END) as altaQualidade
        FROM (
          SELECT uf, qualidadeScore FROM clientes 
          WHERE projectId = ${projectId} AND pesquisaId = ${pesquisaId} AND latitude IS NOT NULL
          UNION ALL
          SELECT uf, qualidadeScore FROM leads 
          WHERE projectId = ${projectId} AND pesquisaId = ${pesquisaId} AND latitude IS NOT NULL
          UNION ALL
          SELECT uf, qualidadeScore FROM concorrentes 
          WHERE projectId = ${projectId} AND pesquisaId = ${pesquisaId} AND latitude IS NOT NULL
        ) as combined
        WHERE uf IS NOT NULL
        GROUP BY uf
        ORDER BY total DESC
      `
      : sql`
        SELECT 
          uf,
          COUNT(*) as total,
          AVG(qualidadeScore) as qualidadeMedia,
          SUM(CASE WHEN qualidadeScore >= 80 THEN 1 ELSE 0 END) as altaQualidade
        FROM (
          SELECT uf, qualidadeScore FROM clientes 
          WHERE projectId = ${projectId} AND latitude IS NOT NULL
          UNION ALL
          SELECT uf, qualidadeScore FROM leads 
          WHERE projectId = ${projectId} AND latitude IS NOT NULL
          UNION ALL
          SELECT uf, qualidadeScore FROM concorrentes 
          WHERE projectId = ${projectId} AND latitude IS NOT NULL
        ) as combined
        WHERE uf IS NOT NULL
        GROUP BY uf
        ORDER BY total DESC
      `;

    const result = await db.execute(query);
    return (result as any)[0] || [];
  } catch (error) {
    console.error("[Database] Failed to get density stats by region:", error);
    return [];
  }
}

// ============================================
// FILTER OPTIONS HELPERS
// ============================================

export async function getFilterOptions() {
  const db = await getDb();
  if (!db) {
    return {
      estados: [],
      cidades: [],
      tags: [],
    };
  }

  try {
    // Buscar estados únicos de todas as entidades
    const estadosQuery = sql`
      SELECT DISTINCT uf as estado
      FROM (
        SELECT uf FROM clientes WHERE uf IS NOT NULL
        UNION
        SELECT uf FROM concorrentes WHERE uf IS NOT NULL
        UNION
        SELECT uf FROM leads WHERE uf IS NOT NULL
      ) as combined
      WHERE estado IS NOT NULL
      ORDER BY estado
    `;

    // Buscar cidades únicas de todas as entidades
    const cidadesQuery = sql`
      SELECT DISTINCT cidade
      FROM (
        SELECT cidade FROM clientes WHERE cidade IS NOT NULL
        UNION
        SELECT cidade FROM concorrentes WHERE cidade IS NOT NULL
        UNION
        SELECT cidade FROM leads WHERE cidade IS NOT NULL
      ) as combined
      WHERE cidade IS NOT NULL
      ORDER BY cidade
    `;

    // Buscar tags únicas
    const tagsQuery = sql`
      SELECT DISTINCT tag
      FROM (
        SELECT TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(tags, ',', numbers.n), ',', -1)) as tag
        FROM (
          SELECT tags FROM clientes WHERE tags IS NOT NULL AND tags != ''
          UNION ALL
          SELECT tags FROM concorrentes WHERE tags IS NOT NULL AND tags != ''
          UNION ALL
          SELECT tags FROM leads WHERE tags IS NOT NULL AND tags != ''
        ) as entities
        JOIN (
          SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
          UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
        ) numbers
        ON CHAR_LENGTH(entities.tags) - CHAR_LENGTH(REPLACE(entities.tags, ',', '')) >= numbers.n - 1
      ) as all_tags
      WHERE tag IS NOT NULL AND tag != ''
      ORDER BY tag
    `;

    const [estadosResult, cidadesResult, tagsResult] = await Promise.all([
      db.execute(estadosQuery),
      db.execute(cidadesQuery),
      db.execute(tagsQuery),
    ]);

    return {
      estados: ((estadosResult as any)[0] || [])
        .map((row: Record<string, unknown>) => row.estado)
        .filter(Boolean),
      cidades: ((cidadesResult as any)[0] || [])
        .map((row: Record<string, unknown>) => row.cidade)
        .filter(Boolean),
      tags: ((tagsResult as any)[0] || [])
        .map((row: Record<string, unknown>) => row.tag)
        .filter(Boolean),
    };
  } catch (error) {
    console.error("[Database] Failed to get filter options:", error);
    return {
      estados: [],
      cidades: [],
      tags: [],
    };
  }
}
