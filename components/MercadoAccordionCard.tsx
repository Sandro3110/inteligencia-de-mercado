'use client';

/**
 * MercadoAccordionCard - Card Acordeão de Mercado
 * Exibe mercado com abas de clientes, concorrentes e leads
 * Suporta busca, seleção, validação em lote e exportação
 */

import { useState, useMemo, useCallback } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { EntityTagPicker } from '@/components/EntityTagPicker';
import { DetailPopup } from '@/components/DetailPopup';
import { calculateQualityScore, classifyQuality } from '@shared/qualityScore';
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Users,
  Target,
  Building2,
  Search,
  X,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  ExportData,
} from '@/lib/exportUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { LucideIcon } from 'lucide-react';

// ============================================================================
// CONSTANTS
// ============================================================================

const ENTITY_TYPES = {
  CLIENTE: 'cliente',
  CONCORRENTE: 'concorrente',
  LEAD: 'lead',
} as const;

const TAB_VALUES = {
  CLIENTES: 'clientes',
  CONCORRENTES: 'concorrentes',
  LEADS: 'leads',
} as const;

const VALIDATION_STATUS = {
  RICH: 'rich',
  NEEDS_ADJUSTMENT: 'needs_adjustment',
  DISCARDED: 'discarded',
  PENDING: 'pending',
} as const;

const EXPORT_FORMATS = {
  CSV: 'csv',
  EXCEL: 'excel',
  PDF: 'pdf',
} as const;

const LABELS = {
  SEARCH_PLACEHOLDER: 'Buscar neste mercado...',
  NO_RESULTS: (query: string) => `Nenhum resultado para "${query}"`,
  NO_CLIENTES: 'Nenhum cliente encontrado',
  NO_CONCORRENTES: 'Nenhum concorrente encontrado',
  NO_LEADS: 'Nenhum lead encontrado',
  SELECT_ALL: 'Selecionar todos',
  SELECTED_COUNT: (count: number) => `${count} selecionados`,
  VALIDATE_BUTTON: (count: number) => `Validar (${count})`,
  EXPORT_BUTTON: (count: number) => `Exportar (${count})`,
  EXPORT_TAB: 'Exportar Aba',
  BATCH_VALIDATION_NOTE: (status: string) => `Validação em lote: ${status}`,
  SUCCESS_VALIDATION: (count: number) => `${count} itens validados com sucesso!`,
  ERROR_VALIDATION: 'Erro ao validar itens em lote',
  ERROR_NO_SELECTION: 'Nenhum item selecionado',
  SUCCESS_EXPORT: (format: string) =>
    `Exportado com sucesso em formato ${format.toUpperCase()}!`,
  ERROR_EXPORT: 'Erro ao exportar dados',
  LOADING_SPINNER: '⏳',
} as const;

const TAB_LABELS = {
  CLIENTES: 'Clientes',
  CONCORRENTES: 'Concorrentes',
  LEADS: 'Leads',
} as const;

const TAB_ICONS: Record<TabValue, LucideIcon> = {
  [TAB_VALUES.CLIENTES]: Users,
  [TAB_VALUES.CONCORRENTES]: Building2,
  [TAB_VALUES.LEADS]: Target,
} as const;

const EXPORT_HEADERS = {
  CLIENTES: [
    'ID',
    'Empresa',
    'CNPJ',
    'Produto',
    'Segmentação',
    'Cidade',
    'UF',
    'Qualidade (%)',
    'Status',
  ],
  CONCORRENTES: [
    'ID',
    'Nome',
    'CNPJ',
    'Produto',
    'Porte',
    'Qualidade (%)',
    'Status',
  ],
  LEADS: [
    'ID',
    'Nome',
    'CNPJ',
    'Tipo',
    'Porte',
    'Região',
    'Qualidade (%)',
    'Status',
  ],
} as const;

const CSS_CLASSES = {
  CARD_BORDER: 'border border-border/40 rounded-lg mb-2',
  TRIGGER:
    'px-4 py-3 hover:bg-muted/50 rounded-t-lg [&[data-state=open]]:bg-muted/70 transition-colors',
  ENTITY_CARD:
    'flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:bg-muted/50 group transition-colors',
  ENTITY_TITLE: 'text-sm font-medium group-hover:text-primary transition-colors',
  BADGE_SMALL: 'text-[10px] px-1.5 py-0',
  BADGE_OUTLINE: 'text-[11px] px-2 py-0.5',
  SEARCH_INPUT: 'pl-9 pr-9 h-9 text-sm',
  CLEAR_BUTTON: 'absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0',
  ICON_SMALL: 'w-3 h-3',
  ICON_MEDIUM: 'w-4 h-4',
  TABS_GRID: 'grid grid-cols-3 flex-1',
  BATCH_BUTTON: 'h-7 px-2 text-xs',
  EMPTY_STATE: 'text-sm text-muted-foreground text-center py-4',
} as const;

