# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2025-12-02

### ✨ Adicionado

#### Histórico de Importações
- Interface visual completa com cards de importação
- Filtros por projeto e status
- Paginação com navegação (10 itens por página)
- Estatísticas no topo (Total, Concluídas, Falhadas)
- Contador de registros exibidos
- Barras de progresso com taxa de sucesso
- Badges coloridos por status

#### Visualização de Erros
- Modal detalhado de erros de importação
- Endpoint `importacao.getErros` na API
- Lista de erros com linha número, tipo e mensagem
- Exibição de dados da linha com erro
- Badges coloridos por tipo de erro (validação, duplicação, constraint, parsing)
- Botão "Ver Erros" nos cards com erros

#### Detalhes da Entidade
- Endpoint `entidade.detalhes` - Buscar entidade por ID
- Endpoint `entidade.similares` - Buscar entidades similares
- Endpoint `entidade.recomendacoes` - Recomendações
- Integração com página DetalhesEntidade existente

#### Processamento com IA
- Página de Processamento com IA (`/processamento-ia`)
- Interface com 4 opções de processamento:
  - Analisar Qualidade
  - Sugerir Correções
  - Enriquecer Dados
  - Deduplicar
- Simulação de processamento com resultados
- Visualização de melhorias de qualidade (antes/depois)
- Lista de correções aplicadas e campos enriquecidos

### 🐛 Corrigido

#### Campo "tipo" na Importação
- Correção do bug que salvava todas as entidades como "cliente"
- Agora aceita tanto `tipo` quanto `tipo_entidade`
- Conversão automática para minúsculas
- Fallback para "cliente" se não informado

### 🔄 Modificado

#### ImportacoesListPage
- Reescrito para usar `fetch` direto ao invés de TRPC
- Melhorada interface visual com cards
- Adicionados filtros funcionais
- Implementada paginação

### 📝 Documentação

- Criado CHANGELOG.md
- Criado RESUMO_FINAL_TODAS_IMPLEMENTACOES.md
- Documentados todos os endpoints da API
- Documentadas todas as rotas do frontend

---

## Commits desta versão

- `715a596` - fix: Aceitar campo 'tipo' ou 'tipo_entidade' na importação
- `d305ce1` - feat: Implementar endpoint simples de histórico de importações
- `8ab692a` - feat: Reescrever ImportacoesListPage para usar fetch direto
- `8100e1f` - feat: Adicionar filtros funcionais e paginação no histórico
- `747830a` - feat: Adicionar visualização detalhada de erros com modal
- `c59ebef` - feat: Adicionar endpoints de detalhes, similares e recomendações
- `d1e4f67` - feat: Implementar página de Processamento com IA básico

---

## Links

- [Repositório GitHub](https://github.com/Sandro3110/inteligencia-de-mercado)
- [Deploy em Produção](https://www.intelmarket.app)
- [Documentação da API](./api/trpc.js)
