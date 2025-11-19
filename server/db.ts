import { eq, sql, and, or, like, count, desc, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  projects, Project, InsertProject,
  mercadosUnicos, clientes, clientesMercados, 
  concorrentes, leads,
  projectTemplates, ProjectTemplate, InsertProjectTemplate,
  notifications, Notification, InsertNotification,
  MercadoUnico, Cliente, Concorrente, Lead,
  activityLog, ActivityLog, InsertActivityLog
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
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
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
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

// ============================================
// DASHBOARD HELPERS
// ============================================

export async function getDashboardStats(projectId?: number) {
  const db = await getDb();
  if (!db) return null;

  // Filtrar por projeto se especificado
  const mercadosQuery = projectId 
    ? db.select({ count: count() }).from(mercadosUnicos).where(eq(mercadosUnicos.projectId, projectId))
    : db.select({ count: count() }).from(mercadosUnicos);
  const [mercadosCount] = await mercadosQuery;

  const clientesQuery = projectId
    ? db.select({ count: count() }).from(clientes).where(eq(clientes.projectId, projectId))
    : db.select({ count: count() }).from(clientes);
  const [clientesCount] = await clientesQuery;

  const concorrentesQuery = projectId
    ? db.select({ count: count() }).from(concorrentes).where(eq(concorrentes.projectId, projectId))
    : db.select({ count: count() }).from(concorrentes);
  const [concorrentesCount] = await concorrentesQuery;

  const leadsQuery = projectId
    ? db.select({ count: count() }).from(leads).where(eq(leads.projectId, projectId))
    : db.select({ count: count() }).from(leads);
  const [leadsCount] = await leadsQuery;

  // Contagem por status de validação
  const clientesStatusQuery = db
    .select({ 
      status: clientes.validationStatus, 
      count: count() 
    })
    .from(clientes);
  if (projectId) {
    clientesStatusQuery.where(eq(clientes.projectId, projectId));
  }
  const clientesStatus = await clientesStatusQuery.groupBy(clientes.validationStatus);

  const concorrentesStatusQuery = db
    .select({ 
      status: concorrentes.validationStatus, 
      count: count() 
    })
    .from(concorrentes);
  if (projectId) {
    concorrentesStatusQuery.where(eq(concorrentes.projectId, projectId));
  }
  const concorrentesStatus = await concorrentesStatusQuery.groupBy(concorrentes.validationStatus);

  const leadsStatusQuery = db
    .select({ 
      status: leads.validationStatus, 
      count: count() 
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
    }
  };
}

// ============================================
// MERCADO HELPERS
// ============================================

export async function getMercados(params?: {
  projectId?: number;
  search?: string;
  categoria?: string;
  segmentacao?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(mercadosUnicos);

  // Filtrar por projeto se fornecido
  const conditions = [];
  if (params?.projectId) {
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

export async function getAllClientes(params?: { projectId?: number; validationStatus?: string }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (params?.projectId) {
    conditions.push(eq(clientes.projectId, params.projectId));
  }
  if (params?.validationStatus) {
    conditions.push(eq(clientes.validationStatus, params.validationStatus as any));
  }

  if (conditions.length > 0) {
    return await db.select().from(clientes).where(and(...conditions)!);
  }

  return await db.select().from(clientes);
}

export async function getClientesByMercado(mercadoId: number, validationStatus?: string) {
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
      segmentacaoB2bB2c: clientes.segmentacaoB2bB2c,
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
      segmentacaoB2bB2c: clientes.segmentacaoB2bB2c,
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
      validatedAt: new Date(),
    })
    .where(eq(clientes.id, id));

  return { success: true };
}

// ============================================
// CONCORRENTE HELPERS
// ============================================

export async function getAllConcorrentes(params?: { projectId?: number; validationStatus?: string }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (params?.projectId) {
    conditions.push(eq(concorrentes.projectId, params.projectId));
  }
  if (params?.validationStatus) {
    conditions.push(eq(concorrentes.validationStatus, params.validationStatus as any));
  }

  if (conditions.length > 0) {
    return await db.select().from(concorrentes).where(and(...conditions)!);
  }

  return await db.select().from(concorrentes);
}

export async function getConcorrentesByMercado(mercadoId: number, validationStatus?: string) {
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
      validatedAt: new Date(),
    })
    .where(eq(concorrentes.id, id));

  return { success: true };
}

