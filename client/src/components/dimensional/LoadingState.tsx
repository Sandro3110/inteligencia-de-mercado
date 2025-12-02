/**
 * LoadingState - Estados de carregamento
 * Skeleton, Spinner, Progress
 * 100% Funcional
 */

import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

// ============================================================================
// LOADING SPINNER
// ============================================================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', text, className }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className || ''}`}>
      <Loader2 className={`${sizes[size]} animate-spin text-primary`} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

// ============================================================================
// LOADING PROGRESS
// ============================================================================

interface LoadingProgressProps {
  progress: number; // 0-100
  text?: string;
  className?: string;
}

export function LoadingProgress({ progress, text, className }: LoadingProgressProps) {
  return (
    <div className={`space-y-2 ${className || ''}`}>
      {text && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{text}</span>
          <span className="font-medium">{progress.toFixed(0)}%</span>
        </div>
      )}
      <Progress value={progress} className="h-2" />
    </div>
  );
}

// ============================================================================
// SKELETON CARD
// ============================================================================

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={`border rounded-lg p-4 space-y-3 ${className || ''}`}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

// ============================================================================
// SKELETON TABLE
// ============================================================================

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({ rows = 5, columns = 4, className }: SkeletonTableProps) {
  return (
    <div className={`space-y-2 ${className || ''}`}>
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// SKELETON KPI GRID
// ============================================================================

interface SkeletonKPIGridProps {
  count?: number;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function SkeletonKPIGrid({ count = 4, columns = 4, className }: SkeletonKPIGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid gap-4 ${gridCols[columns]} ${className || ''}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// ============================================================================
// SKELETON MAP
// ============================================================================

interface SkeletonMapProps {
  height?: string;
  className?: string;
}

export function SkeletonMap({ height = '400px', className }: SkeletonMapProps) {
  return (
    <div className={`relative ${className || ''}`} style={{ height }}>
      <Skeleton className="w-full h-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando mapa..." />
      </div>
    </div>
  );
}

// ============================================================================
// SKELETON CHART
// ============================================================================

interface SkeletonChartProps {
  height?: string;
  className?: string;
}

export function SkeletonChart({ height = '300px', className }: SkeletonChartProps) {
  return (
    <div className={`space-y-2 ${className || ''}`} style={{ height }}>
      <Skeleton className="h-4 w-1/4" />
      <div className="flex items-end gap-2 h-full">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${Math.random() * 80 + 20}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// FULL PAGE LOADING
// ============================================================================

interface FullPageLoadingProps {
  text?: string;
}

export function FullPageLoading({ text = 'Carregando...' }: FullPageLoadingProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border rounded-lg p-8 shadow-lg">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
}

// ============================================================================
// INLINE LOADING
// ============================================================================

interface InlineLoadingProps {
  text?: string;
  className?: string;
}

export function InlineLoading({ text, className }: InlineLoadingProps) {
  return (
    <div className={`flex items-center gap-2 text-muted-foreground ${className || ''}`}>
      <Loader2 className="h-4 w-4 animate-spin" />
      {text && <span className="text-sm">{text}</span>}
    </div>
  );
}

// ============================================================================
// LOADING STATE WRAPPER
// ============================================================================

export const LoadingState = {
  Spinner: LoadingSpinner,
  Progress: LoadingProgress,
  SkeletonCard,
  SkeletonTable,
  SkeletonKPIGrid,
  SkeletonMap,
  SkeletonChart,
  FullPage: FullPageLoading,
  Inline: InlineLoading,
};

export default LoadingState;
