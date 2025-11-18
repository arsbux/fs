'use client';

import { useEffect, useState } from 'react';
import { Signal } from '@/types';
import Link from 'next/link';
import { Trash2, CheckCircle, Rocket, Building2, BarChart3, Plus, Zap, Github, Lightbulb, Users, Briefcase } from 'lucide-react';

export default function AdminPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSignals();
  }, []);

  async function loadSignals() {
    const res = await fetch('/api/signals');
    const data = await res.json();
    setSignals(data);
    setLoading(false);
  }

  async function deleteSignal(id: string) {
    if (!confirm('Delete this signal?')) return;
    
    await fetch(`/api/signals/${id}`, { method: 'DELETE' });
    setSignals(signals.filter(s => s.id !== id));
  }

  async function publishSignal(id: string) {
    await fetch(`/api/signals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'published', published_at: new Date().toISOString() }),
    });
    
    loadSignals();
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 tracking-tight mb-1">Admin Dashboard</h1>
              <p className="text-neutral-600 text-sm">Manage signals and companies</p>
            </div>
            <Link 
              href="/admin/signals/new" 
              className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-neutral-800 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Signal
            </Link>
          </div>
          
          <div className="flex gap-3">
            <Link 
              href="/admin/producthunt" 
              className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-100 transition-all border border-orange-200"
            >
              <Rocket className="w-4 h-4" />
              Product Hunt
            </Link>
            <Link 
              href="/admin/hackernews" 
              className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-100 transition-all border border-amber-200"
            >
              <Zap className="w-4 h-4" />
              Hacker News
            </Link>
            <Link 
              href="/admin/github" 
              className="flex items-center gap-2 bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 transition-all border border-slate-200"
            >
              <Github className="w-4 h-4" />
              GitHub
            </Link>
            <Link 
              href="/admin/yc" 
              className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-100 transition-all border border-orange-200"
            >
              <Lightbulb className="w-4 h-4" />
              Y Combinator
            </Link>
            <Link 
              href="/admin/companies" 
              className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-all border border-blue-200"
            >
              <Building2 className="w-4 h-4" />
              Companies
            </Link>
            <Link 
              href="/admin/people" 
              className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-100 transition-all border border-purple-200"
            >
              <Users className="w-4 h-4" />
              People
            </Link>
            <Link 
              href="/admin/jobs" 
              className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-all border border-green-200"
            >
              <Briefcase className="w-4 h-4" />
              Jobs
            </Link>
            <Link 
              href="/admin/metrics" 
              className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-100 transition-all border border-purple-200"
            >
              <BarChart3 className="w-4 h-4" />
              Metrics
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-neutral-400">Loading...</div>
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Signal</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-100">
                {signals.map((signal) => (
                  <tr key={signal.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-neutral-900">{signal.headline}</div>
                      <div className="text-xs text-neutral-500 mt-0.5">{signal.signal_type.replace('_', ' ')}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700">{signal.company_name}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-neutral-900">{signal.score}</span>
                      <span className="text-xs text-neutral-500">/10</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${
                        signal.status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        signal.status === 'draft' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-neutral-100 text-neutral-600 border border-neutral-200'
                      }`}>
                        {signal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {signal.status === 'draft' && (
                          <button 
                            onClick={() => publishSignal(signal.id)}
                            className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Publish
                          </button>
                        )}
                        <button 
                          onClick={() => deleteSignal(signal.id)}
                          className="flex items-center gap-1.5 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
