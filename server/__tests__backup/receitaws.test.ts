import { logger } from '@/lib/logger';

// TODO: Fix this test - temporarily disabled
// Reason: Requires API mocking or real API keys

import { describe, it, expect } from 'vitest';

describe.skip('ReceitaWS API', () => {
  it('should validate API key with a test CNPJ', async () => {
    const apiKey = process.env.RECEITAWS_API_KEY;
    expect(apiKey).toBeDefined();

    // Testar com CNPJ da Petrobras (público)
    const testCNPJ = '33000167000101';

    const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${testCNPJ}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    expect(response.ok).toBe(true);

    const data = await response.json();
    expect(data.status).toBe('OK');
    expect(data.nome).toBeDefined();

    logger.debug('✅ ReceitaWS API validated successfully');
    logger.debug(`   Test CNPJ: ${testCNPJ}`);
    logger.debug(`   Company: ${data.nome}`);
  }, 10000);
});
