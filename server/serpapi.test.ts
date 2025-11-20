import { describe, it, expect } from 'vitest';

describe('SerpAPI Integration', () => {
  it('should validate SERPAPI_KEY by making a test request', async () => {
    const apiKey = process.env.SERPAPI_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe('');
    
    // Test with a simple search
    const response = await fetch(
      `https://serpapi.com/search.json?engine=google&q=test&api_key=${apiKey}`
    );
    
    expect(response.ok).toBe(true);
    const data = await response.json();
    
    // SerpAPI returns an error field if the key is invalid
    expect(data.error).toBeUndefined();
    expect(data.search_metadata).toBeDefined();
    expect(data.search_metadata.status).toBe('Success');
  }, 10000); // 10s timeout for API call
});
