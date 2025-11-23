import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log("Navegando para /research/new...");
  await page.goto("http://localhost:3000/research/new", {
    waitUntil: "networkidle",
  });

  // Aguardar o componente carregar
  await page.waitForTimeout(2000);

  // Capturar screenshot
  await page.screenshot({
    path: "/home/ubuntu/screenshots/wizard-step1.png",
    fullPage: true,
  });
  console.log("Screenshot salvo em /home/ubuntu/screenshots/wizard-step1.png");

  // Verificar se há mensagens de erro ou loading
  const loadingMsg = await page.locator("text=Carregando projetos").count();
  const errorMsg = await page.locator("text=Erro ao carregar").count();
  const noProjectMsg = await page
    .locator("text=Nenhum projeto encontrado")
    .count();
  const selectTrigger = await page.locator('[role="combobox"]').count();

  console.log("\nEstado da página:");
  console.log("- Loading:", loadingMsg > 0 ? "SIM" : "NÃO");
  console.log("- Erro:", errorMsg > 0 ? "SIM" : "NÃO");
  console.log("- Sem projetos:", noProjectMsg > 0 ? "SIM" : "NÃO");
  console.log("- Select visível:", selectTrigger > 0 ? "SIM" : "NÃO");

  // Tentar clicar no select
  if (selectTrigger > 0) {
    await page.click('[role="combobox"]');
    await page.waitForTimeout(1000);

    const options = await page.locator('[role="option"]').count();
    console.log("- Opções no select:", options);

    if (options > 0) {
      const firstOption = await page
        .locator('[role="option"]')
        .first()
        .textContent();
      console.log("- Primeira opção:", firstOption);
    }
  }

  await browser.close();
})();
