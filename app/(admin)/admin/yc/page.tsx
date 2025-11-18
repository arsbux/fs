'use client';

import { useState } from 'react';
import { Rocket, RefreshCw, Building2, Users, TrendingUp, Briefcase } from 'lucide-react';

export default function AdminYCPage() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleSync() {
    setSyncing(true);
    setResult(null);

    try {
      const res = await fetch('/api/yc/sync', { method: 'POST' });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: 'Failed to sync' });
    }

    setSyncing(false);
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <Rocket className="w-6 h-6 text-orange-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Y Combinator Sync</h1>
            <p className="text-sm text-neutral-500">Import YC companies with AI analysis</p>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Sync Configuration</h2>
          
          <div className="space-y-4 mb-6">
            <div className="p-4 bg-orange-50 rounded-lg">
              <h3 className="text-sm font-semibold text-orange-900 mb-2">What gets synced:</h3>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• New YC companies from recent batches</li>
                <li>• Companies actively hiring (growth signals)</li>
                <li>• Hot verticals (AI, crypto, fintech, climate)</li>
                <li>• Scaling companies (50+ team members)</li>
                <li>• Full AI analysis for signal extraction</li>
                <li>• Automatic founder profile creation/merging</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Signal Categories:</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg">AI Startups</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg">Crypto/Web3</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg">Dev Tools</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg">Fintech</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg">Healthtech</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg">Climate Tech</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg">Marketplaces</span>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="text-sm font-semibold text-green-900 mb-2">Why YC Directory?</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Spot trends before they hit TechCrunch</li>
                <li>• Early partnership opportunities</li>
                <li>• Market direction insights</li>
                <li>• Hiring and growth signals</li>
                <li>• High-quality, vetted startups</li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing YC Directory...' : 'Sync YC Directory'}
          </button>
        </div>

        {result && (
          <div className={`border rounded-xl p-6 ${
            result.success ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              result.success ? 'text-emerald-900' : 'text-red-900'
            }`}>
              {result.success ? '✓ Sync Complete' : '✗ Sync Failed'}
            </h3>

            {result.success ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium text-neutral-600">Imported</span>
                    </div>
                    <div className="text-2xl font-bold text-neutral-900">{result.imported}</div>
                  </div>

                  <div className="p-4 bg-white rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-neutral-600">Skipped</span>
                    </div>
                    <div className="text-2xl font-bold text-neutral-900">{result.skipped}</div>
                  </div>

                  <div className="p-4 bg-white rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Rocket className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-neutral-600">Total Companies</span>
                    </div>
                    <div className="text-2xl font-bold text-neutral-900">{result.total}</div>
                  </div>

                  <div className="p-4 bg-white rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-neutral-600">Filtered</span>
                    </div>
                    <div className="text-2xl font-bold text-neutral-900">{result.filtered}</div>
                  </div>
                </div>

                {result.processingTimeMs && (
                  <div className="p-4 bg-white rounded-lg">
                    <div className="text-sm text-neutral-600 mb-1">Processing Time</div>
                    <div className="text-lg font-semibold text-neutral-900">
                      {(result.processingTimeMs / 1000).toFixed(1)}s
                      <span className="text-sm text-neutral-500 ml-2">
                        ({result.avgTimePerCompany}ms per company)
                      </span>
                    </div>
                  </div>
                )}

                {result.aiEnabled !== undefined && (
                  <div className="p-4 bg-white rounded-lg">
                    <div className="text-sm text-neutral-600 mb-1">AI Analysis</div>
                    <div className={`text-lg font-semibold ${result.aiEnabled ? 'text-green-600' : 'text-yellow-600'}`}>
                      {result.aiEnabled ? '✓ Enabled' : '⚠ Disabled (basic processing)'}
                    </div>
                  </div>
                )}

                {result.errors && result.errors.length > 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="text-sm font-semibold text-amber-900 mb-2">
                      Errors ({result.errors.length})
                    </div>
                    <div className="text-xs text-amber-800 space-y-1 max-h-40 overflow-y-auto">
                      {result.errors.slice(0, 5).map((error: string, i: number) => (
                        <div key={i}>• {error}</div>
                      ))}
                      {result.errors.length > 5 && (
                        <div className="text-amber-600">... and {result.errors.length - 5} more</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-red-800">
                {result.error || 'Unknown error occurred'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}