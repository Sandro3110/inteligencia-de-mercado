import { useSelectedProject } from '@/hooks/useSelectedProject';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Briefcase, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        value={selectedProjectId?.toString()}
        onValueChange={(value) => selectProject(parseInt(value, 10))}
      >
        <SelectTrigger className="w-[200px] h-9">
          <SelectValue placeholder="Selecione um projeto" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => {
            const isSelected = project.id === selectedProjectId;
            return (
              <SelectItem 
                key={project.id} 
                value={project.id.toString()}
                className={cn(
                  isSelected && "bg-blue-50 font-semibold"
                )}
              >
                <div className="flex items-center gap-2 w-full">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.cor || '#3b82f6' }}
                  />
                  <span className="flex-1">{project.nome}</span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 ml-2" />
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
