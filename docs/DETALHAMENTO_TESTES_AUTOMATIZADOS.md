# 🧪 DETALHAMENTO COMPLETO: TESTES AUTOMATIZADOS

**Duração:** 5-6 dias (40-48 horas)  
**Complexidade:** Alta  
**Prioridade:** 🟡 Média  
**Investimento:** $0 (ferramentas gratuitas)

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Dia 1: Configuração](#dia-1-configuração)
3. [Dias 2-3: Testes Unitários Backend](#dias-2-3-testes-unitários-backend)
4. [Dia 4: Testes de Componentes Frontend](#dia-4-testes-de-componentes-frontend)
5. [Dia 5: Testes de Integração](#dia-5-testes-de-integração)
6. [Dia 6: Testes E2E](#dia-6-testes-e2e)
7. [Benefícios Detalhados](#benefícios-detalhados)
8. [Casos de Uso](#casos-de-uso)
9. [Métricas de Sucesso](#métricas-de-sucesso)

---

## 🎯 VISÃO GERAL

### **O Que Será Feito**

Implementar suite completa de testes automatizados:
1. **Testes Unitários** - Funções individuais
2. **Testes de Componentes** - UI React
3. **Testes de Integração** - Fluxos completos
4. **Testes E2E** - Jornada do usuário
5. **CI/CD** - Automação no GitHub

### **Por Que é Importante**

Atualmente, o sistema não tem testes automatizados. Com testes:
- ✅ **Confiança** para fazer mudanças
- ✅ **Menos bugs** em produção
- ✅ **Documentação viva** do código
- ✅ **Onboarding** mais rápido

### **Ferramentas Escolhidas**

| Ferramenta | Propósito | Por Quê |
|------------|-----------|---------|
| **Vitest** | Testes unitários | Rápido, compatível com Vite |
| **React Testing Library** | Testes de componentes | Foco em comportamento do usuário |
| **Playwright** | Testes E2E | Multi-browser, confiável |
| **GitHub Actions** | CI/CD | Gratuito, integrado |

---

## 📅 DIA 1: CONFIGURAÇÃO (8 HORAS)

### **MANHÃ (4 horas)**

#### **Etapa 1.1: Instalar Vitest (30 min)**

**O que fazer:**
```bash
cd /home/ubuntu/inteligencia-de-mercado
pnpm add -D vitest @vitest/ui @vitest/coverage-v8
```

**Benefícios:**
- ✅ Framework de testes moderno
- ✅ Compatível com Vite
- ✅ Interface visual (@vitest/ui)
- ✅ Cobertura de código incluída

---

#### **Etapa 1.2: Configurar Vitest (1 hora)**

**O que fazer:**
Criar `vitest.config.ts`:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.{js,ts}',
        '**/*.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
});
```

**Criar `vitest.setup.ts`:**

```typescript
// vitest.setup.ts
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest matchers
expect.extend(matchers);

// Cleanup após cada teste
afterEach(() => {
  cleanup();
});
```

**Benefícios:**
- ✅ Configuração centralizada
- ✅ Ambiente jsdom para React
- ✅ Matchers do jest-dom
- ✅ Cleanup automático

---

#### **Etapa 1.3: Instalar Playwright (1 hora)**

**O que fazer:**
```bash
pnpm add -D @playwright/test
pnpm exec playwright install
```

**Configurar `playwright.config.ts`:**

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Benefícios:**
- ✅ Testes em 3 browsers
- ✅ Screenshots em falhas
- ✅ Traces para debug
- ✅ Servidor dev automático

---

#### **Etapa 1.4: Instalar Dependências de Teste (30 min)**

**O que fazer:**
```bash
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Benefícios:**
- ✅ Testing Library completo
- ✅ Matchers do jest-dom
- ✅ Simulação de eventos
- ✅ Ambiente jsdom

---

#### **Etapa 1.5: Criar Estrutura de Pastas (1 hora)**

**O que fazer:**
```bash
mkdir -p tests/unit
mkdir -p tests/integration
mkdir -p e2e
mkdir -p tests/__mocks__
```

**Estrutura:**
```
tests/
├── unit/              # Testes unitários
│   ├── api/          # Testes de endpoints
│   ├── lib/          # Testes de funções
│   └── utils/        # Testes de utilitários
├── integration/       # Testes de integração
│   ├── auth.test.ts
│   └── import.test.ts
├── __mocks__/        # Mocks compartilhados
│   ├── postgres.ts
│   └── openai.ts
└── helpers/          # Helpers de teste
    ├── setup.ts
    └── factories.ts
e2e/                  # Testes E2E
├── auth.spec.ts
├── projects.spec.ts
└── imports.spec.ts
```

**Benefícios:**
- ✅ Organização clara
- ✅ Fácil navegação
- ✅ Separação por tipo
- ✅ Mocks reutilizáveis

---

### **TARDE (4 horas)**

#### **Etapa 1.6: Criar Mocks (2 horas)**

**Mock do PostgreSQL:**

```typescript
// tests/__mocks__/postgres.ts
import { vi } from 'vitest';

export const mockClient = vi.fn(() => {
  const query = vi.fn();
  query.mockResolvedValue([]);
  return query;
});

export default mockClient;
```

**Mock do OpenAI:**

```typescript
// tests/__mocks__/openai.ts
import { vi } from 'vitest';

export const mockOpenAI = {
  chat: {
    completions: {
      create: vi.fn().mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              setor: 'Tecnologia',
              porte: 'Médio',
              score_qualidade: 85,
            }),
          },
        }],
        usage: {
          total_tokens: 500,
        },
      }),
    },
  },
};

export default mockOpenAI;
```

**Benefícios:**
- ✅ Testes rápidos (sem chamadas reais)
- ✅ Resultados previsíveis
- ✅ Sem custos de API
- ✅ Reutilizáveis

---

#### **Etapa 1.7: Criar Factories (1 hora)**

**O que fazer:**
Criar funções para gerar dados de teste.

```typescript
// tests/helpers/factories.ts

export function createUser(overrides = {}) {
  return {
    id: '123e4567-e89b-12d3-a456-426614174000',
    nome: 'Usuário Teste',
    email: 'teste@example.com',
    role: {
      id: 1,
      nome: 'administrador',
      descricao: 'Admin',
    },
    ativo: true,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createEntidade(overrides = {}) {
  return {
    id: 1,
    nome_entidade: 'Empresa Teste',
    cnpj: '12.345.678/0001-90',
    tipo_entidade: 'cliente',
    email: 'contato@teste.com',
    telefone: '(11) 1234-5678',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createProjeto(overrides = {}) {
  return {
    id: 1,
    nome: 'Projeto Teste',
    codigo: 'TEST-001',
    descricao: 'Descrição do projeto',
    status: 'ativo',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}
```

**Benefícios:**
- ✅ Dados consistentes
- ✅ Fácil customização
- ✅ Menos código repetido
- ✅ Manutenção centralizada

---

#### **Etapa 1.8: Primeiro Teste de Exemplo (1 hora)**

**O que fazer:**
Criar primeiro teste para validar setup.

```typescript
// tests/unit/example.test.ts
import { describe, it, expect } from 'vitest';

describe('Setup de Testes', () => {
  it('deve somar dois números', () => {
    expect(1 + 1).toBe(2);
  });

  it('deve verificar arrays', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });

  it('deve verificar objetos', () => {
    const obj = { nome: 'Teste', ativo: true };
    expect(obj).toHaveProperty('nome');
    expect(obj.ativo).toBe(true);
  });
});
```

**Executar:**
```bash
pnpm vitest
```

**Benefícios:**
- ✅ Validar configuração
- ✅ Aprender sintaxe
- ✅ Ver relatório de cobertura

---

## 📅 DIAS 2-3: TESTES UNITÁRIOS BACKEND (16 HORAS)

### **Objetivo**
Testar funções e endpoints individualmente.

### **DIA 2: Testes de Endpoints (8 horas)**

#### **Teste 1: Endpoint de Login**

```typescript
// tests/unit/api/login.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUser } from '../../helpers/factories';

// Mock do handler
vi.mock('postgres');

describe('POST /api/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve fazer login com credenciais válidas', async () => {
    const mockUser = createUser();
    
    // Mock do banco
    const mockClient = vi.fn(() => Promise.resolve([mockUser]));
    vi.mocked(postgres).mockReturnValue(mockClient);

    const req = {
      method: 'POST',
      body: {
        email: 'teste@example.com',
        senha: 'senha123',
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        token: expect.any(String),
        user: expect.objectContaining({
          email: 'teste@example.com',
        }),
      })
    );
  });

  it('deve rejeitar credenciais inválidas', async () => {
    const mockClient = vi.fn(() => Promise.resolve([]));
    vi.mocked(postgres).mockReturnValue(mockClient);

    const req = {
      method: 'POST',
      body: {
        email: 'teste@example.com',
        senha: 'senha_errada',
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.any(String),
      })
    );
  });

  it('deve validar campos obrigatórios', async () => {
    const req = {
      method: 'POST',
      body: {
        email: 'teste@example.com',
        // senha faltando
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
```

**Benefícios:**
- ✅ Validar autenticação
- ✅ Testar casos de erro
- ✅ Verificar validações

---

#### **Teste 2: Endpoint de Usuários**

```typescript
// tests/unit/api/usuarios.test.ts
import { describe, it, expect, vi } from 'vitest';

describe('GET /api/usuarios', () => {
  it('deve listar usuários', async () => {
    const mockUsers = [
      createUser({ id: '1', nome: 'User 1' }),
      createUser({ id: '2', nome: 'User 2' }),
    ];

    const mockClient = vi.fn(() => Promise.resolve(mockUsers));
    vi.mocked(postgres).mockReturnValue(mockClient);

    const req = { method: 'GET' };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        users: expect.arrayContaining([
          expect.objectContaining({ nome: 'User 1' }),
          expect.objectContaining({ nome: 'User 2' }),
        ]),
      })
    );
  });
});

describe('POST /api/usuarios', () => {
  it('deve criar novo usuário', async () => {
    const newUser = {
      nome: 'Novo User',
      email: 'novo@example.com',
      senha: 'senha123',
      role_id: 1,
    };

    const mockClient = vi.fn(() => Promise.resolve([
      { id: '123', ...newUser },
    ]));
    vi.mocked(postgres).mockReturnValue(mockClient);

    const req = {
      method: 'POST',
      body: newUser,
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expect.objectContaining({
          nome: 'Novo User',
        }),
      })
    );
  });

  it('deve rejeitar email duplicado', async () => {
    const mockClient = vi.fn(() => Promise.reject({
      code: '23505', // Unique violation
    }));
    vi.mocked(postgres).mockReturnValue(mockClient);

    const req = {
      method: 'POST',
      body: {
        nome: 'User',
        email: 'existente@example.com',
        senha: 'senha123',
        role_id: 1,
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });
});
```

**Benefícios:**
- ✅ Testar CRUD completo
- ✅ Validar constraints
- ✅ Verificar erros

---

### **DIA 3: Testes de Funções (8 horas)**

#### **Teste 3: Funções de IA**

```typescript
// tests/unit/lib/openai.test.ts
import { describe, it, expect, vi } from 'vitest';
import { enrichEntity, analyzeMarket } from '../../../lib/openai';

vi.mock('openai');

describe('enrichEntity', () => {
  it('deve enriquecer entidade com IA', async () => {
    const entidade = {
      nome: 'Empresa Teste',
      cnpj: '12.345.678/0001-90',
      tipo: 'cliente',
    };

    const result = await enrichEntity(entidade);

    expect(result).toHaveProperty('setor');
    expect(result).toHaveProperty('porte');
    expect(result).toHaveProperty('score_qualidade');
    expect(result.ia_processado).toBe(true);
    expect(result.tokens_usados).toBeGreaterThan(0);
  });

  it('deve lidar com erro da API', async () => {
    vi.mocked(openai.chat.completions.create).mockRejectedValue(
      new Error('API Error')
    );

    const entidade = {
      nome: 'Empresa',
      tipo: 'cliente',
    };

    await expect(enrichEntity(entidade)).rejects.toThrow('API Error');
  });
});

describe('analyzeMarket', () => {
  it('deve analisar mercado', async () => {
    const entidades = [
      { nome: 'Empresa 1', tipo: 'cliente' },
      { nome: 'Empresa 2', tipo: 'concorrente' },
    ];

    const result = await analyzeMarket(entidades);

    expect(result).toHaveProperty('tendencias');
    expect(result).toHaveProperty('oportunidades');
    expect(result).toHaveProperty('score_atratividade');
    expect(result.entidades_analisadas).toBe(2);
  });
});
```

**Benefícios:**
- ✅ Testar lógica de IA
- ✅ Validar estrutura de resposta
- ✅ Verificar tratamento de erros

---

## 📅 DIA 4: TESTES DE COMPONENTES FRONTEND (8 HORAS)

### **Objetivo**
Testar componentes React isoladamente.

#### **Teste 4: Componente LoginPage**

```typescript
// tests/unit/components/LoginPage.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/pages/LoginPage';

describe('LoginPage', () => {
  it('deve renderizar formulário de login', () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('deve permitir digitar email e senha', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const senhaInput = screen.getByLabelText(/senha/i);

    await user.type(emailInput, 'teste@example.com');
    await user.type(senhaInput, 'senha123');

    expect(emailInput).toHaveValue('teste@example.com');
    expect(senhaInput).toHaveValue('senha123');
  });

  it('deve mostrar/ocultar senha ao clicar no ícone', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const senhaInput = screen.getByLabelText(/senha/i);
    const toggleButton = screen.getByRole('button', { name: /mostrar senha/i });

    expect(senhaInput).toHaveAttribute('type', 'password');

    await user.click(toggleButton);
    expect(senhaInput).toHaveAttribute('type', 'text');

    await user.click(toggleButton);
    expect(senhaInput).toHaveAttribute('type', 'password');
  });

  it('deve fazer login com sucesso', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockResolvedValue({
      token: 'fake-token',
      user: { nome: 'Teste' },
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        token: 'fake-token',
        user: { nome: 'Teste' },
      }),
    });

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'teste@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'senha123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'teste@example.com',
            senha: 'senha123',
          }),
        })
      );
    });
  });

  it('deve mostrar erro em credenciais inválidas', async () => {
    const user = userEvent.setup();

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({
        error: 'Credenciais inválidas',
      }),
    });

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'teste@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'senha_errada');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/credenciais inválidas/i)).toBeInTheDocument();
    });
  });
});
```

**Benefícios:**
- ✅ Testar interação do usuário
- ✅ Validar formulários
- ✅ Verificar estados de loading/erro

---

#### **Teste 5: Componente GestaoUsuarios**

```typescript
// tests/unit/components/GestaoUsuarios.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GestaoUsuarios from '@/pages/GestaoUsuarios';

describe('GestaoUsuarios', () => {
  it('deve carregar e exibir lista de usuários', async () => {
    const mockUsers = [
      createUser({ id: '1', nome: 'User 1' }),
      createUser({ id: '2', nome: 'User 2' }),
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ users: mockUsers }),
    });

    render(<GestaoUsuarios />);

    expect(screen.getByText(/carregando/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.getByText('User 2')).toBeInTheDocument();
    });
  });

  it('deve abrir modal ao clicar em Novo Usuário', async () => {
    const user = userEvent.setup();
    render(<GestaoUsuarios />);

    await user.click(screen.getByRole('button', { name: /novo usuário/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
  });

  it('deve criar novo usuário', async () => {
    const user = userEvent.setup();

    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ users: [] }) })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          user: createUser({ nome: 'Novo User' }),
        }),
      });

    render(<GestaoUsuarios />);

    await user.click(screen.getByRole('button', { name: /novo usuário/i }));

    await user.type(screen.getByLabelText(/nome/i), 'Novo User');
    await user.type(screen.getByLabelText(/email/i), 'novo@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'senha123');

    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/usuarios',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });
});
```

**Benefícios:**
- ✅ Testar CRUD visual
- ✅ Validar modals
- ✅ Verificar loading states

---

## 📅 DIA 5: TESTES DE INTEGRAÇÃO (8 HORAS)

### **Objetivo**
Testar fluxos completos que envolvem múltiplos componentes.

#### **Teste 6: Fluxo de Autenticação**

```typescript
// tests/integration/auth.test.ts
import { describe, it, expect } from 'vitest';

describe('Fluxo de Autenticação', () => {
  it('deve fazer login e acessar dashboard', async () => {
    // 1. Fazer login
    const loginResponse = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'teste@example.com',
        senha: 'senha123',
      }),
    });

    expect(loginResponse.ok).toBe(true);
    const { token, user } = await loginResponse.json();
    expect(token).toBeDefined();
    expect(user.email).toBe('teste@example.com');

    // 2. Acessar endpoint protegido
    const dashboardResponse = await fetch('/api/trpc/dashboard.stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    expect(dashboardResponse.ok).toBe(true);
    const stats = await dashboardResponse.json();
    expect(stats).toHaveProperty('projetos');
  });

  it('deve rejeitar acesso sem token', async () => {
    const response = await fetch('/api/trpc/dashboard.stats');
    expect(response.status).toBe(401);
  });
});
```

**Benefícios:**
- ✅ Testar fluxo real
- ✅ Validar integração entre endpoints
- ✅ Verificar autenticação

---

#### **Teste 7: Fluxo de Importação**

```typescript
// tests/integration/import.test.ts
import { describe, it, expect } from 'vitest';

describe('Fluxo de Importação', () => {
  it('deve importar CSV e listar entidades', async () => {
    const csvData = `nome,cnpj,email
Empresa 1,12.345.678/0001-90,empresa1@test.com
Empresa 2,98.765.432/0001-10,empresa2@test.com`;

    // 1. Fazer upload
    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        csvData,
        projetoId: 1,
        pesquisaId: 1,
      }),
    });

    expect(uploadResponse.ok).toBe(true);
    const { importacaoId, resultado } = await uploadResponse.json();
    expect(resultado.sucesso).toBe(2);

    // 2. Listar entidades
    const listResponse = await fetch('/api/trpc/entidades.list?projetoId=1');
    expect(listResponse.ok).toBe(true);
    const { entidades } = await listResponse.json();
    expect(entidades).toHaveLength(2);
    expect(entidades[0].nome_entidade).toBe('Empresa 1');
  });
});
```

**Benefícios:**
- ✅ Testar importação completa
- ✅ Validar dados no banco
- ✅ Verificar listagem

---

## 📅 DIA 6: TESTES E2E (8 HORAS)

### **Objetivo**
Testar jornada completa do usuário no browser.

#### **Teste 8: Jornada do Usuário**

```typescript
// e2e/user-journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Jornada Completa do Usuário', () => {
  test('deve fazer login, criar projeto e importar dados', async ({ page }) => {
    // 1. Acessar página de login
    await page.goto('/login');
    await expect(page).toHaveTitle(/Intelmarket/);

    // 2. Fazer login
    await page.fill('[name="email"]', 'sandrodireto@gmail.com');
    await page.fill('[name="senha"]', 'Ss311000!');
    await page.click('button:has-text("Entrar")');

    // 3. Verificar redirecionamento para dashboard
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Dashboard');

    // 4. Criar novo projeto
    await page.click('a:has-text("Novo Projeto")');
    await page.fill('[name="nome"]', 'Projeto E2E Test');
    await page.fill('[name="codigo"]', 'E2E-001');
    await page.click('button:has-text("Salvar")');

    // 5. Verificar projeto criado
    await expect(page.locator('text=Projeto E2E Test')).toBeVisible();

    // 6. Importar dados
    await page.click('a:has-text("Importar Dados")');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/empresas.csv');
    await page.click('button:has-text("Importar")');

    // 7. Verificar importação
    await expect(page.locator('text=Importação concluída')).toBeVisible();

    // 8. Ver entidades
    await page.click('a:has-text("Base de Entidades")');
    await expect(page.locator('table tbody tr')).toHaveCount(3);
  });

  test('deve processar entidade com IA', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'sandrodireto@gmail.com');
    await page.fill('[name="senha"]', 'Ss311000!');
    await page.click('button:has-text("Entrar")');

    await page.goto('/entidades');
    await page.click('button:has-text("Enriquecer"):first');

    await expect(page.locator('text=Processando')).toBeVisible();
    await expect(page.locator('text=Enriquecido com sucesso')).toBeVisible({ timeout: 10000 });
  });
});
```

**Benefícios:**
- ✅ Testar fluxo real do usuário
- ✅ Validar interações complexas
- ✅ Verificar em múltiplos browsers

---

## 🎁 BENEFÍCIOS DETALHADOS

### **Para o Desenvolvimento**

1. **Confiança para Refatorar**
   - ✅ Mudanças sem medo de quebrar
   - ✅ Refatoração segura
   - ✅ Evolução contínua

2. **Documentação Viva**
   - ✅ Testes como exemplos
   - ✅ Comportamento esperado claro
   - ✅ Onboarding mais rápido

3. **Detecção Precoce de Bugs**
   - ✅ Bugs encontrados antes de produção
   - ✅ Menos tempo de debug
   - ✅ Menor custo de correção

### **Para o Negócio**

1. **Qualidade**
   - ✅ Menos bugs em produção
   - ✅ Usuários mais satisfeitos
   - ✅ Menos suporte necessário

2. **Velocidade**
   - ✅ Deploy mais rápido
   - ✅ Menos rollbacks
   - ✅ Entregas mais frequentes

3. **Custo**
   - ✅ Menos tempo de debug
   - ✅ Menos retrabalho
   - ✅ ROI positivo

---

## 🎯 CASOS DE USO PRÁTICOS

### **Caso 1: Adicionar Nova Funcionalidade**

**Antes (sem testes):**
1. Implementar funcionalidade
2. Testar manualmente
3. Deploy
4. Bug em produção
5. Hotfix urgente
6. Retrabalho

**Depois (com testes):**
1. Escrever teste
2. Implementar funcionalidade
3. Teste passa
4. Deploy com confiança
5. Sem bugs

**Economia:** 70% do tempo

---

### **Caso 2: Refatorar Código Legado**

**Antes:**
- Medo de quebrar algo
- Refatoração adiada
- Código cada vez pior

**Depois:**
- Testes garantem comportamento
- Refatoração segura
- Código limpo

---

### **Caso 3: Onboarding de Novo Desenvolvedor**

**Antes:**
- 2 semanas para entender código
- Muitas perguntas
- Medo de fazer mudanças

**Depois:**
- Testes como documentação
- 3 dias para produtividade
- Confiança para contribuir

---

## 📊 MÉTRICAS DE SUCESSO

| Métrica | Meta | Como Medir |
|---------|------|------------|
| **Cobertura de Código** | > 80% | Vitest coverage |
| **Testes Passando** | 100% | CI/CD |
| **Tempo de Execução** | < 5 min | CI logs |
| **Bugs em Produção** | -50% | Issue tracker |
| **Tempo de Deploy** | -30% | CI/CD metrics |

---

## ✅ CHECKLIST DE CONCLUSÃO

- [ ] Vitest instalado e configurado
- [ ] Playwright instalado e configurado
- [ ] Estrutura de pastas criada
- [ ] Mocks implementados
- [ ] Factories criadas
- [ ] 20+ testes unitários (backend)
- [ ] 10+ testes de componentes (frontend)
- [ ] 5+ testes de integração
- [ ] 3+ testes E2E
- [ ] Cobertura > 80%
- [ ] CI/CD configurado
- [ ] Documentação criada

---

**Próximo:** [DETALHAMENTO_CACHE_REDIS.md](./DETALHAMENTO_CACHE_REDIS.md)