// ============================================
// LEAD HELPERS
// ============================================

export async function getAllLeads(params?: { projectId?: number; validationStatus?: string }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (params?.projectId) {
    conditions.push(eq(leads.projectId, params.projectId));
  }
  if (params?.validationStatus) {
    conditions.push(eq(leads.validationStatus, params.validationStatus as any));
  }

  if (conditions.length > 0) {
    return await db.select().from(leads).where(and(...conditions)!);
  }

  return await db.select().from(leads);
}

export async function getLeadsByMercado(mercadoId: number, validationStatus?: string) {
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
      validatedAt: new Date(),
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
    const [mercadosCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(mercadosUnicos);
    const [clientesCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(clientes);
    const [concorrentesCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(concorrentes);
    const [leadsCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(leads);

    // Contar por status (clientes + concorrentes + leads)
    const [clientesRich] = await db.select({ count: sql<number>`COUNT(*)` })
      .from(clientes)
      .where(eq(clientes.validationStatus, 'rich'));
    
    const [clientesPendentes] = await db.select({ count: sql<number>`COUNT(*)` })
      .from(clientes)
      .where(eq(clientes.validationStatus, 'pending'));
    
    const [clientesDiscarded] = await db.select({ count: sql<number>`COUNT(*)` })
      .from(clientes)
      .where(eq(clientes.validationStatus, 'discarded'));

    const [concorrentesRich] = await db.select({ count: sql<number>`COUNT(*)` })
      .from(concorrentes)
      .where(eq(concorrentes.validationStatus, 'rich'));
    
    const [concorrentesPendentes] = await db.select({ count: sql<number>`COUNT(*)` })
      .from(concorrentes)
      .where(eq(concorrentes.validationStatus, 'pending'));
    
    const [concorrentesDiscarded] = await db.select({ count: sql<number>`COUNT(*)` })
      .from(concorrentes)
      .where(eq(concorrentes.validationStatus, 'discarded'));

    const [leadsRich] = await db.select({ count: sql<number>`COUNT(*)` })
      .from(leads)
      .where(eq(leads.validationStatus, 'rich'));
    
    const [leadsPendentes] = await db.select({ count: sql<number>`COUNT(*)` })
      .from(leads)
      .where(eq(leads.validationStatus, 'pending'));
    
    const [leadsDiscarded] = await db.select({ count: sql<number>`COUNT(*)` })
      .from(leads)
      .where(eq(leads.validationStatus, 'discarded'));

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
      .leftJoin(clientesMercados, eq(mercadosUnicos.id, clientesMercados.mercadoId))
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
        percentual: Number(p.total) > 0 ? Math.round((Number(p.validados) / Number(p.total)) * 100) : 0,
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
  const inserted = await db.select().from(tags).orderBy(sql`id DESC`).limit(1);
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

export async function addTagToEntity(tagId: number, entityType: string, entityId: number) {
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

export async function removeTagFromEntity(tagId: number, entityType: string, entityId: number) {
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
  
  return await db.select().from(savedFilters).where(eq(savedFilters.userId, userId));
}

export async function createSavedFilter(data: { userId: string; name: string; filtersJson: string }) {
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
      segmentacao: clientes.segmentacaoB2bB2c,
      count: sql<number>`count(*)`.as("count"),
    })
    .from(clientes)
    .where(sql`${clientes.segmentacaoB2bB2c} IS NOT NULL`)
    .groupBy(clientes.segmentacaoB2bB2c);
  
  return result;
}

export async function getTimelineValidacoes(days: number = 30) {
  const db = await getDb();
  if (!db) return [];
  
  const { clientes } = await import("../drizzle/schema");
  const { sql } = await import("drizzle-orm");
  
  const result = await db
    .select({
      date: sql<string>`DATE(${clientes.validatedAt})`.as("date"),
      count: sql<number>`count(*)`.as("count"),
    })
    .from(clientes)
    .where(sql`${clientes.validatedAt} >= DATE_SUB(NOW(), INTERVAL ${days} DAY)`)
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
      stageUpdatedAt: new Date(),
    })
    .where(eq(leads.id, leadId));
}

export async function getLeadsByStage(mercadoId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get leads by stage: database not available");
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
      .orderBy(projects.nome);
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

export async function createProject(data: InsertProject): Promise<Project | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.insert(projects).values(data);
    const insertId = Number(result[0].insertId);
    return await getProjectById(insertId) || null;
  } catch (error) {
    console.error("[Database] Failed to create project:", error);
    return null;
  }
}

export async function updateProject(id: number, data: Partial<InsertProject>): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  try {
    await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id));
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
      .set({ ativo: 0, updatedAt: new Date() })
      .where(eq(projects.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete project:", error);
    return false;
  }
}


