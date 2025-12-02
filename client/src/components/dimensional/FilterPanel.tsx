/**
 * FilterPanel - Painel de filtros
 * 100% Funcional
 */

import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { Filtro } from '@/shared/types/dimensional';

// ============================================================================
// FILTER PANEL
// ============================================================================

interface FilterPanelProps {
  filtros: Filtro[];
  onRemoverFiltro: (index: number) => void;
  onLimparTodos: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function FilterPanel({
  filtros,
  onRemoverFiltro,
  onLimparTodos,
  children,
  className
}: FilterPanelProps) {
  const [aberto, setAberto] = useState(true);

  return (
    <div className={`border rounded-lg ${className || ''}`}>
      <Collapsible open={aberto} onOpenChange={setAberto}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Filtros</h3>
            {filtros.length > 0 && (
              <Badge variant="secondary">{filtros.length}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {filtros.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLimparTodos}
              >
                Limpar todos
              </Button>
            )}
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon">
                {aberto ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent>
          {filtros.length > 0 && (
            <>
              <Separator />
              <div className="p-4 space-y-2">
                <p className="text-sm text-muted-foreground mb-2">
                  Filtros ativos:
                </p>
                <div className="flex flex-wrap gap-2">
                  {filtros.map((filtro, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      <span>{filtro.label || `${filtro.campo} ${filtro.operador} ${filtro.valor}`}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => onRemoverFiltro(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {children && (
            <>
              <Separator />
              <div className="p-4">
                {children}
              </div>
            </>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// ============================================================================
// FILTER GROUP
// ============================================================================

interface FilterGroupProps {
  titulo: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function FilterGroup({
  titulo,
  children,
  defaultOpen = true,
  className
}: FilterGroupProps) {
  const [aberto, setAberto] = useState(defaultOpen);

  return (
    <Collapsible
      open={aberto}
      onOpenChange={setAberto}
      className={className}
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-2 h-auto"
        >
          <span className="font-medium text-sm">{titulo}</span>
          {aberto ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============================================================================
// FILTER SUMMARY
// ============================================================================

interface FilterSummaryProps {
  totalRegistros: number;
  registrosFiltrados: number;
  tempoExecucao?: number;
  className?: string;
}

export function FilterSummary({
  totalRegistros,
  registrosFiltrados,
  tempoExecucao,
  className
}: FilterSummaryProps) {
  const percentual = totalRegistros > 0
    ? ((registrosFiltrados / totalRegistros) * 100).toFixed(1)
    : 0;

  return (
    <div className={`bg-muted rounded-lg p-3 text-sm ${className || ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Resultados:</span>
        <span className="font-medium">
          {registrosFiltrados.toLocaleString('pt-BR')} de {totalRegistros.toLocaleString('pt-BR')}
          <span className="text-muted-foreground ml-1">({percentual}%)</span>
        </span>
      </div>
      {tempoExecucao !== undefined && (
        <div className="flex items-center justify-between mt-1">
          <span className="text-muted-foreground">Tempo:</span>
          <span className="font-medium">{tempoExecucao.toFixed(2)}s</span>
        </div>
      )}
    </div>
  );
}
