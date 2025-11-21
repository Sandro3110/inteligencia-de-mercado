/**
 * Fluxo Automatizado de Enriquecimento de Dados
 *
 * Este módulo implementa o fluxo completo de processamento:
 * 1. Input de clientes (manual ou planilha)
 * 2. Identificação automática de mercados via LLM
 * 3. Enriquecimento de dados via APIs
 * 4. Busca de concorrentes e leads
 * 5. Cálculo de scores de qualidade
 * 6. Criação de novo projeto com dados processados
 */

import { calculateQualityScore } from "../shared/qualityScore";
import { jobManager } from "./_core/jobManager";

export type EnrichmentInput = {
  clientes: Array<{
    nome: string;
    cnpj?: string;
    site?: string;
    produto?: string;
  }>;
  projectName?: string;
  projectId?: number;
  projectDescription?: string;
};

export type EnrichmentProgress = {
  status: "processing" | "completed" | "error";
  message: string;
  currentStep: number;
  totalSteps: number;
  data?: {
    projectId?: number;
    projectName?: string;
    clientes?: Array<Record<string, unknown>>;
    mercados?: Array<Record<string, unknown>>;
    concorrentes?: Array<Record<string, unknown>>;
    leads?: Array<Record<string, unknown>>;
    stats?: {
      mercadosCount?: number;
      clientesCount?: number;
      concorrentesCount?: number;
      leadsCount?: number;
      avgQualityScore?: number;
    };
    // Backward compatibility
    mercadosCount?: number;
    clientesCount?: number;
    concorrentesCount?: number;
    leadsCount?: number;
    avgQualityScore?: number;
  };
};

type ProgressCallback = (progress: EnrichmentProgress) => void;

/**
 * Executa o fluxo completo de enriquecimento
 */
