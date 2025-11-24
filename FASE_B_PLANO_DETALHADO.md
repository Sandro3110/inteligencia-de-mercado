# Fase B - Plano Detalhado de Refatoração do Backend

**Data:** 24/11/2025
**Status:** Iniciando

---

## 📊 AUDITORIA INICIAL

### Estrutura do Backend
- **Total de arquivos:** 159 arquivos .ts
- **Routers:** 17 arquivos
- **Services:** 8 arquivos principais
- **Tipos 'any' encontrados:** 151 (excluindo testes)
  - Routers: 1
  - Services: 66
  - Outros: 84

### Arquivos Prioritários (mais tipos 'any')
1. **analysisService.ts** - 12 tipos 'any'
2. **queryBuilderService.ts** - 8 tipos 'any'
3. **spreadsheetParser.ts** - 7 tipos 'any'
4. **validationSchemas.ts** - 5 tipos 'any'
5. **preResearchService.ts** - 5 tipos 'any'

---

## 🎯 ESTRATÉGIA

### Fase 1: Services (Prioridade Alta)
**Ordem:** Do mais crítico para o menos crítico

1. analysisService.ts (12 'any')
2. queryBuilderService.ts (8 'any')
3. spreadsheetParser.ts (7 'any')
4. validationSchemas.ts (5 'any')
5. preResearchService.ts (5 'any')
6. llmWithConfig.ts (1 'any')
7. interpretationService.ts (1 'any')
8. geocoding.ts (0 'any' - verificar qualidade)

**Estimativa:** 20-25 horas

### Fase 2: Routers (Prioridade Média)
Verificar e padronizar todos os 17 routers

**Estimativa:** 10-15 horas

### Fase 3: Error Handling
Padronizar tratamento de erros em todo o backend

**Estimativa:** 5-8 horas

### Fase 4: Documentação
Documentar todas as funções e interfaces

**Estimativa:** 5-7 horas

---

## 📋 PADRÕES A APLICAR

### Type Safety
- ✅ Eliminar 100% dos tipos 'any'
- ✅ Criar interfaces detalhadas
- ✅ Usar tipos genéricos quando apropriado
- ✅ Validação de tipos em runtime (Zod)

### Error Handling
- ✅ TRPCError padronizado
- ✅ Mensagens de erro consistentes
- ✅ Logging estruturado
- ✅ Stack traces informativos

### Documentação
- ✅ JSDoc em todas as funções públicas
- ✅ Interfaces documentadas
- ✅ Exemplos de uso
- ✅ Descrição de parâmetros e retornos

### Código Limpo
- ✅ Funções pequenas e focadas
- ✅ Nomes descritivos
- ✅ Constantes extraídas
- ✅ Código DRY

---

## 🎯 MÉTRICAS DE SUCESSO

- [ ] 0 tipos 'any' no código de produção
- [ ] 100% de type safety
- [ ] 100% de documentação
- [ ] Error handling padronizado
- [ ] Testes passando

---

## ⏱️ ESTIMATIVA TOTAL

**40-55 horas** para completar Fase B com qualidade máxima

---

**Status:** Pronto para iniciar!
