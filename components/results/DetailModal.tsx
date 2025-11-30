'use client';

import { useState } from 'react';
import { X, Copy, Check, Building2, Target, TrendingUp, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

export type DetailModalType = 'cliente' | 'lead' | 'concorrente' | 'mercado';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: DetailModalType;
  data: Record<string, unknown>;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DetailModal({ isOpen, onClose, type, data }: DetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // ============================================================================
  // COPY FUNCTION
  // ============================================================================

  const handleCopy = async () => {
    const formattedText = formatDataForCopy(type, data);

    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      toast.success('Conteúdo copiado para área de transferência!');

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar conteúdo');
      console.error('Copy error:', error);
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getIcon = () => {
    switch (type) {
      case 'cliente':
        return <Building2 className="w-6 h-6 text-blue-600" />;
      case 'lead':
        return <Target className="w-6 h-6 text-green-600" />;
      case 'concorrente':
        return <TrendingUp className="w-6 h-6 text-orange-600" />;
      case 'mercado':
        return <MapPin className="w-6 h-6 text-purple-600" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'cliente':
        return 'Detalhes do Cliente';
      case 'lead':
        return 'Detalhes do Lead';
      case 'concorrente':
        return 'Detalhes do Concorrente';
      case 'mercado':
        return 'Detalhes do Mercado';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'cliente':
        return 'border-blue-500';
      case 'lead':
        return 'border-green-500';
      case 'concorrente':
        return 'border-orange-500';
      case 'mercado':
        return 'border-purple-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`border-b-4 ${getColor()} bg-gradient-to-r from-gray-50 to-white p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">{getIcon()}</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{getTitle()}</h2>
                <p className="text-sm text-gray-500 mt-1">{(data.nome as string) || 'Sem nome'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleCopy} variant="outline" size="sm" className="gap-2">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </Button>

              <Button onClick={onClose} variant="ghost" size="icon" className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          {type === 'cliente' && <ClienteCard data={data} />}
          {type === 'lead' && <LeadCard data={data} />}
          {type === 'concorrente' && <ConcorrenteCard data={data} />}
          {type === 'mercado' && <MercadoCard data={data} />}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CLIENTE CARD
// ============================================================================

function ClienteCard({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Section title="Informações Básicas" icon="🏢">
        <Field label="Nome" value={data.nome} />
        <Field label="CNPJ" value={data.cnpj} />
        <Field label="Produto Principal" value={data.produtoPrincipal} />
        <Field label="Segmentação" value={data.segmentacaoB2BB2C} />
        <Field label="CNAE" value={data.cnae} />
        <Field label="Porte" value={data.porte} />
      </Section>

      {/* Localização */}
      <Section title="Localização" icon="📍">
        <Field label="Cidade" value={data.cidade} />
        <Field label="Estado (UF)" value={data.uf} />
      </Section>

      {/* Contato */}
      <Section title="Contato" icon="📞">
        <Field label="Site Oficial" value={data.siteOficial} link />
        <Field label="E-mail" value={data.email} />
        <Field label="Telefone" value={data.telefone} />
        <Field label="LinkedIn" value={data.linkedin} link />
        <Field label="Instagram" value={data.instagram} link />
      </Section>

      {/* Qualidade */}
      <Section title="Qualidade e Status" icon="⭐">
        <Field label="Score de Qualidade" value={data.qualidadeScore} />
        <Field label="Classificação" value={data.qualidadeClassificacao} />
        <Field
          label="Status de Validação"
          value={
            data.validationStatus === 'approved'
              ? 'Aprovado'
              : data.validationStatus === 'rejected'
                ? 'Rejeitado'
                : 'Pendente'
          }
        />
        <Field label="Notas de Validação" value={data.validationNotes} />
      </Section>
    </div>
  );
}

// ============================================================================
// LEAD CARD
// ============================================================================

function LeadCard({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Section title="Informações Básicas" icon="🎯">
        <Field label="Nome" value={data.nome} />
        <Field label="CNPJ" value={data.cnpj} />
        <Field label="Tipo" value={data.tipo} />
        <Field label="Porte" value={data.porte} />
        <Field label="Setor" value={data.setor} />
        <Field label="CNAE" value={data.cnae} />
      </Section>

      {/* Localização */}
      <Section title="Localização" icon="📍">
        <Field label="Região" value={data.regiao} />
        <Field label="Cidade" value={data.cidade} />
        <Field label="Estado (UF)" value={data.uf} />
      </Section>

      {/* Contato */}
      <Section title="Contato" icon="📞">
        <Field label="Site" value={data.site} link />
        <Field label="E-mail" value={data.email} />
        <Field label="Telefone" value={data.telefone} />
      </Section>

      {/* Qualificação */}
      <Section title="Qualificação" icon="⭐">
        <Field label="Score de Qualidade" value={data.qualidadeScore} />
        <Field label="Classificação" value={data.qualidadeClassificacao} />
        <Field label="Justificativa" value={data.justificativa} fullWidth />
      </Section>

      {/* Pipeline */}
      <Section title="Pipeline" icon="📊">
        <Field label="Estágio" value={data.leadStage} />
        <Field label="Status de Validação" value={data.validationStatus} />
        <Field label="Notas" value={data.validationNotes} fullWidth />
      </Section>
    </div>
  );
}

// ============================================================================
// CONCORRENTE CARD
// ============================================================================

function ConcorrenteCard({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Section title="Informações Básicas" icon="🏆">
        <Field label="Nome" value={data.nome} />
        <Field label="CNPJ" value={data.cnpj} />
        <Field label="Descrição" value={data.descricao} fullWidth />
        <Field label="Produto" value={data.produto} fullWidth />
      </Section>

      {/* Perfil Empresarial */}
      <Section title="Perfil Empresarial" icon="💼">
        <Field label="Porte" value={data.porte} />
        <Field label="Faturamento Estimado" value={data.faturamentoEstimado} />
        <Field label="Setor" value={data.setor} />
        <Field label="CNAE" value={data.cnae} />
      </Section>

      {/* Localização */}
      <Section title="Localização" icon="📍">
        <Field label="Cidade" value={data.cidade} />
        <Field label="Estado (UF)" value={data.uf} />
      </Section>

      {/* Contato */}
      <Section title="Contato" icon="📞">
        <Field label="Site" value={data.site} link />
        <Field label="E-mail" value={data.email} />
        <Field label="Telefone" value={data.telefone} />
      </Section>

      {/* Análise */}
      <Section title="Análise Competitiva" icon="📈">
        <Field label="Score de Qualidade" value={data.qualidadeScore} />
        <Field label="Classificação" value={data.qualidadeClassificacao} />
        <Field label="Status de Validação" value={data.validationStatus} />
        <Field label="Notas" value={data.validationNotes} fullWidth />
      </Section>
    </div>
  );
}

// ============================================================================
// MERCADO CARD
// ============================================================================

function MercadoCard({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Section title="Informações do Mercado" icon="🌍">
        <Field label="Nome" value={data.nome} />
        <Field label="Categoria" value={data.categoria} />
        <Field label="Segmentação" value={data.segmentacao} />
      </Section>

      {/* Métricas */}
      <Section title="Métricas de Mercado" icon="📊">
        <Field label="Tamanho do Mercado" value={data.tamanhoMercado} />
        <Field label="Crescimento Anual" value={data.crescimentoAnual} />
        <Field label="Quantidade de Clientes" value={data.quantidadeClientes} />
      </Section>

      {/* Análise */}
      <Section title="Análise de Mercado" icon="🔍">
        <Field label="Tendências" value={data.tendencias} fullWidth />
        <Field label="Principais Players" value={data.principaisPlayers} fullWidth />
      </Section>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  link = false,
  fullWidth = false,
}: {
  label: string;
  value: unknown;
  link?: boolean;
  fullWidth?: boolean;
}) {
  const displayValue = value?.toString() || '-';

  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
      <dd className="text-sm text-gray-900">
        {link && value ? (
          <a
            href={displayValue}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all"
          >
            {displayValue}
          </a>
        ) : (
          <span className={fullWidth ? 'whitespace-pre-wrap' : ''}>{displayValue}</span>
        )}
      </dd>
    </div>
  );
}

// ============================================================================
// FORMAT FOR COPY
// ============================================================================

function formatDataForCopy(type: DetailModalType, data: Record<string, unknown>): string {
  const lines: string[] = [];

  // Header
  lines.push('═══════════════════════════════════════════════════════');
  lines.push(`  ${type.toUpperCase()}: ${data.nome || 'Sem nome'}`);
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('');

  if (type === 'cliente') {
    lines.push('📋 INFORMAÇÕES BÁSICAS');
    lines.push(`   Nome: ${data.nome || '-'}`);
    lines.push(`   CNPJ: ${data.cnpj || '-'}`);
    lines.push(`   Produto Principal: ${data.produtoPrincipal || '-'}`);
    lines.push(`   Segmentação: ${data.segmentacaoB2BB2C || '-'}`);
    lines.push(`   CNAE: ${data.cnae || '-'}`);
    lines.push(`   Porte: ${data.porte || '-'}`);
    lines.push('');

    lines.push('📍 LOCALIZAÇÃO');
    lines.push(`   Cidade: ${data.cidade || '-'}`);
    lines.push(`   Estado: ${data.uf || '-'}`);
    lines.push('');

    lines.push('📞 CONTATO');
    lines.push(`   Site: ${data.siteOficial || '-'}`);
    lines.push(`   E-mail: ${data.email || '-'}`);
    lines.push(`   Telefone: ${data.telefone || '-'}`);
    lines.push(`   LinkedIn: ${data.linkedin || '-'}`);
    lines.push(`   Instagram: ${data.instagram || '-'}`);
    lines.push('');

    lines.push('⭐ QUALIDADE E STATUS');
    lines.push(`   Score: ${data.qualidadeScore || '-'}`);
    lines.push(`   Classificação: ${data.qualidadeClassificacao || '-'}`);
    lines.push(`   Status: ${data.validationStatus || '-'}`);
    if (data.validationNotes) {
      lines.push(`   Notas: ${data.validationNotes}`);
    }
  } else if (type === 'lead') {
    lines.push('📋 INFORMAÇÕES BÁSICAS');
    lines.push(`   Nome: ${data.nome || '-'}`);
    lines.push(`   CNPJ: ${data.cnpj || '-'}`);
    lines.push(`   Tipo: ${data.tipo || '-'}`);
    lines.push(`   Porte: ${data.porte || '-'}`);
    lines.push(`   Setor: ${data.setor || '-'}`);
    lines.push(`   CNAE: ${data.cnae || '-'}`);
    lines.push('');

    lines.push('📍 LOCALIZAÇÃO');
    lines.push(`   Região: ${data.regiao || '-'}`);
    lines.push(`   Cidade: ${data.cidade || '-'}`);
    lines.push(`   Estado: ${data.uf || '-'}`);
    lines.push('');

    lines.push('📞 CONTATO');
    lines.push(`   Site: ${data.site || '-'}`);
    lines.push(`   E-mail: ${data.email || '-'}`);
    lines.push(`   Telefone: ${data.telefone || '-'}`);
    lines.push('');

    lines.push('⭐ QUALIFICAÇÃO');
    lines.push(`   Score: ${data.qualidadeScore || '-'}`);
    lines.push(`   Classificação: ${data.qualidadeClassificacao || '-'}`);
    lines.push(`   Justificativa: ${data.justificativa || '-'}`);
    lines.push('');

    lines.push('📊 PIPELINE');
    lines.push(`   Estágio: ${data.leadStage || '-'}`);
    lines.push(`   Status: ${data.validationStatus || '-'}`);
    if (data.validationNotes) {
      lines.push(`   Notas: ${data.validationNotes}`);
    }
  } else if (type === 'concorrente') {
    lines.push('📋 INFORMAÇÕES BÁSICAS');
    lines.push(`   Nome: ${data.nome || '-'}`);
    lines.push(`   CNPJ: ${data.cnpj || '-'}`);
    lines.push(`   Descrição: ${data.descricao || '-'}`);
    lines.push(`   Produto: ${data.produto || '-'}`);
    lines.push('');

    lines.push('💼 PERFIL EMPRESARIAL');
    lines.push(`   Porte: ${data.porte || '-'}`);
    lines.push(`   Faturamento: ${data.faturamentoEstimado || '-'}`);
    lines.push(`   Setor: ${data.setor || '-'}`);
    lines.push(`   CNAE: ${data.cnae || '-'}`);
    lines.push('');

    lines.push('📍 LOCALIZAÇÃO');
    lines.push(`   Cidade: ${data.cidade || '-'}`);
    lines.push(`   Estado: ${data.uf || '-'}`);
    lines.push('');

    lines.push('📞 CONTATO');
    lines.push(`   Site: ${data.site || '-'}`);
    lines.push(`   E-mail: ${data.email || '-'}`);
    lines.push(`   Telefone: ${data.telefone || '-'}`);
    lines.push('');

    lines.push('📈 ANÁLISE COMPETITIVA');
    lines.push(`   Score: ${data.qualidadeScore || '-'}`);
    lines.push(`   Classificação: ${data.qualidadeClassificacao || '-'}`);
    lines.push(`   Status: ${data.validationStatus || '-'}`);
    if (data.validationNotes) {
      lines.push(`   Notas: ${data.validationNotes}`);
    }
  } else if (type === 'mercado') {
    lines.push('📋 INFORMAÇÕES DO MERCADO');
    lines.push(`   Nome: ${data.nome || '-'}`);
    lines.push(`   Categoria: ${data.categoria || '-'}`);
    lines.push(`   Segmentação: ${data.segmentacao || '-'}`);
    lines.push('');

    lines.push('📊 MÉTRICAS');
    lines.push(`   Tamanho: ${data.tamanhoMercado || '-'}`);
    lines.push(`   Crescimento Anual: ${data.crescimentoAnual || '-'}`);
    lines.push(`   Clientes: ${data.quantidadeClientes || '-'}`);
    lines.push('');

    lines.push('🔍 ANÁLISE');
    lines.push(`   Tendências: ${data.tendencias || '-'}`);
    lines.push(`   Principais Players: ${data.principaisPlayers || '-'}`);
  }

  lines.push('');
  lines.push('═══════════════════════════════════════════════════════');
  lines.push(`Exportado em: ${new Date().toLocaleString('pt-BR')}`);
  lines.push('═══════════════════════════════════════════════════════');

  return lines.join('\n');
}
