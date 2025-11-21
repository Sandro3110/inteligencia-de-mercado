import { test, expect } from "@playwright/test";

/**
 * Teste E2E: Fluxo Completo de Enriquecimento de Dados
 * Fase 86 - Passo 2
 *
 * Testa o wizard de pesquisa completo, desde a seleção de projeto até o enriquecimento
 */

test.describe("Fluxo Completo de Enriquecimento", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("deve completar wizard de nova pesquisa com entrada manual", async ({
    page,
  }) => {
    // 1. Navegar para wizard de nova pesquisa
    await page.click("text=Nova Pesquisa");
    await expect(page).toHaveURL(/\/nova-pesquisa/);

    // STEP 1: Selecionar Projeto
    await page.waitForSelector('select, [role="combobox"]', { timeout: 10000 });

    const projectSelector = page.locator('select, [role="combobox"]').first();
    await projectSelector.click();

    // Selecionar primeiro projeto disponível
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // Clicar em Próximo
    await page.click('button:has-text("Próximo")');

    // STEP 2: Configurar Parâmetros
    await expect(page.locator("text=Configurar Parâmetros")).toBeVisible();

    // Preencher nome da pesquisa
    const researchName = `Pesquisa E2E ${Date.now()}`;
    await page.fill('input[placeholder*="nome"]', researchName);

    // Avançar para próximo step
    await page.click('button:has-text("Próximo")');

    // STEP 3: Escolher Método de Entrada
    await expect(page.locator("text=Método de Entrada")).toBeVisible();

    // Selecionar entrada manual
    await page.click('button:has-text("Entrada Manual")');

    // Avançar
    await page.click('button:has-text("Próximo")');

    // STEP 4: Inserir Dados
    await expect(page.locator("text=Inserir Dados")).toBeVisible();

    // Adicionar cliente manualmente
    await page.fill('input[placeholder*="Nome"]', "Empresa Teste E2E");
    await page.fill('input[placeholder*="CNPJ"]', "12.345.678/0001-90");
    await page.fill('input[placeholder*="Site"]', "https://exemplo.com.br");

    // Adicionar cliente à lista
    await page.click('button:has-text("Adicionar")');

    // Verificar que cliente foi adicionado
    await expect(page.locator("text=Empresa Teste E2E")).toBeVisible();

    // Finalizar e criar pesquisa
    await page.click('button:has-text("Criar Pesquisa")');

    // Aguardar confirmação
    await expect(page.locator("text=criada com sucesso")).toBeVisible({
      timeout: 10000,
    });
  });

  test("deve navegar entre steps do wizard corretamente", async ({ page }) => {
    // 1. Abrir wizard
    await page.click("text=Nova Pesquisa");

    // 2. Verificar que está no Step 1
    await expect(page.locator("text=Selecionar Projeto")).toBeVisible();

    // 3. Selecionar projeto e avançar
    const projectSelector = page.locator('select, [role="combobox"]').first();
    if (await projectSelector.isVisible()) {
      await projectSelector.click();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      await page.click('button:has-text("Próximo")');
    }

    // 4. Verificar Step 2
    await expect(page.locator("text=Configurar Parâmetros")).toBeVisible();

    // 5. Voltar para Step 1
    await page.click('button:has-text("Anterior")');
    await expect(page.locator("text=Selecionar Projeto")).toBeVisible();

    // 6. Avançar novamente
    await page.click('button:has-text("Próximo")');
    await expect(page.locator("text=Configurar Parâmetros")).toBeVisible();
  });

  test("deve validar campos obrigatórios no wizard", async ({ page }) => {
    // 1. Abrir wizard
    await page.click("text=Nova Pesquisa");

    // 2. Tentar avançar sem selecionar projeto
    const nextButton = page.locator('button:has-text("Próximo")');

    // Verificar se botão está desabilitado ou mostra erro
    const isDisabled = await nextButton.isDisabled();

    if (!isDisabled) {
      await nextButton.click();
      // Deve mostrar mensagem de erro ou não avançar
      await expect(page.locator("text=Selecionar Projeto")).toBeVisible();
    }
  });

  test("deve exibir progresso do enriquecimento em tempo real", async ({
    page,
  }) => {
    // 1. Navegar para página de pesquisas
    await page.click("text=Pesquisas");
    await page.waitForLoadState("networkidle");

    // 2. Verificar se há pesquisas em andamento
    const enrichmentProgress = page.locator(
      '[data-testid="enrichment-progress"]'
    );

    if (await enrichmentProgress.isVisible()) {
      // 3. Verificar elementos de progresso
      await expect(page.locator("text=Processando")).toBeVisible();

      // 4. Verificar barra de progresso
      const progressBar = page.locator('[role="progressbar"]');
      await expect(progressBar).toBeVisible();
    }
  });

  test("deve permitir cancelar enriquecimento em andamento", async ({
    page,
  }) => {
    // 1. Navegar para pesquisas
    await page.click("text=Pesquisas");
    await page.waitForLoadState("networkidle");

    // 2. Procurar pesquisa em andamento
    const cancelButton = page.locator('button:has-text("Cancelar")').first();

    if (await cancelButton.isVisible()) {
      // 3. Clicar em cancelar
      await cancelButton.click();

      // 4. Confirmar cancelamento
      await page.click('button:has-text("Confirmar")');

      // 5. Verificar que status mudou
      await expect(page.locator("text=Cancelado")).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test("deve exibir resultados após enriquecimento completo", async ({
    page,
  }) => {
    // 1. Navegar para pesquisas
    await page.click("text=Pesquisas");
    await page.waitForLoadState("networkidle");

    // 2. Procurar pesquisa concluída
    const completedResearch = page.locator('[data-status="completed"]').first();

    if (await completedResearch.isVisible()) {
      // 3. Clicar para ver detalhes
      await completedResearch.click();

      // 4. Verificar que dados enriquecidos estão visíveis
      await expect(page.locator("text=Clientes")).toBeVisible();
      await expect(page.locator("text=Concorrentes")).toBeVisible();
      await expect(page.locator("text=Leads")).toBeVisible();

      // 5. Verificar métricas de qualidade
      const qualityScore = page.locator('[data-testid="quality-score"]');
      if (await qualityScore.isVisible()) {
        const scoreText = await qualityScore.textContent();
        expect(scoreText).toMatch(/\d+/); // Deve conter número
      }
    }
  });

  test("deve permitir re-enriquecimento de dados", async ({ page }) => {
    // 1. Navegar para pesquisas
    await page.click("text=Pesquisas");
    await page.waitForLoadState("networkidle");

    // 2. Selecionar pesquisa existente
    const researchCard = page.locator('[data-testid="research-card"]').first();

    if (await researchCard.isVisible()) {
      // 3. Abrir menu de ações
      await researchCard.locator('button[aria-label="Ações"]').click();

      // 4. Clicar em "Re-enriquecer"
      const reEnrichButton = page.locator('button:has-text("Re-enriquecer")');

      if (await reEnrichButton.isVisible()) {
        await reEnrichButton.click();

        // 5. Confirmar ação
        await page.click('button:has-text("Confirmar")');

        // 6. Verificar que processo iniciou
        await expect(page.locator("text=Enriquecimento iniciado")).toBeVisible({
          timeout: 5000,
        });
      }
    }
  });
});
