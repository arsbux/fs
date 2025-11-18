'use client';

import SignalForm from '@/components/SignalForm';
import { useRouter } from 'next/navigation';

export default function NewSignalPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Add New Signal</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <SignalForm 
          onSuccess={() => router.push('/admin')} 
          onCancel={() => router.push('/admin')}
        />
      </div>
    </div>
  );
}