// ============================================================================
// TYPES
// ============================================================================

type ValidationStatus = 'rich' | 'needs_adjustment' | 'discarded' | 'pending' | null;
type EntityType = 'cliente' | 'concorrente' | 'lead';
type TabValue = 'clientes' | 'concorrentes' | 'leads';
type ExportFormat = 'csv' | 'excel' | 'pdf';

interface BaseEntity {
  id: number;
  validationStatus: ValidationStatus;
}

interface Cliente extends BaseEntity {
  empresa: string;
  cnpj?: string;
  produtoPrincipal?: string;
  segmentacaoB2bB2c?: string;
  cidade?: string;
  uf?: string;
}

interface Concorrente extends BaseEntity {
  nome: string;
  cnpj?: string;
  produto?: string;
  porte?: string;
  cidade?: string;
}

interface Lead extends BaseEntity {
  nome: string;
  cnpj?: string;
  tipo?: string;
  porte?: string;
  regiao?: string;
  setor?: string;
}

interface Mercado {
  id: number;
  nome: string;
  segmentacao: string;
}

interface MercadoAccordionCardProps {
  mercado: Mercado;
  selectedProjectId: number | null;
  isSelected?: boolean;
  onToggleSelection?: (mercadoId: number) => void;
}

interface EntityCardProps<T extends BaseEntity> {
  entity: T;
  entityType: EntityType;
  isSelected: boolean;
  onToggleSelection: (id: number) => void;
  onOpenDetail: (entity: T, type: EntityType) => void;
  renderContent: (entity: T) => React.ReactNode;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function filterBySearchQuery<T extends Record<string, unknown>>(
  items: T[],
  query: string,
  fields: (keyof T)[]
): T[] {
  if (!query.trim()) return items;
  const lowerQuery = query.toLowerCase();
  return items.filter((item) =>
    fields.some((field) => {
      const value = item[field];
      return typeof value === 'string' && value.toLowerCase().includes(lowerQuery);
    })
  );
}

function getStatusIcon(status: ValidationStatus): React.ReactNode {
  if (status === VALIDATION_STATUS.RICH)
    return <CheckCircle2 className={`${CSS_CLASSES.ICON_MEDIUM} text-green-500`} />;
  if (status === VALIDATION_STATUS.NEEDS_ADJUSTMENT)
    return <AlertCircle className={`${CSS_CLASSES.ICON_MEDIUM} text-yellow-500`} />;
  if (status === VALIDATION_STATUS.DISCARDED)
    return <XCircle className={`${CSS_CLASSES.ICON_MEDIUM} text-red-500`} />;
  return <Clock className={`${CSS_CLASSES.ICON_MEDIUM} text-muted-foreground`} />;
}

function formatTimestamp(): string {
  return new Date().toISOString().slice(0, 19).replace(/:/g, '-');
}

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function createExportFilename(
  mercadoNome: string,
  entityType: string,
  timestamp: string
): string {
  return `${mercadoNome}_${entityType}_${timestamp}`;
}

function mapClienteToExportRow(cliente: Cliente): (string | number)[] {
  const qualityScore = calculateQualityScore(cliente);
  return [
    cliente.id,
    `"${cliente.empresa || ''}"`,
    cliente.cnpj || '',
    `"${cliente.produtoPrincipal || ''}"`,
    cliente.segmentacaoB2bB2c || '',
    cliente.cidade || '',
    cliente.uf || '',
    qualityScore,
    cliente.validationStatus || VALIDATION_STATUS.PENDING,
  ];
}

function mapConcorrenteToExportRow(concorrente: Concorrente): (string | number)[] {
  const qualityScore = calculateQualityScore(concorrente);
  return [
    concorrente.id,
    `"${concorrente.nome || ''}"`,
    concorrente.cnpj || '',
    `"${concorrente.produto || ''}"`,
    concorrente.porte || '',
    qualityScore,
    concorrente.validationStatus || VALIDATION_STATUS.PENDING,
  ];
}

function mapLeadToExportRow(lead: Lead): (string | number)[] {
  const qualityScore = calculateQualityScore(lead);
  return [
    lead.id,
    `"${lead.nome || ''}"`,
    lead.cnpj || '',
    lead.tipo || '',
    lead.porte || '',
    lead.regiao || '',
    qualityScore,
    lead.validationStatus || VALIDATION_STATUS.PENDING,
  ];
}

// ============================================================================
// COMPONENT
// ============================================================================

export function MercadoAccordionCard({
  mercado,
  selectedProjectId,
  isSelected = false,
  onToggleSelection,
}: MercadoAccordionCardProps) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [detailPopupOpen, setDetailPopupOpen] = useState(false);
  const [detailPopupItem, setDetailPopupItem] = useState<
    Cliente | Concorrente | Lead | null
  >(null);
  const [detailPopupType, setDetailPopupType] = useState<EntityType>(
    ENTITY_TYPES.CLIENTE
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [currentTab, setCurrentTab] = useState<TabValue>(TAB_VALUES.CLIENTES);

  // ============================================================================
  // QUERIES
  // ============================================================================

  const { data: clientesData } = trpc.clientes.byMercado.useQuery(
    { mercadoId: mercado.id },
    { enabled: !!selectedProjectId }
  );

  const { data: concorrentesData } = trpc.concorrentes.byMercado.useQuery(
    { mercadoId: mercado.id },
    { enabled: !!selectedProjectId }
  );

  const { data: leadsData } = trpc.leads.byMercado.useQuery(
    { mercadoId: mercado.id },
    { enabled: !!selectedProjectId }
  );

  const clientes = (clientesData?.data as Cliente[]) || [];
  const concorrentes = (concorrentesData?.data as Concorrente[]) || [];
  const leads = (leadsData?.data as Lead[]) || [];

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const utils = trpc.useUtils();

  const batchValidateClientes = trpc.clientes.batchUpdateValidation.useMutation({
    onSuccess: () => {
      utils.clientes.byMercado.invalidate();
    },
  });

  const batchValidateConcorrentes =
    trpc.concorrentes.batchUpdateValidation.useMutation({
      onSuccess: () => {
        utils.concorrentes.byMercado.invalidate();
      },
    });

  const batchValidateLeads = trpc.leads.batchUpdateValidation.useMutation({
    onSuccess: () => {
      utils.leads.byMercado.invalidate();
    },
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredClientes = useMemo(
    () =>
      filterBySearchQuery(clientes, searchQuery, [
        'empresa',
        'cnpj',
        'produtoPrincipal',
        'cidade',
        'uf',
      ]),
    [clientes, searchQuery]
  );

  const filteredConcorrentes = useMemo(
    () =>
      filterBySearchQuery(concorrentes, searchQuery, [
        'nome',
        'cnpj',
        'produto',
        'cidade',
      ]),
    [concorrentes, searchQuery]
  );

  const filteredLeads = useMemo(
    () =>
      filterBySearchQuery(leads, searchQuery, ['nome', 'cnpj', 'setor', 'tipo']),
    [leads, searchQuery]
  );

  const currentTabItems = useMemo(() => {
    if (currentTab === TAB_VALUES.CLIENTES) return filteredClientes;
    if (currentTab === TAB_VALUES.CONCORRENTES) return filteredConcorrentes;
    return filteredLeads;
  }, [currentTab, filteredClientes, filteredConcorrentes, filteredLeads]);

  const isAllSelected = useMemo(
    () => selectedItems.size > 0 && selectedItems.size === currentTabItems.length,
    [selectedItems.size, currentTabItems.length]
  );

  const isBatchValidating = useMemo(
    () =>
      batchValidateClientes.isPending ||
      batchValidateConcorrentes.isPending ||
      batchValidateLeads.isPending,
    [
      batchValidateClientes.isPending,
      batchValidateConcorrentes.isPending,
      batchValidateLeads.isPending,
    ]
  );

  const entityCounts = useMemo(
    () => ({
      clientes: searchQuery ? filteredClientes.length : clientes.length,
      concorrentes: searchQuery ? filteredConcorrentes.length : concorrentes.length,
      leads: searchQuery ? filteredLeads.length : leads.length,
    }),
    [
      searchQuery,
      filteredClientes.length,
      filteredConcorrentes.length,
      filteredLeads.length,
      clientes.length,
      concorrentes.length,
      leads.length,
    ]
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleOpenDetail = useCallback(
    (item: Cliente | Concorrente | Lead, type: EntityType) => {
      setDetailPopupItem(item);
      setDetailPopupType(type);
      setDetailPopupOpen(true);
    },
    []
  );

  const handleCloseDetail = useCallback(() => {
    setDetailPopupOpen(false);
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(currentTabItems.map((item) => item.id)));
    }
  }, [isAllSelected, currentTabItems]);

  const toggleItemSelection = useCallback((id: number) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleTabChange = useCallback((value: string) => {
    setCurrentTab(value as TabValue);
    setSelectedItems(new Set());
  }, []);

  const handleBatchValidate = useCallback(
    async (status: 'rich' | 'needs_adjustment' | 'discarded') => {
      if (selectedItems.size === 0) {
        toast.error(LABELS.ERROR_NO_SELECTION);
        return;
      }

      const ids = Array.from(selectedItems);

      try {
        if (currentTab === TAB_VALUES.CLIENTES) {
          await batchValidateClientes.mutateAsync({
            ids,
            status,
            notes: LABELS.BATCH_VALIDATION_NOTE(status),
          });
        } else if (currentTab === TAB_VALUES.CONCORRENTES) {
          await batchValidateConcorrentes.mutateAsync({
            ids,
            status,
            notes: LABELS.BATCH_VALIDATION_NOTE(status),
          });
        } else {
          await batchValidateLeads.mutateAsync({
            ids,
            status,
            notes: LABELS.BATCH_VALIDATION_NOTE(status),
          });
        }

        toast.success(LABELS.SUCCESS_VALIDATION(ids.length));
        setSelectedItems(new Set());
      } catch (error) {
        toast.error(LABELS.ERROR_VALIDATION);
        console.error(error);
      }
    },
    [
      selectedItems,
      currentTab,
      batchValidateClientes,
      batchValidateConcorrentes,
      batchValidateLeads,
    ]
  );

  const handleExportTab = useCallback(
    (format: ExportFormat) => {
      let data: (Cliente | Concorrente | Lead)[] = [];
      let headers: string[] = [];
      let entityType = '';
      let rows: (string | number)[][] = [];

      if (currentTab === TAB_VALUES.CLIENTES) {
        data = filteredClientes;
        entityType = TAB_VALUES.CLIENTES;
        headers = EXPORT_HEADERS.CLIENTES;
        rows = filteredClientes.map(mapClienteToExportRow);
      } else if (currentTab === TAB_VALUES.CONCORRENTES) {
        data = filteredConcorrentes;
        entityType = TAB_VALUES.CONCORRENTES;
        headers = EXPORT_HEADERS.CONCORRENTES;
        rows = filteredConcorrentes.map(mapConcorrenteToExportRow);
      } else {
        data = filteredLeads;
        entityType = TAB_VALUES.LEADS;
        headers = EXPORT_HEADERS.LEADS;
        rows = filteredLeads.map(mapLeadToExportRow);
      }

      const timestamp = formatTimestamp();
      const filename = createExportFilename(mercado.nome, entityType, timestamp);

      const exportData: ExportData = {
        headers,
        rows,
        filename,
        title: `${mercado.nome} - ${capitalizeFirstLetter(entityType)}`,
        metadata: {
          'Data de Geração': new Date().toLocaleString('pt-BR'),
          Mercado: mercado.nome,
          'Total de Registros': `${data.length}`,
        },
      };

      try {
        if (format === EXPORT_FORMATS.CSV) {
          exportToCSV(exportData);
        } else if (format === EXPORT_FORMATS.EXCEL) {
          exportToExcel(exportData);
        } else if (format === EXPORT_FORMATS.PDF) {
          exportToPDF(exportData);
        }
        toast.success(LABELS.SUCCESS_EXPORT(format));
      } catch (error) {
        toast.error(LABELS.ERROR_EXPORT);
      }
    },
    [
      currentTab,
      filteredClientes,
      filteredConcorrentes,
      filteredLeads,
      mercado.nome,
    ]
  );

  const handleToggleMercadoSelection = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onToggleSelection) {
        onToggleSelection(mercado.id);
      }
    },
    [onToggleSelection, mercado.id]
  );