// ============================================
// CRUD - MERCADOS
// ============================================

export async function createMercado(data: {
  projectId: number;
  nome: string;
  categoria?: string | null;
  segmentacao?: 'B2B' | 'B2C' | 'B2B2C' | null;
  tamanhoMercado?: string | null;
  crescimentoAnual?: string | null;
  tendencias?: string | null;
  principaisPlayers?: string | null;
  quantidadeClientes?: number | null;
}) {
  const db = await getDb();
  if (!db) return null;

  const mercadoHash = `${data.nome}-${data.projectId}`.toLowerCase().replace(/\s+/g, '-');

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

  return await getMercadoById(Number(result.insertId));
}

export async function updateMercado(id: number, data: {
  nome?: string;
  categoria?: string;
  segmentacao?: string;
  tamanhoMercado?: string;
  crescimentoAnual?: string;
  tendencias?: string;
  principaisPlayers?: string;
}) {
  const db = await getDb();
  if (!db) return null;

  const updateData: any = {};
  if (data.nome !== undefined) updateData.nome = data.nome;
  if (data.categoria !== undefined) updateData.categoria = data.categoria;
  if (data.segmentacao !== undefined) updateData.segmentacao = data.segmentacao;
  if (data.tamanhoMercado !== undefined) updateData.tamanhoMercado = data.tamanhoMercado;
  if (data.crescimentoAnual !== undefined) updateData.crescimentoAnual = data.crescimentoAnual;
  if (data.tendencias !== undefined) updateData.tendencias = data.tendencias;
  if (data.principaisPlayers !== undefined) updateData.principaisPlayers = data.principaisPlayers;

  await db.update(mercadosUnicos)
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
  nome: string;
  cnpj?: string | null;
  siteOficial?: string | null;
  produtoPrincipal?: string | null;
  segmentacaoB2bB2c?: 'B2B' | 'B2C' | 'B2B2C' | null;
  email?: string | null;
  telefone?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  cidade?: string | null;
  uf?: string | null;
  cnae?: string | null;
  porte?: 'MEI' | 'Pequena' | 'Média' | 'Grande' | null;
  qualidadeScore?: number | null;
  qualidadeClassificacao?: string | null;
  validationStatus?: 'pending' | 'rich' | 'needs_adjustment' | 'discarded' | null;
}) {
  const db = await getDb();
  if (!db) return null;

  const clienteHash = `${data.nome}-${data.cnpj || Date.now()}-${data.projectId}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // Verificar se já existe um cliente com esse hash
  const existing = await db.select().from(clientes)
    .where(and(
      eq(clientes.clienteHash, clienteHash),
      eq(clientes.projectId, data.projectId)
    ))
    .limit(1);

  if (existing.length > 0) {
    // Atualizar cliente existente
    await db.update(clientes)
      .set({
        nome: data.nome,
        cnpj: data.cnpj || null,
        siteOficial: data.siteOficial || null,
        produtoPrincipal: data.produtoPrincipal || null,
        segmentacaoB2bB2c: data.segmentacaoB2bB2c || null,
        email: data.email || null,
        telefone: data.telefone || null,
        linkedin: data.linkedin || null,
        instagram: data.instagram || null,
        cidade: data.cidade || null,
        uf: data.uf || null,
        cnae: data.cnae || null,
        porte: data.porte || null,
        qualidadeScore: data.qualidadeScore || existing[0].qualidadeScore,
        qualidadeClassificacao: data.qualidadeClassificacao || existing[0].qualidadeClassificacao,
      })
      .where(eq(clientes.id, existing[0].id));
    
    return existing[0];
  }

  // Criar novo cliente
  const [result] = await db.insert(clientes).values({
    projectId: data.projectId,
    clienteHash,
    nome: data.nome,
    cnpj: data.cnpj || null,
    siteOficial: data.siteOficial || null,
    produtoPrincipal: data.produtoPrincipal || null,
    segmentacaoB2bB2c: data.segmentacaoB2bB2c || null,
    email: data.email || null,
    telefone: data.telefone || null,
    linkedin: data.linkedin || null,
    instagram: data.instagram || null,
    cidade: data.cidade || null,
    uf: data.uf || null,
    cnae: data.cnae || null,
    porte: data.porte || null,
    qualidadeScore: data.qualidadeScore || 0,
    qualidadeClassificacao: data.qualidadeClassificacao || 'Ruim',
    validationStatus: data.validationStatus || 'pending',
  });

  if (!result.insertId) return null;

  const [cliente] = await db.select().from(clientes).where(eq(clientes.id, Number(result.insertId)));
  return cliente;
}

export async function associateClienteToMercado(clienteId: number, mercadoId: number) {
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
    console.error('Error associating cliente to mercado:', error);
    return false;
  }
}

export async function updateCliente(id: number, data: Partial<{
  nome: string;
  cnpj: string;
  siteOficial: string;
  produtoPrincipal: string;
  segmentacaoB2bB2c: string;
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
}>) {
  const db = await getDb();
  if (!db) return null;

  const updateData: any = {};
  Object.keys(data).forEach(key => {
    if (data[key as keyof typeof data] !== undefined) {
      updateData[key] = data[key as keyof typeof data];
    }
  });

  await db.update(clientes)
    .set(updateData)
    .where(eq(clientes.id, id));

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
  mercadoId: number;
  nome: string;
  cnpj?: string | null;
  site?: string | null;
  produto?: string | null;
  porte?: 'MEI' | 'Pequena' | 'Média' | 'Grande' | null;
  faturamentoEstimado?: string | null;
  qualidadeScore?: number | null;
  qualidadeClassificacao?: string | null;
  validationStatus?: 'pending' | 'rich' | 'needs_adjustment' | 'discarded' | null;
}) {
  const db = await getDb();
  if (!db) return null;

  const concorrenteHash = `${data.nome}-${data.mercadoId}-${Date.now()}`.toLowerCase().replace(/\s+/g, '-');

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
    qualidadeClassificacao: data.qualidadeClassificacao || 'Ruim',
    validationStatus: data.validationStatus || 'pending',
  });

  if (!result.insertId) return null;

  const [concorrente] = await db.select().from(concorrentes).where(eq(concorrentes.id, Number(result.insertId)));
  return concorrente;
}

export async function updateConcorrente(id: number, data: Partial<{
  nome: string;
  cnpj: string;
  site: string;
  produto: string;
  porte: string;
  faturamentoEstimado: string;
  qualidadeScore: number;
  qualidadeClassificacao: string;
  validationStatus: string;
}>) {
  const db = await getDb();
  if (!db) return null;

  const updateData: any = {};
  Object.keys(data).forEach(key => {
    if (data[key as keyof typeof data] !== undefined) {
      updateData[key] = data[key as keyof typeof data];
    }
  });

  await db.update(concorrentes)
    .set(updateData)
    .where(eq(concorrentes.id, id));

  const [concorrente] = await db.select().from(concorrentes).where(eq(concorrentes.id, id));
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
  mercadoId: number;
  nome: string;
  cnpj?: string | null;
  site?: string | null;
  email?: string | null;
  telefone?: string | null;
  tipo?: 'inbound' | 'outbound' | 'referral' | null;
  porte?: 'MEI' | 'Pequena' | 'Média' | 'Grande' | null;
  regiao?: string | null;
  setor?: string | null;
  qualidadeScore?: number | null;
  qualidadeClassificacao?: string | null;
  validationStatus?: 'pending' | 'rich' | 'needs_adjustment' | 'discarded' | null;
}) {
  const db = await getDb();
  if (!db) return null;

  const leadHash = `${data.nome}-${data.mercadoId}-${Date.now()}`.toLowerCase().replace(/\s+/g, '-');

  // Usar SQL raw para evitar problemas de tipos do Drizzle
  const result = await db.execute(sql`
    INSERT INTO leads (
      projectId, mercadoId, leadHash, nome, cnpj, site, email, telefone,
      tipo, porte, regiao, setor, qualidadeScore, qualidadeClassificacao,
      validationStatus
    ) VALUES (
      ${data.projectId}, ${data.mercadoId}, ${leadHash}, ${data.nome},
      ${data.cnpj || null}, ${data.site || null}, ${data.email || null}, ${data.telefone || null},
      ${data.tipo || null}, ${data.porte || null}, ${data.regiao || null}, ${data.setor || null},
      ${data.qualidadeScore || 0}, ${data.qualidadeClassificacao || 'Ruim'},
      ${data.validationStatus || 'pending'}
    )
  `) as any;

  if (!result.insertId) return null;

  const [lead] = await db.select().from(leads).where(eq(leads.id, Number(result.insertId)));
  return lead;
}

export async function updateLead(id: number, data: Partial<{
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
}>) {
  const db = await getDb();
  if (!db) return null;

  const updateData: any = {};
  Object.keys(data).forEach(key => {
    if (data[key as keyof typeof data] !== undefined) {
      updateData[key] = data[key as keyof typeof data];
    }
  });

  await db.update(leads)
    .set(updateData)
    .where(eq(leads.id, id));

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

  return await db.select().from(projectTemplates).orderBy(projectTemplates.isDefault, projectTemplates.name);
}

export async function getTemplateById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const [template] = await db.select().from(projectTemplates).where(eq(projectTemplates.id, id));
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

export async function updateTemplate(id: number, data: Partial<{
  name: string;
  description: string;
  config: string;
  isDefault: number;
}>) {
  const db = await getDb();
  if (!db) return null;

  const updateData: any = {};
  Object.keys(data).forEach(key => {
    if (data[key as keyof typeof data] !== undefined) {
      updateData[key] = data[key as keyof typeof data];
    }
  });

  if (Object.keys(updateData).length > 0) {
    await db.update(projectTemplates)
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
    throw new Error('Não é possível deletar templates padrão');
  }

  await db.delete(projectTemplates).where(eq(projectTemplates.id, id));
  return true;
}


// ============================================
// ADVANCED SEARCH - LEADS
// ============================================

export async function searchLeadsAdvanced(
  projectId: number,
  filter: any,
  page: number = 1,
  pageSize: number = 20
) {
  const db = await getDb();
  if (!db) return { data: [], total: 0, page, pageSize };

  const { buildDynamicQuery, validateFilter } = await import('./queryBuilder');
  
  // Validar filtro
  const validation = validateFilter(filter);
  if (!validation.valid) {
    throw new Error(validation.error || 'Filtro inválido');
  }

  // Construir query dinâmica
  const whereClause = buildDynamicQuery(leads, filter);
  
  // Combinar filtro de projeto com filtros dinâmicos
  const finalWhere = whereClause 
    ? and(eq(leads.projectId, projectId), whereClause)
    : eq(leads.projectId, projectId);
  
  // Base query
  const query = db.select().from(leads).where(finalWhere as any);

  // Contar total
  const countQuery = db.select({ count: count() }).from(leads).where(
    whereClause 
      ? and(eq(leads.projectId, projectId), whereClause) as any
      : eq(leads.projectId, projectId)
  );
  
  const [{ count: total }] = await countQuery as any;

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

  const result = await db.execute(sql`
    SELECT 
      stage,
      COUNT(*) as count
    FROM leads
    WHERE projectId = ${projectId}
    GROUP BY stage
  `) as any;

  return result.rows || result;
}

export async function getLeadsByMercadoStats(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      m.nome as mercadoNome,
      COUNT(l.id) as leadCount
    FROM mercados_unicos m
    LEFT JOIN leads l ON l.mercadoId = m.id
    WHERE m.projectId = ${projectId}
    GROUP BY m.id, m.nome
    ORDER BY leadCount DESC
    LIMIT 10
  `) as any;

  return result.rows || result;
}

