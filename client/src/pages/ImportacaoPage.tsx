import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

type Step = 'upload' | 'preview' | 'importing' | 'complete';

interface PreviewData {
  headers: string[];
  rows: any[];
  totalRows: number;
}

interface Mapping {
  [key: string]: string;
}

interface Projeto {
  id: number;
  nome: string;
  codigo: string;
}

interface Pesquisa {
  id: number;
  nome: string;
  status: string;
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
  
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [pesquisas, setPesquisas] = useState<Pesquisa[]>([]);
  const [loadingProjetos, setLoadingProjetos] = useState(true);
  const [loadingPesquisas, setLoadingPesquisas] = useState(false);

  // Carregar projetos ao montar
  useEffect(() => {
    carregarProjetos();
  }, []);

  // Carregar pesquisas quando projeto mudar
  useEffect(() => {
    if (projetoId > 0) {
      carregarPesquisas(projetoId);
    } else {
      setPesquisas([]);
      setPesquisaId(0);
    }
  }, [projetoId]);

  const carregarProjetos = async () => {
    try {
      setLoadingProjetos(true);
      const response = await fetch('/api/projetos');
      if (!response.ok) throw new Error('Erro ao carregar projetos');
      const data = await response.json();
      setProjetos(data.projetos || []);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      toast.error('Erro ao carregar projetos');
    } finally {
      setLoadingProjetos(false);
    }
  };

  const carregarPesquisas = async (projetoId: number) => {
    try {
      setLoadingPesquisas(true);
      const response = await fetch(`/api/pesquisas?projetoId=${projetoId}`);
      if (!response.ok) throw new Error('Erro ao carregar pesquisas');
      const data = await response.json();
      setPesquisas(data.pesquisas || []);
    } catch (error) {
      console.error('Erro ao carregar pesquisas:', error);
      toast.error('Erro ao carregar pesquisas');
    } finally {
      setLoadingPesquisas(false);
    }
  };

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
      if (lower.includes('status') || lower.includes('tipo')) detected.status = h;
      if (lower.includes('cnpj')) detected.cnpj = h;
      if (lower.includes('email')) detected.email = h;
      if (lower.includes('telefone') || lower.includes('phone')) detected.telefone = h;
      if (lower.includes('site') || lower.includes('website')) detected.site = h;
      if (lower.includes('fantasia')) detected.nome_fantasia = h;
      if (lower.includes('filiais')) detected.num_filiais = h;
      if (lower.includes('lojas')) detected.num_lojas = h;
      if (lower.includes('funcionarios') || lower.includes('employees')) detected.num_funcionarios = h;
    });
    setMapping(detected);
  };

  // Iniciar importação
  const handleImport = async () => {
    if (!file || !projetoId || !pesquisaId) {
      toast.error('Selecione projeto e pesquisa');
      return;
    }

    if (!mapping.nome) {
      toast.error('Campo "nome" é obrigatório');
      return;
    }

    setStep('importing');
    setProgress(0);

    try {
      // 1. Ler arquivo completo
      const csvData = await readFullFile(file);
      
      setProgress(20);

      // 2. Aplicar mapeamento de colunas
      const mappedData = csvData.map((row: any) => ({
        nome: row[mapping.nome] || '',
        tipo_entidade: row[mapping.status] || 'cliente',
        cnpj: row[mapping.cnpj] || '',
        email: row[mapping.email] || '',
        telefone: row[mapping.telefone] || '',
        site: row[mapping.site] || '',
        nome_fantasia: row[mapping.nome_fantasia] || '',
        num_filiais: parseInt(row[mapping.num_filiais]) || 0,
        num_lojas: parseInt(row[mapping.num_lojas]) || 0,
        num_funcionarios: parseInt(row[mapping.num_funcionarios]) || undefined,
      }));

      setProgress(40);

      // 3. Enviar para API de upload
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projetoId,
          pesquisaId,
          csvData: mappedData,
          nomeArquivo: file.name,
        }),
      });

      setProgress(80);

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro ao processar arquivo');
      }

      setImportacaoId(result.importacaoId);
      setProgress(100);
      setStep('complete');

      toast.success(`${result.totalImportadas} entidades importadas com sucesso!`);
      console.log('Importação concluída:', result);
    } catch (error: any) {
      console.error('Erro na importação:', error);
      toast.error(`Erro ao importar arquivo: ${error.message}`);
      setStep('preview');
    }
  };

  // Ler arquivo completo
  const readFullFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension === 'csv') {
        Papa.parse(file, {
          header: true,
          complete: (results) => {
            resolve(results.data);
          },
          error: (error) => {
            reject(error);
          },
        });
      } else if (extension === 'xlsx') {
        file.arrayBuffer().then((buffer) => {
          const workbook = XLSX.read(buffer);
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(sheet);
          resolve(data);
        }).catch(reject);
      } else {
        reject(new Error('Formato de arquivo não suportado'));
      }
    });
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
              className="w-full border rounded px-3 py-2 bg-white"
              disabled={loadingProjetos}
            >
              <option value={0}>
                {loadingProjetos ? 'Carregando...' : 'Selecione um projeto'}
              </option>
              {projetos.map((p) => (
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
                className="w-full border rounded px-3 py-2 bg-white"
                disabled={loadingPesquisas}
              >
                <option value={0}>
                  {loadingPesquisas ? 'Carregando...' : 'Selecione uma pesquisa'}
                </option>
                {pesquisas.map((p) => (
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
          <div className="grid grid-cols-2 gap-4 max-w-3xl">
            {['nome', 'status', 'cnpj', 'email', 'telefone', 'site', 'nome_fantasia', 'num_filiais', 'num_lojas', 'num_funcionarios'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-2">
                  {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} {field === 'nome' ? '*' : ''}
                </label>
                <select
                  value={mapping[field] || ''}
                  onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                  className="w-full border rounded px-3 py-2 bg-white"
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
            disabled={!mapping.nome}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
              onClick={() => (window.location.href = '/enriquecimento')}
              className="px-6 py-2 border rounded hover:bg-gray-50"
            >
              Enriquecer Entidades
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
