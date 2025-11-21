# Testes E2E - Gestor PAV

## Visão Geral

Esta pasta contém testes end-to-end (E2E) usando Playwright para validar fluxos completos de usuário no sistema Gestor PAV.

## Estrutura de Testes

### 1. **market-creation-flow.spec.ts** - Fluxo de Criação de Mercado

Testa o ciclo completo de gerenciamento de mercados:

- ✅ Criar projeto e adicionar mercado único
- ✅ Validar campos obrigatórios ao criar mercado
- ✅ Filtrar mercados por categoria
- ✅ Editar mercado existente
- ✅ Deletar mercado sem dados vinculados

**Cobertura:** Gerenciamento de projetos, CRUD de mercados, validação de formulários

---

### 2. **complete-enrichment-flow.spec.ts** - Fluxo Completo de Enriquecimento

Testa o wizard de pesquisa e processo de enriquecimento:

- ✅ Completar wizard de nova pesquisa com entrada manual
- ✅ Navegar entre steps do wizard corretamente
- ✅ Validar campos obrigatórios no wizard
- ✅ Exibir progresso do enriquecimento em tempo real
- ✅ Permitir cancelar enriquecimento em andamento
- ✅ Exibir resultados após enriquecimento completo
- ✅ Permitir re-enriquecimento de dados

**Cobertura:** Wizard multi-step, validação de formulários, processamento assíncrono, feedback em tempo real

---

### 3. **data-export-flow.spec.ts** - Fluxo de Exportação de Dados

Testa exportação de dados em diferentes formatos:

- ✅ Exportar clientes em formato CSV
- ✅ Exportar concorrentes em formato Excel
- ✅ Exportar leads em formato PDF
- ✅ Exportar apenas dados filtrados
- ✅ Exportar dados selecionados via checkboxes
- ✅ Incluir metadados no arquivo exportado
- ✅ Permitir exportar comparação de mercados
- ✅ Validar formato de arquivo antes de exportar

**Cobertura:** Exportação multi-formato, filtros, seleção múltipla, downloads de arquivos

---

### 4. **batch-validation-flow.spec.ts** - Fluxo de Validação em Lote

Testa operações em lote sobre múltiplos itens:

- ✅ Validar múltiplos clientes em lote
- ✅ Marcar múltiplos itens como "Rico" em lote
- ✅ Validar leads com observações em lote
- ✅ Descartar múltiplos itens em lote
- ✅ Exibir modal de confirmação antes de validação em lote
- ✅ Atualizar contadores após validação em lote
- ✅ Permitir validação parcial com filtros aplicados
- ✅ Manter seleção ao navegar entre abas

**Cobertura:** Operações em lote, confirmações, atualização de UI, persistência de estado

---

## Testes Existentes (Fases Anteriores)

### 5. **alerts-config.spec.ts** - Configuração de Alertas

Testa sistema de alertas e notificações

### 6. **enrichment-flow.spec.ts** - Fluxo de Enriquecimento

Testa processo básico de enriquecimento de dados

### 7. **export-data.spec.ts** - Exportação de Dados

Testa funcionalidades básicas de exportação

---

## Como Executar

### Executar todos os testes

```bash
pnpm test:e2e
```

### Executar com interface gráfica

```bash
pnpm test:e2e:ui
```

### Executar em modo headed (com browser visível)

```bash
pnpm test:e2e:headed
```

### Executar em modo debug

```bash
pnpm test:e2e:debug
```

### Ver relatório de testes

```bash
pnpm test:e2e:report
```

### Executar teste específico

```bash
pnpm test:e2e market-creation-flow
```

---

## Configuração

A configuração do Playwright está em `playwright.config.ts`:

- **Browser:** Chromium (Desktop Chrome)
- **Base URL:** http://localhost:3000
- **Timeout:** 120 segundos
- **Retries:** 2 (em CI), 0 (local)
- **Screenshots:** Apenas em falhas
- **Traces:** Apenas no primeiro retry

---

## Boas Práticas

### 1. **Seletores Estáveis**

- Prefira `data-testid` para elementos críticos
- Use `text=` para conteúdo estático
- Evite seletores baseados em classes CSS dinâmicas

### 2. **Esperas Adequadas**

- Use `waitForLoadState('networkidle')` após navegação
- Use `waitForSelector` com timeout adequado
- Evite `waitForTimeout` fixos (use apenas quando necessário)

### 3. **Isolamento de Testes**

- Cada teste deve ser independente
- Use `beforeEach` para setup comum
- Limpe dados de teste após execução

### 4. **Assertions Claras**

- Use `expect` com mensagens descritivas
- Verifique múltiplos aspectos quando relevante
- Teste casos de sucesso E erro

### 5. **Tratamento de Condições**

- Use `if (await element.isVisible())` para elementos opcionais
- Verifique contagem antes de iterar
- Trate estados vazios graciosamente

---

## Estrutura de um Teste

```typescript
import { test, expect } from "@playwright/test";

test.describe("Nome do Fluxo", () => {
  test.beforeEach(async ({ page }) => {
    // Setup comum
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("deve realizar ação específica", async ({ page }) => {
    // 1. Arrange - Preparar estado inicial
    await page.click("text=Menu");

    // 2. Act - Executar ação
    await page.fill('input[name="campo"]', "valor");
    await page.click('button:has-text("Salvar")');

    // 3. Assert - Verificar resultado
    await expect(page.locator("text=Sucesso")).toBeVisible();
  });
});
```

---

## Troubleshooting

### Teste falha por timeout

- Aumente o timeout específico: `{ timeout: 10000 }`
- Verifique se elemento está realmente visível
- Use `page.pause()` para debug

### Seletor não encontrado

- Inspecione a página com `--headed`
- Use Playwright Inspector: `pnpm test:e2e:debug`
- Verifique se elemento está dentro de shadow DOM

### Download não funciona

- Verifique configuração de `downloadsPath`
- Use `page.waitForEvent('download')`
- Certifique-se que pasta existe

---

## Métricas de Cobertura

**Total de testes criados na Fase 86:** 32 testes

**Distribuição por fluxo:**

- Criação de Mercado: 5 testes
- Enriquecimento Completo: 7 testes
- Exportação de Dados: 8 testes
- Validação em Lote: 8 testes
- Outros (fases anteriores): 4 testes

**Tempo médio de execução:** ~2-3 minutos (todos os testes)

---

## Próximos Passos

1. ✅ Integrar testes E2E no CI/CD
2. ✅ Adicionar testes de performance
3. ✅ Implementar testes de acessibilidade
4. ✅ Criar testes de regressão visual
5. ✅ Expandir cobertura para fluxos de admin

---

## Contribuindo

Ao adicionar novos testes:

1. Siga a estrutura de passos (Arrange, Act, Assert)
2. Adicione comentários numerados para clareza
3. Use `data-testid` em componentes novos
4. Documente casos de edge testados
5. Atualize este README com novos testes
