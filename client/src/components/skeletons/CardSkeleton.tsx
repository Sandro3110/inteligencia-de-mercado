import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface CardSkeletonProps {
  /** Número de cards a exibir */
  count?: number;
  /** Mostrar header no card */
  showHeader?: boolean;
  /** Altura do conteúdo */
  contentHeight?: string;
}

/**
 * Skeleton loader que imita a estrutura de um Card
 * Usado em dashboards e listagens
 */
export function CardSkeleton({ 
  count = 1, 
  showHeader = true,
  contentHeight = "h-24"
}: CardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          {showHeader && (
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48 mt-1" />
            </CardHeader>
          )}
          <CardContent className={showHeader ? "" : "pt-6"}>
            <Skeleton className={`w-full ${contentHeight}`} />
          </CardContent>
        </Card>
      ))}
    </>
  );
}
