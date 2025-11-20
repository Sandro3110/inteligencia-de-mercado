/**
 * Todos os 7 Steps do Wizard de Pesquisa - Consolidado
 * Fase 39.3 - Wizard de Criação de Pesquisa
 */

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileSpreadsheet, Sparkles, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import type { ResearchWizardData } from '@/pages/ResearchWizard';
import PreResearchInterface from './PreResearchInterface';
import FileUploadZone from './FileUploadZone';

// ============================================
// STEP 1: SELECIONAR PROJETO
// ============================================

export function Step1SelectProject({ data, updateData }: {
  data: ResearchWizardData;
  updateData: (d: Partial<ResearchWizardData>) => void;
}) {
  const { data: projects } = trpc.projects.list.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Selecione o Projeto</h2>
        <p className="text-muted-foreground">
          Escolha o projeto ao qual esta pesquisa pertence
        </p>
      </div>

      <div className="space-y-4">
        <Label>Projeto *</Label>
        <Select
          value={data.projectId?.toString() || ''}
          onValueChange={(value) => {
            const project = projects?.find(p => p.id === parseInt(value));
            updateData({
              projectId: parseInt(value),
              projectName: project?.nome || ''
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um projeto" />
          </SelectTrigger>
          <SelectContent>
            {projects?.map(project => (
              <SelectItem key={project.id} value={project.id.toString()}>
                {project.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {data.projectId && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✓ Projeto selecionado: <strong>{data.projectName}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// STEP 2: NOMEAR PESQUISA
// ============================================

export function Step2NameResearch({ data, updateData }: {
  data: ResearchWizardData;
  updateData: (d: Partial<ResearchWizardData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Nome da Pesquisa</h2>
        <p className="text-muted-foreground">
          Dê um nome descritivo para identificar esta pesquisa
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Nome *</Label>
          <Input
            placeholder="Ex: Pesquisa de Embalagens Plásticas Q4 2025"
            value={data.researchName}
            onChange={(e) => updateData({ researchName: e.target.value })}
            className="mt-2"
          />
        </div>

        <div>
          <Label>Descrição (opcional)</Label>
          <Textarea
            placeholder="Descreva o objetivo e escopo desta pesquisa..."
            value={data.researchDescription}
            onChange={(e) => updateData({ researchDescription: e.target.value })}
            className="mt-2"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// STEP 3: CONFIGURAR PARÂMETROS
// ============================================

export function Step3ConfigureParams({ data, updateData }: {
  data: ResearchWizardData;
  updateData: (d: Partial<ResearchWizardData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Configurar Parâmetros</h2>
        <p className="text-muted-foreground">
          Defina quantos concorrentes, leads e produtos deseja enriquecer
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4">
          <Label>Concorrentes por Mercado</Label>
          <Input
            type="number"
            min={0}
            max={50}
            value={data.qtdConcorrentes}
            onChange={(e) => updateData({ qtdConcorrentes: parseInt(e.target.value) || 0 })}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Recomendado: 5-10
          </p>
        </Card>

        <Card className="p-4">
          <Label>Leads por Mercado</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={data.qtdLeads}
            onChange={(e) => updateData({ qtdLeads: parseInt(e.target.value) || 0 })}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Recomendado: 10-20
          </p>
        </Card>

        <Card className="p-4">
          <Label>Produtos por Cliente</Label>
          <Input
            type="number"
            min={0}
            max={20}
            value={data.qtdProdutos}
            onChange={(e) => updateData({ qtdProdutos: parseInt(e.target.value) || 0 })}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Recomendado: 3-5
          </p>
        </Card>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Dica:</strong> Valores maiores resultam em pesquisas mais completas, mas levam mais tempo para processar.
        </p>
      </div>
    </div>
  );
}

// ============================================
// STEP 4: ESCOLHER MÉTODO DE ENTRADA
// ============================================

export function Step4ChooseMethod({ data, updateData }: {
  data: ResearchWizardData;
  updateData: (d: Partial<ResearchWizardData>) => void;
}) {
  const methods = [
    {
      id: 'manual',
      icon: Plus,
      title: 'Entrada Manual',
      description: 'Adicione mercados e clientes um por um através de formulários',
      recommended: 'Ideal para 1-10 registros'
    },
    {
      id: 'spreadsheet',
      icon: FileSpreadsheet,
      title: 'Upload de Planilha',
      description: 'Importe dados em massa via CSV ou Excel',
      recommended: 'Ideal para 10+ registros'
    },
    {
      id: 'pre-research',
      icon: Sparkles,
      title: 'Pré-Pesquisa com IA',
      description: 'Descreva em linguagem natural e a IA busca os dados',
      recommended: 'Ideal para pesquisas exploratórias'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Escolha o Método de Entrada</h2>
        <p className="text-muted-foreground">
          Como você deseja inserir os dados desta pesquisa?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {methods.map((method) => {
          const Icon = method.icon;
          const isSelected = data.inputMethod === method.id;

          return (
            <Card
              key={method.id}
              className={`
                p-6 cursor-pointer transition-all
                ${isSelected ? 'border-2 border-blue-500 bg-blue-50' : 'hover:border-gray-400'}
              `}
              onClick={() => updateData({ inputMethod: method.id as any })}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`
                  p-3 rounded-full
                  ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">{method.title}</h3>
                <p className="text-sm text-muted-foreground">{method.description}</p>
                <Badge variant={isSelected ? 'default' : 'outline'}>
                  {method.recommended}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// STEP 5: INSERIR DADOS (SIMPLIFICADO)
// ============================================

export function Step5InsertData({ data, updateData }: {
  data: ResearchWizardData;
  updateData: (d: Partial<ResearchWizardData>) => void;
}) {
  const [newMercado, setNewMercado] = useState('');

  const addMercado = () => {
    if (newMercado.trim()) {
      updateData({
        mercados: [...data.mercados, { nome: newMercado, segmentacao: 'B2B' }]
      });
      setNewMercado('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Inserir Dados</h2>
        <p className="text-muted-foreground">
          Método selecionado: <strong>{
            data.inputMethod === 'manual' ? 'Entrada Manual' :
            data.inputMethod === 'spreadsheet' ? 'Upload de Planilha' :
            'Pré-Pesquisa com IA'
          }</strong>
        </p>
      </div>

      {data.inputMethod === 'manual' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nome do mercado..."
              value={newMercado}
              onChange={(e) => setNewMercado(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addMercado()}
            />
            <Button onClick={addMercado}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>

          <div className="space-y-2">
            {data.mercados.map((m, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span>{m.nome}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    updateData({
                      mercados: data.mercados.filter((_, idx) => idx !== i)
                    });
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {data.mercados.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
              Nenhum mercado adicionado ainda
            </div>
          )}
        </div>
      )}

      {data.inputMethod === 'spreadsheet' && (
        <FileUploadZone data={data} updateData={updateData} tipo="mercado" />
      )}

      {data.inputMethod === 'pre-research' && (
        <PreResearchInterface data={data} updateData={updateData} />
      )}
    </div>
  );
}

// ============================================
// STEP 6: VALIDAR DADOS
// ============================================

export function Step6ValidateData({ data, updateData }: {
  data: ResearchWizardData;
  updateData: (d: Partial<ResearchWizardData>) => void;
}) {
  const validMercados = data.mercados.filter(m => m.nome?.trim().length >= 3);
  const invalidMercados = data.mercados.filter(m => !m.nome || m.nome.trim().length < 3);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Validar Dados</h2>
        <p className="text-muted-foreground">
          Revise os dados antes de prosseguir
        </p>
      </div>

      <div className="space-y-4">
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-800">Dados Válidos ({validMercados.length})</h3>
          </div>
          <div className="space-y-2">
            {validMercados.map((m, i) => (
              <div key={i} className="text-sm text-green-700">
                ✓ {m.nome}
              </div>
            ))}
          </div>
        </Card>

        {invalidMercados.length > 0 && (
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-800">Dados Inválidos ({invalidMercados.length})</h3>
            </div>
            <div className="space-y-2">
              {invalidMercados.map((m, i) => (
                <div key={i} className="text-sm text-red-700">
                  ✗ {m.nome || '(vazio)'} - Nome muito curto
                </div>
              ))}
            </div>
          </Card>
        )}

        <Button
          onClick={() => {
            updateData({
              validatedData: {
                mercados: validMercados,
                clientes: []
              }
            });
          }}
          className="w-full"
        >
          Aprovar Dados Válidos
        </Button>
      </div>
    </div>
  );
}

// ============================================
// STEP 7: RESUMO
// ============================================

export function Step7Summary({ data }: {
  data: ResearchWizardData;
  updateData: (d: Partial<ResearchWizardData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Resumo da Pesquisa</h2>
        <p className="text-muted-foreground">
          Revise todas as configurações antes de iniciar o enriquecimento
        </p>
      </div>

      <div className="space-y-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Projeto</h3>
          <p>{data.projectName}</p>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2">Nome da Pesquisa</h3>
          <p>{data.researchName}</p>
          {data.researchDescription && (
            <p className="text-sm text-muted-foreground mt-2">{data.researchDescription}</p>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2">Parâmetros</h3>
          <div className="grid grid-cols-3 gap-4 mt-2">
            <div>
              <p className="text-sm text-muted-foreground">Concorrentes</p>
              <p className="text-2xl font-bold">{data.qtdConcorrentes}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Leads</p>
              <p className="text-2xl font-bold">{data.qtdLeads}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Produtos</p>
              <p className="text-2xl font-bold">{data.qtdProdutos}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2">Dados</h3>
          <p>{data.validatedData.mercados.length} mercados validados</p>
          <p>{data.validatedData.clientes.length} clientes validados</p>
        </Card>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Atenção:</strong> O processo de enriquecimento pode levar vários minutos dependendo da quantidade de dados.
          </p>
        </div>
      </div>
    </div>
  );
}
