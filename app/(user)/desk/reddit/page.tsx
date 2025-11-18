'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, TrendingUp, AlertCircle, Search as SearchIcon, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Signal {
  id: string;
  headline: string;
  summary: string;
  source_link: string;
  score: number;
  credibility: string;
  tags: string[];
  reddit_subreddit?: string;
  reddit_score?: number;
  reddit_comments?: number;
  published_at: string;
}

export default function RedditPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  async function loadSignals() {
    try {
      const res = await fetch('/api/signals');
      const data = await res.json();
      
      // Filter for Reddit signals only
      const redditSignals = Array.isArray(data)
        ? data.filter((s: Signal) => s.reddit_subreddit)
        : [];
      
      setSignals(redditSignals);
    } catch (error) {
      console.error('Error loading signals:', error);
    } finally {
      setLoading(false);
    }
  }



  useEffect(() => {
    loadSignals();
  }, []);

  const filteredSignals = signals.filter(signal => {
    const matchesFilter = filter === 'all' || signal.tags?.includes(filter);
    const matchesSearch = !searchQuery || 
      signal.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      signal.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      signal.reddit_subreddit?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const signalTypes = [
    { value: 'all', label: 'All Signals', icon: MessageSquare },
    { value: 'pain_point', label: 'Pain Points', icon: AlertCircle },
    { value: 'unmet_need', label: 'Unmet Needs', icon: TrendingUp },
    { value: 'solution_request', label: 'Solution Requests', icon: SearchIcon },
    { value: 'shutdown', label: 'Shutdowns', icon: AlertCircle },
    { value: 'pivot', label: 'Pivots', icon: RefreshCw },
  ];

  const subreddits = ['startups', 'Entrepreneur', 'SaaS', 'sideproject', 'indiehackers', 'consulting', 'marketing', 'ArtificialIntelligence'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-600">Loading Reddit signals...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Reddit Signals</h1>
                <p className="text-neutral-600 text-sm">Pain points & opportunities from founder communities</p>
              </div>
            </div>
            

          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-neutral-900">{signals.length}</div>
              <div className="text-sm text-neutral-600">Total Signals</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">
                {signals.filter(s => s.tags?.includes('pain_point')).length}
              </div>
              <div className="text-sm text-neutral-600">Pain Points</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {signals.filter(s => s.tags?.includes('unmet_need')).length}
              </div>
              <div className="text-sm text-neutral-600">Unmet Needs</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-emerald-600">
                {signals.filter(s => s.score >= 8).length}
              </div>
              <div className="text-sm text-neutral-600">High Priority</div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search Reddit signals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {signalTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setFilter(type.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    filter === type.value
                      ? 'bg-orange-600 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Subreddit Tags */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-neutral-700 mb-3">Tracking Subreddits:</h3>
          <div className="flex flex-wrap gap-2">
            {subreddits.map((sub) => (
              <span
                key={sub}
                className="px-3 py-1.5 bg-orange-50 text-orange-700 text-sm rounded-lg border border-orange-200"
              >
                r/{sub}
              </span>
            ))}
          </div>
        </div>

        {/* Signals Grid */}
        {filteredSignals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <MessageSquare className="w-16 h-16 text-neutral-300 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">
              {searchQuery ? 'No signals found' : 'No Reddit signals yet'}
            </h3>
            <p className="text-neutral-500 text-sm mb-4">
              {searchQuery ? 'Try a different search term' : 'Click "Sync Reddit" to fetch the latest signals'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredSignals.map((signal) => (
              <Link
                key={signal.id}
                href={`/desk/signals/${signal.id}`}
                className="bg-white border border-neutral-200 rounded-xl p-6 hover:border-orange-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                        r/{signal.reddit_subreddit}
                      </span>
                      {signal.tags?.map((tag) => (
                        tag !== 'reddit' && tag !== signal.reddit_subreddit && (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded capitalize"
                          >
                            {tag.replace('_', ' ')}
                          </span>
                        )
                      ))}
                      <div className={`ml-auto px-3 py-1 rounded-lg text-sm font-semibold ${
                        signal.score >= 8 ? 'bg-emerald-100 text-emerald-700' :
                        signal.score >= 6 ? 'bg-amber-100 text-amber-700' :
                        'bg-neutral-100 text-neutral-600'
                      }`}>
                        Score: {signal.score}/10
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      {signal.headline}
                    </h3>
                    
                    <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
                      {signal.summary}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {signal.reddit_score || 0} upvotes
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {signal.reddit_comments || 0} comments
                      </div>
                      <div className="ml-auto">
                        {new Date(signal.published_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
