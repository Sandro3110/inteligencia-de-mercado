'use client';

import { ProductDrillDownStandalone } from '@/components/drill-down';

/**
 * Página de Análise de Produtos
 * Rota: /products
 *
 * Implementação com drill-down em 3 níveis:
 * - Nível 1: Categorias de produtos
 * - Nível 2: Lista de produtos
 * - Nível 3: Detalhes (clientes/leads/concorrentes)
 */
export default function ProdutosPage() {
  return (
    <div className="container mx-auto py-8">
      <ProductDrillDownStandalone />
    </div>
  );
}
