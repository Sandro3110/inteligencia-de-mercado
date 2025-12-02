import { Card } from './ui/card';

interface CardSkeletonProps {
  count?: number;
  variant?: 'default' | 'stat' | 'list';
}

/**
 * Skeleton loader para cards
 * Suporta diferentes variantes (default, stat, list)
 */
export function CardSkeleton({ count = 1, variant = 'default' }: CardSkeletonProps) {
  if (variant === 'stat') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-10 w-10 bg-muted rounded-lg animate-pulse" />
            </div>
            <div className="h-8 w-32 bg-muted rounded animate-pulse mb-2" />
            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
          </Card>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-muted rounded-lg animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-6">
          <div className="space-y-3">
            <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
          </div>
        </Card>
      ))}
    </div>
  );
}
