import { test, expect } from '@playwright/test';

/**
 * Teste E2E: Configuração de Alertas Inteligentes
 * Fase 43.3 - Testes E2E com Playwright
 */

test.describe('Configuração de Alertas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('deve navegar para página de alertas', async ({ page }) => {
    // Clicar no menu Alertas
    await page.click('text=Alertas');
    
    // Verificar URL
    await expect(page).toHaveURL(/.*alerts/);
    
    // Verificar título
    await expect(page.locator('h1, h2').first()).toContainText(/Alertas|Intelligent Alerts/i);
  });

  test('deve exibir configurações de alertas', async ({ page }) => {
    await page.goto('/intelligent-alerts');
    await page.waitForLoadState('networkidle');
    
    // Verificar elementos principais
    const hasThreshold = await page.locator('text=/Threshold|Limite/i').isVisible();
    expect(hasThreshold).toBeTruthy();
    
    // Verificar botão salvar
    await expect(page.locator('button:has-text("Salvar")')).toBeVisible();
  });

  test('deve validar thresholds com Zod', async ({ page }) => {
    await page.goto('/intelligent-alerts');
    await page.waitForLoadState('networkidle');
    
    // Buscar input de threshold
    const thresholdInput = page.locator('input[type="number"]').first();
    if (await thresholdInput.isVisible()) {
      // Preencher valor inválido (> 100)
      await thresholdInput.fill('150');
      
      // Tentar salvar
      const saveButton = page.locator('button:has-text("Salvar")').first();
      if (await saveButton.isVisible()) {
        await saveButton.click();
        
        // Aguardar mensagem de erro
        await page.waitForTimeout(1000);
        
        // Verificar erro de validação
        const errorVisible = await page.locator('text=/máximo|inválido|invalid/i').isVisible().catch(() => false);
        expect(errorVisible).toBeTruthy();
      }
    }
  });

  test('deve salvar configurações válidas', async ({ page }) => {
    await page.goto('/intelligent-alerts');
    await page.waitForLoadState('networkidle');
    
    // Preencher valores válidos
    const thresholdInputs = page.locator('input[type="number"]');
    const count = await thresholdInputs.count();
    
    if (count > 0) {
      // Preencher primeiro threshold com valor válido
      await thresholdInputs.first().fill('50');
      
      // Salvar
      const saveButton = page.locator('button:has-text("Salvar")').first();
      if (await saveButton.isVisible()) {
        await saveButton.click();
        
        // Aguardar sucesso
        await page.waitForTimeout(2000);
        
        // Verificar mensagem de sucesso
        const successVisible = await page.locator('text=/sucesso|success|salvo/i').isVisible().catch(() => false);
        expect(successVisible).toBeTruthy();
      }
    }
  });

  test('deve exibir histórico de alertas', async ({ page }) => {
    await page.goto('/alert-history');
    await page.waitForLoadState('networkidle');
    
    // Verificar se página carregou
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toBeTruthy();
    
    // Verificar título
    const hasTitle = await page.locator('text=/Histórico|History/i').isVisible();
    expect(hasTitle).toBeTruthy();
  });

  test('deve exibir estatísticas de alertas', async ({ page }) => {
    await page.goto('/intelligent-alerts');
    await page.waitForLoadState('networkidle');
    
    // Verificar se há estatísticas visíveis
    const hasStats = await page.locator('text=/Estatísticas|Stats|24h|Total/i').isVisible();
    expect(hasStats).toBeTruthy();
  });
});