export async function executeEnrichmentFlow(
  input: EnrichmentInput,
  onProgress: ProgressCallback,
  jobId?: string
): Promise<EnrichmentProgress> {
  let runId: number | null = null;
  const monitorInterval: NodeJS.Timeout | null = null;
  const startTime = Date.now();

  try {
    const totalSteps = 8;
    let currentStep = 0;

    // Criar job no manager se jobId fornecido
    if (jobId) {
      jobManager.createJob(jobId, totalSteps);
    }

    // Passo 1: Criar ou reusar projeto
    let project: { id: number; nome: string } | null = null;

    if (input.projectId) {
      // Reusar projeto existente
      const { getProjectById } = await import("./db");
      const existingProject = await getProjectById(input.projectId);
      if (!existingProject) {
        throw new Error(`Projeto com ID ${input.projectId} não encontrado`);
      }
      project = { id: existingProject.id, nome: existingProject.nome };
      onProgress({
        status: "processing",
        message: `Reusando projeto "${project.nome}" (ID: ${project.id})...`,
        currentStep: ++currentStep,
        totalSteps,
      });
    } else {
      // Criar novo projeto
      const step1 = {
        status: "processing" as const,
        message: `Criando projeto "${input.projectName}"...`,
        currentStep: ++currentStep,
        totalSteps,
      };
      onProgress(step1);
      if (jobId) {
        jobManager.updateJob(jobId, {
          step: currentStep,
          currentStepName: "Criando projeto",
          message: step1.message,
          progress: 0,
        });
      }

      const { createProject } = await import("./db");
      project = await createProject({
        nome: input.projectName!,
        descricao:
          input.projectDescription ||
          `Projeto criado automaticamente via fluxo de enriquecimento`,
      });

      if (!project) {
        throw new Error("Falha ao criar projeto");
      }
    }

    // Passo 2: Criar pesquisa dentro do projeto
    onProgress({
      status: "processing",
      message: "Criando pesquisa dentro do projeto...",
      currentStep: ++currentStep,
      totalSteps,
    });

    const { createPesquisa } = await import("./db");
    const pesquisaNome = input.projectName || project.nome;
    const pesquisa = await createPesquisa({
      projectId: project.id,
      nome: pesquisaNome,
      descricao: `Pesquisa criada automaticamente via fluxo de enriquecimento`,
      totalClientes: input.clientes.length,
      status: "em_andamento",
    });

    if (!pesquisa) {
      throw new Error("Falha ao criar pesquisa");
    }
    console.log(
      `[Enrichment] Pesquisa ID ${pesquisa.id} criada para projeto ${project.id}`
    );

    // Passo 3: Identificar mercados únicos
    onProgress({
      status: "processing",
      message: "Identificando mercados a partir dos produtos dos clientes...",
      currentStep: ++currentStep,
      totalSteps,
    });

    // Registrar início da execução
    const { createEnrichmentRun } = await import("./db");
    runId = await createEnrichmentRun(project.id, input.clientes.length);
    console.log(
      `[Enrichment] Run ID ${runId} criado para projeto ${project.id}`
    );

    // Iniciar monitoramento de progresso
    const { startProgressMonitoring, stopProgressMonitoring } = await import(
      "./enrichmentMonitor"
    );
    const monitorInterval = startProgressMonitoring(
      project.id,
      runId,
      project.nome
    );

    const mercadosMap = await identifyMarkets(
      input.clientes,
      project.id,
      pesquisa.id
    );

    // Passo 4: Processar e enriquecer clientes
    onProgress({
      status: "processing",
      message: `Enriquecendo dados de ${input.clientes.length} clientes...`,
      currentStep: ++currentStep,
      totalSteps,
    });

    const clientesEnriquecidos = await enrichClientes(
      input.clientes,
      project.id,
      pesquisa.id,
      mercadosMap
    );

    // Passo 5: Buscar concorrentes
    onProgress({
      status: "processing",
      message: "Identificando concorrentes por mercado...",
      currentStep: ++currentStep,
      totalSteps,
    });

    const concorrentes = await findCompetitorsForMarkets(
      mercadosMap,
      project.id,
      pesquisa.id,
      clientesEnriquecidos.map(c => ({
        nome: c.nome,
        cnpj: c.cnpj || undefined,
      })) // Passar clientes para exclusão
    );

    // Passo 6: Buscar leads
    onProgress({
      status: "processing",
      message: "Buscando leads qualificados...",
      currentStep: ++currentStep,
      totalSteps,
    });

    const leadsEncontrados = await findLeadsForMarkets(
      mercadosMap,
      project.id,
      pesquisa.id,
      clientesEnriquecidos.map(c => ({
        nome: c.nome,
        cnpj: c.cnpj || undefined,
      })), // Passar clientes para exclusão
      concorrentes.map(c => ({ nome: c.nome, cnpj: c.cnpj || undefined })) // Passar concorrentes para exclusão
    );

    // Passo 7: Calcular estatísticas
    onProgress({
      status: "processing",
      message: "Calculando métricas de qualidade...",
      currentStep: ++currentStep,
      totalSteps,
    });

    const avgQualityScore = Math.round(
      clientesEnriquecidos.reduce(
        (sum, c) => sum + (c.qualidadeScore || 0),
        0
      ) / clientesEnriquecidos.length
    );

    // Passo 8: Finalizar
    onProgress({
      status: "completed",
      message: "Processamento concluído com sucesso!",
      currentStep: ++currentStep,
      totalSteps,
      data: {
        projectId: project.id,
        mercadosCount: mercadosMap.size,
        clientesCount: clientesEnriquecidos.length,
        concorrentesCount: concorrentes.length,
        leadsCount: leadsEncontrados.length,
        avgQualityScore,
      },
    });

    // Parar monitoramento
    if (monitorInterval) {
      const { stopProgressMonitoring } = await import("./enrichmentMonitor");
      stopProgressMonitoring(monitorInterval);
    }

    // Registrar conclusão da execução
    if (runId) {
      const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
      const { updateEnrichmentRun } = await import("./db");
      await updateEnrichmentRun(runId, {
        status: "completed",
        processedClients: clientesEnriquecidos.length,
        completedAt: new Date(),
        durationSeconds,
        notifiedAt100: 1,
      });

      // Enviar notificação de conclusão
      const { notifyOwner } = await import("./_core/notification");
      await notifyOwner({
        title: `✅ Enriquecimento Concluído - ${project.nome}`,
        content: `O enriquecimento foi concluído com sucesso!\n\n• ${clientesEnriquecidos.length} clientes processados\n• ${mercadosMap.size} mercados identificados\n• ${concorrentes.length} concorrentes encontrados\n• ${leadsEncontrados.length} leads gerados\n• Tempo total: ${Math.floor(durationSeconds / 60)} minutos`,
      });

      // Enviar notificação em tempo real via WebSocket
      const { getWebSocketManager } = await import("./websocket");
      const wsManager = getWebSocketManager();
      if (wsManager) {
        // TODO: Obter userId do contexto quando disponível
        // Por enquanto, broadcast para todos os usuários conectados
        wsManager.broadcast({
          id: `enrichment-${project.id}-${Date.now()}`,
          type: "enrichment_complete",
          title: "✅ Enriquecimento Concluído",
          message: `Projeto "${project.nome}" processado! ${clientesEnriquecidos.length} clientes, ${mercadosMap.size} mercados, ${concorrentes.length} concorrentes, ${leadsEncontrados.length} leads.`,
          timestamp: new Date(),
          data: {
            pesquisaId: project.id,
            pesquisaNome: project.nome,
            totalProcessed: clientesEnriquecidos.length,
            duration: durationSeconds,
          },
          read: false,
        });
      }

      console.log(`[Enrichment] Run ${runId} concluído com sucesso`);
    }

    // Buscar dados completos do banco para retornar
    const db = await (await import("./db")).getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const {
      clientes: clientesTable,
      mercadosUnicos,
      concorrentes: concorrentesTable,
      leads: leadsTable,
    } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    const clientesCompletos = await db
      .select()
      .from(clientesTable)
      .where(eq(clientesTable.projectId, project.id));
    const mercadosCompletos = await db
      .select()
      .from(mercadosUnicos)
      .where(eq(mercadosUnicos.projectId, project.id));
    const concorrentesCompletos = await db
      .select()
      .from(concorrentesTable)
      .where(eq(concorrentesTable.projectId, project.id));
    const leadsCompletos = await db
      .select()
      .from(leadsTable)
      .where(eq(leadsTable.projectId, project.id));

    return {
      status: "completed",
      message: "Processamento concluído!",
      currentStep: totalSteps,
      totalSteps,
      data: {
        projectId: project.id,
        projectName: project.nome,
        clientes: clientesEnriquecidos,
        mercados: mercadosCompletos,
        concorrentes: concorrentesCompletos,
        leads: leadsCompletos,
        stats: {
          mercadosCount: mercadosMap.size,
          clientesCount: clientesEnriquecidos.length,
          concorrentesCount: concorrentes.length,
          leadsCount: leadsEncontrados.length,
          avgQualityScore,
        },
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";

    // Parar monitoramento em caso de erro
    if (monitorInterval) {
      const { stopProgressMonitoring } = await import("./enrichmentMonitor");
      stopProgressMonitoring(monitorInterval);
    }

    // Registrar erro na execução
    if (runId) {
      const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
      const { updateEnrichmentRun } = await import("./db");
      await updateEnrichmentRun(runId, {
        status: "error",
        completedAt: new Date(),
        durationSeconds,
        errorMessage,
      });
      console.error(`[Enrichment] Run ${runId} falhou: ${errorMessage}`);
    }

    return {
      status: "error",
      message: `Erro no processamento: ${errorMessage}`,
      currentStep: 0,
      totalSteps: 0,
    };
  }
}

/**
 * Identifica mercados únicos a partir dos produtos dos clientes
 */
async function identifyMarkets(
  clientes: EnrichmentInput["clientes"],
  projectId: number,
  pesquisaId: number
): Promise<Map<string, number>> {
  const { invokeLLM } = await import("./_core/llm");
  const { createMercado } = await import("./db");

  const mercadosMap = new Map<string, number>();
  const produtosUnicos = Array.from(
    new Set(clientes.map(c => c.produto).filter(Boolean))
  );

  for (const produto of produtosUnicos) {
    if (!produto) {
      continue;
    }

    const startTime = Date.now();
    try {
      // Usar LLM para identificar mercado (com retry automático)
      const { withLLMRetry } = await import("./_core/retryHelper");
      const { logAPICall } = await import("./apiHealth");

      const response = await withLLMRetry(
        () =>
          invokeLLM({
            messages: [
              {
                role: "system",
                content:
                  "Você é um especialista em análise de mercado. Identifique o mercado/setor para o produto fornecido.",
              },
              {
                role: "user",
                content: `Produto: ${produto}\n\nRetorne JSON com: { "mercado": "nome do mercado", "categoria": "categoria", "segmentacao": "B2B ou B2C" }`,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "market_identification",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    mercado: { type: "string" },
                    categoria: { type: "string" },
                    segmentacao: {
                      type: "string",
                      enum: ["B2B", "B2C", "B2B2C"],
                    },
                  },
                  required: ["mercado", "categoria", "segmentacao"],
                  additionalProperties: false,
                },
              },
            },
          }),
        `Identificação de mercado para produto: ${produto}`
      );

      const content = response.choices[0]?.message?.content;

      // Log de sucesso da API
      await logAPICall({
        apiName: "openai",
        endpoint: "/chat/completions",
        status: "success",
        responseTime: Date.now() - startTime,
        requestData: JSON.stringify({ produto, action: "identificar_mercado" }),
      });

      if (!content || typeof content !== "string") {
        console.warn(
          `[Enriquecimento] LLM retornou conteúdo inválido para produto: ${produto}`
        );
        continue;
      }

      const data = JSON.parse(content);

      // Criar mercado se não existir
      if (!mercadosMap.has(data.mercado)) {
        const mercado = await createMercado({
          projectId,
          pesquisaId,
          nome: data.mercado,
          categoria: data.categoria,
          segmentacao: data.segmentacao as any,
        });

        if (mercado) {
          mercadosMap.set(data.mercado, mercado.id);
        }
      }
    } catch (error) {
      console.error(
        `[Enriquecimento] Erro ao identificar mercado para produto "${produto}":`,
        error
      );

      // Log de erro da API
      try {
        const { logAPICall } = await import("./apiHealth");
        const errorTime = Date.now() - startTime;
        await logAPICall({
          apiName: "openai",
          endpoint: "/chat/completions",
          status: "error",
          responseTime: errorTime,
          errorMessage:
            error instanceof Error ? error.message : "Erro desconhecido",
          requestData: JSON.stringify({
            produto,
            action: "identificar_mercado",
          }),
        });
      } catch (logError) {
        console.error("[APIHealth] Erro ao registrar log:", logError);
      }

      // Notificar owner sobre falha de API
      try {
        const { notifyOwner } = await import("./_core/notification");
        await notifyOwner({
          title: "⚠️ Falha na API de IA - Identificação de Mercado",
          content: `Não foi possível identificar o mercado para o produto "${produto}". Erro: ${error instanceof Error ? error.message : "Desconhecido"}. O enriquecimento continuará com os demais produtos.`,
        });
      } catch (notifyError) {
        console.error("[Enriquecimento] Erro ao notificar owner:", notifyError);
      }
      // Continua com próximo produto
      continue;
    }
  }

  return mercadosMap;
}

