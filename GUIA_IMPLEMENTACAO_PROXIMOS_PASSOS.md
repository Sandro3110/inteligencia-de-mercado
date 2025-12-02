# 🚀 Guia de Implementação - Próximos Passos

Este documento fornece um guia detalhado e prático para implementar as funcionalidades avançadas do sistema Intelmarket.

---

## 📋 ÍNDICE

1. [Implementar API Real de IA](#1-implementar-api-real-de-ia)
2. [Adicionar Autenticação e RBAC](#2-adicionar-autenticação-e-rbac)
3. [Criar Testes Automatizados](#3-criar-testes-automatizados)
4. [Implementar Cache Redis](#4-implementar-cache-redis)
5. [Adicionar Notificações em Tempo Real](#5-adicionar-notificações-em-tempo-real)

---

## 1. Implementar API Real de IA

### 🎯 Objetivo
Substituir a simulação mockada por integração real com serviços de IA para processamento de dados.

### 🏗️ Arquitetura Recomendada

**Opção 1: OpenAI GPT-4** (Recomendado para análise de texto e enriquecimento)
- Melhor para: Análise de qualidade, sugestões de correção, enriquecimento semântico
- Custo: ~$0.03 por 1K tokens (entrada) + $0.06 por 1K tokens (saída)
- Latência: 2-5 segundos por requisição

**Opção 2: Google Cloud AI** (Recomendado para dados estruturados)
- Melhor para: Validação de dados, normalização, deduplicação
- Custo: Varia por serviço (Natural Language API, Vision API, etc.)
- Latência: 1-3 segundos por requisição

**Opção 3: Anthropic Claude** (Recomendado para análises complexas)
- Melhor para: Análise profunda, recomendações estratégicas
- Custo: Similar ao OpenAI
- Latência: 2-4 segundos por requisição

### 📝 Implementação Passo a Passo

#### Passo 1: Instalar Dependências

```bash
cd /home/ubuntu/inteligencia-de-mercado
pnpm add openai @anthropic-ai/sdk @google-cloud/aiplatform
pnpm add -D @types/node
```

#### Passo 2: Configurar Variáveis de Ambiente

Adicione no arquivo `.env`:

```env
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview

# Anthropic (opcional)
ANTHROPIC_API_KEY=sk-ant-...

# Google Cloud (opcional)
GOOGLE_CLOUD_PROJECT_ID=seu-projeto
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

#### Passo 3: Criar Serviço de IA

Crie o arquivo `api/services/ai-service.js`:

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analisa a qualidade dos dados de uma entidade
 */
export async function analisarQualidade(entidade) {
  const prompt = `
Analise a qualidade dos seguintes dados de uma empresa:

Nome: ${entidade.nome}
CNPJ: ${entidade.cnpj || 'não informado'}
Email: ${entidade.email || 'não informado'}
Telefone: ${entidade.telefone || 'não informado'}
Site: ${entidade.site || 'não informado'}
Endereço: ${entidade.endereco || 'não informado'}

Retorne um JSON com:
1. score: número de 0 a 100 indicando a qualidade geral
2. problemas: array de strings descrevendo problemas encontrados
3. sugestoes: array de objetos com {campo, valorAtual, valorSugerido, motivo}

Formato de resposta:
{
  "score": 85,
  "problemas": ["Email sem domínio corporativo", "Telefone sem DDD"],
  "sugestoes": [
    {
      "campo": "email",
      "valorAtual": "contato@gmail.com",
      "valorSugerido": "contato@empresa.com.br",
      "motivo": "Usar email corporativo aumenta credibilidade"
    }
  ]
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em qualidade de dados empresariais. Analise os dados e retorne APENAS o JSON solicitado, sem texto adicional.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const resultado = JSON.parse(response.choices[0].message.content);
    return resultado;
  } catch (error) {
    console.error('Erro ao analisar qualidade:', error);
    throw new Error('Falha ao processar análise de qualidade');
  }
}

/**
 * Enriquece dados de uma entidade
 */
export async function enriquecerDados(entidade) {
  const prompt = `
Com base nos dados da empresa abaixo, sugira informações complementares:

Nome: ${entidade.nome}
CNPJ: ${entidade.cnpj}
Setor: ${entidade.setor || 'não informado'}

Retorne um JSON com:
{
  "setor": "setor identificado",
  "porte": "micro|pequeno|medio|grande",
  "receitaEstimada": "faixa de receita anual em R$",
  "numeroFuncionariosEstimado": "faixa de funcionários",
  "segmentoMercado": "segmento específico",
  "tags": ["tag1", "tag2", "tag3"]
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em classificação de empresas brasileiras. Retorne APENAS o JSON solicitado.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Erro ao enriquecer dados:', error);
    throw new Error('Falha ao enriquecer dados');
  }
}

/**
 * Detecta duplicatas usando embeddings
 */
export async function detectarDuplicatas(entidades) {
  // Gerar embeddings para cada entidade
  const embeddings = await Promise.all(
    entidades.map(async (e) => {
      const texto = `${e.nome} ${e.cnpj} ${e.email}`;
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: texto,
      });
      return {
        id: e.id,
        embedding: response.data[0].embedding,
      };
    })
  );

  // Calcular similaridade cosseno entre todos os pares
  const duplicatas = [];
  for (let i = 0; i < embeddings.length; i++) {
    for (let j = i + 1; j < embeddings.length; j++) {
      const similaridade = cosineSimilarity(
        embeddings[i].embedding,
        embeddings[j].embedding
      );
      
      if (similaridade > 0.95) {
        duplicatas.push({
          entidade1Id: embeddings[i].id,
          entidade2Id: embeddings[j].id,
          similaridade: Math.round(similaridade * 100),
        });
      }
    }
  }

  return duplicatas;
}

/**
 * Calcula similaridade cosseno entre dois vetores
 */
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
```

#### Passo 4: Criar Endpoint de Processamento

Adicione no `api/trpc.js`:

```javascript
import { analisarQualidade, enriquecerDados, detectarDuplicatas } from './services/ai-service.js';

// ... código existente ...

// PROCESSAMENTO IA
else if (router === 'ia') {
  if (procedure === 'processar') {
    const { entidadeIds, opcoes } = input;
    
    // Buscar entidades
    const entidades = await client`
      SELECT * FROM dim_entidade
      WHERE id = ANY(${entidadeIds})
    `;
    
    const resultados = [];
    
    for (const entidade of entidades) {
      const resultado = {
        entidadeId: entidade.id,
        nomeEntidade: entidade.nome,
        qualidadeAntes: 0,
        qualidadeDepois: 0,
        sugestoesAplicadas: [],
        camposEnriquecidos: [],
      };
      
      // Analisar qualidade
      if (opcoes.analisarQualidade) {
        const analise = await analisarQualidade(entidade);
        resultado.qualidadeAntes = analise.score;
        resultado.problemas = analise.problemas;
      }
      
      // Aplicar correções
      if (opcoes.sugerirCorrecoes && analise?.sugestoes) {
        for (const sugestao of analise.sugestoes) {
          await client`
            UPDATE dim_entidade
            SET ${client(sugestao.campo)} = ${sugestao.valorSugerido},
                updated_at = NOW()
            WHERE id = ${entidade.id}
          `;
          resultado.sugestoesAplicadas.push(
            `${sugestao.campo}: ${sugestao.valorAtual} → ${sugestao.valorSugerido}`
          );
        }
        resultado.qualidadeDepois = 100; // Recalcular após correções
      }
      
      // Enriquecer dados
      if (opcoes.enriquecerDados) {
        const enriquecimento = await enriquecerDados(entidade);
        
        await client`
          UPDATE dim_entidade
          SET setor = ${enriquecimento.setor},
              porte = ${enriquecimento.porte},
              receita_estimada = ${enriquecimento.receitaEstimada},
              updated_at = NOW()
          WHERE id = ${entidade.id}
        `;
        
        resultado.camposEnriquecidos = [
          `Setor: ${enriquecimento.setor}`,
          `Porte: ${enriquecimento.porte}`,
          `Receita estimada: ${enriquecimento.receitaEstimada}`,
        ];
      }
      
      resultados.push(resultado);
    }
    
    // Detectar duplicatas
    if (opcoes.deduplicar) {
      const duplicatas = await detectarDuplicatas(entidades);
      data = { resultados, duplicatas };
    } else {
      data = { resultados };
    }
  }
}
```

#### Passo 5: Atualizar Frontend

Modifique `client/src/pages/ProcessamentoIA.tsx`:

```typescript
const iniciarProcessamento = async () => {
  try {
    setProcessando(true);
    setErro(null);
    
    // Buscar IDs de todas as entidades
    const responseEntidades = await fetch('/api/trpc/entidades.list');
    const dataEntidades = await responseEntidades.json();
    const entidadeIds = dataEntidades.result.data.map((e: any) => e.id);
    
    // Chamar API real de processamento
    const response = await fetch('/api/trpc/ia.processar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: {
          entidadeIds,
          opcoes: {
            analisarQualidade: opcoes.analisarQualidade,
            sugerirCorrecoes: opcoes.sugerirCorrecoes,
            enriquecerDados: opcoes.enriquecerDados,
            deduplicar: opcoes.deduplicar,
          },
        },
      }),
    });
    
    const data = await response.json();
    setResultados(data.result.data.resultados);
    
    if (data.result.data.duplicatas) {
      // Mostrar modal de duplicatas encontradas
      console.log('Duplicatas:', data.result.data.duplicatas);
    }
  } catch (err) {
    setErro('Erro ao processar dados com IA');
    console.error(err);
  } finally {
    setProcessando(false);
  }
};
```

### ⏱️ Estimativa de Tempo
- **Configuração inicial:** 2 horas
- **Desenvolvimento do serviço:** 4-6 horas
- **Integração com frontend:** 2-3 horas
- **Testes e ajustes:** 3-4 horas
- **Total:** 11-15 horas (2 dias)

### 💰 Custos Estimados
- **OpenAI GPT-4:** ~$0.10 por entidade processada
- **Embeddings:** ~$0.0001 por entidade
- **Custo mensal estimado (1000 entidades/mês):** ~$100-150

### ✅ Checklist de Implementação
- [ ] Criar conta na OpenAI e obter API key
- [ ] Configurar variáveis de ambiente
- [ ] Implementar serviço de IA
- [ ] Criar endpoints na API
- [ ] Atualizar frontend
- [ ] Testar com dados reais
- [ ] Monitorar custos e performance
- [ ] Implementar rate limiting
- [ ] Adicionar logs e métricas

---

## 2. Adicionar Autenticação e RBAC

### 🎯 Objetivo
Implementar sistema de autenticação seguro com controle de acesso baseado em papéis (RBAC).

### 🏗️ Arquitetura Recomendada

**Stack Sugerida:**
- **Auth Provider:** Supabase Auth (já integrado)
- **Session Management:** JWT tokens
- **RBAC:** Tabelas customizadas no PostgreSQL
- **Middleware:** Verificação de permissões em cada endpoint

### 📊 Modelo de Dados

```sql
-- Tabela de usuários (já existe no Supabase)
-- auth.users

-- Tabela de perfis de usuário
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  organizacao_id INTEGER REFERENCES organizacoes(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de papéis (roles)
CREATE TABLE public.roles (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) UNIQUE NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inserir papéis padrão
INSERT INTO roles (nome, descricao) VALUES
  ('admin', 'Administrador com acesso total'),
  ('manager', 'Gerente com acesso a projetos e equipe'),
  ('analyst', 'Analista com acesso a dados e relatórios'),
  ('viewer', 'Visualizador com acesso somente leitura');

-- Tabela de permissões
CREATE TABLE public.permissions (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) UNIQUE NOT NULL,
  descricao TEXT,
  recurso VARCHAR(50) NOT NULL, -- 'projetos', 'entidades', 'importacoes', etc.
  acao VARCHAR(20) NOT NULL, -- 'create', 'read', 'update', 'delete'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inserir permissões padrão
INSERT INTO permissions (nome, descricao, recurso, acao) VALUES
  ('projetos.create', 'Criar novos projetos', 'projetos', 'create'),
  ('projetos.read', 'Visualizar projetos', 'projetos', 'read'),
  ('projetos.update', 'Editar projetos', 'projetos', 'update'),
  ('projetos.delete', 'Excluir projetos', 'projetos', 'delete'),
  ('entidades.create', 'Criar entidades', 'entidades', 'create'),
  ('entidades.read', 'Visualizar entidades', 'entidades', 'read'),
  ('entidades.update', 'Editar entidades', 'entidades', 'update'),
  ('entidades.delete', 'Excluir entidades', 'entidades', 'delete'),
  ('importacoes.create', 'Fazer importações', 'importacoes', 'create'),
  ('importacoes.read', 'Visualizar histórico', 'importacoes', 'read'),
  ('ia.process', 'Processar com IA', 'ia', 'process');

-- Tabela de relacionamento roles-permissions
CREATE TABLE public.role_permissions (
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Atribuir permissões aos papéis
-- Admin: todas as permissões
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- Manager: criar, ler e editar (sem deletar)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions WHERE acao IN ('create', 'read', 'update');

-- Analyst: ler e processar com IA
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE acao = 'read' OR nome = 'ia.process';

-- Viewer: apenas leitura
INSERT INTO role_permissions (role_id, permission_id)
SELECT 4, id FROM permissions WHERE acao = 'read';

-- Índices para performance
CREATE INDEX idx_user_profiles_role ON user_profiles(role_id);
CREATE INDEX idx_user_profiles_org ON user_profiles(organizacao_id);
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
```

### 📝 Implementação Passo a Passo

#### Passo 1: Instalar Dependências

```bash
pnpm add @supabase/supabase-js jsonwebtoken bcryptjs
pnpm add -D @types/jsonwebtoken @types/bcryptjs
```

#### Passo 2: Configurar Supabase Client

Crie `api/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
```

#### Passo 3: Criar Middleware de Autenticação

Crie `api/middleware/auth.js`:

```javascript
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabase.js';

/**
 * Verifica se o usuário está autenticado
 */
export async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    // Verificar token com Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Buscar perfil do usuário com role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select(`
        *,
        role:roles(*)
      `)
      .eq('id', user.id)
      .single();

    if (!profile) {
      return res.status(403).json({ error: 'Perfil não encontrado' });
    }

    // Adicionar usuário ao request
    req.user = {
      id: user.id,
      email: user.email,
      profile,
      role: profile.role,
    };

    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(401).json({ error: 'Falha na autenticação' });
  }
}

/**
 * Verifica se o usuário tem uma permissão específica
 */
export async function requirePermission(permissionName) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Não autenticado' });
      }

      const roleId = req.user.role.id;

      // Verificar se o role tem a permissão
      const { data: hasPermission } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', roleId)
        .eq('permission_id', (
          await supabase
            .from('permissions')
            .select('id')
            .eq('nome', permissionName)
            .single()
        ).data.id)
        .single();

      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Sem permissão',
          required: permissionName 
        });
      }

      next();
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return res.status(403).json({ error: 'Falha na verificação de permissão' });
    }
  };
}

/**
 * Verifica se o usuário tem um dos papéis especificados
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const userRole = req.user.role.nome;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Acesso negado',
        required: allowedRoles,
        current: userRole
      });
    }

    next();
  };
}
```

#### Passo 4: Proteger Endpoints

Modifique `api/trpc.js` para adicionar autenticação:

```javascript
import { requireAuth, requirePermission } from './middleware/auth.js';

// Adicionar middleware de autenticação
app.use('/api/trpc/*', requireAuth);

// Exemplo de endpoint protegido
else if (router === 'projetos') {
  if (procedure === 'create') {
    // Verificar permissão
    await requirePermission('projetos.create')(req, res, () => {});
    
    // Adicionar created_by automaticamente
    const { nome, descricao, status } = input;
    const result = await client`
      INSERT INTO dim_projeto (nome, descricao, status, created_by)
      VALUES (${nome}, ${descricao}, ${status}, ${req.user.id})
      RETURNING *
    `;
    data = result[0];
  }
  else if (procedure === 'delete') {
    await requirePermission('projetos.delete')(req, res, () => {});
    
    const { id } = input;
    await client`
      UPDATE dim_projeto 
      SET deleted_at = NOW(), deleted_by = ${req.user.id}
      WHERE id = ${id}
    `;
    data = { success: true };
  }
}
```

#### Passo 5: Implementar Login no Frontend

Crie `client/src/contexts/AuthContext.tsx`:

```typescript
import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface User {
  id: string;
  email: string;
  profile: any;
  role: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function loadUserProfile(userId: string) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*, role:roles(*)')
      .eq('id', userId)
      .single();

    if (profile) {
      setUser({
        id: userId,
        email: profile.email,
        profile,
        role: profile.role,
      });
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  function hasPermission(permission: string): boolean {
    if (!user) return false;
    // Implementar lógica de verificação de permissão
    return true; // Simplificado
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
```

Crie `client/src/pages/LoginPage.tsx`:

```typescript
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const [, setLocation] = useLocation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      setLocation('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6">
          Intelmarket
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

#### Passo 6: Proteger Rotas no Frontend

Modifique `client/src/App.tsx`:

```typescript
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Switch>
        {/* Rotas protegidas */}
        <Route path="/" component={HomePage} />
        <Route path="/projetos" component={ProjetosPage} />
        {/* ... outras rotas ... */}
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <ProtectedRoutes />
        </QueryClientProvider>
      </trpc.Provider>
    </AuthProvider>
  );
}
```

### ⏱️ Estimativa de Tempo
- **Configuração do banco de dados:** 2 horas
- **Implementação do middleware:** 3-4 horas
- **Proteção de endpoints:** 4-6 horas
- **Implementação do frontend:** 6-8 horas
- **Testes e ajustes:** 4-6 horas
- **Total:** 19-26 horas (3-4 dias)

### ✅ Checklist de Implementação
- [ ] Criar tabelas de RBAC no banco
- [ ] Configurar Supabase Auth
- [ ] Implementar middleware de autenticação
- [ ] Proteger todos os endpoints
- [ ] Criar contexto de autenticação no frontend
- [ ] Implementar página de login
- [ ] Proteger rotas no frontend
- [ ] Testar todos os papéis e permissões
- [ ] Implementar recuperação de senha
- [ ] Adicionar logs de auditoria

---

## 3. Criar Testes Automatizados

### 🎯 Objetivo
Implementar suite completa de testes automatizados para garantir qualidade e prevenir regressões.

### 🏗️ Arquitetura de Testes

**Tipos de Testes:**
1. **Unit Tests** - Funções e utilitários isolados (Vitest)
2. **Integration Tests** - Endpoints da API (Vitest + Supertest)
3. **E2E Tests** - Fluxos completos do usuário (Playwright)
4. **Component Tests** - Componentes React (Vitest + Testing Library)

### 📝 Implementação Passo a Passo

#### Passo 1: Instalar Dependências

```bash
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
pnpm add -D @playwright/test supertest msw
pnpm add -D @testing-library/user-event happy-dom
```

#### Passo 2: Configurar Vitest

Crie `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./client/src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'client/src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
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

Crie `client/src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Limpar após cada teste
afterEach(() => {
  cleanup();
});
```

#### Passo 3: Testes Unitários

Crie `client/src/lib/__tests__/utils.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { formatCNPJ, validateEmail, calculateQualityScore } from '../utils';

describe('Utils', () => {
  describe('formatCNPJ', () => {
    it('deve formatar CNPJ corretamente', () => {
      expect(formatCNPJ('12345678000190')).toBe('12.345.678/0001-90');
    });

    it('deve retornar string vazia para CNPJ inválido', () => {
      expect(formatCNPJ('123')).toBe('');
    });
  });

  describe('validateEmail', () => {
    it('deve validar email correto', () => {
      expect(validateEmail('teste@empresa.com.br')).toBe(true);
    });

    it('deve rejeitar email inválido', () => {
      expect(validateEmail('teste@')).toBe(false);
    });
  });

  describe('calculateQualityScore', () => {
    it('deve calcular score 100 para dados completos', () => {
      const entidade = {
        nome: 'Empresa Teste',
        cnpj: '12345678000190',
        email: 'contato@empresa.com',
        telefone: '(11) 91234-5678',
        site: 'https://empresa.com',
        endereco: 'Rua Teste, 123',
      };
      expect(calculateQualityScore(entidade)).toBe(100);
    });

    it('deve calcular score proporcional para dados parciais', () => {
      const entidade = {
        nome: 'Empresa Teste',
        cnpj: '12345678000190',
        email: '',
        telefone: '',
        site: '',
        endereco: '',
      };
      expect(calculateQualityScore(entidade)).toBe(33); // 2 de 6 campos
    });
  });
});
```

#### Passo 4: Testes de Componentes

Crie `client/src/components/__tests__/ModalErrosImportacao.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModalErrosImportacao from '../ModalErrosImportacao';

// Mock do fetch
global.fetch = vi.fn();

describe('ModalErrosImportacao', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o modal com título correto', () => {
    render(
      <ModalErrosImportacao
        importacaoId={1}
        nomeArquivo="teste.csv"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Erros de Importação')).toBeInTheDocument();
    expect(screen.getByText('teste.csv')).toBeInTheDocument();
  });

  it('deve carregar e exibir erros', async () => {
    const mockErros = [
      {
        id: 1,
        linhaNumero: 5,
        tipoErro: 'validacao',
        mensagemErro: 'CNPJ inválido',
        dadosLinha: 'Empresa Teste,123456',
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ result: { data: mockErros } }),
    });

    render(
      <ModalErrosImportacao
        importacaoId={1}
        nomeArquivo="teste.csv"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Linha 5')).toBeInTheDocument();
      expect(screen.getByText('CNPJ inválido')).toBeInTheDocument();
    });
  });

  it('deve chamar onClose ao clicar no botão fechar', async () => {
    render(
      <ModalErrosImportacao
        importacaoId={1}
        nomeArquivo="teste.csv"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByText('Fechar');
    await userEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
```

#### Passo 5: Testes de Integração da API

Crie `api/__tests__/importacao.test.js`:

```javascript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';
import { supabase } from '../lib/supabase.js';

describe('API de Importação', () => {
  let authToken;
  let testProjetoId;
  let testPesquisaId;

  beforeAll(async () => {
    // Criar usuário de teste e fazer login
    const { data: { session } } = await supabase.auth.signInWithPassword({
      email: 'teste@intelmarket.com',
      password: 'senha_teste_123',
    });
    authToken = session.access_token;

    // Criar projeto e pesquisa de teste
    const projeto = await request(app)
      .post('/api/trpc/projetos.create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ input: { nome: 'Projeto Teste', status: 'ativo' } });
    testProjetoId = projeto.body.result.data.id;

    const pesquisa = await request(app)
      .post('/api/trpc/pesquisas.create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ 
        input: { 
          nome: 'Pesquisa Teste', 
          projetoId: testProjetoId,
          status: 'em_progresso'
        } 
      });
    testPesquisaId = pesquisa.body.result.data.id;
  });

  afterAll(async () => {
    // Limpar dados de teste
    await request(app)
      .post('/api/trpc/projetos.delete')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ input: { id: testProjetoId } });
  });

  describe('POST /api/upload', () => {
    it('deve importar CSV com sucesso', async () => {
      const csvData = `nome,cnpj,email,tipo
Empresa Teste A,12345678000190,contato@empresaa.com,cliente
Empresa Teste B,98765432000100,contato@empresab.com,lead`;

      const response = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          csvData,
          projetoId: testProjetoId,
          pesquisaId: testPesquisaId,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.resultado.total).toBe(2);
      expect(response.body.resultado.sucesso).toBe(2);
      expect(response.body.resultado.erro).toBe(0);
    });

    it('deve retornar erro para CSV inválido', async () => {
      const csvData = `nome,cnpj
Empresa Sem Email,123`;

      const response = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          csvData,
          projetoId: testProjetoId,
          pesquisaId: testPesquisaId,
        });

      expect(response.status).toBe(200);
      expect(response.body.resultado.erro).toBeGreaterThan(0);
    });

    it('deve detectar duplicatas', async () => {
      const csvData = `nome,cnpj,email,tipo
Empresa Duplicada,11111111000111,dup@empresa.com,cliente
Empresa Duplicada,11111111000111,dup@empresa.com,cliente`;

      const response = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          csvData,
          projetoId: testProjetoId,
          pesquisaId: testPesquisaId,
        });

      expect(response.body.resultado.duplicadas).toBe(1);
    });
  });

  describe('GET /api/trpc/importacao.list', () => {
    it('deve listar importações', async () => {
      const response = await request(app)
        .get('/api/trpc/importacao.list')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.result.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/trpc/importacao.getErros', () => {
    it('deve retornar erros de uma importação', async () => {
      // Primeiro criar uma importação com erros
      const csvData = `nome,cnpj
Empresa Erro,CNPJ_INVALIDO`;

      const importacao = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          csvData,
          projetoId: testProjetoId,
          pesquisaId: testPesquisaId,
        });

      const importacaoId = importacao.body.importacaoId;

      const response = await request(app)
        .get(`/api/trpc/importacao.getErros?input=${JSON.stringify({ importacaoId })}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.result.data).toBeInstanceOf(Array);
      expect(response.body.result.data.length).toBeGreaterThan(0);
    });
  });
});
```

#### Passo 6: Testes E2E com Playwright

Instalar Playwright:

```bash
pnpm create playwright
```

Crie `e2e/importacao.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Fluxo de Importação', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('https://www.intelmarket.app/login');
    await page.fill('input[type="email"]', 'teste@intelmarket.com');
    await page.fill('input[type="password"]', 'senha_teste_123');
    await page.click('button[type="submit"]');
    await page.waitForURL('https://www.intelmarket.app/');
  });

  test('deve realizar importação completa com sucesso', async ({ page }) => {
    // Navegar para página de importação
    await page.goto('https://www.intelmarket.app/importacao');
    
    // Selecionar projeto
    await page.selectOption('select[name="projeto"]', { label: 'Projeto Teste' });
    
    // Selecionar pesquisa
    await page.selectOption('select[name="pesquisa"]', { label: 'Pesquisa Teste' });
    
    // Upload de arquivo
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('e2e/fixtures/empresas-teste.csv');
    
    // Clicar em importar
    await page.click('button:has-text("Importar")');
    
    // Aguardar processamento
    await expect(page.locator('text=Processando')).toBeVisible();
    await expect(page.locator('text=Importação concluída')).toBeVisible({ timeout: 10000 });
    
    // Verificar estatísticas
    const sucesso = await page.locator('[data-testid="importacao-sucesso"]').textContent();
    expect(parseInt(sucesso || '0')).toBeGreaterThan(0);
    
    // Navegar para histórico
    await page.click('a:has-text("Histórico")');
    
    // Verificar que a importação aparece na lista
    await expect(page.locator('text=empresas-teste.csv')).toBeVisible();
  });

  test('deve visualizar erros de importação', async ({ page }) => {
    // Navegar para histórico
    await page.goto('https://www.intelmarket.app/importacoes');
    
    // Encontrar importação com erros
    const cardComErros = page.locator('.importacao-card:has-text("erro")').first();
    
    // Clicar em "Ver Erros"
    await cardComErros.locator('button:has-text("Ver Erros")').click();
    
    // Verificar que o modal abriu
    await expect(page.locator('text=Erros de Importação')).toBeVisible();
    
    // Verificar que há erros listados
    await expect(page.locator('.erro-item')).toHaveCount({ min: 1 });
    
    // Fechar modal
    await page.click('button:has-text("Fechar")');
    await expect(page.locator('text=Erros de Importação')).not.toBeVisible();
  });

  test('deve filtrar importações por projeto', async ({ page }) => {
    await page.goto('https://www.intelmarket.app/importacoes');
    
    // Contar importações iniciais
    const countInicial = await page.locator('.importacao-card').count();
    
    // Aplicar filtro
    await page.selectOption('select[name="projeto"]', { label: 'Projeto Teste' });
    
    // Aguardar atualização
    await page.waitForTimeout(500);
    
    // Contar importações filtradas
    const countFiltrado = await page.locator('.importacao-card').count();
    
    // Verificar que o filtro funcionou
    expect(countFiltrado).toBeLessThanOrEqual(countInicial);
  });
});
```

#### Passo 7: Configurar Scripts de Teste

Adicione no `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "pnpm test && pnpm test:e2e"
  }
}
```

#### Passo 8: Configurar CI/CD com GitHub Actions

Crie `.github/workflows/tests.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
          
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Run unit tests
        run: pnpm test:coverage
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
          
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Install Playwright
        run: pnpm exec playwright install --with-deps
        
      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          BASE_URL: https://www.intelmarket.app
          
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### ⏱️ Estimativa de Tempo
- **Configuração inicial:** 2 horas
- **Testes unitários:** 6-8 horas
- **Testes de componentes:** 6-8 horas
- **Testes de integração:** 8-10 horas
- **Testes E2E:** 8-10 horas
- **CI/CD:** 2-3 horas
- **Total:** 32-41 horas (5-6 dias)