export async function getQualityScoreEvolution(projectId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      DATE(createdAt) as date,
      AVG(qualidadeScore) as avgScore,
      COUNT(*) as count
    FROM leads
    WHERE projectId = ${projectId}
      AND createdAt >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
    GROUP BY DATE(createdAt)
    ORDER BY date ASC
  `) as any;

  return result.rows || result;
}

export async function getLeadsGrowthOverTime(projectId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      DATE(createdAt) as date,
      COUNT(*) as count,
      SUM(COUNT(*)) OVER (ORDER BY DATE(createdAt)) as cumulative
    FROM leads
    WHERE projectId = ${projectId}
      AND createdAt >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
    GROUP BY DATE(createdAt)
    ORDER BY date ASC
  `) as any;

  return result.rows || result;
}

export async function getDashboardKPIs(projectId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.execute(sql`
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
  `) as any;

  const row = (result.rows && result.rows[0]) || result[0];
  
  if (!row) return null;

  return {
    totalLeads: Number(row.totalLeads) || 0,
    closedLeads: Number(row.closedLeads) || 0,
    conversionRate: row.totalLeads > 0 ? (Number(row.closedLeads) / Number(row.totalLeads)) * 100 : 0,
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
  type: 'lead_quality' | 'lead_closed' | 'new_competitor' | 'market_threshold' | 'data_incomplete';
  title: string;
  message: string;
  entityType?: 'mercado' | 'cliente' | 'concorrente' | 'lead';
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

  const [notification] = await db.select().from(notifications).where(eq(notifications.id, Number(result.insertId)));
  return notification;
}

export async function getUserNotifications(userId: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(sql`createdAt DESC`)
    .limit(limit);
}

export async function getUnreadNotificationsCount(userId: string) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select({ count: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, 0)));

  return Number(result[0]?.count || 0);
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) return false;

  await db.update(notifications)
    .set({ isRead: 1 })
    .where(eq(notifications.id, id));

  return true;
}

