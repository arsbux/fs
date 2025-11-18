'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ProductHuntPage() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  async function handleSync() {
    setSyncing(true);
    setResult(null);
    
    try {
      const res = await fetch('/api/producthunt/sync', { method: 'POST' });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to sync' });
    }
    
    setSyncing(false);
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    
    try {
      const res = await fetch('/api/producthunt/test');
      const data = await res.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({ error: 'Failed to test connection' });
    }
    
    setTesting(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Product Hunt Integration</h1>
            <p className="text-gray-400">Sync launches and create signals automatically</p>
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
        {/* Test Connection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test API Connection</h2>
          <p className="text-gray-600 mb-4">
            Verify your Product Hunt API token is working correctly.
          </p>
          <button
            onClick={handleTest}
            disabled={testing}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          
          {testResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Sync Launches */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sync Today's Launches</h2>
          <p className="text-gray-600 mb-4">
            Import today's Product Hunt launches as signals. Only launches with score ≥ 6 or matching your watchlist will be imported.
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <p className="text-sm text-blue-900">
              <strong>Auto-scoring:</strong> Launches are scored based on upvotes, comments, and maker reputation.
              High-score launches (≥8) are auto-published and trigger alerts.
            </p>
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
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
                    ✓ Successfully imported {result.imported} new signals
                  </p>
                  {result.signals && result.signals.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {result.signals.map((signal: any) => (
                        <div key={signal.id} className="text-sm bg-white p-3 rounded border border-green-200">
                          <div className="font-medium">{signal.company_name}</div>
                          <div className="text-gray-600">Score: {signal.score}/10 • {signal.ph_votes_count} upvotes</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Clear Old Signals */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Clear Old Signals</h2>
          <p className="text-gray-600 mb-4">
            If you see raw/unprocessed data, clear old Product Hunt signals and re-sync to get AI-processed content.
          </p>
          <button
            onClick={async () => {
              if (!confirm('Clear all Product Hunt signals? This cannot be undone.')) return;
              const res = await fetch('/api/signals/clear-ph', { method: 'POST' });
              const data = await res.json();
              alert(data.message || 'Cleared successfully');
            }}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
          >
            Clear Product Hunt Signals
          </button>
        </div>

        {/* Setup Instructions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Setup Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Go to <a href="https://www.producthunt.com/v2/oauth/applications" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Product Hunt API Dashboard</a></li>
            <li>Find your application and copy the <strong>Developer Token</strong></li>
            <li>Add to your <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file:
              <pre className="bg-gray-100 p-2 rounded mt-2 text-sm">
PRODUCT_HUNT_API_TOKEN=your_developer_token
              </pre>
            </li>
            <li>Restart your dev server</li>
            <li>Click "Test Connection" to verify</li>
            <li>Set up a cron job to run sync daily (or click "Sync Now" manually)</li>
          </ol>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">What Gets Imported</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span><strong>Launch Detection:</strong> All Product Hunt posts from the last 24 hours</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span><strong>Enrichment:</strong> Upvotes, comments, topics, makers with Twitter handles</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span><strong>Smart Scoring:</strong> Auto-calculated based on engagement and maker reputation</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span><strong>Watchlist Matching:</strong> Prioritizes launches matching your companies/tags</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span><strong>Auto-publish:</strong> High-score launches (≥8) are published immediately</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span><strong>Action Templates:</strong> Pre-filled outreach recommendations with maker contacts</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
