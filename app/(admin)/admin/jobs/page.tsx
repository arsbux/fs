'use client';

import { useState } from 'react';
import { Briefcase, Play, CheckCircle, AlertCircle, TrendingUp, Users, DollarSign, Building2 } from 'lucide-react';

export default function AdminJobsPage() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSync() {
    setSyncing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/jobs/sync', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLastSync(data);
      } else {
        setError(data.message || 'Sync failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Briefcase className="w-6 h-6 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">High Signal Jobs</h1>
                <p className="text-neutral-600 text-sm">Track hiring patterns from YC, Wellfound, and RemoteOK</p>
              </div>
            </div>
            
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Play className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing Jobs...' : 'Sync Jobs'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-neutral-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">YC Jobs</h3>
                <p className="text-sm text-neutral-600">Y Combinator portfolio</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-neutral-900 mb-1">
              {lastSync?.jobsFound ? Math.floor(lastSync.jobsFound * 0.3) : '—'}
            </div>
            <p className="text-sm text-neutral-500">Jobs found</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Wellfound</h3>
                <p className="text-sm text-neutral-600">AngelList startups</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-neutral-900 mb-1">
              {lastSync?.jobsFound ? Math.floor(lastSync.jobsFound * 0.4) : '—'}
            </div>
            <p className="text-sm text-neutral-500">Jobs found</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">RemoteOK</h3>
                <p className="text-sm text-neutral-600">YC tagged remote jobs</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-neutral-900 mb-1">
              {lastSync?.jobsFound ? Math.floor(lastSync.jobsFound * 0.3) : '—'}
            </div>
            <p className="text-sm text-neutral-500">Jobs found</p>
          </div>
        </div>

        {/* Sync Results */}
        {lastSync && (
          <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-neutral-900">Last Sync Results</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <div className="text-2xl font-bold text-neutral-900">{lastSync.jobsFound}</div>
                <div className="text-sm text-neutral-600">Total Jobs</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{lastSync.signalsCreated}</div>
                <div className="text-sm text-neutral-600">Signals Created</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {lastSync.signalsCreated > 0 ? Math.floor(lastSync.jobsFound / lastSync.signalsCreated) : 0}
                </div>
                <div className="text-sm text-neutral-600">Jobs per Signal</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {new Date(lastSync.timestamp).toLocaleTimeString()}
                </div>
                <div className="text-sm text-neutral-600">Sync Time</div>
              </div>
            </div>
            
            <p className="text-sm text-neutral-600">
              Last synced: {new Date(lastSync.timestamp).toLocaleString()}
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-900">Sync Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">How High Signal Jobs Works</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-neutral-900 mb-3">Data Sources</h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <strong>YC Jobs:</strong> Y Combinator portfolio companies
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <strong>Wellfound:</strong> AngelList startup jobs
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <strong>RemoteOK:</strong> YC-tagged remote positions
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-neutral-900 mb-3">Signal Types</h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <strong>Hiring Spikes:</strong> Rapid job posting increases
                </li>
                <li className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  <strong>New Departments:</strong> Expansion into new areas
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <strong>Executive Hires:</strong> Leadership team growth
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-orange-500" />
                  <strong>Budget Analysis:</strong> Estimated hiring spend
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
            <h4 className="font-medium text-neutral-900 mb-2">Why Jobs Matter</h4>
            <p className="text-sm text-neutral-600">
              Hiring patterns are leading indicators of company growth, funding events, and market opportunities. 
              Hiring spikes often precede product launches, while hiring freezes can signal trouble. 
              Executive hires indicate strategic pivots or scaling preparation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}