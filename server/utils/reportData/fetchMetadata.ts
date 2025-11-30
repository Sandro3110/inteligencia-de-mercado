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
  try {
    // Buscar pesquisa
    const pesquisaResult = await db
      .select()
      .from(pesquisas)
      .where(eq(pesquisas.id, pesquisaId))
      .limit(1);

    const pesquisa = pesquisaResult?.[0];

    if (!pesquisa) {
      throw new Error('Pesquisa não encontrada');
    }

    // Buscar projeto
    const projectResult = await db
      .select()
      .from(projects)
      .where(eq(projects.id, pesquisa.projectId))
      .limit(1);

    const project = projectResult?.[0];

    if (!project) {
      throw new Error('Projeto não encontrado');
    }

    const clientesEnriquecidos = Number(pesquisa.clientesEnriquecidos ?? 0);
    const totalClientes = Number(pesquisa.totalClientes ?? 0);
    const progress =
      totalClientes > 0 ? Math.round((clientesEnriquecidos / totalClientes) * 100) : 0;

    return {
      projectId: project.id,
      projectNome: project.nome ?? 'Sem nome',
      pesquisaId: pesquisa.id,
      pesquisaNome: pesquisa.nome ?? 'Sem nome',
      totalClientes,
      clientesEnriquecidos,
      enrichmentProgress: progress,
    };
  } catch (error) {
    console.error('[fetchMetadata] Erro fatal:', error);
    throw error;
  }
}
