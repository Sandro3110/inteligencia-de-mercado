// @ts-ignore - TODO: Fix TypeScript error
import { invokeLLM } from "../_core/llm";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Analysis template type
 */
// @ts-ignore - TODO: Fix TypeScript error
export type AnalysisTemplateType = "market" | "client" | "competitive" | "lead";

/**
 * Base entity with common fields
 */
interface BaseEntity {
  quality_score?: number;
  uf?: string;
  cidade?: string;
  status?: string;
  nome?: string;
  porte?: string;
}

/**
 * Market entity data
 */
export interface MarketEntity extends BaseEntity {}

/**
 * Client entity data
 */
export interface ClientEntity extends BaseEntity {
  faturamento_estimado?: number;
  segmentacao?: string;
}

/**
 * Competitive entity data
 */
export interface CompetitiveEntity extends BaseEntity {}

/**
 * Lead entity data
 */
export interface LeadEntity extends BaseEntity {}

/**
 * Union type for all entity types
 */
export type AnalysisEntity = MarketEntity | ClientEntity | CompetitiveEntity | LeadEntity;

/**
 * Analysis metrics interface
 */
export interface AnalysisMetrics {
  totalRecords: number;
  timestamp: string;
  avgQualityScore?: number;
  topStates?: Array<{ value: string; count: number }>;
  topCities?: Array<{ value: string; count: number }>;
  portDistribution?: Record<string, number>;
  statusDistribution?: Record<string, number>;
  avgRevenue?: number;
  topSegments?: Array<{ value: string; count: number }>;
  topCompetitors?: Array<{ value: string; count: number }>;
  marketShareEstimate?: Record<string, number>;
  highQualityCount?: number;
  conversionPotential?: number;
}

// @ts-ignore - TODO: Fix TypeScript error
import { invokeLLM } from "../_core/llm";

/**
 * Tipo de template de análise
 */
// @ts-ignore - TODO: Fix TypeScript error
export type AnalysisTemplateType = "market" | "client" | "competitive" | "lead";

/**
 * Insight gerado pela IA
 */
export interface Insight {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  category: "opportunity" | "risk" | "trend" | "recommendation";
  supportingData?: Record<string, unknown>;
}

/**
 * Análise SWOT
 */
export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

/**
 * Recomendações estratégicas
 */
export interface StrategicRecommendations {
  immediate: string[]; // Ações imediatas (0-30 dias)
  shortTerm: string[]; // Curto prazo (1-3 meses)
  longTerm: string[]; // Longo prazo (3-12 meses)
}

/**
 * Resultado completo da análise
 */
export interface AnalysisResult {
  summary: string;
  insights: Insight[];
  swot?: SWOTAnalysis;
  recommendations: StrategicRecommendations;
  metrics: Record<string, unknown>;
  generatedAt: Date;
}

/**
 * Serviço de análise de dados e geração de insights com IA
 */
export class AnalysisService {
  /**
   * Gera análise completa baseada no template
   */
  async analyze(
    data: AnalysisEntity[],
    templateType: AnalysisTemplateType,
    context?: string
  ): Promise<AnalysisResult> {
    // Calcula métricas básicas
    const metrics = this.calculateMetrics(data, templateType);

    // Gera insights com IA
    const insights = await this.generateInsights(
      data,
      metrics,
      templateType,
      context
    );

    // Gera análise SWOT (apenas para alguns templates)
    const swot = ["market", "competitive"].includes(templateType)
      ? await this.generateSWOT(data, metrics, templateType, context)
      : undefined;

    // Gera recomendações estratégicas
    const recommendations = await this.generateRecommendations(
      data,
      metrics,
      insights,
      templateType,
      context
    );

    // Gera sumário executivo
    const summary = await this.generateSummary(
      data,
      metrics,
      insights,
      templateType
    );

    return {
      summary,
      insights,
      swot,
      recommendations,
      metrics,
      generatedAt: new Date(),
    };
  }

