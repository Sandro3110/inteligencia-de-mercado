import { useSelectedProject } from '@/hooks/useSelectedProject';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Briefcase } from 'lucide-react';

export function ProjectSelector() {
  const { selectedProjectId, selectedProject, projects, selectProject, isLoading } =
    useSelectedProject();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <Briefcase className="h-4 w-4" />
        <span>Carregando...</span>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <Briefcase className="h-4 w-4" />
        <span>Nenhum projeto</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Briefcase className="h-4 w-4 text-muted-foreground" />
      <Select
        value={selectedProjectId?.toString() || "all"}
        onValueChange={(value) => {
          if (value === "all") {
            selectProject(null);
          } else {
            selectProject(parseInt(value, 10));
          }
        }}
      >
        <SelectTrigger className="w-[200px] h-9">
          <SelectValue placeholder="Selecione um projeto" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
              <span className="font-medium">Todos os Projetos</span>
            </div>
          </SelectItem>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id.toString()}>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: project.cor || '#3b82f6' }}
                />
                <span>{project.nome}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
