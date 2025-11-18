'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Rocket, Building2, Users, LogOut, Zap, Github, Lightbulb, Briefcase, Search, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DeskLayoutProps {
  children: React.ReactNode;
}

// X (Twitter) Icon Component
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export default function DeskLayout({ children }: DeskLayoutProps) {
  const pathname = usePathname();

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  const navItems = [
    { href: '/desk/overview', label: 'Overview', icon: Search, matchExact: false },
    { href: '/desk/signals', label: 'All Signals', icon: Home, matchExact: true },
    { href: '/desk/companies', label: 'Companies', icon: Building2, matchExact: true },
    { href: '/desk/people', label: 'People', icon: Users, matchExact: true },
    { href: '/desk/producthunt', label: 'Product Hunt', icon: Rocket, matchExact: true },
    { href: '/desk/github', label: 'GitHub Trending', icon: Github, matchExact: true },
    { href: '/desk/twitter', label: 'X (Twitter)', icon: XIcon, matchExact: true },
    { href: '/desk/hackernews', label: 'Hacker News', icon: Zap, matchExact: true },
    { href: '/desk/yc', label: 'Y Combinator', icon: Lightbulb, matchExact: true },
    { href: '/desk/jobs', label: 'High Signal Jobs', icon: Briefcase, matchExact: true },
    { href: '/desk/reddit', label: 'Reddit Signals', icon: MessageSquare, matchExact: true },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 fixed h-full flex flex-col">
        <div className="p-6 border-b border-neutral-100">
          <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">FounderSignal</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Intelligence Desk</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Handle /desk redirecting to /desk/overview
            const isActive = pathname === item.href || 
                            (item.href === '/desk/overview' && pathname === '/desk');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-neutral-100">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1">
        {children}
      </main>
    </div>
  );
}
