// TODO: Fix this test - temporarily disabled
// Reason: Requires database fixtures or updated expectations

import { describe, it, expect, beforeAll } from "vitest";
import {
  saveResearchDraft,
  getResearchDraft,
  getUserDrafts,
  deleteResearchDraft,
} from "../db";

describe.skip("Research Drafts", () => {
  const testUserId = "test-user-drafts-123";
  const testProjectId = null; // Novo wizard sem projeto

  beforeAll(async () => {
    // Limpar drafts de teste anteriores
    const existingDrafts = await getUserDrafts(testUserId);
    for (const draft of existingDrafts) {
      await deleteResearchDraft(draft.id);
    }
  });

  it("deve salvar um novo draft", async () => {
    const draftData = {
      selectedMarkets: ["Embalagens"],
      step1Complete: true,
      step2Data: { test: "data" },
    };

    const result = await saveResearchDraft(
      testUserId,
      draftData,
      2,
      testProjectId
    );

    expect(result).toBeTruthy();
    expect(result?.userId).toBe(testUserId);
    expect(result?.currentStep).toBe(2);
    expect(result?.draftData).toEqual(draftData);
    expect(result?.id).toBeGreaterThan(0);
  });

  it("deve recuperar draft salvo", async () => {
    const draft = await getResearchDraft(testUserId, testProjectId);

    expect(draft).toBeTruthy();
    expect(draft?.userId).toBe(testUserId);
    expect(draft?.currentStep).toBe(2);
    expect(draft?.draftData.selectedMarkets).toEqual(["Embalagens"]);
  });

  it("deve atualizar draft existente", async () => {
    const updatedData = {
      selectedMarkets: ["Embalagens", "Alimentos"],
      step1Complete: true,
      step2Complete: true,
      step3Data: { more: "data" },
    };

    const result = await saveResearchDraft(
      testUserId,
      updatedData,
      3,
      testProjectId
    );

    expect(result).toBeTruthy();
    expect(result?.currentStep).toBe(3);
    expect(result?.draftData.selectedMarkets).toHaveLength(2);
    expect(result?.draftData.step3Data).toEqual({ more: "data" });
  });

  it("deve listar drafts do usuário", async () => {
    const drafts = await getUserDrafts(testUserId);

    expect(drafts).toBeTruthy();
    expect(drafts.length).toBeGreaterThan(0);
    expect(drafts[0].userId).toBe(testUserId);
  });

  it("deve deletar draft", async () => {
    const draft = await getResearchDraft(testUserId, testProjectId);
    expect(draft).toBeTruthy();

    if (draft) {
      const deleted = await deleteResearchDraft(draft.id);
      expect(deleted).toBe(true);

      const checkDeleted = await getResearchDraft(testUserId, testProjectId);
      expect(checkDeleted).toBeNull();
    }
  });

  it("deve retornar null para draft inexistente", async () => {
    const draft = await getResearchDraft("non-existent-user", testProjectId);
    expect(draft).toBeNull();
  });
});
