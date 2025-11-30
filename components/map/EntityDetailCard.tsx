'use client';

import React, { useState } from 'react';
import {
  X,
  Building2,
  Target,
  Users,
  MapPin,
  Phone,
  Mail,
  Globe,
  Hash,
  Copy,
  Check,
} from 'lucide-react';

interface MapEntity {
  id: number;
  type: 'cliente' | 'lead' | 'concorrente';
  nome: string;
  latitude: number;
  longitude: number;
  cidade: string;
  uf: string;
  [key: string]: unknown;
}

interface EntityDetailCardProps {
  entity: MapEntity;
  onClose: () => void;
}

export function EntityDetailCard({ entity, onClose }: EntityDetailCardProps) {
  const [copied, setCopied] = useState(false);

  const getEntityIcon = () => {
    switch (entity.type) {
      case 'cliente':
        return <Building2 className="w-6 h-6" />;
      case 'lead':
        return <Target className="w-6 h-6" />;
      case 'concorrente':
        return <Users className="w-6 h-6" />;
    }
  };

  const getEntityColor = () => {
    switch (entity.type) {
      case 'cliente':
        return 'bg-blue-600';
      case 'lead':
        return 'bg-green-600';
      case 'concorrente':
        return 'bg-red-600';
    }
  };

  const getEntityLabel = () => {
    switch (entity.type) {
      case 'cliente':
        return 'Cliente';
      case 'lead':
        return 'Lead';
      case 'concorrente':
        return 'Concorrente';
    }
  };

  const copyToClipboard = async () => {
    const lines: string[] = [
      `Nome: ${entity.nome}`,
      `Tipo: ${getEntityLabel()}`,
      `Cidade: ${entity.cidade || 'N/A'} - ${entity.uf || 'N/A'}`,
    ];

    if (entity.cnpj) lines.push(`CNPJ: ${entity.cnpj}`);
    if (entity.setor) lines.push(`Setor: ${entity.setor}`);
    if (entity.porte) lines.push(`Porte: ${entity.porte}`);
    if (entity.email) lines.push(`Email: ${entity.email}`);
    if (entity.telefone) lines.push(`Telefone: ${entity.telefone}`);
    if (entity.site || entity.siteOficial) lines.push(`Site: ${entity.site || entity.siteOficial}`);
    if (entity.qualidadeClassificacao) lines.push(`Qualidade: ${entity.qualidadeClassificacao}`);
    if (entity.latitude && entity.longitude) {
      lines.push(`Coordenadas: ${entity.latitude}, ${entity.longitude}`);
    }

    const text = lines.join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`${getEntityColor()} text-white px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getEntityIcon()}
              <div>
                <p className="text-sm opacity-90">{getEntityLabel()}</p>
                <h2 className="text-xl font-bold">{entity.nome}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-100px)]">
          <div className="space-y-6">
            {/* Localização */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Localização
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Cidade</p>
                    <p className="font-medium text-gray-900">{entity.cidade || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">UF</p>
                    <p className="font-medium text-gray-900">{entity.uf || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações de Contato */}
            {(entity.email || entity.telefone || entity.site || entity.siteOficial) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Contato
                </h3>
                <div className="space-y-3">
                  {(entity.email as string) && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a
                        href={`mailto:${entity.email}`}
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {entity.email as string}
                      </a>
                    </div>
                  )}
                  {(entity.telefone as string) && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{entity.telefone as string}</span>
                    </div>
                  )}
                  {((entity.site as string) || (entity.siteOficial as string)) && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a
                        href={(entity.site || entity.siteOficial) as string}
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {(entity.site || entity.siteOficial) as string}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Informações Adicionais */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Informações Adicionais
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {entity.cnpj && (
                  <div className="flex items-start gap-2">
                    <Hash className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">CNPJ</p>
                      <p className="font-medium text-gray-900">{entity.cnpj as string}</p>
                    </div>
                  </div>
                )}
                {entity.setor && (
                  <div>
                    <p className="text-sm text-gray-600">Setor</p>
                    <p className="font-medium text-gray-900">{entity.setor as string}</p>
                  </div>
                )}
                {entity.porte && (
                  <div>
                    <p className="text-sm text-gray-600">Porte</p>
                    <p className="font-medium text-gray-900">{entity.porte as string}</p>
                  </div>
                )}
                {entity.qualidadeClassificacao && (
                  <div>
                    <p className="text-sm text-gray-600">Qualidade</p>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        entity.qualidadeClassificacao === 'Alta'
                          ? 'bg-green-100 text-green-800'
                          : entity.qualidadeClassificacao === 'Média'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {entity.qualidadeClassificacao as string}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Coordenadas */}
            {entity.latitude && entity.longitude && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Coordenadas
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Latitude</p>
                    <p className="font-medium text-gray-900">{entity.latitude}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Longitude</p>
                    <p className="font-medium text-gray-900">{entity.longitude}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={copyToClipboard}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              copied ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
