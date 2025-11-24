import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ChartSkeletonProps {
  /** Tipo de gráfico */
  type?: "bar" | "line" | "pie" | "area";
  /** Mostrar header */
  showHeader?: boolean;
  /** Altura do gráfico */
  height?: string;
}

/**
 * Skeleton loader que imita a estrutura de um gráfico
 * Usado em dashboards e analytics
 */
export function ChartSkeleton({
  type = "bar",
  showHeader = true,
  height = "h-80",
}: ChartSkeletonProps) {
  return (
    <Card className="animate-pulse">
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-64 mt-2" />
        </CardHeader>
      )}
      <CardContent className={showHeader ? "" : "pt-6"}>
        <div
          className={`w-full ${height} flex items-end justify-around gap-2 px-4 pb-4`}
        >
          {type === "bar" && (
            <>
              <Skeleton className="w-full h-3/4" />
              <Skeleton className="w-full h-full" />
              <Skeleton className="w-full h-2/3" />
              <Skeleton className="w-full h-4/5" />
              <Skeleton className="w-full h-1/2" />
              <Skeleton className="w-full h-5/6" />
            </>
          )}
          {type === "line" && (
            <div className="w-full h-full relative">
              <Skeleton className="absolute bottom-0 left-0 w-full h-1" />
              <Skeleton className="absolute bottom-1/4 left-1/4 w-1/2 h-1" />
              <Skeleton className="absolute bottom-1/2 left-1/2 w-1/3 h-1" />
            </div>
          )}
          {type === "pie" && (
            <div className="w-full h-full flex items-center justify-center">
              <Skeleton className="w-48 h-48 rounded-full" />
            </div>
          )}
          {type === "area" && (
            <div className="w-full h-full relative">
              <Skeleton className="absolute bottom-0 left-0 w-full h-2/3 opacity-30" />
              <Skeleton className="absolute bottom-2/3 left-0 w-full h-1" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
