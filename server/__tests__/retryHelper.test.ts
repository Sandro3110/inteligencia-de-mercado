/**
 * Testes para Sistema de Retry com Backoff Exponencial
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withRetry, withLLMRetry, withAPIRetry } from '../_core/retryHelper';

describe('Sistema de Retry com Backoff Exponencial', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('withRetry - Comportamento Básico', () => {
    it('deve retornar resultado na primeira tentativa se bem-sucedido', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      
      const result = await withRetry(fn);
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('deve fazer retry até maxRetries em caso de falha', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Falha 1'))
        .mockRejectedValueOnce(new Error('Falha 2'))
        .mockResolvedValue('success');
      
      const result = await withRetry(fn, { maxRetries: 3, baseDelay: 10 });
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('deve lançar erro após esgotar todas as tentativas', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Falha persistente'));
      
      await expect(
        withRetry(fn, { maxRetries: 2, baseDelay: 10 })
      ).rejects.toThrow('Falha persistente');
      
      expect(fn).toHaveBeenCalledTimes(3); // 1 inicial + 2 retries
    });

    it('deve chamar callback onRetry em cada tentativa', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Falha 1'))
        .mockResolvedValue('success');
      
      const onRetry = vi.fn();
      
      await withRetry(fn, { maxRetries: 2, baseDelay: 10, onRetry });
      
      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(
        expect.any(Error),
        1,
        expect.any(Number)
      );
    });
  });

  describe('Backoff Exponencial', () => {
    it('deve aumentar delay exponencialmente entre tentativas', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Falha 1'))
        .mockRejectedValueOnce(new Error('Falha 2'))
        .mockResolvedValue('success');
      
      const delays: number[] = [];
      const onRetry = vi.fn((_, __, delay) => delays.push(delay));
      
      await withRetry(fn, { 
        maxRetries: 3, 
        baseDelay: 100,
        onRetry 
      });
      
      // Verificar que delays aumentam (com tolerância para jitter)
      expect(delays.length).toBe(2);
      expect(delays[0]).toBeGreaterThan(100); // ~200ms (2^0 * 100 + jitter)
      expect(delays[1]).toBeGreaterThan(delays[0]); // ~400ms (2^1 * 100 + jitter)
    });

    it('deve respeitar maxDelay', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Falha 1'))
        .mockRejectedValueOnce(new Error('Falha 2'))
        .mockResolvedValue('success');
      
      const delays: number[] = [];
      const onRetry = vi.fn((_, __, delay) => delays.push(delay));
      
      await withRetry(fn, { 
        maxRetries: 3, 
        baseDelay: 1000,
        maxDelay: 500, // Limitar delay
        onRetry 
      });
      
      // Todos os delays devem ser <= maxDelay
      delays.forEach(delay => {
        expect(delay).toBeLessThanOrEqual(500);
      });
    });
  });

  describe('withLLMRetry - Wrapper para LLM', () => {
    it('deve usar configurações específicas para LLM', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Rate limit'))
        .mockResolvedValue({ choices: [{ message: { content: 'OK' } }] });
      
      const result = await withLLMRetry(fn, 'Teste LLM');
      
      expect(result).toEqual({ choices: [{ message: { content: 'OK' } }] });
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('deve fazer até 3 retries para LLM', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Timeout'));
      
      await expect(
        withLLMRetry(fn, 'Teste LLM')
      ).rejects.toThrow('Timeout');
      
      expect(fn).toHaveBeenCalledTimes(4); // 1 inicial + 3 retries
    });
  });

  describe('withAPIRetry - Wrapper para APIs Externas', () => {
    it('deve usar configurações específicas para APIs externas', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue({ data: 'OK' });
      
      const result = await withAPIRetry(fn, 'SERPAPI', 'Busca de concorrentes');
      
      expect(result).toEqual({ data: 'OK' });
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('deve fazer até 2 retries para APIs externas', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Service unavailable'));
      
      await expect(
        withAPIRetry(fn, 'ReceitaWS', 'Consulta CNPJ')
      ).rejects.toThrow('Service unavailable');
      
      expect(fn).toHaveBeenCalledTimes(3); // 1 inicial + 2 retries
    });
  });

  describe('Integração com enrichmentFlow', () => {
    it('deve validar que retry está integrado no código', async () => {
      const fs = await import('fs/promises');
      const content = await fs.readFile('./server/enrichmentFlow.ts', 'utf-8');
      
      // Verificar que withLLMRetry está sendo usado
      expect(content).toContain('withLLMRetry');
      
      // Verificar que withAPIRetry está sendo usado
      expect(content).toContain('withAPIRetry');
      
      // Contar quantas vezes retry é usado
      const llmRetryCount = (content.match(/withLLMRetry/g) || []).length;
      const apiRetryCount = (content.match(/withAPIRetry/g) || []).length;
      
      expect(llmRetryCount).toBeGreaterThanOrEqual(2); // LLM x2
      expect(apiRetryCount).toBeGreaterThanOrEqual(3); // ReceitaWS + SERPAPI x2
    });
  });
});
