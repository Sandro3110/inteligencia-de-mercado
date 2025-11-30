# Checklist de Implementação - Sistema V2

**Projeto:** Intelmarket (TechFilms)  
**Data:** 30 de novembro de 2024  
**Responsável:** _[A definir]_  
**Prazo:** 7 horas (1 dia de trabalho)

---

## ✅ Fase 1: Preparação (1 hora)

### 1.1 Criar Estrutura de Arquivos

- [ ] Criar diretório de testes

  ```bash
  mkdir -p /app/api/enrichment/__tests__
  ```

- [ ] Criar arquivo de prompts V2

  ```bash
  touch /app/api/enrichment/prompts_v2.ts
  ```

- [ ] Criar arquivo de geocodificação

  ```bash
  touch /app/api/enrichment/geocoding.ts
  ```

- [ ] Criar arquivo de tipos
  ```bash
  touch /app/api/enrichment/types.ts
  ```

### 1.2 Copiar Prompts Existentes

- [ ] Copiar `prompt1_cliente.ts` para `prompts_v2.ts`
- [ ] Copiar `prompt2_mercado.ts` para `prompts_v2.ts`
- [ ] Copiar `prompt3_mercado_enriquecimento.ts` para `prompts_v2.ts`
- [ ] Copiar `prompt4_concorrentes.ts` para `prompts_v2.ts`
- [ ] Copiar `prompt5_leads.ts` para `prompts_v2.ts`
- [ ] Adicionar `prompt2b_produtos.ts` (novo) para `prompts_v2.ts`

### 1.3 Definir Tipos TypeScript

- [ ] Criar interface `ClienteEnriquecido`
- [ ] Criar interface `Mercado`
- [ ] Criar interface `MercadoEnriquecido`
- [ ] Criar interface `Produto`
- [ ] Criar interface `Concorrente`
- [ ] Criar interface `Lead`

**Checkpoint:** Estrutura de arquivos criada e tipos definidos

---

## ✅ Fase 2: Implementação dos Prompts (2 horas)

### 2.1 Implementar `types.ts`

- [ ] Definir todas as interfaces
- [ ] Exportar tipos
- [ ] Validar com TypeScript (`tsc --noEmit`)

### 2.2 Implementar `prompts_v2.ts`

- [ ] Importar OpenAI SDK
- [ ] Implementar `prompt1_enriquecerCliente()`
  - [ ] Regra: Preservar CNPJ original
  - [ ] Regra: Retornar `null` se não souber
  - [ ] Temperatura: 0.3
  - [ ] Modelo: gpt-4o

- [ ] Implementar `prompt2_identificarMercado()`
  - [ ] Temperatura: 0.4
  - [ ] Modelo: gpt-4o

- [ ] Implementar `prompt3_enriquecerMercado()`
  - [ ] Retornar 5 tendências
  - [ ] Retornar 10 principais players
  - [ ] Retornar crescimento anual
  - [ ] Temperatura: 0.4
  - [ ] Modelo: gpt-4o

- [ ] Implementar `prompt2b_identificarProdutos()`
  - [ ] Retornar EXATAMENTE 3 produtos
  - [ ] Temperatura: 0.5
  - [ ] Modelo: gpt-4o

- [ ] Implementar `prompt4_identificarConcorrentes()`
  - [ ] Retornar EXATAMENTE 5 concorrentes
  - [ ] Regra: Não duplicar cliente
  - [ ] Temperatura: 0.4
  - [ ] Modelo: gpt-4o

- [ ] Implementar `prompt5_identificarLeads()`
  - [ ] Retornar EXATAMENTE 5 leads
  - [ ] Regra: Não duplicar cliente
  - [ ] Regra: Não duplicar concorrentes
  - [ ] **NOVO:** Considerar `principaisPlayers` do mercado
  - [ ] Marcar fonte: `PLAYER_DO_MERCADO` ou `PESQUISA_ADICIONAL`
  - [ ] Temperatura: 0.5
  - [ ] Modelo: gpt-4o

- [ ] Adicionar tratamento de erros em todas as funções
- [ ] Adicionar logs de debug
- [ ] Validar JSON de resposta com Zod (opcional)

### 2.3 Implementar `geocoding.ts`

- [ ] Importar variável de ambiente `GOOGLE_MAPS_API_KEY`
- [ ] Implementar função `geocodificar(cidade, uf)`
- [ ] Retornar `{ lat, lng }` ou `null`
- [ ] Adicionar tratamento de erros
- [ ] Adicionar cache (opcional)

