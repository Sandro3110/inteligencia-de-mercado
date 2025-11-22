import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Plus,
  MoreVertical,
  Eye,
  Copy,
  Trash2,
  FileText,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

type SortField = "nome" | "dataImportacao" | "status";
type SortOrder = "asc" | "desc";

const statusConfig = {
  importado: {
    label: "Importado",
    icon: FileText,
    color: "bg-blue-500/10 text-blue-700 border-blue-200",
  },
  enriquecendo: {
    label: "Enriquecendo",
    icon: Clock,
    color: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
  },
  em_andamento: {
    label: "Em Andamento",
    icon: AlertCircle,
    color: "bg-orange-500/10 text-orange-700 border-orange-200",
  },
  concluido: {
    label: "Concluído",
    icon: CheckCircle2,
    color: "bg-green-500/10 text-green-700 border-green-200",
  },
  erro: {
    label: "Erro",
    icon: XCircle,
    color: "bg-red-500/10 text-red-700 border-red-200",
  },
};

export default function SurveysList() {
  const [, navigate] = useLocation();
  
  // Pegar projectId da URL se existir
  const urlParams = new URLSearchParams(window.location.search);
  const projectIdFromUrl = urlParams.get('projectId');
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>(projectIdFromUrl || "all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("dataImportacao");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<number | null>(null);

  // Queries
  const { data: projects, isLoading: projectsLoading } = trpc.projects.list.useQuery();
  const { data: surveys, isLoading: surveysLoading } = trpc.pesquisas.list.useQuery();

  // Mutations
  const utils = trpc.useUtils();
  const deleteSurvey = trpc.pesquisas.delete.useMutation({
    onSuccess: () => {
      toast.success("Pesquisa deletada com sucesso!");
      utils.pesquisas.list.invalidate();
      setDeleteDialogOpen(false);
      setSurveyToDelete(null);
    },
    onError: (error) => {
      toast.error(`Erro ao deletar pesquisa: ${error.message}`);
    },
  });

  // Filtrar e ordenar pesquisas
  const filteredSurveys = useMemo(() => {
    if (!surveys) return [];

    let filtered = surveys.filter((survey) => {
      const matchesSearch =
        searchTerm === "" ||
        survey.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        survey.descricao?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProject =
        selectedProject === "all" ||
        survey.projectId.toString() === selectedProject;

      const matchesStatus =
        selectedStatus === "all" || survey.status === selectedStatus;

      return matchesSearch && matchesProject && matchesStatus;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === "dataImportacao") {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [surveys, searchTerm, selectedProject, selectedStatus, sortField, sortOrder]);

  const handleDelete = (id: number) => {
    setSurveyToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (surveyToDelete) {
      deleteSurvey.mutate(surveyToDelete);
    }
  };

  const handleDuplicate = async (id: number) => {
    toast.info("Funcionalidade de duplicação em desenvolvimento");
  };

  const handleView = (id: number) => {
    navigate(`/pesquisa/${id}`);
  };

  const getProjectName = (projectId: number) => {
    const project = projects?.find((p) => p.id === projectId);
    return project?.nome || `Projeto #${projectId}`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pesquisas</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todas as pesquisas de mercado do sistema
            </p>
          </div>
          <Button onClick={() => navigate("/nova-pesquisa")}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Pesquisa
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar pesquisas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Filtro por Projeto */}
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os projetos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os projetos</SelectItem>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtro por Status */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {Object.entries(statusConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Ordenação */}
              <Select
                value={`${sortField}-${sortOrder}`}
                onValueChange={(value) => {
                  const [field, order] = value.split("-") as [SortField, SortOrder];
                  setSortField(field);
                  setSortOrder(order);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nome-asc">Nome (A-Z)</SelectItem>
                  <SelectItem value="nome-desc">Nome (Z-A)</SelectItem>
                  <SelectItem value="dataImportacao-desc">Mais recentes</SelectItem>
                  <SelectItem value="dataImportacao-asc">Mais antigas</SelectItem>
                  <SelectItem value="status-asc">Status (A-Z)</SelectItem>
                  <SelectItem value="status-desc">Status (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Contador de resultados */}
            <div className="mt-4 text-sm text-muted-foreground">
              {surveysLoading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                <>
                  Mostrando <strong>{filteredSurveys.length}</strong> de{" "}
                  <strong>{surveys?.length || 0}</strong> pesquisas
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Pesquisas */}
        {surveysLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredSurveys.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma pesquisa encontrada</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || selectedProject !== "all" || selectedStatus !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Comece criando sua primeira pesquisa"}
              </p>
              {!searchTerm && selectedProject === "all" && selectedStatus === "all" && (
                <Button onClick={() => navigate("/nova-pesquisa")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeira Pesquisa
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSurveys.map((survey) => {
              const StatusIcon = statusConfig[survey.status as keyof typeof statusConfig].icon;
              const statusColor = statusConfig[survey.status as keyof typeof statusConfig].color;

              return (
                <Card key={survey.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="truncate">{survey.nome}</CardTitle>
                        <CardDescription className="mt-1">
                          {getProjectName(survey.projectId)}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(survey.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(survey.id)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(survey.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Deletar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Descrição */}
                    {survey.descricao && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {survey.descricao}
                      </p>
                    )}

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={statusColor}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusConfig[survey.status as keyof typeof statusConfig].label}
                      </Badge>
                    </div>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {survey.clientesEnriquecidos}/{survey.totalClientes} clientes
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {formatDate(survey.dataImportacao)}
                        </span>
                      </div>
                    </div>

                    {/* Botão de visualização */}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleView(survey.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalhes
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta pesquisa? Esta ação não pode ser desfeita e
              todos os dados relacionados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteSurvey.isPending}
            >
              {deleteSurvey.isPending ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
