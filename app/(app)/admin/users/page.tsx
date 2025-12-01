'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Clock, CheckCircle2, XCircle, Users, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    userId?: string;
    userName?: string;
  }>({ open: false });
  const [rejectReason, setRejectReason] = useState('');

  // Queries
  const { data: stats, refetch: refetchStats } = trpc.users.getStats.useQuery();
  const {
    data: usersData,
    isLoading,
    refetch,
  } = trpc.users.list.useQuery({
    ativo: activeTab === 'pending' ? 0 : activeTab === 'approved' ? 1 : -1,
  });

  // Mutations
  const approveMutation = trpc.users.approve.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetch();
      refetchStats();
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao aprovar usuário');
    },
  });

  const rejectMutation = trpc.users.reject.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setRejectDialog({ open: false });
      setRejectReason('');
      refetch();
      refetchStats();
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao rejeitar usuário');
    },
  });

  const handleApprove = (userId: string, userName: string) => {
    if (confirm(`Tem certeza que deseja aprovar o usuário "${userName}"?`)) {
      approveMutation.mutate({ userId });
    }
  };

  const handleReject = () => {
    if (!rejectDialog.userId) return;
    rejectMutation.mutate({
      userId: rejectDialog.userId,
      motivo: rejectReason.trim() || undefined,
    });
  };

  const filteredUsers = usersData?.users.filter((user) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      user.nome?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.empresa?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Administração de Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie cadastros, aprovações e permissões de usuários
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending || 0}</div>
            <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.approved || 0}</div>
            <p className="text-xs text-muted-foreground">Com acesso ativo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Todos os usuários</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pendentes ({stats?.pending || 0})
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Aprovados ({stats?.approved || 0})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <XCircle className="h-4 w-4" />
              Rejeitados ({stats?.rejected || 0})
            </TabsTrigger>
          </TabsList>

          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'pending' && 'Usuários Pendentes'}
                {activeTab === 'approved' && 'Usuários Aprovados'}
                {activeTab === 'rejected' && 'Usuários Rejeitados'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'pending' && 'Cadastros aguardando aprovação'}
                {activeTab === 'approved' && 'Usuários com acesso liberado'}
                {activeTab === 'rejected' && 'Cadastros que foram rejeitados'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredUsers && filteredUsers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Data</TableHead>
                      {activeTab === 'pending' && <TableHead>Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.nome}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.empresa || '-'}</TableCell>
                        <TableCell>{user.cargo || '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.createdAt
                            ? formatDistanceToNow(new Date(user.createdAt), {
                                addSuffix: true,
                                locale: ptBR,
                              })
                            : '-'}
                        </TableCell>
                        {activeTab === 'pending' && (
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApprove(user.id, user.nome || user.email)}
                                disabled={approveMutation.isPending}
                              >
                                {approveMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Aprovar'
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  setRejectDialog({
                                    open: true,
                                    userId: user.id,
                                    userName: user.nome || user.email,
                                  })
                                }
                                disabled={rejectMutation.isPending}
                              >
                                Rejeitar
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-3 mb-4">
                    {activeTab === 'pending' && <Clock className="h-8 w-8 text-muted-foreground" />}
                    {activeTab === 'approved' && (
                      <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                    )}
                    {activeTab === 'rejected' && (
                      <XCircle className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-1">
                    {activeTab === 'pending' && 'Nenhum usuário pendente'}
                    {activeTab === 'approved' && 'Nenhum usuário aprovado'}
                    {activeTab === 'rejected' && 'Nenhum usuário rejeitado'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {activeTab === 'pending' && 'Todos os cadastros foram processados'}
                    {activeTab === 'approved' && 'Ainda não há usuários com acesso liberado'}
                    {activeTab === 'rejected' && 'Não há cadastros rejeitados'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeitar Cadastro</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a rejeitar o cadastro de <strong>{rejectDialog.userName}</strong>.
              Esta ação enviará um email de notificação ao usuário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Motivo da rejeição (opcional)</label>
            <Textarea
              placeholder="Explique o motivo da rejeição para o usuário..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejeitando...
                </>
              ) : (
                'Confirmar Rejeição'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
