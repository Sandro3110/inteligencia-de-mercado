'use client';

import { useState } from 'react';
import { useApp } from '@/lib/contexts/AppContext';
import { Download, FileSpreadsheet, FileText, Database } from 'lucide-react';
import { SaveConfigDialog } from '@/components/export/SaveConfigDialog';
import { toast } from 'sonner';

type ExportFormat = 'csv' | 'xlsx' | 'json';
type ExportType = 'leads' | 'mercados' | 'clientes' | 'concorrentes';

export default function ExportPage() {
  const { selectedProjectId } = useApp();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [selectedType, setSelectedType] = useState<ExportType>('leads');
  const [isExporting, setIsExporting] = useState(false);

  if (!selectedProjectId) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto text-center py-12">
          <Download className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Selecione um Projeto</h2>
          <p className="text-gray-600">Escolha um projeto no seletor global para exportar dados</p>
        </div>
      </div>
    );
  }

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Simulação de export (você pode implementar a lógica real aqui)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(`✅ ${selectedType} exportados com sucesso!`, {
        description: `Arquivo ${selectedFormat.toUpperCase()} baixado`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('❌ Erro ao exportar dados', {
        description: 'Tente novamente mais tarde',
        duration: 4000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const formats = [
    {
      id: 'csv',
      label: 'CSV',
      icon: FileText,
      description: 'Compatível com Excel e Google Sheets',
    },
    { id: 'xlsx', label: 'Excel', icon: FileSpreadsheet, description: 'Formato Microsoft Excel' },
    { id: 'json', label: 'JSON', icon: Database, description: 'Formato para desenvolvedores' },
  ] as const;

  const types = [
    { id: 'leads', label: 'Leads', description: 'Exportar todos os leads' },
    { id: 'mercados', label: 'Mercados', description: 'Exportar mercados mapeados' },
    { id: 'clientes', label: 'Clientes', description: 'Exportar clientes validados' },
    {
      id: 'concorrentes',
      label: 'Concorrentes',
      description: 'Exportar concorrentes identificados',
    },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Exportar Dados</h1>
          <p className="text-gray-600">Exporte seus dados em diferentes formatos</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Tipo de Dados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {types.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id as ExportType)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedType === type.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-gray-900">{type.label}</div>
                <div className="text-sm text-gray-600 mt-1">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Formato de Exportação</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {formats.map((format) => {
              const Icon = format.icon;
              return (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id as ExportFormat)}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    selectedFormat === format.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                  <div className="font-semibold text-gray-900">{format.label}</div>
                  <div className="text-xs text-gray-600 mt-1">{format.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Exportar {selectedType}
              </>
            )}
          </button>

          <SaveConfigDialog
            projectId={selectedProjectId}
            config={{
              format: selectedFormat,
              type: selectedType,
            }}
          />
        </div>
      </div>
    </div>
  );
}
