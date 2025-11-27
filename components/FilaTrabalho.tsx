'use client';

import { useCallback, useMemo } from 'react';
import { X, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// ============================================================================
// CONSTANTS
// ============================================================================

const ENTITY_TYPES = {
  CLIENTE: 'cliente',
  CONCORRENTE: 'concorrente',
  LEAD: 'lead',
} as const;

const TYPE_LABELS: Record<string, string> = {
  [ENTITY_TYPES.CLIENTE]: 'Cliente',
  [ENTITY_TYPES.CONCORRENTE]: 'Concorrente',
  [ENTITY_TYPES.LEAD]: 'Lead',
};

const TYPE_BADGE_COLORS: Record<string, string> = {
  [ENTITY_TYPES.CLIENTE]: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  [ENTITY_TYPES.CONCORRENTE]:
    'bg-orange-500/10 text-orange-600 border-orange-500/20',
  [ENTITY_TYPES.LEAD]: 'bg-green-500/10 text-green-600 border-green-500/20',
};

const DEFAULT_BADGE_COLOR = 'bg-gray-500/10 text-gray-600 border-gray-500/20';

const LABELS = {
  TITLE: 'Fila de Trabalho',
  ITEM_COUNT: (count: number) => `${count} ${count === 1 ? 'item' : 'itens'}`,
  EMPTY_TITLE: 'Nenhum item na fila',
  EMPTY_DESCRIPTION: 'Selecione itens para validar em lote',
  VALIDATE_ALL: 'Validar Todos como Rico',
  DISCARD_ALL: 'Descartar Todos',
  CLEAR_QUEUE: 'Limpar Fila',
} as const;

const ICON_SIZES = {
  LARGE: 'h-12 w-12',
  MEDIUM: 'h-5 w-5',
  SMALL: 'h-4 w-4',
  TINY: 'h-8 w-8',
} as const;

const DIMENSIONS = {
  PANEL_WIDTH: 'w-full md:w-96',
  CONTENT_HEIGHT: 'h-[calc(100%-140px)]',
} as const;

const ANIMATION_CLASSES = {
  OVERLAY: 'animate-in fade-in duration-200',
  PANEL: 'animate-in slide-in-from-right duration-300',
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface SelectedItem {
  id: number;
  type: 'cliente' | 'concorrente' | 'lead';
  mercadoId: number;
  mercadoNome: string;
  nome: string;
  status: string;
}

interface FilaTrabalhoProps {
  isOpen: boolean;
  onClose: () => void;
  items: SelectedItem[];
  onRemoveItem: (id: number, type: string) => void;
  onClearAll: () => void;
  onValidateAll: () => void;
  onDiscardAll: () => void;
}

type ItemsByMercado = Record<string, SelectedItem[]>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getTypeLabel(type: string): string {
  return TYPE_LABELS[type] || type;
}

function getTypeBadgeColor(type: string): string {
  return TYPE_BADGE_COLORS[type] || DEFAULT_BADGE_COLOR;
}

function groupItemsByMercado(items: SelectedItem[]): ItemsByMercado {
  return items.reduce<ItemsByMercado>((acc, item) => {
    if (!acc[item.mercadoNome]) {
      acc[item.mercadoNome] = [];
    }
    acc[item.mercadoNome].push(item);
    return acc;
  }, {});
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function FilaTrabalho({
  isOpen = true,
  onClose = () => {},
  items = [],
  onRemoveItem = () => {},
  onClearAll = () => {},
  onValidateAll = () => {},
  onDiscardAll = () => {},
}: Partial<FilaTrabalhoProps> = {}) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const itemsByMercado = useMemo(
    () => groupItemsByMercado(items),
    [items]
  );

  const itemCountLabel = useMemo(
    () => LABELS.ITEM_COUNT(items.length),
    [items.length]
  );

  const isEmpty = useMemo(() => items.length === 0, [items.length]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleRemoveItem = useCallback(
    (id: number, type: string) => {
      onRemoveItem(id, type);
    },
    [onRemoveItem]
  );

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderEmptyState = useCallback(
    () => (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <Trash2
            className={`${ICON_SIZES.LARGE} text-muted-foreground mx-auto mb-4 opacity-50`}
          />
          <p className="text-sm text-muted-foreground">{LABELS.EMPTY_TITLE}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {LABELS.EMPTY_DESCRIPTION}
          </p>
        </div>
      </div>
    ),
    []
  );

  const renderItem = useCallback(
    (item: SelectedItem) => (
      <div
        key={`${item.type}-${item.id}`}
        className="p-3 rounded-lg border border-border/50 bg-card hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {item.nome}
            </p>
            <Badge
              variant="outline"
              className={`text-xs mt-1 ${getTypeBadgeColor(item.type)}`}
            >
              {getTypeLabel(item.type)}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={`shrink-0 ${ICON_SIZES.TINY}`}
            onClick={() => handleRemoveItem(item.id, item.type)}
          >
            <X className={ICON_SIZES.SMALL} />
          </Button>
        </div>
      </div>
    ),
    [handleRemoveItem]
  );

  const renderMercadoGroup = useCallback(
    (mercadoNome: string, mercadoItems: SelectedItem[]) => (
      <div key={mercadoNome}>
        <h4 className="text-sm font-semibold text-foreground mb-2">
          {mercadoNome}
        </h4>
        <div className="space-y-2">{mercadoItems.map(renderItem)}</div>
      </div>
    ),
    [renderItem]
  );

  const renderBatchActions = useCallback(
    () => (
      <div className="border-t border-border p-4 space-y-2">
        <Button className="w-full" variant="default" onClick={onValidateAll}>
          <CheckCircle2 className={`${ICON_SIZES.SMALL} mr-2`} />
          {LABELS.VALIDATE_ALL}
        </Button>
        <Button className="w-full" variant="outline" onClick={onDiscardAll}>
          <XCircle className={`${ICON_SIZES.SMALL} mr-2`} />
          {LABELS.DISCARD_ALL}
        </Button>
        <Button className="w-full" variant="ghost" onClick={onClearAll}>
          <Trash2 className={`${ICON_SIZES.SMALL} mr-2`} />
          {LABELS.CLEAR_QUEUE}
        </Button>
      </div>
    ),
    [onValidateAll, onDiscardAll, onClearAll]
  );

  const renderContent = useCallback(
    () => (
      <CardContent className={`p-0 flex flex-col ${DIMENSIONS.CONTENT_HEIGHT}`}>
        {isEmpty ? (
          renderEmptyState()
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {Object.entries(itemsByMercado).map(([mercadoNome, mercadoItems]) =>
                  renderMercadoGroup(mercadoNome, mercadoItems)
                )}
              </div>
            </ScrollArea>
            {renderBatchActions()}
          </>
        )}
      </CardContent>
    ),
    [isEmpty, itemsByMercado, renderEmptyState, renderMercadoGroup, renderBatchActions]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-40 ${ANIMATION_CLASSES.OVERLAY}`}
        onClick={onClose}
      />

      {/* Painel Lateral */}
      <div
        className={`fixed right-0 top-0 bottom-0 ${DIMENSIONS.PANEL_WIDTH} bg-background border-l border-border z-50 ${ANIMATION_CLASSES.PANEL}`}
      >
        <Card className="h-full rounded-none border-0">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="section-title">{LABELS.TITLE}</CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className={ICON_SIZES.MEDIUM} />
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-sm">
                {itemCountLabel}
              </Badge>
            </div>
          </CardHeader>

          {renderContent()}
        </Card>
      </div>
    </>
  );
}
