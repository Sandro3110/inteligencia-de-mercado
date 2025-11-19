import { invokeLLM } from "./_core/llm";
import {
  createCliente,
  updateCliente,
  createMercado,
  updateMercado,
  associateClienteToMercado,
  createConcorrente,
  createLead,
} from "./db";
import { getMercadoByNome } from "./getMercadoByNome";
import {
  generateConcorrentesUnicos,
  generateLeadsUnicos,
} from "./geminiEnrichmentWithUniqueness";

/**
 * Resultado de cada fase do enriquecimento
 */
export interface FaseResult {
  fase: number;
  nome: string;
  sucesso: boolean;
  dados?: any;
  erro?: string;
}

/**
 * FASE 1: Enriquecer Cliente
 * CNPJ → ReceitaWS (futuro) + Gemini → Gravar cliente no banco
 */
export async function enrichClienteFase1(
  cnpj: string,
  nomeEmpresa: string,
  projectId: number
): Promise<FaseResult> {
  console.log(`[Fase 1] Enriquecendo cliente: ${nomeEmpresa} (${cnpj})`);

  try {
    const prompt = `Você é um especialista em pesquisa de empresas B2B no Brasil.

TAREFA: Enriquecer informações da empresa "${nomeEmpresa}" (CNPJ: ${cnpj}).

Retorne um objeto JSON com:
- segmentacao: APENAS "B2B", "B2C" ou "B2B2C" (sem explicações)
- email: Email corporativo
- telefone: Telefone com DDD
- linkedin: URL do LinkedIn da empresa
- instagram: URL do Instagram (se houver)
- porte: APENAS "MEI", "Pequena", "Média" ou "Grande" (sem explicações)

Retorne APENAS JSON válido, sem markdown.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você retorna APENAS JSON válido, sem texto adicional.",
        },
        { role: "user", content: prompt },
      ],
    });

    const content =
      typeof response.choices[0]?.message?.content === "string"
        ? response.choices[0].message.content
        : "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const dadosEnriquecidos = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    // Gravar cliente no banco
    const cliente = await createCliente({
      projectId,
      nome: nomeEmpresa,
      cnpj,
      segmentacaoB2bB2c: dadosEnriquecidos.segmentacao || null,
      email: dadosEnriquecidos.email || null,
      telefone: dadosEnriquecidos.telefone || null,
      linkedin: dadosEnriquecidos.linkedin || null,
      instagram: dadosEnriquecidos.instagram || null,
      porte: dadosEnriquecidos.porte || null,
      qualidadeScore: calcularScoreCliente(dadosEnriquecidos),
      qualidadeClassificacao: classificarScore(
        calcularScoreCliente(dadosEnriquecidos)
      ),
    });

    const clienteId = cliente?.id;
    if (!clienteId) {
      throw new Error('Falha ao criar cliente');
    }

    console.log(`[Fase 1] Cliente gravado com ID: ${clienteId}`);

    return {
      fase: 1,
      nome: "Enriquecimento do Cliente",
      sucesso: true,
      dados: { clienteId, ...dadosEnriquecidos },
    };
  } catch (error: any) {
    console.error(`[Fase 1] Erro:`, error);
    return {
      fase: 1,
      nome: "Enriquecimento do Cliente",
      sucesso: false,
      erro: error.message,
    };
  }
}

/**
 * FASE 2: Identificar Produtos
 * Gemini identifica produtos principais → Atualiza cliente.produtoPrincipal
 */
export async function enrichClienteFase2(
  clienteId: number,
  nomeEmpresa: string,
  projectId: number
): Promise<FaseResult> {
  console.log(`[Fase 2] Identificando produtos de: ${nomeEmpresa}`);

  try {
    const prompt = `Você é um especialista em pesquisa de mercado B2B no Brasil.

TAREFA: Identifique o PRODUTO PRINCIPAL da empresa "${nomeEmpresa}".

Retorne um objeto JSON com:
- produtoPrincipal: Descrição do produto/serviço principal (1-2 linhas)
- produtosSecundarios: Array com 2-3 produtos secundários

Retorne APENAS JSON válido, sem markdown.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você retorna APENAS JSON válido, sem texto adicional.",
        },
        { role: "user", content: prompt },
      ],
    });

    const content =
      typeof response.choices[0]?.message?.content === "string"
        ? response.choices[0].message.content
        : "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const produtos = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    // Atualizar cliente com produto principal
    await updateCliente(clienteId, {
      produtoPrincipal: produtos.produtoPrincipal || null,
    });

    console.log(`[Fase 2] Produtos identificados e gravados`);

    return {
      fase: 2,
      nome: "Identificação de Produtos",
      sucesso: true,
      dados: produtos,
    };
  } catch (error: any) {
    console.error(`[Fase 2] Erro:`, error);
    return {
      fase: 2,
      nome: "Identificação de Produtos",
      sucesso: false,
      erro: error.message,
    };
  }
}

