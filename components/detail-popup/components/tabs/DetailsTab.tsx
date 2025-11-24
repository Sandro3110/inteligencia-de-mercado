/**
 * DetailsTab Component
 * Main details tab that orchestrates all detail sections
 */

'use client';

import { TabsContent } from '@/components/ui/tabs';
import { TABS_CONFIG, SPACING } from '../../constants';
import {
  BasicInfoSection,
  ContactSection,
  LocationSection,
  ProductsSection,
  FinancialSection,
  ValidationSection,
  QualitySection,
  MetadataSection,
} from './sections';
import type { DetailsTabProps, Cliente } from '../../types';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Tab component displaying all entity details
 * Orchestrates multiple sections based on available data
 */
export function DetailsTab({ item, type, produtos }: DetailsTabProps) {
  return (
    <TabsContent value={TABS_CONFIG.VALUES.DETAILS} className={`p-6 ${SPACING.SECTION_GAP} mt-0`}>
      <BasicInfoSection item={item} type={type} />
      <ContactSection item={item} />
      <LocationSection item={item} />
      <ProductsSection item={item} />
      {type === 'cliente' && <FinancialSection item={item as Cliente} />}
      <ValidationSection item={item} />
      <QualitySection item={item} />
      <MetadataSection item={item} />
    </TabsContent>
  );
}
