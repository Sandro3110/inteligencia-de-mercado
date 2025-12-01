/**
 * Componentes de drill-down para análise de Produtos e Setores
 *
 * Estrutura de 3 níveis:
 * - Nível 1: Categorias (agregado)
 * - Nível 2: Itens (lista paginada)
 * - Nível 3: Detalhes (clientes/leads/concorrentes)
 */

// Componentes genéricos
export { DrillDownBreadcrumb } from './DrillDownBreadcrumb';
export { DrillDownTable } from './DrillDownTable';
export type { DrillDownColumn } from './DrillDownTable';

// Drill-down de Produtos
export { ProductDrillDown } from './ProductDrillDown';
export { ProductCategoriesView } from './ProductCategoriesView';
export { ProductsView } from './ProductsView';
export { ProductDetailsView } from './ProductDetailsView';

// Drill-down de Setores
export { SectorDrillDown } from './SectorDrillDown';
export { SectorCategoriesView } from './SectorCategoriesView';
export { SectorsView } from './SectorsView';
export { SectorDetailsView } from './SectorDetailsView';

// Componentes standalone (sem parâmetros de rota)
export { ProductDrillDownStandalone } from './ProductDrillDownStandalone';
export { SectorDrillDownStandalone } from './SectorDrillDownStandalone';
