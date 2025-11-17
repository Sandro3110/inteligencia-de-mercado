# Guia de Uso - Gestor de Pesquisa de Mercado PAV

## 📋 Visão Geral

O **Gestor de Pesquisa de Mercado PAV** é uma aplicação web moderna e intuitiva para gerenciar, validar e exportar dados de pesquisa de mercado. A aplicação permite visualizar mercados, clientes, concorrentes e leads de forma organizada e interativa.

---

## 🚀 Funcionalidades Principais

### 1. Dashboard

O Dashboard é a tela inicial que apresenta uma visão geral dos dados:

- **Cards de Métricas**: Exibe totais de Mercados (73), Clientes (800), Concorrentes (591) e Leads (727)
- **Progresso de Validação**: Mostra o percentual de dados validados e a distribuição por status:
  - ⏸️ Pendentes
  - ✅ Validados (Rico)
  - ⚠️ Precisam Ajuste
  - ❌ Descartados
- **Ações Rápidas**:
  - Botão "Ver Mercados" para acessar a lista completa
  - Botões de exportação CSV para Clientes, Concorrentes e Leads

### 2. Lista de Mercados

Acesse através do botão "Ver Mercados" no Dashboard.

**Recursos**:
- Grid de cards com todos os mercados identificados
- Busca por nome ou categoria
- Informações exibidas em cada card:
  - Nome do mercado
  - Segmentação (B2B/B2C/B2B2C)
  - Categoria
  - Quantidade de clientes
  - Taxa de crescimento anual
- Clique em qualquer card para ver os detalhes

### 3. Detalhes do Mercado

Tela principal de trabalho com 3 abas interativas:

#### Aba "Clientes"
Exibe todos os clientes associados ao mercado selecionado.

**Colunas da tabela**:
- Nome (com link para site oficial)
- Produto Principal
- Segmentação (B2B/B2C)
- Localização (Cidade, UF)
- Contato (Email e Telefone)
- Status de Validação
- Ações (Botão "Validar")

#### Aba "Concorrentes"
Lista os concorrentes mapeados para o mercado.

**Colunas da tabela**:
- Nome (com link para site)
- Produto
- Porte (Grande/Médio/Pequeno)
- Faturamento Estimado
- Qualidade (Score de 0-10 + Classificação)
- Status de Validação
- Ações (Botão "Validar")

#### Aba "Leads"
Apresenta os leads qualificados para o mercado.

**Colunas da tabela**:
- Nome (com link para site)
- Tipo (B2B/B2C)
- Porte
- Região
- Contato (Email e Telefone)
- Qualidade (Score + Classificação)
- Status de Validação
- Ações (Botão "Validar")

---

## ✅ Sistema de Validação

### Como Validar um Item

1. Navegue até a aba desejada (Clientes, Concorrentes ou Leads)
2. Clique no botão **"Validar"** na linha do item que deseja validar
3. Um modal será aberto com as seguintes opções:

#### Status de Validação

**✅ Rico** - Dados completos e validados
- Use quando o item possui todas as informações necessárias
- Dados estão corretos e verificados
- Pronto para uso

**⚠️ Precisa Ajuste** - Requer correções ou complementos
- Use quando faltam informações importantes
- Dados precisam ser atualizados ou corrigidos
- Requer ação futura

**❌ Descartado** - Dados incorretos ou irrelevantes
- Use quando o item não é relevante para o projeto
- Informações estão incorretas ou duplicadas
- Não será usado

#### Campo de Observações

- Adicione notas sobre o item
- Descreva o que precisa ser ajustado
- Registre informações importantes para referência futura

### Salvando a Validação

1. Selecione o status desejado
2. (Opcional) Adicione observações
3. Clique em **"Salvar Validação"**
4. Uma notificação de sucesso será exibida
5. O status do item será atualizado imediatamente na tabela
6. O progresso de validação no Dashboard será atualizado

---

## 📊 Exportação de Dados

### Exportar para CSV

A aplicação permite exportar todos os dados em formato CSV para análise externa.

**Como exportar**:

1. No Dashboard, na seção "Ações Rápidas", clique em um dos botões:
   - **Exportar Clientes** - Gera arquivo `clientes-pav.csv`
   - **Exportar Concorrentes** - Gera arquivo `concorrentes-pav.csv`
   - **Exportar Leads** - Gera arquivo `leads-pav.csv`

2. O arquivo será baixado automaticamente para sua pasta de Downloads

3. Uma notificação de sucesso será exibida

**Formato do CSV**:
- Codificação UTF-8 com BOM (compatível com Excel)
- Separador: vírgula (,)
- Campos com vírgulas são automaticamente escapados com aspas
- Inclui todas as colunas do banco de dados

---

## 🎨 Interface e Navegação

### Design Moderno e Fluido

- **Cores Vibrantes**: Azul, laranja, verde para diferenciar entidades
- **Hover Effects**: Cards e botões respondem ao passar do mouse
- **Badges Coloridos**: Status visual com ícones e cores
- **Gradientes Suaves**: Fundo com gradiente para profundidade
- **Responsivo**: Funciona em desktop, tablet e mobile

### Navegação

**Breadcrumb implícito**:
- Dashboard → Lista de Mercados → Detalhes do Mercado
- Botão "Voltar" (seta) em cada tela para retornar

**Atalhos**:
- Logo/Título sempre leva ao Dashboard
- Botão "Ver Mercados" no Dashboard

---

## 💡 Dicas de Uso

### Fluxo de Trabalho Recomendado

1. **Comece pelo Dashboard** para ter uma visão geral dos dados
2. **Navegue pelos mercados** para entender a distribuição
3. **Entre nos detalhes** de um mercado específico
4. **Valide os dados** aba por aba (Clientes → Concorrentes → Leads)
5. **Use as observações** para registrar informações importantes
6. **Exporte os dados** quando necessário para análise externa

### Boas Práticas de Validação

- **Seja consistente** nos critérios de validação
- **Use as observações** para documentar decisões
- **Valide em lotes** por mercado para manter o contexto
- **Revise periodicamente** os itens marcados como "Precisa Ajuste"
- **Exporte regularmente** para backup dos dados validados

### Performance

- A aplicação carrega dados sob demanda
- Filtros e buscas são instantâneos
- Validações são salvas imediatamente no banco
- Exportações são geradas no navegador (sem overhead de servidor)

---

## 🔧 Dados Disponíveis

### Estatísticas Atuais

- **73 Mercados Únicos** identificados
- **800 Clientes** associados aos mercados
- **591 Concorrentes** mapeados
- **727 Leads** qualificados
- **Total**: 2.991 registros

### Cobertura de Dados

- **100% dos clientes** possuem associação com mercados
- **Média de 10.96 clientes** por mercado
- **Média de 8.10 concorrentes** por mercado
- **Média de 9.96 leads** por mercado

---

## 📞 Suporte

Para dúvidas, sugestões ou problemas técnicos, entre em contato com a equipe do Projeto PAV.

---

**Versão**: 1.0  
**Última atualização**: Novembro 2025

