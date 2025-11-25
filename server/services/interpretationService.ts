import { invokeLLM } from "../_core/llm";
import crypto from "crypto";
import { getDb } from "../db";
import { eq, sql } from "drizzle-orm";

/**
 * Entidades extraídas do contexto em linguagem natural
 */
export interface ExtractedEntities {
  entityType: "mercados" | "clientes" | "concorrentes" | "leads" | "produtos";
  geography?: {
    states?: string[]; // ["SP", "MG"]
    cities?: string[]; // ["São Paulo", "Campinas"]
    regions?: string[]; // ["Sudeste", "Sul"]
  };
  quality?: {
    minScore?: number; // 80
    status?: string[]; // ["validados"]
    completeness?: number; // 70
  };
  size?: {
    porte?: string[]; // ["média", "grande"]
    revenue?: {
      // Faturamento
      min?: number;
      max?: number;
    };
  };
  segmentation?: {
    type?: string[]; // ["B2B", "B2C"]
    cnae?: string[]; // ["1013-9"]
  };
  temporal?: {
    createdAfter?: Date;
    createdBefore?: Date;
    updatedWithin?: number; // dias
  };
  keywords: string[]; // ["embalagens", "alta qualidade"]
}

/**
 * Resultado da interpretação com metadados
 */
export interface InterpretationResult {
  entities: ExtractedEntities;
  confidence: number; // 0-100
  estimatedRecords: number; // Estimativa de registros
  suggestions: string[]; // Sugestões de refinamento
  warnings: string[]; // Alertas
  cached: boolean; // Se veio do cache
}

/**
 * Serviço de interpretação de contexto em linguagem natural
 */
export class InterpretationService {
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  /**
   * Interpreta contexto em linguagem natural e extrai entidades
   */
  async interpret(
    context: string,
    projectId?: string
  ): Promise<InterpretationResult> {
    // Verifica cache primeiro
    const cached = await this.getFromCache(context);
    if (cached) {
      return {
        ...cached,
        cached: true,
      };
    }

    // Chama IA para interpretar
    const entities = await this.interpretWithAI(context);

    // Estima número de registros
    const estimatedRecords = await this.estimateRecords(entities, projectId);

    // Gera sugestões e warnings
    const suggestions = this.generateSuggestions(entities);
    const warnings = this.generateWarnings(entities);

    // Calcula confiança
    const confidence = this.calculateConfidence(entities);

    const result: InterpretationResult = {
      entities,
      confidence,
      estimatedRecords,
      suggestions,
      warnings,
      cached: false,
    };

    // Salva no cache
    await this.saveToCache(context, result);

    return result;
  }

