"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o)
            if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = getDb;
exports.upsertUser = upsertUser;
exports.getUser = getUser;
exports.getDashboardStats = getDashboardStats;
exports.getMercados = getMercados;
exports.getMercadoById = getMercadoById;
exports.getAllClientes = getAllClientes;
exports.getClientesByMercado = getClientesByMercado;
exports.getClientesByMercadoPaginated = getClientesByMercadoPaginated;
exports.updateClienteValidation = updateClienteValidation;
exports.getAllConcorrentes = getAllConcorrentes;
exports.getConcorrentesByMercado = getConcorrentesByMercado;
exports.getConcorrentesByMercadoPaginated = getConcorrentesByMercadoPaginated;
exports.updateConcorrenteValidation = updateConcorrenteValidation;
exports.getAllLeads = getAllLeads;
exports.getLeadsByMercado = getLeadsByMercado;
exports.getLeadsByMercadoPaginated = getLeadsByMercadoPaginated;
exports.updateLeadValidation = updateLeadValidation;
exports.getAnalyticsProgress = getAnalyticsProgress;
exports.getAllTags = getAllTags;
exports.createTag = createTag;
exports.deleteTag = deleteTag;
exports.getEntityTags = getEntityTags;
exports.addTagToEntity = addTagToEntity;
exports.removeTagFromEntity = removeTagFromEntity;
exports.getEntitiesByTag = getEntitiesByTag;
exports.getSavedFilters = getSavedFilters;
exports.createSavedFilter = createSavedFilter;
exports.deleteSavedFilter = deleteSavedFilter;
exports.getDistribuicaoGeografica = getDistribuicaoGeografica;
exports.getDistribuicaoSegmentacao = getDistribuicaoSegmentacao;
exports.getTimelineValidacoes = getTimelineValidacoes;
exports.getFunilConversao = getFunilConversao;
exports.getTop10Mercados = getTop10Mercados;
exports.updateLeadStage = updateLeadStage;
exports.getLeadsByStage = getLeadsByStage;
exports.getProjects = getProjects;
exports.getProjectById = getProjectById;
exports.createProject = createProject;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;
exports.createMercado = createMercado;
exports.updateMercado = updateMercado;
exports.deleteMercado = deleteMercado;
exports.createCliente = createCliente;
exports.associateClienteToMercado = associateClienteToMercado;
exports.updateCliente = updateCliente;
exports.deleteCliente = deleteCliente;
exports.createConcorrente = createConcorrente;
exports.updateConcorrente = updateConcorrente;
exports.deleteConcorrente = deleteConcorrente;
exports.createLead = createLead;
exports.updateLead = updateLead;
exports.deleteLead = deleteLead;
exports.getAllTemplates = getAllTemplates;
exports.getTemplateById = getTemplateById;
exports.createTemplate = createTemplate;
exports.updateTemplate = updateTemplate;
exports.deleteTemplate = deleteTemplate;
exports.searchLeadsAdvanced = searchLeadsAdvanced;
exports.getLeadsByStageStats = getLeadsByStageStats;
exports.getLeadsByMercadoStats = getLeadsByMercadoStats;
exports.getQualityScoreEvolution = getQualityScoreEvolution;
exports.getLeadsGrowthOverTime = getLeadsGrowthOverTime;
exports.getDashboardKPIs = getDashboardKPIs;
exports.createNotification = createNotification;
exports.getUserNotifications = getUserNotifications;
exports.getUnreadNotificationsCount = getUnreadNotificationsCount;
exports.markNotificationAsRead = markNotificationAsRead;
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
exports.deleteNotification = deleteNotification;
exports.checkAndNotifyHighQualityLead = checkAndNotifyHighQualityLead;
exports.notifyLeadClosed = notifyLeadClosed;
exports.notifyNewCompetitor = notifyNewCompetitor;
exports.getEnrichmentProgress = getEnrichmentProgress;
exports.createEnrichmentRun = createEnrichmentRun;
exports.updateEnrichmentRun = updateEnrichmentRun;
exports.getEnrichmentHistory = getEnrichmentHistory;
exports.getActiveEnrichmentRun = getActiveEnrichmentRun;
exports.createScheduledEnrichment = createScheduledEnrichment;
exports.listScheduledEnrichments = listScheduledEnrichments;
exports.cancelScheduledEnrichment = cancelScheduledEnrichment;
exports.deleteScheduledEnrichment = deleteScheduledEnrichment;
exports.createAlertConfig = createAlertConfig;
exports.getAlertConfigs = getAlertConfigs;
exports.updateAlertConfig = updateAlertConfig;
exports.deleteAlertConfig = deleteAlertConfig;
exports.createAlertHistory = createAlertHistory;
exports.getAlertHistory = getAlertHistory;
exports.createLeadConversion = createLeadConversion;
exports.getLeadConversions = getLeadConversions;
exports.deleteLeadConversion = deleteLeadConversion;
exports.calculateROIMetrics = calculateROIMetrics;
exports.getFunnelData = getFunnelData;
exports.logActivity = logActivity;
exports.getRecentActivities = getRecentActivities;
exports.getEvolutionData = getEvolutionData;
exports.getGeographicDistribution = getGeographicDistribution;
exports.getSegmentationDistribution = getSegmentationDistribution;
exports.globalSearch = globalSearch;
exports.createProduto = createProduto;
exports.getProdutosByCliente = getProdutosByCliente;
exports.getProdutosByMercado = getProdutosByMercado;
exports.getProdutosByProject = getProdutosByProject;
exports.getProdutoById = getProdutoById;
exports.updateProduto = updateProduto;
exports.deleteProduto = deleteProduto;
const drizzle_orm_1 = require("drizzle-orm");
const mysql2_1 = require("drizzle-orm/mysql2");
const schema_1 = require("../drizzle/schema");
const env_1 = require("./_core/env");
let _db = null;
// Lazily create the drizzle instance so local tooling can run without a DB.
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = (0, mysql2_1.drizzle)(process.env.DATABASE_URL);
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
async function upsertUser(user) {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      id: user.id,
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = field => {
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
      if (user.id === env_1.ENV.ownerId) {
        user.role = "admin";
        values.role = "admin";
        updateSet.role = "admin";
      }
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }
    await db.insert(schema_1.users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUser(id) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }
  const result = await db
    .select()
    .from(schema_1.users)
    .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}
