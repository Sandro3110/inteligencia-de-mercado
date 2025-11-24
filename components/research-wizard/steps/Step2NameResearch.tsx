'use client';

/**
 * Step2NameResearch - Nomear Pesquisa
 * Define nome e descrição da pesquisa
 */

import { useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ResearchWizardData } from '@/types/research-wizard';

// ============================================================================
// CONSTANTS
// ============================================================================

const VALIDATION = {
  MIN_NAME_LENGTH: 3,
  DESCRIPTION_ROWS: 4,
} as const;

const LABELS = {
  PAGE_TITLE: 'Nome da Pesquisa',
  PAGE_DESCRIPTION: 'Dê um nome descritivo para identificar esta pesquisa',
  FIELD_NAME: 'Nome *',
  FIELD_DESCRIPTION: 'Descrição (opcional)',
  CHAR_COUNT_MIN: 'Mínimo 3 caracteres',
  CHAR_COUNT_VALID: (count: number) => `✓ ${count} caracteres`,
  CHAR_COUNT_INVALID: (count: number) => `${count}/3 caracteres`,
} as const;

const PLACEHOLDERS = {
  NAME: 'Ex: Pesquisa de Embalagens Plásticas Q4 2025',
  DESCRIPTION: 'Descreva o objetivo e escopo desta pesquisa...',
} as const;

const COLORS = {
  NEUTRAL: 'text-muted-foreground',
  VALID: 'text-green-600 border-green-300 focus:border-green-500',
  INVALID: 'text-red-600 border-red-300 focus:border-red-500',
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface Step2Props {
  data: ResearchWizardData;
  updateData: (d: Partial<ResearchWizardData>) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isNameValid(name: string): boolean {
  return name.trim().length >= VALIDATION.MIN_NAME_LENGTH;
}

function getCharCountLabel(charCount: number): string {
  if (charCount === 0) {
    return LABELS.CHAR_COUNT_MIN;
  }
  return isNameValid(' '.repeat(charCount))
    ? LABELS.CHAR_COUNT_VALID(charCount)
    : LABELS.CHAR_COUNT_INVALID(charCount);
}

function getCharCountColor(charCount: number): string {
  if (charCount === 0) {
    return COLORS.NEUTRAL;
  }
  return isNameValid(' '.repeat(charCount)) ? COLORS.VALID.split(' ')[0] : COLORS.INVALID.split(' ')[0];
}

function getInputClasses(charCount: number): string {
  if (charCount === 0) {
    return '';
  }
  return isNameValid(' '.repeat(charCount))
    ? COLORS.VALID.split(' ').slice(1).join(' ')
    : COLORS.INVALID.split(' ').slice(1).join(' ');
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Step2NameResearch({ data, updateData }: Step2Props) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const charCount = useMemo(() => data.researchName.length, [data.researchName]);

  const isValid = useMemo(() => isNameValid(data.researchName), [data.researchName]);

  const charCountLabel = useMemo(() => getCharCountLabel(charCount), [charCount]);

  const charCountColor = useMemo(() => getCharCountColor(charCount), [charCount]);

  const inputClasses = useMemo(() => getInputClasses(charCount), [charCount]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateData({ researchName: e.target.value });
    },
    [updateData]
  );

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateData({ researchDescription: e.target.value });
    },
    [updateData]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{LABELS.PAGE_TITLE}</h2>
        <p className="text-muted-foreground">{LABELS.PAGE_DESCRIPTION}</p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>{LABELS.FIELD_NAME}</Label>
            <span className={`text-xs ${charCountColor}`}>{charCountLabel}</span>
          </div>
          <Input
            placeholder={PLACEHOLDERS.NAME}
            value={data.researchName}
            onChange={handleNameChange}
            className={`mt-2 ${inputClasses}`}
          />
        </div>

        <div>
          <Label>{LABELS.FIELD_DESCRIPTION}</Label>
          <Textarea
            placeholder={PLACEHOLDERS.DESCRIPTION}
            value={data.researchDescription}
            onChange={handleDescriptionChange}
            className="mt-2"
            rows={VALIDATION.DESCRIPTION_ROWS}
          />
        </div>
      </div>
    </div>
  );
}