  /**
   * Interpreta contexto usando IA (Gemini)
   */
  private async interpretWithAI(context: string): Promise<ExtractedEntities> {
    const prompt = this.buildPrompt(context);

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Você é um assistente especializado em análise de dados de mercado. Responda APENAS com JSON válido, sem texto adicional.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "extracted_entities",
          strict: true,
          schema: {
            type: "object",
            properties: {
              entityType: {
                type: "string",
                enum: [
                  "mercados",
                  "clientes",
                  "concorrentes",
                  "leads",
                  "produtos",
                ],
              },
              geography: {
                type: "object",
                properties: {
                  states: { type: "array", items: { type: "string" } },
                  cities: { type: "array", items: { type: "string" } },
                  regions: { type: "array", items: { type: "string" } },
                },
                additionalProperties: false,
              },
              quality: {
                type: "object",
                properties: {
                  minScore: { type: "number" },
                  status: { type: "array", items: { type: "string" } },
                  completeness: { type: "number" },
                },
                additionalProperties: false,
              },
              size: {
                type: "object",
                properties: {
                  porte: { type: "array", items: { type: "string" } },
                  revenue: {
                    type: "object",
                    properties: {
                      min: { type: "number" },
                      max: { type: "number" },
                    },
                    additionalProperties: false,
                  },
                },
                additionalProperties: false,
              },
              segmentation: {
                type: "object",
                properties: {
                  type: { type: "array", items: { type: "string" } },
                  cnae: { type: "array", items: { type: "string" } },
                },
                additionalProperties: false,
              },
              temporal: {
                type: "object",
                properties: {
                  createdAfter: { type: "string" },
                  createdBefore: { type: "string" },
                  updatedWithin: { type: "number" },
                },
                additionalProperties: false,
              },
              keywords: { type: "array", items: { type: "string" } },
            },
            required: ["entityType", "keywords"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const contentStr =
      typeof content === "string" ? content : JSON.stringify(content);
    const parsed = JSON.parse(contentStr || "{}");

    // Converte datas de string para Date
    if (parsed.temporal?.createdAfter) {
      parsed.temporal.createdAfter = new Date(parsed.temporal.createdAfter);
    }
    if (parsed.temporal?.createdBefore) {
      parsed.temporal.createdBefore = new Date(parsed.temporal.createdBefore);
    }

    return parsed as ExtractedEntities;
  }

  /**
   * Constrói prompt estruturado para IA
   */
  private buildPrompt(context: string): string {
    return `
Analise o texto fornecido pelo usuário e extraia informações estruturadas.

CONTEXTO DO SISTEMA:
O usuário está usando um sistema de inteligência de mercado que contém:
- Mercados: Setores/nichos identificados
- Clientes: Empresas que são clientes
- Concorrentes: Empresas concorrentes dos clientes
- Leads: Potenciais novos clientes
- Produtos: Produtos oferecidos pelos clientes

TAREFA:
Analise o texto e extraia:
1. Tipo de entidade principal (mercados/clientes/concorrentes/leads/produtos)
2. Filtros geográficos (estados em siglas como SP/MG, cidades, regiões como Sudeste/Sul)
3. Filtros de qualidade (score numérico 0-100, status como "validados"/"pendentes", completude 0-100)
4. Filtros de porte/tamanho (porte como "micro"/"pequena"/"média"/"grande", faturamento em reais)
5. Filtros de segmentação (tipo B2B/B2C, CNAE)
6. Filtros temporais (datas ISO 8601, períodos em dias)
7. Palavras-chave relevantes

REGRAS IMPORTANTES:
- Seja conservador: só extraia informações EXPLÍCITAS no texto
- Use valores padrão sensatos quando houver ambiguidade:
  * "Alta qualidade" = minScore: 80
  * "Médio porte" = porte: ["média", "grande"]
  * "Recente" = updatedWithin: 30 (dias)
- Estados devem ser siglas (SP, MG, RJ, etc)
- Faturamento em reais (R$) deve ser convertido para número
- Datas devem ser ISO 8601 (YYYY-MM-DD)
- Se não houver informação sobre um campo, NÃO inclua no JSON

TEXTO DO USUÁRIO:
${context}

Retorne APENAS o JSON estruturado, sem texto adicional.
`;
  }

  /**
   * Estima número de registros que atendem aos filtros
   */
  private async estimateRecords(
    entities: ExtractedEntities,
    projectId?: string
  ): Promise<number> {
    const db = await getDb();
    if (!db) return 0;

    try {
      // Monta query de contagem simples baseada na entidade
      let tableName = "";
      switch (entities.entityType) {
        case "mercados":
          tableName = "mercados";
          break;
        case "clientes":
          tableName = "clientes";
          break;
        case "concorrentes":
          tableName = "concorrentes";
          break;
        case "leads":
          tableName = "leads";
          break;
        case "produtos":
          tableName = "produtos_cliente";
          break;
      }

      // Constrói query usando template string SQL do Drizzle
      let conditions = sql`1=1`;

      // Adiciona filtro de projeto se fornecido
      if (projectId) {
        conditions = sql`${conditions} AND projectId = ${projectId}`;
      }

      // Adiciona filtros geográficos
      if (entities.geography?.states && entities.geography.states.length > 0) {
        const statesList = entities.geography.states
          .map(s => sql`${s}`)
          .reduce((acc, curr) => sql`${acc}, ${curr}`);
        conditions = sql`${conditions} AND uf IN (${statesList})`;
      }

      // Adiciona filtros de qualidade
      if (entities.quality?.minScore) {
        conditions = sql`${conditions} AND qualidadeScore >= ${entities.quality.minScore}`;
      }

      if (entities.quality?.status && entities.quality.status.length > 0) {
        const statusList = entities.quality.status
          .map(s => sql`${s}`)
          .reduce((acc, curr) => sql`${acc}, ${curr}`);
        conditions = sql`${conditions} AND status IN (${statusList})`;
      }

      // Adiciona filtros de porte
      if (entities.size?.porte && entities.size.porte.length > 0) {
        const porteList = entities.size.porte
          .map(p => sql`${p}`)
          .reduce((acc, curr) => sql`${acc}, ${curr}`);
        conditions = sql`${conditions} AND porte IN (${porteList})`;
      }

      // Adiciona filtros de segmentação
      if (
        entities.segmentation?.type &&
        entities.segmentation.type.length > 0
      ) {
        const typeList = entities.segmentation.type
          .map(t => sql`${t}`)
          .reduce((acc, curr) => sql`${acc}, ${curr}`);
        conditions = sql`${conditions} AND segmentacao IN (${typeList})`;
      }

      // Executa query
      const result: unknown = await db.execute(
        sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)} WHERE ${conditions}`
      );
      // @ts-ignore - TODO: Fix TypeScript error
      return result[0]?.count || 0;
    } catch (error) {
      console.error(
        "[InterpretationService] Erro ao estimar registros:",
        error
      );
      return 0;
    }
  }

  /**
   * Gera sugestões de refinamento
   */
  private generateSuggestions(entities: ExtractedEntities): string[] {
    const suggestions: string[] = [];

    // Sugestão de filtro geográfico
    if (
      !entities.geography ||
      (!entities.geography.states && !entities.geography.cities)
    ) {
      suggestions.push(
        "Considere adicionar filtro geográfico (estado ou cidade) para maior precisão"
      );
    }

    // Sugestão de filtro de qualidade
    if (!entities.quality || !entities.quality.minScore) {
      suggestions.push(
        "Adicione filtro de quality score para focar em dados de alta qualidade"
      );
    }

    // Sugestão de filtro temporal
    if (!entities.temporal) {
      suggestions.push(
        "Considere filtrar por período para obter dados mais recentes"
      );
    }

    // Sugestão de CNAE
    if (
      entities.entityType === "clientes" &&
      (!entities.segmentation || !entities.segmentation.cnae)
    ) {
      suggestions.push(
        "Adicione filtro por CNAE para segmentar por setor específico"
      );
    }

    return suggestions;
  }

  /**
   * Gera warnings baseados nos filtros
   */
  private generateWarnings(entities: ExtractedEntities): string[] {
    const warnings: string[] = [];

    // Warning sobre faturamento
    if (entities.size?.revenue) {
      warnings.push(
        "Faturamento estimado pode ter baixa precisão para alguns registros"
      );
    }

    // Warning sobre keywords genéricas
    if (entities.keywords.length === 0) {
      warnings.push(
        "Nenhuma palavra-chave identificada - resultados podem ser muito amplos"
      );
    }

    return warnings;
  }

  /**
   * Calcula confiança da interpretação (0-100)
   */
  private calculateConfidence(entities: ExtractedEntities): number {
    let confidence = 50; // Base

    // +20 se tem filtro geográfico
    if (
      entities.geography &&
      (entities.geography.states || entities.geography.cities)
    ) {
      confidence += 20;
    }

    // +15 se tem filtro de qualidade
    if (entities.quality) {
      confidence += 15;
    }

    // +10 se tem keywords
    if (entities.keywords.length > 0) {
      confidence += 10;
    }

    // +5 se tem filtro de porte
    if (entities.size) {
      confidence += 5;
    }

    return Math.min(confidence, 100);
  }

  /**
   * Busca interpretação no cache
   * TODO: Implementar tabela interpretationCache no schema
   */
  private async getFromCache(
    context: string
  ): Promise<InterpretationResult | null> {
    // Cache desabilitado temporariamente
    return null;
  }

  /**
   * Salva interpretação no cache
   * TODO: Implementar tabela interpretationCache no schema
   */
  private async saveToCache(
    context: string,
    result: InterpretationResult
  ): Promise<void> {
    // Cache desabilitado temporariamente
    return;
  }

  /**
   * Gera hash MD5 do contexto
   */
  private hashContext(context: string): string {
    return crypto
      .createHash("md5")
      .update(context.toLowerCase().trim())
      .digest("hex");
  }
}

// Exporta instância singleton
export const interpretationService = new InterpretationService();
