import { drizzle } from "drizzle-orm/mysql2";
import { hibernationWarnings, projects } from "./drizzle/schema.ts";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

async function insertTestWarnings() {
  try {
    // Buscar alguns projetos ativos
    const activeProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.status, "active"))
      .limit(3);

    if (activeProjects.length === 0) {
      console.log("Nenhum projeto ativo encontrado");
      return;
    }

    console.log(`Encontrados ${activeProjects.length} projetos ativos`);

    // Inserir avisos de hibernação para os primeiros 2 projetos
    for (let i = 0; i < Math.min(2, activeProjects.length); i++) {
      const project = activeProjects[i];

      // Atualizar lastActivityAt para 25 dias atrás (para simular inatividade)
      const twentyFiveDaysAgo = new Date(Date.now() - 25 * 24 * 60 * 60 * 1000);
      await db
        .update(projects)
        .set({ lastActivityAt: twentyFiveDaysAgo })
        .where(eq(projects.id, project.id));

      // Inserir aviso de hibernação
      const scheduledFor = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 dias no futuro
      await db.insert(hibernationWarnings).values({
        projectId: project.id,
        scheduledFor: scheduledFor,
        notified: 1,
        hibernated: 0,
        createdAt: new Date(),
      });

      console.log(
        `✅ Aviso criado para projeto: ${project.nome} (ID: ${project.id})`
      );
      console.log(`   - lastActivityAt: ${twentyFiveDaysAgo.toISOString()}`);
      console.log(`   - scheduledFor: ${scheduledFor.toISOString()}`);
    }

    console.log("\n✅ Avisos de teste criados com sucesso!");
  } catch (error) {
    console.error("❌ Erro:", error);
  }
}

insertTestWarnings();
