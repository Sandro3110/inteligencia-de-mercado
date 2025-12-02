import { Card } from './ui/card';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

/**
 * Skeleton loader para tabelas
 * Melhora percepção de performance durante loading
 */
export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="border-b bg-muted/50 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-muted-foreground/20 rounded animate-pulse" />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div 
                  key={colIndex} 
                  className="h-4 bg-muted rounded animate-pulse"
                  style={{ 
                    animationDelay: `${(rowIndex * columns + colIndex) * 50}ms`,
                    width: colIndex === 0 ? '80%' : '100%'
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