**Checkpoint:** Todos os prompts implementados e testáveis

---

## ✅ Fase 3: Modificar Processo Principal (1 hora)

### 3.1 Backup do Arquivo Original

- [ ] Copiar `/app/api/enrichment/process/route.ts` para `route.ts.backup`

### 3.2 Modificar Imports

- [ ] Adicionar import de `prompts_v2.ts`
- [ ] Adicionar import de `geocoding.ts`
- [ ] Adicionar import de `types.ts`
- [ ] Adicionar import de `produtos` do schema

### 3.3 Substituir Função `generateAllDataOptimized()`

- [ ] Remover função antiga
- [ ] **NÃO** adicionar nova função (usar imports diretos)

### 3.4 Modificar Loop de Processamento

- [ ] **Etapa 1:** Enriquecer cliente

  ```typescript
  const clienteEnriquecido = await prompt1_enriquecerCliente(cliente);
  ```

- [ ] **Etapa 2:** Geocodificar

  ```typescript
  if (clienteEnriquecido.cidade && clienteEnriquecido.uf) {
    const coords = await geocodificar(clienteEnriquecido.cidade, clienteEnriquecido.uf);
    if (coords) {
      clienteEnriquecido.latitude = coords.lat;
      clienteEnriquecido.longitude = coords.lng;
    }
  }
  ```

- [ ] **Etapa 3:** Gravar cliente enriquecido

  ```typescript
  await db
    .update(clientes)
    .set({
      ...clienteEnriquecido,
      validationStatus: 'approved',
    })
    .where(eq(clientes.id, cliente.id));
  ```

- [ ] **Etapa 4:** Identificar mercado

  ```typescript
  const mercado = await prompt2_identificarMercado(clienteEnriquecido);
  ```

- [ ] **Etapa 5:** Gravar mercado

  ```typescript
  const [mercadoInserido] = await db
    .insert(mercadosUnicos)
    .values({
      pesquisaId,
      projectId: pesquisa.projectId,
      ...mercado,
    })
    .returning();
  ```

- [ ] **Etapa 6:** Enriquecer mercado

  ```typescript
  const mercadoEnriquecido = await prompt3_enriquecerMercado(mercado);
  ```

- [ ] **Etapa 7:** Atualizar mercado

  ```typescript
  await db
    .update(mercadosUnicos)
    .set({
      crescimentoAnual: mercadoEnriquecido.crescimentoAnual,
      tendencias: JSON.stringify(mercadoEnriquecido.tendencias),
      principaisPlayers: JSON.stringify(mercadoEnriquecido.principaisPlayers),
    })
    .where(eq(mercadosUnicos.id, mercadoInserido.id));
  ```

- [ ] **Etapa 8:** Identificar produtos

  ```typescript
  const produtos = await prompt2b_identificarProdutos(clienteEnriquecido);
  ```

- [ ] **Etapa 9:** Gravar produtos

  ```typescript
  for (const produto of produtos) {
    await db.insert(produtos).values({
      projectId: pesquisa.projectId,
      pesquisaId,
      clienteId: cliente.id,
      mercadoId: mercadoInserido.id,
      ...produto,
    });
  }
  ```

- [ ] **Etapa 10:** Identificar concorrentes

  ```typescript
  const concorrentes = await prompt4_identificarConcorrentes(mercadoEnriquecido);
  ```

- [ ] **Etapa 11:** Gravar concorrentes

  ```typescript
  for (const concorrente of concorrentes) {
    await db.insert(concorrentes).values({
      pesquisaId,
      projectId: pesquisa.projectId,
      mercadoId: mercadoInserido.id,
      ...concorrente,
    });
  }
  ```

- [ ] **Etapa 12:** Identificar leads (com ciclo fechado)

  ```typescript
  const leads = await prompt5_identificarLeads(
    mercadoEnriquecido,
    concorrentes,
    mercadoEnriquecido.principaisPlayers
  );
  ```

- [ ] **Etapa 13:** Gravar leads
  ```typescript
  for (const lead of leads) {
    await db.insert(leads).values({
      pesquisaId,
      projectId: pesquisa.projectId,
      mercadoId: mercadoInserido.id,
      ...lead,
    });
  }
  ```

### 3.5 Adicionar Logs

