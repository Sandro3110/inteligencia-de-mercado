import { useSelectedProject } from '@/hooks/useSelectedProject';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Briefcase, Loader2 } from 'lucide-react';

export function ProjectSelector() {
  const { selectedProjectId, selectedProject, projects, selectProject, isLoading } =
    useSelectedProject();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Carregando projetos...</span>
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
        value={selectedProjectId?.toString()}
        onValueChange={(value) => selectProject(parseInt(value, 10))}
      >
        <SelectTrigger className="w-[200px] h-9">
          <SelectValue placeholder="Selecione um projeto" />
        </SelectTrigger>
        <SelectContent>
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
