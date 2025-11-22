import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileSpreadsheet, FileText, X, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ParsedData {
  headers: string[];
  rows: any[][];
  fileName: string;
}

interface FileUploadParserProps {
  onDataParsed: (data: ParsedData) => void;
  acceptedFormats?: string[];
  maxSizeMB?: number;
  title?: string;
  description?: string;
}

export function FileUploadParser({
  onDataParsed,
  acceptedFormats = [".csv", ".xlsx", ".xls"],
  maxSizeMB = 10,
  title = "Importar Arquivo",
  description = "Faça upload de um arquivo CSV ou Excel",
}: FileUploadParserProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const parseCSV = (text: string): ParsedData => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length === 0) {
      throw new Error("Arquivo CSV vazio");
    }

    const headers = lines[0].split(/[,;|\t]/).map((h) => h.trim().replace(/^"|"$/g, ""));
    const rows = lines.slice(1).map((line) => {
      return line.split(/[,;|\t]/).map((cell) => cell.trim().replace(/^"|"$/g, ""));
    });

    return { headers, rows, fileName: uploadedFile?.name || "unknown" };
  };

  const parseExcel = async (file: File): Promise<ParsedData> => {
    // Para Excel, vamos usar uma abordagem simplificada
    // Em produção, você pode usar bibliotecas como xlsx ou exceljs
    const text = await file.text();
    
    // Tentar detectar se é um CSV disfarçado de Excel
    if (text.includes(",") || text.includes(";")) {
      return parseCSV(text);
    }

    throw new Error("Formato Excel não suportado diretamente. Por favor, salve como CSV.");
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setParseError(null);

    try {
      // Validar tamanho
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        throw new Error(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`);
      }

      // Validar formato
      const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
      if (!extension || !acceptedFormats.includes(extension)) {
        throw new Error(`Formato não suportado. Aceitos: ${acceptedFormats.join(", ")}`);
      }

      let parsedData: ParsedData;

      if (extension === ".csv") {
        const text = await file.text();
        parsedData = parseCSV(text);
      } else if (extension === ".xlsx" || extension === ".xls") {
        parsedData = await parseExcel(file);
      } else {
        throw new Error("Formato de arquivo não reconhecido");
      }

      // Validar dados parseados
      if (parsedData.headers.length === 0) {
        throw new Error("Nenhuma coluna encontrada no arquivo");
      }

      if (parsedData.rows.length === 0) {
        throw new Error("Nenhuma linha de dados encontrada no arquivo");
      }

      setUploadedFile(file);
      onDataParsed(parsedData);
      toast.success(`Arquivo processado com sucesso! ${parsedData.rows.length} linhas encontradas.`);
    } catch (error: any) {
      const errorMsg = error.message || "Erro ao processar arquivo";
      setParseError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [maxSizeMB, acceptedFormats]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setParseError(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!uploadedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <Upload className="h-8 w-8 text-gray-600" />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Arraste e solte seu arquivo aqui, ou
                </p>
                <Label htmlFor="file-upload">
                  <Button
                    variant="outline"
                    disabled={isProcessing}
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    {isProcessing ? "Processando..." : "Selecionar Arquivo"}
                  </Button>
                </Label>
                <input
                  id="file-upload"
                  type="file"
                  accept={acceptedFormats.join(",")}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              <div className="flex gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="gap-1">
                  <FileSpreadsheet className="h-3 w-3" />
                  CSV
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <FileText className="h-3 w-3" />
                  Excel
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground">
                Tamanho máximo: {maxSizeMB}MB
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    {uploadedFile.name}
                  </p>
                  <p className="text-xs text-green-700">
                    {(uploadedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                className="text-green-700 hover:text-green-900"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {parseError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{parseError}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
