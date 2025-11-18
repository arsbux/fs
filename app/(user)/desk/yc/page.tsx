'use client';

import { useEffect, useState } from 'react';
import { Signal } from '@/types';
import SignalCard from '@/components/SignalCard';
import { Rocket, Building2, Users, TrendingUp, Briefcase } from 'lucide-react';

export default function YCPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    hiring: 0,
    recentBatch: 0,
    batches: {} as Record<string, number>,
    verticals: {} as Record<string, number>,
  });

  useEffect(() => {
    loadSignals();
  }, []);

  async function loadSignals() {
    const res = await fetch('/api/signals');
    const data = await res.json();
    
    const ycSignals = data.filter((s: Signal) => s.yc_company_id);
    
    setSignals(ycSignals);
    
    const hiring = ycSignals.filter((s: Signal) => s.yc_is_hiring).length;
    const currentYear = new Date().getFullYear();
    const recentBatch = ycSignals.filter((s: Signal) => 
      s.yc_batch?.includes(currentYear.toString())
    ).length;
    
    // Count batches
    const batches: Record<string, number> = {};
    const verticals: Record<string, number> = {};
    
    ycSignals.forEach((s: Signal) => {
      if (s.yc_batch) {
        batches[s.yc_batch] = (batches[s.yc_batch] || 0) + 1;
      }
      if (s.yc_vertical) {
        verticals[s.yc_vertical] = (verticals[s.yc_vertical] || 0) + 1;
      }
    });
    
    setStats({
      total: ycSignals.length,
      hiring,
      recentBatch,
      batches,
      verticals,
    });
    
    setLoading(false);
  }



  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-br from-orange-600 via-red-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Y Combinator</h1>
              </div>
              <p className="text-orange-100 text-sm max-w-xl">
                New YC companies, funding updates, hiring signals, and market trends
              </p>
            </div>

          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="grid grid-cols-4 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-neutral-900">{stats.total}</div>
                <div className="text-xs text-neutral-500">Total Companies</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-neutral-900">{stats.hiring}</div>
                <div className="text-xs text-neutral-500">Hiring Now</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-neutral-900">{stats.recentBatch}</div>
                <div className="text-xs text-neutral-500">Recent Batch</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-neutral-900">
                  {Object.keys(stats.verticals).length}
                </div>
                <div className="text-xs text-neutral-500">Verticals</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-neutral-400">Loading companies...</div>
          </div>
        ) : signals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mb-6">
              <Rocket className="w-10 h-10 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No companies yet</h3>
            <p className="text-neutral-500 text-sm">Check back soon for the latest YC companies</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Batches */}
            {Object.keys(stats.batches).length > 0 && (
              <div className="bg-white border border-neutral-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Top Batches</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.batches)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 8)
                    .map(([batch, count]) => (
                      <div key={batch} className="px-3 py-1 bg-orange-50 text-orange-700 text-sm rounded-lg">
                        {batch} ({count})
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Top Verticals */}
            {Object.keys(stats.verticals).length > 0 && (
              <div className="bg-white border border-neutral-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Top Verticals</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.verticals)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([vertical, count]) => (
                      <div key={vertical} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-lg">
                        {vertical} ({count})
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Signals Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {signals
                .sort((a, b) => {
                  // Sort by hiring first, then by recent batch, then by score
                  if (a.yc_is_hiring && !b.yc_is_hiring) return -1;
                  if (!a.yc_is_hiring && b.yc_is_hiring) return 1;
                  
                  const currentYear = new Date().getFullYear();
                  const aRecent = a.yc_batch?.includes(currentYear.toString());
                  const bRecent = b.yc_batch?.includes(currentYear.toString());
                  
                  if (aRecent && !bRecent) return -1;
                  if (!aRecent && bRecent) return 1;
                  
                  return (b.score || 0) - (a.score || 0);
                })
                .map((signal) => (
                  <SignalCard key={signal.id} signal={signal} />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}