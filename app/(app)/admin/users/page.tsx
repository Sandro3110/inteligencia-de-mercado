'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  Clock,
  Users,
  UserCheck,
  UserX,
  Mail,
  Building,
  Briefcase,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  nome: string;
  empresa: string;
  cargo: string;
  setor: string;
  role: string;
  ativo: number;
  created_at: string;
  liberado_por?: string;
  liberado_em?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    console.log('🔵 [handleApprove] Iniciando aprovação do usuário:', userId);

    try {
      toast.loading('Aprovando usuário...');

      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST',
      });

      console.log('🔵 [handleApprove] Status da resposta:', response.status);

      const data = await response.json();
      console.log('🔵 [handleApprove] Dados da resposta:', data);

      if (response.ok) {
        toast.dismiss();
        toast.success('Usuário aprovado com sucesso!');
        console.log('✅ [handleApprove] Usuário aprovado com sucesso');
        fetchUsers(); // Recarregar lista
      } else {
        toast.dismiss();
        console.error('❌ [handleApprove] Erro:', data.error);
        toast.error(data.error || 'Erro ao aprovar usuário');
      }
    } catch (error) {
      toast.dismiss();
      console.error('❌ [handleApprove] Exceção:', error);
      toast.error('Erro ao aprovar usuário');
    }
  };

  const handleReject = async (userId: string) => {
    console.log('🔴 [handleReject] Iniciando rejeição do usuário:', userId);

    try {
      toast.loading('Rejeitando usuário...');

      const response = await fetch(`/api/admin/users/${userId}/reject`, {
        method: 'POST',
      });

      console.log('🔴 [handleReject] Status da resposta:', response.status);

      const data = await response.json();
      console.log('🔴 [handleReject] Dados da resposta:', data);

      if (response.ok) {
        toast.dismiss();
        toast.success('Usuário rejeitado');
        console.log('✅ [handleReject] Usuário rejeitado com sucesso');
        fetchUsers(); // Recarregar lista
      } else {
        toast.dismiss();
        console.error('❌ [handleReject] Erro:', data.error);
        toast.error(data.error || 'Erro ao rejeitar usuário');
      }
    } catch (error) {
      toast.dismiss();
      console.error('❌ [handleReject] Exceção:', error);
      toast.error('Erro ao rejeitar usuário');
    }
  };

  const pendingUsers = users.filter((u) => u.ativo === 0);
  const approvedUsers = users.filter((u) => u.ativo === 1);
  const rejectedUsers = users.filter((u) => u.ativo === -1);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const UserCard = ({ user, showActions = false }: { user: User; showActions?: boolean }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{user.nome}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Mail className="h-4 w-4" />
              {user.email}
            </CardDescription>
          </div>
          <Badge
            variant={user.ativo === 1 ? 'default' : user.ativo === 0 ? 'secondary' : 'destructive'}
          >
            {user.ativo === 1 ? 'Aprovado' : user.ativo === 0 ? 'Pendente' : 'Rejeitado'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Empresa:</span>
            <span>{user.empresa}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Cargo:</span>
            <span>{user.cargo}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Setor:</span>
            <span>{user.setor}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Cadastro:</span>
            <span>{formatDate(user.created_at)}</span>
          </div>
        </div>

        {user.liberado_em && (
          <div className="text-sm text-muted-foreground mb-4">
            Aprovado em {formatDate(user.liberado_em)}
            {user.liberado_por && ` por ${user.liberado_por}`}
          </div>
        )}

        {showActions && (
          <div className="flex gap-2">
            <Button onClick={() => handleApprove(user.id)} className="flex-1" variant="default">
              <CheckCircle className="h-4 w-4 mr-2" />
              Aprovar
            </Button>
            <Button onClick={() => handleReject(user.id)} className="flex-1" variant="destructive">
              <XCircle className="h-4 w-4 mr-2" />
              Rejeitar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando usuários...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Administração de Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie cadastros, aprovações e permissões de usuários
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingUsers.length}</div>
            <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedUsers.length}</div>
            <p className="text-xs text-muted-foreground">Com acesso ativo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Todos os usuários</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pendentes ({pendingUsers.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Aprovados ({approvedUsers.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <UserX className="h-4 w-4" />
            Rejeitados ({rejectedUsers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingUsers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Nenhum usuário pendente</p>
                <p className="text-sm text-muted-foreground">
                  Todos os cadastros foram processados
                </p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {pendingUsers.map((user) => (
                <UserCard key={user.id} user={user} showActions={true} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          {approvedUsers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <UserCheck className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Nenhum usuário aprovado</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {approvedUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {rejectedUsers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <UserX className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Nenhum usuário rejeitado</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {rejectedUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
