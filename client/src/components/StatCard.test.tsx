import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatCard } from './StatCard';
import { TrendingUp } from 'lucide-react';

describe('StatCard', () => {
  it('deve renderizar título e valor', () => {
    render(
      <StatCard
        title="Total de Projetos"
        value={42}
        icon={TrendingUp}
      />
    );

    expect(screen.getByText('Total de Projetos')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('deve renderizar trend up com badge', () => {
    render(
      <StatCard
        title="Vendas"
        value={100}
        icon={TrendingUp}
        trend="up"
        change={15}
      />
    );

    expect(screen.getByText('+15%')).toBeInTheDocument();
  });

  it('deve renderizar trend down com badge', () => {
    render(
      <StatCard
        title="Custos"
        value={50}
        icon={TrendingUp}
        trend="down"
        change={-10}
      />
    );

    expect(screen.getByText('-10%')).toBeInTheDocument();
  });

  it('deve renderizar sem trend quando não fornecido', () => {
    render(
      <StatCard
        title="Total"
        value={25}
        icon={TrendingUp}
      />
    );

    expect(screen.queryByText('%')).not.toBeInTheDocument();
  });

  it('deve aceitar valores string', () => {
    render(
      <StatCard
        title="Status"
        value="Ativo"
        icon={TrendingUp}
      />
    );

    expect(screen.getByText('Ativo')).toBeInTheDocument();
  });

  it('deve renderizar com diferentes cores', () => {
    const { rerender } = render(
      <StatCard
        title="Test"
        value={99}
        icon={TrendingUp}
        color="warning"
      />
    );

    expect(screen.getByText('Test')).toBeInTheDocument();

    rerender(
      <StatCard
        title="Test2"
        value={88}
        icon={TrendingUp}
        color="success"
      />
    );

    expect(screen.getByText('Test2')).toBeInTheDocument();
  });
});
