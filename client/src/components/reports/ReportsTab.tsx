import { FileDown, FileSpreadsheet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ReportExporter } from './ReportExporter';

export function ReportsTab() {
  return (
    <div className="space-y-6">
      {/* Informações */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <div className="flex items-start gap-3">
          <FileSpreadsheet className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Exportação de Relatórios
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Exporte dados de uso de IA, logs de auditoria, custos por usuário e alertas de segurança 
              em formato CSV para análise externa.
            </p>
          </div>
        </div>
      </Card>

      {/* Formulário de Exportação */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileDown className="h-5 w-5" />
          Exportar Dados
        </h2>
        <ReportExporter />
      </Card>

      {/* Tipos de Relatórios Disponíveis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">📊 Uso de IA</h3>
          <p className="text-sm text-muted-foreground">
            Histórico completo de uso da IA: tokens, custos, modelos, processos e durações.
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2">📋 Logs de Auditoria</h3>
          <p className="text-sm text-muted-foreground">
            Registro de todas as ações: usuários, endpoints, resultados, IPs e timestamps.
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2">💰 Custos por Usuário</h3>
          <p className="text-sm text-muted-foreground">
            Análise de custos agregados por usuário: chamadas, tokens e valores totais.
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2">🚨 Alertas de Segurança</h3>
          <p className="text-sm text-muted-foreground">
            Histórico de alertas: tipos, severidades, usuários e status de resolução.
          </p>
        </Card>
      </div>
    </div>
  );
}
