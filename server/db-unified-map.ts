/**
 * Funções de banco de dados para o Sistema Unificado de Mapas
 * Busca todas as entidades (mercados, clientes, produtos, concorrentes, leads) com coordenadas
 */

import { getDb } from "./db";
import { sql, and, eq, gte, lte, inArray, isNotNull, or } from "drizzle-orm";
import {
  mercadosUnicos,
  clientes,
  produtos,
  concorrentes,
  leads,
} from "../drizzle/schema";

export interface EntityFilter {
  projectId: number;
  pesquisaId?: number;
  entityTypes?: Array<
    "mercado" | "cliente" | "produto" | "concorrente" | "lead"
  >;
  mercadoIds?: number[];
  minQuality?: number;
  validationStatus?: string;
  searchText?: string;
  ufs?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

export interface MapEntity {
  id: number;
  type: "mercado" | "cliente" | "produto" | "concorrente" | "lead";
  nome: string;
  latitude: number;
  longitude: number;
  cidade?: string;
  uf?: string;
  qualidadeScore?: number;
  qualidadeClassificacao?: string;
  validationStatus?: string;
  mercadoId?: number;
  mercadoNome?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Busca todas as entidades com coordenadas para exibir no mapa
 */
export async function getAllMapEntities(
  filter: EntityFilter
): Promise<MapEntity[]> {
  const db = await getDb();
  if (!db) return [];

  const entities: MapEntity[] = [];
  const types = filter.entityTypes || [
    "mercado",
    "cliente",
    "produto",
    "concorrente",
    "lead",
  ];

  // Helper para construir condições comuns
  const buildCommonConditions = (table: unknown) => {
    const conditions: unknown[] = [
      eq(table.projectId, filter.projectId),
      isNotNull(table.latitude),
      isNotNull(table.longitude),
    ];

    if (filter.pesquisaId) {
      conditions.push(eq(table.pesquisaId, filter.pesquisaId));
    }

    if (filter.minQuality && table.qualidadeScore) {
      conditions.push(gte(table.qualidadeScore, filter.minQuality));
    }

    if (filter.validationStatus && table.validationStatus) {
      conditions.push(eq(table.validationStatus, filter.validationStatus));
    }

    if (filter.ufs && filter.ufs.length > 0 && table.uf) {
      conditions.push(inArray(table.uf, filter.ufs));
    }

    if (filter.dateFrom && table.createdAt) {
      conditions.push(gte(table.createdAt, filter.dateFrom.toISOString()));
    }

    if (filter.dateTo && table.createdAt) {
      conditions.push(lte(table.createdAt, filter.dateTo.toISOString()));
    }

    return conditions;
  };

  try {
    // 1. CLIENTES
    if (types.includes("cliente")) {
      const clientesData = await db
        .select({
          id: clientes.id,
          nome: clientes.nome,
          latitude: clientes.latitude,
          longitude: clientes.longitude,
          cidade: clientes.cidade,
          uf: clientes.uf,
          qualidadeScore: clientes.qualidadeScore,
          qualidadeClassificacao: clientes.qualidadeClassificacao,
          validationStatus: clientes.validationStatus,
          cnpj: clientes.cnpj,
          email: clientes.email,
          telefone: clientes.telefone,
          porte: clientes.porte,
        })
        .from(clientes)
        .where(and(...buildCommonConditions(clientes)));

      for (const cliente of clientesData) {
        if (cliente.latitude && cliente.longitude) {
          // Buscar mercados do cliente
          const mercadosCliente = await db
            .select({
              mercadoId: sql<number>`cm.mercadoId`,
              mercadoNome: mercadosUnicos.nome,
            })
            .from(sql`clientes_mercados cm`)
            .innerJoin(mercadosUnicos, eq(sql`cm.mercadoId`, mercadosUnicos.id))
            .where(eq(sql`cm.clienteId`, cliente.id))
            .limit(3);

          entities.push({
            id: cliente.id,
            type: "cliente",
            nome: cliente.nome,
            latitude: Number(cliente.latitude),
            longitude: Number(cliente.longitude),
            cidade: cliente.cidade || undefined,
            uf: cliente.uf || undefined,
            qualidadeScore: cliente.qualidadeScore || undefined,
            qualidadeClassificacao: cliente.qualidadeClassificacao || undefined,
            validationStatus: cliente.validationStatus || undefined,
            mercadoId: mercadosCliente[0]?.mercadoId,
            mercadoNome: mercadosCliente[0]?.mercadoNome,
            metadata: {
              cnpj: cliente.cnpj,
              email: cliente.email,
              telefone: cliente.telefone,
              porte: cliente.porte,
              mercados: mercadosCliente.map(m => ({
                id: m.mercadoId,
                nome: m.mercadoNome,
              })),
            },
          });
        }
      }
    }

    // 2. CONCORRENTES
    if (types.includes("concorrente")) {
      const concorrentesData = await db
        .select({
          id: concorrentes.id,
          nome: concorrentes.nome,
          latitude: concorrentes.latitude,
          longitude: concorrentes.longitude,
          cidade: concorrentes.cidade,
          uf: concorrentes.uf,
          qualidadeScore: concorrentes.qualidadeScore,
          qualidadeClassificacao: concorrentes.qualidadeClassificacao,
          validationStatus: concorrentes.validationStatus,
          mercadoId: concorrentes.mercadoId,
          cnpj: concorrentes.cnpj,
          site: concorrentes.site,
          porte: concorrentes.porte,
        })
        .from(concorrentes)
        .where(and(...buildCommonConditions(concorrentes)));

      for (const concorrente of concorrentesData) {
        if (concorrente.latitude && concorrente.longitude) {
          // Buscar nome do mercado
          const mercado = await db
            .select({ nome: mercadosUnicos.nome })
            .from(mercadosUnicos)
            .where(eq(mercadosUnicos.id, concorrente.mercadoId))
            .limit(1);

          entities.push({
            id: concorrente.id,
            type: "concorrente",
            nome: concorrente.nome,
            latitude: Number(concorrente.latitude),
            longitude: Number(concorrente.longitude),
            cidade: concorrente.cidade || undefined,
            uf: concorrente.uf || undefined,
            qualidadeScore: concorrente.qualidadeScore || undefined,
            qualidadeClassificacao:
              concorrente.qualidadeClassificacao || undefined,
            validationStatus: concorrente.validationStatus || undefined,
            mercadoId: concorrente.mercadoId,
            mercadoNome: mercado[0]?.nome,
            metadata: {
              cnpj: concorrente.cnpj,
              site: concorrente.site,
              porte: concorrente.porte,
            },
          });
        }
      }
    }

    // 3. LEADS
    if (types.includes("lead")) {
      const leadsData = await db
        .select({
          id: leads.id,
          nome: leads.nome,
          latitude: leads.latitude,
          longitude: leads.longitude,
          cidade: leads.cidade,
          uf: leads.uf,
          qualidadeScore: leads.qualidadeScore,
          qualidadeClassificacao: leads.qualidadeClassificacao,
          validationStatus: leads.validationStatus,
          mercadoId: leads.mercadoId,
          cnpj: leads.cnpj,
          email: leads.email,
          telefone: leads.telefone,
          leadStage: leads.leadStage,
        })
        .from(leads)
        .where(and(...buildCommonConditions(leads)));

      for (const lead of leadsData) {
        if (lead.latitude && lead.longitude) {
          // Buscar nome do mercado
          const mercado = await db
            .select({ nome: mercadosUnicos.nome })
            .from(mercadosUnicos)
            .where(eq(mercadosUnicos.id, lead.mercadoId))
            .limit(1);

          entities.push({
            id: lead.id,
            type: "lead",
            nome: lead.nome,
            latitude: Number(lead.latitude),
            longitude: Number(lead.longitude),
            cidade: lead.cidade || undefined,
            uf: lead.uf || undefined,
            qualidadeScore: lead.qualidadeScore || undefined,
            qualidadeClassificacao: lead.qualidadeClassificacao || undefined,
            validationStatus: lead.validationStatus || undefined,
            mercadoId: lead.mercadoId,
            mercadoNome: mercado[0]?.nome,
            metadata: {
              cnpj: lead.cnpj,
              email: lead.email,
              telefone: lead.telefone,
              stage: lead.leadStage,
            },
          });
        }
      }
    }

    // 4. MERCADOS (agregação de coordenadas de clientes/concorrentes/leads)
    if (types.includes("mercado")) {
      const mercadosData = await db
        .select({
          id: mercadosUnicos.id,
          nome: mercadosUnicos.nome,
          categoria: mercadosUnicos.categoria,
          segmentacao: mercadosUnicos.segmentacao,
          quantidadeClientes: mercadosUnicos.quantidadeClientes,
        })
        .from(mercadosUnicos)
        .where(
          and(
            eq(mercadosUnicos.projectId, filter.projectId),
            filter.pesquisaId
              ? eq(mercadosUnicos.pesquisaId, filter.pesquisaId)
              : undefined
          )
        );

      for (const mercado of mercadosData) {
        // Calcular centróide das coordenadas de clientes vinculados ao mercado
        const coordsResult = await db.execute(sql`
          SELECT 
            AVG(CAST(c.latitude AS DECIMAL(10,8))) as avgLat,
            AVG(CAST(c.longitude AS DECIMAL(11,8))) as avgLng,
            COUNT(*) as count
          FROM clientes_mercados cm
          INNER JOIN clientes c ON cm.clienteId = c.id
          WHERE cm.mercadoId = ${mercado.id}
            AND c.latitude IS NOT NULL 
            AND c.longitude IS NOT NULL
        `);

        const coords = (coordsResult as any).rows?.[0];

        if (coords && coords.count > 0 && coords.avgLat && coords.avgLng) {
          // Contar entidades do mercado
          const statsResult = await db.execute(sql`
            SELECT
              (SELECT COUNT(*) FROM clientes_mercados cm2 WHERE cm2.mercadoId = ${mercado.id}) as totalClientes,
              (SELECT COUNT(*) FROM concorrentes WHERE mercadoId = ${mercado.id}) as totalConcorrentes,
              (SELECT COUNT(*) FROM leads WHERE mercadoId = ${mercado.id}) as totalLeads,
              (SELECT COUNT(*) FROM produtos WHERE mercadoId = ${mercado.id}) as totalProdutos
          `);

          const stats = (statsResult as any).rows?.[0];

          entities.push({
            id: mercado.id,
            type: "mercado",
            nome: mercado.nome,
            latitude: Number(coords.avgLat),
            longitude: Number(coords.avgLng),
            metadata: {
              categoria: mercado.categoria,
              segmentacao: mercado.segmentacao,
              totalClientes: stats.totalClientes || 0,
              totalConcorrentes: stats.totalConcorrentes || 0,
              totalLeads: stats.totalLeads || 0,
              totalProdutos: stats.totalProdutos || 0,
            },
          });
        }
      }
    }

    // 5. PRODUTOS (usar coordenadas dos clientes que os vendem)
    if (types.includes("produto")) {
      const produtosData = await db
        .select({
          id: produtos.id,
          nome: produtos.nome,
          categoria: produtos.categoria,
          preco: produtos.preco,
          clienteId: produtos.clienteId,
          mercadoId: produtos.mercadoId,
        })
        .from(produtos)
        .where(
          and(
            eq(produtos.projectId, filter.projectId),
            filter.pesquisaId
              ? eq(produtos.pesquisaId, filter.pesquisaId)
              : undefined,
            eq(produtos.ativo, 1)
          )
        );

      for (const produto of produtosData) {
        // Buscar coordenadas do cliente
        const cliente = await db
          .select({
            latitude: clientes.latitude,
            longitude: clientes.longitude,
            cidade: clientes.cidade,
            uf: clientes.uf,
            nome: clientes.nome,
          })
          .from(clientes)
          .where(
            and(
              eq(clientes.id, produto.clienteId),
              isNotNull(clientes.latitude),
              isNotNull(clientes.longitude)
            )
          )
          .limit(1);

        if (cliente[0] && cliente[0].latitude && cliente[0].longitude) {
          // Buscar nome do mercado
          const mercado = await db
            .select({ nome: mercadosUnicos.nome })
            .from(mercadosUnicos)
            .where(eq(mercadosUnicos.id, produto.mercadoId))
            .limit(1);

          entities.push({
            id: produto.id,
            type: "produto",
            nome: produto.nome,
            latitude: Number(cliente[0].latitude),
            longitude: Number(cliente[0].longitude),
            cidade: cliente[0].cidade || undefined,
            uf: cliente[0].uf || undefined,
            mercadoId: produto.mercadoId,
            mercadoNome: mercado[0]?.nome,
            metadata: {
              categoria: produto.categoria,
              preco: produto.preco,
              clienteNome: cliente[0].nome,
              clienteId: produto.clienteId,
            },
          });
        }
      }
    }

    // Aplicar filtro de texto se fornecido
    if (filter.searchText) {
      const searchLower = filter.searchText.toLowerCase();
      return entities.filter(
        e =>
          e.nome.toLowerCase().includes(searchLower) ||
          e.cidade?.toLowerCase().includes(searchLower) ||
          e.mercadoNome?.toLowerCase().includes(searchLower)
      );
    }

    return entities;
  } catch (error) {
    console.error("Erro ao buscar entidades do mapa:", error);
    return [];
  }
}

/**
 * Busca detalhes completos de uma entidade específica
 */
export async function getEntityDetails(
  entityType: "mercado" | "cliente" | "produto" | "concorrente" | "lead",
  entityId: number
): Promise<any> {
  const db = await getDb();
  if (!db) return null;

  try {
    switch (entityType) {
      case "cliente": {
        const result = await db
          .select()
          .from(clientes)
          .where(eq(clientes.id, entityId))
          .limit(1);

        if (result.length === 0) return null;

        // Buscar mercados
        const mercadosCliente = await db
          .select({
            mercadoId: sql<number>`cm.mercadoId`,
            mercadoNome: mercadosUnicos.nome,
          })
          .from(sql`clientes_mercados cm`)
          .innerJoin(mercadosUnicos, eq(sql`cm.mercadoId`, mercadosUnicos.id))
          .where(eq(sql`cm.clienteId`, entityId));

        // Buscar tags
        const tagsResult = await db.execute(sql`
          SELECT t.id, t.name, t.color
          FROM entity_tags et
          INNER JOIN tags t ON et.tagId = t.id
          WHERE et.entityType = 'cliente' AND et.entityId = ${entityId}
        `);

        return {
          ...result[0],
          mercados: mercadosCliente,
          tags: (tagsResult as any).rows || [],
        };
      }

      case "concorrente": {
        const result = await db
          .select()
          .from(concorrentes)
          .where(eq(concorrentes.id, entityId))
          .limit(1);

        if (result.length === 0) return null;

        // Buscar mercado
        const mercado = await db
          .select()
          .from(mercadosUnicos)
          .where(eq(mercadosUnicos.id, result[0].mercadoId))
          .limit(1);

        // Buscar tags
        const tagsResult = await db.execute(sql`
          SELECT t.id, t.name, t.color
          FROM entity_tags et
          INNER JOIN tags t ON et.tagId = t.id
          WHERE et.entityType = 'concorrente' AND et.entityId = ${entityId}
        `);

        return {
          ...result[0],
          mercado: mercado[0],
          tags: (tagsResult as any).rows || [],
        };
      }

      case "lead": {
        const result = await db
          .select()
          .from(leads)
          .where(eq(leads.id, entityId))
          .limit(1);

        if (result.length === 0) return null;

        // Buscar mercado
        const mercado = await db
          .select()
          .from(mercadosUnicos)
          .where(eq(mercadosUnicos.id, result[0].mercadoId))
          .limit(1);

        // Buscar tags
        const tagsResult = await db.execute(sql`
          SELECT t.id, t.name, t.color
          FROM entity_tags et
          INNER JOIN tags t ON et.tagId = t.id
          WHERE et.entityType = 'lead' AND et.entityId = ${entityId}
        `);

        return {
          ...result[0],
          mercado: mercado[0],
          tags: (tagsResult as any).rows || [],
        };
      }

      case "mercado": {
        const result = await db
          .select()
          .from(mercadosUnicos)
          .where(eq(mercadosUnicos.id, entityId))
          .limit(1);

        if (result.length === 0) return null;

        // Buscar estatísticas
        const statsResult = await db.execute(sql`
          SELECT
            (SELECT COUNT(*) FROM clientes_mercados WHERE mercadoId = ${entityId}) as totalClientes,
            (SELECT COUNT(*) FROM concorrentes WHERE mercadoId = ${entityId}) as totalConcorrentes,
            (SELECT COUNT(*) FROM leads WHERE mercadoId = ${entityId}) as totalLeads,
            (SELECT COUNT(*) FROM produtos WHERE mercadoId = ${entityId}) as totalProdutos
        `);

        // Buscar tags
        const tagsResult = await db.execute(sql`
          SELECT t.id, t.name, t.color
          FROM entity_tags et
          INNER JOIN tags t ON et.tagId = t.id
          WHERE et.entityType = 'mercado' AND et.entityId = ${entityId}
        `);

        return {
          ...result[0],
          stats: (statsResult as any).rows?.[0] || {},
          tags: (tagsResult as any).rows || [],
        };
      }

      case "produto": {
        const result = await db
          .select()
          .from(produtos)
          .where(eq(produtos.id, entityId))
          .limit(1);

        if (result.length === 0) return null;

        // Buscar cliente
        const cliente = await db
          .select()
          .from(clientes)
          .where(eq(clientes.id, result[0].clienteId))
          .limit(1);

        // Buscar mercado
        const mercado = await db
          .select()
          .from(mercadosUnicos)
          .where(eq(mercadosUnicos.id, result[0].mercadoId))
          .limit(1);

        return {
          ...result[0],
          cliente: cliente[0],
          mercado: mercado[0],
        };
      }

      default:
        return null;
    }
  } catch (error) {
    console.error("Erro ao buscar detalhes da entidade:", error);
    return null;
  }
}
