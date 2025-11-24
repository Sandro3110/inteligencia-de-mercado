/**
 * Funções temporárias de Research Drafts
 * TODO: Integrar com Drizzle ORM após resolver cache do TypeScript
 */

import { sql } from "drizzle-orm";
import { getDb } from "./db";

export interface ResearchDraft {
  id: number;
  userId: string;
  projectId: number | null;
  draftData: unknown;
  currentStep: number;
  createdAt: string;
  updatedAt: string;
}

export async function saveResearchDraft(
  userId: string,
  draftData: unknown,
  currentStep: number,
  projectId?: number | null
): Promise<ResearchDraft | null> {
  // Temporariamente desabilitado
  return null;
}

export async function getResearchDraft(
  userId: string,
  projectId?: number | null
): Promise<ResearchDraft | null> {
  // Temporariamente desabilitado
  return null;
}

export async function deleteResearchDraft(draftId: number): Promise<boolean> {
  // Temporariamente desabilitado
  return false;
}

export async function getUserDrafts(userId: string): Promise<ResearchDraft[]> {
  // Temporariamente desabilitado
  return [];
}
