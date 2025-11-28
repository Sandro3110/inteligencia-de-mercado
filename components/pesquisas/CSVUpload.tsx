'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CSVUploadProps {
  onFileSelect: (file: File, preview: string[][]) => void;
  onClear: () => void;
  selectedFile: File | null;
}

export function CSVUpload({ onFileSelect, onClear, selectedFile }: CSVUploadProps) {
  const [preview, setPreview] = useState<string[][] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n').filter((line) => line.trim());
    return lines.map((line) => {
      // Simple CSV parser - handles basic cases
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }

      values.push(current.trim());
      return values;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setError('Por favor, selecione um arquivo CSV válido');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Arquivo muito grande. Tamanho máximo: 10MB');
      return;
    }

    try {
      const text = await file.text();
      const parsed = parseCSV(text);

      if (parsed.length < 2) {
        setError('O arquivo CSV deve conter pelo menos um cabeçalho e uma linha de dados');
        return;
      }

      // Validate headers (must include 'nome' or 'cnpj')
      const headers = parsed[0].map((h) => h.toLowerCase());
      if (!headers.includes('nome') && !headers.includes('cnpj')) {
        setError('O CSV deve conter pelo menos uma coluna "nome" ou "cnpj"');
        return;
      }

      // Show preview (first 6 rows including header)
      const previewData = parsed.slice(0, 6);
      setPreview(previewData);
      onFileSelect(file, parsed);
    } catch (err) {
      setError('Erro ao ler o arquivo. Verifique se é um CSV válido.');
      console.error('CSV parse error:', err);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear();
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div>
          <label
            htmlFor="csv-upload"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
              <p className="mb-2 text-sm text-gray-700">
                <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
              </p>
              <p className="text-xs text-gray-500">Arquivo CSV (máx. 10MB)</p>
            </div>
            <input
              id="csv-upload"
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {error && (
            <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Formato esperado do CSV:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Primeira linha: cabeçalhos das colunas</li>
              <li>
                • Colunas obrigatórias: <code className="bg-blue-100 px-1 rounded">nome</code> ou{' '}
                <code className="bg-blue-100 px-1 rounded">cnpj</code>
              </li>
              <li>• Colunas opcionais: cidade, uf, setor, telefone, email, etc.</li>
              <li>• Encoding: UTF-8</li>
            </ul>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">{selectedFile.name}</p>
                <p className="text-sm text-green-700">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                  {preview && ` • ${preview.length - 1} linhas`}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {preview && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-700">Preview (primeiras 5 linhas)</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      {preview[0].map((header, i) => (
                        <th
                          key={i}
                          className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.slice(1).map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        {row.map((cell, j) => (
                          <td key={j} className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                            {cell || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
