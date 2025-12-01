'use client';

import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface DrillDownBreadcrumbProps {
  items: BreadcrumbItem[];
  onHome?: () => void;
}

/**
 * Componente de breadcrumb para navegação drill-down
 * Mostra o caminho atual e permite voltar para níveis anteriores
 */
export function DrillDownBreadcrumb({ items, onHome }: DrillDownBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      {/* Botão Home (opcional) */}
      {onHome && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={onHome}
            className="h-8 px-2 hover:text-foreground"
          >
            <Home className="h-4 w-4" />
          </Button>
          <ChevronRight className="h-4 w-4" />
        </>
      )}

      {/* Items do breadcrumb */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isClickable = !isLast && item.onClick;

        return (
          <div key={index} className="flex items-center gap-2">
            {isClickable ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={item.onClick}
                className="h-8 px-2 hover:text-foreground"
              >
                {item.label}
              </Button>
            ) : (
              <span className={isLast ? 'font-medium text-foreground' : ''}>{item.label}</span>
            )}

            {!isLast && <ChevronRight className="h-4 w-4" />}
          </div>
        );
      })}
    </nav>
  );
}