/**
 * FASE 3: Identificar e Enriquecer Mercados
 * Gemini identifica mercados → Enriquece mercados → Grava + Associa ao cliente
 */
export async function enrichClienteFase3(
  clienteId: number,
  nomeEmpresa: string,
  produtoPrincipal: string,
  projectId: number
): Promise<FaseResult> {
  console.log(`[Fase 3] Identificando mercados de: ${nomeEmpresa}`);

  try {
    const prompt = `Você é um especialista em pesquisa de mercado B2B no Brasil.

TAREFA: Identifique os MERCADOS onde a empresa "${nomeEmpresa}" atua com o produto "${produtoPrincipal}".

Retorne um objeto JSON com:
- mercados: Array com 1-3 mercados, cada um com:
  - nome: Nome do mercado
  - segmentacao: Segmentação (B2B, B2C, B2B2C)
  - categoria: Categoria do mercado
  - tamanhoMercado: Tamanho estimado do mercado no Brasil
  - crescimentoAnual: Taxa de crescimento anual estimada
  - tendencias: Principais tendências (1-2 linhas)
  - principaisPlayers: 3-5 principais players do mercado

Retorne APENAS JSON válido, sem markdown.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você retorna APENAS JSON válido, sem texto adicional.",
        },
        { role: "user", content: prompt },
      ],
    });

    const content =
      typeof response.choices[0]?.message?.content === "string"
        ? response.choices[0].message.content
        : "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const resultado = jsonMatch ? JSON.parse(jsonMatch[0]) : { mercados: [] };

    const mercadosIds: number[] = [];

    // Gravar cada mercado e associar ao cliente
    for (const mercadoData of resultado.mercados || []) {
      // Verificar se mercado já existe
      const mercadoExistente = await getMercadoByNome(projectId, mercadoData.nome);
      
      let mercadoId: number;
      
      if (mercadoExistente) {
        // Reusar mercado existente
        mercadoId = mercadoExistente.id;
        console.log(`[Fase 3] Mercado "${mercadoData.nome}" já existe (ID: ${mercadoId}) - Reusando`);
      } else {
        // Criar novo mercado
        const mercadoCreated = await createMercado({
          projectId,
          nome: mercadoData.nome,
          segmentacao: (mercadoData.segmentacao as "B2B" | "B2C" | "B2B2C") || null,
          categoria: mercadoData.categoria || null,
          tamanhoMercado: mercadoData.tamanhoMercado || null,
          crescimentoAnual: mercadoData.crescimentoAnual || null,
          tendencias: mercadoData.tendencias || null,
          principaisPlayers: mercadoData.principaisPlayers
            ? JSON.stringify(mercadoData.principaisPlayers)
            : null,
        });

        if (!mercadoCreated?.id) {
          throw new Error(`Falha ao criar mercado: ${mercadoData.nome}`);
        }
        mercadoId = mercadoCreated.id;
        console.log(`[Fase 3] Mercado "${mercadoData.nome}" criado (ID: ${mercadoId})`);
      }

      // Associar cliente ao mercado
      await associateClienteToMercado(clienteId, mercadoId);

      mercadosIds.push(mercadoId);
    }

    return {
      fase: 3,
      nome: "Identificação e Enriquecimento de Mercados",
      sucesso: true,
      dados: { mercados: resultado.mercados, mercadosIds },
    };
  } catch (error: any) {
    console.error(`[Fase 3] Erro:`, error);
    return {
      fase: 3,
      nome: "Identificação e Enriquecimento de Mercados",
      sucesso: false,
      erro: error.message,
    };
  }
}

/**
 * FASE 4: Gerar Concorrentes Únicos
 * Gemini gera 20 concorrentes únicos → Grava no banco
 */
export async function enrichClienteFase4(
  mercadoNome: string,
  mercadoId: number,
  quantidade: number,
  projectId: number
): Promise<FaseResult> {
  console.log(
    `[Fase 4] Gerando ${quantidade} concorrentes para mercado: ${mercadoNome}`
  );

  try {
    const concorrentes = await generateConcorrentesUnicos(
      mercadoNome,
      quantidade,
      projectId
    );

    const concorrentesIds: number[] = [];

    // Gravar cada concorrente
    for (const concorrenteData of concorrentes) {
      const concorrenteCreated = await createConcorrente({
        projectId,
        mercadoId,
        nome: concorrenteData.nome,
        cnpj: concorrenteData.cnpj || null,
        site: concorrenteData.site || null,
        produto: concorrenteData.produto || null,
        porte: (concorrenteData.porte as "MEI" | "Pequena" | "Média" | "Grande") || null,
        faturamentoEstimado: concorrenteData.faturamentoEstimado || null,
        qualidadeScore: concorrenteData.qualidadeScore,
        qualidadeClassificacao: concorrenteData.qualidadeClassificacao,
      });

      const concorrenteId = concorrenteCreated?.id;
      if (concorrenteId) {
        concorrentesIds.push(concorrenteId);
      }
    }

    console.log(`[Fase 4] ${concorrentes.length} concorrentes gravados`);

    return {
      fase: 4,
      nome: "Geração de Concorrentes",
      sucesso: true,
      dados: { concorrentes, concorrentesIds },
    };
  } catch (error: any) {
    console.error(`[Fase 4] Erro:`, error);
    return {
      fase: 4,
      nome: "Geração de Concorrentes",
      sucesso: false,
      erro: error.message,
    };
  }
}

/**
 * FASE 5: Gerar Leads Únicos
 * Gemini gera 20 leads únicos (excluindo concorrentes) → Grava no banco
 */
export async function enrichClienteFase5(
  mercadoNome: string,
  mercadoId: number,
  quantidade: number,
  projectId: number,
  concorrentesNomes: string[]
): Promise<FaseResult> {
  console.log(`[Fase 5] Gerando ${quantidade} leads para mercado: ${mercadoNome}`);

  try {
    const leads = await generateLeadsUnicos(
      mercadoNome,
      "fornecedor",
      quantidade,
      projectId,
      concorrentesNomes
    );

    const leadsIds: number[] = [];

    // Gravar cada lead
    for (const leadData of leads) {
      const leadCreated = await createLead({
        projectId,
        mercadoId,
        nome: leadData.nome,
        cnpj: leadData.cnpj || null,
        site: leadData.site || null,
        email: leadData.email || null,
        telefone: leadData.telefone || null,
        tipo: (leadData.tipo as "inbound" | "outbound" | "referral") || null,
        porte: (leadData.porte as "MEI" | "Pequena" | "Média" | "Grande") || null,
        regiao: leadData.regiao || null,
        setor: leadData.setor || null,
        qualidadeScore: leadData.qualidadeScore,
        qualidadeClassificacao: leadData.qualidadeClassificacao,
      });

      const leadId = leadCreated?.id;
      if (leadId) {
        leadsIds.push(leadId);
      }
    }

    console.log(`[Fase 5] ${leads.length} leads gravados`);

    return {
      fase: 5,
      nome: "Geração de Leads",
      sucesso: true,
      dados: { leads, leadsIds },
    };
  } catch (error: any) {
    console.error(`[Fase 5] Erro:`, error);
    return {
      fase: 5,
      nome: "Geração de Leads",
      sucesso: false,
      erro: error.message,
    };
  }
}

/**
 * FLUXO COMPLETO: Executa todas as 5 fases sequencialmente
 */
export async function enrichClienteCompleto(
  cnpj: string,
  nomeEmpresa: string,
  projectId: number,
  quantidadeConcorrentes: number = 20,
  quantidadeLeads: number = 20
): Promise<{
  sucesso: boolean;
  fases: FaseResult[];
  erro?: string;
}> {
  console.log(`\n🚀 INICIANDO ENRIQUECIMENTO COMPLETO: ${nomeEmpresa}\n`);

  const fases: FaseResult[] = [];

  // FASE 1: Enriquecer Cliente
  const fase1 = await enrichClienteFase1(cnpj, nomeEmpresa, projectId);
  fases.push(fase1);
  if (!fase1.sucesso) {
    return { sucesso: false, fases, erro: "Falha na Fase 1" };
  }

  const clienteId = fase1.dados.clienteId;

  // FASE 2: Identificar Produtos
  const fase2 = await enrichClienteFase2(clienteId, nomeEmpresa, projectId);
  fases.push(fase2);
  if (!fase2.sucesso) {
    return { sucesso: false, fases, erro: "Falha na Fase 2" };
  }

  const produtoPrincipal = fase2.dados.produtoPrincipal;

  // FASE 3: Identificar Mercados
  const fase3 = await enrichClienteFase3(
    clienteId,
    nomeEmpresa,
    produtoPrincipal,
    projectId
  );
  fases.push(fase3);
  if (!fase3.sucesso || !fase3.dados.mercados.length) {
    return { sucesso: false, fases, erro: "Falha na Fase 3 ou nenhum mercado identificado" };
  }

  const mercadoPrincipal = fase3.dados.mercados[0];
  const mercadoId = fase3.dados.mercadosIds[0];

  // FASE 4: Gerar Concorrentes
  const fase4 = await enrichClienteFase4(
    mercadoPrincipal.nome,
    mercadoId,
    quantidadeConcorrentes,
    projectId
  );
  fases.push(fase4);
  if (!fase4.sucesso) {
    return { sucesso: false, fases, erro: "Falha na Fase 4" };
  }

  const concorrentesNomes = fase4.dados.concorrentes.map((c: any) => c.nome);

  // FASE 5: Gerar Leads
  const fase5 = await enrichClienteFase5(
    mercadoPrincipal.nome,
    mercadoId,
    quantidadeLeads,
    projectId,
    concorrentesNomes
  );
  fases.push(fase5);
  if (!fase5.sucesso) {
    return { sucesso: false, fases, erro: "Falha na Fase 5" };
  }

  console.log(`\n✅ ENRIQUECIMENTO COMPLETO CONCLUÍDO!\n`);

  return { sucesso: true, fases };
}

// Funções auxiliares de cálculo de score
function calcularScoreCliente(dados: any): number {
  let score = 0;
  if (dados.segmentacao) score += 20;
  if (dados.email) score += 20;
  if (dados.telefone) score += 20;
  if (dados.linkedin) score += 20;
  if (dados.porte) score += 20;
  return score;
}

function calcularScoreMercado(dados: any): number {
  let score = 0;
  if (dados.segmentacao) score += 20;
  if (dados.categoria) score += 20;
  if (dados.tamanhoMercado) score += 20;
  if (dados.crescimentoAnual) score += 20;
  if (dados.tendencias) score += 10;
  if (dados.principaisPlayers) score += 10;
  return score;
}

function classificarScore(score: number): string {
  if (score >= 90) return "Alta";
  if (score >= 60) return "Média";
  return "Baixa";
}
