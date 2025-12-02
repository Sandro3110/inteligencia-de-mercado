import { useState } from 'react';
import { Link } from 'wouter';

interface ResultadoProcessamento {
  entidadeId: number;
  nomeEntidade: string;
  qualidadeAntes: number;
  qualidadeDepois: number;
  sugestoesAplicadas: string[];
  camposEnriquecidos: string[];
}

export default function ProcessamentoIA() {
  const [processando, setProcessando] = useState(false);
  const [resultados, setResultados] = useState<ResultadoProcessamento[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  
  const [opcoes, setOpcoes] = useState({
    analisarQualidade: true,
    sugerirCorrecoes: true,
    enriquecerDados: true,
    deduplicar: false,
  });

  const iniciarProcessamento = async () => {
    try {
      setProcessando(true);
      setErro(null);
      
      // Simular processamento (em produção, chamaria API real)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Resultados mockados
      const resultadosMock: ResultadoProcessamento[] = [
        {
          entidadeId: 1,
          nomeEntidade: 'Empresa Alpha Tecnologia Ltda',
          qualidadeAntes: 65,
          qualidadeDepois: 92,
          sugestoesAplicadas: [
            'Email corrigido: contato@alpha.com → contato@alphatech.com.br',
            'Telefone formatado: 1191112222 → (11) 91111-2222',
            'CNPJ validado e formatado'
          ],
          camposEnriquecidos: [
            'Setor identificado: Tecnologia',
            'Porte estimado: Médio (50-200 funcionários)',
            'Receita estimada: R$ 5-10M/ano'
          ]
        },
        {
          entidadeId: 2,
          nomeEntidade: 'Beta Comércio e Serviços SA',
          qualidadeAntes: 78,
          qualidadeDepois: 95,
          sugestoesAplicadas: [
            'Site atualizado: http://beta.com → https://betasolutions.com',
            'Endereço padronizado'
          ],
          camposEnriquecidos: [
            'Setor identificado: Serviços',
            'Porte estimado: Grande (200+ funcionários)'
          ]
        }
      ];
      
      setResultados(resultadosMock);
    } catch (err) {
      setErro('Erro ao processar dados com IA');
      console.error(err);
    } finally {
      setProcessando(false);
    }
  };

  const getQualidadeColor = (qualidade: number) => {
    if (qualidade >= 90) return 'text-green-600';
    if (qualidade >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Processamento com IA</h1>
        <p className="text-gray-600 mt-1">
          Analise e melhore a qualidade dos seus dados automaticamente
        </p>
      </div>

      {/* Opções de Processamento */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Opções de Processamento</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-4 border rounded hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={opcoes.analisarQualidade}
              onChange={(e) => setOpcoes({ ...opcoes, analisarQualidade: e.target.checked })}
              className="w-5 h-5"
            />
            <div>
              <div className="font-medium">Analisar Qualidade</div>
              <div className="text-sm text-gray-600">
                Avaliar completude e consistência dos dados
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border rounded hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={opcoes.sugerirCorrecoes}
              onChange={(e) => setOpcoes({ ...opcoes, sugerirCorrecoes: e.target.checked })}
              className="w-5 h-5"
            />
            <div>
              <div className="font-medium">Sugerir Correções</div>
              <div className="text-sm text-gray-600">
                Identificar e corrigir erros automaticamente
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border rounded hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={opcoes.enriquecerDados}
              onChange={(e) => setOpcoes({ ...opcoes, enriquecerDados: e.target.checked })}
              className="w-5 h-5"
            />
            <div>
              <div className="font-medium">Enriquecer Dados</div>
              <div className="text-sm text-gray-600">
                Adicionar informações complementares
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border rounded hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={opcoes.deduplicar}
              onChange={(e) => setOpcoes({ ...opcoes, deduplicar: e.target.checked })}
              className="w-5 h-5"
            />
            <div>
              <div className="font-medium">Deduplicar</div>
              <div className="text-sm text-gray-600">
                Identificar e mesclar registros duplicados
              </div>
            </div>
          </label>
        </div>

        <div className="mt-6">
          <button
            onClick={iniciarProcessamento}
            disabled={processando}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {processando ? 'Processando...' : 'Iniciar Processamento'}
          </button>
        </div>
      </div>

      {/* Erro */}
      {erro && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {erro}
        </div>
      )}

      {/* Resultados */}
      {resultados.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Resultados do Processamento</h2>
            <div className="text-sm text-gray-600">
              {resultados.length} entidades processadas
            </div>
          </div>

          <div className="space-y-4">
            {resultados.map((resultado) => (
              <div key={resultado.entidadeId} className="border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{resultado.nomeEntidade}</h3>
                    <Link href={`/entidade/${resultado.entidadeId}`}>
                      <a className="text-sm text-blue-600 hover:underline">
                        Ver detalhes →
                      </a>
                    </Link>
                  </div>
                  
                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getQualidadeColor(resultado.qualidadeAntes)}`}>
                        {resultado.qualidadeAntes}%
                      </div>
                      <div className="text-xs text-gray-500">Antes</div>
                    </div>
                    <div className="text-2xl text-gray-400">→</div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getQualidadeColor(resultado.qualidadeDepois)}`}>
                        {resultado.qualidadeDepois}%
                      </div>
                      <div className="text-xs text-gray-500">Depois</div>
                    </div>
                  </div>
                </div>

                {resultado.sugestoesAplicadas.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">
                      ✓ Correções Aplicadas ({resultado.sugestoesAplicadas.length})
                    </h4>
                    <ul className="space-y-1">
                      {resultado.sugestoesAplicadas.map((sugestao, idx) => (
                        <li key={idx} className="text-sm text-gray-600 pl-4">
                          • {sugestao}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {resultado.camposEnriquecidos.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">
                      ✨ Dados Enriquecidos ({resultado.camposEnriquecidos.length})
                    </h4>
                    <ul className="space-y-1">
                      {resultado.camposEnriquecidos.map((campo, idx) => (
                        <li key={idx} className="text-sm text-gray-600 pl-4">
                          • {campo}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t">
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                      +{resultado.qualidadeDepois - resultado.qualidadeAntes}% de qualidade
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                      {resultado.sugestoesAplicadas.length + resultado.camposEnriquecidos.length} melhorias
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">✓ Processamento concluído!</span>
              {' '}
              As alterações foram aplicadas automaticamente. Você pode revisar e editar manualmente se necessário.
            </p>
          </div>
        </div>
      )}

      {/* Estado Inicial */}
      {resultados.length === 0 && !processando && (
        <div className="bg-gray-50 border-2 border-dashed rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Pronto para processar seus dados
          </h3>
          <p className="text-gray-600 mb-4">
            Selecione as opções desejadas e clique em "Iniciar Processamento"
          </p>
          <p className="text-sm text-gray-500">
            O processamento com IA irá analisar todas as entidades da base de dados
          </p>
        </div>
      )}
    </div>
  );
}