- [ ] Log início de cada etapa
- [ ] Log tempo de execução de cada prompt
- [ ] Log erros detalhados
- [ ] Log score de qualidade

### 3.6 Adicionar Tratamento de Erros

- [ ] Try-catch em cada etapa
- [ ] Rollback parcial em caso de erro
- [ ] Incrementar `failedCount` em caso de erro
- [ ] Continuar processamento dos próximos clientes

**Checkpoint:** Processo principal modificado e funcionando

---

## ✅ Fase 4: Testes (2 horas)

### 4.1 Testes Unitários

- [ ] Criar `/app/api/enrichment/__tests__/prompts_v2.test.ts`

- [ ] Testar `prompt1_enriquecerCliente()`
  - [ ] Deve preservar CNPJ original
  - [ ] Deve retornar `null` para CNPJ desconhecido
  - [ ] Deve preencher cidade e UF
  - [ ] Deve preencher setor e descrição

- [ ] Testar `prompt2_identificarMercado()`
  - [ ] Deve retornar mercado válido
  - [ ] Deve preencher categoria e segmentação

- [ ] Testar `prompt3_enriquecerMercado()`
  - [ ] Deve retornar 5 tendências
  - [ ] Deve retornar 10 principais players
  - [ ] Deve retornar crescimento anual

- [ ] Testar `prompt2b_identificarProdutos()`
  - [ ] Deve retornar EXATAMENTE 3 produtos

- [ ] Testar `prompt4_identificarConcorrentes()`
  - [ ] Deve retornar EXATAMENTE 5 concorrentes
  - [ ] Não deve duplicar cliente

- [ ] Testar `prompt5_identificarLeads()`
  - [ ] Deve retornar EXATAMENTE 5 leads
  - [ ] Não deve duplicar cliente
  - [ ] Não deve duplicar concorrentes
  - [ ] Deve aproveitar players do mercado (50-70%)

- [ ] Testar `geocodificar()`
  - [ ] Deve retornar coordenadas válidas
  - [ ] Deve retornar `null` para cidade inválida

### 4.2 Testes de Integração

- [ ] Criar `/app/api/enrichment/__tests__/integration.test.ts`

- [ ] Testar processo completo com 1 cliente
  - [ ] Mock do banco de dados
  - [ ] Mock do OpenAI
  - [ ] Executar processo
  - [ ] Validar cliente enriquecido
  - [ ] Validar mercado criado
  - [ ] Validar 3 produtos criados
  - [ ] Validar 5 concorrentes criados
  - [ ] Validar 5 leads criados

- [ ] Testar tratamento de erros
  - [ ] Erro no Prompt 1 → cliente não enriquecido
  - [ ] Erro no Prompt 2 → mercado não criado
  - [ ] Erro na geocodificação → continua sem coordenadas

### 4.3 Executar Testes

- [ ] Executar testes unitários

  ```bash
  npm test prompts_v2.test.ts
  ```

- [ ] Executar testes de integração

  ```bash
  npm test integration.test.ts
  ```

- [ ] Validar cobertura de testes (meta: ≥ 80%)

**Checkpoint:** Todos os testes passando

---

## ✅ Fase 5: Validação e Deploy (1 hora)

### 5.1 Teste Manual - 1 Cliente

- [ ] Criar job de enriquecimento com 1 cliente
- [ ] Executar processo via interface web
- [ ] Validar que cliente foi enriquecido
  - [ ] CNPJ preservado ou `null`
  - [ ] Cidade e UF preenchidos
  - [ ] Setor e descrição preenchidos
  - [ ] Coordenadas geográficas (se aplicável)

- [ ] Validar que mercado foi criado e enriquecido
  - [ ] Nome, categoria, segmentação preenchidos
  - [ ] Tamanho do mercado preenchido
  - [ ] Crescimento anual preenchido
  - [ ] 5 tendências preenchidas
  - [ ] 10 principais players preenchidos

- [ ] Validar que 3 produtos foram criados
  - [ ] Nome, descrição, público-alvo preenchidos
  - [ ] Diferenciais preenchidos

- [ ] Validar que 5 concorrentes foram criados
  - [ ] Nome, cidade, UF, site preenchidos
  - [ ] Produto principal preenchido
  - [ ] Não duplica cliente

