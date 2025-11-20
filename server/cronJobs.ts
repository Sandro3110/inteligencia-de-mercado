import cron from "node-cron";
import { runFullAggregation } from "./analyticsAggregation";
import { getDb } from "./db";
import { projects } from "../drizzle/schema";

/**
 * Cron Jobs - Tarefas agendadas
 * 
 * Jobs configurados:
 * - Agregação diária de métricas de analytics (00:00)
 */

/**
 * Job de agregação diária de métricas
 * Executa todos os dias à meia-noite
 */
export function startAnalyticsAggregationJob() {
  // Executar todos os dias às 00:00 (meia-noite)
  cron.schedule("0 0 * * *", async () => {
    console.log("[Cron] Iniciando agregação diária de analytics...");
    
    try {
      const db = await getDb();
      if (!db) {
        console.error("[Cron] Banco de dados não disponível");
        return;
      }

      // Buscar todos os projetos ativos
      const activeProjects = await db
        .select()
        .from(projects)
        .where(eq(projects.ativo, 1));

      console.log(`[Cron] Encontrados ${activeProjects.length} projetos ativos`);

      // Executar agregação para cada projeto
      for (const project of activeProjects) {
        console.log(`[Cron] Agregando métricas do projeto: ${project.nome} (ID: ${project.id})`);
        
        try {
          await runFullAggregation(project.id);
          console.log(`[Cron] ✓ Projeto ${project.nome} agregado com sucesso`);
        } catch (error) {
          console.error(`[Cron] ✗ Erro ao agregar projeto ${project.nome}:`, error);
        }
      }

      console.log("[Cron] Agregação diária concluída");
    } catch (error) {
      console.error("[Cron] Erro na agregação diária:", error);
    }
  });

  console.log("[Cron] Job de agregação diária iniciado (executa às 00:00)");
}

/**
 * Execução manual de agregação (para testes)
 */
export async function runManualAggregation(projectId: number, pesquisaId?: number) {
  console.log(`[Manual] Iniciando agregação manual para projeto ${projectId}${pesquisaId ? `, pesquisa ${pesquisaId}` : ''}`);
  
  try {
    await runFullAggregation(projectId, pesquisaId);
    console.log("[Manual] Agregação manual concluída com sucesso");
    return { success: true, message: "Agregação concluída" };
  } catch (error) {
    console.error("[Manual] Erro na agregação manual:", error);
    return { success: false, message: error instanceof Error ? error.message : "Erro desconhecido" };
  }
}

/**
 * Inicializar todos os cron jobs
 */
export function initializeCronJobs() {
  console.log("[Cron] Inicializando cron jobs...");
  
  startAnalyticsAggregationJob();
  
  console.log("[Cron] Todos os cron jobs foram inicializados");
}
