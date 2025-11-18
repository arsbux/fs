'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HackerNewsAdminPage() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleSync() {
    setSyncing(true);
    setResult(null);
    
    try {
      const res = await fetch('/api/hackernews/sync', { method: 'POST' });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to sync' });
    }
    
    setSyncing(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Hacker News Integration</h1>
            <p className="text-gray-400">Sync top stories and create signals automatically</p>
          </div>
          <Link 
            href="/admin" 
            className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to Admin
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Sync Stories */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sync Top Stories</h2>
          <p className="text-gray-600 mb-4">
            Import today's top 100 Hacker News stories and filter for signal-worthy content using AI analysis.
          </p>
          
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
            <p className="text-sm text-amber-900">
              <strong>AI-Powered Filtering:</strong> Stories are automatically categorized into tech releases, 
              frameworks, startup announcements, market shifts, and industry pain points.
            </p>
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="bg-amber-600 text-white px-6 py-2 rounded hover:bg-amber-700 disabled:opacity-50"
          >
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
          
          {result && (
            <div className={`mt-4 p-4 rounded ${
              result.error ? 'bg-red-50 text-red-900' : 'bg-green-50 text-green-900'
            }`}>
              {result.error ? (
                <p>Error: {result.error}</p>
              ) : (
                <div>
                  <p className="font-semibold mb-2">
                    ✓ Successfully processed {result.filtered} signal-worthy stories
                  </p>
                  <p className="text-sm mb-2">
                    Imported {result.imported} new signals, skipped {result.skipped} existing
                  </p>
                  <p className="text-xs text-green-700">
                    Processing time: {result.processingTimeMs}ms 
                    ({result.avgTimePerStory}ms per story)
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* What Gets Imported */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Signal Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Tech Releases</h3>
              <p className="text-sm text-blue-800">
                New product launches, version releases, open source projects
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Frameworks & Libraries</h3>
              <p className="text-sm text-green-800">
                New development tools, frameworks, APIs, and SDKs
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">Startup Announcements</h3>
              <p className="text-sm text-purple-800">
                YC launches, funding rounds, acquisitions, IPOs
              </p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-2">Market Shifts</h3>
              <p className="text-sm text-orange-800">
                Industry trends, AI developments, blockchain, web3
              </p>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">Industry Pain Points</h3>
              <p className="text-sm text-red-800">
                Developer rants, broken systems, frustrations revealing opportunities
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">General Tech</h3>
              <p className="text-sm text-gray-800">
                Other high-engagement tech discussions and insights
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-amber-600 mr-2">✓</span>
              <span><strong>Fetch Top 100:</strong> Gets the current top stories from HN API</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-600 mr-2">✓</span>
              <span><strong>Smart Filtering:</strong> Filters for signal-worthy content (min 50 points)</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-600 mr-2">✓</span>
              <span><strong>AI Analysis:</strong> Claude analyzes each story for companies, people, insights</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-600 mr-2">✓</span>
              <span><strong>Auto-Categorization:</strong> Assigns signal types based on content</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-600 mr-2">✓</span>
              <span><strong>Scoring:</strong> Combines HN score with AI insights for final rating</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-600 mr-2">✓</span>
              <span><strong>Deduplication:</strong> Skips already imported stories</span>
            </li>
          </ul>
        </div>

        {/* API Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">API Information</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Source:</strong> Hacker News Firebase API
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Endpoint:</strong> https://hacker-news.firebaseio.com/v0/topstories.json
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Rate Limiting:</strong> Built-in delays to respect API limits
            </p>
            <p className="text-sm text-gray-700">
              <strong>No API Key Required:</strong> Free public API, no authentication needed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}