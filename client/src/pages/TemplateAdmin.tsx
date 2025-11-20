/**
 * Página de administração de templates de exportação
 * Item 13 do módulo de exportação inteligente
 */

import { useState } from 'react';
import { Plus, Edit, Trash2, Copy, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { DynamicBreadcrumbs } from '@/components/DynamicBreadcrumbs';

export default function TemplateAdmin() {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);

  // Query de templates (simulado - implementar tRPC real)
  const templates = [
    {
      id: '1',
      name: 'Análise de Mercado Completa',
      description: 'Template para análise detalhada de mercados com insights estratégicos',
      templateType: 'market',
      isSystem: true,
      usageCount: 45,
      createdAt: new Date('2025-01-01')
    },
    {
      id: '2',
      name: 'Relatório de Clientes',
      description: 'Exportação de clientes com produtos e mercados associados',
      templateType: 'client',
      isSystem: false,
      usageCount: 23,
      createdAt: new Date('2025-01-15')
    },
    {
      id: '3',
      name: 'Análise Competitiva',
      description: 'Comparação de concorrentes por mercado e segmento',
      templateType: 'competitive',
      isSystem: true,
      usageCount: 67,
      createdAt: new Date('2025-01-10')
    },
    {
      id: '4',
      name: 'Leads Qualificados',
      description: 'Exportação de leads com score alto e análise de conversão',
      templateType: 'lead',
      isSystem: false,
      usageCount: 12,
      createdAt: new Date('2025-01-20')
    }
  ];

  const getTypeColor = (type: string) => {
    const colors = {
      market: 'bg-green-100 text-green-800',
      client: 'bg-blue-100 text-blue-800',
      competitive: 'bg-purple-100 text-purple-800',
      lead: 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-slate-100 text-slate-800';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      market: 'Mercado',
      client: 'Cliente',
      competitive: 'Competitivo',
      lead: 'Lead'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <DynamicBreadcrumbs />
          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Templates de Exportação
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Gerencie templates personalizados para exportações recorrentes
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Template
            </Button>
          </div>
        </div>

        {/* Grid de templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Header do card */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {template.name}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {template.description}
                  </p>
                </div>
                {template.isSystem && (
                  <Badge variant="secondary" className="text-xs">
                    Sistema
                  </Badge>
                )}
              </div>

              {/* Metadados */}
              <div className="flex items-center gap-2 mb-4">
                <Badge className={getTypeColor(template.templateType)}>
                  {getTypeLabel(template.templateType)}
                </Badge>
                <span className="text-xs text-slate-500">
                  {template.usageCount} usos
                </span>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <Eye className="w-3 h-3" />
                  Preview
                </Button>
                
                {!template.isSystem && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowEditor(true);
                      }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Duplicar template
                      }}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Deletar template
                      }}
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </Button>
                  </>
                )}

                {template.isSystem && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Duplicar template do sistema
                    }}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mensagem se vazio */}
        {templates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 mb-4">
              Nenhum template criado ainda
            </p>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Criar Primeiro Template
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
