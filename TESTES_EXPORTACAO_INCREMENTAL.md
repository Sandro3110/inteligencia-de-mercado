# Testes: Exportação Incremental

**Data:** 01/12/2025  
**Status:** ✅ IMPLEMENTAÇÃO COMPLETA | 🧪 PRONTO PARA TESTES

---

## 📋 Checklist de Funcionalidades Implementadas

### **✅ FASE 1: Filtros de Pesquisas**

- [x] Componente PesquisasFilterDialog criado
- [x] Preview de quantidade de registros
- [x] Validação em tempo real
- [x] Integração no frontend (página de projeto)
- [x] Backend aceita pesquisaIds opcional

### **✅ FASE 2: Exportação Incremental**

- [x] Biblioteca jszip instalada
- [x] Utilitário zipGenerator criado
- [x] Múltiplos PDFs quando > 10k registros
- [x] Múltiplos Excels quando > 50k registros
- [x] Empacotamento em ZIP
- [x] Retorno via base64

---

## 🧪 Cenários de Teste

### **Cenário 1: Relatório Simples (< 10k registros)**

**Pré-condições:**

- Projeto com 2-3 pesquisas
- Total de registros: ~8.000

**Passos:**

1. Acessar página do projeto
2. Clicar em "Ver Relatório Consolidado"
3. Dialog abre com todas as pesquisas selecionadas
4. Preview mostra: "3 pesquisas | 8.450 registros"
5. Clicar em "Gerar Relatório"

**Resultado Esperado:**

- ✅ 1 PDF único gerado com análise IA
- ✅ Download automático
- ✅ Arquivo: `relatorio-projeto-{id}-{timestamp}.pdf`
- ✅ Tamanho: ~500KB - 2MB

**Validações:**

- [ ] PDF abre corretamente
- [ ] Contém análise de IA
- [ ] Estatísticas corretas
- [ ] Formatação adequada

---

### **Cenário 2: Relatório com Filtro (< 10k após filtro)**

**Pré-condições:**

- Projeto com 3 pesquisas
- Total sem filtro: 16.241 registros
- Total com 2 pesquisas: 9.800 registros

**Passos:**

1. Acessar página do projeto
2. Clicar em "Ver Relatório Consolidado"
3. Dialog abre com alerta vermelho: "Excede o limite de 10.000 registros"
4. Botão "Gerar Relatório" desabilitado
5. Desmarcar 1 pesquisa
6. Preview atualiza: "2 pesquisas | 9.800 registros" ✅
7. Botão habilitado
8. Clicar em "Gerar Relatório"

**Resultado Esperado:**

- ✅ 1 PDF único gerado (apenas 2 pesquisas)
- ✅ Download automático
- ✅ Arquivo: `relatorio-projeto-{id}-{timestamp}.pdf`

**Validações:**

- [ ] PDF contém apenas dados das 2 pesquisas selecionadas
- [ ] Estatísticas corretas (9.800 registros)
- [ ] Análise de IA coerente

---

### **Cenário 3: Relatório Incremental (> 10k registros)**

**Pré-condições:**

- Projeto com 3 pesquisas
- Total: 16.241 registros
- Todas as pesquisas selecionadas

**Passos:**

1. Acessar página do projeto
2. Clicar em "Ver Relatório Consolidado"
3. Dialog abre com alerta vermelho
4. **FORÇAR** geração (remover validação temporariamente no código)
5. Aguardar processamento

**Resultado Esperado:**

- ✅ ZIP com 3 PDFs (1 por pesquisa)
- ✅ Download automático
- ✅ Arquivo: `relatorios-projeto-{id}-{timestamp}.zip`
- ✅ Tamanho: ~1-3MB

**Validações:**

- [ ] ZIP abre corretamente
- [ ] Contém 3 arquivos PDF
- [ ] Nomes dos arquivos: `relatorio-{nome-pesquisa}.pdf`
- [ ] Cada PDF contém dados apenas da pesquisa correspondente
- [ ] PDFs simples (sem IA, apenas estatísticas)

---

### **Cenário 4: Exportação Simples (< 50k registros)**

**Pré-condições:**

- Projeto com 3 pesquisas
- Total: 16.241 registros

**Passos:**

1. Acessar página do projeto
2. Clicar em "Exportar Tudo"
3. Dialog abre (sem alerta, exportação não tem limite de 10k)
4. Preview mostra: "3 pesquisas | 16.241 registros"
5. Clicar em "Exportar"

