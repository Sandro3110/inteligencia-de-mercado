/**
 * Aba de Projetos - Gestão de Projetos
 * Gerenciamento completo de projetos (criar, editar, hibernar, deletar, duplicar)
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  FolderPlus, 
  Edit, 
  Trash2, 
  Moon, 
  Sun, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  Folder,
  Filter,
  Copy,
  History
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type FilterStatus = 'all' | 'active' | 'hibernated';

interface ProjectsTabProps {
  onShowHistory?: (projectId: number) => void;
}

export function ProjectsTab({ onShowHistory }: ProjectsTabProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showHibernateDialog, setShowHibernateDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  
  // Form states
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectColor, setProjectColor] = useState('#3b82f6');
  const [duplicateName, setDuplicateName] = useState('');
  const [copyMarkets, setCopyMarkets] = useState(false);

  const { data: projects, isLoading, refetch } = trpc.projects.list.useQuery();

  const createMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      toast.success('Projeto criado com sucesso!');
      refetch();
      setShowCreateDialog(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao criar projeto: ${error.message}`);
    }
  });

  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      toast.success('Projeto atualizado com sucesso!');
      refetch();
      setShowEditDialog(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar projeto: ${error.message}`);
    }
  });

  const deleteMutation = trpc.projects.deleteEmpty.useMutation({
    onSuccess: () => {
      toast.success('Projeto deletado com sucesso!');
      refetch();
      setShowDeleteDialog(false);
      setSelectedProject(null);
    },
    onError: (error) => {
      toast.error(`Erro ao deletar projeto: ${error.message}`);
    }
  });

  const hibernateMutation = trpc.projects.hibernate.useMutation({
    onSuccess: () => {
      toast.success('Projeto adormecido com sucesso!');
      refetch();
      setShowHibernateDialog(false);
      setSelectedProject(null);
    },
    onError: (error) => {
      toast.error(`Erro ao adormecer projeto: ${error.message}`);
    }
  });

  const reactivateMutation = trpc.projects.reactivate.useMutation({
    onSuccess: () => {
      toast.success('Projeto reativado com sucesso!');
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao reativar projeto: ${error.message}`);
    }
  });

  const duplicateMutation = trpc.projects.duplicate.useMutation({
    onSuccess: () => {
      toast.success('Projeto duplicado com sucesso!');
      refetch();
      setShowDuplicateDialog(false);
      setDuplicateName('');
      setCopyMarkets(false);
      setSelectedProject(null);
    },
    onError: (error) => {
      toast.error(`Erro ao duplicar projeto: ${error.message}`);
    }
  });

  const resetForm = () => {
    setProjectName('');
    setProjectDesc('');
    setProjectColor('#3b82f6');
    setSelectedProject(null);
  };

  const handleCreate = () => {
    if (!projectName.trim()) {
      toast.error('Nome do projeto é obrigatório');
      return;
    }
    createMutation.mutate({
      nome: projectName,
      descricao: projectDesc || undefined,
      cor: projectColor
    });
  };

  const handleUpdate = () => {
    if (!selectedProject || !projectName.trim()) {
      toast.error('Nome do projeto é obrigatório');
      return;
    }
    updateMutation.mutate({
      id: selectedProject.id,
      nome: projectName,
      descricao: projectDesc || undefined,
      cor: projectColor
    });
  };

  const handleDelete = () => {
    if (!selectedProject) return;
    deleteMutation.mutate(selectedProject.id);
  };

  const handleHibernate = () => {
    if (!selectedProject) return;
    hibernateMutation.mutate(selectedProject.id);
  };

  const handleReactivate = (projectId: number) => {
    reactivateMutation.mutate(projectId);
  };

  const handleDuplicate = () => {
    if (!selectedProject || !duplicateName.trim()) {
      toast.error('Nome do novo projeto é obrigatório');
      return;
    }
    duplicateMutation.mutate({
      projectId: selectedProject.id,
      newName: duplicateName,
      copyMarkets
    });
  };

  const openEditDialog = (project: any) => {
    setSelectedProject(project);
    setProjectName(project.nome);
    setProjectDesc(project.descricao || '');
    setProjectColor(project.cor || '#3b82f6');
    setShowEditDialog(true);
  };

  const openDuplicateDialog = (project: any) => {
    setSelectedProject(project);
    setDuplicateName(`Cópia de ${project.nome}`);
    setCopyMarkets(false);
    setShowDuplicateDialog(true);
  };

  const filteredProjects = projects?.filter(p => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  }) || [];

  const stats = {
    total: projects?.length || 0,
    active: projects?.filter(p => p.status === 'active').length || 0,
    hibernated: projects?.filter(p => p.status === 'hibernated').length || 0
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Hibernados</CardTitle>
            <Moon className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.hibernated}</div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos ({stats.total})</SelectItem>
              <SelectItem value="active">Ativos ({stats.active})</SelectItem>
              <SelectItem value="hibernated">Hibernados ({stats.hibernated})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setShowCreateDialog(true)}>
          <FolderPlus className="h-4 w-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      {/* Lista de Projetos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.cor || '#3b82f6' }}
                  />
                  <CardTitle className="text-lg">{project.nome}</CardTitle>
                </div>
                {project.status === 'hibernated' ? (
                  <Badge variant="secondary" className="gap-1">
                    <Moon className="h-3 w-3" />
                    Hibernado
                  </Badge>
                ) : (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Ativo
                  </Badge>
                )}
              </div>
              {project.descricao && (
                <CardDescription className="line-clamp-2">
                  {project.descricao}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {project.lastActivityAt && (
                <p className="text-xs text-muted-foreground">
                  Última atividade: {formatDistanceToNow(new Date(project.lastActivityAt), {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {project.status === 'active' ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(project)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDuplicateDialog(project)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Duplicar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedProject(project);
                        setShowHibernateDialog(true);
                      }}
                    >
                      <Moon className="h-3 w-3 mr-1" />
                      Hibernar
                    </Button>
                    {onShowHistory && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onShowHistory(project.id)}
                      >
                        <History className="h-3 w-3 mr-1" />
                        Histórico
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleReactivate(project.id)}
                    disabled={reactivateMutation.isPending}
                  >
                    <Sun className="h-3 w-3 mr-1" />
                    Reativar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredProjects.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {filterStatus === 'all'
                  ? 'Nenhum projeto encontrado. Crie seu primeiro projeto!'
                  : `Nenhum projeto ${filterStatus === 'active' ? 'ativo' : 'hibernado'} encontrado.`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog: Criar Projeto */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Projeto</DialogTitle>
            <DialogDescription>
              Preencha as informações do novo projeto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Projeto *</Label>
              <Input
                id="name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Ex: Projeto Embalagens 2025"
              />
            </div>
            <div>
              <Label htmlFor="desc">Descrição</Label>
              <Textarea
                id="desc"
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                placeholder="Descrição opcional do projeto"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="color">Cor</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color"
                  type="color"
                  value={projectColor}
                  onChange={(e) => setProjectColor(e.target.value)}
                  className="w-20 h-10"
                />
                <span className="text-sm text-muted-foreground">{projectColor}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Projeto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Projeto */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Projeto</DialogTitle>
            <DialogDescription>
              Atualize as informações do projeto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome do Projeto *</Label>
              <Input
                id="edit-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-desc">Descrição</Label>
              <Textarea
                id="edit-desc"
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-color">Cor</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="edit-color"
                  type="color"
                  value={projectColor}
                  onChange={(e) => setProjectColor(e.target.value)}
                  className="w-20 h-10"
                />
                <span className="text-sm text-muted-foreground">{projectColor}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Duplicar Projeto */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicar Projeto</DialogTitle>
            <DialogDescription>
              Crie uma cópia do projeto "{selectedProject?.nome}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dup-name">Nome do Novo Projeto *</Label>
              <Input
                id="dup-name"
                value={duplicateName}
                onChange={(e) => setDuplicateName(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="copy-markets"
                checked={copyMarkets}
                onCheckedChange={(checked) => setCopyMarkets(checked as boolean)}
              />
              <Label htmlFor="copy-markets" className="cursor-pointer">
                Copiar mercados únicos relacionados
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDuplicateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleDuplicate} disabled={duplicateMutation.isPending}>
              {duplicateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Duplicar Projeto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog: Hibernar Projeto */}
      <AlertDialog open={showHibernateDialog} onOpenChange={setShowHibernateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hibernar Projeto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja hibernar o projeto "{selectedProject?.nome}"?
              <br /><br />
              O projeto ficará em modo somente leitura e não poderá ser editado até ser reativado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleHibernate}>
              Hibernar Projeto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog: Deletar Projeto */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Projeto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o projeto "{selectedProject?.nome}"?
              <br /><br />
              Esta ação não pode ser desfeita. Apenas projetos vazios podem ser deletados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Deletar Projeto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