// ============================================
// DASHBOARD HELPERS
// ============================================
async function getDashboardStats(projectId) {
  const db = await getDb();
  if (!db) return null;
  // Filtrar por projeto se especificado
  const mercadosQuery = projectId
    ? db
        .select({ count: (0, drizzle_orm_1.count)() })
        .from(schema_1.mercadosUnicos)
        .where(
          (0, drizzle_orm_1.eq)(schema_1.mercadosUnicos.projectId, projectId)
        )
    : db
        .select({ count: (0, drizzle_orm_1.count)() })
        .from(schema_1.mercadosUnicos);
  const [mercadosCount] = await mercadosQuery;
  const clientesQuery = projectId
    ? db
        .select({ count: (0, drizzle_orm_1.count)() })
        .from(schema_1.clientes)
        .where((0, drizzle_orm_1.eq)(schema_1.clientes.projectId, projectId))
    : db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.clientes);
  const [clientesCount] = await clientesQuery;
  const concorrentesQuery = projectId
    ? db
        .select({ count: (0, drizzle_orm_1.count)() })
        .from(schema_1.concorrentes)
        .where(
          (0, drizzle_orm_1.eq)(schema_1.concorrentes.projectId, projectId)
        )
    : db
        .select({ count: (0, drizzle_orm_1.count)() })
        .from(schema_1.concorrentes);
  const [concorrentesCount] = await concorrentesQuery;
  const leadsQuery = projectId
    ? db
        .select({ count: (0, drizzle_orm_1.count)() })
        .from(schema_1.leads)
        .where((0, drizzle_orm_1.eq)(schema_1.leads.projectId, projectId))
    : db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.leads);
  const [leadsCount] = await leadsQuery;
  // Contagem por status de validação
  const clientesStatusQuery = db
    .select({
      status: schema_1.clientes.validationStatus,
      count: (0, drizzle_orm_1.count)(),
    })
    .from(schema_1.clientes);
  if (projectId) {
    clientesStatusQuery.where(
      (0, drizzle_orm_1.eq)(schema_1.clientes.projectId, projectId)
    );
  }
  const clientesStatus = await clientesStatusQuery.groupBy(
    schema_1.clientes.validationStatus
  );
  const concorrentesStatusQuery = db
    .select({
      status: schema_1.concorrentes.validationStatus,
      count: (0, drizzle_orm_1.count)(),
    })
    .from(schema_1.concorrentes);
  if (projectId) {
    concorrentesStatusQuery.where(
      (0, drizzle_orm_1.eq)(schema_1.concorrentes.projectId, projectId)
    );
  }
  const concorrentesStatus = await concorrentesStatusQuery.groupBy(
    schema_1.concorrentes.validationStatus
  );
  const leadsStatusQuery = db
    .select({
      status: schema_1.leads.validationStatus,
      count: (0, drizzle_orm_1.count)(),
    })
    .from(schema_1.leads);
  if (projectId) {
    leadsStatusQuery.where(
      (0, drizzle_orm_1.eq)(schema_1.leads.projectId, projectId)
    );
  }
  const leadsStatus = await leadsStatusQuery.groupBy(
    schema_1.leads.validationStatus
  );
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
async function getMercados(params) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(schema_1.mercadosUnicos);
  // Filtrar por projeto se fornecido
  const conditions = [];
  if (params?.projectId) {
    conditions.push(
      (0, drizzle_orm_1.eq)(schema_1.mercadosUnicos.projectId, params.projectId)
    );
  }
  if (params?.search) {
    conditions.push(
      (0, drizzle_orm_1.or)(
        (0, drizzle_orm_1.like)(
          schema_1.mercadosUnicos.nome,
          `%${params.search}%`
        ),
        (0, drizzle_orm_1.like)(
          schema_1.mercadosUnicos.categoria,
          `%${params.search}%`
        )
      )
    );
  }
  if (params?.categoria) {
    conditions.push(
      (0, drizzle_orm_1.like)(
        schema_1.mercadosUnicos.categoria,
        `%${params.categoria}%`
      )
    );
  }
  if (params?.segmentacao) {
    conditions.push(
      (0, drizzle_orm_1.eq)(
        schema_1.mercadosUnicos.segmentacao,
        params.segmentacao
      )
    );
  }
  if (conditions.length > 0) {
    query = query.where((0, drizzle_orm_1.and)(...conditions));
  }
  if (params?.limit) {
    query = query.limit(params.limit);
  }
  if (params?.offset) {
    query = query.offset(params.offset);
  }
  return query;
}
async function getMercadoById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(schema_1.mercadosUnicos)
    .where((0, drizzle_orm_1.eq)(schema_1.mercadosUnicos.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}
// ============================================
// CLIENTE HELPERS
// ============================================
async function getAllClientes(params) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (params?.projectId) {
    conditions.push(
      (0, drizzle_orm_1.eq)(schema_1.clientes.projectId, params.projectId)
    );
  }
  if (params?.validationStatus) {
    conditions.push(
      (0, drizzle_orm_1.eq)(
        schema_1.clientes.validationStatus,
        params.validationStatus
      )
    );
  }
  if (conditions.length > 0) {
    return await db
      .select()
      .from(schema_1.clientes)
      .where((0, drizzle_orm_1.and)(...conditions));
  }
  return await db.select().from(schema_1.clientes);
}
async function getClientesByMercado(mercadoId, validationStatus) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [
    (0, drizzle_orm_1.eq)(schema_1.clientesMercados.mercadoId, mercadoId),
  ];
  if (validationStatus) {
    conditions.push(
      (0, drizzle_orm_1.eq)(
        schema_1.clientes.validationStatus,
        validationStatus
      )
    );
  }
  return db
    .select({
      id: schema_1.clientes.id,
      nome: schema_1.clientes.nome,
      cnpj: schema_1.clientes.cnpj,
      siteOficial: schema_1.clientes.siteOficial,
      produtoPrincipal: schema_1.clientes.produtoPrincipal,
      segmentacaoB2bB2c: schema_1.clientes.segmentacaoB2bB2c,
      email: schema_1.clientes.email,
      telefone: schema_1.clientes.telefone,
      cidade: schema_1.clientes.cidade,
      uf: schema_1.clientes.uf,
      validationStatus: schema_1.clientes.validationStatus,
      validationNotes: schema_1.clientes.validationNotes,
      validatedAt: schema_1.clientes.validatedAt,
    })
    .from(schema_1.clientes)
    .innerJoin(
      schema_1.clientesMercados,
      (0, drizzle_orm_1.eq)(
        schema_1.clientes.id,
        schema_1.clientesMercados.clienteId
      )
    )
    .where((0, drizzle_orm_1.and)(...conditions));
}
async function getClientesByMercadoPaginated(
  mercadoId,
  validationStatus,
  page = 1,
  pageSize = 20
) {
  const db = await getDb();
  if (!db) return { data: [], total: 0, page, pageSize, totalPages: 0 };
  const conditions = [
    (0, drizzle_orm_1.eq)(schema_1.clientesMercados.mercadoId, mercadoId),
  ];
  if (validationStatus) {
    conditions.push(
      (0, drizzle_orm_1.eq)(
        schema_1.clientes.validationStatus,
        validationStatus
      )
    );
  }
  // Get total count
  const countResult = await db
    .select({ count: (0, drizzle_orm_1.sql)`count(*)` })
    .from(schema_1.clientes)
    .innerJoin(
      schema_1.clientesMercados,
      (0, drizzle_orm_1.eq)(
        schema_1.clientes.id,
        schema_1.clientesMercados.clienteId
      )
    )
    .where((0, drizzle_orm_1.and)(...conditions));
  const total = Number(countResult[0]?.count || 0);
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;
  // Get paginated data
  const data = await db
    .select({
      id: schema_1.clientes.id,
      nome: schema_1.clientes.nome,
      cnpj: schema_1.clientes.cnpj,
      siteOficial: schema_1.clientes.siteOficial,
      produtoPrincipal: schema_1.clientes.produtoPrincipal,
      segmentacaoB2bB2c: schema_1.clientes.segmentacaoB2bB2c,
      email: schema_1.clientes.email,
      telefone: schema_1.clientes.telefone,
      cidade: schema_1.clientes.cidade,
      uf: schema_1.clientes.uf,
      validationStatus: schema_1.clientes.validationStatus,
      validationNotes: schema_1.clientes.validationNotes,
      validatedAt: schema_1.clientes.validatedAt,
    })
    .from(schema_1.clientes)
    .innerJoin(
      schema_1.clientesMercados,
      (0, drizzle_orm_1.eq)(
        schema_1.clientes.id,
        schema_1.clientesMercados.clienteId
      )
    )
    .where((0, drizzle_orm_1.and)(...conditions))
    .limit(pageSize)
    .offset(offset);
  return { data, total, page, pageSize, totalPages };
}
async function updateClienteValidation(id, status, notes, userId) {
  const db = await getDb();
  if (!db) return null;
  await db
    .update(schema_1.clientes)
    .set({
      validationStatus: status,
      validationNotes: notes,
      validatedBy: userId,
      validatedAt: new Date(),
    })
    .where((0, drizzle_orm_1.eq)(schema_1.clientes.id, id));
  return { success: true };
}
// ============================================
// CONCORRENTE HELPERS
// ============================================
async function getAllConcorrentes(params) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (params?.projectId) {
    conditions.push(
      (0, drizzle_orm_1.eq)(schema_1.concorrentes.projectId, params.projectId)
    );
  }
  if (params?.validationStatus) {
    conditions.push(
      (0, drizzle_orm_1.eq)(
        schema_1.concorrentes.validationStatus,
        params.validationStatus
      )
    );
  }
  if (conditions.length > 0) {
    return await db
      .select()
      .from(schema_1.concorrentes)
      .where((0, drizzle_orm_1.and)(...conditions));
  }
  return await db.select().from(schema_1.concorrentes);
}
async function getConcorrentesByMercado(mercadoId, validationStatus) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [
    (0, drizzle_orm_1.eq)(schema_1.concorrentes.mercadoId, mercadoId),
  ];
  if (validationStatus) {
    conditions.push(
      (0, drizzle_orm_1.eq)(
        schema_1.concorrentes.validationStatus,
        validationStatus
      )
    );
  }
  return db
    .select()
    .from(schema_1.concorrentes)
    .where((0, drizzle_orm_1.and)(...conditions));
}
async function getConcorrentesByMercadoPaginated(
  mercadoId,
  validationStatus,
  page = 1,
  pageSize = 20
) {
  const db = await getDb();
  if (!db) return { data: [], total: 0, page, pageSize, totalPages: 0 };
  const conditions = [
    (0, drizzle_orm_1.eq)(schema_1.concorrentes.mercadoId, mercadoId),
  ];
  if (validationStatus) {
    conditions.push(
      (0, drizzle_orm_1.eq)(
        schema_1.concorrentes.validationStatus,
        validationStatus
      )
    );
  }
  // Get total count
  const countResult = await db
    .select({ count: (0, drizzle_orm_1.sql)`count(*)` })
    .from(schema_1.concorrentes)
    .where((0, drizzle_orm_1.and)(...conditions));
  const total = Number(countResult[0]?.count || 0);
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;
  // Get paginated data
  const data = await db
    .select()
    .from(schema_1.concorrentes)
    .where((0, drizzle_orm_1.and)(...conditions))
    .limit(pageSize)
    .offset(offset);
  return { data, total, page, pageSize, totalPages };
}
async function updateConcorrenteValidation(id, status, notes, userId) {
  const db = await getDb();
  if (!db) return null;
  await db
    .update(schema_1.concorrentes)
    .set({
      validationStatus: status,
      validationNotes: notes,
      validatedBy: userId,
      validatedAt: new Date(),
    })
    .where((0, drizzle_orm_1.eq)(schema_1.concorrentes.id, id));
  return { success: true };
}
// ============================================
// LEAD HELPERS
// ============================================
async function getAllLeads(params) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (params?.projectId) {
    conditions.push(
      (0, drizzle_orm_1.eq)(schema_1.leads.projectId, params.projectId)
    );
  }
  if (params?.validationStatus) {
    conditions.push(
      (0, drizzle_orm_1.eq)(
        schema_1.leads.validationStatus,
        params.validationStatus
      )
    );
  }
  if (conditions.length > 0) {
    return await db
      .select()
      .from(schema_1.leads)
      .where((0, drizzle_orm_1.and)(...conditions));
  }
  return await db.select().from(schema_1.leads);
}
async function getLeadsByMercado(mercadoId, validationStatus) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [
    (0, drizzle_orm_1.eq)(schema_1.leads.mercadoId, mercadoId),
  ];
  if (validationStatus) {
    conditions.push(
      (0, drizzle_orm_1.eq)(schema_1.leads.validationStatus, validationStatus)
    );
  }
  return db
    .select()
    .from(schema_1.leads)
    .where((0, drizzle_orm_1.and)(...conditions));
}
async function getLeadsByMercadoPaginated(
  mercadoId,
  validationStatus,
  page = 1,
  pageSize = 20
) {
  const db = await getDb();
  if (!db) return { data: [], total: 0, page, pageSize, totalPages: 0 };
  const conditions = [
    (0, drizzle_orm_1.eq)(schema_1.leads.mercadoId, mercadoId),
  ];
  if (validationStatus) {
    conditions.push(
      (0, drizzle_orm_1.eq)(schema_1.leads.validationStatus, validationStatus)
    );
  }
  // Get total count
  const countResult = await db
    .select({ count: (0, drizzle_orm_1.sql)`count(*)` })
    .from(schema_1.leads)
    .where((0, drizzle_orm_1.and)(...conditions));
  const total = Number(countResult[0]?.count || 0);
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;
  // Get paginated data
  const data = await db
    .select()
    .from(schema_1.leads)
    .where((0, drizzle_orm_1.and)(...conditions))
    .limit(pageSize)
    .offset(offset);
  return { data, total, page, pageSize, totalPages };
}
async function updateLeadValidation(id, status, notes, userId) {
  const db = await getDb();
  if (!db) return null;
  await db
    .update(schema_1.leads)
    .set({
      validationStatus: status,
      validationNotes: notes,
      validatedBy: userId,
      validatedAt: new Date(),
    })
    .where((0, drizzle_orm_1.eq)(schema_1.leads.id, id));
  return { success: true };
}
// ============================================
// ANALYTICS HELPERS
// ============================================
async function getAnalyticsProgress() {
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
      .select({ count: (0, drizzle_orm_1.sql)`COUNT(*)` })
      .from(schema_1.mercadosUnicos);
    const [clientesCount] = await db
      .select({ count: (0, drizzle_orm_1.sql)`COUNT(*)` })
      .from(schema_1.clientes);
    const [concorrentesCount] = await db
      .select({ count: (0, drizzle_orm_1.sql)`COUNT(*)` })
      .from(schema_1.concorrentes);
    const [leadsCount] = await db
      .select({ count: (0, drizzle_orm_1.sql)`COUNT(*)` })
      .from(schema_1.leads);
    // Contar por status (clientes + concorrentes + leads)
    const [clientesRich] = await db
      .select({ count: (0, drizzle_orm_1.sql)`COUNT(*)` })
      .from(schema_1.clientes)
      .where((0, drizzle_orm_1.eq)(schema_1.clientes.validationStatus, "rich"));
    const [clientesPendentes] = await db
      .select({ count: (0, drizzle_orm_1.sql)`COUNT(*)` })
      .from(schema_1.clientes)
      .where(
        (0, drizzle_orm_1.eq)(schema_1.clientes.validationStatus, "pending")
      );
    const [clientesDiscarded] = await db
      .select({ count: (0, drizzle_orm_1.sql)`COUNT(*)` })
      .from(schema_1.clientes)
      .where(
        (0, drizzle_orm_1.eq)(schema_1.clientes.validationStatus, "discarded")
      );
    const [concorrentesRich] = await db
      .select({ count: (0, drizzle_orm_1.sql)`COUNT(*)` })
      .from(schema_1.concorrentes)
      .where(
        (0, drizzle_orm_1.eq)(schema_1.concorrentes.validationStatus, "rich")
      );
    const [concorrentesPendentes] = await db
      .select({ count: (0, drizzle_orm_1.sql)`COUNT(*)` })
      .from(schema_1.concorrentes)
      .where(
        (0, drizzle_orm_1.eq)(schema_1.concorrentes.validationStatus, "pending")
      );
    const [concorrentesDiscarded] = await db
      .select({ count: (0, drizzle_orm_1.sql)`COUNT(*)` })
      .from(schema_1.concorrentes)
      .where(
        (0, drizzle_orm_1.eq)(
          schema_1.concorrentes.validationStatus,
          "discarded"
        )
      );
    const [leadsRich] = await db
      .select({ count: (0, drizzle_orm_1.sql)`COUNT(*)` })
      .from(schema_1.leads)
      .where((0, drizzle_orm_1.eq)(schema_1.leads.validationStatus, "rich"));
    const [leadsPendentes] = await db
      .select({ count: (0, drizzle_orm_1.sql)`COUNT(*)` })
      .from(schema_1.leads)
      .where((0, drizzle_orm_1.eq)(schema_1.leads.validationStatus, "pending"));
    const [leadsDiscarded] = await db
      .select({ count: (0, drizzle_orm_1.sql)`COUNT(*)` })
      .from(schema_1.leads)
      .where(
        (0, drizzle_orm_1.eq)(schema_1.leads.validationStatus, "discarded")
      );
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
        mercadoNome: schema_1.mercadosUnicos.nome,
        total: (0, drizzle_orm_1.sql)`COUNT(DISTINCT ${schema_1.clientes.id})`,
        validados: (0,
        drizzle_orm_1.sql)`SUM(CASE WHEN ${schema_1.clientes.validationStatus} = 'validado' THEN 1 ELSE 0 END)`,
      })
      .from(schema_1.mercadosUnicos)
      .leftJoin(
        schema_1.clientesMercados,
        (0, drizzle_orm_1.eq)(
          schema_1.mercadosUnicos.id,
          schema_1.clientesMercados.mercadoId
        )
      )
      .leftJoin(
        schema_1.clientes,
        (0, drizzle_orm_1.eq)(
          schema_1.clientesMercados.clienteId,
          schema_1.clientes.id
        )
      )
      .groupBy(schema_1.mercadosUnicos.id, schema_1.mercadosUnicos.nome)
      .orderBy(
        (0, drizzle_orm_1.sql)`COUNT(DISTINCT ${schema_1.clientes.id}) DESC`
      )
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
async function getAllTags() {
  const db = await getDb();
  if (!db) return [];
  const { tags } = await Promise.resolve().then(() =>
    __importStar(require("../drizzle/schema"))
  );
  return await db.select().from(tags);
}
async function createTag(name, color = "#3b82f6") {
  const db = await getDb();
  if (!db) return null;
  const { tags } = await Promise.resolve().then(() =>
    __importStar(require("../drizzle/schema"))
  );
  await db.insert(tags).values({ name, color });
  // Get the last inserted tag
  const inserted = await db
    .select()
    .from(tags)
    .orderBy((0, drizzle_orm_1.sql)`id DESC`)
    .limit(1);
  return inserted[0] || null;
}
async function deleteTag(tagId) {
  const db = await getDb();
  if (!db) return null;
  const { tags } = await Promise.resolve().then(() =>
    __importStar(require("../drizzle/schema"))
  );
  await db.delete(tags).where((0, drizzle_orm_1.eq)(tags.id, tagId));
  return { success: true };
}
async function getEntityTags(entityType, entityId) {
  const db = await getDb();
  if (!db) return [];
  const { entityTags, tags } = await Promise.resolve().then(() =>
    __importStar(require("../drizzle/schema"))
  );
  const results = await db
    .select({
      id: entityTags.id,
      tagId: tags.id,
      name: tags.name,
      color: tags.color,
    })
    .from(entityTags)
    .innerJoin(tags, (0, drizzle_orm_1.eq)(entityTags.tagId, tags.id))
    .where(
      (0, drizzle_orm_1.and)(
        (0, drizzle_orm_1.eq)(entityTags.entityType, entityType),
        (0, drizzle_orm_1.eq)(entityTags.entityId, entityId)
      )
    );
  return results;
}
async function addTagToEntity(tagId, entityType, entityId) {
  const db = await getDb();
  if (!db) return null;
  const { entityTags } = await Promise.resolve().then(() =>
    __importStar(require("../drizzle/schema"))
  );
  // Check if already exists
  const existing = await db
    .select()
    .from(entityTags)
    .where(
      (0, drizzle_orm_1.and)(
        (0, drizzle_orm_1.eq)(entityTags.tagId, tagId),
        (0, drizzle_orm_1.eq)(entityTags.entityType, entityType),
        (0, drizzle_orm_1.eq)(entityTags.entityId, entityId)
      )
    )
    .limit(1);
  if (existing.length > 0) {
    return { success: true, alreadyExists: true };
  }
  await db.insert(entityTags).values({
    tagId,
    entityType: entityType,
    entityId,
  });
  return { success: true, alreadyExists: false };
}
async function removeTagFromEntity(tagId, entityType, entityId) {
  const db = await getDb();
  if (!db) return null;
  const { entityTags } = await Promise.resolve().then(() =>
    __importStar(require("../drizzle/schema"))
  );
  await db
    .delete(entityTags)
    .where(
      (0, drizzle_orm_1.and)(
        (0, drizzle_orm_1.eq)(entityTags.tagId, tagId),
        (0, drizzle_orm_1.eq)(entityTags.entityType, entityType),
        (0, drizzle_orm_1.eq)(entityTags.entityId, entityId)
      )
    );
  return { success: true };
}
async function getEntitiesByTag(tagId, entityType) {
  const db = await getDb();
  if (!db) return [];
  const { entityTags } = await Promise.resolve().then(() =>
    __importStar(require("../drizzle/schema"))
  );
  const results = await db
    .select()
    .from(entityTags)
    .where(
      (0, drizzle_orm_1.and)(
        (0, drizzle_orm_1.eq)(entityTags.tagId, tagId),
        (0, drizzle_orm_1.eq)(entityTags.entityType, entityType)
      )
    );
  return results.map(r => r.entityId);
}
// ============================================
// Saved Filters Functions
// ============================================
async function getSavedFilters(userId) {
  const db = await getDb();
  if (!db) return [];
  const { savedFilters } = await Promise.resolve().then(() =>
    __importStar(require("../drizzle/schema"))
  );
  const { eq } = await Promise.resolve().then(() =>
    __importStar(require("drizzle-orm"))
  );
  return await db
    .select()
    .from(savedFilters)
    .where(eq(savedFilters.userId, userId));
}
async function createSavedFilter(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { savedFilters } = await Promise.resolve().then(() =>
    __importStar(require("../drizzle/schema"))
  );
  await db.insert(savedFilters).values(data);
}
async function deleteSavedFilter(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { savedFilters } = await Promise.resolve().then(() =>
    __importStar(require("../drizzle/schema"))
  );
  const { eq } = await Promise.resolve().then(() =>
    __importStar(require("drizzle-orm"))
  );
  await db.delete(savedFilters).where(eq(savedFilters.id, id));
}
// ============================================
// Dashboard Analytics Functions
// ============================================
async function getDistribuicaoGeografica() {
  const db = await getDb();
  if (!db) return [];
  const { clientes } = await Promise.resolve().then(() =>
    __importStar(require("../drizzle/schema"))
  );
  const { sql } = await Promise.resolve().then(() =>
    __importStar(require("drizzle-orm"))
  );
  const result = await db
    .select({
      uf: clientes.uf,
      count: sql`count(*)`.as("count"),
    })
    .from(clientes)
    .where(sql`${clientes.uf} IS NOT NULL AND ${clientes.uf} != ''`)
    .groupBy(clientes.uf)
    .orderBy(sql`count DESC`);
  return result;
}
async function getDistribuicaoSegmentacao() {
  const db = await getDb();
  if (!db) return [];
  const { clientes } = await Promise.resolve().then(() =>
    __importStar(require("../drizzle/schema"))
  );
  const { sql } = await Promise.resolve().then(() =>
    __importStar(require("drizzle-orm"))
  );
  const result = await db
    .select({
      segmentacao: clientes.segmentacaoB2bB2c,
      count: sql`count(*)`.as("count"),
    })
    .from(clientes)
    .where(sql`${clientes.segmentacaoB2bB2c} IS NOT NULL`)
    .groupBy(clientes.segmentacaoB2bB2c);
  return result;
}
async function getTimelineValidacoes(days = 30) {
  const db = await getDb();
  if (!db) return [];
  const { clientes } = await Promise.resolve().then(() =>
    __importStar(require("../drizzle/schema"))
  );
  const { sql } = await Promise.resolve().then(() =>
    __importStar(require("drizzle-orm"))
  );
  const result = await db
    .select({
      date: sql`DATE(${clientes.validatedAt})`.as("date"),
      count: sql`count(*)`.as("count"),
    })
    .from(clientes)
    .where(
      sql`${clientes.validatedAt} >= DATE_SUB(NOW(), INTERVAL ${days} DAY)`
    )
    .groupBy(sql`date`)
    .orderBy(sql`date ASC`);
  return result;
}
async function getFunilConversao() {
  const db = await getDb();
  if (!db) return { leads: 0, clientes: 0, validados: 0 };
  const { leads, clientes } = await Promise.resolve().then(() =>
    __importStar(require("../drizzle/schema"))
  );
  const { sql, count } = await Promise.resolve().then(() =>
    __importStar(require("drizzle-orm"))
  );
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
async function getTop10Mercados() {
  const db = await getDb();
  if (!db) return [];
  const { mercadosUnicos } = await Promise.resolve().then(() =>
    __importStar(require("../drizzle/schema"))
  );
  const { desc } = await Promise.resolve().then(() =>
    __importStar(require("drizzle-orm"))
  );
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
async function updateLeadStage(leadId, stage) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update lead stage: database not available");
    return;
  }
  await db
    .update(schema_1.leads)
    .set({
      stage,
      stageUpdatedAt: new Date(),
    })
    .where((0, drizzle_orm_1.eq)(schema_1.leads.id, leadId));
}
async function getLeadsByStage(mercadoId) {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot get leads by stage: database not available"
    );
    return [];
  }
  const result = await db
    .select()
    .from(schema_1.leads)
    .where((0, drizzle_orm_1.eq)(schema_1.leads.mercadoId, mercadoId));
  return result;
}
// ============================================
// PROJECT HELPERS
// ============================================
async function getProjects() {
  const db = await getDb();
  if (!db) return [];
  try {
    const result = await db
      .select()
      .from(schema_1.projects)
      .where((0, drizzle_orm_1.eq)(schema_1.projects.ativo, 1))
      .orderBy(schema_1.projects.nome);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get projects:", error);
    return [];
  }
}
async function getProjectById(id) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const result = await db
      .select()
      .from(schema_1.projects)
      .where((0, drizzle_orm_1.eq)(schema_1.projects.id, id))
      .limit(1);
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to get project:", error);
    return undefined;
  }
}
async function createProject(data) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.insert(schema_1.projects).values(data);
    const insertId = Number(result[0].insertId);
    return (await getProjectById(insertId)) || null;
  } catch (error) {
    console.error("[Database] Failed to create project:", error);
    return null;
  }
}
async function updateProject(id, data) {
  const db = await getDb();
  if (!db) return false;
  try {
    await db
      .update(schema_1.projects)
      .set({ ...data, updatedAt: new Date() })
      .where((0, drizzle_orm_1.eq)(schema_1.projects.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update project:", error);
    return false;
  }
}
async function deleteProject(id) {
  const db = await getDb();
  if (!db) return false;
  try {
    // Soft delete - apenas marca como inativo
    await db
      .update(schema_1.projects)
      .set({ ativo: 0, updatedAt: new Date() })
      .where((0, drizzle_orm_1.eq)(schema_1.projects.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete project:", error);
    return false;
  }
}
// ============================================
// CRUD - MERCADOS
// ============================================
async function createMercado(data) {
  const db = await getDb();
  if (!db) return null;
  // Hash sem timestamp para garantir unicidade
  const mercadoHash = `${data.nome}-${data.projectId}`
    .toLowerCase()
    .replace(/\s+/g, "-");
  // Verificar se já existe
  const existing = await db
    .select()
    .from(schema_1.mercadosUnicos)
    .where(
      (0, drizzle_orm_1.and)(
        (0, drizzle_orm_1.eq)(schema_1.mercadosUnicos.mercadoHash, mercadoHash),
        (0, drizzle_orm_1.eq)(schema_1.mercadosUnicos.projectId, data.projectId)
      )
    )
    .limit(1);
  if (existing.length > 0) {
    // Detectar mudanças
    const { detectChanges, trackMercadoChanges } = await Promise.resolve().then(
      () => __importStar(require("./_core/historyTracker"))
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
        .update(schema_1.mercadosUnicos)
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
        .where(
          (0, drizzle_orm_1.eq)(schema_1.mercadosUnicos.id, existing[0].id)
        );
      console.log(
        `[Mercado] Atualizado: ${data.nome} (${changes.length} mudanças)`
      );
    }
    return existing[0];
  }
  // Criar novo mercado
  const [result] = await db.insert(schema_1.mercadosUnicos).values({
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
  if (!mercado) return null;
  // Registrar criação no histórico
  const { trackCreation } = await Promise.resolve().then(() =>
    __importStar(require("./_core/historyTracker"))
  );
  await trackCreation("mercado", mercado.id, data);
  console.log(`[Mercado] Criado: ${data.nome}`);
  return mercado;
}
async function updateMercado(id, data) {
  const db = await getDb();
  if (!db) return null;
  const updateData = {};
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
    .update(schema_1.mercadosUnicos)
    .set(updateData)
    .where((0, drizzle_orm_1.eq)(schema_1.mercadosUnicos.id, id));
  return await getMercadoById(id);
}
async function deleteMercado(id) {
  const db = await getDb();
  if (!db) return false;
  // Delete associated records first (cascade)
  await db
    .delete(schema_1.clientesMercados)
    .where((0, drizzle_orm_1.eq)(schema_1.clientesMercados.mercadoId, id));
  await db
    .delete(schema_1.concorrentes)
    .where((0, drizzle_orm_1.eq)(schema_1.concorrentes.mercadoId, id));
  await db
    .delete(schema_1.leads)
    .where((0, drizzle_orm_1.eq)(schema_1.leads.mercadoId, id));
  // Delete the mercado itself
  await db
    .delete(schema_1.mercadosUnicos)
    .where((0, drizzle_orm_1.eq)(schema_1.mercadosUnicos.id, id));
  return true;
}
// ============================================
// CRUD - CLIENTES
// ============================================
async function createCliente(data) {
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
    .from(schema_1.clientes)
    .where(
      (0, drizzle_orm_1.and)(
        (0, drizzle_orm_1.eq)(schema_1.clientes.clienteHash, normalizedHash),
        (0, drizzle_orm_1.eq)(schema_1.clientes.projectId, data.projectId)
      )
    )
    .limit(1);
  if (existing.length > 0) {
    // Detectar mudanças
    const { detectChanges, trackClienteChanges } = await Promise.resolve().then(
      () => __importStar(require("./_core/historyTracker"))
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
        .update(schema_1.clientes)
        .set({
          nome: data.nome,
          cnpj: data.cnpj || existing[0].cnpj,
          siteOficial: data.siteOficial || existing[0].siteOficial,
          produtoPrincipal:
            data.produtoPrincipal || existing[0].produtoPrincipal,
          segmentacaoB2bB2c:
            data.segmentacaoB2bB2c || existing[0].segmentacaoB2bB2c,
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
        .where((0, drizzle_orm_1.eq)(schema_1.clientes.id, existing[0].id));
      console.log(
        `[Cliente] Atualizado: ${data.nome} (${changes.length} mudanças)`
      );
    }
    return existing[0];
  }
  // Criar novo cliente
  const [result] = await db.insert(schema_1.clientes).values({
    projectId: data.projectId,
    clienteHash: normalizedHash,
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
    qualidadeClassificacao: data.qualidadeClassificacao || "Ruim",
    validationStatus: data.validationStatus || "pending",
  });
  if (!result.insertId) return null;
  const [cliente] = await db
    .select()
    .from(schema_1.clientes)
    .where(
      (0, drizzle_orm_1.eq)(schema_1.clientes.id, Number(result.insertId))
    );
  // Registrar criação no histórico
  const { trackCreation } = await Promise.resolve().then(() =>
    __importStar(require("./_core/historyTracker"))
  );
  await trackCreation("cliente", cliente.id, data);
  console.log(`[Cliente] Criado: ${data.nome}`);
  return cliente;
}
async function associateClienteToMercado(clienteId, mercadoId) {
  const db = await getDb();
  if (!db) return false;
  try {
    await db.insert(schema_1.clientesMercados).values({
      clienteId,
      mercadoId,
    });
    // Atualizar contagem de clientes no mercado
    await db.execute((0, drizzle_orm_1.sql)`
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
async function updateCliente(id, data) {
  const db = await getDb();
  if (!db) return null;
  const updateData = {};
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined) {
      updateData[key] = data[key];
    }
  });
  await db
    .update(schema_1.clientes)
    .set(updateData)
    .where((0, drizzle_orm_1.eq)(schema_1.clientes.id, id));
  const [cliente] = await db
    .select()
    .from(schema_1.clientes)
    .where((0, drizzle_orm_1.eq)(schema_1.clientes.id, id));
  return cliente;
}
async function deleteCliente(id) {
  const db = await getDb();
  if (!db) return false;
  // Delete associations first
  await db
    .delete(schema_1.clientesMercados)
    .where((0, drizzle_orm_1.eq)(schema_1.clientesMercados.clienteId, id));
  // Delete the cliente itself
  await db
    .delete(schema_1.clientes)
    .where((0, drizzle_orm_1.eq)(schema_1.clientes.id, id));
  return true;
}
// ============================================
// CRUD - CONCORRENTES
// ============================================
async function createConcorrente(data) {
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
    .from(schema_1.concorrentes)
    .where(
      (0, drizzle_orm_1.and)(
        (0, drizzle_orm_1.eq)(
          schema_1.concorrentes.concorrenteHash,
          concorrenteHash
        ),
        (0, drizzle_orm_1.eq)(schema_1.concorrentes.projectId, data.projectId)
      )
    )
    .limit(1);
  if (existing.length > 0) {
    // Detectar mudanças
    const { detectChanges, trackConcorrenteChanges } =
      await Promise.resolve().then(() =>
        __importStar(require("./_core/historyTracker"))
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
        .update(schema_1.concorrentes)
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
        .where((0, drizzle_orm_1.eq)(schema_1.concorrentes.id, existing[0].id));
      console.log(
        `[Concorrente] Atualizado: ${data.nome} (${changes.length} mudanças)`
      );
    }
    return existing[0];
  }
  // Criar novo concorrente
  const [result] = await db.insert(schema_1.concorrentes).values({
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
  const [concorrente] = await db
    .select()
    .from(schema_1.concorrentes)
    .where(
      (0, drizzle_orm_1.eq)(schema_1.concorrentes.id, Number(result.insertId))
    );
  // Registrar criação no histórico
  const { trackCreation } = await Promise.resolve().then(() =>
    __importStar(require("./_core/historyTracker"))
  );
  await trackCreation("concorrente", concorrente.id, data);
  console.log(`[Concorrente] Criado: ${data.nome}`);
  return concorrente;
}
async function updateConcorrente(id, data) {
  const db = await getDb();
  if (!db) return null;
  const updateData = {};
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined) {
      updateData[key] = data[key];
    }
  });
  await db
    .update(schema_1.concorrentes)
    .set(updateData)
    .where((0, drizzle_orm_1.eq)(schema_1.concorrentes.id, id));
  const [concorrente] = await db
    .select()
    .from(schema_1.concorrentes)
    .where((0, drizzle_orm_1.eq)(schema_1.concorrentes.id, id));
  return concorrente;
}
async function deleteConcorrente(id) {
  const db = await getDb();
  if (!db) return false;
  await db
    .delete(schema_1.concorrentes)
    .where((0, drizzle_orm_1.eq)(schema_1.concorrentes.id, id));
  return true;
}
// ============================================
// CRUD - LEADS
// ============================================
async function createLead(data) {
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
    .from(schema_1.leads)
    .where(
      (0, drizzle_orm_1.and)(
        (0, drizzle_orm_1.eq)(schema_1.leads.leadHash, leadHash),
        (0, drizzle_orm_1.eq)(schema_1.leads.projectId, data.projectId)
      )
    )
    .limit(1);
  if (existing.length > 0) {
    // Detectar mudanças (NÃO incluir 'stage' para preservar progresso de vendas)
    const { detectChanges, trackLeadChanges } = await Promise.resolve().then(
      () => __importStar(require("./_core/historyTracker"))
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
        .update(schema_1.leads)
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
        .where((0, drizzle_orm_1.eq)(schema_1.leads.id, existing[0].id));
      console.log(
        `[Lead] Atualizado: ${data.nome} (${changes.length} mudanças)`
      );
    }
    return existing[0];
  }
  // Criar novo lead
  const result = await db.execute((0, drizzle_orm_1.sql)`
    INSERT INTO leads (
      projectId, mercadoId, leadHash, nome, cnpj, site, email, telefone,
      tipo, porte, regiao, setor, qualidadeScore, qualidadeClassificacao,
      validationStatus, stage
    ) VALUES (
      ${data.projectId}, ${data.mercadoId}, ${leadHash}, ${data.nome},
      ${data.cnpj || null}, ${data.site || null}, ${data.email || null}, ${data.telefone || null},
      ${data.tipo || null}, ${data.porte || null}, ${data.regiao || null}, ${data.setor || null},
      ${data.qualidadeScore || 0}, ${data.qualidadeClassificacao || "Ruim"},
      ${data.validationStatus || "pending"}, 'novo'
    )
  `);
  if (!result.insertId) return null;
  const [lead] = await db
    .select()
    .from(schema_1.leads)
    .where((0, drizzle_orm_1.eq)(schema_1.leads.id, Number(result.insertId)));
  // Registrar criação no histórico
  const { trackCreation } = await Promise.resolve().then(() =>
    __importStar(require("./_core/historyTracker"))
  );
  await trackCreation("lead", lead.id, data);
  console.log(`[Lead] Criado: ${data.nome}`);
  return lead;
}
async function updateLead(id, data) {
  const db = await getDb();
  if (!db) return null;
  const updateData = {};
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined) {
      updateData[key] = data[key];
    }
  });
  await db
    .update(schema_1.leads)
    .set(updateData)
    .where((0, drizzle_orm_1.eq)(schema_1.leads.id, id));
  const [lead] = await db
    .select()
    .from(schema_1.leads)
    .where((0, drizzle_orm_1.eq)(schema_1.leads.id, id));
  return lead;
}
async function deleteLead(id) {
  const db = await getDb();
  if (!db) return false;
  await db
    .delete(schema_1.leads)
    .where((0, drizzle_orm_1.eq)(schema_1.leads.id, id));
  return true;
}
// ============================================
// CRUD - PROJECT TEMPLATES
// ============================================
async function getAllTemplates() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(schema_1.projectTemplates)
    .orderBy(
      schema_1.projectTemplates.isDefault,
      schema_1.projectTemplates.name
    );
}
async function getTemplateById(id) {
  const db = await getDb();
  if (!db) return null;
  const [template] = await db
    .select()
    .from(schema_1.projectTemplates)
    .where((0, drizzle_orm_1.eq)(schema_1.projectTemplates.id, id));
  return template || null;
}
async function createTemplate(data) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(schema_1.projectTemplates).values({
    name: data.name,
    description: data.description || null,
    config: data.config,
    isDefault: data.isDefault || 0,
  });
  if (!result.insertId) return null;
  return await getTemplateById(Number(result.insertId));
}
async function updateTemplate(id, data) {
  const db = await getDb();
  if (!db) return null;
  const updateData = {};
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined) {
      updateData[key] = data[key];
    }
  });
  if (Object.keys(updateData).length > 0) {
    await db
      .update(schema_1.projectTemplates)
      .set(updateData)
      .where((0, drizzle_orm_1.eq)(schema_1.projectTemplates.id, id));
  }
  return await getTemplateById(id);
}
async function deleteTemplate(id) {
  const db = await getDb();
  if (!db) return false;
  // Não permitir deletar templates padrão
  const template = await getTemplateById(id);
  if (template?.isDefault === 1) {
    throw new Error("Não é possível deletar templates padrão");
  }
  await db
    .delete(schema_1.projectTemplates)
    .where((0, drizzle_orm_1.eq)(schema_1.projectTemplates.id, id));
  return true;
}
// ============================================
// ADVANCED SEARCH - LEADS
// ============================================
async function searchLeadsAdvanced(projectId, filter, page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { data: [], total: 0, page, pageSize };
  const { buildDynamicQuery, validateFilter } = await Promise.resolve().then(
    () => __importStar(require("./queryBuilder"))
  );
  // Validar filtro
  const validation = validateFilter(filter);
  if (!validation.valid) {
    throw new Error(validation.error || "Filtro inválido");
  }
  // Construir query dinâmica
  const whereClause = buildDynamicQuery(schema_1.leads, filter);
  // Combinar filtro de projeto com filtros dinâmicos
  const finalWhere = whereClause
    ? (0, drizzle_orm_1.and)(
        (0, drizzle_orm_1.eq)(schema_1.leads.projectId, projectId),
        whereClause
      )
    : (0, drizzle_orm_1.eq)(schema_1.leads.projectId, projectId);
  // Base query
  const query = db.select().from(schema_1.leads).where(finalWhere);
  // Contar total
  const countQuery = db
    .select({ count: (0, drizzle_orm_1.count)() })
    .from(schema_1.leads)
    .where(
      whereClause
        ? (0, drizzle_orm_1.and)(
            (0, drizzle_orm_1.eq)(schema_1.leads.projectId, projectId),
            whereClause
          )
        : (0, drizzle_orm_1.eq)(schema_1.leads.projectId, projectId)
    );
  const [{ count: total }] = await countQuery;
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
async function getLeadsByStageStats(projectId) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute((0, drizzle_orm_1.sql)`
    SELECT 
      stage,
      COUNT(*) as count
    FROM leads
    WHERE projectId = ${projectId}
    GROUP BY stage
  `);
  return result.rows || result;
}
async function getLeadsByMercadoStats(projectId) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute((0, drizzle_orm_1.sql)`
    SELECT 
      m.nome as mercadoNome,
      COUNT(l.id) as leadCount
    FROM mercados_unicos m
    LEFT JOIN leads l ON l.mercadoId = m.id
    WHERE m.projectId = ${projectId}
    GROUP BY m.id, m.nome
    ORDER BY leadCount DESC
    LIMIT 10
  `);
  return result.rows || result;
}
async function getQualityScoreEvolution(projectId, days = 30) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute((0, drizzle_orm_1.sql)`
    SELECT 
      DATE(createdAt) as date,
      AVG(qualidadeScore) as avgScore,
      COUNT(*) as count
    FROM leads
    WHERE projectId = ${projectId}
      AND createdAt >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
    GROUP BY DATE(createdAt)
    ORDER BY date ASC
  `);
  return result.rows || result;
}
async function getLeadsGrowthOverTime(projectId, days = 30) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute((0, drizzle_orm_1.sql)`
    SELECT 
      DATE(createdAt) as date,
      COUNT(*) as count,
      SUM(COUNT(*)) OVER (ORDER BY DATE(createdAt)) as cumulative
    FROM leads
    WHERE projectId = ${projectId}
      AND createdAt >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
    GROUP BY DATE(createdAt)
    ORDER BY date ASC
  `);
  return result.rows || result;
}
async function getDashboardKPIs(projectId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.execute((0, drizzle_orm_1.sql)`
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
  `);
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
async function createNotification(data) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(schema_1.notifications).values({
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
    .from(schema_1.notifications)
    .where(
      (0, drizzle_orm_1.eq)(schema_1.notifications.id, Number(result.insertId))
    );
  return notification;
}
async function getUserNotifications(userId, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(schema_1.notifications)
    .where((0, drizzle_orm_1.eq)(schema_1.notifications.userId, userId))
    .orderBy((0, drizzle_orm_1.sql)`createdAt DESC`)
    .limit(limit);
}
async function getUnreadNotificationsCount(userId) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: (0, drizzle_orm_1.count)() })
    .from(schema_1.notifications)
    .where(
      (0, drizzle_orm_1.and)(
        (0, drizzle_orm_1.eq)(schema_1.notifications.userId, userId),
        (0, drizzle_orm_1.eq)(schema_1.notifications.isRead, 0)
      )
    );
  return Number(result[0]?.count || 0);
}
async function markNotificationAsRead(id) {
  const db = await getDb();
  if (!db) return false;
  await db
    .update(schema_1.notifications)
    .set({ isRead: 1 })
    .where((0, drizzle_orm_1.eq)(schema_1.notifications.id, id));
  return true;
}
async function markAllNotificationsAsRead(userId) {
  const db = await getDb();
  if (!db) return false;
  await db
    .update(schema_1.notifications)
    .set({ isRead: 1 })
    .where(
      (0, drizzle_orm_1.and)(
        (0, drizzle_orm_1.eq)(schema_1.notifications.userId, userId),
        (0, drizzle_orm_1.eq)(schema_1.notifications.isRead, 0)
      )
    );
  return true;
}
async function deleteNotification(id) {
  const db = await getDb();
  if (!db) return false;
  await db
    .delete(schema_1.notifications)
    .where((0, drizzle_orm_1.eq)(schema_1.notifications.id, id));
  return true;
}
// ============================================
// NOTIFICATION TRIGGERS
// ============================================
/**
 * Trigger: Notificar quando lead tem alta qualidade
 */
async function checkAndNotifyHighQualityLead(leadId, qualityScore, userId) {
  if (qualityScore >= 80) {
    const db = await getDb();
    if (!db) return;
    const [lead] = await db
      .select()
      .from(schema_1.leads)
      .where((0, drizzle_orm_1.eq)(schema_1.leads.id, leadId));
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
async function notifyLeadClosed(leadId, userId) {
  const db = await getDb();
  if (!db) return;
  const [lead] = await db
    .select()
    .from(schema_1.leads)
    .where((0, drizzle_orm_1.eq)(schema_1.leads.id, leadId));
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
async function notifyNewCompetitor(concorrenteId, userId) {
  const db = await getDb();
  if (!db) return;
  const [concorrente] = await db
    .select()
    .from(schema_1.concorrentes)
    .where((0, drizzle_orm_1.eq)(schema_1.concorrentes.id, concorrenteId));
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
async function getEnrichmentProgress(projectId) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  // Total de clientes no projeto
  const [totalResult] = await db
    .select({ count: (0, drizzle_orm_1.count)() })
    .from(schema_1.clientes)
    .where((0, drizzle_orm_1.eq)(schema_1.clientes.projectId, projectId));
  const total = totalResult?.count || 0;
  // Clientes processados: clientes que têm mercados associados
  // (mercados são criados durante o enriquecimento)
  const [processedResult] = await db
    .select({
      count: (0, drizzle_orm_1.sql)`COUNT(DISTINCT ${schema_1.clientes.id})`,
    })
    .from(schema_1.clientes)
    .innerJoin(
      schema_1.clientesMercados,
      (0, drizzle_orm_1.eq)(
        schema_1.clientesMercados.clienteId,
        schema_1.clientes.id
      )
    )
    .where((0, drizzle_orm_1.eq)(schema_1.clientes.projectId, projectId));
  const processed = Number(processedResult?.count || 0);
  // Mercados únicos do projeto
  const [mercadosResult] = await db
    .select({
      count: (0,
      drizzle_orm_1.sql)`COUNT(DISTINCT ${schema_1.mercadosUnicos.id})`,
    })
    .from(schema_1.mercadosUnicos)
    .innerJoin(
      schema_1.clientesMercados,
      (0, drizzle_orm_1.eq)(
        schema_1.clientesMercados.mercadoId,
        schema_1.mercadosUnicos.id
      )
    )
    .innerJoin(
      schema_1.clientes,
      (0, drizzle_orm_1.eq)(
        schema_1.clientes.id,
        schema_1.clientesMercados.clienteId
      )
    )
    .where((0, drizzle_orm_1.eq)(schema_1.clientes.projectId, projectId));
  const mercados = Number(mercadosResult?.count || 0);
  // Concorrentes do projeto
  const [concorrentesResult] = await db
    .select({ count: (0, drizzle_orm_1.count)() })
    .from(schema_1.concorrentes)
    .where((0, drizzle_orm_1.eq)(schema_1.concorrentes.projectId, projectId));
  const concorrentesCount = concorrentesResult?.count || 0;
  // Leads do projeto
  const [leadsResult] = await db
    .select({ count: (0, drizzle_orm_1.count)() })
    .from(schema_1.leads)
    .where((0, drizzle_orm_1.eq)(schema_1.leads.projectId, projectId));
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
async function createEnrichmentRun(projectId, totalClients) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const { enrichmentRuns } = await Promise.resolve().then(() =>
    __importStar(require("../drizzle/schema"))
  );
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
async function updateEnrichmentRun(runId, data) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const { enrichmentRuns } = await Promise.resolve().then(() =>
    __importStar(require("../drizzle/schema"))
  );
  await db
    .update(enrichmentRuns)
    .set(data)
    .where((0, drizzle_orm_1.eq)(enrichmentRuns.id, runId));
}
/**
 * Busca histórico de execuções de um projeto
 */
async function getEnrichmentHistory(projectId, limit = 10) {
  const db = await getDb();
  if (!db) {
    return [];
  }
  const { enrichmentRuns } = await Promise.resolve().then(() =>
    __importStar(require("../drizzle/schema"))
  );
  return await db
    .select()
    .from(enrichmentRuns)
    .where((0, drizzle_orm_1.eq)(enrichmentRuns.projectId, projectId))
    .orderBy((0, drizzle_orm_1.sql)`${enrichmentRuns.startedAt} DESC`)
    .limit(limit);
}
/**
 * Busca execução em andamento de um projeto
 */
async function getActiveEnrichmentRun(projectId) {
  const db = await getDb();
  if (!db) {
    return null;
  }
  const { enrichmentRuns } = await Promise.resolve().then(() =>
    __importStar(require("../drizzle/schema"))
  );
  const result = await db
    .select()
    .from(enrichmentRuns)
    .where(
      (0, drizzle_orm_1.and)(
        (0, drizzle_orm_1.eq)(enrichmentRuns.projectId, projectId),
        (0,
        drizzle_orm_1.sql)`${enrichmentRuns.status} IN ('running', 'paused')`
      )
    )
    .orderBy((0, drizzle_orm_1.sql)`${enrichmentRuns.startedAt} DESC`)
    .limit(1);
  return result.length > 0 ? result[0] : null;
}
// ===== Scheduled Enrichments =====
const schema_2 = require("../drizzle/schema");
async function createScheduledEnrichment(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(schema_2.scheduledEnrichments).values(data);
  return result.insertId;
}
async function listScheduledEnrichments(projectId) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(schema_2.scheduledEnrichments)
    .where(
      (0, drizzle_orm_1.eq)(schema_2.scheduledEnrichments.projectId, projectId)
    )
    .orderBy(schema_2.scheduledEnrichments.scheduledAt);
}
async function cancelScheduledEnrichment(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(schema_2.scheduledEnrichments)
    .set({ status: "cancelled" })
    .where((0, drizzle_orm_1.eq)(schema_2.scheduledEnrichments.id, id));
}
async function deleteScheduledEnrichment(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(schema_2.scheduledEnrichments)
    .where((0, drizzle_orm_1.eq)(schema_2.scheduledEnrichments.id, id));
}
// ========== Alert Configs Functions ==========
const schema_3 = require("../drizzle/schema");
async function createAlertConfig(config) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(schema_3.alertConfigs).values(config);
  return result;
}
async function getAlertConfigs(projectId) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(schema_3.alertConfigs)
    .where((0, drizzle_orm_1.eq)(schema_3.alertConfigs.projectId, projectId));
}
async function updateAlertConfig(id, updates) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(schema_3.alertConfigs)
    .set({ ...updates, updatedAt: new Date() })
    .where((0, drizzle_orm_1.eq)(schema_3.alertConfigs.id, id));
}
async function deleteAlertConfig(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(schema_3.alertConfigs)
    .where((0, drizzle_orm_1.eq)(schema_3.alertConfigs.id, id));
}
// ============================================
// ALERT HISTORY HELPERS
// ============================================
async function createAlertHistory(history) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(schema_3.alertHistory).values(history);
  return result;
}
async function getAlertHistory(projectId, options) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [
    (0, drizzle_orm_1.eq)(schema_3.alertHistory.projectId, projectId),
  ];
  if (options?.alertType) {
    conditions.push(
      (0, drizzle_orm_1.eq)(schema_3.alertHistory.alertType, options.alertType)
    );
  }
  const results = await db
    .select()
    .from(schema_3.alertHistory)
    .where((0, drizzle_orm_1.and)(...conditions))
    .orderBy((0, drizzle_orm_1.desc)(schema_3.alertHistory.triggeredAt))
    .limit(options?.limit || 100)
    .offset(options?.offset || 0);
  return results;
}
// ============================================
// LEAD CONVERSIONS HELPERS
// ============================================
async function createLeadConversion(conversion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(schema_3.leadConversions).values(conversion);
  return result;
}
async function getLeadConversions(projectId) {
  const db = await getDb();
  if (!db) return [];
  const results = await db
    .select()
    .from(schema_3.leadConversions)
    .where((0, drizzle_orm_1.eq)(schema_3.leadConversions.projectId, projectId))
    .orderBy((0, drizzle_orm_1.desc)(schema_3.leadConversions.convertedAt));
  return results;
}
async function deleteLeadConversion(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(schema_3.leadConversions)
    .where((0, drizzle_orm_1.eq)(schema_3.leadConversions.id, id));
}
// ============================================
// ROI METRICS HELPERS
// ============================================
async function calculateROIMetrics(projectId) {
  const db = await getDb();
  if (!db) return null;
  // Total de leads
  const totalLeadsResult = await db
    .select({ count: (0, drizzle_orm_1.sql)`COUNT(*)` })
    .from(schema_1.leads)
    .where((0, drizzle_orm_1.eq)(schema_1.leads.projectId, projectId));
  const totalLeads = totalLeadsResult[0]?.count || 0;
  // Total de conversões (won)
  const conversionsResult = await db
    .select({ count: (0, drizzle_orm_1.sql)`COUNT(*)` })
    .from(schema_3.leadConversions)
    .where(
      (0, drizzle_orm_1.and)(
        (0, drizzle_orm_1.eq)(schema_3.leadConversions.projectId, projectId),
        (0, drizzle_orm_1.eq)(schema_3.leadConversions.status, "won")
      )
    );
  const totalConversions = conversionsResult[0]?.count || 0;
  // Valor total de deals
  const dealValueResult = await db
    .select({ total: (0, drizzle_orm_1.sql)`SUM(dealValue)` })
    .from(schema_3.leadConversions)
    .where(
      (0, drizzle_orm_1.and)(
        (0, drizzle_orm_1.eq)(schema_3.leadConversions.projectId, projectId),
        (0, drizzle_orm_1.eq)(schema_3.leadConversions.status, "won")
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
      mercadoId: schema_1.leads.mercadoId,
      mercadoNome: schema_1.mercadosUnicos.nome,
      conversions: (0,
      drizzle_orm_1.sql)`COUNT(${schema_3.leadConversions.id})`,
      totalValue: (0,
      drizzle_orm_1.sql)`SUM(${schema_3.leadConversions.dealValue})`,
    })
    .from(schema_3.leadConversions)
    .innerJoin(
      schema_1.leads,
      (0, drizzle_orm_1.eq)(schema_3.leadConversions.leadId, schema_1.leads.id)
    )
    .innerJoin(
      schema_1.mercadosUnicos,
      (0, drizzle_orm_1.eq)(
        schema_1.leads.mercadoId,
        schema_1.mercadosUnicos.id
      )
    )
    .where(
      (0, drizzle_orm_1.and)(
        (0, drizzle_orm_1.eq)(schema_3.leadConversions.projectId, projectId),
        (0, drizzle_orm_1.eq)(schema_3.leadConversions.status, "won")
      )
    )
    .groupBy(schema_1.leads.mercadoId, schema_1.mercadosUnicos.nome)
    .orderBy(
      (0, drizzle_orm_1.desc)(
        (0, drizzle_orm_1.sql)`COUNT(${schema_3.leadConversions.id})`
      )
    );
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
async function getFunnelData(projectId) {
  const db = await getDb();
  if (!db) return null;
  // Contar leads por estágio
  const stageCountsResult = await db
    .select({
      stage: schema_1.leads.stage,
      count: (0, drizzle_orm_1.sql)`COUNT(*)`,
    })
    .from(schema_1.leads)
    .where((0, drizzle_orm_1.eq)(schema_1.leads.projectId, projectId))
    .groupBy(schema_1.leads.stage);
  // Mapear para objeto
  const stageCounts = {};
  stageCountsResult.forEach(row => {
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
async function logActivity(data) {
  const db = await getDb();
  if (!db) return null;
  try {
    await db.insert(schema_1.activityLog).values(data);
    return true;
  } catch (error) {
    console.error("[Database] Failed to log activity:", error);
    return false;
  }
}
async function getRecentActivities(projectId, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  try {
    const activities = await db
      .select()
      .from(schema_1.activityLog)
      .where((0, drizzle_orm_1.eq)(schema_1.activityLog.projectId, projectId))
      .orderBy((0, drizzle_orm_1.desc)(schema_1.activityLog.createdAt))
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
async function getEvolutionData(projectId, months = 6) {
  const db = await getDb();
  if (!db) return [];
  try {
    const result = await db.execute((0, drizzle_orm_1.sql)`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        COUNT(DISTINCT CASE WHEN table_name = 'mercados' THEN id END) as mercados,
        COUNT(DISTINCT CASE WHEN table_name = 'clientes' THEN id END) as clientes,
        COUNT(DISTINCT CASE WHEN table_name = 'leads' THEN id END) as leads
      FROM (
        SELECT id, createdAt, 'mercados' as table_name FROM mercados_unicos WHERE projectId = ${projectId}
        UNION ALL
        SELECT id, createdAt, 'clientes' as table_name FROM clientes WHERE projectId = ${projectId}
        UNION ALL
        SELECT id, createdAt, 'leads' as table_name FROM leads WHERE projectId = ${projectId}
      ) combined
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ${months} MONTH)
      GROUP BY month
      ORDER BY month ASC
    `);
    return result.rows;
  } catch (error) {
    console.error("[Database] Failed to get evolution data:", error);
    return [];
  }
}
// Distribuição geográfica (top 10 UFs)
async function getGeographicDistribution(projectId) {
  const db = await getDb();
  if (!db) return [];
  try {
    const result = await db.execute((0, drizzle_orm_1.sql)`
      SELECT 
        uf,
        COUNT(*) as count
      FROM (
        SELECT uf FROM clientes WHERE projectId = ${projectId} AND uf IS NOT NULL
        UNION ALL
        SELECT uf FROM concorrentes WHERE projectId = ${projectId} AND uf IS NOT NULL
        UNION ALL
        SELECT uf FROM leads WHERE projectId = ${projectId} AND uf IS NOT NULL
      ) combined
      GROUP BY uf
      ORDER BY count DESC
      LIMIT 10
    `);
    return result.rows;
  } catch (error) {
    console.error("[Database] Failed to get geographic distribution:", error);
    return [];
  }
}
// Distribuição por segmentação (B2B/B2C/Ambos)
async function getSegmentationDistribution(projectId) {
  const db = await getDb();
  if (!db) return [];
  try {
    const result = await db.execute((0, drizzle_orm_1.sql)`
      SELECT 
        segmentacao,
        COUNT(*) as count
      FROM mercados_unicos
      WHERE projectId = ${projectId} AND segmentacao IS NOT NULL
      GROUP BY segmentacao
      ORDER BY count DESC
    `);
    return result.rows;
  } catch (error) {
    console.error("[Database] Failed to get segmentation distribution:", error);
    return [];
  }
}
async function globalSearch(query, projectId, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  const searchTerm = `%${query}%`;
  const results = [];
  try {
    // Buscar mercados
    const mercadosConditions = [
      (0,
      drizzle_orm_1.sql)`${schema_1.mercadosUnicos.nome} LIKE ${searchTerm}`,
    ];
    if (projectId) {
      mercadosConditions.push(
        (0, drizzle_orm_1.eq)(schema_1.mercadosUnicos.projectId, projectId)
      );
    }
    const mercados = await db
      .select({
        id: schema_1.mercadosUnicos.id,
        nome: schema_1.mercadosUnicos.nome,
        segmentacao: schema_1.mercadosUnicos.segmentacao,
      })
      .from(schema_1.mercadosUnicos)
      .where((0, drizzle_orm_1.and)(...mercadosConditions))
      .limit(limit);
    results.push(
      ...mercados.map(m => ({
        id: m.id,
        type: "mercado",
        title: m.nome,
        subtitle: m.segmentacao || undefined,
        metadata: { segmentacao: m.segmentacao },
      }))
    );
    // Buscar clientes
    const clientesConditions = [
      (0, drizzle_orm_1.or)(
        (0, drizzle_orm_1.sql)`${schema_1.clientes.nome} LIKE ${searchTerm}`,
        (0, drizzle_orm_1.sql)`${schema_1.clientes.cnpj} LIKE ${searchTerm}`
      ),
    ];
    if (projectId) {
      clientesConditions.push(
        (0, drizzle_orm_1.eq)(schema_1.clientes.projectId, projectId)
      );
    }
    const clientesResult = await db
      .select({
        id: schema_1.clientes.id,
        nome: schema_1.clientes.nome,
        cnpj: schema_1.clientes.cnpj,
      })
      .from(schema_1.clientes)
      .where((0, drizzle_orm_1.and)(...clientesConditions))
      .limit(limit);
    results.push(
      ...clientesResult.map(c => ({
        id: c.id,
        type: "cliente",
        title: c.nome,
        subtitle: c.cnpj || undefined,
        metadata: { cnpj: c.cnpj },
      }))
    );
    // Buscar concorrentes
    const concorrentesConditions = [
      (0, drizzle_orm_1.or)(
        (0,
        drizzle_orm_1.sql)`${schema_1.concorrentes.nome} LIKE ${searchTerm}`,
        (0, drizzle_orm_1.sql)`${schema_1.concorrentes.cnpj} LIKE ${searchTerm}`
      ),
    ];
    if (projectId) {
      concorrentesConditions.push(
        (0, drizzle_orm_1.eq)(schema_1.concorrentes.projectId, projectId)
      );
    }
    const concorrentesResult = await db
      .select({
        id: schema_1.concorrentes.id,
        nome: schema_1.concorrentes.nome,
        cnpj: schema_1.concorrentes.cnpj,
      })
      .from(schema_1.concorrentes)
      .where((0, drizzle_orm_1.and)(...concorrentesConditions))
      .limit(limit);
    results.push(
      ...concorrentesResult.map(c => ({
        id: c.id,
        type: "concorrente",
        title: c.nome,
        subtitle: c.cnpj || undefined,
        metadata: { cnpj: c.cnpj },
      }))
    );
    // Buscar leads
    const leadsConditions = [
      (0, drizzle_orm_1.or)(
        (0, drizzle_orm_1.sql)`${schema_1.leads.nome} LIKE ${searchTerm}`,
        (0, drizzle_orm_1.sql)`${schema_1.leads.email} LIKE ${searchTerm}`,
        (0, drizzle_orm_1.sql)`${schema_1.leads.telefone} LIKE ${searchTerm}`
      ),
    ];
    if (projectId) {
      leadsConditions.push(
        (0, drizzle_orm_1.eq)(schema_1.leads.projectId, projectId)
      );
    }
    const leadsResult = await db
      .select({
        id: schema_1.leads.id,
        nome: schema_1.leads.nome,
        email: schema_1.leads.email,
        telefone: schema_1.leads.telefone,
      })
      .from(schema_1.leads)
      .where((0, drizzle_orm_1.and)(...leadsConditions))
      .limit(limit);
    results.push(
      ...leadsResult.map(l => ({
        id: l.id,
        type: "lead",
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
async function createProduto(data) {
  const db = await getDb();
  if (!db) return null;
  try {
    const [produto] = await db.insert(schema_1.produtos).values({
      projectId: data.projectId,
      clienteId: data.clienteId,
      mercadoId: data.mercadoId,
      nome: data.nome,
      descricao: data.descricao,
      categoria: data.categoria,
      preco: data.preco,
      unidade: data.unidade,
      ativo: data.ativo ?? 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return produto;
  } catch (error) {
    console.error("[Database] Failed to create produto:", error);
    return null;
  }
}
async function getProdutosByCliente(clienteId) {
  const db = await getDb();
  if (!db) return [];
  try {
    const result = await db
      .select()
      .from(schema_1.produtos)
      .where((0, drizzle_orm_1.eq)(schema_1.produtos.clienteId, clienteId))
      .orderBy((0, drizzle_orm_1.desc)(schema_1.produtos.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get produtos by cliente:", error);
    return [];
  }
}
async function getProdutosByMercado(mercadoId) {
  const db = await getDb();
  if (!db) return [];
  try {
    const result = await db
      .select()
      .from(schema_1.produtos)
      .where((0, drizzle_orm_1.eq)(schema_1.produtos.mercadoId, mercadoId))
      .orderBy((0, drizzle_orm_1.desc)(schema_1.produtos.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get produtos by mercado:", error);
    return [];
  }
}
async function getProdutosByProject(projectId) {
  const db = await getDb();
  if (!db) return [];
  try {
    const result = await db
      .select()
      .from(schema_1.produtos)
      .where((0, drizzle_orm_1.eq)(schema_1.produtos.projectId, projectId))
      .orderBy((0, drizzle_orm_1.desc)(schema_1.produtos.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get produtos by project:", error);
    return [];
  }
}
async function getProdutoById(id) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db
      .select()
      .from(schema_1.produtos)
      .where((0, drizzle_orm_1.eq)(schema_1.produtos.id, id))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get produto by id:", error);
    return null;
  }
}
async function updateProduto(id, data) {
  const db = await getDb();
  if (!db) return null;
  try {
    await db
      .update(schema_1.produtos)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where((0, drizzle_orm_1.eq)(schema_1.produtos.id, id));
    return await getProdutoById(id);
  } catch (error) {
    console.error("[Database] Failed to update produto:", error);
    return null;
  }
}
async function deleteProduto(id) {
  const db = await getDb();
  if (!db) return false;
  try {
    await db
      .delete(schema_1.produtos)
      .where((0, drizzle_orm_1.eq)(schema_1.produtos.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete produto:", error);
    return false;
  }
}
