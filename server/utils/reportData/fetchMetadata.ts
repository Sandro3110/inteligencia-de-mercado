import { Database } from '@/server/db';
import { pesquisas, projects } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export interface ReportMetadata {
  projectId: number;
  projectNome: string;
  pesquisaId: number;
  pesquisaNome: string;
  totalClientes: number;
  clientesEnriquecidos: number;
  enrichmentProgress: number;
}

/**
 * Busca metadados do projeto e pesquisa
 */
export async function fetchMetadata(db: Database, pesquisaId: number): Promise<ReportMetadata> {
  // Buscar pesquisa
  const [pesquisa] = await db.select().from(pesquisas).where(eq(pesquisas.id, pesquisaId)).limit(1);

  if (!pesquisa) {
    throw new Error('Pesquisa não encontrada');
  }

  // Buscar projeto
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, pesquisa.projectId))
    .limit(1);

  if (!project) {
    throw new Error('Projeto não encontrado');
  }

  const progress = Math.round((pesquisa.clientesEnriquecidos / pesquisa.totalClientes) * 100);

  return {
    projectId: project.id,
    projectNome: project.nome,
    pesquisaId: pesquisa.id,
    pesquisaNome: pesquisa.nome,
    totalClientes: pesquisa.totalClientes,
    clientesEnriquecidos: pesquisa.clientesEnriquecidos,
    enrichmentProgress: progress,
  };
}
