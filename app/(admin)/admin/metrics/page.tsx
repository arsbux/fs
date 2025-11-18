'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, ThumbsUp, XCircle, BarChart3, Lightbulb, AlertTriangle } from 'lucide-react';

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    const res = await fetch('/api/signals/action');
    const data = await res.json();
    setMetrics(data);
    setLoading(false);
  }

  if (loading) {
    return <div className="p-8">Loading metrics...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Signal Metrics</h1>
            <p className="text-gray-400">Track signal quality and user actions</p>
          </div>
          <Link 
            href="/admin" 
            className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to Admin
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-3xl font-bold text-gray-900">{metrics.total_signals}</div>
                <div className="text-sm text-gray-600">Total Signals</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-3xl font-bold text-gray-900">{metrics.acted}</div>
                <div className="text-sm text-gray-600">Acted On</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <ThumbsUp className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-3xl font-bold text-gray-900">{metrics.useful}</div>
                <div className="text-sm text-gray-600">Marked Useful</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-8 h-8 text-gray-600" />
              <div>
                <div className="text-3xl font-bold text-gray-900">{metrics.ignored}</div>
                <div className="text-sm text-gray-600">Ignored</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Precision Score</h3>
            <div className="text-5xl font-bold text-green-600 mb-2">{metrics.precision}%</div>
            <p className="text-sm text-gray-600">
              Signals marked as acted/useful vs total with actions
            </p>
            <div className="mt-4 text-xs text-gray-500">
              ({metrics.acted + metrics.useful} useful / {metrics.acted + metrics.useful + metrics.ignored} total)
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Avg Score (Acted)</h3>
            <div className="text-5xl font-bold text-blue-600 mb-2">{metrics.avg_score_acted}</div>
            <p className="text-sm text-gray-600">
              Average score of signals users acted on
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Avg Score (Ignored)</h3>
            <div className="text-5xl font-bold text-gray-600 mb-2">{metrics.avg_score_ignored}</div>
            <p className="text-sm text-gray-600">
              Average score of signals users ignored
            </p>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mt-8 rounded">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Insights</h3>
          </div>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
              {metrics.no_action} signals have no user action yet
            </li>
            <li className="flex items-center gap-2">
              {metrics.precision >= 70 ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
              <span>
                {metrics.precision >= 70 ? 'Good' : 'Needs improvement'}: {metrics.precision}% precision (target: 70%+)
              </span>
            </li>
            {metrics.avg_score_acted > metrics.avg_score_ignored && (
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Scoring is working: Acted signals have higher scores than ignored ones</span>
              </li>
            )}
            {metrics.avg_score_acted <= metrics.avg_score_ignored && (
              <li className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Scoring needs tuning: Ignored signals have similar/higher scores than acted ones</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
