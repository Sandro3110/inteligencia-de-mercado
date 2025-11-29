'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, FileText, Map as MapIcon } from 'lucide-react';

interface ExportMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  isExporting?: boolean;
}

export interface ExportOptions {
  includeMap: boolean;
  includeMercados: boolean;
  includeClientes: boolean;
  includeLeads: boolean;
  includeConcorrentes: boolean;
}

export function ExportMapModal({
  isOpen,
  onClose,
  onExport,
  isExporting = false,
}: ExportMapModalProps) {
  const [options, setOptions] = useState<ExportOptions>({
    includeMap: true, // Sempre incluído
    includeMercados: true,
    includeClientes: true,
    includeLeads: true,
    includeConcorrentes: true,
  });

  const handleToggle = (key: keyof ExportOptions) => {
    if (key === 'includeMap') return; // Mapa sempre incluído
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExport = () => {
    onExport(options);
  };

  const hasSelection =
    options.includeMercados ||
    options.includeClientes ||
    options.includeLeads ||
    options.includeConcorrentes;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Exportar Mapa
          </DialogTitle>
          <DialogDescription>
            Selecione os dados que deseja incluir no PDF
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Mapa - sempre incluído */}
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Checkbox
              id="map"
              checked={true}
              disabled={true}
              className="data-[state=checked]:bg-blue-600"
            />
            <div className="flex-1">
              <Label
                htmlFor="map"
                className="text-sm font-medium text-blue-900 cursor-default"
              >
                <div className="flex items-center gap-2">
                  <MapIcon className="w-4 h-4" />
                  Imagem do Mapa
                </div>
              </Label>
              <p className="text-xs text-blue-700 mt-1">
                Sempre incluído (zoom e filtros atuais)
              </p>
            </div>
          </div>

          {/* Entidades - opcionais */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Tabelas de Dados:
            </p>

            <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
              <Checkbox
                id="mercados"
                checked={options.includeMercados}
                onCheckedChange={() => handleToggle('includeMercados')}
              />
              <Label htmlFor="mercados" className="text-sm cursor-pointer flex-1">
                📊 Mercados Únicos
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
              <Checkbox
                id="clientes"
                checked={options.includeClientes}
                onCheckedChange={() => handleToggle('includeClientes')}
              />
              <Label htmlFor="clientes" className="text-sm cursor-pointer flex-1">
                🏢 Clientes
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
              <Checkbox
                id="leads"
                checked={options.includeLeads}
                onCheckedChange={() => handleToggle('includeLeads')}
              />
              <Label htmlFor="leads" className="text-sm cursor-pointer flex-1">
                🎯 Leads
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
              <Checkbox
                id="concorrentes"
                checked={options.includeConcorrentes}
                onCheckedChange={() => handleToggle('includeConcorrentes')}
              />
              <Label htmlFor="concorrentes" className="text-sm cursor-pointer flex-1">
                📈 Concorrentes
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || !hasSelection}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Gerando PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Exportar PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