  /**
   * Calcula métricas básicas dos dados
   */
  private calculateMetrics(
    data: AnalysisEntity[],
    templateType: AnalysisTemplateType
  ): Record<string, unknown> {
    const metrics: Record<string, unknown> = {
      totalRecords: data.length,
      timestamp: new Date().toISOString(),
    };

    switch (templateType) {
      case "market":
        metrics.avgQualityScore = this.average(data, "quality_score");
        metrics.topStates = this.topN(data, "uf", 5);
        metrics.topCities = this.topN(data, "cidade", 5);
        metrics.portDistribution = this.distribution(data, "porte");
        break;

      case "client":
        metrics.avgQualityScore = this.average(data, "quality_score");
        metrics.statusDistribution = this.distribution(data, "status");
        metrics.avgRevenue = this.average(data, "faturamento_estimado");
        metrics.topSegments = this.topN(data, "segmentacao", 5);
        break;

      case "competitive":
        metrics.avgQualityScore = this.average(data, "quality_score");
        metrics.topCompetitors = this.topN(data, "nome", 10);
        metrics.marketShareEstimate = this.distribution(data, "porte");
        break;

      case "lead":
        metrics.avgQualityScore = this.average(data, "quality_score");
        metrics.highQualityCount = data.filter(
          d => (d.quality_score || 0) >= 80
        ).length;
        metrics.statusDistribution = this.distribution(data, "status");
        metrics.conversionPotential =
          // @ts-ignore - TODO: Fix TypeScript error
          (metrics.highQualityCount / data.length) * 100;
        break;
    }

    return metrics;
  }

