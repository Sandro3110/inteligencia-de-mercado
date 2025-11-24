import { logger } from '@/lib/logger';

import { invokeLLM } from './_core/llm';
import { filtrarEmpresasUnicas, getEmpresasExistentes } from './empresasUnicas';

interface Concorrente {
  nome: string;
  cnpj: string;
  site: string;
  produto: string;
  porte: string;
  faturamentoEstimado: string;
  qualidadeScore: number;
  qualidadeClassificacao: string;
}

interface Lead {
  nome: string;
  cnpj: string;
  site: string;
  email: string;
  telefone: string;
  tipo: string;
  porte: string;
  regiao: string;
  setor: string;
  qualidadeScore: number;
  qualidadeClassificacao: string;
}

/**
 * Gera concorrentes com Gemini garantindo unicidade
 * Gera extras e filtra duplicatas, chamando novamente se necessário
 */
export async function generateConcorrentesUnicos(
  mercadoNome: string,
  quantidade: number,
  projectId?: number
): Promise<Concorrente[]> {
  const concorrentesUnicos: Concorrente[] = [];
  let tentativas = 0;
  const maxTentativas = 5;

  // Obter lista de empresas existentes para passar ao Gemini
  const empresasExistentes = await getEmpresasExistentes(projectId);

  logger.debug(`[Unicidade] Gerando ${quantidade} concorrentes únicos para: ${mercadoNome}`);
  logger.debug(`[Unicidade] ${empresasExistentes.length} empresas já existem no banco`);

  while (concorrentesUnicos.length < quantidade && tentativas < maxTentativas) {
    tentativas++;
    const faltam = quantidade - concorrentesUnicos.length;
    const quantidadeGerar = Math.ceil(faltam * 1.5); // Gera 50% a mais para compensar duplicatas

    logger.debug(
      `[Unicidade] Tentativa ${tentativas}: Gerando ${quantidadeGerar} concorrentes (faltam ${faltam})`
    );

    const prompt = `Você é um especialista em pesquisa de mercado B2B no Brasil.

TAREFA: Liste ${quantidadeGerar} empresas CONCORRENTES REAIS que atuam no mercado "${mercadoNome}".

REGRAS IMPORTANTES:
1. APENAS empresas REAIS que existem no Brasil
2. CNPJ válido no formato XX.XXX.XXX/XXXX-XX
3. Site corporativo real (https://...)
4. NÃO incluir estas empresas que já existem no banco:
${empresasExistentes.slice(0, 50).join(', ')}
5. NÃO repetir nomes entre os resultados
6. Priorizar empresas de médio e grande porte

Para cada concorrente, retorne um objeto JSON com:
- nome: Razão social completa
- cnpj: CNPJ válido (XX.XXX.XXX/XXXX-XX)
- site: URL do site corporativo
- produto: Descrição detalhada dos produtos/serviços (2-3 linhas)
- porte: "Pequena" | "Média" | "Grande"
- faturamentoEstimado: Faixa de faturamento anual estimado

Retorne APENAS um array JSON válido, sem texto adicional.`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content:
              'Você é um assistente que retorna APENAS JSON válido, sem markdown ou texto adicional.',
          },
          { role: 'user', content: prompt },
        ],
      });

      const content =
        typeof response.choices[0]?.message?.content === 'string'
          ? response.choices[0].message.content
          : '[]';
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      const concorrentesGerados: Concorrente[] = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

      logger.debug(`[Unicidade] Gemini gerou ${concorrentesGerados.length} concorrentes`);

      // Calcular score de qualidade
      const concorrentesComScore = concorrentesGerados.map((c) => ({
        ...c,
        qualidadeScore: calcularScoreConcorrente(c),
        qualidadeClassificacao: classificarScore(calcularScoreConcorrente(c)),
      }));

      // Filtrar duplicatas
      const concorrentesFiltrados = await filtrarEmpresasUnicas(concorrentesComScore, projectId);

      logger.debug(`[Unicidade] Após filtrar duplicatas: ${concorrentesFiltrados.length} únicos`);

      concorrentesUnicos.push(...concorrentesFiltrados);

      // Atualizar lista de empresas existentes para próxima iteração
      empresasExistentes.push(...concorrentesFiltrados.map((c) => c.nome));
    } catch (error) {
      console.error(`[Unicidade] Erro na tentativa ${tentativas}:`, error);
    }
  }

  // Retornar apenas a quantidade solicitada
  const resultado = concorrentesUnicos.slice(0, quantidade);
  logger.debug(`[Unicidade] Retornando ${resultado.length} concorrentes únicos`);

  return resultado;
}

/**
 * Gera leads com Gemini garantindo unicidade
 * Gera extras e filtra duplicatas, chamando novamente se necessário
 */
