import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log("=== TESTE DO WIZARD COMPLETO ===\n");

  // Step 1: Navegar e selecionar projeto
  console.log("STEP 1: Selecionando projeto...");
  await page.goto("http://localhost:3000/research/new", {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(2000);

  // Clicar no select
  await page.click('[role="combobox"]');
  await page.waitForTimeout(500);

  // Selecionar primeiro projeto
  await page.click('[role="option"]:first-child');
  await page.waitForTimeout(500);

  // Verificar se projeto foi selecionado
  const projectSelected = await page
    .locator("text=✓ Projeto selecionado")
    .count();
  console.log(
    "- Projeto selecionado:",
    projectSelected > 0 ? "✅ SIM" : "❌ NÃO"
  );

  // Clicar em Próximo
  const nextBtn = page.locator('button:has-text("Próximo")');
  const isNextEnabled = await nextBtn.isEnabled();
  console.log(
    "- Botão Próximo habilitado:",
    isNextEnabled ? "✅ SIM" : "❌ NÃO"
  );

  if (isNextEnabled) {
    await nextBtn.click();
    await page.waitForTimeout(1000);

    // Step 2: Verificar se avançou
    console.log("\nSTEP 2: Verificando navegação...");
    const step2Title = await page.locator("text=Nome da Pesquisa").count();
    console.log("- Avançou para Step 2:", step2Title > 0 ? "✅ SIM" : "❌ NÃO");

    if (step2Title > 0) {
      // Preencher nome da pesquisa
      await page.fill('input[placeholder*="Pesquisa"]', "Teste Automatizado");
      await page.waitForTimeout(500);

      // Clicar em Próximo novamente
      const nextBtn2 = page.locator('button:has-text("Próximo")');
      const isNext2Enabled = await nextBtn2.isEnabled();
      console.log(
        "- Botão Próximo habilitado:",
        isNext2Enabled ? "✅ SIM" : "❌ NÃO"
      );

      if (isNext2Enabled) {
        await nextBtn2.click();
        await page.waitForTimeout(1000);

        // Step 3: Verificar parâmetros
        console.log("\nSTEP 3: Verificando parâmetros...");
        const step3Title = await page
          .locator("text=Configurar Parâmetros")
          .count();
        console.log(
          "- Avançou para Step 3:",
          step3Title > 0 ? "✅ SIM" : "❌ NÃO"
        );
      }
    }
  }

  // Screenshot final
  await page.screenshot({
    path: "/home/ubuntu/screenshots/wizard-final.png",
    fullPage: true,
  });
  console.log(
    "\n✅ Screenshot salvo em /home/ubuntu/screenshots/wizard-final.png"
  );

  await browser.close();
})();
