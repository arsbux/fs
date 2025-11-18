'use client';

import { useEffect, useState } from 'react';
import { Signal } from '@/types';
import SignalCard from '@/components/SignalCard';
import { Zap, TrendingUp, AlertCircle, BarChart3, Code, Lightbulb } from 'lucide-react';

export default function HackerNewsPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    highPriority: 0,
    avgScore: 0,
    categories: {} as Record<string, number>,
  });

  useEffect(() => {
    loadSignals();
  }, []);

  async function loadSignals() {
    const res = await fetch('/api/signals');
    const data = await res.json();
    
    const hnSignals = data.filter((s: Signal) => s.hn_story_id);
    
    setSignals(hnSignals);
    
    const highPriority = hnSignals.filter((s: Signal) => s.score >= 8).length;
    const avgScore = hnSignals.length > 0 
      ? hnSignals.reduce((sum: number, s: Signal) => sum + s.score, 0) / hnSignals.length 
      : 0;
    
    // Count categories
    const categories: Record<string, number> = {};
    hnSignals.forEach((s: Signal) => {
      if (s.hn_category) {
        categories[s.hn_category] = (categories[s.hn_category] || 0) + 1;
      }
    });
    
    setStats({
      total: hnSignals.length,
      highPriority,
      avgScore: Math.round(avgScore * 10) / 10,
      categories,
    });
    
    setLoading(false);
  }



  const categoryIcons: Record<string, any> = {
    'tech_release': Code,
    'framework_library': Lightbulb,
    'startup_announcement': TrendingUp,
    'market_shift': BarChart3,
    'industry_pain_point': AlertCircle,
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Hacker News</h1>
              </div>
              <p className="text-orange-100 text-sm max-w-xl">
                High-signal tech intelligence from the world's top developer community
              </p>
            </div>

          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-neutral-900">{stats.total}</div>
                <div className="text-xs text-neutral-500">Total Stories</div>
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

          {/* Categories */}
          {Object.keys(stats.categories).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-neutral-700 mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.categories).map(([category, count]) => {
                  const Icon = categoryIcons[category] || Code;
                  return (
                    <div key={category} className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-lg">
                      <Icon className="w-4 h-4 text-neutral-600" />
                      <span className="text-sm text-neutral-700 capitalize">
                        {category.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-neutral-500 bg-neutral-200 px-1.5 py-0.5 rounded">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-neutral-400">Loading stories...</div>
          </div>
        ) : signals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="w-10 h-10 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No stories yet</h3>
            <p className="text-neutral-500 text-sm">Check back soon for the latest Hacker News signals</p>
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