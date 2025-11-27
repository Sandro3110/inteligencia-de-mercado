'use client';

import { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

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
      alert('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    console.log('🔵 [handleApprove] Iniciando aprovação do usuário:', userId);

    if (!confirm('Tem certeza que deseja aprovar este usuário?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST',
      });

      console.log('🔵 [handleApprove] Status da resposta:', response.status);

      const data = await response.json();
      console.log('🔵 [handleApprove] Dados da resposta:', data);

      if (response.ok) {
        alert('✅ Usuário aprovado com sucesso!');
        console.log('✅ [handleApprove] Usuário aprovado com sucesso');
        fetchUsers();
      } else {
        console.error('❌ [handleApprove] Erro:', data.error);
        alert('❌ ' + (data.error || 'Erro ao aprovar usuário'));
      }
    } catch (error) {
      console.error('❌ [handleApprove] Exceção:', error);
      alert('❌ Erro ao aprovar usuário');
    }
  };

  const handleReject = async (userId: string) => {
    console.log('🔴 [handleReject] Iniciando rejeição do usuário:', userId);

    if (!confirm('Tem certeza que deseja rejeitar este usuário?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/reject`, {
        method: 'POST',
      });

      console.log('🔴 [handleReject] Status da resposta:', response.status);

      const data = await response.json();
      console.log('🔴 [handleReject] Dados da resposta:', data);

      if (response.ok) {
        alert('✅ Usuário rejeitado');
        console.log('✅ [handleReject] Usuário rejeitado com sucesso');
        fetchUsers();
      } else {
        console.error('❌ [handleReject] Erro:', data.error);
        alert('❌ ' + (data.error || 'Erro ao rejeitar usuário'));
      }
    } catch (error) {
      console.error('❌ [handleReject] Exceção:', error);
      alert('❌ Erro ao rejeitar usuário');
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

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-block',
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px',
          }}
        />
        <p style={{ color: '#6b7280' }}>Carregando usuários...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const currentUsers =
    activeTab === 'pending'
      ? pendingUsers
      : activeTab === 'approved'
        ? approvedUsers
        : rejectedUsers;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px' }}>
          Administração de Usuários
        </h1>
        <p style={{ color: '#6b7280' }}>Gerencie cadastros, aprovações e permissões de usuários</p>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Pendentes</span>
            <Clock size={16} color="#eab308" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{pendingUsers.length}</div>
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>Aguardando aprovação</p>
        </div>

        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Aprovados</span>
            <UserCheck size={16} color="#22c55e" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{approvedUsers.length}</div>
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>Com acesso ativo</p>
        </div>

        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Total</span>
            <Users size={16} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{users.length}</div>
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>Todos os usuários</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '32px' }}>
          <button
            onClick={() => setActiveTab('pending')}
            style={{
              padding: '12px 8px',
              borderBottom: activeTab === 'pending' ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === 'pending' ? '#3b82f6' : '#6b7280',
              fontWeight: activeTab === 'pending' ? '600' : '500',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            <Clock
              size={16}
              style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}
            />
            Pendentes ({pendingUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            style={{
              padding: '12px 8px',
              borderBottom:
                activeTab === 'approved' ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === 'approved' ? '#3b82f6' : '#6b7280',
              fontWeight: activeTab === 'approved' ? '600' : '500',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            <UserCheck
              size={16}
              style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}
            />
            Aprovados ({approvedUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            style={{
              padding: '12px 8px',
              borderBottom:
                activeTab === 'rejected' ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === 'rejected' ? '#3b82f6' : '#6b7280',
              fontWeight: activeTab === 'rejected' ? '600' : '500',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            <UserX
              size={16}
              style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}
            />
            Rejeitados ({rejectedUsers.length})
          </button>
        </div>
      </div>

      {/* User Cards */}
      {currentUsers.length === 0 ? (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '64px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          {activeTab === 'pending' && (
            <Clock size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
          )}
          {activeTab === 'approved' && (
            <UserCheck size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
          )}
          {activeTab === 'rejected' && (
            <UserX size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
          )}
          <p style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>
            Nenhum usuário{' '}
            {activeTab === 'pending'
              ? 'pendente'
              : activeTab === 'approved'
                ? 'aprovado'
                : 'rejeitado'}
          </p>
          <p style={{ fontSize: '14px', color: '#9ca3af' }}>
            {activeTab === 'pending' && 'Todos os cadastros foram processados'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {currentUsers.map((user) => (
            <div
              key={user.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              {/* User Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                    {user.nome}
                  </h3>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}
                  >
                    <Mail size={16} />
                    <span style={{ fontSize: '14px' }}>{user.email}</span>
                  </div>
                </div>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor:
                      user.ativo === 1 ? '#dcfce7' : user.ativo === 0 ? '#fef3c7' : '#fee2e2',
                    color: user.ativo === 1 ? '#166534' : user.ativo === 0 ? '#854d0e' : '#991b1b',
                  }}
                >
                  {user.ativo === 1 ? 'Aprovado' : user.ativo === 0 ? 'Pendente' : 'Rejeitado'}
                </span>
              </div>

              {/* User Info Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                >
                  <Building size={16} color="#9ca3af" />
                  <span style={{ fontWeight: '500' }}>Empresa:</span>
                  <span>{user.empresa}</span>
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                >
                  <Briefcase size={16} color="#9ca3af" />
                  <span style={{ fontWeight: '500' }}>Cargo:</span>
                  <span>{user.cargo}</span>
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                >
                  <Users size={16} color="#9ca3af" />
                  <span style={{ fontWeight: '500' }}>Setor:</span>
                  <span>{user.setor}</span>
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                >
                  <Calendar size={16} color="#9ca3af" />
                  <span style={{ fontWeight: '500' }}>Cadastro:</span>
                  <span>{formatDate(user.created_at)}</span>
                </div>
              </div>

              {/* Approval Info */}
              {user.liberado_em && (
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                  Aprovado em {formatDate(user.liberado_em)}
                  {user.liberado_por && ` por ${user.liberado_por}`}
                </div>
              )}

              {/* Action Buttons */}
              {user.ativo === 0 && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => handleApprove(user.id)}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <CheckCircle size={16} />
                    Aprovar
                  </button>
                  <button
                    onClick={() => handleReject(user.id)}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <XCircle size={16} />
                    Rejeitar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
