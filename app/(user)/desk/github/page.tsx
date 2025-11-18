'use client';

import { useEffect, useState } from 'react';
import { Signal } from '@/types';
import SignalCard from '@/components/SignalCard';
import { Github, Star, GitFork, TrendingUp, Code, Lightbulb, Zap } from 'lucide-react';

export default function GitHubPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    highPriority: 0,
    totalStars: 0,
    languages: {} as Record<string, number>,
  });

  useEffect(() => {
    loadSignals();
  }, []);

  async function loadSignals() {
    const res = await fetch('/api/signals');
    const data = await res.json();
    
    const githubSignals = data.filter((s: Signal) => s.github_repo_url);
    
    setSignals(githubSignals);
    
    const highPriority = githubSignals.filter((s: Signal) => s.score >= 8).length;
    const totalStars = githubSignals.reduce((sum: number, s: Signal) => sum + (s.github_stars || 0), 0);
    
    // Count languages
    const languages: Record<string, number> = {};
    githubSignals.forEach((s: Signal) => {
      if (s.github_language) {
        languages[s.github_language] = (languages[s.github_language] || 0) + 1;
      }
    });
    
    setStats({
      total: githubSignals.length,
      highPriority,
      totalStars,
      languages,
    });
    
    setLoading(false);
  }



  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Github className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">GitHub Trending</h1>
              </div>
              <p className="text-slate-300 text-sm max-w-xl">
                Discover emerging tools, AI models, and libraries before they go mainstream
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
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-neutral-900">{stats.total}</div>
                <div className="text-xs text-neutral-500">Trending Repos</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-neutral-900">
                  {stats.totalStars >= 1000 ? `${(stats.totalStars / 1000).toFixed(1)}k` : stats.totalStars}
                </div>
                <div className="text-xs text-neutral-500">Total Stars</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-neutral-900">{stats.highPriority}</div>
                <div className="text-xs text-neutral-500">High Priority</div>
              </div>
            </div>
          </div>

          {/* Languages */}
          {Object.keys(stats.languages).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-neutral-700 mb-3">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.languages)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 8)
                  .map(([language, count]) => (
                    <div key={language} className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-lg">
                      <Code className="w-4 h-4 text-neutral-600" />
                      <span className="text-sm text-neutral-700 capitalize">{language}</span>
                      <span className="text-xs text-neutral-500 bg-neutral-200 px-1.5 py-0.5 rounded">
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-neutral-400">Loading repos...</div>
          </div>
        ) : signals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-6">
              <Github className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No repos yet</h3>
            <p className="text-neutral-500 text-sm">Check back soon for the latest trending GitHub repositories</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {signals
              .sort((a, b) => (b.github_today_stars || 0) - (a.github_today_stars || 0))
              .map((signal) => (
                <SignalCard key={signal.id} signal={signal} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