export async function markAllNotificationsAsRead(userId: string) {
  const db = await getDb();
  if (!db) return false;

  await db.update(notifications)
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
export async function checkAndNotifyHighQualityLead(leadId: number, qualityScore: number, userId?: string) {
  if (qualityScore >= 80) {
    const db = await getDb();
    if (!db) return;

    const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));
    if (!lead) return;

    await createNotification({
      userId,
      projectId: lead.projectId,
      type: 'lead_quality',
      title: '🎯 Lead de Alta Qualidade!',
      message: `O lead "${lead.nome}" foi identificado com score de ${qualityScore}/100`,
      entityType: 'lead',
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
    type: 'lead_closed',
    title: '✅ Lead Fechado!',
    message: `O lead "${lead.nome}" foi marcado como fechado`,
    entityType: 'lead',
    entityId: leadId,
  });
}

/**
 * Trigger: Notificar quando novo concorrente é identificado
 */
export async function notifyNewCompetitor(concorrenteId: number, userId?: string) {
  const db = await getDb();
  if (!db) return;

  const [concorrente] = await db.select().from(concorrentes).where(eq(concorrentes.id, concorrenteId));
  if (!concorrente) return;

  await createNotification({
    userId,
    projectId: concorrente.projectId,
    type: 'new_competitor',
    title: '🔍 Novo Concorrente Identificado',
    message: `Concorrente "${concorrente.nome}" foi adicionado ao projeto`,
    entityType: 'concorrente',
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
    .innerJoin(clientesMercados, eq(clientesMercados.mercadoId, mercadosUnicos.id))
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
export async function createEnrichmentRun(projectId: number, totalClients: number) {
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
  
  await db
    .update(enrichmentRuns)
    .set(data)
    .where(eq(enrichmentRuns.id, runId));
}

/**
 * Busca histórico de execuções de um projeto
 */
export async function getEnrichmentHistory(projectId: number, limit: number = 10) {
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
import { scheduledEnrichments, InsertScheduledEnrichment } from "../drizzle/schema";

export async function createScheduledEnrichment(data: InsertScheduledEnrichment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(scheduledEnrichments).values(data);
  return result.insertId;
}

export async function listScheduledEnrichments(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(scheduledEnrichments)
    .where(eq(scheduledEnrichments.projectId, projectId))
    .orderBy(scheduledEnrichments.scheduledAt);
}

export async function cancelScheduledEnrichment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(scheduledEnrichments)
    .set({ status: "cancelled" })
    .where(eq(scheduledEnrichments.id, id));
}

export async function deleteScheduledEnrichment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(scheduledEnrichments).where(eq(scheduledEnrichments.id, id));
}


// ========== Alert Configs Functions ==========

import { alertConfigs, InsertAlertConfig, alertHistory, InsertAlertHistory, leadConversions, InsertLeadConversion } from "../drizzle/schema";

export async function createAlertConfig(config: InsertAlertConfig) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
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

export async function updateAlertConfig(id: number, updates: Partial<InsertAlertConfig>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db
    .update(alertConfigs)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(alertConfigs.id, id));
}

export async function deleteAlertConfig(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db
    .delete(alertConfigs)
    .where(eq(alertConfigs.id, id));
}

// ============================================
// ALERT HISTORY HELPERS
// ============================================

export async function createAlertHistory(history: InsertAlertHistory) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
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
  if (!db) throw new Error('Database not available');
  
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
  if (!db) throw new Error('Database not available');
  
  await db
    .delete(leadConversions)
    .where(eq(leadConversions.id, id));
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
    .where(and(
      eq(leadConversions.projectId, projectId),
      eq(leadConversions.status, 'won')
    ));
  const totalConversions = conversionsResult[0]?.count || 0;
  
  // Valor total de deals
  const dealValueResult = await db
    .select({ total: sql<number>`SUM(dealValue)` })
    .from(leadConversions)
    .where(and(
      eq(leadConversions.projectId, projectId),
      eq(leadConversions.status, 'won')
    ));
  const totalDealValue = dealValueResult[0]?.total || 0;
  
  // Taxa de conversão
  const conversionRate = totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0;
  
  // Valor médio de deal
  const averageDealValue = totalConversions > 0 ? totalDealValue / totalConversions : 0;
  
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
    .where(and(
      eq(leadConversions.projectId, projectId),
      eq(leadConversions.status, 'won')
    ))
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
  stageCountsResult.forEach((row: any) => {
    stageCounts[row.stage] = row.count;
  });
  
  // Ordem dos estágios
  const stages = ['novo', 'qualificado', 'negociacao', 'fechado', 'perdido'];
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
    totalLeads: Object.values(stageCounts).reduce((sum, count) => sum + count, 0),
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

export async function getRecentActivities(projectId: number, limit: number = 30) {
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