  /**
   * Gera insights com IA
   */
  private async generateInsights(
    data: AnalysisEntity[],
    metrics: Record<string, unknown>,
    templateType: AnalysisTemplateType,
    context?: string
  ): Promise<Insight[]> {
    const prompt = this.buildInsightsPrompt(
      data,
      metrics,
      templateType,
      context
    );

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "Você é um analista de mercado sênior especializado em inteligência competitiva e análise de dados. Responda APENAS com JSON válido.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "insights",
            strict: true,
            schema: {
              type: "object",
              properties: {
                insights: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      impact: {
                        type: "string",
                        enum: ["high", "medium", "low"],
                      },
                      category: {
                        type: "string",
                        enum: [
                          "opportunity",
                          "risk",
                          "trend",
                          "recommendation",
                        ],
                      },
                    },
                    required: ["title", "description", "impact", "category"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["insights"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0].message.content;
      const contentStr =
        typeof content === "string" ? content : JSON.stringify(content);
      const parsed = JSON.parse(contentStr || "{}");

      return parsed.insights || [];
    } catch (error) {
      console.error("[AnalysisService] Erro ao gerar insights:", error);
      return this.generateFallbackInsights(metrics, templateType);
    }
  }

  /**
   * Gera análise SWOT com IA
   */
  private async generateSWOT(
    data: AnalysisEntity[],
    metrics: Record<string, unknown>,
    templateType: AnalysisTemplateType,
    context?: string
  ): Promise<SWOTAnalysis> {
    const prompt = this.buildSWOTPrompt(data, metrics, templateType, context);

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "Você é um consultor estratégico especializado em análise SWOT. Responda APENAS com JSON válido.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "swot_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                strengths: { type: "array", items: { type: "string" } },
                weaknesses: { type: "array", items: { type: "string" } },
                opportunities: { type: "array", items: { type: "string" } },
                threats: { type: "array", items: { type: "string" } },
              },
              required: ["strengths", "weaknesses", "opportunities", "threats"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0].message.content;
      const contentStr =
        typeof content === "string" ? content : JSON.stringify(content);
      return JSON.parse(contentStr || "{}");
    } catch (error) {
      console.error("[AnalysisService] Erro ao gerar SWOT:", error);
      return this.generateFallbackSWOT(metrics, templateType);
    }
  }

  /**
   * Gera recomendações estratégicas com IA
   */
  private async generateRecommendations(
    data: AnalysisEntity[],
    metrics: Record<string, unknown>,
    insights: Insight[],
    templateType: AnalysisTemplateType,
    context?: string
  ): Promise<StrategicRecommendations> {
    const prompt = this.buildRecommendationsPrompt(
      data,
      metrics,
      insights,
      templateType,
      context
    );

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "Você é um consultor de negócios especializado em estratégia e execução. Responda APENAS com JSON válido.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "recommendations",
            strict: true,
            schema: {
              type: "object",
              properties: {
                immediate: { type: "array", items: { type: "string" } },
                shortTerm: { type: "array", items: { type: "string" } },
                longTerm: { type: "array", items: { type: "string" } },
              },
              required: ["immediate", "shortTerm", "longTerm"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0].message.content;
      const contentStr =
        typeof content === "string" ? content : JSON.stringify(content);
      return JSON.parse(contentStr || "{}");
    } catch (error) {
      console.error("[AnalysisService] Erro ao gerar recomendações:", error);
      return this.generateFallbackRecommendations(metrics, templateType);
    }
  }

  /**
   * Gera sumário executivo com IA
   */
  private async generateSummary(
    data: AnalysisEntity[],
    metrics: Record<string, unknown>,
    insights: Insight[],
    templateType: AnalysisTemplateType
  ): Promise<string> {
    const prompt = `
Com base nos seguintes dados, gere um sumário executivo profissional de 2-3 parágrafos:

TIPO DE ANÁLISE: ${this.getTemplateLabel(templateType)}

MÉTRICAS:
${JSON.stringify(metrics, null, 2)}

PRINCIPAIS INSIGHTS:
${insights
  .slice(0, 3)
  .map(i => `- ${i.title}: ${i.description}`)
  .join("\n")}

Escreva um sumário executivo conciso, objetivo e profissional que destaque os pontos mais importantes para tomada de decisão.
`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "Você é um analista executivo especializado em comunicação estratégica.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = response.choices[0].message.content;
      return typeof content === "string" ? content : JSON.stringify(content);
    } catch (error) {
      console.error("[AnalysisService] Erro ao gerar sumário:", error);
      return this.generateFallbackSummary(metrics, templateType);
    }
  }

  // ============================================
  // MÉTODOS DE CONSTRUÇÃO DE PROMPTS
  // ============================================

  private buildInsightsPrompt(
    data: AnalysisEntity[],
    metrics: Record<string, unknown>,
    templateType: AnalysisTemplateType,
    context?: string
  ): string {
    return `
Analise os dados fornecidos e gere 5-7 insights estratégicos.

TIPO DE ANÁLISE: ${this.getTemplateLabel(templateType)}

CONTEXTO ADICIONAL:
${context || "Não fornecido"}

MÉTRICAS:
${JSON.stringify(metrics, null, 2)}

AMOSTRA DE DADOS (primeiros 5 registros):
${JSON.stringify(data.slice(0, 5), null, 2)}

Gere insights que sejam:
1. Acionáveis - devem sugerir ações concretas
2. Baseados em dados - referencie as métricas
3. Relevantes - focados no tipo de análise
4. Priorizados - classifique o impacto (high/medium/low)
5. Categorizados - opportunity, risk, trend ou recommendation

Retorne APENAS o JSON com o array de insights.
`;
  }

  private buildSWOTPrompt(
    data: AnalysisEntity[],
    metrics: Record<string, unknown>,
    templateType: AnalysisTemplateType,
    context?: string
  ): string {
    return `
Realize uma análise SWOT profissional baseada nos dados fornecidos.

TIPO DE ANÁLISE: ${this.getTemplateLabel(templateType)}

CONTEXTO:
${context || "Não fornecido"}

MÉTRICAS:
${JSON.stringify(metrics, null, 2)}

Gere 3-5 itens para cada quadrante:
- Strengths (Forças): Vantagens internas identificadas nos dados
- Weaknesses (Fraquezas): Limitações internas evidentes
- Opportunities (Oportunidades): Fatores externos favoráveis
- Threats (Ameaças): Riscos externos identificados

Seja específico e baseie-se nas métricas fornecidas.
`;
  }

  private buildRecommendationsPrompt(
    data: AnalysisEntity[],
    metrics: Record<string, unknown>,
    insights: Insight[],
    templateType: AnalysisTemplateType,
    context?: string
  ): string {
    return `
Com base na análise realizada, gere recomendações estratégicas acionáveis.

TIPO DE ANÁLISE: ${this.getTemplateLabel(templateType)}

CONTEXTO:
${context || "Não fornecido"}

MÉTRICAS:
${JSON.stringify(metrics, null, 2)}

INSIGHTS IDENTIFICADOS:
${insights.map(i => `- ${i.title} (${i.impact})`).join("\n")}

Gere recomendações em 3 horizontes temporais:

1. IMMEDIATE (0-30 dias): 3-4 ações que podem ser implementadas imediatamente
2. SHORT_TERM (1-3 meses): 3-4 iniciativas de curto prazo
3. LONG_TERM (3-12 meses): 2-3 estratégias de longo prazo

Seja específico, prático e priorize ações com maior ROI.
`;
  }

  // ============================================
  // MÉTODOS AUXILIARES
  // ============================================

  private average(data: AnalysisEntity[], field: string): number {
    const values = data
      // @ts-ignore - TODO: Fix TypeScript error
      .map(d => d[field])
      .filter(v => v !== null && v !== undefined);
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private topN(
    data: AnalysisEntity[],
    field: string,
    n: number
  ): Array<{ value: string; count: number }> {
    const counts: Record<string, number> = {};
    data.forEach(d => {
      // @ts-ignore - TODO: Fix TypeScript error
      const value = d[field];
      if (value) {
        counts[value] = (counts[value] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([value, count]) => ({ value, count }));
  }

  private distribution(data: AnalysisEntity[], field: string): Record<string, number> {
    const dist: Record<string, number> = {};
    data.forEach(d => {
      // @ts-ignore - TODO: Fix TypeScript error
      const value = d[field] || "N/A";
      dist[value] = (dist[value] || 0) + 1;
    });
    return dist;
  }

  private getTemplateLabel(type: AnalysisTemplateType): string {
    const labels: Record<AnalysisTemplateType, string> = {
      market: "Análise de Mercado",
      client: "Análise de Clientes",
      competitive: "Análise Competitiva",
      lead: "Análise de Leads",
    };
    return labels[type];
  }

  // ============================================
  // FALLBACKS (caso IA falhe)
  // ============================================

  private generateFallbackInsights(
    metrics: Record<string, unknown>,
    templateType: AnalysisTemplateType
  ): Insight[] {
    return [
      {
        title: "Volume de Dados",
        description: `Foram analisados ${metrics.totalRecords} registros nesta exportação.`,
        impact: "medium",
        category: "trend",
      },
      {
        title: "Qualidade Média",
        // @ts-ignore - TODO: Fix TypeScript error
        description: `A qualidade média dos dados é de ${(metrics.avgQualityScore || 0).toFixed(1)} pontos.`,
        impact: "medium",
        category: "trend",
      },
    ];
  }

  private generateFallbackSWOT(
    metrics: Record<string, unknown>,
    templateType: AnalysisTemplateType
  ): SWOTAnalysis {
    return {
      strengths: [
        "Volume significativo de dados",
        "Dados estruturados e organizados",
      ],
      weaknesses: ["Análise automática indisponível"],
      opportunities: ["Potencial de expansão baseado nos dados"],
      threats: ["Necessidade de validação manual dos insights"],
    };
  }

  private generateFallbackRecommendations(
    metrics: Record<string, unknown>,
    templateType: AnalysisTemplateType
  ): StrategicRecommendations {
    return {
      immediate: [
        "Revisar dados exportados",
        "Validar qualidade dos registros",
      ],
      shortTerm: ["Implementar filtros adicionais", "Expandir coleta de dados"],
      longTerm: [
        "Desenvolver estratégia baseada em dados",
        "Automatizar processos",
      ],
    };
  }

  private generateFallbackSummary(
    metrics: Record<string, unknown>,
    templateType: AnalysisTemplateType
  ): string {
    // @ts-ignore - TODO: Fix TypeScript error
    return `Esta análise processou ${metrics.totalRecords} registros com qualidade média de ${(metrics.avgQualityScore || 0).toFixed(1)} pontos. Os dados foram extraídos e formatados conforme solicitado. Recomenda-se revisão manual para insights mais profundos.`;
  }
}

// Exporta instância singleton
export const analysisService = new AnalysisService();