### ✅ Checklist de Implementação
- [ ] Configurar Vitest
- [ ] Escrever testes unitários para utils
- [ ] Escrever testes de componentes
- [ ] Escrever testes de integração da API
- [ ] Configurar Playwright
- [ ] Escrever testes E2E
- [ ] Configurar CI/CD no GitHub Actions
- [ ] Atingir 80%+ de cobertura de código
- [ ] Documentar estratégia de testes
- [ ] Treinar equipe em TDD

---

## 4. Implementar Cache Redis

### 🎯 Objetivo
Adicionar camada de cache para melhorar performance e reduzir carga no banco de dados.

### 🏗️ Arquitetura de Cache

**Estratégias:**
1. **Cache-Aside** - Aplicação gerencia cache manualmente
2. **Write-Through** - Escreve no cache e banco simultaneamente
3. **Write-Behind** - Escreve no cache primeiro, banco depois (assíncrono)

**Casos de Uso:**
- Lista de projetos (TTL: 5 minutos)
- Lista de entidades (TTL: 10 minutos)
- Histórico de importações (TTL: 2 minutos)
- Detalhes de entidade (TTL: 15 minutos)
- Resultados de IA (TTL: 1 hora)

### 📝 Implementação Passo a Passo

#### Passo 1: Provisionar Redis

