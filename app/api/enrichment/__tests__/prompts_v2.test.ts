/**
 * Testes Unitários - Sistema V2
 *
 * Testa cada prompt individualmente para garantir qualidade
 */

import {
  prompt1_enriquecerCliente,
  prompt2_identificarMercado,
  prompt3_enriquecerMercado,
  prompt2b_identificarProdutos,
  prompt4_identificarConcorrentes,
  prompt5_identificarLeads,
} from '../prompts_v2';
import type { ClienteInput, ClienteEnriquecido, Mercado, MercadoEnriquecido } from '../types';

// Mock OpenAI API key (use real key in CI/CD)
const API_KEY = process.env.OPENAI_API_KEY || 'sk-test-mock-key';

describe('Sistema V2 - Testes Unitários', () => {
  // Skip tests if no API key
  const skipIfNoApiKey = API_KEY === 'sk-test-mock-key' ? test.skip : test;

  describe('Prompt 1: Enriquecer Cliente', () => {
    skipIfNoApiKey(
      'deve preservar CNPJ original',
      async () => {
        const cliente: ClienteInput = {
          nome: 'TOTVS S.A.',
          cnpj: '53113791000122',
          produtoPrincipal: 'Software ERP',
        };

        const resultado = await prompt1_enriquecerCliente(cliente, API_KEY);

        expect(resultado.cnpj).toBe('53113791000122');
        expect(resultado.nome).toBe('TOTVS S.A.');
        expect(resultado.cidade).toBeTruthy();
        expect(resultado.uf).toBeTruthy();
        expect(resultado.setor).toBeTruthy();
        expect(resultado.descricao).toBeTruthy();
      },
      30000
    );

    skipIfNoApiKey(
      'deve retornar null para CNPJ desconhecido',
      async () => {
        const cliente: ClienteInput = {
          nome: 'Empresa Fictícia XYZ',
          produtoPrincipal: 'Produto desconhecido',
        };

        const resultado = await prompt1_enriquecerCliente(cliente, API_KEY);

        expect(resultado.cnpj).toBeNull();
        expect(resultado.cidade).toBeTruthy();
        expect(resultado.uf).toBeTruthy();
      },
      30000
    );

    skipIfNoApiKey(
      'deve preencher todos os campos obrigatórios',
      async () => {
        const cliente: ClienteInput = {
          nome: 'Magazine Luiza',
          produtoPrincipal: 'Varejo de eletrônicos',
        };

        const resultado = await prompt1_enriquecerCliente(cliente, API_KEY);

        expect(resultado.nome).toBeTruthy();
        expect(resultado.cidade).toBeTruthy();
        expect(resultado.uf).toBeTruthy();
        expect(resultado.setor).toBeTruthy();
        expect(resultado.descricao).toBeTruthy();
        // CNPJ e site podem ser null
        expect(resultado).toHaveProperty('cnpj');
        expect(resultado).toHaveProperty('site');
      },
      30000
    );
  });

  describe('Prompt 2: Identificar Mercado', () => {
    skipIfNoApiKey(
      'deve identificar mercado corretamente',
      async () => {
        const cliente: ClienteEnriquecido = {
          nome: 'TOTVS S.A.',
          cnpj: '53113791000122',
          site: 'https://www.totvs.com',
          cidade: 'São Paulo',
          uf: 'SP',
          setor: 'Tecnologia - Software',
          descricao: 'Empresa de software ERP',
        };

        const resultado = await prompt2_identificarMercado(cliente, API_KEY);

        expect(resultado.nome).toBeTruthy();
        expect(resultado.categoria).toBeTruthy();
        expect(resultado.segmentacao).toMatch(/B2B|B2C|B2B2C/);
        expect(resultado.tamanhoMercado).toBeTruthy();
      },
      30000
    );
  });

  describe('Prompt 3: Enriquecer Mercado', () => {
    skipIfNoApiKey(
      'deve retornar 5 tendências e 10 players',
      async () => {
        const mercado: Mercado = {
          nome: 'Software ERP',
          categoria: 'Tecnologia',
          segmentacao: 'B2B',
          tamanhoMercado: 'R$ 10 bilhões',
        };

        const resultado = await prompt3_enriquecerMercado(mercado, API_KEY);

        expect(resultado.tendencias).toHaveLength(5);
        expect(resultado.principaisPlayers).toHaveLength(10);
        expect(resultado.crescimentoAnual).toBeTruthy();
      },
      30000
    );
  });

  describe('Prompt 2B: Identificar Produtos', () => {
    skipIfNoApiKey(
      'deve retornar EXATAMENTE 3 produtos',
      async () => {
        const cliente: ClienteEnriquecido = {
          nome: 'TOTVS S.A.',
          cnpj: '53113791000122',
          site: 'https://www.totvs.com',
          cidade: 'São Paulo',
          uf: 'SP',
          setor: 'Tecnologia - Software',
          descricao: 'Empresa de software ERP',
        };

        const resultado = await prompt2b_identificarProdutos(cliente, API_KEY);

        expect(resultado).toHaveLength(3);
        resultado.forEach((produto) => {
          expect(produto.nome).toBeTruthy();
          expect(produto.descricao).toBeTruthy();
          expect(produto.publicoAlvo).toBeTruthy();
          expect(produto.diferenciais).toHaveLength(3);
        });
      },
      30000
    );
  });

  describe('Prompt 4: Identificar Concorrentes', () => {
    skipIfNoApiKey(
      'deve retornar EXATAMENTE 5 concorrentes',
      async () => {
        const mercado: MercadoEnriquecido = {
          nome: 'Software ERP',
          categoria: 'Tecnologia',
          segmentacao: 'B2B',
          tamanhoMercado: 'R$ 10 bilhões',
          crescimentoAnual: '10% ao ano',
          tendencias: ['Digitalização', 'IA', 'Cloud', 'Mobile', 'Analytics'],
          principaisPlayers: [
            'SAP',
            'Oracle',
            'Microsoft',
            'Salesforce',
            'Infor',
            'Sage',
            'Epicor',
            'IFS',
            'Acumatica',
            'NetSuite',
          ],
        };

        const cliente: ClienteEnriquecido = {
          nome: 'TOTVS S.A.',
          cnpj: '53113791000122',
          site: 'https://www.totvs.com',
          cidade: 'São Paulo',
          uf: 'SP',
          setor: 'Tecnologia - Software',
          descricao: 'Empresa de software ERP',
        };

        const resultado = await prompt4_identificarConcorrentes(mercado, cliente, API_KEY);

        expect(resultado).toHaveLength(5);
        resultado.forEach((concorrente) => {
          expect(concorrente.nome).toBeTruthy();
          expect(concorrente.nome).not.toBe(cliente.nome); // Não duplica cliente
          expect(concorrente.cidade).toBeTruthy();
          expect(concorrente.uf).toBeTruthy();
          expect(concorrente.produtoPrincipal).toBeTruthy();
        });
      },
      30000
    );
  });

  describe('Prompt 5: Identificar Leads (Ciclo Fechado)', () => {
    skipIfNoApiKey(
      'deve retornar EXATAMENTE 5 leads',
      async () => {
        const mercado: MercadoEnriquecido = {
          nome: 'Software ERP para Varejo',
          categoria: 'Tecnologia',
          segmentacao: 'B2B',
          tamanhoMercado: 'R$ 5 bilhões',
          crescimentoAnual: '12% ao ano',
          tendencias: ['Digitalização', 'Omnichannel', 'Mobile', 'IA', 'Analytics'],
          principaisPlayers: [
            'SAP Brasil',
            'Oracle Brasil',
            'Pão de Açúcar',
            'Magazine Luiza',
            'Riachuelo',
            'Renner',
            'C&A',
            'Lojas Americanas',
            'Casas Bahia',
            'Extra',
          ],
        };

        const cliente: ClienteEnriquecido = {
          nome: 'TOTVS S.A.',
          cnpj: '53113791000122',
          site: 'https://www.totvs.com',
          cidade: 'São Paulo',
          uf: 'SP',
          setor: 'Tecnologia - Software ERP',
          descricao: 'Empresa de software ERP para varejo',
        };

        const concorrentes = [
          {
            nome: 'SAP Brasil',
            cnpj: null,
            site: 'https://www.sap.com/brazil',
            cidade: 'São Paulo',
            uf: 'SP',
            produtoPrincipal: 'ERP',
          },
          {
            nome: 'Oracle Brasil',
            cnpj: null,
            site: 'https://www.oracle.com/br',
            cidade: 'São Paulo',
            uf: 'SP',
            produtoPrincipal: 'ERP',
          },
        ];

        const produtos = [
          {
            nome: 'TOTVS ERP',
            descricao: 'Sistema ERP completo',
            publicoAlvo: 'Varejo',
            diferenciais: ['Cloud', 'Mobile', 'BI'],
          },
        ];

        const resultado = await prompt5_identificarLeads(
          mercado,
          cliente,
          concorrentes,
          produtos,
          API_KEY
        );

        expect(resultado).toHaveLength(5);

        // Verificar que não duplica cliente
        resultado.forEach((lead) => {
          expect(lead.nome).not.toBe(cliente.nome);
          expect(lead.cidade).toBeTruthy();
          expect(lead.uf).toBeTruthy();
          expect(lead.produtoInteresse).toBeTruthy();
          expect(lead.fonte).toMatch(/PLAYER_DO_MERCADO|PESQUISA_ADICIONAL/);
        });

        // Verificar que não duplica concorrentes
        const concorrentesNomes = concorrentes.map((c) => c.nome);
        resultado.forEach((lead) => {
          expect(concorrentesNomes).not.toContain(lead.nome);
        });

        // Verificar aproveitamento de players (deve ter pelo menos 1 de players)
        const leadsDePlayersCount = resultado.filter((l) => l.fonte === 'PLAYER_DO_MERCADO').length;
        expect(leadsDePlayersCount).toBeGreaterThan(0);

        console.log(
          `[Test] Ciclo fechado: ${leadsDePlayersCount}/5 leads de players (${Math.round((leadsDePlayersCount / 5) * 100)}%)`
        );
      },
      30000
    );
  });

  describe('Integração: Fluxo Completo', () => {
    skipIfNoApiKey(
      'deve executar fluxo completo sem erros',
      async () => {
        // 1. Enriquecer cliente
        const clienteInput: ClienteInput = {
          nome: 'Ambev',
          produtoPrincipal: 'Bebidas',
        };

        const cliente = await prompt1_enriquecerCliente(clienteInput, API_KEY);
        expect(cliente).toBeTruthy();

        // 2. Identificar mercado
        const mercado = await prompt2_identificarMercado(cliente, API_KEY);
        expect(mercado).toBeTruthy();

        // 3. Enriquecer mercado
        const mercadoEnriquecido = await prompt3_enriquecerMercado(mercado, API_KEY);
        expect(mercadoEnriquecido.tendencias).toHaveLength(5);
        expect(mercadoEnriquecido.principaisPlayers).toHaveLength(10);

        // 4. Identificar produtos
        const produtos = await prompt2b_identificarProdutos(cliente, API_KEY);
        expect(produtos).toHaveLength(3);

        // 5. Identificar concorrentes
        const concorrentes = await prompt4_identificarConcorrentes(
          mercadoEnriquecido,
          cliente,
          API_KEY
        );
        expect(concorrentes).toHaveLength(5);

        // 6. Identificar leads
        const leads = await prompt5_identificarLeads(
          mercadoEnriquecido,
          cliente,
          concorrentes,
          produtos,
          API_KEY
        );
        expect(leads).toHaveLength(5);

        console.log('[Test] ✅ Fluxo completo executado com sucesso!');
      },
      120000
    ); // 2 minutos timeout
  });
});
