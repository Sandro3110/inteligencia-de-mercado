import { useState, useEffect } from 'react';

interface ErroImportacao {
  id: number;
  importacaoId: number;
  linhaNumero: number;
  dadosLinha: string;
  tipoErro: string;
  mensagemErro: string;
  createdAt: string;
}

interface ModalErrosImportacaoProps {
  importacaoId: number;
  nomeArquivo: string;
  onClose: () => void;
}

export default function ModalErrosImportacao({ 
  importacaoId, 
  nomeArquivo, 
  onClose 
}: ModalErrosImportacaoProps) {
  const [erros, setErros] = useState<ErroImportacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchErros() {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/trpc/importacao.getErros?input=${encodeURIComponent(JSON.stringify({ importacaoId, limit: 100 }))}`
        );
        const data = await response.json();
        
        if (data.result && data.result.data) {
          setErros(data.result.data);
        }
      } catch (err) {
        setError('Erro ao carregar detalhes dos erros');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchErros();
  }, [importacaoId]);

  const getTipoErroColor = (tipo: string) => {
    const colors: Record<string, string> = {
      validacao: 'bg-yellow-100 text-yellow-800',
      duplicacao: 'bg-blue-100 text-blue-800',
      constraint: 'bg-red-100 text-red-800',
      parsing: 'bg-orange-100 text-orange-800',
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Erros de Importação</h2>
            <p className="text-gray-600 mt-1">{nomeArquivo}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando erros...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {!isLoading && !error && erros.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Nenhum erro encontrado</p>
            </div>
          )}

          {!isLoading && !error && erros.length > 0 && (
            <div className="space-y-4">
              {/* Resumo */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">{erros.length} erros encontrados</span>
                  {' - '}
                  Revise os detalhes abaixo para corrigir os problemas
                </p>
              </div>

              {/* Lista de Erros */}
              {erros.map((erro) => (
                <div key={erro.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        Linha {erro.linhaNumero}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTipoErroColor(erro.tipoErro)}`}>
                        {erro.tipoErro}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      ID: {erro.id}
                    </span>
                  </div>

                  {/* Mensagem de Erro */}
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Erro:</p>
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {erro.mensagemErro}
                    </p>
                  </div>

                  {/* Dados da Linha */}
                  {erro.dadosLinha && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Dados da linha:</p>
                      <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto border">
                        {erro.dadosLinha}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {erros.length > 0 && (
              <span>Total de {erros.length} erro{erros.length > 1 ? 's' : ''}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
