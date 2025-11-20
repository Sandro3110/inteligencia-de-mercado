import { describe, it, expect } from 'vitest';

describe('OpenAI Integration', () => {
  it('should validate OPENAI_API_KEY by making a test request', async () => {
    const apiKey = process.env.OPENAI_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe('');
    
    // Test with a simple completion
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Say "test successful"' }],
        max_tokens: 10
      })
    });
    
    expect(response.ok).toBe(true);
    const data = await response.json();
    
    // OpenAI returns an error field if the key is invalid
    expect(data.error).toBeUndefined();
    expect(data.choices).toBeDefined();
    expect(data.choices.length).toBeGreaterThan(0);
    expect(data.choices[0].message.content).toBeDefined();
  }, 15000); // 15s timeout for API call
});
