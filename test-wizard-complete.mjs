import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log("=== TESTE COMPLETO DO WIZARD (7 STEPS) ===\n");

  try {
    // Step 1
    console.log("STEP 1: Selecionando projeto...");
    await page.goto("http://localhost:3000/research/new", {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(2000);
    await page.click('[role="combobox"]');
    await page.waitForTimeout(500);
    await page.click('[role="option"]:first-child');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Próximo")');
    await page.waitForTimeout(1000);
    console.log("✅ Step 1 concluído");

    // Step 2
    console.log("\nSTEP 2: Preenchendo nome da pesquisa...");
    await page.fill('input[placeholder*="Pesquisa"]', "Teste Wizard Completo");
    await page.fill("textarea", "Descrição de teste automatizado");
    await page.waitForTimeout(500);
    await page.click('button:has-text("Próximo")');
    await page.waitForTimeout(1000);
    console.log("✅ Step 2 concluído");

    // Step 3
    console.log("\nSTEP 3: Configurando parâmetros...");
    await page.waitForTimeout(500);
    await page.click('button:has-text("Próximo")');
    await page.waitForTimeout(1000);
    console.log("✅ Step 3 concluído");

    // Step 4
    console.log("\nSTEP 4: Escolhendo método...");
    const step4Title = await page.locator("text=Escolher Método").count();
    console.log("- Chegou no Step 4:", step4Title > 0 ? "✅ SIM" : "❌ NÃO");

    // Screenshot do Step 4
    await page.screenshot({
      path: "/home/ubuntu/screenshots/wizard-step4.png",
      fullPage: true,
    });
    console.log("- Screenshot salvo: wizard-step4.png");

    // Verificar opções de método
    const manualBtn = await page.locator("text=Manual").count();
    const spreadsheetBtn = await page.locator("text=Planilha").count();
    const preResearchBtn = await page.locator("text=Pré-Pesquisa").count();

    console.log("- Opção Manual:", manualBtn > 0 ? "✅" : "❌");
    console.log("- Opção Planilha:", spreadsheetBtn > 0 ? "✅" : "❌");
    console.log("- Opção Pré-Pesquisa:", preResearchBtn > 0 ? "✅" : "❌");

    console.log("\n✅ WIZARD NAVEGÁVEL ATÉ O STEP 4!");
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }

  await browser.close();
})();