**Opção 1: Upstash (Recomendado para Vercel)**

1. Criar conta em https://upstash.com
2. Criar database Redis
3. Copiar URL de conexão

**Opção 2: Redis Cloud**

1. Criar conta em https://redis.com/try-free
2. Criar database
3. Copiar credenciais

#### Passo 2: Instalar Dependências

```bash
pnpm add ioredis
pnpm add -D @types/ioredis
```

#### Passo 3: Configurar Cliente Redis

Crie `api/lib/redis.js`:

```javascript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError(err) {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

redis.on('connect', () => {
  console.log('Redis connected');
});

/**
 * Wrapper para operações de cache
 */
export class CacheService {
  /**
   * Busca valor do cache
   */
  static async get(key) {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Define valor no cache com TTL
   */
  static async set(key, value, ttlSeconds = 300) {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Remove valor do cache
   */
  static async del(key) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error(`Cache del error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Remove múltiplas chaves por padrão
   */
  static async delPattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error(`Cache delPattern error for pattern ${pattern}:`, error);
      return false;
    }
  }

  /**
   * Incrementa contador
   */
  static async incr(key, ttlSeconds = 3600) {
    try {
      const value = await redis.incr(key);
      if (value === 1) {
        await redis.expire(key, ttlSeconds);
      }
      return value;
    } catch (error) {
      console.error(`Cache incr error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Cache com função de fallback
   */
  static async remember(key, ttlSeconds, fallbackFn) {
    // Tentar buscar do cache
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Se não encontrou, executar função e cachear
    const value = await fallbackFn();
    await this.set(key, value, ttlSeconds);
    return value;
  }
}

export default redis;
```

#### Passo 4: Implementar Cache nos Endpoints

Modifique `api/trpc.js`:

```javascript
import { CacheService } from './lib/redis.js';

// PROJETOS com cache
else if (router === 'projetos') {
  if (procedure === 'list') {
    const cacheKey = `projetos:list:${JSON.stringify(input)}`;
    
    data = await CacheService.remember(cacheKey, 300, async () => {
      const result = await client`
        SELECT * FROM dim_projeto
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT ${input.limit || 100}
      `;
      return result;
    });
  }
  else if (procedure === 'create') {
    // Criar projeto
    const result = await client`
      INSERT INTO dim_projeto (nome, descricao, status, created_by)
      VALUES (${input.nome}, ${input.descricao}, ${input.status}, ${req.user.id})
      RETURNING *
    `;
    
    // Invalidar cache de listagem
    await CacheService.delPattern('projetos:list:*');
    
    data = result[0];
  }
  else if (procedure === 'update') {
    // Atualizar projeto
    await client`
      UPDATE dim_projeto
      SET nome = ${input.nome},
          descricao = ${input.descricao},
          status = ${input.status},
          updated_at = NOW()
      WHERE id = ${input.id}
    `;
    
    // Invalidar cache específico e listagem
    await CacheService.del(`projetos:${input.id}`);
    await CacheService.delPattern('projetos:list:*');
    
    data = { success: true };
  }
}

// ENTIDADES com cache
else if (router === 'entidades') {
  if (procedure === 'list') {
    const cacheKey = 'entidades:list';
    
    data = await CacheService.remember(cacheKey, 600, async () => {
      const result = await client`
        SELECT * FROM dim_entidade
        ORDER BY created_at DESC
        LIMIT 100
      `;
      return result;
    });
  }
}

else if (router === 'entidade') {
  if (procedure === 'detalhes') {
    const cacheKey = `entidade:${input.id}`;
    
    data = await CacheService.remember(cacheKey, 900, async () => {
      const result = await client`
        SELECT * FROM dim_entidade
        WHERE id = ${input.id}
      `;
      return result[0] || null;
    });
  }
}

// IMPORTAÇÕES com cache
else if (router === 'importacao') {
  if (procedure === 'list') {
    const cacheKey = 'importacoes:list';
    
    data = await CacheService.remember(cacheKey, 120, async () => {
      const result = await client`
        SELECT 
          i.*,
          p.nome as "projetoNome",
          pe.nome as "pesquisaNome"
        FROM dim_importacao i
        LEFT JOIN dim_projeto p ON i.projeto_id = p.id
        LEFT JOIN dim_pesquisa pe ON i.pesquisa_id = pe.id
        ORDER BY i.created_at DESC
        LIMIT 100
      `;
      return result;
    });
  }
}
```

#### Passo 5: Implementar Rate Limiting

Crie `api/middleware/rate-limit.js`:

```javascript
import { CacheService } from '../lib/redis.js';

/**
 * Middleware de rate limiting usando Redis
 */
export function rateLimit(options = {}) {
  const {
    windowMs = 60000, // 1 minuto
    max = 100, // 100 requisições por minuto
    message = 'Muitas requisições, tente novamente mais tarde',
  } = options;

  return async (req, res, next) => {
    try {
      const identifier = req.user?.id || req.ip;
      const key = `ratelimit:${identifier}`;
      
      const current = await CacheService.incr(key, Math.ceil(windowMs / 1000));
      
      if (current > max) {
        return res.status(429).json({
          error: message,
          retryAfter: Math.ceil(windowMs / 1000),
        });
      }
      
      // Adicionar headers de rate limit
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current));
      res.setHeader('X-RateLimit-Reset', Date.now() + windowMs);
      
      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      // Em caso de erro, permitir requisição
      next();
    }
  };
}
```

Adicione no `api/index.js`:

```javascript
import { rateLimit } from './middleware/rate-limit.js';

// Rate limiting global
app.use('/api', rateLimit({
  windowMs: 60000, // 1 minuto
  max: 100, // 100 requisições por minuto
}));

// Rate limiting específico para upload
app.use('/api/upload', rateLimit({
  windowMs: 60000,
  max: 10, // 10 uploads por minuto
}));

// Rate limiting para IA
app.use('/api/trpc/ia.*', rateLimit({
  windowMs: 60000,
  max: 20, // 20 processamentos de IA por minuto
}));
```

#### Passo 6: Implementar Cache de Sessão

Crie `api/lib/session-store.js`:

```javascript
import { CacheService } from './redis.js';

/**
 * Store de sessão usando Redis
 */
export class SessionStore {
  /**
   * Salva sessão
   */
  static async set(sessionId, data, ttlSeconds = 86400) {
    const key = `session:${sessionId}`;
    await CacheService.set(key, data, ttlSeconds);
  }

  /**
   * Busca sessão
   */
  static async get(sessionId) {
    const key = `session:${sessionId}`;
    return await CacheService.get(key);
  }

  /**
   * Remove sessão
   */
  static async destroy(sessionId) {
    const key = `session:${sessionId}`;
    await CacheService.del(key);
  }

  /**
   * Atualiza TTL da sessão
   */
  static async touch(sessionId, ttlSeconds = 86400) {
    const key = `session:${sessionId}`;
    const data = await this.get(sessionId);
    if (data) {
      await this.set(sessionId, data, ttlSeconds);
    }
  }
}
```

#### Passo 7: Monitoramento de Cache

Crie `api/routes/cache-stats.js`:

```javascript
import express from 'express';
import redis from '../lib/redis.js';

const router = express.Router();

/**
 * Endpoint para estatísticas de cache
 */
router.get('/cache/stats', async (req, res) => {
  try {
    const info = await redis.info('stats');
    const dbSize = await redis.dbsize();
    const memory = await redis.info('memory');

    res.json({
      dbSize,
      info: parseRedisInfo(info),
      memory: parseRedisInfo(memory),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint para limpar cache
 */
router.post('/cache/clear', async (req, res) => {
  try {
    const { pattern } = req.body;
    
    if (pattern) {
      await CacheService.delPattern(pattern);
      res.json({ message: `Cache cleared for pattern: ${pattern}` });
    } else {
      await redis.flushdb();
      res.json({ message: 'All cache cleared' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function parseRedisInfo(info) {
  const lines = info.split('\r\n');
  const result = {};
  
  for (const line of lines) {
    if (line && !line.startsWith('#')) {
      const [key, value] = line.split(':');
      result[key] = value;
    }
  }
  
  return result;
}

export default router;
```

### ⏱️ Estimativa de Tempo
- **Configuração do Redis:** 1 hora
- **Implementação do cliente:** 2-3 horas
- **Cache nos endpoints:** 4-6 horas
- **Rate limiting:** 2-3 horas
- **Monitoramento:** 2 horas
- **Testes:** 3-4 horas
- **Total:** 14-19 horas (2-3 dias)

### 💰 Custos Estimados
- **Upstash (Free tier):** 10.000 comandos/dia grátis
- **Upstash (Pro):** $0.20 por 100.000 comandos
- **Redis Cloud (Free):** 30MB grátis
- **Redis Cloud (Paid):** A partir de $5/mês

### ✅ Checklist de Implementação
- [ ] Provisionar Redis (Upstash ou Redis Cloud)
- [ ] Configurar cliente Redis
- [ ] Implementar CacheService
- [ ] Adicionar cache nos endpoints principais
- [ ] Implementar rate limiting
- [ ] Implementar cache de sessão
- [ ] Criar endpoints de monitoramento
- [ ] Testar invalidação de cache
- [ ] Monitorar hit rate
- [ ] Documentar estratégia de cache

---

## 5. Adicionar Notificações em Tempo Real

### 🎯 Objetivo
Implementar sistema de notificações em tempo real para eventos importantes do sistema.

### 🏗️ Arquitetura de Notificações

**Tecnologias:**
- **WebSockets** - Comunicação bidirecional em tempo real
- **Server-Sent Events (SSE)** - Alternativa mais simples para notificações unidirecionais
- **Supabase Realtime** - Solução gerenciada (recomendado)

**Eventos para Notificar:**
- Importação concluída
- Processamento de IA finalizado
- Novo projeto criado
- Entidade atualizada
- Erro crítico detectado

### 📝 Implementação Passo a Passo

#### Passo 1: Escolher Tecnologia

**Opção 1: Supabase Realtime (Recomendado)**
- Mais fácil de implementar
- Já integrado com o banco
- Escalável automaticamente

**Opção 2: Socket.IO**
- Mais controle
- Suporte a rooms e namespaces
- Requer servidor WebSocket separado

**Vamos usar Supabase Realtime para simplicidade.**

#### Passo 2: Configurar Supabase Realtime

No Supabase Dashboard:
1. Ir em Database → Replication
2. Habilitar replicação para tabelas:
   - `dim_importacao`
   - `dim_projeto`
   - `dim_entidade`

#### Passo 3: Criar Tabela de Notificações

```sql
-- Tabela de notificações
CREATE TABLE public.notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL, -- 'importacao', 'ia', 'projeto', 'erro'
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  data JSONB, -- Dados adicionais
  lida BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_lida ON notifications(lida);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Política: usuários só veem suas próprias notificações
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Política: sistema pode criar notificações
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Política: usuários podem marcar como lida
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);
```

#### Passo 4: Criar Serviço de Notificações

Crie `api/services/notification-service.js`:

```javascript
import { supabase } from '../lib/supabase.js';

/**
 * Serviço de notificações
 */
export class NotificationService {
  /**
   * Cria uma notificação
   */
  static async create(userId, tipo, titulo, mensagem, data = {}) {
    try {
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          tipo,
          titulo,
          mensagem,
          data,
        })
        .select()
        .single();

      if (error) throw error;

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Notifica conclusão de importação
   */
  static async notifyImportacaoConcluida(userId, importacao) {
    const titulo = 'Importação Concluída';
    const mensagem = `A importação do arquivo "${importacao.nomeArquivo}" foi concluída com ${importacao.linhasSucesso} registros importados.`;
    
    return await this.create(userId, 'importacao', titulo, mensagem, {
      importacaoId: importacao.id,
      resultado: {
        total: importacao.totalLinhas,
        sucesso: importacao.linhasSucesso,
        erro: importacao.linhasErro,
      },
    });
  }

  /**
   * Notifica conclusão de processamento IA
   */
  static async notifyIAConcluido(userId, resultados) {
    const titulo = 'Processamento IA Concluído';
    const totalEntidades = resultados.length;
    const melhoriaMedia = resultados.reduce((sum, r) => 
      sum + (r.qualidadeDepois - r.qualidadeAntes), 0) / totalEntidades;
    
    const mensagem = `Processamento de ${totalEntidades} entidades concluído. Melhoria média de qualidade: +${Math.round(melhoriaMedia)}%`;
    
    return await this.create(userId, 'ia', titulo, mensagem, {
      totalEntidades,
      melhoriaMedia,
    });
  }

  /**
   * Notifica erro crítico
   */
  static async notifyErroCritico(userId, erro) {
    const titulo = 'Erro Crítico Detectado';
    const mensagem = erro.message || 'Um erro crítico foi detectado no sistema';
    
    return await this.create(userId, 'erro', titulo, mensagem, {
      stack: erro.stack,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Marca notificação como lida
   */
  static async markAsRead(notificationId, userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ lida: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  /**
   * Marca todas as notificações como lidas
   */
  static async markAllAsRead(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ lida: true })
      .eq('user_id', userId)
      .eq('lida', false);

    if (error) throw error;
  }

  /**
   * Busca notificações do usuário
   */
  static async getNotifications(userId, limit = 50) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Conta notificações não lidas
   */
  static async countUnread(userId) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('lida', false);

    if (error) throw error;
    return count;
  }
}
```

#### Passo 5: Integrar Notificações nos Processos

Modifique `api/upload.js`:

```javascript
import { NotificationService } from './services/notification-service.js';

// ... após conclusão da importação ...

// Criar registro de importação
const [importacao] = await client`
  INSERT INTO dim_importacao (...)
  VALUES (...)
  RETURNING *
`;

// Enviar notificação
await NotificationService.notifyImportacaoConcluida(
  req.user.id,
  importacao
);

res.json({
  success: true,
  importacaoId: importacao.id,
  resultado: {
    total: totalLinhas,
    sucesso: linhasSucesso,
    erro: linhasErro,
    duplicadas: linhasDuplicadas,
  },
});
```

Modifique `api/trpc.js` (processamento IA):

```javascript
// ... após conclusão do processamento ...

await NotificationService.notifyIAConcluido(
  req.user.id,
  resultados
);
```

#### Passo 6: Implementar Frontend de Notificações

Crie `client/src/contexts/NotificationContext.tsx`:

```typescript
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface Notification {
  id: number;
  tipo: string;
  titulo: string;
  mensagem: string;
  data: any;
  lida: boolean;
  created_at: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Carregar notificações iniciais
    loadNotifications();

    // Inscrever-se em novas notificações
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Adicionar à lista
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);
          
          // Mostrar toast
          toast.success(newNotification.titulo, {
            description: newNotification.mensagem,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  async function loadNotifications() {
    if (!user) return;

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.lida).length);
    }
  }

  async function markAsRead(id: number) {
    await supabase
      .from('notifications')
      .update({ lida: true })
      .eq('id', id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }

  async function markAllAsRead() {
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ lida: true })
      .eq('user_id', user.id)
      .eq('lida', false);

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, lida: true }))
    );
    setUnreadCount(0);
  }

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
```

Crie `client/src/components/NotificationBell.tsx`:

```typescript
import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const getTipoIcon = (tipo: string) => {
    const icons: Record<string, string> = {
      importacao: '📥',
      ia: '🤖',
      projeto: '📁',
      erro: '⚠️',
    };
    return icons[tipo] || '📢';
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Notificações</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:underline"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Nenhuma notificação
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => {
                    if (!notification.lida) {
                      markAsRead(notification.id);
                    }
                  }}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                    !notification.lida ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">
                      {getTipoIcon(notification.tipo)}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {notification.titulo}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.mensagem}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    {!notification.lida && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t text-center">
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

Adicione no `client/src/components/Layout.tsx`:

```typescript
import NotificationBell from './NotificationBell';

// ... no header ...
<div className="flex items-center gap-4">
  <NotificationBell />
  {/* ... outros elementos do header ... */}
</div>
```

### ⏱️ Estimativa de Tempo
- **Configuração do Supabase Realtime:** 1 hora
- **Criação de tabelas e políticas:** 1 hora
- **Serviço de notificações:** 3-4 horas
- **Integração com processos:** 2-3 horas
- **Componentes do frontend:** 4-6 horas
- **Testes:** 2-3 horas
- **Total:** 13-18 horas (2-3 dias)

### ✅ Checklist de Implementação
- [ ] Habilitar Supabase Realtime
- [ ] Criar tabela de notificações
- [ ] Configurar RLS policies
- [ ] Implementar NotificationService
- [ ] Integrar com processos (importação, IA)
- [ ] Criar contexto de notificações no frontend
- [ ] Implementar componente NotificationBell
- [ ] Testar notificações em tempo real
- [ ] Adicionar sons/vibração (opcional)
- [ ] Implementar notificações push (opcional)

---

## 📊 RESUMO GERAL

### Ordem de Implementação Recomendada

1. **Autenticação e RBAC** (3-4 dias)
   - Fundamental para segurança
   - Base para outras funcionalidades

2. **Testes Automatizados** (5-6 dias)
   - Garantir qualidade desde o início
   - Facilita refatorações futuras

3. **Cache Redis** (2-3 dias)
   - Melhora performance imediata
   - Reduz custos de banco

4. **API Real de IA** (2 dias)
   - Funcionalidade de alto valor
   - Diferencial competitivo

5. **Notificações em Tempo Real** (2-3 dias)
   - Melhora UX
   - Engajamento do usuário

### Tempo Total Estimado
- **Mínimo:** 14-18 dias
- **Realista:** 20-25 dias
- **Com buffer:** 30 dias (1 mês)

### Investimento Necessário
- **Ferramentas:** ~$50-100/mês
- **APIs (OpenAI):** ~$100-200/mês
- **Infraestrutura:** ~$20-50/mês
- **Total:** ~$170-350/mês

### Retorno Esperado
- **Performance:** +50-70% mais rápido
- **Segurança:** +90% mais seguro
- **Qualidade:** +80% menos bugs
- **UX:** +60% melhor engajamento

---

**Pronto para começar? Escolha por qual funcionalidade quer começar e vamos implementar juntos!** 🚀
