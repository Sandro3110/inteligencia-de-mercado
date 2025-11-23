/**
 * Componente de Upload de Planilhas com Drag & Drop
 * Fase 42.2 - Upload funcional CSV/Excel
 */

import { useState, useRef, DragEvent, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileSpreadsheet,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import type { ResearchWizardData } from "@/types/research-wizard";
import { ColumnMapper } from "@/components/ColumnMapper";

interface FileUploadZoneProps {
  data: ResearchWizardData;
  updateData: (d: Partial<ResearchWizardData>) => void;
  tipo: "mercado" | "cliente";
}

interface ParsedRow {
  data: any;
  valid: boolean;
  errors?: string[];
  rowNumber: number;
}

export default function FileUploadZone({
  data,
  updateData,
  tipo,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showMapping, setShowMapping] = useState(false);
  const [rawData, setRawData] = useState<{ headers: string[]; rows: any[][] }>({
    headers: [],
    rows: [],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mutation para fazer upload e parse (endpoint não implementado)
  const uploadMutation = (trpc as any).spreadsheet?.parse.useMutation({
    onSuccess: (result: any) => {
      if (result.success && result.rows) {
        // Simular validação (em produção, viria do backend)
        const validated = result.rows.map((row: any, index: number) => ({
          data: row,
          valid: !!row.nome, // Validação simples: nome é obrigatório
          errors: !row.nome ? ["Nome é obrigatório"] : [],
          rowNumber: index + 1,
        }));

        setParsedData(validated);
        setShowPreview(true);
      }
    },
  });

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    const validExtensions = [".csv", ".xlsx", ".xls"];
    const fileExtension = selectedFile.name
      .substring(selectedFile.name.lastIndexOf("."))
      .toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      alert("Formato inválido. Apenas CSV e Excel (.xlsx, .xls) são aceitos.");
      return;
    }

    setFile(selectedFile);

    // Ler arquivo e fazer parse
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      parseCSV(content);
    };

    if (fileExtension === ".csv") {
      reader.readAsText(selectedFile);
    } else {
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  // Parse real de CSV
  const parseCSV = useCallback((text: string) => {
    const lines = text.split("\n").filter(line => line.trim());
    if (lines.length === 0) {
      alert("Arquivo CSV vazio");
      return;
    }

    // Detectar delimitador (vírgula, ponto-e-vírgula ou tab)
    const firstLine = lines[0];
    const delimiter = firstLine.includes(";")
      ? ";"
      : firstLine.includes("\t")
        ? "\t"
        : ",";

    const headers = lines[0]
      .split(delimiter)
      .map(h => h.trim().replace(/^"|"$/g, ""));
    const rows = lines.slice(1).map(line => {
      return line
        .split(delimiter)
        .map(cell => cell.trim().replace(/^"|"$/g, ""));
    });

    setRawData({ headers, rows });
    setShowMapping(true);
  }, []);

  const handleMappingComplete = useCallback(
    (mapping: Record<string, string>) => {
      // Converter dados brutos em formato estruturado usando o mapeamento
      const mappedRows: ParsedRow[] = rawData.rows.map((row, index) => {
        const data: any = {};

        Object.entries(mapping).forEach(([targetField, sourceColumn]) => {
          const colIndex = rawData.headers.indexOf(sourceColumn);
          if (colIndex !== -1) {
            data[targetField] = row[colIndex];
          }
        });

        // Validação simples
        const valid = !!data.nome;
        const errors = !data.nome ? ["Nome é obrigatório"] : [];

        return {
          data,
          valid,
          errors,
          rowNumber: index + 1,
        };
      });

      setParsedData(mappedRows);
      setShowMapping(false);
      setShowPreview(true);
    },
    [rawData]
  );

  const handleImportValid = () => {
    const validRows = parsedData.filter(r => r.valid);

    if (tipo === "mercado") {
      const newMercados = validRows.map(r => ({
        nome: r.data.nome,
        segmentacao: (r.data.segmentacao || "B2B") as
          | "B2B"
          | "B2C"
          | "B2B2C"
          | "B2G",
      }));

      updateData({
        mercados: [...data.mercados, ...newMercados],
      });
    } else {
      const newClientes = validRows.map(r => ({
        nome: r.data.nome,
        razaoSocial: r.data.razaoSocial,
        cnpj: r.data.cnpj,
        site: r.data.site,
        email: r.data.email,
        telefone: r.data.telefone,
        cidade: r.data.cidade,
        uf: r.data.uf,
        porte: r.data.porte as
          | "MEI"
          | "ME"
          | "EPP"
          | "Médio"
          | "Grande"
          | undefined,
      }));

      updateData({
        clientes: [...(data.clientes || []), ...newClientes],
      });
    }

    // Limpar
    setShowPreview(false);
    setParsedData([]);
    setFile(null);
  };

  const validCount = parsedData.filter(r => r.valid).length;
  const invalidCount = parsedData.filter(r => !r.valid).length;

  // Definir campos alvo baseado no tipo
  const targetFields =
    tipo === "mercado"
      ? [
          {
            key: "nome",
            label: "Nome",
            required: true,
            description: "Nome do mercado",
          },
          {
            key: "segmentacao",
            label: "Segmentação",
            required: false,
            description: "B2B, B2C, B2B2C ou B2G",
          },
        ]
      : [
          {
            key: "nome",
            label: "Nome",
            required: true,
            description: "Nome da empresa",
          },
          { key: "razaoSocial", label: "Razão Social", required: false },
          { key: "cnpj", label: "CNPJ", required: false },
          { key: "site", label: "Site", required: false },
          { key: "email", label: "Email", required: false },
          { key: "telefone", label: "Telefone", required: false },
          { key: "cidade", label: "Cidade", required: false },
          { key: "uf", label: "UF", required: false },
          { key: "porte", label: "Porte", required: false },
        ];

  return (
    <div className="space-y-6">
      {/* Mapeamento de Colunas */}
      {showMapping && (
        <ColumnMapper
          sourceColumns={rawData.headers}
          targetFields={targetFields}
          onMappingComplete={handleMappingComplete}
          previewData={rawData.rows}
        />
      )}

      {/* Zona de Upload */}
      {!showPreview && !showMapping && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Upload de Planilha
            </CardTitle>
            <CardDescription>
              Arraste um arquivo CSV ou Excel, ou clique para selecionar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer
                ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
              `}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload
                className={`w-12 h-12 mx-auto mb-4 ${isDragging ? "text-blue-600" : "text-muted-foreground"}`}
              />

              {file ? (
                <div className="space-y-2">
                  <p className="text-lg font-semibold">{file.name}</p>
                  <Badge>{(file.size / 1024).toFixed(2)} KB</Badge>
                </div>
              ) : (
                <>
                  <p className="text-lg font-semibold mb-2">
                    {isDragging
                      ? "Solte o arquivo aqui"
                      : "Arraste um arquivo aqui"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    ou clique para selecionar
                  </p>
                  <Button variant="outline">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Selecionar Arquivo
                  </Button>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={e => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) {
                    handleFileSelect(selectedFile);
                  }
                }}
              />
            </div>

            {/* Instruções */}
            <Alert className="mt-4">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                <strong>Formato esperado:</strong> A planilha deve conter as
                colunas: nome (obrigatório),
                {tipo === "mercado"
                  ? " segmentacao"
                  : " razaoSocial, cnpj, site, email, telefone, cidade, uf, porte"}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Preview de Dados */}
      {showPreview && parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Preview dos Dados</span>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-green-50">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {validCount} válidos
                </Badge>
                {invalidCount > 0 && (
                  <Badge variant="outline" className="bg-red-50">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {invalidCount} inválidos
                  </Badge>
                )}
              </div>
            </CardTitle>
            <CardDescription>
              Revise os dados importados antes de adicionar ao wizard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tabela de Preview */}
            <div className="max-h-96 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">#</th>
                    <th className="p-2 text-left">Nome</th>
                    {tipo === "cliente" && (
                      <>
                        <th className="p-2 text-left">Cidade</th>
                        <th className="p-2 text-left">UF</th>
                      </>
                    )}
                    <th className="p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((row, index) => (
                    <tr
                      key={index}
                      className={`border-t ${row.valid ? "" : "bg-red-50"}`}
                    >
                      <td className="p-2">{row.rowNumber}</td>
                      <td className="p-2">
                        {row.data.nome || (
                          <span className="text-red-500">-</span>
                        )}
                      </td>
                      {tipo === "cliente" && (
                        <>
                          <td className="p-2">{row.data.cidade || "-"}</td>
                          <td className="p-2">{row.data.uf || "-"}</td>
                        </>
                      )}
                      <td className="p-2">
                        {row.valid ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-xs">{row.errors?.[0]}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-2">
              <Button
                onClick={handleImportValid}
                disabled={validCount === 0}
                className="flex-1"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Importar {validCount} Registros Válidos
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPreview(false);
                  setParsedData([]);
                  setFile(null);
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
