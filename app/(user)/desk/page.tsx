'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DeskPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to overview page as the default
    router.replace('/desk/overview');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-neutral-400">Loading...</div>
    </div>
  );
}
