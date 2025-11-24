'use client';

/**
 * DashboardLayout - Layout Principal do Dashboard
 * Layout com sidebar redimensionável, autenticação e navegação
 */

import {
  CSSProperties,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { APP_LOGO, APP_TITLE, getLoginUrl } from '@/const';
import { useIsMobile } from '@/hooks/useMobile';
import {
  LayoutDashboard,
  LogOut,
  PanelLeft,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from './ui/button';

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = 'sidebar-width';

const SIDEBAR_WIDTH = {
  DEFAULT: 280,
  MIN: 200,
  MAX: 480,
} as const;

const Z_INDEX = {
  RESIZE_HANDLE: 50,
  MOBILE_HEADER: 40,
} as const;

const LABELS = {
  SIGN_IN: 'Sign in',
  SIGN_OUT: 'Sign out',
  SIGN_IN_MESSAGE: 'Please sign in to continue',
  LOGO_ALT: 'Logo',
} as const;

const RESIZE_CURSOR = 'col-resize';

// ============================================================================
// TYPES
// ============================================================================

interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface DashboardLayoutContentProps {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
}

// ============================================================================
// MENU ITEMS
// ============================================================================

const MENU_ITEMS: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Page 1', path: '/' },
  { icon: Users, label: 'Page 2', path: '/some-path' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getInitialSidebarWidth(): number {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? parseInt(saved, 10) : SIDEBAR_WIDTH.DEFAULT;
}

function saveSidebarWidth(width: number): void {
  localStorage.setItem(STORAGE_KEY, width.toString());
}

function isWithinWidthBounds(width: number): boolean {
  return width >= SIDEBAR_WIDTH.MIN && width <= SIDEBAR_WIDTH.MAX;
}

function getUserInitial(name?: string): string {
  return name?.charAt(0).toUpperCase() || '-';
}

function getSidebarWidthStyle(width: number): CSSProperties {
  return {
    '--sidebar-width': `${width}px`,
  } as CSSProperties;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(getInitialSidebarWidth);
  const { loading, user } = useAuth();

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    saveSidebarWidth(sidebarWidth);
  }, [sidebarWidth]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return <UnauthenticatedView />;
  }

  return (
    <SidebarProvider style={getSidebarWidthStyle(sidebarWidth)}>
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

// ============================================================================
// UNAUTHENTICATED VIEW
// ============================================================================

function UnauthenticatedView() {
  const handleSignIn = useCallback(() => {
    window.location.href = getLoginUrl();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
        <div className="flex flex-col items-center gap-6">
          <div className="relative group">
            <div className="relative">
              <img
                src={APP_LOGO}
                alt={APP_TITLE}
                className="h-20 w-20 rounded-xl object-cover shadow"
              />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">{APP_TITLE}</h1>
            <p className="text-sm text-muted-foreground">
              {LABELS.SIGN_IN_MESSAGE}
            </p>
          </div>
        </div>
        <Button
          onClick={handleSignIn}
          size="lg"
          className="w-full shadow-lg hover:shadow-xl transition-all"
        >
          {LABELS.SIGN_IN}
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// DASHBOARD LAYOUT CONTENT
// ============================================================================

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const activeMenuItem = useMemo(
    () => MENU_ITEMS.find((item) => item.path === location),
    [location]
  );

  const userInitial = useMemo(() => getUserInitial(user?.name), [user?.name]);

  const userName = useMemo(() => user?.name || '-', [user?.name]);

  const userEmail = useMemo(() => user?.email || '-', [user?.email]);

  const mobileHeaderTitle = useMemo(
    () => activeMenuItem?.label ?? APP_TITLE,
    [activeMenuItem]
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft =
        sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;

      if (isWithinWidthBounds(newWidth)) {
        setSidebarWidth(newWidth);
      }
    },
    [isResizing, setSidebarWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleResizeStart = useCallback(() => {
    if (!isCollapsed) {
      setIsResizing(true);
    }
  }, [isCollapsed]);

  const handleMenuItemClick = useCallback(
    (path: string) => {
      setLocation(path);
    },
    [setLocation]
  );

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Reset resizing when sidebar collapses
  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  // Handle mouse events for resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = RESIZE_CURSOR;
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderCollapsedLogo = useCallback(
    () => (
      <div className="relative h-8 w-8 shrink-0 group">
        <img
          src={APP_LOGO}
          className="h-8 w-8 rounded-md object-cover ring-1 ring-border"
          alt={LABELS.LOGO_ALT}
        />
        <button
          onClick={toggleSidebar}
          className="absolute inset-0 flex items-center justify-center bg-accent rounded-md ring-1 ring-border opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <PanelLeft className="h-4 w-4 text-foreground" />
        </button>
      </div>
    ),
    [toggleSidebar]
  );

  const renderExpandedLogo = useCallback(
    () => (
      <>
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={APP_LOGO}
            className="h-8 w-8 rounded-md object-cover ring-1 ring-border shrink-0"
            alt={LABELS.LOGO_ALT}
          />
          <span className="font-semibold tracking-tight truncate">
            {APP_TITLE}
          </span>
        </div>
        <button
          onClick={toggleSidebar}
          className="ml-auto h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
        >
          <PanelLeft className="h-4 w-4 text-muted-foreground" />
        </button>
      </>
    ),
    [toggleSidebar]
  );

  const renderMenuItem = useCallback(
    (item: MenuItem) => {
      const isActive = location === item.path;

      return (
        <SidebarMenuItem key={item.path}>
          <SidebarMenuButton
            isActive={isActive}
            onClick={() => handleMenuItemClick(item.path)}
            tooltip={item.label}
            className="h-10 transition-all font-normal"
          >
            <item.icon
              className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`}
            />
            <span>{item.label}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    },
    [location, handleMenuItemClick]
  );

  const renderUserInfo = useCallback(
    () => (
      <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
        <p className="text-sm font-medium truncate leading-none">{userName}</p>
        <p className="text-xs text-muted-foreground truncate mt-1.5">
          {userEmail}
        </p>
      </div>
    ),
    [userName, userEmail]
  );

  const renderResizeHandle = useCallback(
    () => (
      <div
        className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${
          isCollapsed ? 'hidden' : ''
        }`}
        onMouseDown={handleResizeStart}
        style={{ zIndex: Z_INDEX.RESIZE_HANDLE }}
      />
    ),
    [isCollapsed, handleResizeStart]
  );

  const renderMobileHeader = useCallback(
    () => (
      <div
        className="flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0"
        style={{ zIndex: Z_INDEX.MOBILE_HEADER }}
      >
        <div className="flex items-center gap-2">
          <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1">
              <span className="tracking-tight text-foreground">
                {mobileHeaderTitle}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    [mobileHeaderTitle]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 pl-2 group-data-[collapsible=icon]:px-0 transition-all w-full">
              {isCollapsed ? renderCollapsedLogo() : renderExpandedLogo()}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            <SidebarMenu className="px-2 py-1">
              {MENU_ITEMS.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  {renderUserInfo()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{LABELS.SIGN_OUT}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        {renderResizeHandle()}
      </div>

      <SidebarInset>
        {isMobile && renderMobileHeader()}
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </>
  );
}
