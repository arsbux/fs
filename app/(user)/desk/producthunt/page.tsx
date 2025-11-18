'use client';

import { useEffect, useState } from 'react';
import { Signal } from '@/types';
import SignalCard from '@/components/SignalCard';
import { Rocket, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';

export default function ProductHuntPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    highPriority: 0,
    avgScore: 0,
  });

  useEffect(() => {
    loadSignals();
  }, []);

  async function loadSignals() {
    const res = await fetch('/api/signals');
    const data = await res.json();
    
    const phSignals = data.filter((s: Signal) => 
      s.signal_type === 'product_launch' && s.ph_post_id
    );
    
    setSignals(phSignals);
    
    const highPriority = phSignals.filter((s: Signal) => s.score >= 8).length;
    const avgScore = phSignals.length > 0 
      ? phSignals.reduce((sum: number, s: Signal) => sum + s.score, 0) / phSignals.length 
      : 0;
    
    setStats({
      total: phSignals.length,
      highPriority,
      avgScore: Math.round(avgScore * 10) / 10,
    });
    
    setLoading(false);
  }



  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Product Hunt</h1>
              </div>
              <p className="text-orange-100 text-sm max-w-xl">
                Auto-scored launches with maker contacts and partnership opportunities
              </p>
            </div>

          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Rocket className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-neutral-900">{stats.total}</div>
                <div className="text-xs text-neutral-500">Total Launches</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-neutral-900">{stats.highPriority}</div>
                <div className="text-xs text-neutral-500">High Priority</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-neutral-900">{stats.avgScore}</div>
                <div className="text-xs text-neutral-500">Avg Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-neutral-400">Loading launches...</div>
          </div>
        ) : signals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mb-6">
              <Rocket className="w-10 h-10 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No launches yet</h3>
            <p className="text-neutral-500 text-sm">Check back soon for the latest Product Hunt launches</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {signals
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
