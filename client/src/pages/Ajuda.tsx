import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  BookOpen,
  Keyboard,
  Video,
  HelpCircle,
  Lightbulb,
  ExternalLink,
  Search,
  Zap,
  BarChart3,
  Download,
  Settings,
  MapPin,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Ajuda() {
  const [searchQuery, setSearchQuery] = useState("");

  const shortcuts = [
    {
      category: "Navegação Rápida (Gmail-style)",
      icon: Zap,
      items: [
        {
          keys: ["G", "H"],
          description: "Ir para Home",
          color: "bg-blue-100 text-blue-700",
        },
        {
          keys: ["G", "P"],
          description: "Ir para Projetos",
          color: "bg-purple-100 text-purple-700",
        },
        {
          keys: ["G", "M"],
          description: "Ir para Mercados",
          color: "bg-green-100 text-green-700",
        },
        {
          keys: ["G", "A"],
          description: "Ir para Analytics",
          color: "bg-orange-100 text-orange-700",
        },
        {
          keys: ["G", "E"],
          description: "Ir para Enriquecimento",
          color: "bg-pink-100 text-pink-700",
        },
        {
          keys: ["G", "R"],
          description: "Ir para Relatórios",
          color: "bg-indigo-100 text-indigo-700",
        },
        {
          keys: ["G", "N"],
          description: "Ir para Notificações",
          color: "bg-yellow-100 text-yellow-700",
        },
        {
          keys: ["G", "S"],
          description: "Ir para Configurações",
          color: "bg-gray-100 text-gray-700",
        },
      ],
    },
    {
      category: "Navegação Numérica",
      icon: Keyboard,
      items: [
        {
          keys: ["Ctrl", "1"],
          description: "Dashboard",
          color: "bg-blue-100 text-blue-700",
        },
        {
          keys: ["Ctrl", "2"],
          description: "Mercados",
          color: "bg-green-100 text-green-700",
        },
        {
          keys: ["Ctrl", "3"],
          description: "Analytics",
          color: "bg-orange-100 text-orange-700",
        },
        {
          keys: ["Ctrl", "4"],
          description: "ROI",
          color: "bg-purple-100 text-purple-700",
        },
      ],
    },
    {
      category: "Ações",
      icon: Zap,
      items: [
        {
          keys: ["Ctrl", "K"],
          description: "Busca global",
          color: "bg-blue-100 text-blue-700",
        },
        {
          keys: ["Ctrl", "N"],
          description: "Novo projeto de enriquecimento",
          color: "bg-green-100 text-green-700",
        },
        {
          keys: ["Ctrl", "B"],
          description: "Toggle sidebar",
          color: "bg-gray-100 text-gray-700",
        },
      ],
    },
    {
      category: "Ajuda",
      icon: HelpCircle,
      items: [
        {
          keys: ["Ctrl", "/"],
          description: "Mostrar atalhos",
          color: "bg-yellow-100 text-yellow-700",
        },
        {
          keys: ["?"],
          description: "Mostrar atalhos",
          color: "bg-yellow-100 text-yellow-700",
        },
        {
          keys: ["Esc"],
          description: "Fechar modal/dialog",
          color: "bg-red-100 text-red-700",
        },
      ],
    },
  ];

  const faq = [
    {
      question: "Como criar um novo projeto?",
      answer:
        "Navegue até a seção 'Gerenciar Projetos' no menu lateral ou pressione G+P. Clique no botão 'Novo Projeto' e preencha as informações básicas como nome, descrição e cor. Você pode criar projetos vazios ou usar templates pré-configurados.",
    },
    {
      question: "Como iniciar uma nova pesquisa de mercado?",
      answer:
        "Acesse 'Nova Pesquisa' no menu Core ou pressione Ctrl+N. O wizard irá guiá-lo através de 4 etapas: seleção de projeto, configuração de parâmetros, escolha do método de entrada de dados e inserção dos dados. Você pode salvar rascunhos a qualquer momento.",
    },
    {
      question: "O que é enriquecimento de dados?",
      answer:
        "Enriquecimento é o processo de complementar dados básicos de empresas (nome, CNPJ) com informações adicionais como telefone, email, endereço, porte, faturamento, etc. O sistema usa APIs externas (ReceitaWS, Google) e IA (OpenAI, Gemini) para buscar e validar essas informações automaticamente.",
    },
    {
      question: "Como exportar dados filtrados?",
      answer:
        "Na página de Visão Geral (CascadeView), aplique os filtros desejados (tags, qualidade, status) e clique no botão 'Exportar'. Escolha o formato (CSV, Excel, PDF) e os dados serão exportados respeitando os filtros ativos. Você também pode exportar apenas itens selecionados usando checkboxes.",
    },
    {
      question: "Como funciona o sistema de hibernação de projetos?",
      answer:
        "Projetos inativos por mais de 60 dias são automaticamente marcados para hibernação. Você receberá um aviso 7 dias antes, podendo adiar a hibernação por 7, 15 ou 30 dias. Projetos hibernados ficam em modo somente leitura, mas podem ser reativados a qualquer momento.",
    },
    {
      question: "O que são alertas inteligentes?",
      answer:
        "Alertas inteligentes monitoram automaticamente seus dados e notificam quando condições específicas são atendidas, como: taxa de erro acima de 10%, leads de alta qualidade identificados, ou mercados atingindo limites configurados. Configure alertas em 'Configurações > Alertas Inteligentes'.",
    },
    {
      question: "Como usar o Cockpit Geográfico?",
      answer:
        "O GeoCockpit permite visualizar seus dados em mapas interativos. Empresas são geocodificadas automaticamente e exibidas com marcadores coloridos por qualidade. Use filtros para segmentar por região, porte ou categoria. Clique em marcadores para ver detalhes e ações rápidas.",
    },
    {
      question: "Como agendar enriquecimentos automáticos?",
      answer:
        "Acesse 'Configurações > Agendamentos' e crie uma nova tarefa agendada. Defina a frequência (diária, semanal, mensal), horário e parâmetros de enriquecimento. O sistema executará automaticamente nos horários configurados e enviará notificações com os resultados.",
    },
    {
      question: "Como comparar mercados?",
      answer:
        "Na Visão Geral, selecione até 3 mercados usando checkboxes e clique em 'Comparar Selecionados'. Um modal exibirá gráficos comparativos, métricas lado a lado e uma tabela detalhada. Você pode aplicar filtros de período e qualidade para refinar a comparação.",
    },
    {
      question: "Como funciona o sistema de tags?",
      answer:
        "Tags permitem organizar e categorizar seus dados. Você pode criar tags personalizadas e aplicá-las a mercados, clientes, concorrentes e leads. Use o filtro de tags na barra superior para visualizar apenas itens com tags específicas. Tags são compartilhadas entre todos os usuários do projeto.",
    },
  ];

  const tutorials = [
    {
      title: "Introdução ao Gestor PAV",
      description: "Visão geral das funcionalidades principais do sistema",
      duration: "5 min",
      thumbnail: "/help-intro.png",
      url: "#",
      badge: "Iniciante",
    },
    {
      title: "Criando seu primeiro projeto",
      description: "Passo a passo para criar e configurar um novo projeto",
      duration: "8 min",
      thumbnail: "/help-projeto.png",
      url: "#",
      badge: "Iniciante",
    },
    {
      title: "Enriquecimento de dados avançado",
      description: "Como configurar e otimizar o processo de enriquecimento",
      duration: "12 min",
      thumbnail: "/help-enriquecimento.png",
      url: "#",
      badge: "Intermediário",
    },
    {
      title: "Analytics e ROI",
      description:
        "Análise de métricas e cálculo de retorno sobre investimento",
      duration: "10 min",
      thumbnail: "/help-analytics.png",
      url: "#",
      badge: "Intermediário",
    },
    {
      title: "Cockpit Geográfico",
      description: "Visualização e análise territorial de dados",
      duration: "7 min",
      thumbnail: "/help-geo.png",
      url: "#",
      badge: "Avançado",
    },
    {
      title: "Automação com alertas inteligentes",
      description: "Configurando alertas e notificações automáticas",
      duration: "9 min",
      thumbnail: "/help-alertas.png",
      url: "#",
      badge: "Avançado",
    },
  ];

  const tips = [
    {
      icon: Keyboard,
      title: "Use atalhos de teclado",
      description:
        "Pressione ? ou Ctrl+/ a qualquer momento para ver todos os atalhos disponíveis. Atalhos estilo Gmail (G+H, G+P) aceleram muito a navegação.",
    },
    {
      icon: Search,
      title: "Busca global poderosa",
      description:
        "Pressione Ctrl+K para abrir a busca global. Você pode buscar por mercados, clientes, concorrentes, leads e até navegar diretamente para páginas.",
    },
    {
      icon: Download,
      title: "Exporte com filtros ativos",
      description:
        "Ao exportar dados, todos os filtros aplicados (tags, qualidade, status) são respeitados. Use isso para criar relatórios segmentados rapidamente.",
    },
    {
      icon: BarChart3,
      title: "Acompanhe tendências",
      description:
        "A página de Tendências mostra a evolução da qualidade dos seus dados ao longo do tempo. Use para identificar mercados que precisam de atenção.",
    },
    {
      icon: MapPin,
      title: "Geocodificação automática",
      description:
        "Empresas são automaticamente geocodificadas ao serem enriquecidas. Isso permite análises territoriais e visualização em mapas.",
    },
    {
      icon: Settings,
      title: "Configure alertas personalizados",
      description:
        "Crie alertas para ser notificado quando condições específicas forem atendidas, como identificação de leads de alta qualidade.",
    },
  ];

  const filteredFaq = faq.filter(
    item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">
              Central de Ajuda
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Encontre respostas, aprenda com tutoriais e domine o Gestor PAV
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="faq" className="flex items-center gap-2 py-3">
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">FAQ</span>
            </TabsTrigger>
            <TabsTrigger
              value="shortcuts"
              className="flex items-center gap-2 py-3"
            >
              <Keyboard className="w-4 h-4" />
              <span className="hidden sm:inline">Atalhos</span>
            </TabsTrigger>
            <TabsTrigger
              value="tutorials"
              className="flex items-center gap-2 py-3"
            >
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Tutoriais</span>
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex items-center gap-2 py-3">
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">Dicas</span>
            </TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Perguntas Frequentes
                </CardTitle>
                <CardDescription>
                  Respostas para as dúvidas mais comuns sobre o Gestor PAV
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Buscar nas perguntas frequentes..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Accordion type="single" collapsible className="w-full">
                  {filteredFaq.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        <span className="font-medium text-slate-900">
                          {item.question}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-slate-600 leading-relaxed">
                          {item.answer}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {filteredFaq.length === 0 && (
                  <div className="text-center py-12">
                    <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">
                      Nenhuma pergunta encontrada para "{searchQuery}"
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shortcuts Tab */}
          <TabsContent value="shortcuts" className="space-y-6">
            {shortcuts.map((section, sectionIndex) => {
              const Icon = section.icon;
              return (
                <Card key={sectionIndex}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      {section.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {section.items.map((shortcut, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-4 rounded-lg border ${shortcut.color}`}
                        >
                          <span className="font-medium">
                            {shortcut.description}
                          </span>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, i) => (
                              <span key={i} className="flex items-center gap-1">
                                {i > 0 && <span className="text-xs">→</span>}
                                <Kbd className="bg-white">{key}</Kbd>
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium text-blue-900 mb-1">Dica Pro</p>
                    <p className="text-sm text-blue-700">
                      Os atalhos estilo Gmail (G+H, G+P, etc) são sequenciais:
                      pressione G, solte, e então pressione a segunda tecla.
                      Você tem 1 segundo para completar a sequência.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tutorials Tab */}
          <TabsContent value="tutorials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Vídeos Tutoriais
                </CardTitle>
                <CardDescription>
                  Aprenda visualmente com nossos tutoriais em vídeo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tutorials.map((tutorial, index) => (
                    <div key={index} className="group cursor-pointer">
                      <div className="relative overflow-hidden rounded-lg mb-3">
                        <img
                          src={tutorial.thumbnail}
                          alt={tutorial.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                            <Video className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                        <Badge className="absolute top-2 right-2">
                          {tutorial.badge}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {tutorial.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-2">
                        {tutorial.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{tutorial.duration}</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tips Tab */}
          <TabsContent value="tips" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Dicas e Truques
                </CardTitle>
                <CardDescription>
                  Aproveite ao máximo o Gestor PAV com essas dicas práticas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tips.map((tip, index) => {
                    const Icon = tip.icon;
                    return (
                      <div
                        key={index}
                        className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                            <Icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 mb-1">
                              {tip.title}
                            </h3>
                            <p className="text-sm text-slate-600">
                              {tip.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Precisa de mais ajuda?
                    </h3>
                    <p className="text-blue-100 mb-4">
                      Entre em contato com nosso suporte ou consulte a
                      documentação completa
                    </p>
                    <div className="flex gap-3">
                      <Button variant="secondary" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Documentação
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        Contatar Suporte
                      </Button>
                    </div>
                  </div>
                  <HelpCircle className="w-24 h-24 text-white/20 hidden lg:block" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
