'use client';

import { useEffect, useState } from 'react';
import { Signal } from '@/types';
import SignalCard from '@/components/SignalCard';
import { Sparkles } from 'lucide-react';

export default function SignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    loadSignals();
  }, []);

  async function loadSignals() {
    const res = await fetch('/api/signals');
    const data = await res.json();
    const published = data.filter((s: Signal) => s.status === 'published');
    setSignals(published);
    setLoading(false);
  }

  const highPriority = signals.filter(s => s.score >= 8);
  const mediumPriority = signals.filter(s => s.score >= 6 && s.score < 8);
  const lowPriority = signals.filter(s => s.score < 6);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const filteredSignals = 
    activeTab === 'high' ? highPriority :
    activeTab === 'medium' ? mediumPriority :
    activeTab === 'low' ? lowPriority :
    signals;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-neutral-400" />
            <span className="text-sm text-neutral-500">{today}</span>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-1">All Signals</h1>
          <p className="text-neutral-600">
            {signals.length} signals today
            {highPriority.length > 0 && <span className="text-red-600 font-medium"> · {highPriority.length} high priority</span>}
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              All ({signals.length})
            </button>
            <button
              onClick={() => setActiveTab('high')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'high'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
            >
              High Priority ({highPriority.length})
            </button>
            <button
              onClick={() => setActiveTab('medium')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'medium'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
              }`}
            >
              Medium ({mediumPriority.length})
            </button>
            <button
              onClick={() => setActiveTab('low')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'low'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
              }`}
            >
              Low ({lowPriority.length})
            </button>
          </div>
        </div>
      </header>

      {/* Content - Two Column Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-neutral-400">Loading signals...</div>
          </div>
        ) : filteredSignals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">No signals in this category</h3>
            <p className="text-neutral-500 text-sm">Try a different filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredSignals
              .sort((a, b) => b.score - a.score)
              .map((signal) => (
                <SignalCard key={signal.id} signal={signal} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
