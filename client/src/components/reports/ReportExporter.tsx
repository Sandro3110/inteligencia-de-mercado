import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export function ReportExporter() {
  const [tipo, setTipo] = useState('uso_ia');
  const [periodo, setPeriodo] = useState('30');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/exportar-relatorio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          periodo: parseInt(periodo),
          formato: 'csv'
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao exportar relatório');
      }

      // Download do arquivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_${tipo}_${periodo}dias.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Relatório exportado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao exportar relatório');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tipo de Relatório */}
        <div className="space-y-2">
          <Label>Tipo de Relatório</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uso_ia">📊 Uso de IA</SelectItem>
              <SelectItem value="auditoria">📋 Logs de Auditoria</SelectItem>
              <SelectItem value="custos_usuario">💰 Custos por Usuário</SelectItem>
              <SelectItem value="alertas">🚨 Alertas de Segurança</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Período */}
        <div className="space-y-2">
          <Label>Período</Label>
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Botão de Exportação */}
      <Button 
        onClick={handleExport} 
        disabled={loading}
        className="w-full md:w-auto"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Exportando...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </>
        )}
      </Button>

      {/* Informações */}
      <div className="text-sm text-muted-foreground">
        <p>• O arquivo será baixado automaticamente no formato CSV</p>
        <p>• Codificação UTF-8 com BOM (compatível com Excel)</p>
        <p>• Dados filtrados pelo período selecionado</p>
      </div>
    </div>
  );
}
