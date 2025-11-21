import { eq, desc, and, gte, sql } from "drizzle-orm";
import { getDb } from "./db";
import { apiHealthLog } from "../drizzle/schema";

export type APIName = 'openai' | 'serpapi' | 'receitaws';
export type APIStatus = 'success' | 'error' | 'timeout';

export interface LogAPICallParams {
  apiName: APIName;
  status: APIStatus;
  responseTime: number;
  errorMessage?: string;
  endpoint?: string;
  requestData?: string;
}

export interface APIHealthStats {
  apiName: APIName;
  totalCalls: number;
  successCount: number;
  errorCount: number;
  timeoutCount: number;
  successRate: number;
  avgResponseTime: number;
  lastCallAt?: string;
  lastError?: string;
}

export interface APIHealthHistoryItem {
  id: number;
  apiName: string;
  status: string;
  responseTime: number;
  errorMessage?: string;
  endpoint?: string;
  createdAt: string;
}

/**
 * Registra uma chamada de API no log de saúde
 */
export async function logAPICall(params: LogAPICallParams): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[APIHealth] Cannot log API call: database not available");
    return;
  }

  try {
    await db.insert(apiHealthLog).values({
      apiName: params.apiName,
      status: params.status,
      responseTime: params.responseTime,
      errorMessage: params.errorMessage || null,
      endpoint: params.endpoint || null,
      requestData: params.requestData || null,
    });
  } catch (error) {
    console.error("[APIHealth] Failed to log API call:", error);
  }
}

/**
 * Obtém estatísticas de saúde de uma API específica
 */
export async function getAPIHealthStats(apiName: APIName, days: number = 7): Promise<APIHealthStats> {
  const db = await getDb();
  if (!db) {
    console.warn("[APIHealth] Cannot get API health stats: database not available");
    return {
      apiName,
      totalCalls: 0,
      successCount: 0,
      errorCount: 0,
      timeoutCount: 0,
      successRate: 0,
      avgResponseTime: 0,
    };
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Buscar estatísticas agregadas
    const stats = await db
      .select({
        totalCalls: sql<number>`COUNT(*)`,
        successCount: sql<number>`SUM(CASE WHEN ${apiHealthLog.status} = 'success' THEN 1 ELSE 0 END)`,
        errorCount: sql<number>`SUM(CASE WHEN ${apiHealthLog.status} = 'error' THEN 1 ELSE 0 END)`,
        timeoutCount: sql<number>`SUM(CASE WHEN ${apiHealthLog.status} = 'timeout' THEN 1 ELSE 0 END)`,
        avgResponseTime: sql<number>`AVG(${apiHealthLog.responseTime})`,
      })
      .from(apiHealthLog)
      .where(
        and(
          eq(apiHealthLog.apiName, apiName),
          gte(apiHealthLog.createdAt, cutoffDate.toISOString())
        )
      );

    // Buscar última chamada
    const lastCall = await db
      .select()
      .from(apiHealthLog)
      .where(eq(apiHealthLog.apiName, apiName))
      .orderBy(desc(apiHealthLog.createdAt))
      .limit(1);

    // Buscar último erro
    const lastError = await db
      .select()
      .from(apiHealthLog)
      .where(
        and(
          eq(apiHealthLog.apiName, apiName),
          eq(apiHealthLog.status, 'error')
        )
      )
      .orderBy(desc(apiHealthLog.createdAt))
      .limit(1);

    const totalCalls = Number(stats[0]?.totalCalls || 0);
    const successCount = Number(stats[0]?.successCount || 0);
    const errorCount = Number(stats[0]?.errorCount || 0);
    const timeoutCount = Number(stats[0]?.timeoutCount || 0);
    const avgResponseTime = Math.round(Number(stats[0]?.avgResponseTime || 0));

    return {
      apiName,
      totalCalls,
      successCount,
      errorCount,
      timeoutCount,
      successRate: totalCalls > 0 ? Math.round((successCount / totalCalls) * 100) : 0,
      avgResponseTime,
      lastCallAt: lastCall[0]?.createdAt,
      lastError: lastError[0]?.errorMessage || undefined,
    };
  } catch (error) {
    console.error("[APIHealth] Failed to get API health stats:", error);
    return {
      apiName,
      totalCalls: 0,
      successCount: 0,
      errorCount: 0,
      timeoutCount: 0,
      successRate: 0,
      avgResponseTime: 0,
    };
  }
}

/**
 * Obtém histórico de chamadas de uma API
 */
export async function getAPIHealthHistory(
  apiName?: APIName,
  limit: number = 20
): Promise<APIHealthHistoryItem[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[APIHealth] Cannot get API health history: database not available");
    return [];
  }

  try {
    const query = db
      .select()
      .from(apiHealthLog)
      .orderBy(desc(apiHealthLog.createdAt))
      .limit(limit);

    if (apiName) {
      query.where(eq(apiHealthLog.apiName, apiName));
    }

    const results = await query;

    return results.map((row) => ({
      id: row.id,
      apiName: row.apiName,
      status: row.status,
      responseTime: row.responseTime,
      errorMessage: row.errorMessage || undefined,
      endpoint: row.endpoint || undefined,
      createdAt: row.createdAt,
    }));
  } catch (error) {
    console.error("[APIHealth] Failed to get API health history:", error);
    return [];
  }
}

/**
 * Testa conectividade de uma API
 */
export async function testAPIConnection(apiName: APIName): Promise<{
  success: boolean;
  responseTime: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    switch (apiName) {
      case 'openai':
        // Teste simples de ping para OpenAI
        const { invokeLLM } = await import("./_core/llm");
        await invokeLLM({
          messages: [{ role: "user", content: "ping" }],
        });
        break;

      case 'serpapi':
        // Teste de API SERPAPI
        const serpApiKey = process.env.SERPAPI_KEY;
        if (!serpApiKey) {
          throw new Error("SERPAPI_KEY não configurada");
        }
        const serpResponse = await fetch(
          `https://serpapi.com/account.json?api_key=${serpApiKey}`
        );
        if (!serpResponse.ok) {
          throw new Error(`SERPAPI retornou ${serpResponse.status}`);
        }
        break;

      case 'receitaws':
        // Teste de API ReceitaWS (CNPJ de teste)
        const receitaResponse = await fetch(
          "https://www.receitaws.com.br/v1/cnpj/00000000000191"
        );
        if (!receitaResponse.ok) {
          throw new Error(`ReceitaWS retornou ${receitaResponse.status}`);
        }
        break;

      default:
        throw new Error(`API desconhecida: ${apiName}`);
    }

    const responseTime = Date.now() - startTime;

    // Registrar sucesso
    await logAPICall({
      apiName,
      status: 'success',
      responseTime,
      endpoint: 'test',
    });

    return {
      success: true,
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Registrar erro
    await logAPICall({
      apiName,
      status: 'error',
      responseTime,
      errorMessage,
      endpoint: 'test',
    });

    return {
      success: false,
      responseTime,
      error: errorMessage,
    };
  }
}
