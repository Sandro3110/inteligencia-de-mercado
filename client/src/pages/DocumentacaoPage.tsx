import { useState } from 'react';
import { BookOpen, Copy, FileDown, Check } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function DocumentacaoPage() {
  const [copiado, setCopiado] = useState(false);
  const [gerando, setGerando] = useState(false);
  const { toast } = useToast();

  // Seções da documentação
  const secoes = [
    { id: 'introducao', titulo: 'Introdução' },
    { id: 'primeiros-passos', titulo: 'Primeiros Passos' },
    { id: 'visao-geral', titulo: 'Visão Geral' },
    { id: 'preparacao', titulo: 'Preparação' },
    { id: 'enriquecimento', titulo: 'Enriquecimento' },
    { id: 'inteligencia', titulo: 'Inteligência' },
    { id: 'administracao', titulo: 'Administração' },
    { id: 'fluxos', titulo: 'Fluxos de Trabalho' },
    { id: 'faq', titulo: 'Perguntas Frequentes' },
    { id: 'glossario', titulo: 'Glossário' }
  ];

  const copiarConteudo = async () => {
    try {
      const conteudo = document.getElementById('conteudo-documentacao')?.innerText || '';
      await navigator.clipboard.writeText(conteudo);
      setCopiado(true);
      toast({
        title: 'Conteúdo copiado!',
        description: 'A documentação foi copiada para a área de transferência',
        duration: 3000
      });
      setTimeout(() => setCopiado(false), 3000);
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o conteúdo',
        variant: 'destructive',
        duration: 3000
      });
    }
  };

  const exportarPDF = async () => {
    setGerando(true);
    toast({
      title: 'Gerando PDF...',
      description: 'Aguarde enquanto preparamos o documento',
      duration: 2000
    });

    try {
      // Importar biblioteca jsPDF dinamicamente
      const { default: jsPDF } = await import('jspdf');
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Configurações
      const margemEsquerda = 20;
      const margemDireita = 20;
      const margemTopo = 20;
      const larguraPagina = 210;
      const larguraUtil = larguraPagina - margemEsquerda - margemDireita;
      let y = margemTopo;

      // Função auxiliar para adicionar texto com quebra de linha
      const adicionarTexto = (texto: string, tamanho: number, negrito: boolean = false, espacoAntes: number = 0) => {
        if (y + espacoAntes > 270) {
          doc.addPage();
          y = margemTopo;
        }
        y += espacoAntes;
        
        doc.setFontSize(tamanho);
        doc.setFont('helvetica', negrito ? 'bold' : 'normal');
        
        const linhas = doc.splitTextToSize(texto, larguraUtil);
        linhas.forEach((linha: string) => {
          if (y > 270) {
            doc.addPage();
            y = margemTopo;
          }
          doc.text(linha, margemEsquerda, y);
          y += tamanho * 0.5;
        });
      };

      // Capa
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('Documentação', larguraPagina / 2, 80, { align: 'center' });
      doc.setFontSize(24);
      doc.text('Intelmarket', larguraPagina / 2, 95, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Plataforma de Inteligência de Mercado', larguraPagina / 2, 110, { align: 'center' });
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, larguraPagina / 2, 120, { align: 'center' });

      // Nova página para conteúdo
      doc.addPage();
      y = margemTopo;

      // Introdução
      adicionarTexto('BEM-VINDO AO INTELMARKET', 18, true, 0);
      adicionarTexto('O Intelmarket é uma plataforma completa de inteligência de mercado que combina gestão de dados empresariais, enriquecimento automatizado com inteligência artificial e análises multidimensionais avançadas.', 11, false, 8);
      
      adicionarTexto('O QUE VOCÊ PODE FAZER', 14, true, 12);
      adicionarTexto('• Importar bases de clientes e leads', 11, false, 6);
      adicionarTexto('• Enriquecer automaticamente informações empresariais usando IA', 11, false, 5);
      adicionarTexto('• Realizar análises geográficas e temporais', 11, false, 5);
      adicionarTexto('• Explorar mercados de forma multidimensional', 11, false, 5);
      adicionarTexto('• Gerenciar projetos de inteligência comercial', 11, false, 5);

      // Primeiros Passos
      adicionarTexto('PRIMEIROS PASSOS', 18, true, 15);
      
      adicionarTexto('Acesso à Plataforma', 14, true, 8);
      adicionarTexto('Ao acessar o Intelmarket pela primeira vez, você será direcionado para a tela de login. Utilize as credenciais fornecidas pelo administrador do sistema. Após o login bem-sucedido, você será redirecionado automaticamente para o Dashboard.', 11, false, 5);

      adicionarTexto('Navegação e Interface', 14, true, 10);
      adicionarTexto('A interface do Intelmarket foi projetada para oferecer acesso rápido a todas as funcionalidades através de uma barra lateral esquerda que permanece visível durante toda a navegação. O menu lateral está organizado em seções temáticas, cada uma agrupando funcionalidades relacionadas.', 11, false, 5);

      // Módulos Principais
      adicionarTexto('MÓDULOS PRINCIPAIS', 18, true, 15);

      adicionarTexto('1. Visão Geral', 14, true, 8);
      adicionarTexto('Dashboard: Centro de comando com métricas consolidadas, ações rápidas e atividades recentes.', 11, false, 5);
      adicionarTexto('Base de Dados: Repositório central de todas as entidades (clientes, leads, concorrentes) com filtros, busca e exportação.', 11, false, 5);

      adicionarTexto('2. Preparação', 14, true, 10);
      adicionarTexto('Projetos: Organize suas iniciativas de inteligência de mercado.', 11, false, 5);
      adicionarTexto('Pesquisas: Configure investigações específicas com critérios de segmentação.', 11, false, 5);
      adicionarTexto('Importar Dados: Importe bases em CSV ou Excel com validação automática.', 11, false, 5);
      adicionarTexto('Histórico: Acompanhe todas as importações realizadas.', 11, false, 5);

      adicionarTexto('3. Enriquecimento', 14, true, 10);
      adicionarTexto('Enriquecer com IA: Complemente automaticamente informações faltantes usando múltiplas fontes de dados.', 11, false, 5);
      adicionarTexto('Processamento Avançado: Análise em lote, scoring de fit e geração de insights automatizados.', 11, false, 5);

      adicionarTexto('4. Inteligência', 14, true, 10);
      adicionarTexto('Explorador Multidimensional: Análises interativas por múltiplas dimensões (setor, porte, região).', 11, false, 5);
      adicionarTexto('Análise Temporal: Identifique tendências e padrões ao longo do tempo.', 11, false, 5);
      adicionarTexto('Análise Geográfica: Visualize distribuição espacial através de mapas e heatmaps.', 11, false, 5);
      adicionarTexto('Análise de Mercado: Explore hierarquia de mercados e segmentos.', 11, false, 5);

      adicionarTexto('5. Administração', 14, true, 10);
      adicionarTexto('Usuários: Gerencie acesso, permissões e controle de atividades.', 11, false, 5);
      adicionarTexto('Gestão de IA: Monitore consumo de créditos, custos e políticas de segurança.', 11, false, 5);

      // Fluxos de Trabalho
      adicionarTexto('FLUXOS DE TRABALHO RECOMENDADOS', 18, true, 15);

      adicionarTexto('Fluxo 1: Qualificação de Base de Leads', 14, true, 8);
      adicionarTexto('1. Importe sua base de leads (CSV/Excel)', 11, false, 5);
      adicionarTexto('2. Enriqueça com IA para complementar informações', 11, false, 5);
      adicionarTexto('3. Execute scoring de fit e probabilidade de conversão', 11, false, 5);
      adicionarTexto('4. Ordene por score e exporte os top 20% para o CRM', 11, false, 5);
      adicionarTexto('5. Analise padrões nos leads de alto score', 11, false, 5);

      adicionarTexto('Fluxo 2: Expansão Geográfica', 14, true, 10);
      adicionarTexto('1. Visualize distribuição atual de clientes no mapa', 11, false, 5);
      adicionarTexto('2. Identifique regiões com baixa cobertura mas alto potencial', 11, false, 5);
      adicionarTexto('3. Analise composição do mercado local', 11, false, 5);
      adicionarTexto('4. Crie projeto específico para expansão', 11, false, 5);
      adicionarTexto('5. Monitore métricas de penetração ao longo do tempo', 11, false, 5);

      // Perguntas Frequentes
      adicionarTexto('PERGUNTAS FREQUENTES', 18, true, 15);

      adicionarTexto('Quais formatos de arquivo são suportados?', 14, true, 8);
      adicionarTexto('A plataforma suporta arquivos CSV e Excel (XLS/XLSX). Para CSV, recomendamos codificação UTF-8.', 11, false, 5);

      adicionarTexto('Como funciona o consumo de créditos de IA?', 14, true, 10);
      adicionarTexto('Enriquecimentos básicos (porte, setor) consomem 1 crédito por empresa. Enriquecimentos avançados consomem 3-5 créditos. O sistema sempre exibe estimativa antes de processar.', 11, false, 5);

      adicionarTexto('Meus dados estão seguros?', 14, true, 10);
      adicionarTexto('Sim. A plataforma implementa criptografia TLS 1.3 em trânsito e AES-256 em repouso, autenticação de dois fatores, controle de acesso baseado em perfis e backups automáticos diários.', 11, false, 5);

      adicionarTexto('A plataforma está em conformidade com LGPD?', 14, true, 10);
      adicionarTexto('Sim. A plataforma foi desenvolvida com conformidade LGPD desde o design, incluindo funcionalidades de anonimização, direito ao esquecimento e portabilidade de dados.', 11, false, 5);

      // Contato
      adicionarTexto('CONTATO E SUPORTE', 18, true, 15);
      adicionarTexto('Email: suporte@intelmarket.app', 11, false, 8);
      adicionarTexto('Telefone: +55 (11) 3000-0000', 11, false, 5);
      adicionarTexto('Horário: Segunda a sexta, 9h às 18h (horário de Brasília)', 11, false, 5);

      // Rodapé
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      const totalPaginas = doc.getNumberOfPages();
      for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);
        doc.text(
          `Página ${i} de ${totalPaginas} - Documentação Intelmarket - ${new Date().toLocaleDateString('pt-BR')}`,
          larguraPagina / 2,
          285,
          { align: 'center' }
        );
      }

      // Salvar PDF
      doc.save(`Intelmarket_Documentacao_${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: 'PDF gerado com sucesso!',
        description: 'O arquivo foi baixado para seu computador',
        duration: 3000
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: 'Erro ao gerar PDF',
        description: 'Não foi possível gerar o documento. Tente novamente.',
        variant: 'destructive',
        duration: 3000
      });
    } finally {
      setGerando(false);
    }
  };

  const rolarPara = (id: string) => {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Documentação"
        description="Guia completo de uso da plataforma Intelmarket"
        icon={BookOpen}
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Documentação' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navegação Lateral */}
        <Card className="p-4 h-fit sticky top-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Índice
          </h3>
          <nav className="space-y-1">
            {secoes.map((secao) => (
              <button
                key={secao.id}
                onClick={() => rolarPara(secao.id)}
                className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
              >
                {secao.titulo}
              </button>
            ))}
          </nav>

          <div className="mt-6 space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copiarConteudo}
              disabled={copiado}
              className="w-full"
            >
              {copiado ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Conteúdo
                </>
              )}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={exportarPDF}
              disabled={gerando}
              className="w-full"
            >
              <FileDown className="h-4 w-4 mr-2" />
              {gerando ? 'Gerando PDF...' : 'Exportar PDF'}
            </Button>
          </div>
        </Card>

        {/* Conteúdo */}
        <div className="lg:col-span-3">
          <Card className="p-8" id="conteudo-documentacao">
            <div className="prose prose-slate max-w-none">
              {/* Introdução */}
              <section id="introducao" className="mb-12">
                <h1 className="text-3xl font-bold mb-4">Bem-vindo ao Intelmarket</h1>
                <p className="text-lg text-muted-foreground mb-6">
                  O Intelmarket é uma plataforma completa de inteligência de mercado que combina gestão de dados empresariais, 
                  enriquecimento automatizado com inteligência artificial e análises multidimensionais avançadas. A plataforma 
                  foi desenvolvida para profissionais de vendas, marketing e inteligência comercial que precisam transformar 
                  dados brutos em insights acionáveis.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">O que você pode fazer com o Intelmarket</h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Importar bases de clientes e leads em CSV ou Excel</li>
                  <li>Enriquecer automaticamente informações empresariais usando IA</li>
                  <li>Realizar análises geográficas e temporais</li>
                  <li>Explorar mercados de forma multidimensional</li>
                  <li>Gerenciar projetos de inteligência comercial de ponta a ponta</li>
                </ul>
              </section>

              {/* Primeiros Passos */}
              <section id="primeiros-passos" className="mb-12">
                <h1 className="text-3xl font-bold mb-4">Primeiros Passos</h1>
                
                <h2 className="text-2xl font-semibold mt-6 mb-3">Acesso à Plataforma</h2>
                <p className="text-muted-foreground mb-4">
                  Ao acessar o Intelmarket pela primeira vez, você será direcionado para a tela de login. Utilize as 
                  credenciais fornecidas pelo administrador do sistema. Após o login bem-sucedido, você será redirecionado 
                  automaticamente para o Dashboard, que apresenta uma visão consolidada de suas atividades e métricas principais.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-3">Navegação e Interface</h2>
                <p className="text-muted-foreground mb-4">
                  A interface do Intelmarket foi projetada para oferecer acesso rápido a todas as funcionalidades através de 
                  uma barra lateral esquerda que permanece visível durante toda a navegação. O menu lateral está organizado em 
                  seções temáticas, cada uma agrupando funcionalidades relacionadas.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-3">Fluxo Básico Recomendado</h2>
                <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                  <li>Crie um <strong>Projeto</strong> na seção Preparação para organizar suas atividades</li>
                  <li><strong>Importe seus dados</strong> de clientes, leads ou concorrentes</li>
                  <li>Utilize o módulo de <strong>Enriquecimento com IA</strong> para complementar informações</li>
                  <li>Explore os dados através das ferramentas de <strong>Inteligência</strong></li>
                </ol>
              </section>

              {/* Visão Geral */}
              <section id="visao-geral" className="mb-12">
                <h1 className="text-3xl font-bold mb-4">Visão Geral</h1>
                
                <h2 className="text-2xl font-semibold mt-6 mb-3">Dashboard</h2>
                <p className="text-muted-foreground mb-4">
                  O Dashboard é o centro de comando da plataforma, apresentando uma visão consolidada de suas principais 
                  métricas e atividades. A tela está dividida em três áreas principais:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li><strong>Cards de estatísticas:</strong> Totais de projetos, pesquisas, clientes, leads, concorrentes, produtos e mercados</li>
                  <li><strong>Ações rápidas:</strong> Atalhos para criar projeto, iniciar pesquisa, importar dados e processar com IA</li>
                  <li><strong>Atividades recentes:</strong> Registro das últimas operações realizadas</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-6 mb-3">Base de Dados</h2>
                <p className="text-muted-foreground mb-4">
                  A Base de Dados é o repositório central de todas as entidades cadastradas no sistema. Principais funcionalidades:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong>Filtros e Busca:</strong> Filtre por tipo (Cliente, Lead, Concorrente) e busque por nome, CNPJ ou email</li>
                  <li><strong>Visualização:</strong> Dê duplo clique em uma linha para ver todos os detalhes da entidade</li>
                  <li><strong>Exportação:</strong> Exporte dados filtrados em Excel ou CSV com formatação profissional</li>
                  <li><strong>Paginação:</strong> Navegue entre páginas com até 20 registros cada</li>
                </ul>
              </section>

              {/* Preparação */}
              <section id="preparacao" className="mb-12">
                <h1 className="text-3xl font-bold mb-4">Preparação</h1>
                
                <h2 className="text-2xl font-semibold mt-6 mb-3">Projetos</h2>
                <p className="text-muted-foreground mb-4">
                  Organize suas iniciativas de inteligência de mercado em projetos. Cada projeto pode conter múltiplas 
                  pesquisas, importações e análises relacionadas a um objetivo específico de negócio.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-3">Importar Dados</h2>
                <p className="text-muted-foreground mb-4">
                  Importe bases de dados em formato CSV ou Excel (XLS/XLSX). O sistema processa automaticamente diferentes 
                  estruturas, valida dados e identifica duplicatas. Principais recursos:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Mapeamento automático de colunas</li>
                  <li>Validação de CNPJ, email e telefone</li>
                  <li>Detecção e tratamento de duplicatas</li>
                  <li>Processamento em segundo plano</li>
                  <li>Acompanhamento via Histórico de Importações</li>
                </ul>
              </section>

              {/* Enriquecimento */}
              <section id="enriquecimento" className="mb-12">
                <h1 className="text-3xl font-bold mb-4">Enriquecimento</h1>
                
                <h2 className="text-2xl font-semibold mt-6 mb-3">Enriquecer com IA</h2>
                <p className="text-muted-foreground mb-4">
                  Utilize inteligência artificial para complementar automaticamente informações faltantes nas entidades 
                  cadastradas. O sistema consulta múltiplas fontes de dados públicos e privados para obter:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li>Porte da empresa e número de funcionários</li>
                  <li>Setor de atuação (CNAE)</li>
                  <li>Faturamento estimado</li>
                  <li>Dados de contato adicionais</li>
                  <li>Presença digital (site, redes sociais)</li>
                </ul>
                <p className="text-sm text-muted-foreground italic">
                  Nota: Operações de enriquecimento consomem créditos de IA. O sistema exibe estimativa antes de processar.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-3">Processamento Avançado</h2>
                <p className="text-muted-foreground mb-4">
                  Análise em lote e geração automatizada de insights através de modelos de machine learning:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong>Análise de Fit:</strong> Score indicando alinhamento com seu perfil de cliente ideal</li>
                  <li><strong>Segmentação Automática:</strong> Identificação de grupos naturais com características similares</li>
                  <li><strong>Predição de Conversão:</strong> Probabilidade de leads se tornarem clientes</li>
                  <li><strong>Geração de Insights:</strong> Padrões e tendências identificados automaticamente</li>
                </ul>
              </section>

              {/* Inteligência */}
              <section id="inteligencia" className="mb-12">
                <h1 className="text-3xl font-bold mb-4">Inteligência</h1>
                
                <h2 className="text-2xl font-semibold mt-6 mb-3">Explorador Multidimensional</h2>
                <p className="text-muted-foreground mb-4">
                  Análises interativas através de múltiplas dimensões simultaneamente (Cubo OLAP). Dimensões disponíveis:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li>Setor (classificação CNAE)</li>
                  <li>Porte (Micro, Pequena, Média, Grande)</li>
                  <li>Região (Estados e cidades)</li>
                  <li>Tipo de Entidade (Cliente, Lead, Concorrente)</li>
                  <li>Origem (fonte de captação)</li>
                  <li>Período (mês/ano de cadastro)</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-6 mb-3">Análise Temporal</h2>
                <p className="text-muted-foreground mb-4">
                  Identifique tendências, sazonalidades e padrões de comportamento ao longo do tempo. Recursos incluem 
                  séries temporais, detecção de sazonalidade, comparação de períodos e projeções futuras.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-3">Análise Geográfica</h2>
                <p className="text-muted-foreground mb-4">
                  Visualize distribuição espacial através de mapas interativos e heatmaps. Identifique concentrações de 
                  mercado, áreas de expansão potencial e defina territórios de vendas.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-3">Análise de Mercado</h2>
                <p className="text-muted-foreground mb-4">
                  Explore hierarquia de mercados e segmentos de atuação. Identifique oportunidades de cross-sell, up-sell 
                  e expansão para mercados adjacentes através de análise de penetração e benchmarking competitivo.
                </p>
              </section>

              {/* Administração */}
              <section id="administracao" className="mb-12">
                <h1 className="text-3xl font-bold mb-4">Administração</h1>
                
                <h2 className="text-2xl font-semibold mt-6 mb-3">Usuários</h2>
                <p className="text-muted-foreground mb-4">
                  Gerencie acesso à plataforma com perfis de permissão granulares:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li><strong>Administrador:</strong> Acesso total a todas as funcionalidades</li>
                  <li><strong>Gestor:</strong> Acesso a funcionalidades exceto administração de usuários</li>
                  <li><strong>Analista:</strong> Acesso a análises e visualizações, sem importação/enriquecimento</li>
                  <li><strong>Visualizador:</strong> Apenas leitura de dashboards e relatórios</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-6 mb-3">Gestão de IA</h2>
                <p className="text-muted-foreground mb-4">
                  Monitore consumo de créditos de IA, controle custos e defina políticas de privacidade. Dashboards 
                  específicos exibem consumo por período, tipo de operação e usuário responsável.
                </p>
              </section>

              {/* Fluxos de Trabalho */}
              <section id="fluxos" className="mb-12">
                <h1 className="text-3xl font-bold mb-4">Fluxos de Trabalho Recomendados</h1>
                
                <h2 className="text-2xl font-semibold mt-6 mb-3">Fluxo 1: Qualificação de Base de Leads</h2>
                <ol className="list-decimal pl-6 space-y-2 text-muted-foreground mb-6">
                  <li>Importe sua base de leads (CSV/Excel)</li>
                  <li>Enriqueça com IA para complementar informações</li>
                  <li>Execute scoring de fit e probabilidade de conversão</li>
                  <li>Ordene por score e exporte os top 20% para o CRM</li>
                  <li>Analise padrões nos leads de alto score</li>
                </ol>

                <h2 className="text-2xl font-semibold mt-6 mb-3">Fluxo 2: Expansão Geográfica</h2>
                <ol className="list-decimal pl-6 space-y-2 text-muted-foreground mb-6">
                  <li>Visualize distribuição atual de clientes no mapa</li>
                  <li>Identifique regiões com baixa cobertura mas alto potencial</li>
                  <li>Analise composição do mercado local</li>
                  <li>Crie projeto específico para expansão</li>
                  <li>Monitore métricas de penetração ao longo do tempo</li>
                </ol>

                <h2 className="text-2xl font-semibold mt-6 mb-3">Fluxo 3: Análise Competitiva</h2>
                <ol className="list-decimal pl-6 space-y-2 text-muted-foreground mb-6">
                  <li>Cadastre seus principais concorrentes</li>
                  <li>Enriqueça informações sobre porte e mercados de atuação</li>
                  <li>Compare sua presença em diferentes segmentos</li>
                  <li>Identifique nichos com menor concorrência</li>
                  <li>Defina estratégias diferenciadas por tipo de mercado</li>
                </ol>
              </section>

              {/* FAQ */}
              <section id="faq" className="mb-12">
                <h1 className="text-3xl font-bold mb-4">Perguntas Frequentes</h1>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Quais formatos de arquivo são suportados para importação?</h3>
                    <p className="text-muted-foreground">
                      A plataforma suporta arquivos CSV (valores separados por vírgula) e Excel nos formatos XLS e XLSX. 
                      Para arquivos CSV, recomendamos utilizar codificação UTF-8.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Como funciona o consumo de créditos de IA?</h3>
                    <p className="text-muted-foreground">
                      Enriquecimentos básicos (porte, setor) consomem 1 crédito por empresa. Enriquecimentos avançados 
                      (dados financeiros, tecnologias) consomem 3-5 créditos. O sistema sempre exibe uma estimativa antes 
                      de iniciar o processamento.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Meus dados estão seguros na plataforma?</h3>
                    <p className="text-muted-foreground">
                      Sim, a plataforma implementa múltiplas camadas de segurança incluindo criptografia TLS 1.3 em trânsito 
                      e AES-256 em repouso, autenticação de dois fatores opcional, controle de acesso baseado em perfis e 
                      backups automáticos diários.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">A plataforma está em conformidade com LGPD?</h3>
                    <p className="text-muted-foreground">
                      Sim, a plataforma foi desenvolvida com conformidade LGPD desde o design. Você tem controle total sobre 
                      quais dados são coletados, processados e compartilhados. Funcionalidades de anonimização, direito ao 
                      esquecimento e portabilidade de dados estão disponíveis.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Como obtenho suporte técnico?</h3>
                    <p className="text-muted-foreground">
                      O suporte está disponível através de chat em tempo real (canto inferior direito da plataforma), 
                      email (suporte@intelmarket.app) e telefone para clientes enterprise. Horário: segunda a sexta, 
                      das 9h às 18h (horário de Brasília).
                    </p>
                  </div>
                </div>
              </section>

              {/* Glossário */}
              <section id="glossario" className="mb-12">
                <h1 className="text-3xl font-bold mb-4">Glossário</h1>
                
                <dl className="space-y-4">
                  <div>
                    <dt className="font-semibold">CNAE (Classificação Nacional de Atividades Econômicas)</dt>
                    <dd className="text-muted-foreground ml-4">
                      Sistema oficial de classificação de atividades econômicas utilizado no Brasil para padronizar 
                      códigos de setores e atividades empresariais.
                    </dd>
                  </div>

                  <div>
                    <dt className="font-semibold">Cross-sell</dt>
                    <dd className="text-muted-foreground ml-4">
                      Estratégia de vendas que consiste em oferecer produtos ou serviços complementares aos que o 
                      cliente já adquiriu.
                    </dd>
                  </div>

                  <div>
                    <dt className="font-semibold">Cubo OLAP</dt>
                    <dd className="text-muted-foreground ml-4">
                      Estrutura de dados multidimensional que permite análises rápidas e flexíveis através de operações 
                      como drill-down, roll-up, slice e dice.
                    </dd>
                  </div>

                  <div>
                    <dt className="font-semibold">Fit Score</dt>
                    <dd className="text-muted-foreground ml-4">
                      Pontuação que indica o quanto o perfil de um lead ou cliente se alinha com o perfil de cliente 
                      ideal (ICP) da empresa.
                    </dd>
                  </div>

                  <div>
                    <dt className="font-semibold">ICP (Ideal Customer Profile)</dt>
                    <dd className="text-muted-foreground ml-4">
                      Descrição detalhada das características do cliente perfeito para uma empresa, utilizada como 
                      referência para qualificação de leads.
                    </dd>
                  </div>

                  <div>
                    <dt className="font-semibold">LGPD (Lei Geral de Proteção de Dados)</dt>
                    <dd className="text-muted-foreground ml-4">
                      Legislação brasileira que regula o tratamento de dados pessoais, estabelecendo direitos dos 
                      titulares e obrigações para empresas.
                    </dd>
                  </div>

                  <div>
                    <dt className="font-semibold">Up-sell</dt>
                    <dd className="text-muted-foreground ml-4">
                      Estratégia de vendas que consiste em oferecer versões superiores ou planos mais completos do 
                      produto ou serviço que o cliente já utiliza.
                    </dd>
                  </div>
                </dl>
              </section>

              {/* Rodapé */}
              <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                <p>Documentação atualizada em Dezembro de 2025</p>
                <p className="mt-2">
                  <strong>Contato:</strong> suporte@intelmarket.app | +55 (11) 3000-0000
                </p>
                <p className="mt-1">
                  Horário de atendimento: Segunda a sexta, 9h às 18h (horário de Brasília)
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
