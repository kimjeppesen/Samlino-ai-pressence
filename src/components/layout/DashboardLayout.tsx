import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  MessageSquareText,
  Users,
  Lightbulb,
  Settings,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'AI Platforms', href: '/platforms', icon: Layers },
  { name: 'Prompts & Queries', href: '/queries', icon: MessageSquareText },
  { name: 'Competitors', href: '/competitors', icon: Users },
  { name: 'Recommendations', href: '/recommendations', icon: Lightbulb },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">AI</span>
              </div>
              <div>
                <h1 className="font-bold text-sidebar-foreground">AI Visibility</h1>
                <p className="text-xs text-muted-foreground">Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'nav-item group',
                    isActive && 'active'
                  )}
                >
                  <item.icon className={cn(
                    'w-5 h-5 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  )} />
                  <span className="flex-1">{item.name}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-primary" />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="bg-sidebar-accent rounded-xl p-4">
              <p className="text-sm font-medium text-sidebar-foreground">Need help?</p>
              <p className="text-xs text-muted-foreground mt-1">
                Check our docs for tips on improving your AI visibility.
              </p>
              <button className="mt-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                View Documentation →
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex h-full items-center justify-between px-4 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-secondary text-foreground"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Tracking Active
              </div>
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-sm">JD</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
