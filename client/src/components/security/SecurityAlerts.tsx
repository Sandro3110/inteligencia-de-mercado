import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSecurityAlerts } from '@/hooks/useSecurityAlerts';
import { toast } from 'sonner';

export function SecurityAlerts() {
  const { alertas, loading, resolverAlerta } = useSecurityAlerts(false);

  const getSeveridadeBadge = (severidade: string) => {
    const variants = {
      critica: 'bg-red-500',
      alta: 'bg-orange-500',
      media: 'bg-yellow-500',
      baixa: 'bg-blue-500'
    };
    return <Badge className={variants[severidade as keyof typeof variants] || 'bg-gray-500'}>{severidade}</Badge>;
  };

  const handleResolver = async (id: number) => {
    const success = await resolverAlerta(id);
    if (success) {
      toast.success('Alerta resolvido');
    } else {
      toast.error('Erro ao resolver alerta');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (alertas.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
        <p>Nenhum alerta ativo</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alertas.map((alerta) => (
        <div key={alerta.id} className="flex items-start justify-between p-4 border rounded-lg">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {getSeveridadeBadge(alerta.severidade)}
                <span className="text-sm text-muted-foreground">{alerta.tipo}</span>
              </div>
              <p className="text-sm">{alerta.descricao}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Usuário: {alerta.user_id} • {new Date(alerta.created_at).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => handleResolver(alerta.id)}>
            Resolver
          </Button>
        </div>
      ))}
    </div>
  );
}
