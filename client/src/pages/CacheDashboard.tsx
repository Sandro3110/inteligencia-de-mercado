import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Database, Trash2, RefreshCw, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

export default function CacheDashboard() {
  const { data: stats, refetch } = trpc.cache.stats.useQuery(undefined, {
    refetchInterval: 5000, // Atualizar a cada 5s
  });

  const clearCacheMutation = trpc.cache.clear.useMutation({
    onSuccess: () => {
      toast.success('Cache limpo com sucesso!');
      refetch();
    },
    onError: () => {
      toast.error('Erro ao limpar cache');
    },
  });

  const handleClearCache = () => {
    if (confirm('Tem certeza que deseja limpar todo o cache? Isso pode afetar a performance temporariamente.')) {
      clearCacheMutation.mutate();
    }
  };

  if (!stats) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Database className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Dashboard de Cache</h1>
        </div>
        <p className="text-muted-foreground">Carregando estatísticas...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Dashboard de Cache</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearCache}
            disabled={clearCacheMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Cache
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Entradas</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} ativas, {stats.expired} expiradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Acerto</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hitRate}%</div>
            <Progress value={stats.hitRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hits</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.hits}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalRequests} requisições totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Misses</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.misses}</div>
            <p className="text-xs text-muted-foreground">
              Cache não encontrado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Cache</CardTitle>
          <CardDescription>
            Cache in-memory com TTL de 5 minutos por padrão
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Entradas Ativas</div>
              <div className="text-2xl font-bold">{stats.active}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Entradas Expiradas</div>
              <div className="text-2xl font-bold">{stats.expired}</div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Performance</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Taxa de Acerto (Hit Rate)</span>
                <Badge variant={stats.hitRate > 70 ? 'default' : 'secondary'}>
                  {stats.hitRate}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total de Requisições</span>
                <Badge variant="outline">{stats.totalRequests}</Badge>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Recomendações</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              {stats.hitRate < 50 && (
                <li>⚠️ Taxa de acerto baixa. Considere aumentar o TTL do cache.</li>
              )}
              {stats.hitRate >= 70 && (
                <li>✅ Taxa de acerto ótima! O cache está funcionando bem.</li>
              )}
              {stats.expired > stats.active && (
                <li>⚠️ Muitas entradas expiradas. Limpeza automática em andamento.</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