  const handleCheckboxChange = useCallback(() => {
    if (onToggleSelection) {
      onToggleSelection(mercado.id);
    }
  }, [onToggleSelection, mercado.id]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderQualityBadge = useCallback((entity: BaseEntity) => {
    const score = calculateQualityScore(entity);
    const quality = classifyQuality(score);
    return (
      <Badge
        variant={quality.variant}
        className={`${CSS_CLASSES.BADGE_SMALL} ${quality.color}`}
      >
        {score}%
      </Badge>
    );
  }, []);

  const renderClienteContent = useCallback(
    (cliente: Cliente) => (
      <>
        <div className="flex items-center gap-2">
          {getStatusIcon(cliente.validationStatus)}
          <h4 className={CSS_CLASSES.ENTITY_TITLE}>{cliente.empresa}</h4>
          <Badge variant="outline" className={CSS_CLASSES.BADGE_SMALL}>
            {cliente.segmentacaoB2bB2c}
          </Badge>
          {renderQualityBadge(cliente)}
        </div>
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {cliente.produtoPrincipal}
        </p>
        <p className="text-xs text-muted-foreground">
          {cliente.cidade}, {cliente.uf}
        </p>
      </>
    ),
    [renderQualityBadge]
  );

  const renderConcorrenteContent = useCallback(
    (concorrente: Concorrente) => (
      <>
        <div className="flex items-center gap-2">
          {getStatusIcon(concorrente.validationStatus)}
          <h4 className={CSS_CLASSES.ENTITY_TITLE}>{concorrente.nome}</h4>
          <Badge variant="outline" className={CSS_CLASSES.BADGE_SMALL}>
            {concorrente.porte}
          </Badge>
          {renderQualityBadge(concorrente)}
        </div>
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {concorrente.produto}
        </p>
      </>
    ),
    [renderQualityBadge]
  );

  const renderLeadContent = useCallback(
    (lead: Lead) => (
      <>
        <div className="flex items-center gap-2">
          {getStatusIcon(lead.validationStatus)}
          <h4 className={CSS_CLASSES.ENTITY_TITLE}>{lead.nome}</h4>
          <Badge variant="outline" className={CSS_CLASSES.BADGE_SMALL}>
            {lead.tipo}
          </Badge>
          {renderQualityBadge(lead)}
        </div>
        <p className="text-xs text-muted-foreground mt-1 truncate">{lead.setor}</p>
      </>
    ),
    [renderQualityBadge]
  );

  const renderEntityCard = useCallback(
    <T extends BaseEntity>(
      entity: T,
      entityType: EntityType,
      renderContent: (entity: T) => React.ReactNode
    ) => (
      <div key={entity.id} className={CSS_CLASSES.ENTITY_CARD}>
        <Checkbox
          checked={selectedItems.has(entity.id)}
          onCheckedChange={() => toggleItemSelection(entity.id)}
          onClick={(e) => e.stopPropagation()}
        />
        <div
          className="flex-1 cursor-pointer"
          onClick={() => handleOpenDetail(entity, entityType)}
        >
          {renderContent(entity)}
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <EntityTagPicker entityType={entityType} entityId={entity.id} />
        </div>
      </div>
    ),
    [selectedItems, toggleItemSelection, handleOpenDetail]
  );

  const renderEmptyState = useCallback((message: string) => (
    <p className={CSS_CLASSES.EMPTY_STATE}>{message}</p>
  ), []);

  const renderTabContent = useCallback(
    <T extends BaseEntity>(
      items: T[],
      entityType: EntityType,
      renderContent: (entity: T) => React.ReactNode,
      emptyMessage: string
    ) => {
      if (searchQuery && items.length === 0) {
        return renderEmptyState(LABELS.NO_RESULTS(searchQuery));
      }
      if (items.length === 0) {
        return renderEmptyState(emptyMessage);
      }
      return items.map((item) => renderEntityCard(item, entityType, renderContent));
    },
    [searchQuery, renderEmptyState, renderEntityCard]
  );

  const renderTabTrigger = useCallback(
    (value: TabValue, label: string, count: number) => {
      const Icon = TAB_ICONS[value];
      return (
        <TabsTrigger value={value} className="text-sm">
          <Icon className={`${CSS_CLASSES.ICON_MEDIUM} mr-2`} />
          {label} ({count})
        </TabsTrigger>
      );
    },
    []
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <Accordion type="multiple" className="w-full">
        <AccordionItem value={`mercado-${mercado.id}`} className={CSS_CLASSES.CARD_BORDER}>
          <AccordionTrigger className={CSS_CLASSES.TRIGGER}>
            <div className="flex items-center gap-3 w-full">
              {/* Checkbox para seleção de comparação */}
              {onToggleSelection && (
                <div onClick={handleToggleMercadoSelection}>
                  <Checkbox checked={isSelected} onCheckedChange={handleCheckboxChange} />
                </div>
              )}
              <div className="flex-1 text-left">
                <h3 className="text-base font-semibold line-clamp-1">{mercado.nome}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={CSS_CLASSES.BADGE_OUTLINE}>
                    {mercado.segmentacao}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {entityCounts.clientes} clientes • {entityCounts.concorrentes}{' '}
                    concorrentes • {entityCounts.leads} leads
                  </span>
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <EntityTagPicker entityType="mercado" entityId={mercado.id} />
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-4 pb-4 pt-2">
            {/* Campo de Busca Interna */}
            <div className="mb-3 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={LABELS.SEARCH_PLACEHOLDER}
                value={searchQuery}
                onChange={handleSearchChange}
                className={CSS_CLASSES.SEARCH_INPUT}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={CSS_CLASSES.CLEAR_BUTTON}
                  onClick={handleClearSearch}
                >
                  <X className={CSS_CLASSES.ICON_SMALL} />
                </Button>
              )}
            </div>