**Resultado Esperado:**

- ✅ 1 Excel único com 4 abas
- ✅ Download automático
- ✅ Arquivo: `projeto_{id}_{timestamp}.xlsx`
- ✅ Tamanho: ~5-15MB

**Validações:**

- [ ] Excel abre corretamente
- [ ] 4 abas: Mercados, Clientes, Concorrentes, Leads
- [ ] Dados corretos em cada aba
- [ ] Formatação adequada (header azul, negrito)

---

### **Cenário 5: Exportação Incremental (> 50k registros)**

**Pré-condições:**

- Projeto com 10+ pesquisas
- Total: 60.000+ registros

**Passos:**

1. Acessar página do projeto
2. Clicar em "Exportar Tudo"
3. Dialog abre
4. Preview mostra: "10 pesquisas | 60.000 registros"
5. Clicar em "Exportar"
6. Aguardar processamento (pode demorar 30-60s)

**Resultado Esperado:**

- ✅ ZIP com 10 Excels (1 por pesquisa)
- ✅ Download automático
- ✅ Arquivo: `exportacao-projeto-{id}-{timestamp}.zip`
- ✅ Tamanho: ~50-100MB

**Validações:**

- [ ] ZIP abre corretamente
- [ ] Contém 10 arquivos Excel
- [ ] Nomes dos arquivos: `exportacao-{nome-pesquisa}.xlsx`
- [ ] Cada Excel tem 4 abas
- [ ] Cada Excel contém dados apenas da pesquisa correspondente
- [ ] Sem erros de timeout ou memória

---

### **Cenário 6: Exportação com Filtro**

**Pré-condições:**

- Projeto com 10 pesquisas
- Total: 60.000 registros

**Passos:**

1. Acessar página do projeto
2. Clicar em "Exportar Tudo"
3. Dialog abre
4. Desmarcar 5 pesquisas
5. Preview atualiza: "5 pesquisas | 30.000 registros"
6. Clicar em "Exportar"

**Resultado Esperado:**

- ✅ 1 Excel único (< 50k registros)
- ✅ Download automático
- ✅ Contém apenas dados das 5 pesquisas selecionadas

**Validações:**

- [ ] Excel contém apenas dados filtrados
- [ ] Total de registros: ~30.000
- [ ] 4 abas com dados corretos

---

## 🔍 Validações de Segurança

### **Validação 1: Limite de Timeout**

- [ ] Exportação de 100k registros não causa timeout
- [ ] Processamento incremental funciona
- [ ] Logs mostram progresso

### **Validação 2: Limite de Memória**

- [ ] Exportação de 100k registros não causa erro de memória
- [ ] Processamento por pesquisa evita sobrecarga
- [ ] Servidor não trava

### **Validação 3: Integridade dos Dados**

- [ ] Nenhum registro perdido
- [ ] Nenhum registro duplicado
- [ ] Dados corretos em cada arquivo

### **Validação 4: Permissões**

- [ ] Usuário só acessa projetos próprios
- [ ] pesquisaIds validados no backend
- [ ] Sem vazamento de dados

---

## 📊 Testes de Performance

### **Teste 1: Relatório com 5k registros**

- **Tempo esperado:** 10-15 segundos
- **Resultado:** **\_** segundos
- **Status:** [ ] PASS | [ ] FAIL

### **Teste 2: Relatório com 15k registros (múltiplos PDFs)**

- **Tempo esperado:** 20-30 segundos
- **Resultado:** **\_** segundos
- **Status:** [ ] PASS | [ ] FAIL

### **Teste 3: Exportação com 20k registros**

- **Tempo esperado:** 15-25 segundos
- **Resultado:** **\_** segundos
- **Status:** [ ] PASS | [ ] FAIL

### **Teste 4: Exportação com 60k registros (múltiplos Excels)**

- **Tempo esperado:** 40-60 segundos
- **Resultado:** **\_** segundos
- **Status:** [ ] PASS | [ ] FAIL

### **Teste 5: Exportação com 100k registros**

- **Tempo esperado:** 60-90 segundos
- **Resultado:** **\_** segundos
- **Status:** [ ] PASS | [ ] FAIL

---

## 🐛 Testes de Erro

### **Erro 1: Projeto sem pesquisas**

