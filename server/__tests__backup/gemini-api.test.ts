import { logger } from '@/lib/logger';

// TODO: Fix this test - temporarily disabled
// Reason: Requires API mocking or real API keys

// @ts-ignore - TODO: Fix TypeScript error
import { describe, it, expect } from 'vitest';

describe.skip('Gemini API Key Validation', () => {
  it('should validate Gemini API key with a simple request', async () => {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    expect(GEMINI_API_KEY).toBeDefined();
    expect(GEMINI_API_KEY).toMatch(/^AIza/);

    // Testar chamada real à API Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Responda apenas "OK"',
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Gemini Test] Error:', response.status, errorText);
      throw new Error(`Gemini API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    // @ts-ignore - TODO: Fix TypeScript error
    logger.debug('[Gemini Test] Response:', JSON.stringify(data, null, 2));

    expect(data.candidates).toBeDefined();
    expect(data.candidates.length).toBeGreaterThan(0);
  }, 30000);
});
