'use client';

import { useApp } from '@/lib/contexts/AppContext';
import { trpc } from '@/lib/trpc/client';
import { Plus, Search, Calendar, Users, TrendingUp, FileText, Upload, History, Filter } from 'lucide-react';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const Step1SelectProject = dynamic(() => import('@/components/research-wizard/AllSteps').then(mod => ({ default: mod.Step1SelectProject })), { ssr: false });
const Step2NameResearch = dynamic(() => import('@/components/research-wizard/AllSteps').then(mod => ({ default: mod.Step2NameResearch })), { ssr: false });
const Step3ConfigureParams = dynamic(() => import('@/components/research-wizard/AllSteps').then(mod => ({ default: mod.Step3ConfigureParams })), { ssr: false });
const Step4ChooseMethod = dynamic(() => import('@/components/research-wizard/AllSteps').then(mod => ({ default: mod.Step4ChooseMethod })), { ssr: false });
const Step6ValidateData = dynamic(() => import('@/components/research-wizard/AllSteps').then(mod => ({ default: mod.Step6ValidateData })), { ssr: false });
const Step7Summary = dynamic(() => import('@/components/research-wizard/AllSteps').then(mod => ({ default: mod.Step7Summary })), { ssr: false });
const FileUploadParser = dynamic(() => import('@/components/FileUploadParser'), { ssr: false });
const ColumnMapper = dynamic(() => import('@/components/ColumnMapper'), { ssr: false });
const ValidationModal = dynamic(() => import('@/components/ValidationModal'), { ssr: false });
const TemplateSelector = dynamic(() => import('@/components/TemplateSelector'), { ssr: false });
const SearchHistory = dynamic(() => import('@/components/SearchHistory'), { ssr: false });

export default function PesquisasPage() {
  const { selectedProjectId } = useApp();
  const [activeTab, setActiveTab] = useState<'list' | 'upload' | 'templates' | 'history'>('list');
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState<any>({});
  
  const { data: pesquisas, isLoading, refetch } = trpc.pesquisas.list.useQuery(
    selectedProjectId ? { projectId: selectedProjectId } : undefined
  );

  const handleStartWizard = () => {
    setShowWizard(true);
    setWizardStep(1);
    setWizardData({});
  };

  const handleWizardNext = (data: any) => {
    setWizardData({ ...wizardData, ...data });
    setWizardStep(wizardStep + 1);
  };

  const handleWizardBack = () => {
    setWizardStep(wizardStep - 1);
  };

  const handleWizardClose = () => {
    setShowWizard(false);
    setWizardStep(1);
    setWizardData({});
    refetch();
  };

  if (!selectedProjectId) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto text-center py-12">
          <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Selecione um Projeto</h2>
          <p className="text-gray-600">Escolha um projeto no seletor global</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pesquisas</h1>
          <p className="text-gray-600">Gerencie suas pesquisas de mercado</p>
        </div>
        <button
          onClick={handleStartWizard}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Pesquisa
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { id: 'list', label: 'Pesquisas', icon: Search },
            { id: 'upload', label: 'Upload', icon: Upload },
            { id: 'templates', label: 'Templates', icon: FileText },
            { id: 'history', label: 'Histórico', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-4 px-2 border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'list' && (
        <div>
          {pesquisas && pesquisas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pesquisas.map((pesquisa) => (
                <div key={pesquisa.id} className="bg-white rounded-lg shadow hover:shadow-xl transition-all cursor-pointer group">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                        {pesquisa.nome}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        pesquisa.status === 'importado' ? 'bg-green-100 text-green-800' :
                        pesquisa.status === 'em_andamento' ? 'bg-yellow-100 text-yellow-800' :
                        pesquisa.status === 'processando' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {pesquisa.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {pesquisa.descricao || 'Sem descrição'}
                    </p>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">Total de Clientes</span>
                      </div>
                      <span className="font-bold text-gray-900">{pesquisa.totalClientes || 0}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">Enriquecidos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{pesquisa.clientesEnriquecidos || 0}</span>
                        {(pesquisa.totalClientes || 0) > 0 && (
                          <span className="text-xs text-gray-500">
                            ({Math.round(((pesquisa.clientesEnriquecidos || 0) / (pesquisa.totalClientes || 1)) * 100)}%)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Importado em</span>
                      </div>
                      <span className="text-sm text-gray-900">
                        {pesquisa.dataImportacao ? new Date(pesquisa.dataImportacao).toLocaleDateString('pt-BR') : '-'}
                      </span>
                    </div>

                    {(pesquisa.totalClientes || 0) > 0 && (
                      <div className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-600">Progresso</span>
                          <span className="text-xs font-medium text-gray-900">
                            {Math.round(((pesquisa.clientesEnriquecidos || 0) / (pesquisa.totalClientes || 1)) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(((pesquisa.clientesEnriquecidos || 0) / (pesquisa.totalClientes || 1)) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
                    ID: {pesquisa.id}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma pesquisa encontrada</h3>
              <p className="text-gray-600 mb-6">Crie sua primeira pesquisa</p>
              <button
                onClick={handleStartWizard}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Criar Primeira Pesquisa
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="space-y-6">
          <FileUploadParser />
          <ColumnMapper />
          <ValidationModal />
        </div>
      )}

      {activeTab === 'templates' && <TemplateSelector />}
      {activeTab === 'history' && <SearchHistory />}

      {/* Wizard Modal com 7 Steps */}
      {showWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Nova Pesquisa - Wizard</h2>
                <button onClick={handleWizardClose} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <div className="mt-4 flex items-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                  <div
                    key={step}
                    className={`flex-1 h-2 rounded-full transition-colors ${
                      step <= wizardStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-600">Passo {wizardStep} de 7</p>
            </div>

            <div className="p-6">
              {wizardStep === 1 && <Step1SelectProject onNext={handleWizardNext} initialData={wizardData} />}
              {wizardStep === 2 && <Step2NameResearch onNext={handleWizardNext} onBack={handleWizardBack} initialData={wizardData} />}
              {wizardStep === 3 && <Step3ConfigureParams onNext={handleWizardNext} onBack={handleWizardBack} initialData={wizardData} />}
              {wizardStep === 4 && <Step4ChooseMethod onNext={handleWizardNext} onBack={handleWizardBack} initialData={wizardData} />}
              {wizardStep === 5 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">Inserir Dados</h3>
                  <p className="text-gray-600 mb-6">Step 5 em desenvolvimento</p>
                  <div className="flex gap-4 justify-center">
                    <button onClick={handleWizardBack} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Voltar</button>
                    <button onClick={() => handleWizardNext({})} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Próximo</button>
                  </div>
                </div>
              )}
              {wizardStep === 6 && <Step6ValidateData onNext={handleWizardNext} onBack={handleWizardBack} initialData={wizardData} />}
              {wizardStep === 7 && <Step7Summary onFinish={handleWizardClose} onBack={handleWizardBack} data={wizardData} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
