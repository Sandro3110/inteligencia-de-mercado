/**
 * Skeleton Loading Components
 * Substituem spinners para melhor percepção de performance
 */

export function SkeletonCard() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border border-border/40 animate-pulse">
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>
      <div className="h-5 w-5 bg-muted rounded"></div>
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonMercado() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border border-border/40 animate-pulse">
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-muted rounded w-3/4"></div>
        <div className="flex items-center gap-2 mt-2">
          <div className="h-4 bg-muted rounded w-16"></div>
          <div className="h-4 bg-muted rounded w-24"></div>
        </div>
      </div>
      <div className="h-5 w-5 bg-muted rounded"></div>
    </div>
  );
}

export function SkeletonCliente() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border border-border/40 animate-pulse">
      <div className="h-5 w-5 bg-muted rounded"></div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-muted rounded-full"></div>
          <div className="h-5 bg-muted rounded w-1/2"></div>
          <div className="h-5 bg-muted rounded w-12"></div>
          <div className="h-5 bg-muted rounded w-12"></div>
        </div>
        <div className="h-4 bg-muted rounded w-3/4"></div>
      </div>
    </div>
  );
}

export function SkeletonConcorrente() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border border-border/40 animate-pulse">
      <div className="h-5 w-5 bg-muted rounded"></div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-muted rounded-full"></div>
          <div className="h-5 bg-muted rounded w-1/2"></div>
          <div className="h-5 bg-muted rounded w-16"></div>
          <div className="h-5 bg-muted rounded w-12"></div>
        </div>
        <div className="h-4 bg-muted rounded w-2/3"></div>
      </div>
    </div>
  );
}

export function SkeletonLead() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border border-border/40 animate-pulse">
      <div className="h-5 w-5 bg-muted rounded"></div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-muted rounded-full"></div>
          <div className="h-5 bg-muted rounded w-1/2"></div>
          <div className="h-5 bg-muted rounded w-16"></div>
          <div className="h-5 bg-muted rounded w-12"></div>
        </div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>
    </div>
  );
}
