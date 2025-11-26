'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ProjectProvider } from '@/lib/contexts/ProjectContext';
// import Sidebar from '@/components/Sidebar';
// import Header from '@/components/Header';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <ProjectProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar temporariamente removido para testes */}
        {/* <Sidebar /> */}
        
        <div className="flex-1 flex flex-col">
          {/* Header temporariamente removido para testes */}
          {/* <Header /> */}
          
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </ProjectProvider>
  );
}