            <Tabs
              defaultValue={TAB_VALUES.CLIENTES}
              className="w-full"
              onValueChange={handleTabChange}
            >
              <div className="flex items-center justify-between mb-2">
                <TabsList className={CSS_CLASSES.TABS_GRID}>
                  {renderTabTrigger(
                    TAB_VALUES.CLIENTES,
                    TAB_LABELS.CLIENTES,
                    entityCounts.clientes
                  )}
                  {renderTabTrigger(
                    TAB_VALUES.CONCORRENTES,
                    TAB_LABELS.CONCORRENTES,
                    entityCounts.concorrentes
                  )}
                  {renderTabTrigger(
                    TAB_VALUES.LEADS,
                    TAB_LABELS.LEADS,
                    entityCounts.leads
                  )}
                </TabsList>

                {/* Ações em Lote */}
                <div className="flex items-center gap-2 ml-4">
                  <Checkbox checked={isAllSelected} onCheckedChange={toggleSelectAll} />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {selectedItems.size > 0
                      ? LABELS.SELECTED_COUNT(selectedItems.size)
                      : LABELS.SELECT_ALL}
                  </span>

                  {selectedItems.size > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBatchValidate(VALIDATION_STATUS.RICH)}
                      disabled={isBatchValidating}
                      className={CSS_CLASSES.BATCH_BUTTON}
                    >
                      {isBatchValidating ? (
                        <span className="animate-spin mr-1">{LABELS.LOADING_SPINNER}</span>
                      ) : (
                        <CheckCircle2 className={`${CSS_CLASSES.ICON_SMALL} mr-1`} />
                      )}
                      {LABELS.VALIDATE_BUTTON(selectedItems.size)}
                    </Button>
                  )}

                  {/* Botão Exportar */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className={CSS_CLASSES.BATCH_BUTTON}>
                        <Download className={`${CSS_CLASSES.ICON_SMALL} mr-1`} />
                        {selectedItems.size > 0
                          ? LABELS.EXPORT_BUTTON(selectedItems.size)
                          : LABELS.EXPORT_TAB}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleExportTab(EXPORT_FORMATS.CSV)}>
                        CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExportTab(EXPORT_FORMATS.EXCEL)}>
                        Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExportTab(EXPORT_FORMATS.PDF)}>
                        PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Aba de Clientes */}
              <TabsContent value={TAB_VALUES.CLIENTES} className="mt-4 space-y-2">
                {renderTabContent(
                  filteredClientes,
                  ENTITY_TYPES.CLIENTE,
                  renderClienteContent,
                  LABELS.NO_CLIENTES
                )}
              </TabsContent>

              {/* Aba de Concorrentes */}
              <TabsContent value={TAB_VALUES.CONCORRENTES} className="mt-4 space-y-2">
                {renderTabContent(
                  filteredConcorrentes,
                  ENTITY_TYPES.CONCORRENTE,
                  renderConcorrenteContent,
                  LABELS.NO_CONCORRENTES
                )}
              </TabsContent>

              {/* Aba de Leads */}
              <TabsContent value={TAB_VALUES.LEADS} className="mt-4 space-y-2">
                {renderTabContent(
                  filteredLeads,
                  ENTITY_TYPES.LEAD,
                  renderLeadContent,
                  LABELS.NO_LEADS
                )}
              </TabsContent>
            </Tabs>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Modal de Detalhes */}
      <DetailPopup
        isOpen={detailPopupOpen}
        onClose={handleCloseDetail}
        item={detailPopupItem}
        type={detailPopupType}
      />
    </>
  );
}
