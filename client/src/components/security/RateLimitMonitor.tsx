import { Activity, AlertTriangle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRateLimits } from '@/hooks/useRateLimits';

export function RateLimitMonitor() {
  const { proximosLimite, loading } = useRateLimits();

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (proximosLimite.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Activity className="h-12 w-12 mx-auto mb-2 text-green-500" />
        <p>Todos os usuários dentro dos limites</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {proximosLimite.map((limite, idx) => (
        <div key={idx} className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="font-medium">{limite.user_id}</span>
            </div>
            <Badge variant="outline">{limite.endpoint}</Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Chamadas: {limite.chamadas}/10</span>
              <span className="text-orange-600 font-medium">
                Restam: {limite.chamadas_restantes}
              </span>
            </div>
            <Progress value={(limite.chamadas / 10) * 100} className="h-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
