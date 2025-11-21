/**
 * Testes para Sistema de Avisos de Falha de API (Fase 82)
 * 
 * Valida que o sistema notifica corretamente quando APIs externas falham
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Fase 82: Sistema de Avisos de Falha de API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('82.1 - Validação de Try/Catch em Chamadas de API', () => {
    it('deve ter try/catch em todas as chamadas LLM', async () => {
      const fs = await import('fs/promises');
      const content = await fs.readFile('./server/enrichmentFlow.ts', 'utf-8');
      
      // Verificar que todas as chamadas invokeLLM estão dentro de try/catch
      const invokeLLMMatches = content.match(/await invokeLLM\(/g) || [];
      const tryBlocks = content.match(/try \{[^}]*await invokeLLM\(/g) || [];
      
      expect(invokeLLMMatches.length).toBeGreaterThan(0);
      expect(tryBlocks.length).toBe(invokeLLMMatches.length);
    });

    it('deve ter try/catch na consulta ReceitaWS', async () => {
      const fs = await import('fs/promises');
      const content = await fs.readFile('./server/enrichmentFlow.ts', 'utf-8');
      
      // Verificar que consultarCNPJ está dentro de try/catch
      const consultaCNPJMatches = content.match(/await consultarCNPJ\(/g) || [];
      const tryBlocks = content.match(/try \{[^}]*await consultarCNPJ\(/g) || [];
      
      expect(consultaCNPJMatches.length).toBeGreaterThan(0);
      expect(tryBlocks.length).toBe(consultaCNPJMatches.length);
    });

    it('deve ter try/catch na busca de concorrentes (SERPAPI)', async () => {
      const fs = await import('fs/promises');
      const content = await fs.readFile('./server/enrichmentFlow.ts', 'utf-8');
      
      // Verificar que searchCompetitors está dentro de try/catch
      const searchMatches = content.match(/await searchCompetitors\(/g) || [];
      const tryBlocks = content.match(/try \{[\s\S]*?await searchCompetitors\(/g) || [];
      
      expect(searchMatches.length).toBeGreaterThan(0);
      expect(tryBlocks.length).toBe(searchMatches.length);
    });

    it('deve ter try/catch na busca de leads (SERPAPI)', async () => {
      const fs = await import('fs/promises');
      const content = await fs.readFile('./server/enrichmentFlow.ts', 'utf-8');
      
      // Verificar que searchLeads está dentro de try/catch
      const searchMatches = content.match(/await searchLeads\(/g) || [];
      const tryBlocks = content.match(/try \{[\s\S]*?await searchLeads\(/g) || [];
      
      expect(searchMatches.length).toBeGreaterThan(0);
      expect(tryBlocks.length).toBe(searchMatches.length);
    });
  });

  describe('82.2 - Sistema de Notificação de Falhas', () => {
    it('deve ter chamadas notifyOwner em todos os catch blocks de API', async () => {
      const fs = await import('fs/promises');
      const content = await fs.readFile('./server/enrichmentFlow.ts', 'utf-8');
      
      // Contar catch blocks que chamam notifyOwner
      const catchBlocks = content.match(/} catch \(error\) \{[\s\S]*?notifyOwner/g) || [];
      
      // Deve ter pelo menos 5 notificações (LLM x2, ReceitaWS, SERPAPI x2)
      expect(catchBlocks.length).toBeGreaterThanOrEqual(5);
    });

    it('deve incluir título descritivo nas notificações', async () => {
      const fs = await import('fs/promises');
      const content = await fs.readFile('./server/enrichmentFlow.ts', 'utf-8');
      
      // Verificar que todas as notificações têm título com emoji de alerta
      const notifications = content.match(/title: '⚠️[^']+'/g) || [];
      
      expect(notifications.length).toBeGreaterThanOrEqual(5);
      
      // Verificar que títulos são descritivos
      const titles = notifications.map(n => n.replace(/title: '/, '').replace(/'$/, ''));
      expect(titles.some(t => t.includes('API de IA'))).toBe(true);
      expect(titles.some(t => t.includes('ReceitaWS'))).toBe(true);
      expect(titles.some(t => t.includes('SERPAPI'))).toBe(true);
    });

    it('deve incluir mensagem detalhada com erro nas notificações', async () => {
      const fs = await import('fs/promises');
      const content = await fs.readFile('./server/enrichmentFlow.ts', 'utf-8');
      
      // Verificar que todas as notificações incluem error.message
      const notifications = content.match(/content: `[^`]*\$\{error instanceof Error \? error\.message[^`]+`/g) || [];
      
      expect(notifications.length).toBeGreaterThanOrEqual(5);
    });

    it('deve continuar processamento após falha (não throw)', async () => {
      const fs = await import('fs/promises');
      const content = await fs.readFile('./server/enrichmentFlow.ts', 'utf-8');
      
      // Verificar que catch blocks têm 'continue' ou não fazem throw
      const catchBlocks = content.match(/} catch \(error\) \{[^}]*\}/gs) || [];
      
      // Nenhum catch block deve ter 'throw error' após notifyOwner
      const throwsAfterNotify = catchBlocks.filter(block => 
        block.includes('notifyOwner') && block.includes('throw error')
      );
      
      expect(throwsAfterNotify.length).toBe(0);
    });
  });

  describe('82.3 - Logs Detalhados de Erro', () => {
    it('deve ter console.error em todos os catch blocks', async () => {
      const fs = await import('fs/promises');
      const content = await fs.readFile('./server/enrichmentFlow.ts', 'utf-8');
      
      // Verificar que todos os catch blocks têm console.error
      const catchBlocks = content.match(/} catch \(error\) \{[^}]*console\.error/gs) || [];
      
      expect(catchBlocks.length).toBeGreaterThanOrEqual(5);
    });

    it('deve incluir contexto nos logs (nome do produto/cliente/mercado)', async () => {
      const fs = await import('fs/promises');
      const content = await fs.readFile('./server/enrichmentFlow.ts', 'utf-8');
      
      // Verificar que logs incluem variáveis de contexto
      const logsWithContext = content.match(/console\.error\(`\[Enriquecimento\][^`]*\$\{[^}]+\}[^`]*`/g) || [];
      
      expect(logsWithContext.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('82.4 - Integração Completa', () => {
    it('deve validar estrutura completa de tratamento de erro', async () => {
      const fs = await import('fs/promises');
      const content = await fs.readFile('./server/enrichmentFlow.ts', 'utf-8');
      
      // Padrão esperado: try { API call } catch (error) { console.error + notifyOwner + continue }
      const completeErrorHandling = content.match(
        /try \{[\s\S]*?await (invokeLLM|consultarCNPJ|searchCompetitors|searchLeads)\([\s\S]*?\} catch \(error\) \{[\s\S]*?console\.error[\s\S]*?notifyOwner[\s\S]*?\}/g
      ) || [];
      
      expect(completeErrorHandling.length).toBeGreaterThanOrEqual(5);
    });

    it('deve ter tratamento de erro secundário para notifyOwner', async () => {
      const fs = await import('fs/promises');
      const content = await fs.readFile('./server/enrichmentFlow.ts', 'utf-8');
      
      // Verificar que chamadas notifyOwner estão dentro de try/catch
      const notifyWithTryCatch = content.match(/try \{[\s\S]*?notifyOwner[\s\S]*?\} catch \(notifyError\)/g) || [];
      
      expect(notifyWithTryCatch.length).toBeGreaterThanOrEqual(5);
    });
  });
});
