import { Shield, AlertTriangle, Users, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useSecurityAlerts } from '@/hooks/useSecurityAlerts';
import { useRateLimits } from '@/hooks/useRateLimits';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { SecurityAlerts } from './SecurityAlerts';
import { RateLimitMonitor } from './RateLimitMonitor';
import { UserBlockManager } from './UserBlockManager';

export function SecurityTab() {
  const { stats: alertStats } = useSecurityAlerts();
  const { stats: rateLimitStats } = useRateLimits();
  const { bloqueados } = useBlockedUsers();

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Alertas Ativos</div>
              <div className="text-2xl font-bold">{alertStats.ativos}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Críticos</div>
              <div className="text-2xl font-bold text-red-600">{alertStats.criticos}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Bloqueios Ativos</div>
              <div className="text-2xl font-bold">{rateLimitStats.bloqueios_ativos}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Usuários Bloqueados</div>
              <div className="text-2xl font-bold">{bloqueados.length}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Alertas de Segurança */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Alertas de Segurança
        </h2>
        <SecurityAlerts />
      </Card>

      {/* Rate Limits */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Monitoramento de Rate Limits
        </h2>
        <RateLimitMonitor />
      </Card>

      {/* Usuários Bloqueados */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Usuários Bloqueados
        </h2>
        <UserBlockManager />
      </Card>
    </div>
  );
}
