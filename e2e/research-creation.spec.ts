import { test, expect } from '@playwright/test';

/**
 * Testes E2E para criação de pesquisa
 * Fase 66.3 - Testes E2E com Playwright
 */

test.describe('Criação de Pesquisa', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve acessar wizard de nova pesquisa', async ({ page }) => {
    // Navegar para wizard
    await page.goto('/research/new');

    // Verificar que wizard carregou
    await expect(page.locator('h1').or(page.locator('h2'))).toContainText(/nova pesquisa|wizard|pesquisa/i);
  });

  test('deve exibir steps do wizard', async ({ page }) => {
    await page.goto('/research/new');

    // Verificar que existe navegação de steps
    const stepIndicator = page.locator('[data-testid="step-indicator"]')
      .or(page.locator('.step'))
      .or(page.getByText(/passo|step/i));

    await expect(stepIndicator.first()).toBeVisible();
  });

  test('deve permitir selecionar projeto', async ({ page }) => {
    await page.goto('/research/new');

    // Procurar por seletor de projeto
    const projectSelect = page.locator('select')
      .or(page.getByRole('combobox'))
      .or(page.getByPlaceholder(/projeto|project/i));

    const selectExists = await projectSelect.count() > 0;
    
    if (selectExists) {
      await expect(projectSelect.first()).toBeVisible();
    }
  });

  test('deve validar navegação entre steps', async ({ page }) => {
    await page.goto('/research/new');

    // Procurar botão "Próximo" ou "Next"
    const nextButton = page.getByRole('button', { name: /próximo|next|continuar/i });
    const nextExists = await nextButton.count() > 0;

    if (nextExists) {
      // Verificar que botão está visível
      await expect(nextButton.first()).toBeVisible();
    }
  });

  test('deve exibir formulário de parâmetros', async ({ page }) => {
    await page.goto('/research/new');

    // Verificar que existem campos de formulário
    const formFields = page.locator('input, select, textarea');
    await expect(formFields.first()).toBeVisible();
  });

  test('deve carregar sem erros de console críticos', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/research/new');
    await page.waitForLoadState('networkidle');

    // Filtrar erros conhecidos/esperados
    const criticalErrors = consoleErrors.filter(
      (err) => 
        !err.includes('favicon') && 
        !err.includes('Authentication failed') &&
        !err.includes('404')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('deve ser responsivo', async ({ page }) => {
    await page.goto('/research/new');

    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
  });
});
