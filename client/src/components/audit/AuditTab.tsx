import { FileText, CheckCircle, XCircle, Ban, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { AuditLogTable } from './AuditLogTable';

export function AuditTab() {
  const { stats } = useAuditLogs();

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total de Logs</div>
              <div className="text-2xl font-bold">{stats.total_logs}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Sucessos</div>
              <div className="text-2xl font-bold text-green-600">{stats.sucessos}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Erros</div>
              <div className="text-2xl font-bold text-red-600">{stats.erros}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Ban className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Bloqueados</div>
              <div className="text-2xl font-bold text-orange-600">{stats.bloqueados}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Duração Média</div>
              <div className="text-2xl font-bold">{stats.duracao_media}ms</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabela de Logs */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Logs de Auditoria
        </h2>
        <AuditLogTable />
      </Card>
    </div>
  );
}
