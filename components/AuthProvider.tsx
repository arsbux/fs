'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && !session && pathname !== '/login' && pathname !== '/') {
        router.push('/login');
      }
      if (mounted) {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Only redirect on sign out, not on sign in
      // This prevents auto-redirect when tab regains focus
      if (mounted && event === 'SIGNED_OUT') {
        router.push('/login');
      }
      // Removed SIGNED_IN redirect to prevent unwanted navigation
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Remove pathname and router from dependencies to prevent re-runs

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