/**
 * Enriquece dados dos clientes
 */
async function enrichClientes(
  clientes: EnrichmentInput["clientes"],
  projectId: number,
  pesquisaId: number,
  mercadosMap: Map<string, number>
) {
  const { createCliente, associateClienteToMercado } = await import("./db");
  const { invokeLLM } = await import("./_core/llm");
  const { getCachedEnrichment, setCachedEnrichment } = await import(
    "./_core/enrichmentCache"
  );
  const { consultarCNPJ, extractPorte, extractEndereco, extractCNAE } =
    await import("./_core/receitaws");

  const enriched = [];

  for (const cliente of clientes) {
    // Tentar buscar dados do cache primeiro
    let dadosEnriquecidos: Record<string, unknown> | null = null;
    if (cliente.cnpj) {
      const cnpjLimpo = cliente.cnpj.replace(/\D/g, "");
      if (cnpjLimpo.length === 14) {
        dadosEnriquecidos = await getCachedEnrichment(cnpjLimpo);

        // Se não tem cache, consultar ReceitaWS
        if (!dadosEnriquecidos) {
          const apiStartTime = Date.now();
          try {
            const { withAPIRetry } = await import("./_core/retryHelper");
            const { logAPICall } = await import("./apiHealth");
            const receitaData = await withAPIRetry(
              () => consultarCNPJ(cnpjLimpo),
              "ReceitaWS",
              `Consulta CNPJ: ${cnpjLimpo}`
            );
            if (receitaData) {
              dadosEnriquecidos = {
                nome: receitaData.fantasia || receitaData.nome,
                razaoSocial: receitaData.nome,
                cnpj: receitaData.cnpj,
                porte: extractPorte(receitaData),
                endereco: extractEndereco(receitaData),
                cidade: receitaData.municipio,
                uf: receitaData.uf,
                cep: receitaData.cep,
                cnae: extractCNAE(receitaData),
                email: receitaData.email,
                telefone: receitaData.telefone,
                situacao: receitaData.situacao,
              };

              // Salvar no cache
              await setCachedEnrichment(
                cnpjLimpo,
                dadosEnriquecidos,
                "receitaws"
              );

              // Log de sucesso da API
              await logAPICall({
                apiName: "receitaws",
                endpoint: "/cnpj",
                status: "success",
                responseTime: Date.now() - apiStartTime,
                requestData: JSON.stringify({
                  cnpj: cnpjLimpo,
                  cliente: cliente.nome,
                }),
              });
            }
          } catch (error) {
            console.error(
              `[Enriquecimento] Erro ao consultar ReceitaWS para CNPJ "${cnpjLimpo}":`,
              error
            );

            // Log de erro da API
            try {
              const { logAPICall } = await import("./apiHealth");
              await logAPICall({
                apiName: "receitaws",
                endpoint: "/cnpj",
                status: "error",
                responseTime: Date.now() - apiStartTime,
                errorMessage:
                  error instanceof Error ? error.message : "Erro desconhecido",
                requestData: JSON.stringify({
                  cnpj: cnpjLimpo,
                  cliente: cliente.nome,
                }),
              });
            } catch (logError) {
              console.error("[APIHealth] Erro ao registrar log:", logError);
            }

            // Notificar owner sobre falha de API
            try {
              const { notifyOwner } = await import("./_core/notification");
              await notifyOwner({
                title: "⚠️ Falha na API ReceitaWS",
                content: `Não foi possível consultar dados do CNPJ "${cnpjLimpo}" (${cliente.nome}). Erro: ${error instanceof Error ? error.message : "Desconhecido"}. O cliente será criado com dados limitados.`,
              });
            } catch (notifyError) {
              console.error(
                "[Enriquecimento] Erro ao notificar owner:",
                notifyError
              );
            }
          }
        }
      }
    }
    // Identificar mercado do cliente
    let mercadoId: number | null = null;

    if (cliente.produto) {
      const llmStartTime = Date.now();
      try {
        const { withLLMRetry } = await import("./_core/retryHelper");
        const { logAPICall } = await import("./apiHealth");
        const response = await withLLMRetry(
          () =>
            invokeLLM({
              messages: [
                {
                  role: "system",
                  content: "Identifique o mercado para este produto.",
                },
                { role: "user", content: `Produto: ${cliente.produto}` },
              ],
            }),
          `Identificação de mercado para cliente: ${cliente.nome}`
        );

        const content = response.choices[0]?.message?.content;

        // Log de sucesso da API
        await logAPICall({
          apiName: "openai",
          endpoint: "/chat/completions",
          status: "success",
          responseTime: Date.now() - llmStartTime,
          requestData: JSON.stringify({
            produto: cliente.produto,
            cliente: cliente.nome,
            action: "identificar_mercado_cliente",
          }),
        });

        if (content && typeof content === "string") {
          // Buscar mercado correspondente
          for (const [mercadoNome, id] of Array.from(mercadosMap.entries())) {
            if (content.toLowerCase().includes(mercadoNome.toLowerCase())) {
              mercadoId = id;
              break;
            }
          }
        }
      } catch (error) {
        console.error(
          `[Enriquecimento] Erro ao identificar mercado do cliente "${cliente.nome}":`,
          error
        );

        // Log de erro da API
        try {
          const { logAPICall } = await import("./apiHealth");
          await logAPICall({
            apiName: "openai",
            endpoint: "/chat/completions",
            status: "error",
            responseTime: Date.now() - llmStartTime,
            errorMessage:
              error instanceof Error ? error.message : "Erro desconhecido",
            requestData: JSON.stringify({
              produto: cliente.produto,
              cliente: cliente.nome,
              action: "identificar_mercado_cliente",
            }),
          });
        } catch (logError) {
          console.error("[APIHealth] Erro ao registrar log:", logError);
        }

        // Notificar owner sobre falha de API
        try {
          const { notifyOwner } = await import("./_core/notification");
          await notifyOwner({
            title:
              "⚠️ Falha na API de IA - Identificação de Mercado do Cliente",
            content: `Não foi possível identificar o mercado para o cliente "${cliente.nome}" (produto: ${cliente.produto}). Erro: ${error instanceof Error ? error.message : "Desconhecido"}. O cliente será criado sem associação de mercado.`,
          });
        } catch (notifyError) {
          console.error(
            "[Enriquecimento] Erro ao notificar owner:",
            notifyError
          );
        }
        // mercadoId permanece null
      }
    }

    // Usar dados enriquecidos se disponíveis
    const clienteData: Record<string, unknown> = {
      ...cliente,
      nome: dadosEnriquecidos?.nome || cliente.nome,
      porte: dadosEnriquecidos?.porte,
      email: dadosEnriquecidos?.email,
      telefone: dadosEnriquecidos?.telefone,
    };

    // Calcular score de qualidade
    const qualidadeScore = calculateQualityScore(clienteData);
    const qualidadeClassificacao =
      qualidadeScore >= 80
        ? "Excelente"
        : qualidadeScore >= 60
          ? "Bom"
          : qualidadeScore >= 40
            ? "Regular"
            : "Ruim";

    // Aplicar dados do cache se disponível
    const dadosCliente = dadosEnriquecidos || cliente;

    // Criar cliente
    const novoCliente = await createCliente({
      projectId,
      pesquisaId,
      nome: dadosEnriquecidos?.nome || cliente.nome,
      cnpj: cliente.cnpj || null,
      siteOficial: dadosEnriquecidos?.site || cliente.site || null,
      email: dadosEnriquecidos?.email || null,
      telefone: dadosEnriquecidos?.telefone || null,
      cidade: dadosEnriquecidos?.cidade || null,
      uf: dadosEnriquecidos?.uf || null,
      produtoPrincipal: cliente.produto || null,
      qualidadeScore,
      qualidadeClassificacao,
      validationStatus: "pending",
    });

    // Salvar no cache se não estava em cache
    if (!dadosEnriquecidos && cliente.cnpj) {
      const cnpjLimpo = cliente.cnpj.replace(/\D/g, "");
      if (cnpjLimpo.length === 14) {
        await setCachedEnrichment(
          cnpjLimpo,
          {
            nome: cliente.nome,
            site: cliente.site,
            produto: cliente.produto,
          },
          "input"
        );
      }
    }

    if (novoCliente && mercadoId) {
      await associateClienteToMercado(novoCliente.id, mercadoId);
      enriched.push({ ...novoCliente, qualidadeScore });
    }
  }

  return enriched;
}

