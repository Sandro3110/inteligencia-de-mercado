import { UserX, Unlock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { toast } from 'sonner';

export function UserBlockManager() {
  const { bloqueados, loading, desbloquearUsuario } = useBlockedUsers();

  const handleDesbloquear = async (userId: string) => {
    const success = await desbloquearUsuario(userId);
    if (success) {
      toast.success(`Usuário ${userId} desbloqueado`);
    } else {
      toast.error('Erro ao desbloquear usuário');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (bloqueados.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Unlock className="h-12 w-12 mx-auto mb-2 text-green-500" />
        <p>Nenhum usuário bloqueado</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bloqueados.map((bloqueado) => (
        <div key={bloqueado.id} className="flex items-start justify-between p-4 border rounded-lg">
          <div className="flex items-start gap-3 flex-1">
            <UserX className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{bloqueado.user_id}</span>
                <Badge variant="destructive">Bloqueado</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{bloqueado.motivo}</p>
              <div className="text-xs text-muted-foreground mt-1">
                Bloqueado em: {new Date(bloqueado.bloqueado_em).toLocaleString('pt-BR')}
                <br />
                Expira em: {new Date(bloqueado.bloqueado_ate).toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleDesbloquear(bloqueado.user_id)}
          >
            Desbloquear
          </Button>
        </div>
      ))}
    </div>
  );
}
