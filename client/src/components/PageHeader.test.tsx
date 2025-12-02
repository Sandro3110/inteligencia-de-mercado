import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PageHeader } from './PageHeader';
import { Home } from 'lucide-react';

describe('PageHeader', () => {
  it('deve renderizar título e descrição', () => {
    render(
      <PageHeader
        title="Dashboard"
        description="Visão geral do sistema"
        icon={Home}
      />
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Visão geral do sistema')).toBeInTheDocument();
  });

  it('deve renderizar breadcrumbs', () => {
    render(
      <PageHeader
        title="Projetos"
        description="Lista de projetos"
        icon={Home}
        breadcrumbs={[
          { label: 'Dashboard' },
          { label: 'Projetos' }
        ]}
      />
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    // Projetos aparece tanto no breadcrumb quanto no título
    const projetosElements = screen.getAllByText('Projetos');
    expect(projetosElements.length).toBeGreaterThan(0);
  });

  it('deve renderizar actions quando fornecido', () => {
    render(
      <PageHeader
        title="Test"
        description="Test description"
        icon={Home}
        actions={<button>Novo</button>}
      />
    );

    expect(screen.getByText('Novo')).toBeInTheDocument();
  });

  it('deve renderizar sem breadcrumbs', () => {
    const { container } = render(
      <PageHeader
        title="Simple"
        description="No breadcrumbs"
        icon={Home}
      />
    );

    const breadcrumb = container.querySelector('nav');
    expect(breadcrumb).not.toBeInTheDocument();
  });
});
