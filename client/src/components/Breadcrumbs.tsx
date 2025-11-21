import { ChevronRight, Home, FolderOpen, Search } from 'lucide-react';
import { Link } from 'wouter';
import { useSelectedProject } from '@/hooks/useSelectedProject';
import { useSelectedPesquisa } from '@/hooks/useSelectedPesquisa';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  currentPage?: string;
  showContext?: boolean; // Se true, mostra Projeto > Pesquisa automaticamente
}

export function Breadcrumbs({ items, currentPage, showContext = false }: BreadcrumbsProps) {
  const { selectedProject } = useSelectedProject();
  const { selectedPesquisa } = useSelectedPesquisa();

  // Se items for fornecido, use o comportamento antigo (compatibilidade)
  if (items) {
    return (
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={items[0]?.onClick}
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>{items[0]?.label || "Início"}</span>
        </button>

        {items.slice(1).map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4" />
            {item.onClick ? (
              <button
                onClick={item.onClick}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </div>
        ))}
      </nav>
    );
  }

  // Breadcrumbs automáticos com contexto
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: 'Início',
      href: '/',
      icon: <Home className="w-4 h-4" />,
    },
  ];

  // Adicionar projeto se selecionado e showContext ativo
  if (showContext && selectedProject) {
    breadcrumbItems.push({
      label: selectedProject.nome,
      href: '/projetos',
      icon: <FolderOpen className="w-4 h-4" />,
    });
  }

  // Adicionar pesquisa se selecionada e showContext ativo
  if (showContext && selectedPesquisa) {
    breadcrumbItems.push({
      label: selectedPesquisa.nome,
      icon: <Search className="w-4 h-4" />,
    });
  }

  // Adicionar página atual se fornecida
  if (currentPage) {
    breadcrumbItems.push({
      label: currentPage,
      isActive: true,
    });
  }

  return (
    <nav className="flex items-center gap-2 text-sm text-slate-600 mb-4 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="w-4 h-4 text-slate-400" />}
          {item.href && !item.isActive ? (
            <Link href={item.href}>
              <a className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer">
                {item.icon}
                <span>{item.label}</span>
              </a>
            </Link>
          ) : (
            <span className={cn(
              "flex items-center gap-1.5",
              item.isActive && "font-semibold text-blue-600"
            )}>
              {item.icon}
              <span>{item.label}</span>
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
