import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  filename: string;
  title?: string;
  metadata?: Record<string, string>;
}

/**
 * Exporta dados para formato Excel (.xlsx) com formatação
 */
export function exportToExcel(data: ExportData) {
  const { headers, rows, filename, title, metadata } = data;

  // Criar workbook
  const wb = XLSX.utils.book_new();

  // Adicionar metadados se fornecidos
  const sheetData: any[][] = [];
  
  if (title) {
    sheetData.push([title]);
    sheetData.push([]);
  }
  
  if (metadata) {
    Object.entries(metadata).forEach(([key, value]) => {
      sheetData.push([key, value]);
    });
    sheetData.push([]);
  }

  // Adicionar cabeçalhos e dados
  sheetData.push(headers);
  sheetData.push(...rows);

  // Criar worksheet
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Definir largura das colunas
  const colWidths = headers.map((_, idx) => {
    const maxLength = Math.max(
      headers[idx]?.length || 0,
      ...rows.map(row => String(row[idx] || "").length)
    );
    return { wch: Math.min(maxLength + 2, 50) };
  });
  ws["!cols"] = colWidths;

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(wb, ws, "Dados");

  // Salvar arquivo
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Exporta dados para formato PDF com formatação
 */
export function exportToPDF(data: ExportData) {
  const { headers, rows, filename, title, metadata } = data;

  // Criar documento PDF
  const doc = new jsPDF({
    orientation: rows[0]?.length > 6 ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

  let yPosition = 20;

  // Adicionar título
  if (title) {
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, yPosition);
    yPosition += 10;
  }

  // Adicionar metadados
  if (metadata) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    Object.entries(metadata).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 14, yPosition);
      yPosition += 6;
    });
    yPosition += 4;
  }

  // Adicionar tabela
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: yPosition,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246], // blue-500
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    margin: { top: yPosition, left: 14, right: 14 },
  });

  // Salvar arquivo
  doc.save(`${filename}.pdf`);
}

/**
 * Exporta dados para formato CSV (mantém compatibilidade)
 */
export function exportToCSV(data: ExportData) {
  const { headers, rows, filename } = data;

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