- **Ação:** Tentar gerar relatório de projeto vazio
- **Resultado esperado:** Erro amigável "Não há dados"
- **Status:** [ ] PASS | [ ] FAIL

### **Erro 2: Nenhuma pesquisa selecionada**

- **Ação:** Desmarcar todas as pesquisas no dialog
- **Resultado esperado:** Botão desabilitado
- **Status:** [ ] PASS | [ ] FAIL

### **Erro 3: Falha na API OpenAI**

- **Ação:** Remover API key temporariamente
- **Resultado esperado:** Erro "OpenAI API key não configurada"
- **Status:** [ ] PASS | [ ] FAIL

### **Erro 4: Falha no banco de dados**

- **Ação:** Desconectar banco temporariamente
- **Resultado esperado:** Erro "Database connection failed"
- **Status:** [ ] PASS | [ ] FAIL

---

## 📝 Logs de Console Esperados

### **Relatório Simples (< 10k):**

```
[Reports] Gerando relatório único para 8450 registros
[Reports] Gerando relatório para 8450 registros
```

### **Relatório Incremental (> 10k):**

```
[Reports] Total de 16241 registros excede limite de 10000. Gerando múltiplos PDFs (1 por pesquisa)...
[Reports] Gerando PDF para pesquisa: Base Inicial (ID: 1)
[Reports] PDF gerado para pesquisa: Base Inicial
[Reports] Gerando PDF para pesquisa: Expansão Q2 (ID: 2)
[Reports] PDF gerado para pesquisa: Expansão Q2
[Reports] Gerando PDF para pesquisa: Expansão Q3 (ID: 3)
[Reports] PDF gerado para pesquisa: Expansão Q3
[Reports] Criando ZIP com 3 PDFs...
[ZipGenerator] Criando ZIP "relatorios-projeto-1.zip" com 3 arquivos
[ZipGenerator] Adicionado: relatorio-Base-Inicial.pdf (245678 bytes, base64)
[ZipGenerator] Adicionado: relatorio-Expansao-Q2.pdf (198234 bytes, base64)
[ZipGenerator] Adicionado: relatorio-Expansao-Q3.pdf (223456 bytes, base64)
[ZipGenerator] Gerando ZIP...
[ZipGenerator] ZIP gerado com sucesso: 667368 bytes
```

### **Exportação Incremental (> 50k):**

```
[Export] Total de 60000 registros excede limite de 50000. Gerando múltiplos Excels (1 por pesquisa)...
[Export] Gerando Excel para pesquisa: Pesquisa 1 (ID: 1)
[Export] Excel gerado para pesquisa: Pesquisa 1
[Export] Gerando Excel para pesquisa: Pesquisa 2 (ID: 2)
[Export] Excel gerado para pesquisa: Pesquisa 2
...
[Export] Criando ZIP com 10 Excels...
[ZipGenerator] Criando ZIP "exportacao-projeto-1.zip" com 10 arquivos
[ZipGenerator] ZIP gerado com sucesso: 52428800 bytes
```

---

## ✅ Critérios de Aceitação

### **Funcionalidade:**

- [ ] Todos os cenários de teste passam
- [ ] Filtros funcionam corretamente
- [ ] Múltiplos arquivos são gerados quando necessário
- [ ] ZIPs são criados e baixados corretamente

### **Performance:**

- [ ] Nenhum timeout em exportações < 100k registros
- [ ] Tempo de resposta aceitável (< 90s para 100k)
- [ ] Uso de memória controlado

### **Segurança:**

- [ ] Validações de permissão funcionam
- [ ] Dados não vazam entre usuários
- [ ] Erros não expõem informações sensíveis

### **UX:**

- [ ] Mensagens de erro claras
- [ ] Loading states visíveis
- [ ] Preview de quantidade preciso
- [ ] Download automático funciona

---

## 🚀 Próximos Passos Após Testes

1. **Se todos os testes passarem:**
   - Documentar uso
   - Criar changelog
   - Deploy para produção

2. **Se houver falhas:**
   - Corrigir bugs identificados
   - Re-testar cenários afetados
   - Validar correções

3. **Melhorias futuras:**
   - Adicionar barra de progresso
   - Notificação por email quando concluir
   - Cache de relatórios gerados
   - Agendamento de exportações

---

**Status:** ✅ PRONTO PARA TESTES  
**Prioridade:** 🔴 ALTA  
**Responsável:** Usuário (testes manuais) + Manus (correções)
