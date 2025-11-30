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
import { eq, inArray } from 'drizzle-orm';
import { generatePDF, PDFData, PDFSection } from '@/server/utils/pdfGenerator';

/**
 * Reports Router - Geração de relatórios analíticos
 */
export const reportsRouter = createTRPCRouter({
  /**
   * Gerar relatório PDF analítico de um projeto com IA
   */
  generateProjectReport: publicProcedure
    .input(z.object({ projectId: z.number() }))
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

      // 2. Buscar todas as pesquisas do projeto
      const pesquisas = await db
        .select()
        .from(pesquisasTable)
        .where(eq(pesquisasTable.projectId, input.projectId));

      if (pesquisas.length === 0) {
        throw new Error('Projeto não possui pesquisas');
      }

      const pesquisaIds = pesquisas.map((p) => p.id);

      // 3. Buscar todos os dados
      const [clientesData, leadsData, concorrentesData, mercadosData] = await Promise.all([
        db.select().from(clientes).where(inArray(clientes.pesquisaId, pesquisaIds)),
        db.select().from(leads).where(inArray(leads.pesquisaId, pesquisaIds)),
        db.select().from(concorrentes).where(inArray(concorrentes.pesquisaId, pesquisaIds)),
        db.select().from(mercadosUnicos).where(inArray(mercadosUnicos.pesquisaId, pesquisaIds)),
      ]);

      // 4. Preparar dados para análise da IA
      const totalEntidades =
        clientesData.length + leadsData.length + concorrentesData.length + mercadosData.length;

      // Top 10 mercados por tamanho estimado
      const top10Mercados = mercadosData
        .sort((a, b) => {
          const sizeA = parseFloat(a.tamanhoEstimado || '0');
          const sizeB = parseFloat(b.tamanhoEstimado || '0');
          return sizeB - sizeA;
        })
        .slice(0, 10);

      // Top 20 clientes (por ordem alfabética por enquanto)
      const top20Clientes = clientesData.slice(0, 20);

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

      const produtosPrincipais = Object.entries(produtos)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([nome, count]) => ({ nome, count }));

      // Distribuição geográfica de clientes
      const clientesPorEstado = clientesData
        .filter((c) => c.uf)
        .reduce((acc: { [key: string]: number }, cliente) => {
          const uf = cliente.uf || 'Não especificado';
          acc[uf] = (acc[uf] || 0) + 1;
          return acc;
        }, {});

      const top10Estados = Object.entries(clientesPorEstado)
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

      // 5. Criar prompt para IA
      const prompt = `
Você é um analista de inteligência de mercado experiente. Com base nos dados fornecidos, crie um relatório executivo profissional e detalhado.

**DADOS DO PROJETO:**
- Total de pesquisas: ${pesquisas.length}
- Total de clientes: ${clientesData.length}
- Total de leads: ${leadsData.length}
- Total de concorrentes: ${concorrentesData.length}
- Total de mercados: ${mercadosData.length}
- Total de entidades: ${totalEntidades}

**TOP 10 MERCADOS:**
${top10Mercados.map((m, i) => `${i + 1}. ${m.nome} (Tamanho estimado: ${m.tamanhoEstimado || 'N/A'})`).join('\n')}

**TOP 10 PRODUTOS:**
${produtosPrincipais.map((p, i) => `${i + 1}. ${p.nome} (${p.count} clientes)`).join('\n')}

**TOP 10 ESTADOS:**
${top10Estados.map((e, i) => `${i + 1}. ${e.uf}: ${e.count} clientes (${e.percentual}%)`).join('\n')}

**TOP 10 CIDADES:**
${top10Cidades.map((c, i) => `${i + 1}. ${c.cidade}: ${c.count} clientes`).join('\n')}

**GERE UM RELATÓRIO EXECUTIVO PROFISSIONAL COM AS SEGUINTES SEÇÕES:**

1. **Resumo Executivo** (2-3 parágrafos): Visão geral consolidada do projeto

2. **Análise de Mercados** (3-4 parágrafos): Análise detalhada dos mercados identificados, potencial e oportunidades

3. **Perfil de Clientes e Distribuição Geográfica** (3-4 parágrafos): Análise do perfil dos clientes e distribuição geográfica (estados e cidades)

4. **Análise de Produtos e Serviços** (2-3 parágrafos): Principais produtos/serviços identificados

5. **Análise de Leads e Oportunidades** (2 parágrafos): Potencial de leads e oportunidades de negócio

6. **Panorama Competitivo** (2-3 parágrafos): Análise dos concorrentes identificados

7. **Análise SWOT do Mercado** (2-3 parágrafos): Forças, Fraquezas, Oportunidades e Ameaças identificadas

8. **Conclusões e Recomendações Estratégicas** (3-4 parágrafos): Conclusões finais e recomendações estratégicas

**IMPORTANTE:**
- Use linguagem profissional e técnica
- Seja específico e baseado nos dados fornecidos
- Cada parágrafo deve ter 4-6 linhas
- Total esperado: 20-28 parágrafos
- Não use markdown, apenas texto puro
- Separe as seções claramente
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
        'Análise SWOT do Mercado',
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
        pdf: pdfBase64,
        filename: `relatorio-projeto-${input.projectId}-${Date.now()}.pdf`,
      };
    }),
});
