import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import {
  pesquisas as pesquisasTable,
  clientes,
  leads,
  concorrentes,
  mercadosUnicos,
  systemSettings,
} from '@/drizzle/schema';
import { eq, inArray, count } from 'drizzle-orm';
import { generatePDF, PDFData, PDFSection } from '@/server/utils/pdfGenerator';
import { createZipBase64, ZipFile } from '@/server/utils/zipGenerator';

/**
 * Reports Router - Geração de relatórios analíticos
 */
export const reportsRouter = createTRPCRouter({
  /**
   * Gerar relatório PDF analítico de um projeto com IA
   */
  generateProjectReport: publicProcedure
    .input(
      z.object({
        projectId: z.number(),
        pesquisaIds: z.array(z.number()).optional(), // Filtro opcional de pesquisas
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      // 1. Buscar API key do OpenAI
      const [openaiSetting] = await db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.settingKey, 'OPENAI_API_KEY'));

      if (!openaiSetting?.settingValue) {
        throw new Error('OpenAI API key não configurada');
      }

      const apiKey = openaiSetting.settingValue;

      // 2. Buscar pesquisas do projeto (todas ou filtradas)
      const pesquisas = await db
        .select()
        .from(pesquisasTable)
        .where(
          input.pesquisaIds && input.pesquisaIds.length > 0
            ? inArray(pesquisasTable.id, input.pesquisaIds)
            : eq(pesquisasTable.projectId, input.projectId)
        );

      if (pesquisas.length === 0) {
        throw new Error('Projeto não possui pesquisas');
      }

      const pesquisaIds = pesquisas.map((p) => p.id);

      // 3. Verificar tamanho dos dados antes de buscar
      const [clientesCount, leadsCount, concorrentesCount, mercadosCount] = await Promise.all([
        db
          .select({ count: count() })
          .from(clientes)
          .where(inArray(clientes.pesquisaId, pesquisaIds)),
        db.select({ count: count() }).from(leads).where(inArray(leads.pesquisaId, pesquisaIds)),
        db
          .select({ count: count() })
          .from(concorrentes)
          .where(inArray(concorrentes.pesquisaId, pesquisaIds)),
        db
          .select({ count: count() })
          .from(mercadosUnicos)
          .where(inArray(mercadosUnicos.pesquisaId, pesquisaIds)),
      ]);

      const totalClientes = clientesCount[0]?.count || 0;
      const totalLeads = leadsCount[0]?.count || 0;
      const totalConcorrentes = concorrentesCount[0]?.count || 0;
      const totalMercados = mercadosCount[0]?.count || 0;
      const totalRegistros = totalClientes + totalLeads + totalConcorrentes + totalMercados;

      // Limite de segurança: 10.000 registros
      const LIMITE_REGISTROS = 10000;

      // Se exceder limite, gerar múltiplos PDFs (1 por pesquisa) em ZIP
      if (totalRegistros > LIMITE_REGISTROS) {
        console.log(
          `[Reports] Total de ${totalRegistros} registros excede limite de ${LIMITE_REGISTROS}. ` +
            `Gerando múltiplos PDFs (1 por pesquisa)...`
        );

        const pdfFiles: ZipFile[] = [];

        // Gerar 1 PDF por pesquisa
        for (const pesquisa of pesquisas) {
          console.log(`[Reports] Gerando PDF para pesquisa: ${pesquisa.nome} (ID: ${pesquisa.id})`);

          // Buscar dados apenas desta pesquisa
          const [clientesPesquisa, leadsPesquisa, concorrentesPesquisa, mercadosPesquisa] =
            await Promise.all([
              db.select().from(clientes).where(eq(clientes.pesquisaId, pesquisa.id)),
              db.select().from(leads).where(eq(leads.pesquisaId, pesquisa.id)),
              db.select().from(concorrentes).where(eq(concorrentes.pesquisaId, pesquisa.id)),
              db.select().from(mercadosUnicos).where(eq(mercadosUnicos.pesquisaId, pesquisa.id)),
            ]);

          const totalPesquisa =
            clientesPesquisa.length +
            leadsPesquisa.length +
            concorrentesPesquisa.length +
            mercadosPesquisa.length;

          // Criar PDF simples sem IA (para economizar tokens)
          const pdfData: PDFData = {
            title: `Relatório: ${pesquisa.nome}`,
            subtitle: 'Dados Consolidados',
            projectId: input.projectId,
            date: new Date().toLocaleDateString('pt-BR'),
            statistics: [
              { label: 'Clientes', value: clientesPesquisa.length },
              { label: 'Leads', value: leadsPesquisa.length },
              { label: 'Mercados', value: mercadosPesquisa.length },
              { label: 'Concorrentes', value: concorrentesPesquisa.length },
              { label: 'Total', value: totalPesquisa },
            ],
            sections: [
              {
                title: 'Resumo',
                content: `Esta pesquisa contém ${totalPesquisa} registros distribuídos em ${clientesPesquisa.length} clientes, ${leadsPesquisa.length} leads, ${mercadosPesquisa.length} mercados e ${concorrentesPesquisa.length} concorrentes.`,
              },
            ],
          };

          const pdfBuffer = generatePDF(pdfData);
          const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

          pdfFiles.push({
            filename: `relatorio-${pesquisa.nome.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`,
            data: pdfBase64,
            encoding: 'base64',
          });

          console.log(`[Reports] PDF gerado para pesquisa: ${pesquisa.nome}`);
        }

        // Criar ZIP com todos os PDFs
        console.log(`[Reports] Criando ZIP com ${pdfFiles.length} PDFs...`);
        const zipBase64 = await createZipBase64(
          pdfFiles,
          `relatorios-projeto-${input.projectId}.zip`
        );

        return {
          success: true,
          data: zipBase64,
          mimeType: 'application/zip',
          filename: `relatorios-projeto-${input.projectId}-${Date.now()}.zip`,
        };
      }

      console.log(`[Reports] Gerando relatório único para ${totalRegistros} registros`);

      // 4. Buscar todos os dados (com limite implícito validado)
      const [clientesData, leadsData, concorrentesData, mercadosData] = await Promise.all([
        db.select().from(clientes).where(inArray(clientes.pesquisaId, pesquisaIds)),
        db.select().from(leads).where(inArray(leads.pesquisaId, pesquisaIds)),
        db.select().from(concorrentes).where(inArray(concorrentes.pesquisaId, pesquisaIds)),
        db.select().from(mercadosUnicos).where(inArray(mercadosUnicos.pesquisaId, pesquisaIds)),
      ]);

      // 4. Preparar dados para análise da IA
      const _totalEntidades =
        clientesData.length + leadsData.length + concorrentesData.length + mercadosData.length;

      // Top 20 mercados por tamanho estimado
      const top20Mercados = mercadosData
        .sort((a, b) => {
          const sizeA = parseFloat(a.tamanhoEstimado || '0');
          const sizeB = parseFloat(b.tamanhoEstimado || '0');
          return sizeB - sizeA;
        })
        .slice(0, 20);

      // Top 20 clientes (por ordem alfabética por enquanto)
      const _top20Clientes = clientesData.slice(0, 20);

      // Produtos principais (extrair de clientes)
      const produtos = clientesData
        .map((c) => c.produtoPrincipal)
        .filter((p) => p && p.trim() !== '')
        .reduce((acc: { [key: string]: number }, produto) => {
          if (produto) {
            acc[produto] = (acc[produto] || 0) + 1;
          }
          return acc;
        }, {});

      const top20Produtos = Object.entries(produtos)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([nome, count]) => ({
          nome,
          count,
          percentual: ((count / clientesData.length) * 100).toFixed(1),
        }));

      // Distribuição geográfica de clientes
      const clientesPorEstado = clientesData
        .filter((c) => c.uf)
        .reduce((acc: { [key: string]: number }, cliente) => {
          const uf = cliente.uf || 'Não especificado';
          acc[uf] = (acc[uf] || 0) + 1;
          return acc;
        }, {});

      const _top10Estados = Object.entries(clientesPorEstado)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([uf, count]) => ({
          uf,
          count,
          percentual: ((count / clientesData.length) * 100).toFixed(1),
        }));

      const clientesPorCidade = clientesData
        .filter((c) => c.cidade)
        .reduce((acc: { [key: string]: number }, cliente) => {
          const cidade = cliente.cidade || 'Não especificada';
          acc[cidade] = (acc[cidade] || 0) + 1;
          return acc;
        }, {});

      const top10Cidades = Object.entries(clientesPorCidade)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([cidade, count]) => ({ cidade, count }));

      // Amostra de 20 clientes reais para análise específica
      const amostraClientes = clientesData
        .filter((c) => c.nome && c.produtoPrincipal)
        .slice(0, 20)
        .map((c) => ({
          nome: c.nome,
          produto: c.produtoPrincipal,
          cidade: c.cidade || 'N/A',
          uf: c.uf || 'N/A',
        }));

      // Distribuição geográfica COMPLETA (todos os estados)
      const distribuicaoGeografica = Object.entries(clientesPorEstado)
        .sort(([, a], [, b]) => b - a)
        .map(([uf, clientesCount]) => {
          const leadsCount = leadsData.filter((l) => l.uf === uf).length;
          const concorrentesCount = concorrentesData.filter((c) => c.uf === uf).length;
          return {
            uf,
            clientes: clientesCount,
            leads: leadsCount,
            concorrentes: concorrentesCount,
            percentualClientes: ((clientesCount / clientesData.length) * 100).toFixed(1),
          };
        });

      // ===== MELHORIAS: ANÁLISES CRÍTICAS E AVANÇADAS =====

      // 1. Análise de Qualidade de Leads
      const leadsPorQualidade = leadsData.reduce((acc: { [key: string]: number }, lead) => {
        const qualidade = lead.qualidade || 'Não classificado';
        acc[qualidade] = (acc[qualidade] || 0) + 1;
        return acc;
      }, {});

      const leadsAlta = leadsData.filter((l) => l.qualidade === 'alta');
      const leadsMedia = leadsData.filter((l) => l.qualidade === 'media');
      const leadsBaixa = leadsData.filter((l) => l.qualidade === 'baixa');

      const scoresMedios = {
        alta:
          leadsAlta.length > 0
            ? (leadsAlta.reduce((sum, l) => sum + (l.score || 0), 0) / leadsAlta.length).toFixed(1)
            : '0.0',
        media:
          leadsMedia.length > 0
            ? (leadsMedia.reduce((sum, l) => sum + (l.score || 0), 0) / leadsMedia.length).toFixed(
                1
              )
            : '0.0',
        baixa:
          leadsBaixa.length > 0
            ? (leadsBaixa.reduce((sum, l) => sum + (l.score || 0), 0) / leadsBaixa.length).toFixed(
                1
              )
            : '0.0',
      };

      const leadsPorStage = leadsData.reduce((acc: { [key: string]: number }, lead) => {
        const stage = lead.stage || 'Não classificado';
        acc[stage] = (acc[stage] || 0) + 1;
        return acc;
      }, {});

      const distribuicaoQualidade = Object.entries(leadsPorQualidade)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .map(([qualidade, count]) => ({
          qualidade,
          count,
          percentual: (((count as number) / leadsData.length) * 100).toFixed(1),
        }));

      const distribuicaoStage = Object.entries(leadsPorStage)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .map(([stage, count]) => ({
          stage,
          count,
          percentual: (((count as number) / leadsData.length) * 100).toFixed(1),
        }));

      // 2. Análise de Setores
      const clientesPorSetor = clientesData
        .filter((c) => c.setor)
        .reduce((acc: { [key: string]: number }, cliente) => {
          const setor = cliente.setor || 'Não especificado';
          acc[setor] = (acc[setor] || 0) + 1;
          return acc;
        }, {});

      const top10Setores = Object.entries(clientesPorSetor)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([setor, count]) => ({
          setor,
          count,
          percentual: (((count as number) / clientesData.length) * 100).toFixed(1),
        }));

      // 3. Análise de Porte de Concorrentes
      const concorrentesPorPorte = concorrentesData
        .filter((c) => c.porte)
        .reduce((acc: { [key: string]: number }, concorrente) => {
          const porte = concorrente.porte || 'Não especificado';
          acc[porte] = (acc[porte] || 0) + 1;
          return acc;
        }, {});

      const distribuicaoPorteConcorrentes = Object.entries(concorrentesPorPorte)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .map(([porte, count]) => ({
          porte,
          count,
          percentual: (((count as number) / concorrentesData.length) * 100).toFixed(1),
        }));

      // 4. Análise de Completude de Dados
      const clientesComTelefone = clientesData.filter((c) => c.telefone).length;
      const clientesComEmail = clientesData.filter((c) => c.email).length;
      const clientesComSite = clientesData.filter((c) => c.siteOficial).length;
      const clientesComCNPJ = clientesData.filter((c) => c.cnpj).length;

      const completudeClientes = {
        telefone: ((clientesComTelefone / clientesData.length) * 100).toFixed(1),
        email: ((clientesComEmail / clientesData.length) * 100).toFixed(1),
        site: ((clientesComSite / clientesData.length) * 100).toFixed(1),
        cnpj: ((clientesComCNPJ / clientesData.length) * 100).toFixed(1),
      };

      const leadsComTelefone = leadsData.filter((l) => l.telefone).length;
      const leadsComEmail = leadsData.filter((l) => l.email).length;
      const leadsComSite = leadsData.filter((l) => l.siteOficial).length;

      const completudeLeads = {
        telefone: ((leadsComTelefone / leadsData.length) * 100).toFixed(1),
        email: ((leadsComEmail / leadsData.length) * 100).toFixed(1),
        site: ((leadsComSite / leadsData.length) * 100).toFixed(1),
      };

      // 5. Análise de Concentração de Mercado (HHI)
      const clientesPorMercado = mercadosData.map((mercado) => {
        const clientesMercado = clientesData.filter(
          (c) =>
            c.produtoPrincipal &&
            mercado.nome &&
            c.produtoPrincipal.toLowerCase().includes(mercado.nome.toLowerCase())
        ).length;

        return {
          mercado: mercado.nome,
          clientes: clientesMercado,
          participacao: (clientesMercado / clientesData.length) * 100,
        };
      });

      const hhi = clientesPorMercado.reduce((sum, m) => sum + Math.pow(m.participacao, 2), 0);

      const classificacaoHHI =
        hhi < 1500
          ? 'Mercado competitivo (baixa concentração)'
          : hhi < 2500
            ? 'Concentração moderada'
            : 'Alta concentração (oligopólio)';

      const mercadosMaisConcentrados = clientesPorMercado
        .filter((m) => m.clientes > 0)
        .sort((a, b) => b.participacao - a.participacao)
        .slice(0, 5);

      const mercadosMaisFragmentados = clientesPorMercado
        .filter((m) => m.clientes > 0)
        .sort((a, b) => a.participacao - b.participacao)
        .slice(0, 5);

      // 6. Benchmarking entre Pesquisas
      const comparacaoPesquisas = pesquisas.map((pesquisa) => {
        const clientesPesquisa = clientesData.filter((c) => c.pesquisaId === pesquisa.id);
        const leadsPesquisa = leadsData.filter((l) => l.pesquisaId === pesquisa.id);
        const mercadosPesquisa = mercadosData.filter((m) => m.pesquisaId === pesquisa.id);

        const taxaConversao =
          clientesPesquisa.length > 0
            ? ((leadsPesquisa.length / clientesPesquisa.length) * 100).toFixed(1)
            : '0.0';

        const qualidadeMedia =
          leadsPesquisa.length > 0
            ? (
                leadsPesquisa.reduce((sum, l) => sum + (l.score || 0), 0) / leadsPesquisa.length
              ).toFixed(1)
            : '0.0';

        return {
          nome: pesquisa.nome,
          clientes: clientesPesquisa.length,
          leads: leadsPesquisa.length,
          mercados: mercadosPesquisa.length,
          taxaConversao,
          qualidadeMedia,
        };
      });

      const pesquisaMelhor = comparacaoPesquisas.reduce((melhor, atual) => {
        const taxaMelhor = parseFloat(melhor.taxaConversao);
        const taxaAtual = parseFloat(atual.taxaConversao);
        return taxaAtual > taxaMelhor ? atual : melhor;
      }, comparacaoPesquisas[0]);

      // 7. Análise de Correlação Setor vs Qualidade
      const qualidadePorSetor: { [key: string]: number } = {};
      const countPorSetor: { [key: string]: number } = {};

      clientesData.forEach((cliente) => {
        if (cliente.setor) {
          const leadsSetor = leadsData.filter(
            (l) => l.segmento && l.segmento.toLowerCase().includes(cliente.setor!.toLowerCase())
          );

          if (leadsSetor.length > 0) {
            const qualidadeMedia =
              leadsSetor.reduce((sum, l) => sum + (l.score || 0), 0) / leadsSetor.length;

            if (!qualidadePorSetor[cliente.setor]) {
              qualidadePorSetor[cliente.setor] = 0;
              countPorSetor[cliente.setor] = 0;
            }

            qualidadePorSetor[cliente.setor] += qualidadeMedia;
            countPorSetor[cliente.setor]++;
          }
        }
      });

      const setoresComMaiorQualidade = Object.entries(qualidadePorSetor)
        .map(([setor, soma]) => ({
          setor,
          qualidadeMedia: (soma / countPorSetor[setor]).toFixed(1),
        }))
        .sort((a, b) => parseFloat(b.qualidadeMedia) - parseFloat(a.qualidadeMedia))
        .slice(0, 5);

      // 5. Criar prompt para IA
      const prompt = `
Você é um analista de inteligência de mercado experiente. Com base nos dados REAIS fornecidos, crie um relatório executivo profissional e ESPECÍFICO.

**DADOS CONSOLIDADOS DO PROJETO:**
- Total de pesquisas: ${pesquisas.length}
- Total de clientes: ${clientesData.length}
- Total de leads: ${leadsData.length}
- Total de concorrentes: ${concorrentesData.length}
- Total de mercados: ${mercadosData.length}

**TOP 20 MERCADOS (com dados completos):**
${top20Mercados
  .map(
    (m, i) => `${i + 1}. ${m.nome}
   Categoria: ${m.categoria || 'N/A'}
   Tamanho: ${m.tamanhoEstimado || 'N/A'}
   Crescimento: ${m.crescimentoAnual || 'N/A'}
   Tendências: ${m.tendencias || 'N/A'}`
  )
  .join('\n\n')}

**TOP 20 PRODUTOS (com número de clientes e %):**
${top20Produtos.map((p, i) => `${i + 1}. ${p.nome} - ${p.count} clientes (${p.percentual}%)`).join('\n')}

**DISTRIBUIÇÃO GEOGRÁFICA COMPLETA:**
${distribuicaoGeografica.map((d) => `${d.uf}: ${d.clientes} clientes (${d.percentualClientes}%), ${d.leads} leads, ${d.concorrentes} concorrentes`).join('\n')}

**TOP 10 CIDADES:**
${top10Cidades.map((c, i) => `${i + 1}. ${c.cidade}: ${c.count} clientes`).join('\n')}

**AMOSTRA DE 20 CLIENTES REAIS:**
${amostraClientes.map((c, i) => `${i + 1}. ${c.nome} - ${c.produto} (${c.cidade}/${c.uf})`).join('\n')}



**DISTRIBUIÇÃO DE QUALIDADE DE LEADS:**
${distribuicaoQualidade.map((q) => `- ${q.qualidade}: ${q.count} leads (${q.percentual}%) - Score médio: ${scoresMedios[q.qualidade.toLowerCase()] || 'N/A'}`).join('\n')}

**DISTRIBUIÇÃO POR ESTÁGIO (FUNIL):**
${distribuicaoStage.map((s) => `- ${s.stage}: ${s.count} leads (${s.percentual}%)`).join('\n')}

**TOP 10 SETORES:**
${top10Setores.map((s, i) => `${i + 1}. ${s.setor}: ${s.count} clientes (${s.percentual}%)`).join('\n')}

**DISTRIBUIÇÃO DE CONCORRENTES POR PORTE:**
${distribuicaoPorteConcorrentes.map((p) => `- ${p.porte}: ${p.count} concorrentes (${p.percentual}%)`).join('\n')}

**QUALIDADE DOS DADOS COLETADOS:**
Clientes:
- Telefone: ${completudeClientes.telefone}% (${clientesComTelefone}/${clientesData.length})
- Email: ${completudeClientes.email}% (${clientesComEmail}/${clientesData.length})
- Site: ${completudeClientes.site}% (${clientesComSite}/${clientesData.length})
- CNPJ: ${completudeClientes.cnpj}% (${clientesComCNPJ}/${clientesData.length})

Leads:
- Telefone: ${completudeLeads.telefone}% (${leadsComTelefone}/${leadsData.length})
- Email: ${completudeLeads.email}% (${leadsComEmail}/${leadsData.length})
- Site: ${completudeLeads.site}% (${leadsComSite}/${leadsData.length})

**ANÁLISE DE CONCENTRAÇÃO DE MERCADO:**
- Índice HHI: ${hhi.toFixed(0)}
- Classificação: ${classificacaoHHI}
- Mercados mais concentrados: ${mercadosMaisConcentrados.map((m) => `${m.mercado} (${m.participacao.toFixed(1)}%)`).join(', ')}
- Mercados mais fragmentados: ${mercadosMaisFragmentados.map((m) => `${m.mercado} (${m.participacao.toFixed(1)}%)`).join(', ')}

**BENCHMARKING ENTRE PESQUISAS:**
${comparacaoPesquisas
  .map(
    (p, i) => `${i + 1}. ${p.nome}
   - Clientes: ${p.clientes} | Leads: ${p.leads} | Mercados: ${p.mercados}
   - Taxa de conversão: ${p.taxaConversao}x | Qualidade média: ${p.qualidadeMedia}/10`
  )
  .join('\n')}

Melhor performance: ${pesquisaMelhor.nome} (taxa ${pesquisaMelhor.taxaConversao}x, qualidade ${pesquisaMelhor.qualidadeMedia}/10)

**SETORES COM MAIOR QUALIDADE DE LEADS:**
${setoresComMaiorQualidade.map((s, i) => `${i + 1}. ${s.setor}: qualidade média ${s.qualidadeMedia}/10`).join('\n')}

**INSTRUÇÕES OBRIGATÓRIAS:**

1. SEMPRE cite nomes REAIS de empresas da amostra de clientes
2. SEMPRE use os NÚMEROS EXATOS fornecidos (${clientesData.length} clientes, ${leadsData.length} leads, etc)
3. SEMPRE mencione CIDADES REAIS da lista (ex: ${top10Cidades[0]?.cidade}, ${top10Cidades[1]?.cidade})
4. SEMPRE cite PRODUTOS ESPECÍFICOS da lista Top 20
5. SEMPRE mencione MERCADOS ESPECÍFICOS com seus tamanhos e crescimento
6. NÃO seja genérico - use dados concretos em CADA parágrafo
7. Cite pelo menos 5 empresas reais da amostra ao longo do relatório
8. Cite pelo menos 8 produtos específicos da lista Top 20
9. Mencione pelo menos 5 estados com seus números exatos

**ESTRUTURA DO RELATÓRIO:**

1. **Resumo Executivo** (3 parágrafos):
   - Cite os ${clientesData.length} clientes identificados
   - Mencione empresas específicas como ${amostraClientes[0]?.nome} e ${amostraClientes[1]?.nome}
   - Use números exatos da distribuição geográfica

2. **Análise de Mercados** (4 parágrafos):
   - Analise os ${mercadosData.length} mercados identificados
   - Cite pelo menos 5 mercados específicos com tamanho e crescimento
   - Mencione categorias e tendências específicas

3. **Perfil de Clientes e Distribuição Geográfica** (4 parágrafos):
   - Use a tabela de distribuição geográfica completa
   - Cite estados específicos com números exatos (ex: ${distribuicaoGeografica[0]?.uf}: ${distribuicaoGeografica[0]?.clientes} clientes)
   - Mencione cidades específicas da lista Top 10

4. **Análise de Produtos e Serviços** (3 parágrafos):
   - Cite os Top 20 produtos com números de clientes e percentuais
   - Mencione produtos específicos e suas aplicações
   - Use dados de clientes reais para exemplificar

5. **Análise de Leads e Oportunidades** (2 parágrafos):
   - Use o número exato de ${leadsData.length} leads
   - Relacione com os ${clientesData.length} clientes existentes

6. **Panorama Competitivo** (3 parágrafos):
   - Mencione os ${concorrentesData.length} concorrentes identificados
   - Use dados da distribuição geográfica para análise competitiva

7. **Análise SWOT** (3 parágrafos):
   - Baseie SWOT nos dados reais fornecidos
   - Cite mercados, produtos e números específicos

8. **Conclusões e Recomendações** (4 parágrafos):
   - Recomendações baseadas em dados concretos
   - Cite mercados e produtos específicos para expansão

**FORMATO:**
- Não use markdown, apenas texto puro
- Cada parágrafo: 4-6 linhas
- Total: 26 parágrafos
- Separe seções com linha em branco
`;

      // 6. Chamar OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'Você é um analista de inteligência de mercado experiente que cria relatórios executivos profissionais.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const analise = data.choices[0]?.message?.content || 'Erro ao gerar análise';

      // 7. Parsear seções do texto
      const sections: PDFSection[] = [];
      const sectionTitles = [
        'Resumo Executivo',
        'Análise de Mercados',
        'Perfil de Clientes e Distribuição Geográfica',
        'Análise de Produtos e Serviços',
        'Análise de Leads e Oportunidades',
        'Panorama Competitivo',
        'Análise de Setores e Segmentos',
        'Qualidade e Completude dos Dados',
        'Análise SWOT',
        'Conclusões e Recomendações Estratégicas',
      ];

      const currentText = analise;
      for (const title of sectionTitles) {
        const regex = new RegExp(`\\*\\*${title}\\*\\*[:\\s]*([\\s\\S]*?)(?=\\*\\*|$)`, 'i');
        const match = currentText.match(regex);
        if (match && match[1]) {
          sections.push({
            title,
            content: match[1].trim(),
          });
        }
      }

      // Se não conseguiu parsear, usar texto completo
      if (sections.length === 0) {
        sections.push({
          title: 'Análise Completa',
          content: analise,
        });
      }

      // 8. Gerar PDF usando função unificada
      const pdfData: PDFData = {
        title: 'Relatório de Inteligência de Mercado',
        subtitle: 'Análise Consolidada do Projeto',
        projectId: input.projectId,
        date: new Date().toLocaleDateString('pt-BR'),
        statistics: [
          { label: 'Total de Pesquisas', value: pesquisas.length },
          { label: 'Total de Clientes', value: clientesData.length },
          { label: 'Total de Leads', value: leadsData.length },
          { label: 'Total de Mercados', value: mercadosData.length },
          { label: 'Total de Concorrentes', value: concorrentesData.length },
        ],
        sections,
      };

      const pdfBuffer = generatePDF(pdfData);

      // 9. Retornar PDF como base64
      const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

      return {
        success: true,
        data: pdfBase64,
        mimeType: 'application/pdf',
        filename: `relatorio-projeto-${input.projectId}-${Date.now()}.pdf`,
      };
    }),
});
