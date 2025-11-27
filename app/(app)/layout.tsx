'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ProjectProvider } from '@/lib/contexts/ProjectContext';
import dynamic from 'next/dynamic';

const Sidebar = dynamic(() => import('@/components/Sidebar'), { ssr: false });
const Header = dynamic(() => import('@/components/Header'), { ssr: false });
const GlobalSearch = dynamic(() => import('@/components/GlobalSearch'), { ssr: false });
const GlobalShortcuts = dynamic(() => import('@/components/GlobalShortcuts'), { ssr: false });
const NotificationBell = dynamic(() => import('@/components/NotificationBell'), { ssr: false });
const ErrorBoundary = dynamic(() => import('@/components/ErrorBoundary'), { ssr: false });
const ThemeToggle = dynamic(() => import('@/components/ThemeToggle'), { ssr: false });
const CompactModeToggle = dynamic(() => import('@/components/CompactModeToggle'), { ssr: false });
const DynamicBreadcrumbs = dynamic(() => import('@/components/DynamicBreadcrumbs'), { ssr: false });
const OnboardingTour = dynamic(() => import('@/components/OnboardingTour'), { ssr: false });
const ContextualTour = dynamic(() => import('@/components/ContextualTour'), { ssr: false });
const DraftRecoveryModal = dynamic(() => import('@/components/DraftRecoveryModal'), { ssr: false });

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
      } else {
        // Verificar se é primeira visita para mostrar onboarding
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
        if (!hasSeenOnboarding) {
          setShowOnboarding(true);
        }
      }
    };

    checkAuth();

    // Atalho global para busca (Ctrl/Cmd + K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowGlobalSearch(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  return (
    <ErrorBoundary>
      <ProjectProvider>
        <GlobalShortcuts />
        <DraftRecoveryModal />
        
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          
          <div className="flex-1 flex flex-col">
            <Header>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowGlobalSearch(true)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600 flex items-center gap-2"
                >
                  <span>Buscar...</span>
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">⌘K</kbd>
                </button>
                <NotificationBell />
                <CompactModeToggle />
                <ThemeToggle />
              </div>
            </Header>
            
            <div className="px-8 py-4 bg-white border-b border-gray-200">
              <DynamicBreadcrumbs />
            </div>

            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </div>

        {/* Modais e Overlays Globais */}
        {showGlobalSearch && (
          <GlobalSearch 
            isOpen={showGlobalSearch} 
            onClose={() => setShowGlobalSearch(false)} 
          />
        )}

        {showOnboarding && (
          <OnboardingTour onComplete={handleOnboardingComplete} />
        )}

        <ContextualTour />
      </ProjectProvider>
    </ErrorBoundary>
  );
}
