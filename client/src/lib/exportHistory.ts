/**
 * Utilitários para exportação de histórico de enriquecimento
 */

interface EnrichmentRun {
  id: number;
  projectId: number;
  startedAt: Date;
  completedAt: Date | null;
  totalClients: number;
  processedClients: number;
  status: "running" | "paused" | "completed" | "error";
  durationSeconds: number | null;
  errorMessage: string | null;
}

/**
 * Exporta histórico para CSV
 */
export function exportToCSV(
  runs: EnrichmentRun[],
  filename = "historico-enriquecimento.csv"
) {
  // Cabeçalhos
  const headers = [
    "ID",
    "Data Início",
    "Data Conclusão",
    "Status",
    "Total Clientes",
    "Processados",
    "Duração (min)",
    "Erro",
  ];

  // Linhas de dados
  const rows = runs.map(run => [
    run.id,
    new Date(run.startedAt).toLocaleString("pt-BR"),
    run.completedAt
      ? new Date(run.completedAt).toLocaleString("pt-BR")
      : "Em andamento",
    translateStatus(run.status),
    run.totalClients,
    run.processedClients,
    run.durationSeconds ? Math.round(run.durationSeconds / 60) : "-",
    run.errorMessage || "-",
  ]);

  // Montar CSV
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
  ].join("\n");

  // Download
  downloadFile(csvContent, filename, "text/csv;charset=utf-8;");
}

/**
 * Exporta histórico para PDF (via HTML)
 */
export function exportToPDF(
  runs: EnrichmentRun[],
  filename = "historico-enriquecimento.pdf"
) {
  // Gerar HTML para impressão
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Histórico de Enriquecimento</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
        h1 {
          color: #333;
          border-bottom: 2px solid #007bff;
          padding-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #007bff;
          color: white;
        }
        tr:nth-child(even) {
          background-color: #f2f2f2;
        }
        .status-running { color: #007bff; font-weight: bold; }
        .status-paused { color: #ffc107; font-weight: bold; }
        .status-completed { color: #28a745; font-weight: bold; }
        .status-error { color: #dc3545; font-weight: bold; }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <h1>📊 Histórico de Enriquecimento</h1>
      <p><strong>Gerado em:</strong> ${new Date().toLocaleString("pt-BR")}</p>
      <p><strong>Total de execuções:</strong> ${runs.length}</p>
      
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Data Início</th>
            <th>Data Conclusão</th>
            <th>Status</th>
            <th>Total</th>
            <th>Processados</th>
            <th>Duração</th>
          </tr>
        </thead>
        <tbody>
          ${runs
            .map(
              run => `
            <tr>
              <td>${run.id}</td>
              <td>${new Date(run.startedAt).toLocaleString("pt-BR")}</td>
              <td>${run.completedAt ? new Date(run.completedAt).toLocaleString("pt-BR") : "Em andamento"}</td>
              <td class="status-${run.status}">${translateStatus(run.status)}</td>
              <td>${run.totalClients}</td>
              <td>${run.processedClients}</td>
              <td>${run.durationSeconds ? Math.round(run.durationSeconds / 60) + " min" : "-"}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      
      <div class="footer">
        <p>Gestor de Pesquisa de Mercado PAV</p>
      </div>
    </body>
    </html>
  `;

  // Abrir em nova janela para impressão
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();

    // Aguardar carregar e imprimir
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

/**
 * Traduz status para português
 */
function translateStatus(status: string): string {
  const translations: Record<string, string> = {
    running: "Em Execução",
    paused: "Pausado",
    completed: "Concluído",
    error: "Erro",
  };
  return translations[status] || status;
}

/**
 * Download de arquivo
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
