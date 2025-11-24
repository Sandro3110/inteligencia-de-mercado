import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  UserPlus,
  Search,
  CheckCircle,
  XCircle,
  Mail,
  Loader2,
  AlertCircle,
  Shield,
  Eye,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "visualizador">("visualizador");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const utils = trpc.useContext();

  // Query para listar usuários
  const { data: usersData, isLoading } = trpc.users.list.useQuery({
    search: searchTerm || undefined,
    role: roleFilter !== "all" ? (roleFilter as "admin" | "visualizador") : undefined,
    ativo: statusFilter !== "all" ? (statusFilter === "active" ? 1 : 0) : undefined,
  });

  // Query para listar convites
  const { data: invitesData } = trpc.users.listInvites.useQuery();

  // Mutations
  const inviteMutation = trpc.users.invite.useMutation({
    onSuccess: (data) => {
      setSuccess(`Convite enviado para ${data.email}!`);
      setInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole("visualizador");
      utils.users.listInvites.invalidate();
      setTimeout(() => setSuccess(""), 5000);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const approveMutation = trpc.users.approve.useMutation({
    onSuccess: () => {
      setSuccess("Usuário aprovado com sucesso!");
      utils.users.list.invalidate();
      setTimeout(() => setSuccess(""), 5000);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const deactivateMutation = trpc.users.deactivate.useMutation({
    onSuccess: () => {
      setSuccess("Usuário desativado com sucesso!");
      utils.users.list.invalidate();
      setTimeout(() => setSuccess(""), 5000);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const changeRoleMutation = trpc.users.changeRole.useMutation({
    onSuccess: () => {
      setSuccess("Perfil alterado com sucesso!");
      utils.users.list.invalidate();
      setTimeout(() => setSuccess(""), 5000);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const resendInviteMutation = trpc.emailConfig.resendInvite.useMutation({
    onSuccess: () => {
      setSuccess("Convite reenviado com sucesso!");
      setTimeout(() => setSuccess(""), 5000);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleInvite = () => {
    setError("");
    if (!inviteEmail) {
      setError("Por favor, informe o email");
      return;
    }
    inviteMutation.mutate({
      email: inviteEmail,
      perfil: inviteRole,
      expiresInDays: 7,
    });
  };

  const handleApprove = (userId: string) => {
    if (confirm("Tem certeza que deseja aprovar este usuário?")) {
      approveMutation.mutate({ userId });
    }
  };

  const handleDeactivate = (userId: string) => {
    if (confirm("Tem certeza que deseja desativar este usuário?")) {
      deactivateMutation.mutate({ userId });
    }
  };

  const handleChangeRole = (userId: string, newRole: "admin" | "visualizador") => {
    if (confirm(`Tem certeza que deseja alterar o perfil para ${newRole}?`)) {
      changeRoleMutation.mutate({ userId, role: newRole });
    }
  };

  const handleResendInvite = (inviteId: string) => {
    if (confirm("Deseja reenviar este convite?")) {
      resendInviteMutation.mutate({ inviteId });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Usuários</h1>
        <p className="text-gray-600">Gerencie usuários, convites e permissões</p>
      </div>

      {/* Alertas */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Ações e Filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, email ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filtrar por perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os perfis</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="visualizador">Visualizador</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => setInviteDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Convidar Usuário
          </Button>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                </TableCell>
              </TableRow>
            ) : usersData?.users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            ) : (
              usersData?.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.nome}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.empresa}</TableCell>
                  <TableCell>{user.cargo}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className={
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }
                    >
                      {user.role === "admin" ? (
                        <>
                          <Shield className="mr-1 h-3 w-3" />
                          Admin
                        </>
                      ) : (
                        <>
                          <Eye className="mr-1 h-3 w-3" />
                          Visualizador
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.ativo === 1 ? "default" : "secondary"}
                      className={
                        user.ativo === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {user.ativo === 1 ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.ativo === 0 && (
                          <DropdownMenuItem onClick={() => handleApprove(user.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Aprovar
                          </DropdownMenuItem>
                        )}
                        {user.ativo === 1 && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                handleChangeRole(
                                  user.id,
                                  user.role === "admin" ? "visualizador" : "admin"
                                )
                              }
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Alterar para {user.role === "admin" ? "Visualizador" : "Admin"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeactivate(user.id)}
                              className="text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Desativar
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Convites Pendentes */}
      {invitesData && invitesData.invites.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Convites Pendentes ({invitesData.invites.length})
          </h2>
          <div className="space-y-3">
            {invitesData.invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{invite.email}</p>
                    <p className="text-sm text-gray-500">
                      Perfil: {invite.perfil} • Expira em:{" "}
                      {new Date(invite.expiraEm).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {invite.expired ? (
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      Expirado
                    </Badge>
                  ) : (
                    <>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Pendente
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResendInvite(invite.id)}
                        disabled={resendInviteMutation.isPending}
                      >
                        <Mail className="mr-2 h-3 w-3" />
                        Reenviar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialog de Convite */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar Novo Usuário</DialogTitle>
            <DialogDescription>
              Envie um convite por email para um novo usuário se cadastrar no sistema.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="usuario@empresa.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={inviteMutation.isPending}
              />
            </div>

            <div>
              <Label htmlFor="invite-role">Perfil</Label>
              <Select
                value={inviteRole}
                onValueChange={(value) => setInviteRole(value as "admin" | "visualizador")}
                disabled={inviteMutation.isPending}
              >
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visualizador">Visualizador</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {inviteRole === "admin"
                  ? "Acesso total ao sistema, incluindo gestão de usuários"
                  : "Acesso apenas para visualização de dados"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInviteDialogOpen(false)}
              disabled={inviteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleInvite}
              disabled={inviteMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {inviteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Convite
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