- [ ] Validar que 5 leads foram criados
  - [ ] Nome, cidade, UF, site preenchidos
  - [ ] Produto de interesse preenchido
  - [ ] Fonte marcada corretamente
  - [ ] Não duplica cliente
  - [ ] Não duplica concorrentes
  - [ ] Pelo menos 2-3 leads de players do mercado

### 5.2 Teste Manual - 10 Clientes

- [ ] Criar job com 10 clientes aleatórios
- [ ] Executar processo
- [ ] Validar estatísticas gerais
  - [ ] Score médio ≥ 90%
  - [ ] Taxa de sucesso ≥ 95%
  - [ ] Taxa de aproveitamento de players: 50-70%
  - [ ] Custo médio: ~$0.036 por cliente

- [ ] Validar consistência
  - [ ] Todos os clientes com 3 produtos
  - [ ] Todos os clientes com 5 concorrentes
  - [ ] Todos os clientes com 5 leads
  - [ ] Nenhum CNPJ inventado

### 5.3 Monitoramento de Custos

- [ ] Verificar custos reais no OpenAI Dashboard
- [ ] Comparar com estimativa ($0.036/cliente)
- [ ] Validar que está dentro do orçamento

### 5.4 Documentação

- [ ] Atualizar README.md com informações do Sistema V2
- [ ] Documentar novos campos preenchidos
- [ ] Documentar ciclo fechado de inteligência
- [ ] Criar guia de troubleshooting

### 5.5 Deploy

- [ ] Fazer commit das mudanças

  ```bash
  git add .
  git commit -m "feat: Implementar Sistema de Enriquecimento V2"
  git push origin main
  ```

- [ ] Criar Pull Request no GitHub
- [ ] Solicitar code review
- [ ] Executar CI/CD
- [ ] Fazer merge após aprovação
- [ ] Deploy em produção

### 5.6 Validação Pós-Deploy

- [ ] Executar job de enriquecimento em produção (1 cliente)
- [ ] Validar que processo funciona corretamente
- [ ] Monitorar logs por 1 hora
- [ ] Confirmar que não há erros

**Checkpoint:** Sistema V2 em produção e funcionando

---

## ✅ Fase 6: Rollout Gradual (Opcional)

### 6.1 Fase 1 do Rollout (50 clientes)

- [ ] Criar job com 50 clientes aleatórios
- [ ] Executar processo
- [ ] Validar qualidade (score ≥ 90%)
- [ ] Validar custos (dentro do orçamento)
- [ ] Coletar feedback da equipe

### 6.2 Fase 2 do Rollout (200 clientes)

- [ ] Criar job com 200 clientes (25% da base)
- [ ] Executar processo
- [ ] Validar qualidade
- [ ] Validar custos
- [ ] Ajustar temperaturas se necessário

### 6.3 Fase 3 do Rollout (557 clientes)

- [ ] Criar job com 557 clientes restantes (100%)
- [ ] Executar processo
- [ ] Validar qualidade
- [ ] Validar custos
- [ ] Marcar Sistema V2 como padrão

---

## 📊 Métricas de Sucesso

### Qualidade

- [ ] Score médio ≥ 90%
- [ ] Taxa de rejeição < 5%
- [ ] Localização completa: 100%
- [ ] CNPJ honesto: 100% (zero inventados)

### Consistência

- [ ] Produtos por cliente: sempre 3
- [ ] Concorrentes por cliente: sempre 5
- [ ] Leads por cliente: sempre 5
- [ ] Taxa de aproveitamento de players: 50-70%

### Custo

- [ ] Custo médio por cliente: $0.036 ± 10%
- [ ] Custo total dentro do orçamento
- [ ] Taxa de retrabalho manual: < 10%

### Performance

- [ ] Tempo médio por cliente: < 30 segundos
- [ ] Taxa de timeout: < 1%
- [ ] Taxa de erro: < 5%

---

## 🚨 Rollback Plan

Se algo der errado:

- [ ] Parar todos os jobs de enriquecimento
- [ ] Reverter deploy para versão anterior
- [ ] Restaurar backup do banco (se necessário)
- [ ] Investigar logs de erro
- [ ] Corrigir problema
- [ ] Re-testar em ambiente de desenvolvimento
- [ ] Re-deploy após correção

---

## 📝 Notas

**Data de Início:** _[A preencher]_  
**Data de Conclusão:** _[A preencher]_  
**Responsável:** _[A preencher]_  
**Observações:** _[A preencher]_

---

**Versão:** 1.0  
**Última Atualização:** 30 de novembro de 2024
