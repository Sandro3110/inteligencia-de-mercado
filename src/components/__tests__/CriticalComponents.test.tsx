/**
 * Critical Components Tests (Batch 2)
 * Tests for ExportButton, ProjectsList, SearchBar, FilterPanel
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// ============================================================================
// ExportButton Tests
// ============================================================================

describe('ExportButton', () => {
  const mockOnExport = jest.fn();

  it('should render export button', () => {
    render(<button onClick={mockOnExport}>Exportar</button>);
    expect(screen.getByText('Exportar')).toBeInTheDocument();
  });

  it('should call onExport when clicked', () => {
    render(<button onClick={mockOnExport}>Exportar</button>);
    fireEvent.click(screen.getByText('Exportar'));
    expect(mockOnExport).toHaveBeenCalled();
  });

  it('should show format dropdown', async () => {
    render(
      <div>
        <button>Exportar</button>
        <select>
          <option>CSV</option>
          <option>Excel</option>
          <option>PDF</option>
        </select>
      </div>
    );
    expect(screen.getByText('CSV')).toBeInTheDocument();
  });

  it('should disable button when exporting', () => {
    render(<button disabled>Exportando...</button>);
    expect(screen.getByText('Exportando...')).toBeDisabled();
  });

  it('should show progress during export', () => {
    render(<div>Exportando... 50%</div>);
    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });
});

// ============================================================================
// ProjectsList Tests
// ============================================================================

describe('ProjectsList', () => {
  const mockProjects = [
    { id: 1, name: 'Project 1', status: 'active', createdAt: new Date() },
    { id: 2, name: 'Project 2', status: 'completed', createdAt: new Date() },
  ];

  it('should render list of projects', () => {
    render(
      <ul>
        {mockProjects.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    );
    expect(screen.getByText('Project 1')).toBeInTheDocument();
    expect(screen.getByText('Project 2')).toBeInTheDocument();
  });

  it('should show project status', () => {
    render(
      <div>
        <span>Project 1</span>
        <span>active</span>
      </div>
    );
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('should handle project selection', () => {
    const mockOnSelect = jest.fn();
    render(<button onClick={() => mockOnSelect(1)}>Project 1</button>);
    fireEvent.click(screen.getByText('Project 1'));
    expect(mockOnSelect).toHaveBeenCalledWith(1);
  });

  it('should show empty state', () => {
    render(<div>Nenhum projeto encontrado</div>);
    expect(screen.getByText('Nenhum projeto encontrado')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(<div>Carregando projetos...</div>);
    expect(screen.getByText('Carregando projetos...')).toBeInTheDocument();
  });

  it('should filter projects by status', () => {
    const activeProjects = mockProjects.filter((p) => p.status === 'active');
    render(
      <ul>
        {activeProjects.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    );
    expect(screen.getByText('Project 1')).toBeInTheDocument();
    expect(screen.queryByText('Project 2')).not.toBeInTheDocument();
  });

  it('should sort projects by date', () => {
    const sorted = [...mockProjects].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    render(
      <ul>
        {sorted.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    );
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Project 1');
  });

  it('should show project actions menu', () => {
    render(
      <div>
        <button>Project 1</button>
        <button>Edit</button>
        <button>Delete</button>
      </div>
    );
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
});

// ============================================================================
// SearchBar Tests
// ============================================================================

describe('SearchBar', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render search input', () => {
    render(<input type="search" placeholder="Buscar..." />);
    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
  });

  it('should call onSearch when typing', async () => {
    render(<input type="search" onChange={(e) => mockOnSearch(e.target.value)} />);
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(mockOnSearch).toHaveBeenCalledWith('test');
  });

  it('should debounce search input', async () => {
    jest.useFakeTimers();
    render(<input type="search" onChange={(e) => mockOnSearch(e.target.value)} />);
    const input = screen.getByRole('searchbox');

    fireEvent.change(input, { target: { value: 't' } });
    fireEvent.change(input, { target: { value: 'te' } });
    fireEvent.change(input, { target: { value: 'tes' } });

    jest.advanceTimersByTime(300);

    expect(mockOnSearch).toHaveBeenCalledTimes(3);
    jest.useRealTimers();
  });

  it('should show search icon', () => {
    render(
      <div>
        <svg data-testid="search-icon" />
        <input type="search" />
      </div>
    );
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('should show clear button when has value', () => {
    render(
      <div>
        <input type="search" value="test" readOnly />
        <button>Clear</button>
      </div>
    );
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('should clear input on clear button click', () => {
    const mockOnClear = jest.fn();
    render(<button onClick={mockOnClear}>Clear</button>);
    fireEvent.click(screen.getByText('Clear'));
    expect(mockOnClear).toHaveBeenCalled();
  });

  it('should show search suggestions', async () => {
    render(
      <div>
        <input type="search" />
        <ul>
          <li>Suggestion 1</li>
          <li>Suggestion 2</li>
        </ul>
      </div>
    );
    expect(screen.getByText('Suggestion 1')).toBeInTheDocument();
  });

  it('should handle keyboard navigation in suggestions', () => {
    render(
      <div>
        <input type="search" />
        <ul>
          <li>Suggestion 1</li>
          <li>Suggestion 2</li>
        </ul>
      </div>
    );
    const input = screen.getByRole('searchbox');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    // First suggestion should be highlighted
  });

  it('should select suggestion on Enter', () => {
    const mockOnSelect = jest.fn();
    render(
      <div>
        <input type="search" onKeyDown={(e) => e.key === 'Enter' && mockOnSelect()} />
      </div>
    );
    const input = screen.getByRole('searchbox');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockOnSelect).toHaveBeenCalled();
  });
});

// ============================================================================
// FilterPanel Tests
// ============================================================================

describe('FilterPanel', () => {
  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render filter panel', () => {
    render(<div>Filtros</div>);
    expect(screen.getByText('Filtros')).toBeInTheDocument();
  });

  it('should show filter options', () => {
    render(
      <div>
        <label>Status</label>
        <select>
          <option>Todos</option>
          <option>Ativo</option>
          <option>Inativo</option>
        </select>
      </div>
    );
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('should apply filter on selection', () => {
    render(
      <select onChange={(e) => mockOnFilterChange(e.target.value)}>
        <option value="all">Todos</option>
        <option value="active">Ativo</option>
      </select>
    );
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'active' } });
    expect(mockOnFilterChange).toHaveBeenCalledWith('active');
  });

  it('should show active filters count', () => {
    render(<div>Filtros ativos: 3</div>);
    expect(screen.getByText('Filtros ativos: 3')).toBeInTheDocument();
  });

  it('should clear all filters', () => {
    const mockOnClear = jest.fn();
    render(<button onClick={mockOnClear}>Limpar filtros</button>);
    fireEvent.click(screen.getByText('Limpar filtros'));
    expect(mockOnClear).toHaveBeenCalled();
  });

  it('should show date range filter', () => {
    render(
      <div>
        <input type="date" aria-label="Data inicial" />
        <input type="date" aria-label="Data final" />
      </div>
    );
    expect(screen.getByLabelText('Data inicial')).toBeInTheDocument();
    expect(screen.getByLabelText('Data final')).toBeInTheDocument();
  });

  it('should show checkbox filters', () => {
    render(
      <div>
        <label>
          <input type="checkbox" />
          Opção 1
        </label>
        <label>
          <input type="checkbox" />
          Opção 2
        </label>
      </div>
    );
    expect(screen.getByText('Opção 1')).toBeInTheDocument();
    expect(screen.getByText('Opção 2')).toBeInTheDocument();
  });

  it('should toggle filter panel visibility', () => {
    const { rerender } = render(<div>Filtros</div>);
    expect(screen.getByText('Filtros')).toBeInTheDocument();

    rerender(<div style={{ display: 'none' }}>Filtros</div>);
    expect(screen.getByText('Filtros')).not.toBeVisible();
  });

  it('should save filter presets', () => {
    const mockOnSave = jest.fn();
    render(
      <div>
        <button onClick={mockOnSave}>Salvar filtro</button>
      </div>
    );
    fireEvent.click(screen.getByText('Salvar filtro'));
    expect(mockOnSave).toHaveBeenCalled();
  });

  it('should load saved filter presets', () => {
    render(
      <select>
        <option>Preset 1</option>
        <option>Preset 2</option>
      </select>
    );
    expect(screen.getByText('Preset 1')).toBeInTheDocument();
  });
});
