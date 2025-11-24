import { eq, or, and } from "drizzle-orm";
import { getDb } from "./db";
import { clientes, concorrentes, leads } from "../drizzle/schema";

/**
 * Normaliza nome de empresa para comparação
 * Remove acentos, converte para lowercase, remove espaços extras
 */
export function normalizarNomeEmpresa(nome: string): string {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/\s+/g, " ") // Remove espaços extras
    .trim();
}

/**
 * Verifica se uma empresa já existe no banco de dados
 * Retorna informação de onde ela foi encontrada
 */
export async function isEmpresaUnica(
  nome: string,
  cnpj?: string,
  projectId?: number
): Promise<{
  isUnica: boolean;
  encontradaEm?: "cliente" | "concorrente" | "lead";
  registro?: unknown;
}> {
  const db = await getDb();
  if (!db) {
    return { isUnica: true };
  }

  const nomeNormalizado = normalizarNomeEmpresa(nome);

  // Buscar em clientes
  const clientesEncontrados = await db
    .select()
    .from(clientes)
    .where(
      and(
        or(
          eq(clientes.clienteHash, nomeNormalizado),
          cnpj ? eq(clientes.cnpj, cnpj) : undefined
        ),
        projectId ? eq(clientes.projectId, projectId) : undefined
      )
    )
    .limit(1);

  if (clientesEncontrados.length > 0) {
    return {
      isUnica: false,
      encontradaEm: "cliente",
      registro: clientesEncontrados[0],
    };
  }

  // Buscar em concorrentes
  const concorrentesEncontrados = await db
    .select()
    .from(concorrentes)
    .where(
      and(
        or(
          eq(concorrentes.concorrenteHash, nomeNormalizado),
          cnpj ? eq(concorrentes.cnpj, cnpj) : undefined
        ),
        projectId ? eq(concorrentes.projectId, projectId) : undefined
      )
    )
    .limit(1);

  if (concorrentesEncontrados.length > 0) {
    return {
      isUnica: false,
      encontradaEm: "concorrente",
      registro: concorrentesEncontrados[0],
    };
  }

  // Buscar em leads
  const leadsEncontrados = await db
    .select()
    .from(leads)
    .where(
      and(
        or(
          eq(leads.leadHash, nomeNormalizado),
          cnpj ? eq(leads.cnpj, cnpj) : undefined
        ),
        projectId ? eq(leads.projectId, projectId) : undefined
      )
    )
    .limit(1);

  if (leadsEncontrados.length > 0) {
    return {
      isUnica: false,
      encontradaEm: "lead",
      registro: leadsEncontrados[0],
    };
  }

  return { isUnica: true };
}

/**
 * Filtra lista de empresas removendo duplicatas
 * Verifica tanto contra o banco quanto dentro da própria lista
 */
export async function filtrarEmpresasUnicas<
  T extends { nome: string; cnpj?: string },
>(empresas: T[], projectId?: number, empresasExcluir?: string[]): Promise<T[]> {
  const empresasUnicas: T[] = [];
  const nomesVistos = new Set<string>();

  for (const empresa of empresas) {
    const nomeNormalizado = normalizarNomeEmpresa(empresa.nome);

    // Verificar se está na lista de exclusão
    if (
      empresasExcluir &&
      empresasExcluir.some(e => normalizarNomeEmpresa(e) === nomeNormalizado)
    ) {
      console.log(
        `[Deduplicação] Empresa na lista de exclusão: ${empresa.nome}`
      );
      continue;
    }

    // Verificar se já vimos este nome na lista atual
    if (nomesVistos.has(nomeNormalizado)) {
      console.log(`[Deduplicação] Empresa duplicada na lista: ${empresa.nome}`);
      continue;
    }

    // Verificar se existe no banco
    const { isUnica } = await isEmpresaUnica(
      empresa.nome,
      empresa.cnpj,
      projectId
    );

    if (isUnica) {
      empresasUnicas.push(empresa);
      nomesVistos.add(nomeNormalizado);
    } else {
      console.log(`[Deduplicação] Empresa já existe no banco: ${empresa.nome}`);
    }
  }

  return empresasUnicas;
}

/**
 * Obtém lista de nomes de empresas já existentes no banco
 * Útil para passar ao Gemini para evitar gerar duplicatas
 */
export async function getEmpresasExistentes(
  projectId?: number
): Promise<string[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const empresas: string[] = [];

  // Buscar clientes
  const clientesResult = await db
    .select({ nome: clientes.nome })
    .from(clientes)
    .where(projectId ? eq(clientes.projectId, projectId) : undefined);

  empresas.push(...clientesResult.map(c => c.nome).filter(Boolean));

  // Buscar concorrentes
  const concorrentesResult = await db
    .select({ nome: concorrentes.nome })
    .from(concorrentes)
    .where(projectId ? eq(concorrentes.projectId, projectId) : undefined);

  empresas.push(...concorrentesResult.map(c => c.nome).filter(Boolean));

  // Buscar leads
  const leadsResult = await db
    .select({ nome: leads.nome })
    .from(leads)
    .where(projectId ? eq(leads.projectId, projectId) : undefined);

  empresas.push(...leadsResult.map(l => l.nome).filter(Boolean));

  return Array.from(new Set(empresas)); // Remove duplicatas
}
