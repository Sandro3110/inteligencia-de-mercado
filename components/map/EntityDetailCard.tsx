'use client';

import {
  X,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Linkedin,
  Instagram,
  ExternalLink,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EntityDetailCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entity: any;
  onClose: () => void;
}

export function EntityDetailCard({ entity, onClose }: EntityDetailCardProps) {
  const router = useRouter();

  const handleViewDetails = () => {
    if (entity.pesquisaId) {
      // Encontrar projectId da pesquisa (precisaria de query adicional)
      // Por enquanto, navegar para resultados
      router.push(
        `/projects/1/surveys/${entity.pesquisaId}/results?tab=${entity.type}s&id=${entity.id}`
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">
                {entity.type === 'cliente' ? '🏢' : entity.type === 'lead' ? '🎯' : '📈'}
              </span>
              <span
                className={`text-xs font-semibold uppercase px-3 py-1 rounded-full ${
                  entity.type === 'cliente'
                    ? 'bg-blue-100 text-blue-700'
                    : entity.type === 'lead'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                }`}
              >
                {entity.type}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{entity.nome}</h2>
            {entity.type === 'cliente' && entity.validationStatus && (
              <span
                className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
                  entity.validationStatus === 'aprovado'
                    ? 'bg-green-100 text-green-700'
                    : entity.validationStatus === 'pendente'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                }`}
              >
                {entity.validationStatus}
              </span>
            )}
            {entity.type === 'lead' && entity.qualidadeClassificacao && (
              <div className="mt-2">
                <span
                  className={`text-sm px-3 py-1 rounded-full font-medium ${
                    entity.qualidadeClassificacao.toLowerCase() === 'alto'
                      ? 'bg-green-500 text-white'
                      : entity.qualidadeClassificacao.toLowerCase() === 'medio'
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-400 text-white'
                  }`}
                >
                  ⭐ {entity.qualidadeClassificacao} Potencial
                </span>
                {entity.qualidadeScore && (
                  <span className="ml-2 text-sm text-gray-600">
                    Score: {entity.qualidadeScore}/100
                  </span>
                )}
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Informações Básicas */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              INFORMAÇÕES BÁSICAS
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {entity.cnpj && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">CNPJ:</span>
                  <span className="text-sm font-medium text-gray-900">{entity.cnpj}</span>
                </div>
              )}
              {entity.razaoSocial && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Razão Social:</span>
                  <span className="text-sm font-medium text-gray-900">{entity.razaoSocial}</span>
                </div>
              )}
              {entity.setor && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Setor:</span>
                  <span className="text-sm font-medium text-gray-900">{entity.setor}</span>
                </div>
              )}
              {entity.porte && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Porte:</span>
                  <span className="text-sm font-medium text-gray-900">{entity.porte}</span>
                </div>
              )}
              {entity.produtoPrincipal && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Produto Principal:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {entity.produtoPrincipal}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Localização */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              LOCALIZAÇÃO
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {entity.endereco && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Endereço:</span>
                  <span className="text-sm font-medium text-gray-900">{entity.endereco}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cidade:</span>
                <span className="text-sm font-medium text-gray-900">{entity.cidade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Estado:</span>
                <span className="text-sm font-medium text-gray-900">{entity.uf}</span>
              </div>
              {entity.regiao && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Região:</span>
                  <span className="text-sm font-medium text-gray-900">{entity.regiao}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Coordenadas:</span>
                <span className="text-sm font-mono text-gray-900">
                  {entity.latitude.toFixed(4)}, {entity.longitude.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {/* Qualificação (Lead) */}
          {entity.type === 'lead' && entity.justificativa && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">QUALIFICAÇÃO</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 italic">&quot;{entity.justificativa}&quot;</p>
              </div>
            </div>
          )}

          {/* Análise Competitiva (Concorrente) */}
          {entity.type === 'concorrente' && entity.descricao && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">ANÁLISE COMPETITIVA</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">{entity.descricao}</p>
              </div>
            </div>
          )}

          {/* Contato */}
          {(entity.telefone ||
            entity.email ||
            entity.siteOficial ||
            entity.linkedin ||
            entity.instagram) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">CONTATO</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {entity.telefone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a
                      href={`tel:${entity.telefone}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {entity.telefone}
                    </a>
                  </div>
                )}
                {entity.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a
                      href={`mailto:${entity.email}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {entity.email}
                    </a>
                  </div>
                )}
                {entity.siteOficial && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <a
                      href={entity.siteOficial}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {entity.siteOficial}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {entity.linkedin && (
                  <div className="flex items-center gap-3">
                    <Linkedin className="w-4 h-4 text-gray-400" />
                    <a
                      href={entity.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      LinkedIn
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {entity.instagram && (
                  <div className="flex items-center gap-3">
                    <Instagram className="w-4 h-4 text-gray-400" />
                    <a
                      href={entity.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Instagram
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={handleViewDetails}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Ver Detalhes Completos
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
