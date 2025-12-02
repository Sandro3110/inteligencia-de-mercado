import { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Eye, EyeOff, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface Role {
  id: number;
  nome: string;
  descricao: string;
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  role_id: number;
  role_nome: string;
  role_descricao: string;
  created_at: string;
  ultimo_acesso: string | null;
}

export default function GestaoUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  
  // Form state
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [roleId, setRoleId] = useState<number>(4);
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const token = localStorage.getItem('token');
      
      // Carregar usuários
      const resUsuarios = await fetch('/api/usuarios', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const dataUsuarios = await resUsuarios.json();
      
      if (dataUsuarios.success) {
        setUsuarios(dataUsuarios.usuarios);
      }

      // Carregar roles
      const resRoles = await fetch('/api/roles');
      const dataRoles = await resRoles.json();
      
      if (dataRoles.success) {
        setRoles(dataRoles.roles);
      }

    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setCarregando(false);
    }
  }

  function abrirModalNovo() {
    setUsuarioEditando(null);
    setNome('');
    setEmail('');
    setSenha('');
    setRoleId(4);
    setAtivo(true);
    setModalAberto(true);
  }

  function abrirModalEditar(usuario: Usuario) {
    setUsuarioEditando(usuario);
    setNome(usuario.nome);
    setEmail(usuario.email);
    setSenha('');
    setRoleId(usuario.role_id);
    setAtivo(usuario.ativo);
    setModalAberto(true);
  }

  async function salvarUsuario(e: React.FormEvent) {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      
      if (usuarioEditando) {
        // Atualizar
        const response = await fetch('/api/usuarios', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: usuarioEditando.id,
            nome,
            email,
            roleId,
            ativo,
            ...(senha && { senha }),
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error);
        }

        toast.success('Usuário atualizado com sucesso!');
      } else {
        // Criar
        const response = await fetch('/api/usuarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ nome, email, senha, roleId }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error);
        }

        toast.success('Usuário criado com sucesso!');
      }

      setModalAberto(false);
      carregarDados();

    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar usuário');
    }
  }

  async function excluirUsuario(id: string, nome: string) {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${nome}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/usuarios?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success('Usuário excluído com sucesso!');
      carregarDados();

    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir usuário');
    }
  }

  function getRoleBadgeColor(roleName: string) {
    const colors: Record<string, string> = {
      administrador: 'bg-red-100 text-red-700',
      gerente: 'bg-blue-100 text-blue-700',
      analista: 'bg-green-100 text-green-700',
      visualizador: 'bg-gray-100 text-gray-700',
    };
    return colors[roleName] || 'bg-gray-100 text-gray-700';
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Gestão de Usuários
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie usuários e permissões do sistema
          </p>
        </div>
        <button
          onClick={abrirModalNovo}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Novo Usuário
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Nome
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Email
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Papel
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Último Acesso
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{usuario.nome}</div>
                </td>
                <td className="px-6 py-4 text-gray-600">{usuario.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(usuario.role_nome)}`}
                  >
                    <Shield className="w-3 h-3" />
                    {usuario.role_nome}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      usuario.ativo
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {usuario.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {usuario.ultimo_acesso
                    ? new Date(usuario.ultimo_acesso).toLocaleString('pt-BR')
                    : 'Nunca'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => abrirModalEditar(usuario)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => excluirUsuario(usuario.id, usuario.nome)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usuarios.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nenhum usuário encontrado
          </div>
        )}
      </div>

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {usuarioEditando ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>

            <form onSubmit={salvarUsuario} className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha {usuarioEditando && '(deixe em branco para não alterar)'}
                </label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={!usuarioEditando}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Papel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Papel *
                </label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.nome} - {role.descricao}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ativo */}
              {usuarioEditando && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={ativo}
                    onChange={(e) => setAtivo(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="ativo" className="text-sm font-medium text-gray-700">
                    Usuário ativo
                  </label>
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
