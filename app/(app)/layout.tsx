'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AppProvider } from '@/lib/contexts/AppContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CompactModeProvider } from '@/contexts/CompactModeContext';
import nextDynamic from 'next/dynamic';

const Sidebar = nextDynamic(() => import('@/components/Sidebar'), { ssr: false });
const Header = nextDynamic(() => import('@/components/Header'), { ssr: false });
const GlobalSearch = nextDynamic(() => import('@/components/GlobalSearch'), { ssr: false });
const GlobalShortcuts = nextDynamic(() => import('@/components/GlobalShortcuts'), { ssr: false });
const NotificationBell = nextDynamic(() => import('@/components/NotificationBell'), { ssr: false });
const ErrorBoundary = nextDynamic(() => import('@/components/ErrorBoundary'), { ssr: false });
const ThemeToggle = nextDynamic(() => import('@/components/ThemeToggle'), { ssr: false });
const CompactModeToggle = nextDynamic(() => import('@/components/CompactModeToggle'), { ssr: false });
const DynamicBreadcrumbs = nextDynamic(() => import('@/components/DynamicBreadcrumbs'), { ssr: false });
const OnboardingTour = nextDynamic(() => import('@/components/OnboardingTour'), { ssr: false });
const ContextualTour = nextDynamic(() => import('@/components/ContextualTour'), { ssr: false });
const DraftRecoveryModal = nextDynamic(() => import('@/components/DraftRecoveryModal'), { ssr: false });

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
        return;
      }

      // Verificar se usuário está aprovado
      try {
        const response = await fetch('/api/auth/check-approval');
        const data = await response.json();

        if (!data.approved) {
          // Usuário não aprovado, redirecionar para página de pendência
          router.push('/pending-approval');
          return;
        }

        // Verificar se é primeira visita para mostrar onboarding
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
        if (!hasSeenOnboarding) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Erro ao verificar aprovação:', error);
        router.push('/login');
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
    <ThemeProvider>
      <CompactModeProvider>
        <OnboardingProvider>
          <ErrorBoundary>
            <AppProvider>
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
            </AppProvider>
          </ErrorBoundary>
        </OnboardingProvider>
      </CompactModeProvider>
    </ThemeProvider>
  );
}
