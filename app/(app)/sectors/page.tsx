'use client';

import { SectorDrillDownStandalone } from '@/components/drill-down';

/**
 * Página de Análise de Setores
 * Rota: /sectors
 *
 * Implementação com drill-down em 3 níveis:
 * - Nível 1: Categorias de setores
 * - Nível 2: Lista de setores
 * - Nível 3: Detalhes (clientes/leads/concorrentes)
 */
export default function SetoresPage() {
  return (
    <div className="container mx-auto py-8">
      <SectorDrillDownStandalone />
    </div>
  );
}
