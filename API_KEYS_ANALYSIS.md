# Análise de Fontes de Chaves de API

## 📊 Resumo do Problema

A aplicação possui **MÚLTIPLAS TABELAS** para armazenar chaves de API, causando inconsistências:

### 1. **system_settings** ✅ (Tabela Principal)
- Usado por: Página de configurações (`/settings`)
- Usado por: API de enriquecimento (`/api/enrichment/process`)
- **Chave**: `OPENAI_API_KEY`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`
- **Escopo**: Global (sistema inteiro)

### 2. **enrichment_configs** ⚠️ (Por Projeto)
- Usado por: `server/services/llmWithConfig.ts`
- Usado por: Testes
- **Colunas**: `openaiApiKey`, `geminiApiKey`, `anthropicApiKey`
- **Escopo**: Por projeto (cada projeto pode ter suas próprias chaves)

### 3. **llm_provider_configs** ⚠️ (Por Projeto)
- Usado por: `components/settings/LlmConfigForm.tsx`
- Usado por: `/api/test/setup-llm-config`
- **Colunas**: `openaiApiKey`, `geminiApiKey`, `anthropicApiKey`
- **Escopo**: Por projeto

### 4. **process.env** ⚠️ (Variáveis de Ambiente)
- Usado por: `server/integrations/openai.ts`
- Usado por: `server/_core/openai.ts`
- **Chave**: `OPENAI_API_KEY`
- **Escopo**: Global (fallback)

## 🔍 Arquivos que Buscam Chaves

### Busca de `system_settings`:
- ✅ `app/(app)/settings/page.tsx` - Página de configurações
- ✅ `app/api/enrichment/process/route.ts` - Processo de enriquecimento
- ✅ `app/api/insert-openai-key/route.ts` - Inserir chave
- ✅ `server/routers/settings.ts` - Router TRPC

### Busca de `enrichment_configs`:
- ⚠️ `server/services/llmWithConfig.ts` - Serviço principal de LLM
- ⚠️ `server/__tests__backup/enrichmentConfig.test.ts` - Testes

### Busca de `llm_provider_configs`:
- ⚠️ `components/settings/LlmConfigForm.tsx` - Formulário de config LLM
- ⚠️ `app/api/test/setup-llm-config/route.ts` - Setup de teste

### Busca de `process.env`:
- ⚠️ `server/integrations/openai.ts` - Integração OpenAI direta
- ⚠️ `server/_core/openai.ts` - Core OpenAI
- ⚠️ `server/_core/llm.ts` - Core LLM

## 🎯 Recomendação

**Padronizar para usar APENAS `system_settings`** como fonte única de verdade:

### Vantagens:
1. ✅ Configuração centralizada
2. ✅ Mais simples de gerenciar
3. ✅ Evita inconsistências
4. ✅ Já tem interface de configuração funcionando

### Alternativa (se precisar por projeto):
- Usar `llm_provider_configs` como fonte única
- Atualizar página de configurações para usar essa tabela
- Adicionar seletor de projeto na tela

## 📝 Ações Necessárias

1. **Decidir**: Usar `system_settings` (global) ou `llm_provider_configs` (por projeto)
2. **Atualizar**: Todos os arquivos para buscar da mesma tabela
3. **Migrar**: Dados existentes para a tabela escolhida
4. **Testar**: Todas as funcionalidades de IA
