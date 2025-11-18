import { eq, sql, and, or, like, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  mercadosUnicos, clientes, clientesMercados, 
  concorrentes, leads,
  MercadoUnico, Cliente, Concorrente, Lead
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

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;

  const [mercadosCount] = await db.select({ count: count() }).from(mercadosUnicos);
  const [clientesCount] = await db.select({ count: count() }).from(clientes);
  const [concorrentesCount] = await db.select({ count: count() }).from(concorrentes);
  const [leadsCount] = await db.select({ count: count() }).from(leads);

  // Contagem por status de validação
  const clientesStatus = await db
    .select({ 
      status: clientes.validationStatus, 
      count: count() 
    })
    .from(clientes)
    .groupBy(clientes.validationStatus);

  const concorrentesStatus = await db
    .select({ 
      status: concorrentes.validationStatus, 
      count: count() 
    })
    .from(concorrentes)
    .groupBy(concorrentes.validationStatus);

  const leadsStatus = await db
    .select({ 
      status: leads.validationStatus, 
      count: count() 
    })
    .from(leads)
    .groupBy(leads.validationStatus);

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
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(mercadosUnicos);

  if (params?.search) {
    query = query.where(
      or(
        like(mercadosUnicos.nome, `%${params.search}%`),
        like(mercadosUnicos.categoria, `%${params.search}%`)
      )
    ) as any;
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

export async function getAllClientes(validationStatus?: string) {
  const db = await getDb();
  if (!db) return [];

  if (validationStatus) {
    return await db.select().from(clientes).where(eq(clientes.validationStatus, validationStatus as any));
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

export async function getAllConcorrentes(validationStatus?: string) {
  const db = await getDb();
  if (!db) return [];

  if (validationStatus) {
    return await db.select().from(concorrentes).where(eq(concorrentes.validationStatus, validationStatus as any));
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

export async function getAllLeads(validationStatus?: string) {
  const db = await getDb();
  if (!db) return [];

  if (validationStatus) {
    return await db.select().from(leads).where(eq(leads.validationStatus, validationStatus as any));
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
