'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function PendingApprovalPage() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-yellow-100 flex items-center justify-center mb-6">
            <svg className="h-12 w-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
            Aguardando Aprovação
          </h2>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-left mb-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">⏱️ Seu cadastro está em análise</h3>
            <p className="text-sm text-yellow-800 mb-4">
              Sua conta foi criada com sucesso, mas ainda está <strong>pendente de aprovação</strong> por um administrador.
            </p>

            <div className="bg-white rounded-md p-4 mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">📋 O que acontece agora?</h4>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li>Nossa equipe está revisando seu cadastro</li>
                <li>Você receberá um email assim que for aprovado</li>
                <li>Após aprovação, poderá fazer login normalmente</li>
              </ol>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-xs text-blue-800">
                <strong>💡 Dica:</strong> Verifique sua caixa de entrada e spam para não perder o email de aprovação.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Voltar para Login
            </button>
            
            <p className="text-xs text-gray-500">
              Tempo estimado de aprovação: <strong>até 24 horas úteis</strong>
            </p>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              🚀 O que você poderá fazer no IntelMarket:
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
              <div className="bg-gray-50 rounded-md p-3">
                <div className="font-semibold text-gray-900 mb-1">📊 Dashboard</div>
                <div>Métricas em tempo real</div>
              </div>
              <div className="bg-gray-50 rounded-md p-3">
                <div className="font-semibold text-gray-900 mb-1">📂 Projetos</div>
                <div>Gestão completa</div>
              </div>
              <div className="bg-gray-50 rounded-md p-3">
                <div className="font-semibold text-gray-900 mb-1">🗺️ Mapas</div>
                <div>Análise geoespacial</div>
              </div>
              <div className="bg-gray-50 rounded-md p-3">
                <div className="font-semibold text-gray-900 mb-1">👥 Leads</div>
                <div>Gestão de oportunidades</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
