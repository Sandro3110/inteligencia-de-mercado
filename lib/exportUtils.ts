export interface ExportData {
  headers: string[];
  rows: (string | number | boolean | null)[][];
  filename?: string;
}

export function exportToCSV(data: ExportData): void {
  const { headers, rows, filename = "export.csv" } = data;

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          if (cell === null || cell === undefined) return "";
          const cellStr = String(cell);
          if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(",")
    ),
  ].join("\n");

  downloadFile(csvContent, filename, "text/csv;charset=utf-8;");
}

export function exportToExcel(data: ExportData): void {
  // For now, export as CSV with .xlsx extension
  // In production, use a library like xlsx or exceljs
  const { headers, rows, filename = "export.xlsx" } = data;
  exportToCSV({ headers, rows, filename: filename.replace(".xlsx", ".csv") });
}

export function exportToPDF(data: ExportData): void {
  // Simple text-based PDF export
  // In production, use a library like jsPDF or pdfmake
  const { headers, rows, filename = "export.pdf" } = data;
  
  const content = [
    headers.join(" | "),
    headers.map(() => "---").join(" | "),
    ...rows.map((row) => row.join(" | ")),
  ].join("\n");

  downloadFile(content, filename, "application/pdf");
}

export function formatDataForExport<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; label: string }[]
): { headers: string[]; rows: (string | number | boolean | null)[][] } {
  const headers = columns.map((col) => col.label);
  const rows = data.map((item) =>
    columns.map((col) => {
      const value = item[col.key];
      if (value === null || value === undefined) return null;
      if (typeof value === "object") return JSON.stringify(value);
      return value as string | number | boolean;
    })
  );

  return { headers, rows };
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function calculateQualityScore(data: {
  completeness?: number;
  accuracy?: number;
  consistency?: number;
  timeliness?: number;
}): number {
  const weights = {
    completeness: 0.3,
    accuracy: 0.3,
    consistency: 0.2,
    timeliness: 0.2,
  };

  let score = 0;
  let totalWeight = 0;

  if (data.completeness !== undefined) {
    score += data.completeness * weights.completeness;
    totalWeight += weights.completeness;
  }
  if (data.accuracy !== undefined) {
    score += data.accuracy * weights.accuracy;
    totalWeight += weights.accuracy;
  }
  if (data.consistency !== undefined) {
    score += data.consistency * weights.consistency;
    totalWeight += weights.consistency;
  }
  if (data.timeliness !== undefined) {
    score += data.timeliness * weights.timeliness;
    totalWeight += weights.timeliness;
  }

  return totalWeight > 0 ? score / totalWeight : 0;
}

export function classifyQuality(score: number): "high" | "medium" | "low" {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9_\-\.]/gi, "_").toLowerCase();
}
