// TODO: Fix this test - temporarily disabled
// Reason: Requires API mocking or real API keys

// @ts-ignore - TODO: Fix TypeScript error
import { describe, it, expect } from "vitest";
import { testOpenAIConnection } from "../_core/openai";
import { testSerpApiConnection } from "../_core/serpApi";

describe.skip("API Credentials Validation", () => {
  it("should validate OpenAI API key", async () => {
    const isValid = await testOpenAIConnection();
    expect(isValid).toBe(true);
  }, 30000); // 30s timeout

  it("should validate SerpAPI key", async () => {
    const isValid = await testSerpApiConnection();
    expect(isValid).toBe(true);
  }, 30000); // 30s timeout
});
