'use client';

import { useEffect, useState } from 'react';
import { Signal } from '@/types';
import { Briefcase, TrendingUp, Users, Building2, DollarSign, ExternalLink, Filter } from 'lucide-react';
import Link from 'next/link';

export default function JobsPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<'all' | 'hiring_spike' | 'executive_hire' | 'new_department' | 'rapid_expansion'>('all');

  useEffect(() => {
    loadJobSignals();
  }, []);

  async function loadJobSignals() {
    const res = await fetch('/api/signals');
    const data = await res.json();
    
    // Filter for hiring-related signals
    const jobSignals = data.filter((signal: Signal) => 
      signal.signal_type === 'hiring' || 
      signal.tags?.includes('hiring') ||
      signal.tags?.includes('jobs')
    );
    
    setSignals(jobSignals);
    setLoading(false);
  }



  const filteredSignals = signals.filter(signal => {
    if (filter === 'all') return true;
    return signal.tags?.includes(filter);
  });

  const getSignalIcon = (signal: Signal) => {
    if (signal.tags?.includes('rapid_expansion')) return TrendingUp;
    if (signal.tags?.includes('executive_hire')) return Users;
    if (signal.tags?.includes('new_department')) return Building2;
    return Briefcase;
  };

  const getSignalColor = (signal: Signal) => {
    if (signal.tags?.includes('high')) return 'text-green-600 bg-green-50 border-green-200';
    if (signal.tags?.includes('medium')) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">High Signal Jobs</h1>
                <p className="text-neutral-600 text-sm">{filteredSignals.length} hiring signals tracked</p>
              </div>
            </div>
            

          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              All Signals
            </button>
            <button
              onClick={() => setFilter('hiring_spike')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'hiring_spike'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Hiring Spikes
            </button>
            <button
              onClick={() => setFilter('executive_hire')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'executive_hire'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Executive Hires
            </button>
            <button
              onClick={() => setFilter('new_department')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'new_department'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              New Departments
            </button>
            <button
              onClick={() => setFilter('rapid_expansion')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'rapid_expansion'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Rapid Expansion
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-neutral-400">Loading hiring signals...</div>
          </div>
        ) : filteredSignals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">No hiring signals yet</h3>
            <p className="text-neutral-500 text-sm">
              Hiring signals will appear here once job data is synced
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSignals.map((signal) => {
              const Icon = getSignalIcon(signal);
              const colorClass = getSignalColor(signal);
              
              return (
                <Link
                  key={signal.id}
                  href={`/desk/signals/${signal.id}`}
                  className="block bg-white border border-neutral-200 rounded-xl p-6 hover:border-neutral-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-neutral-900 line-clamp-2">
                          {signal.headline}
                        </h3>
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-lg font-bold text-neutral-900">
                            {signal.score}/10
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
                        {signal.summary}
                      </p>
                      
                      {/* Job Details */}
                      {(signal as any).job_count && (
                        <div className="flex items-center gap-4 mb-3 text-sm text-neutral-600">
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            <span>{(signal as any).job_count} jobs</span>
                          </div>
                          {(signal as any).departments && (
                            <div className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              <span>{(signal as any).departments.length} departments</span>
                            </div>
                          )}
                          {(signal as any).total_budget_estimate && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>${((signal as any).total_budget_estimate / 1000).toFixed(0)}K budget</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Tags */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1.5">
                          {signal.tags?.slice(0, 4).map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-md"
                            >
                              {tag.replace('_', ' ')}
                            </span>
                          ))}
                          {signal.tags && signal.tags.length > 4 && (
                            <span className="px-2 py-1 text-neutral-500 text-xs">
                              +{signal.tags.length - 4}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm text-neutral-500">
                          <span>{signal.company_name}</span>
                          <span>•</span>
                          <span>{new Date(signal.created_at).toLocaleDateString()}</span>
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}