export async function generateLeadsUnicos(
  mercadoNome: string,
  tipo: 'fornecedor' | 'distribuidor' | 'parceiro',
  quantidade: number,
  projectId?: number,
  concorrentesExistentes?: string[]
): Promise<Lead[]> {
  const leadsUnicos: Lead[] = [];
  let tentativas = 0;
  const maxTentativas = 5;

  // Obter lista de empresas existentes para passar ao Gemini
  const empresasExistentes = await getEmpresasExistentes(projectId);

  logger.debug(`[Unicidade] Gerando ${quantidade} leads únicos (${tipo}) para: ${mercadoNome}`);
  logger.debug(`[Unicidade] ${empresasExistentes.length} empresas já existem no banco`);

  while (leadsUnicos.length < quantidade && tentativas < maxTentativas) {
    tentativas++;
    const faltam = quantidade - leadsUnicos.length;
    const quantidadeGerar = Math.ceil(faltam * 1.5); // Gera 50% a mais

    logger.debug(
      `[Unicidade] Tentativa ${tentativas}: Gerando ${quantidadeGerar} leads (faltam ${faltam})`
    );

    const prompt = `Você é um especialista em pesquisa de mercado B2B no Brasil.

TAREFA: Liste ${quantidadeGerar} empresas REAIS que atuam como ${tipo.toUpperCase()} para o mercado "${mercadoNome}".

REGRAS IMPORTANTES:
1. APENAS empresas REAIS que existem no Brasil
2. CNPJ válido no formato XX.XXX.XXX/XXXX-XX
3. Site corporativo real (https://...)
4. Email e telefone corporativos reais
5. NÃO incluir estas empresas que já existem no banco:
${empresasExistentes.slice(0, 50).join(', ')}
6. NÃO repetir nomes entre os resultados
7. Priorizar empresas de médio e grande porte

Para cada lead, retorne um objeto JSON com:
- nome: Razão social completa
- cnpj: CNPJ válido (XX.XXX.XXX/XXXX-XX)
- site: URL do site corporativo
- email: Email corporativo
- telefone: Telefone com DDD
- tipo: "${tipo}"
- porte: "Pequena" | "Média" | "Grande"
- regiao: "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul" | "Nacional"
- setor: Setor de atuação principal

Retorne APENAS um array JSON válido, sem texto adicional.`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content:
              'Você é um assistente que retorna APENAS JSON válido, sem markdown ou texto adicional.',
          },
          { role: 'user', content: prompt },
        ],
      });

      const content =
        typeof response.choices[0]?.message?.content === 'string'
          ? response.choices[0].message.content
          : '[]';
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      const leadsGerados: Lead[] = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

      logger.debug(`[Unicidade] Gemini gerou ${leadsGerados.length} leads`);

      // Calcular score de qualidade
      const leadsComScore = leadsGerados.map((l) => ({
        ...l,
        qualidadeScore: calcularScoreLead(l),
        qualidadeClassificacao: classificarScore(calcularScoreLead(l)),
      }));

      // Filtrar duplicatas (incluindo concorrentes)
      const leadsFiltrados = await filtrarEmpresasUnicas(
        leadsComScore,
        projectId,
        concorrentesExistentes
      );

      logger.debug(`[Unicidade] Após filtrar duplicatas: ${leadsFiltrados.length} únicos`);

      leadsUnicos.push(...leadsFiltrados);

      // Atualizar lista de empresas existentes para próxima iteração
      empresasExistentes.push(...leadsFiltrados.map((l) => l.nome));
    } catch (error) {
      console.error(`[Unicidade] Erro na tentativa ${tentativas}:`, error);
    }
  }

  // Retornar apenas a quantidade solicitada
  const resultado = leadsUnicos.slice(0, quantidade);
  logger.debug(`[Unicidade] Retornando ${resultado.length} leads únicos`);

  return resultado;
}

// Funções auxiliares de cálculo de score
function calcularScoreConcorrente(c: Partial<Concorrente>): number {
  let score = 0;
  if (c.nome) score += 20;
  if (c.cnpj && c.cnpj.match(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)) score += 20;
  if (c.site && c.site.startsWith('http')) score += 20;
  if (c.produto && c.produto.length > 50) score += 20;
  if (c.porte) score += 10;
  if (c.faturamentoEstimado) score += 10;
  return score;
}

function calcularScoreLead(l: Partial<Lead>): number {
  let score = 0;
  if (l.nome) score += 15;
  if (l.cnpj && l.cnpj.match(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)) score += 15;
  if (l.site && l.site.startsWith('http')) score += 15;
  if (l.email && l.email.includes('@')) score += 15;
  if (l.telefone && l.telefone.match(/\(\d{2}\)/)) score += 10;
  if (l.tipo) score += 10;
  if (l.porte) score += 10;
  if (l.regiao) score += 5;
  if (l.setor) score += 5;
  return score;
}

function classificarScore(score: number): string {
  if (score >= 90) return 'Alta';
  if (score >= 60) return 'Média';
  return 'Baixa';
}
