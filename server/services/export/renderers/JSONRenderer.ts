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
    data: any[],
    metadata: {
      context?: string;
      filters?: any;
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

    let output: any;

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
  private nestData(data: any[]): any[] {
    // Agrupar por entidade principal (cliente/mercado/etc)
    const grouped = new Map<string, any>();

    for (const record of data) {
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
      if (record.produtoNome) {
        entity.produtos.push({
          nome: record.produtoNome,
          descricao: record.produtoDescricao,
          categoria: record.produtoCategoria,
        });
      }

      if (record.mercadoNome) {
        entity.mercados.push({
          nome: record.mercadoNome,
          segmentacao: record.mercadoSegmentacao,
          categoria: record.mercadoCategoria,
        });
      }
    }

    return Array.from(grouped.values());
  }

  /**
   * Extrai campos principais da entidade (sem relacionamentos)
   */
  private extractMainFields(record: any): any {
    const main: any = {};

    for (const [key, value] of Object.entries(record)) {
      // Ignorar campos de relacionamento
      if (
        !key.includes("produto") &&
        !key.includes("mercado") &&
        !key.includes("concorrente") &&
        !key.includes("lead")
      ) {
        main[key] = value;
      }
    }

    return main;
  }

  /**
   * Gera schema JSON para documentação
   */
  generateSchema(data: any[]): any {
    if (data.length === 0) return {};

    const sample = data[0];
    const schema: any = {
      type: "object",
      properties: {},
    };

    for (const [key, value] of Object.entries(sample)) {
      schema.properties[key] = {
        type: this.inferType(value),
        example: value,
      };
    }

    return schema;
  }

  private inferType(value: any): string {
    if (value === null) return "null";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    if (Array.isArray(value)) return "array";
    if (typeof value === "object") return "object";
    return "string";
  }
}
