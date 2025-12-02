import { useState, useCallback } from 'react';
import { trpc } from '../lib/trpc';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

type Step = 'upload' | 'preview' | 'mapping' | 'validating' | 'importing' | 'complete';

interface PreviewData {
  headers: string[];
  rows: any[];
  totalRows: number;
}

interface Mapping {
  [key: string]: string;
}

export default function ImportacaoPage() {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [mapping, setMapping] = useState<Mapping>({});
  const [projetoId, setProjetoId] = useState<number>(0);
  const [pesquisaId, setPesquisaId] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const [importacaoId, setImportacaoId] = useState<number | null>(null);

  const projetos = trpc.projetos.list.useQuery({ limit: 100 });
  console.log('DEBUG projetos:', projetos.data);
  const pesquisas = trpc.pesquisas.list.useQuery(
    { projetoId, limit: 100 },
    { enabled: projetoId > 0 }
  );
  const createImportacao = trpc.importacao.create.useMutation();
  const startImportacao = trpc.importacao.start.useMutation();

  // Upload com drag-and-drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    await parseFile(uploadedFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
  });

  // Parse arquivo
  const parseFile = async (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        preview: 10,
        complete: (results) => {
          setPreviewData({
            headers: results.meta.fields || [],
            rows: results.data,
            totalRows: results.data.length,
          });
          autoDetectMapping(results.meta.fields || []);
          setStep('preview');
        },
      });
    } else if (extension === 'xlsx') {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const headers = data[0] as string[];
      const rows = data.slice(1, 11);

      setPreviewData({
        headers,
        rows: rows.map((row: any) => {
          const obj: any = {};
          headers.forEach((h, i) => {
            obj[h] = row[i];
          });
          return obj;
        }),
        totalRows: data.length - 1,
      });
      autoDetectMapping(headers);
      setStep('preview');
    }
  };

  // Auto-detectar mapeamento
  const autoDetectMapping = (headers: string[]) => {
    const detected: Mapping = {};
    headers.forEach((h) => {
      const lower = h.toLowerCase();
      if (lower.includes('nome') || lower.includes('razao')) detected.nome = h;
      if (lower.includes('status')) detected.status = h;
      if (lower.includes('cnpj')) detected.cnpj = h;
      if (lower.includes('email')) detected.email = h;
      if (lower.includes('cidade')) detected.cidade = h;
      if (lower === 'uf' || lower.includes('estado')) detected.uf = h;
    });
    setMapping(detected);
  };

  // Iniciar importação
  const handleImport = async () => {
    if (!file || !projetoId || !pesquisaId) return;

    setStep('importing');
    setProgress(0);

    try {
      const result = await createImportacao.mutateAsync({
        projetoId,
        pesquisaId,
        nomeArquivo: file.name,
        tipoArquivo: file.name.endsWith('.csv') ? 'csv' : 'xlsx',
        totalLinhas: previewData?.totalRows || 0,
        mapeamentoColunas: mapping,
      });

      setImportacaoId(result.id);

      await startImportacao.mutateAsync(result.id);

      // Simular progresso (TODO: implementar WebSocket real)
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep('complete');
            return 100;
          }
          return prev + 10;
        });
      }, 500);
    } catch (error) {
      console.error('Erro na importação:', error);
      alert('Erro ao importar arquivo');
    }
  };

  // Renderizar steps
  if (step === 'upload') {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Importar Entidades</h1>

        {/* Seleção de Projeto/Pesquisa */}
        <div className="space-y-4 max-w-2xl mb-8">
          <div>
            <label className="block text-sm font-medium mb-2">Projeto *</label>
            <select
              value={projetoId}
              onChange={(e) => setProjetoId(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
            >
              <option value={0}>Selecione um projeto</option>
              {Array.isArray(projetos.data?.projetos) && projetos.data.projetos.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>

          {projetoId > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Pesquisa *</label>
              <select
                value={pesquisaId}
                onChange={(e) => setPesquisaId(Number(e.target.value))}
                className="w-full border rounded px-3 py-2"
              >
                <option value={0}>Selecione uma pesquisa</option>
                {Array.isArray(pesquisas.data?.pesquisas) && pesquisas.data.pesquisas.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Upload */}
        {projetoId > 0 && pesquisaId > 0 && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-6xl mb-4">📁</div>
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Solte o arquivo aqui' : 'Arraste um arquivo CSV ou Excel'}
            </p>
            <p className="text-sm text-gray-500">ou clique para selecionar</p>
          </div>
        )}
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Preview dos Dados</h1>

        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Arquivo: <strong>{file?.name}</strong> | Total de linhas: <strong>{previewData?.totalRows}</strong>
          </p>
        </div>

        {/* Mapeamento */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Mapeamento de Colunas</h2>
          <div className="grid grid-cols-2 gap-4 max-w-2xl">
            {['nome', 'status', 'cnpj', 'email', 'cidade', 'uf'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-2 capitalize">
                  {field} {field === 'nome' || field === 'status' ? '*' : ''}
                </label>
                <select
                  value={mapping[field] || ''}
                  onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Não mapear</option>
                  {previewData?.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Preview tabela */}
        <div className="mb-6 overflow-x-auto">
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                {previewData?.headers.map((h) => (
                  <th key={h} className="border px-4 py-2 text-left text-sm">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData?.rows.map((row, i) => (
                <tr key={i}>
                  {previewData.headers.map((h) => (
                    <td key={h} className="border px-4 py-2 text-sm">
                      {row[h]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Botões */}
        <div className="flex gap-4">
          <button
            onClick={() => setStep('upload')}
            className="px-6 py-2 border rounded hover:bg-gray-50"
          >
            Voltar
          </button>
          <button
            onClick={handleImport}
            disabled={!mapping.nome || !mapping.status}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Importar
          </button>
        </div>
      </div>
    );
  }

  if (step === 'importing') {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Importando...</h1>
        <div className="max-w-2xl">
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <p className="text-center text-sm text-gray-600">{progress}% concluído</p>
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6 text-green-600">✓ Importação Concluída!</h1>
        <div className="space-y-4">
          <p>Arquivo importado com sucesso.</p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setStep('upload');
                setFile(null);
                setPreviewData(null);
                setMapping({});
                setProgress(0);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Nova Importação
            </button>
            <button
              onClick={() => (window.location.href = '/entidades')}
              className="px-6 py-2 border rounded hover:bg-gray-50"
            >
              Ver Entidades
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