/**
 * Busca concorrentes para cada mercado usando SerpAPI
 */
async function findCompetitorsForMarkets(
  mercadosMap: Map<string, number>,
  projectId: number,
  pesquisaId: number,
  clientes: Array<{ nome: string; cnpj?: string }> = []
) {
  const { searchCompetitors } = await import("./_core/serpApi");
  const { createConcorrente } = await import("./db");
  const { filterDuplicates } = await import("./_core/deduplication");
  const { filterRealCompanies } = await import("./_core/companyFilters");
  const concorrentes: Array<Record<string, unknown>> = [];

  for (const [mercadoNome, mercadoId] of Array.from(mercadosMap.entries())) {
    try {
      // Buscar concorrentes reais via SerpAPI (20 resultados) com retry
      console.log(
        `[Enrichment] Buscando concorrentes para mercado: ${mercadoNome}`
      );
      const { withAPIRetry } = await import("./_core/retryHelper");
      const rawResults = await withAPIRetry(
        () => searchCompetitors(mercadoNome, undefined, 20),
        "SERPAPI",
        `Busca de concorrentes para mercado: ${mercadoNome}`
      );

      // Filtrar apenas empresas reais (remover artigos/notícias)
      const searchResults = filterRealCompanies(
        rawResults
          .filter(r => r.site) // Garantir que tem site
          .map(r => ({
            title: r.nome,
            link: r.site!,
            snippet: r.descricao,
          }))
      ).map(filtered => ({
        nome: filtered.title,
        site: filtered.link,
        descricao: filtered.snippet,
      }));

      console.log(
        `[Filter] Concorrentes após filtro: ${searchResults.length}/${rawResults.length}`
      );

      // Extrair nomes de empresas dos resultados do SerpAPI
      const concorrentesCandidatos = searchResults.map(result => ({
        nome: result.nome,
        produto: result.descricao || mercadoNome,
        site: result.site,
        cnpj: undefined,
      }));

      const concorrentesFiltrados = filterDuplicates(
        concorrentesCandidatos,
        clientes // Excluir empresas que são clientes
      );

      // Processar cada concorrente validado (aumentado para 20)
      for (const comp of concorrentesFiltrados.slice(0, 20)) {
        try {
          // Dados já vêm do SerpAPI (searchResults)
          const searchMatch = searchResults.find(
            r =>
              r.nome.toLowerCase().includes(comp.nome.toLowerCase()) ||
              comp.nome.toLowerCase().includes(r.nome.toLowerCase())
          );

          const enrichedData = {
            site: searchMatch?.site || comp.site,
            descricao: searchMatch?.descricao || comp.produto,
          };

          // Calcular score de qualidade baseado em dados disponíveis
          const qualidadeScore = calculateQualityScore({
            cnpj: null,
            email: null,
            telefone: null,
            site: enrichedData.site,
            siteOficial: enrichedData.site,
            linkedin: null,
            instagram: null,
            produto: comp.produto,
            produtoPrincipal: comp.produto,
            cidade: null,
            uf: null,
            cnae: null,
            porte: null,
            faturamentoEstimado: null,
          });

          const qualidadeClassificacao =
            qualidadeScore >= 80
              ? "Excelente"
              : qualidadeScore >= 60
                ? "Bom"
                : qualidadeScore >= 40
                  ? "Regular"
                  : "Ruim";

          // Criar concorrente
          const novoConcorrente = await createConcorrente({
            projectId,
            pesquisaId,
            mercadoId,
            nome: comp.nome,
            cnpj: null, // CNPJ será enriquecido posteriormente
            site: enrichedData.site || null,
            produto: comp.produto,
            qualidadeScore,
            qualidadeClassificacao,
            validationStatus: "pending",
          });

          if (novoConcorrente) {
            concorrentes.push(novoConcorrente);
          }
        } catch (error) {
          console.error(`Erro ao criar concorrente ${comp.nome}:`, error);
        }
      }
    } catch (error) {
      console.error(
        `[Enriquecimento] Erro ao buscar concorrentes para mercado "${mercadoNome}":`,
        error
      );
      // Notificar owner sobre falha de API
      try {
        const { notifyOwner } = await import("./_core/notification");
        await notifyOwner({
          title: "⚠️ Falha na API SERPAPI - Busca de Concorrentes",
          content: `Não foi possível buscar concorrentes para o mercado "${mercadoNome}". Erro: ${error instanceof Error ? error.message : "Desconhecido"}. O enriquecimento continuará com os demais mercados.`,
        });
      } catch (notifyError) {
        console.error("[Enriquecimento] Erro ao notificar owner:", notifyError);
      }
    }
  }

  return concorrentes;
}

