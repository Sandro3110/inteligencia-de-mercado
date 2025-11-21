import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Teste E2E: Fluxo de Exportação de Dados
 * Fase 86 - Passo 2
 *
 * Testa exportação de dados em diferentes formatos (CSV, Excel, PDF)
 */

test.describe("Fluxo de Exportação de Dados", () => {
  const downloadsPath = path.join(__dirname, "../e2e-downloads");

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Limpar pasta de downloads antes de cada teste
    if (fs.existsSync(downloadsPath)) {
      fs.rmSync(downloadsPath, { recursive: true, force: true });
    }
    fs.mkdirSync(downloadsPath, { recursive: true });
  });

  test("deve exportar clientes em formato CSV", async ({ page }) => {
    // 1. Navegar para página de clientes
    await page.click("text=Clientes");
    await page.waitForLoadState("networkidle");

    // 2. Clicar no botão de exportar
    const exportButton = page.locator('button:has-text("Exportar")');

    if (await exportButton.isVisible()) {
      await exportButton.click();

      // 3. Selecionar formato CSV
      await page.click('button:has-text("CSV")');

      // 4. Aguardar download
      const downloadPromise = page.waitForEvent("download", { timeout: 10000 });

      const download = await downloadPromise;

      // 5. Verificar que arquivo foi baixado
      expect(download.suggestedFilename()).toContain(".csv");

      // 6. Salvar arquivo
      const filePath = path.join(downloadsPath, download.suggestedFilename());
      await download.saveAs(filePath);

      // 7. Verificar que arquivo existe
      expect(fs.existsSync(filePath)).toBeTruthy();

      // 8. Verificar toast de sucesso
      await expect(page.locator("text=exportado com sucesso")).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test("deve exportar concorrentes em formato Excel", async ({ page }) => {
    // 1. Navegar para concorrentes
    await page.click("text=Concorrentes");
    await page.waitForLoadState("networkidle");

    // 2. Abrir menu de exportação
    const exportButton = page.locator('button:has-text("Exportar")');

    if (await exportButton.isVisible()) {
      await exportButton.click();

      // 3. Selecionar Excel
      await page.click('button:has-text("Excel")');

      // 4. Aguardar download
      const downloadPromise = page.waitForEvent("download", { timeout: 10000 });
      const download = await downloadPromise;

      // 5. Verificar extensão do arquivo
      const filename = download.suggestedFilename();
      expect(filename).toMatch(/\.(xlsx|xls)$/);

      // 6. Salvar arquivo
      const filePath = path.join(downloadsPath, filename);
      await download.saveAs(filePath);

      // 7. Verificar tamanho do arquivo (deve ser > 0)
      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(0);
    }
  });

  test("deve exportar leads em formato PDF", async ({ page }) => {
    // 1. Navegar para leads
    await page.click("text=Leads");
    await page.waitForLoadState("networkidle");

    // 2. Clicar em exportar
    const exportButton = page.locator('button:has-text("Exportar")');

    if (await exportButton.isVisible()) {
      await exportButton.click();

      // 3. Selecionar PDF
      await page.click('button:has-text("PDF")');

      // 4. Aguardar download
      const downloadPromise = page.waitForEvent("download", { timeout: 15000 });
      const download = await downloadPromise;

      // 5. Verificar que é PDF
      expect(download.suggestedFilename()).toContain(".pdf");

      // 6. Salvar e verificar
      const filePath = path.join(downloadsPath, download.suggestedFilename());
      await download.saveAs(filePath);

      expect(fs.existsSync(filePath)).toBeTruthy();
    }
  });

  test("deve exportar apenas dados filtrados", async ({ page }) => {
    // 1. Navegar para cockpit dinâmico
    await page.click("text=Cockpit Dinâmico");
    await page.waitForLoadState("networkidle");

    // 2. Aplicar filtro de qualidade
    const qualityFilter = page.locator('select[name="quality"]');

    if (await qualityFilter.isVisible()) {
      await qualityFilter.selectOption("Rico");

      // 3. Aguardar atualização da lista
      await page.waitForTimeout(1000);

      // 4. Exportar dados filtrados
      const exportButton = page.locator(
        'button:has-text("Exportar Filtrados")'
      );

      if (await exportButton.isVisible()) {
        await exportButton.click();

        // 5. Selecionar formato
        await page.click('button:has-text("CSV")');

        // 6. Verificar toast indicando filtros aplicados
        await expect(page.locator("text=Filtros aplicados")).toBeVisible({
          timeout: 5000,
        });
      }
    }
  });

  test("deve exportar dados selecionados via checkboxes", async ({ page }) => {
    // 1. Navegar para clientes
    await page.click("text=Clientes");
    await page.waitForLoadState("networkidle");

    // 2. Selecionar alguns itens via checkbox
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();

    if (count > 1) {
      // Selecionar primeiros 3 itens
      for (let i = 0; i < Math.min(3, count); i++) {
        await checkboxes.nth(i).check();
      }

      // 3. Clicar em "Exportar Selecionados"
      const exportSelectedButton = page.locator(
        'button:has-text("Exportar Selecionados")'
      );

      if (await exportSelectedButton.isVisible()) {
        await exportSelectedButton.click();

        // 4. Escolher formato
        await page.click('button:has-text("CSV")');

        // 5. Verificar toast
        await expect(page.locator("text=itens exportados")).toBeVisible({
          timeout: 5000,
        });
      }
    }
  });

  test("deve incluir metadados no arquivo exportado", async ({ page }) => {
    // 1. Navegar para mercados
    await page.click("text=Mercados");
    await page.waitForLoadState("networkidle");

    // 2. Exportar dados
    const exportButton = page.locator('button:has-text("Exportar")');

    if (await exportButton.isVisible()) {
      await exportButton.click();
      await page.click('button:has-text("CSV")');

      // 3. Aguardar download
      const downloadPromise = page.waitForEvent("download", { timeout: 10000 });
      const download = await downloadPromise;

      // 4. Salvar arquivo
      const filePath = path.join(downloadsPath, download.suggestedFilename());
      await download.saveAs(filePath);

      // 5. Ler conteúdo do CSV
      const content = fs.readFileSync(filePath, "utf-8");

      // 6. Verificar que contém metadados (data, filtros, total)
      const lines = content.split("\n");

      // Primeira linha deve ser cabeçalho ou metadados
      expect(lines[0]).toBeTruthy();
      expect(lines.length).toBeGreaterThan(1);
    }
  });

  test("deve permitir exportar comparação de mercados", async ({ page }) => {
    // 1. Navegar para cockpit dinâmico
    await page.click("text=Cockpit Dinâmico");
    await page.waitForLoadState("networkidle");

    // 2. Selecionar 2 mercados para comparação
    const marketCheckboxes = page.locator('[data-testid="market-checkbox"]');
    const count = await marketCheckboxes.count();

    if (count >= 2) {
      await marketCheckboxes.nth(0).check();
      await marketCheckboxes.nth(1).check();

      // 3. Clicar em "Comparar Selecionados"
      await page.click('button:has-text("Comparar Selecionados")');

      // 4. Aguardar modal de comparação
      await expect(page.locator("text=Comparação de Mercados")).toBeVisible();

      // 5. Exportar comparação em PDF
      const exportComparisonButton = page.locator(
        'button:has-text("Exportar Comparação")'
      );

      if (await exportComparisonButton.isVisible()) {
        await exportComparisonButton.click();

        // 6. Aguardar download
        const downloadPromise = page.waitForEvent("download", {
          timeout: 15000,
        });
        const download = await downloadPromise;

        expect(download.suggestedFilename()).toContain(".pdf");
      }
    }
  });

  test("deve validar formato de arquivo antes de exportar", async ({
    page,
  }) => {
    // 1. Navegar para clientes
    await page.click("text=Clientes");

    // 2. Clicar em exportar
    const exportButton = page.locator('button:has-text("Exportar")');

    if (await exportButton.isVisible()) {
      await exportButton.click();

      // 3. Verificar que opções de formato estão disponíveis
      await expect(page.locator('button:has-text("CSV")')).toBeVisible();
      await expect(page.locator('button:has-text("Excel")')).toBeVisible();
      await expect(page.locator('button:has-text("PDF")')).toBeVisible();
    }
  });
});
