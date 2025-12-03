import React from 'react';

interface FunnelInputProps {
  empresa: string;
  etapas: string[];
  tempo?: number;
  custo?: number;
  progresso?: number;
}

export function FunnelInput({ empresa, etapas, tempo, custo, progresso = 0 }: FunnelInputProps) {
  const formatTempo = (ms?: number) => {
    if (!ms) return '0s';
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatCusto = (valor?: number) => {
    if (!valor) return '$0.00';
    return `$${valor.toFixed(4)}`;
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-gradient-to-b from-blue-50 to-white rounded-lg border-2 border-blue-200">
      {/* Título */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-700">📥 ENTRADA</h3>
        <p className="text-sm text-gray-500">Dados a processar</p>
      </div>

      {/* Empresa */}
      <div className="w-full max-w-xs">
        <div className="bg-white border-4 border-blue-400 rounded-lg p-4 shadow-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{empresa}</div>
            <div className="text-xs text-gray-500 mt-1">Empresa alvo</div>
          </div>
        </div>
      </div>

      {/* Seta */}
      <div className="text-4xl text-blue-400">↓</div>

      {/* Etapas planejadas */}
      <div className="w-full max-w-xs">
        <div className="bg-white border-4 border-blue-300 rounded-lg p-4 shadow-md">
          <div className="text-center mb-2">
            <div className="text-lg font-semibold text-blue-600">{etapas.length} Etapas</div>
            <div className="text-xs text-gray-500">Planejadas</div>
          </div>
        </div>
      </div>

      {/* Seta */}
      <div className="text-4xl text-blue-400">↓</div>

      {/* Lista de etapas */}
      <div className="w-full max-w-xs">
        <div className="bg-white border-4 border-blue-200 rounded-lg p-4 shadow-sm">
          <ul className="space-y-2">
            {etapas.map((etapa, index) => (
              <li key={index} className="flex items-center text-sm text-gray-700">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold mr-2">
                  {index + 1}
                </span>
                {etapa}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Seta */}
      <div className="text-4xl text-blue-400">↓</div>

      {/* Métricas */}
      <div className="w-full max-w-xs">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 shadow-lg text-white">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-xs opacity-80">Tempo</div>
              <div className="text-lg font-bold">{formatTempo(tempo)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs opacity-80">Custo</div>
              <div className="text-lg font-bold">{formatCusto(custo)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="w-full max-w-xs">
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500 ease-out"
            style={{ width: `${progresso}%` }}
          />
        </div>
        <div className="text-center mt-1 text-sm font-semibold text-blue-600">
          {progresso}%
        </div>
      </div>
    </div>
  );
}