/**
 * Busca leads para cada mercado usando SerpAPI
 */
async function findLeadsForMarkets(
  mercadosMap: Map<string, number>,
  projectId: number,
  pesquisaId: number,
  clientes: Array<{ nome: string; cnpj?: string }> = [],
  concorrentes: Array<{ nome: string; cnpj?: string }> = []
) {
  const { searchLeads } = await import("./_core/serpApi");
  const { createLead } = await import("./db");
  const { filterDuplicates } = await import("./_core/deduplication");
  const { filterRealCompanies } = await import("./_core/companyFilters");
  const leads: Array<Record<string, unknown>> = [];

  for (const [mercadoNome, mercadoId] of Array.from(mercadosMap.entries())) {
    try {
      // Buscar leads reais via SerpAPI (20 resultados) com retry
      console.log(`[Enrichment] Buscando leads para mercado: ${mercadoNome}`);
      const { withAPIRetry } = await import("./_core/retryHelper");
      const rawResults = await withAPIRetry(
        () => searchLeads(mercadoNome, "fornecedores", 20),
        "SERPAPI",
        `Busca de leads para mercado: ${mercadoNome}`
      );

      // Filtrar apenas empresas reais (remover artigos/notícias)
      const searchResults = filterRealCompanies(
        rawResults
          .filter(r => r.site) // Garantir que tem site
          .map(r => ({
            title: r.nome,
            link: r.site!,
            snippet: r.descricao,
          }))
      ).map(filtered => ({
        nome: filtered.title,
        site: filtered.link,
        descricao: filtered.snippet,
      }));

      console.log(
        `[Filter] Leads após filtro: ${searchResults.length}/${rawResults.length}`
      );

      // Extrair nomes de empresas dos resultados do SerpAPI
      const leadsCandidatos = searchResults.map(result => ({
        nome: result.nome,
        tipo: "B2B",
        regiao: "Brasil",
        site: result.site,
        cnpj: undefined,
      }));

      const leadsFiltrados = filterDuplicates(
        leadsCandidatos,
        clientes, // Excluir empresas que são clientes
        concorrentes // Excluir empresas que são concorrentes
      );

      // Processar cada lead validado (aumentado para 20)
      for (const lead of leadsFiltrados.slice(0, 20)) {
        try {
          // Dados já vêm do SerpAPI (searchResults)
          const searchMatch = searchResults.find(
            r =>
              r.nome.toLowerCase().includes(lead.nome.toLowerCase()) ||
              lead.nome.toLowerCase().includes(r.nome.toLowerCase())
          );

          const enrichedData = {
            site: searchMatch?.site || null,
            descricao: searchMatch?.descricao || null,
          };

          // Calcular score de qualidade baseado em dados disponíveis
          const qualidadeScore = calculateQualityScore({
            cnpj: null,
            email: null,
            telefone: null,
            site: enrichedData.site,
            siteOficial: enrichedData.site,
            linkedin: null,
            instagram: null,
            produto: null,
            produtoPrincipal: null,
            cidade: null,
            uf: null,
            cnae: null,
            porte: null,
            faturamentoEstimado: null,
          });

          const qualidadeClassificacao =
            qualidadeScore >= 80
              ? "Excelente"
              : qualidadeScore >= 60
                ? "Bom"
                : qualidadeScore >= 40
                  ? "Regular"
                  : "Ruim";

          // Criar lead
          const novoLead = await createLead({
            projectId,
            pesquisaId,
            mercadoId,
            nome: lead.nome,
            cnpj: null, // CNPJ será enriquecido posteriormente
            email: null,
            telefone: null,
            site: enrichedData.site || null,
            tipo:
              (lead.tipo?.toLowerCase() as
                | "inbound"
                | "outbound"
                | "referral") || "outbound",
            regiao: lead.regiao || "Brasil",
            setor: mercadoNome,
            qualidadeScore,
            qualidadeClassificacao,
            validationStatus: "pending",
          });

          if (novoLead) {
            leads.push(novoLead);

            // Registrar atividade
            const { logActivity } = await import("./db");
            await logActivity({
              projectId,
              activityType: "lead_created",
              description: `Novo lead criado: ${lead.nome} (Score: ${qualidadeScore})`,
              metadata: JSON.stringify({
                leadId: novoLead.id,
                score: qualidadeScore,
              }),
            });

            // Verificar alertas de lead de alta qualidade
            if (qualidadeScore >= 80) {
              const { checkAlerts } = await import("./enrichmentMonitor");
              await checkAlerts(projectId, {
                errorCount: 0,
                totalProcessed: leads.length,
                newLeadScore: qualidadeScore,
              });
            }
          }
        } catch (error) {
          console.error(`Erro ao criar lead ${lead.nome}:`, error);
        }
      }
    } catch (error) {
      console.error(
        `[Enriquecimento] Erro ao buscar leads para mercado "${mercadoNome}":`,
        error
      );
      // Notificar owner sobre falha de API
      try {
        const { notifyOwner } = await import("./_core/notification");
        await notifyOwner({
          title: "⚠️ Falha na API SERPAPI - Busca de Leads",
          content: `Não foi possível buscar leads para o mercado "${mercadoNome}". Erro: ${error instanceof Error ? error.message : "Desconhecido"}. O enriquecimento continuará com os demais mercados.`,
        });
      } catch (notifyError) {
        console.error("[Enriquecimento] Erro ao notificar owner:", notifyError);
      }
    }
  }

  return leads;
}
