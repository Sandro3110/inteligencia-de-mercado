/**
 * JSON Renderer - Exporta dados em formato JSON
 * Item 14 do módulo de exportação inteligente
 */

export interface JSONRenderOptions {
  prettyPrint?: boolean;
  nested?: boolean; // Estrutura hierárquica vs flat
  includeMetadata?: boolean;
}

export class JSONRenderer {
  async render(
    data: unknown[],
    metadata: {
      context?: string;
      filters?: unknown;
      recordCount: number;
      generatedAt: Date;
      projectId?: number;
    },
    options: JSONRenderOptions = {}
  ): Promise<Buffer> {
    const {
      prettyPrint = true,
      nested = false,
      includeMetadata = true,
    } = options;

    let output: unknown;

    if (includeMetadata) {
      output = {
        metadata: {
          context: metadata.context,
          filters: metadata.filters,
          recordCount: metadata.recordCount,
          generatedAt: metadata.generatedAt.toISOString(),
          projectId: metadata.projectId,
        },
        data: nested ? this.nestData(data) : data,
      };
    } else {
      output = nested ? this.nestData(data) : data;
    }

    const jsonString = prettyPrint
      ? JSON.stringify(output, null, 2)
      : JSON.stringify(output);

    return Buffer.from(jsonString, "utf-8");
  }

  /**
   * Converte dados flat em estrutura hierárquica
   * Exemplo: Cliente → [Produtos] → [Mercados]
   */
  private nestData(data: unknown[]): unknown[] {
    // Agrupar por entidade principal (cliente/mercado/etc)
    const grouped = new Map<string, any>();

    for (const record of data) {
      // @ts-ignore - TODO: Fix TypeScript error
      const key = record.clienteId || record.mercadoId || record.id;

      if (!grouped.has(key)) {
        grouped.set(key, {
          ...this.extractMainFields(record),
          produtos: [],
          mercados: [],
          concorrentes: [],
          leads: [],
        });
      }

      const entity = grouped.get(key)!;

      // Adicionar relacionamentos
      // @ts-ignore - TODO: Fix TypeScript error
      if (record.produtoNome) {
        entity.produtos.push({
          // @ts-ignore - TODO: Fix TypeScript error
          nome: record.produtoNome,
          // @ts-ignore - TODO: Fix TypeScript error
          descricao: record.produtoDescricao,
          // @ts-ignore - TODO: Fix TypeScript error
          categoria: record.produtoCategoria,
        });
      }

      // @ts-ignore - TODO: Fix TypeScript error
      if (record.mercadoNome) {
        entity.mercados.push({
          // @ts-ignore - TODO: Fix TypeScript error
          nome: record.mercadoNome,
          // @ts-ignore - TODO: Fix TypeScript error
          segmentacao: record.mercadoSegmentacao,
          // @ts-ignore - TODO: Fix TypeScript error
          categoria: record.mercadoCategoria,
        });
      }
    }

    return Array.from(grouped.values());
  }

  /**
   * Extrai campos principais da entidade (sem relacionamentos)
   */
  private extractMainFields(record: unknown): Record<string, unknown> {
    const main: unknown = {};

    // @ts-ignore - TODO: Fix TypeScript error
    for (const [key, value] of Object.entries(record)) {
      // Ignorar campos de relacionamento
      if (
        !key.includes("produto") &&
        !key.includes("mercado") &&
        !key.includes("concorrente") &&
        !key.includes("lead")
      ) {
        // @ts-ignore - TODO: Fix TypeScript error
        main[key] = value;
      }
    }

    // @ts-ignore - TODO: Fix TypeScript error
    return main;
  }

  /**
   * Gera schema JSON para documentação
   */
  generateSchema(data: unknown[]): Record<string, unknown> {
    if (data.length === 0) return {};

    const sample = data[0];
    const schema: unknown = {
      type: "object",
      properties: {},
    };

    // @ts-ignore - TODO: Fix TypeScript error
    for (const [key, value] of Object.entries(sample)) {
      // @ts-ignore - TODO: Fix TypeScript error
      schema.properties[key] = {
        type: this.inferType(value),
        example: value,
      };
    }

    // @ts-ignore - TODO: Fix TypeScript error
    return schema;
  }

  private inferType(value: unknown): string {
    if (value === null) return "null";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    if (Array.isArray(value)) return "array";
    if (typeof value === "object") return "object";
    return "string";
  }
}
