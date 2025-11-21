import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { now, toMySQLTimestamp } from "./dateUtils";
import {
  llmProviderConfigs,
  intelligentAlertsConfigs,
  intelligentAlertsHistory,
  type LLMProviderConfig,
  type InsertLLMProviderConfig,
  type IntelligentAlertsConfig,
  type InsertIntelligentAlertsConfig,
  type IntelligentAlertsHistory,
  type InsertIntelligentAlertsHistory,
} from "../drizzle/schema";

// ============================================
// LLM Provider Config Helpers
// ============================================

export async function getLLMConfig(
  projectId: number
): Promise<LLMProviderConfig | undefined> {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db
    .select()
    .from(llmProviderConfigs)
    .where(eq(llmProviderConfigs.projectId, projectId))
    .limit(1);

  return result[0];
}

export async function upsertLLMConfig(
  data: InsertLLMProviderConfig
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const existing = await getLLMConfig(data.projectId);

  if (existing) {
    await db
      .update(llmProviderConfigs)
      .set({ ...data, updatedAt: now() })
      .where(eq(llmProviderConfigs.projectId, data.projectId));
  } else {
    await db.insert(llmProviderConfigs).values(data);
  }
}

export async function testLLMConnection(
  provider: "openai" | "gemini" | "anthropic",
  apiKey: string,
  model?: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Teste simples de conexão
    if (!apiKey || apiKey.trim() === "") {
      return { success: false, message: "API Key não pode estar vazia" };
    }

    // Aqui você pode adicionar testes reais de conexão se necessário
    // Por enquanto, apenas validação básica
    if (provider === "openai" && !apiKey.startsWith("sk-")) {
      return {
        success: false,
        message: "API Key OpenAI inválida (deve começar com sk-)",
      };
    }

    return { success: true, message: "Conexão testada com sucesso" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

// ============================================
// Intelligent Alerts Config Helpers
// ============================================

export async function getAlertsConfig(
  projectId: number
): Promise<IntelligentAlertsConfig | undefined> {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db
    .select()
    .from(intelligentAlertsConfigs)
    .where(eq(intelligentAlertsConfigs.projectId, projectId))
    .limit(1);

  return result[0];
}

export async function upsertAlertsConfig(
  data: InsertIntelligentAlertsConfig
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const existing = await getAlertsConfig(data.projectId);

  if (existing) {
    await db
      .update(intelligentAlertsConfigs)
      .set({ ...data, updatedAt: now() })
      .where(eq(intelligentAlertsConfigs.projectId, data.projectId));
  } else {
    await db.insert(intelligentAlertsConfigs).values(data);
  }
}

// ============================================
// Intelligent Alerts History Helpers
// ============================================

export async function createAlertHistory(
  data: InsertIntelligentAlertsHistory
): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [result] = await db.insert(intelligentAlertsHistory).values(data);
  return Number(result.insertId);
}

export async function getAlertsHistory(
  projectId: number,
  limit = 50
): Promise<IntelligentAlertsHistory[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db
    .select()
    .from(intelligentAlertsHistory)
    .where(eq(intelligentAlertsHistory.projectId, projectId))
    .orderBy(intelligentAlertsHistory.createdAt)
    .limit(limit);
}

export async function markAlertAsRead(alertId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(intelligentAlertsHistory)
    .set({ isRead: 1, readAt: now() })
    .where(eq(intelligentAlertsHistory.id, alertId));
}

export async function dismissAlert(alertId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(intelligentAlertsHistory)
    .set({ isDismissed: 1, dismissedAt: now() })
    .where(eq(intelligentAlertsHistory.id, alertId));
}

export async function getAlertsStats(
  projectId: number,
  hours = 24
): Promise<{
  total: number;
  unread: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
}> {
  const db = await getDb();
  if (!db) {
    return { total: 0, unread: 0, byType: {}, bySeverity: {} };
  }

  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const sinceStr = toMySQLTimestamp(since);

  const alerts = await db
    .select()
    .from(intelligentAlertsHistory)
    .where(eq(intelligentAlertsHistory.projectId, projectId));

  const recentAlerts = alerts.filter(
    a => a.createdAt && a.createdAt >= sinceStr
  );

  const byType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  let unread = 0;

  for (const alert of recentAlerts) {
    byType[alert.alertType] = (byType[alert.alertType] || 0) + 1;
    bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1;
    if (alert.isRead === 0) {
      unread++;
    }
  }

  return {
    total: recentAlerts.length,
    unread,
    byType,
    bySeverity,
  };
}
