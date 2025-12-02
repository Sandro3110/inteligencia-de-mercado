# TODO - Implementação da API de IA

## Fase 1: Configurar OpenAI e criar serviço base
- [ ] Instalar pacote openai
- [ ] Criar lib/openai.ts com cliente configurado
- [ ] Criar lib/ia-service.ts com funções base
- [ ] Criar tabela ia_usage no banco
- [ ] Criar tabela ia_config no banco
- [ ] Testar conexão com OpenAI

## Fase 2: Implementar 3 funcionalidades de IA
- [ ] Endpoint: POST /api/ia/enriquecer (Enriquecimento de Entidades)
- [ ] Endpoint: POST /api/ia/analisar-mercado (Análise de Mercado)
- [ ] Endpoint: POST /api/ia/sugestoes (Sugestões de Ações)
- [ ] Integrar com cache Redis
- [ ] Adicionar tracking de uso em cada endpoint

## Fase 3: Sistema de tracking de uso e custos
- [ ] Função trackIAUsage() para registrar cada chamada
- [ ] Calcular custo baseado em tokens
- [ ] Agregações por dia/mês/usuário/processo
- [ ] Endpoint GET /api/ia/stats (estatísticas gerais)
- [ ] Endpoint GET /api/ia/usage (uso detalhado)

## Fase 4: Página de Gestão de IA
- [ ] Criar client/src/pages/GestaoIA.tsx
- [ ] Card: IA Ativa + Modelo
- [ ] Seletor de plataforma (OpenAI/Google/Anthropic)
- [ ] Gráfico: Tokens por dia (últimos 30 dias)
- [ ] Gráfico: Tokens por mês (últimos 12 meses)
- [ ] Tabela: Consumo por usuário
- [ ] Tabela: Consumo por processo
- [ ] Gráfico: Estimativa de custo por mês
- [ ] Gráfico: Custo por processo
- [ ] Gráfico: Custo por usuário
- [ ] Lista de atividades recentes + custo
- [ ] Progress bar: Consumo do budget do mês
- [ ] Adicionar rota /gestao-ia no App.tsx
- [ ] Adicionar link no menu (seção Administração)

## Fase 5: Integrar IA no frontend
- [ ] Botão "Enriquecer com IA" na página de entidades
- [ ] Badge "Enriquecido com IA" nas entidades
- [ ] Página "Análise de IA" para análise de mercado
- [ ] Modal de sugestões de ações
- [ ] Loading states e toasts

## Fase 6: Testes e entrega
- [ ] Testar enriquecimento de entidade
- [ ] Testar análise de mercado
- [ ] Testar sugestões
- [ ] Testar troca de plataforma
- [ ] Validar cálculos de custo
- [ ] Validar gráficos
- [ ] Commit e deploy
- [ ] Documentação final
