import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuditLogs } from '@/hooks/useAuditLogs';

export function AuditLogTable() {
  const { logs, loading } = useAuditLogs({ limite: 50 });

  const getResultadoBadge = (resultado: string) => {
    const variants = {
      sucesso: 'bg-green-500',
      erro: 'bg-red-500',
      bloqueado: 'bg-orange-500'
    };
    return <Badge className={variants[resultado as keyof typeof variants] || 'bg-gray-500'}>{resultado}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum log encontrado
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Ação</TableHead>
            <TableHead>Endpoint</TableHead>
            <TableHead>Resultado</TableHead>
            <TableHead>Duração</TableHead>
            <TableHead>Custo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="text-sm">
                {new Date(log.created_at).toLocaleString('pt-BR')}
              </TableCell>
              <TableCell className="font-mono text-sm">{log.user_id}</TableCell>
              <TableCell>{log.action}</TableCell>
              <TableCell className="font-mono text-sm">{log.endpoint}</TableCell>
              <TableCell>{getResultadoBadge(log.resultado)}</TableCell>
              <TableCell>{log.duracao_ms}ms</TableCell>
              <TableCell>${log.custo.toFixed(4)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
