'use client';

import { useState, useEffect } from 'react';
import { Search, TrendingUp, Building2, User, Zap, ArrowRight, Sparkles, Loader2, Brain, X, Filter, SortDesc, Clock, Star } from 'lucide-react';
import Link from 'next/link';

interface SearchResult {
  id: string;
  type: 'signal' | 'company' | 'person';
  title: string;
  subtitle?: string;
  description?: string;
  score?: number;
  tags?: string[];
  url: string;
}

interface AISearchResponse {
  success: boolean;
  aiPowered: boolean;
  query: string;
  summary: string;
  keyFindings: string[];
  hasResults: boolean;
  results: {
    signals: any[];
    companies: any[];
    people: any[];
  };
  suggestions: string[];
}

export default function OverviewPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [aiSearchResult, setAiSearchResult] = useState<AISearchResponse | null>(null);
  const [showAIResults, setShowAIResults] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'signal' | 'company' | 'person'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'recent' | 'score'>('relevance');
  const [stats, setStats] = useState({
    signals: 0,
    companies: 0,
    people: 0,
  });

  // Load stats on mount
  useEffect(() => {
    async function loadStats() {
      try {
        const [signalsRes, companiesRes, peopleRes] = await Promise.all([
          fetch('/api/signals'),
          fetch('/api/companies'),
          fetch('/api/people'),
        ]);

        const signals = await signalsRes.json();
        const companies = await companiesRes.json();
        const people = await peopleRes.json();

        setStats({
          signals: Array.isArray(signals) ? signals.length : 0,
          companies: Array.isArray(companies) ? companies.length : 0,
          people: Array.isArray(people) ? people.length : 0,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    }

    loadStats();
  }, []);

  // Quick search (as you type)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowAIResults(false);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const query = searchQuery.toLowerCase();
        const results: SearchResult[] = [];

        // Quick search across all data
        const [signalsRes, companiesRes, peopleRes] = await Promise.all([
          fetch('/api/signals'),
          fetch('/api/companies'),
          fetch('/api/people'),
        ]);

        const signals = await signalsRes.json();
        const companies = await companiesRes.json();
        const people = await peopleRes.json();

        // Search signals
        if (Array.isArray(signals)) {
          signals
            .filter((s: any) =>
              s.headline?.toLowerCase().includes(query) ||
              s.summary?.toLowerCase().includes(query) ||
              s.company_name?.toLowerCase().includes(query) ||
              s.tags?.some((t: string) => t.toLowerCase().includes(query))
            )
            .slice(0, 3)
            .forEach((s: any) => {
              results.push({
                id: s.id,
                type: 'signal',
                title: s.headline,
                subtitle: s.company_name,
                description: s.summary,
                score: s.score,
                tags: s.tags,
                url: `/desk/signals/${s.id}`,
              });
            });
        }

        // Search companies
        if (Array.isArray(companies)) {
          companies
            .filter((c: any) =>
              c.name?.toLowerCase().includes(query) ||
              c.description?.toLowerCase().includes(query) ||
              c.tags?.some((t: string) => t.toLowerCase().includes(query))
            )
            .slice(0, 3)
            .forEach((c: any) => {
              results.push({
                id: c.id,
                type: 'company',
                title: c.name,
                description: c.description,
                tags: c.tags,
                url: `/desk/companies/${c.id}`,
              });
            });
        }

        // Search people
        if (Array.isArray(people)) {
          people
            .filter((p: any) =>
              p.name?.toLowerCase().includes(query) ||
              p.title?.toLowerCase().includes(query) ||
              p.company_name?.toLowerCase().includes(query) ||
              p.tags?.some((t: string) => t.toLowerCase().includes(query))
            )
            .slice(0, 3)
            .forEach((p: any) => {
              results.push({
                id: p.id,
                type: 'person',
                title: p.name,
                subtitle: p.title || p.company_name,
                description: p.bio,
                tags: p.tags,
                url: `/desk/people/${p.id}`,
              });
            });
        }

        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  // AI-powered search with submit
  async function handleAISearch(e: React.FormEvent) {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    // Add to search history
    if (!searchHistory.includes(searchQuery)) {
      const newHistory = [searchQuery, ...searchHistory].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
    
    setIsSearching(true);
    setShowAIResults(true);
    setAiSearchResult(null);
    
    try {
      const response = await fetch('/api/search/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Search failed');
      }
      
      setAiSearchResult(data);
    } catch (error) {
      console.error('AI search error:', error);
      setAiSearchResult({
        success: false,
        aiPowered: false,
        query: searchQuery,
        summary: 'Sorry, the search encountered an error. This might be due to high demand. Please try again in a moment.',
        keyFindings: [],
        hasResults: false,
        results: { signals: [], companies: [], people: [] },
        suggestions: ['Try a simpler search term', 'Search for specific company names', 'Look for founder names'],
      });
    } finally {
      setIsSearching(false);
    }
  }

  // Clear search
  function clearSearch() {
    setSearchQuery('');
    setSearchResults([]);
    setShowAIResults(false);
    setAiSearchResult(null);
    setFilterType('all');
  }

  // Load search history
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load search history');
      }
    }
  }, []);

  const quickSearches = [
    { icon: TrendingUp, label: 'Growing companies', query: 'hiring' },
    { icon: Sparkles, label: 'Recent launches', query: 'launch' },
    { icon: Building2, label: 'YC companies', query: 'yc' },
    { icon: User, label: 'Founders', query: 'founder' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-neutral-900 mb-4 tracking-tight">
            Discover Opportunities
          </h1>
          <p className="text-xl text-neutral-500">
            Search across signals, companies, and people
          </p>
        </div>

        {/* Enhanced Search Bar */}
        <form onSubmit={handleAISearch} className="relative mb-6">
          <div className="relative bg-white border-2 border-neutral-200 rounded-2xl shadow-sm hover:border-neutral-300 focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-100 transition-all">
            <div className="flex items-center gap-3 px-6 py-5">
              <Search className="w-6 h-6 text-neutral-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search signals, companies, people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-lg outline-none placeholder:text-neutral-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              )}
              {isSearching ? (
                <div className="p-2">
                  <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={!searchQuery.trim()}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm"
                >
                  <Brain className="w-4 h-4" />
                  Search
                </button>
              )}
            </div>
          </div>
          
          {/* Search Tips - Only show when no quick results */}
          {searchQuery && !showAIResults && searchResults.length === 0 && (
            <div className="absolute top-full mt-3 left-0 right-0 bg-white border border-neutral-200 rounded-xl shadow-lg p-4 z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-neutral-900">AI-Powered Search</span>
              </div>
              <p className="text-sm text-neutral-600">
                Click <strong>Search</strong> or press <kbd className="px-2 py-0.5 bg-neutral-100 rounded text-xs font-mono">Enter</kbd> for intelligent results with insights
              </p>
            </div>
          )}
        </form>

        {/* Search History & Filters */}
        {!showAIResults && searchHistory.length > 0 && !searchQuery && (
          <div className="mb-8 bg-neutral-50 border border-neutral-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-neutral-600" />
              <h3 className="text-sm font-semibold text-neutral-900">Recent Searches</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((query, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSearchQuery(query);
                    handleAISearch({ preventDefault: () => {} } as React.FormEvent);
                  }}
                  className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-700 hover:border-purple-300 hover:text-purple-700 transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters & Sort (when showing results) */}
        {showAIResults && aiSearchResult && aiSearchResult.hasResults && (
          <div className="mb-6 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-neutral-600" />
              <span className="text-sm font-medium text-neutral-700">Filter:</span>
            </div>
            {(['all', 'signal', 'company', 'person'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterType === type
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white border border-neutral-200 text-neutral-700 hover:border-purple-300'
                }`}
              >
                {type === 'all' ? 'All Results' : `${type.charAt(0).toUpperCase() + type.slice(1)}s`}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <SortDesc className="w-4 h-4 text-neutral-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="relevance">Most Relevant</option>
                <option value="recent">Most Recent</option>
                <option value="score">Highest Score</option>
              </select>
            </div>
          </div>
        )}

        {/* Enhanced Quick Results Dropdown (as you type) */}
        {searchResults.length > 0 && !showAIResults && (
          <div className="bg-white border-2 border-neutral-200 rounded-2xl shadow-xl overflow-hidden mb-6 mt-3 animate-in fade-in slide-in-from-top-2 duration-200 relative z-20">
            <div className="px-5 py-4 bg-gradient-to-r from-neutral-50 to-neutral-100 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <p className="text-sm font-semibold text-neutral-900">Quick Results</p>
                </div>
                <span className="text-xs text-neutral-500">{searchResults.length} found</span>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {searchResults.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  href={result.url}
                  className="block px-5 py-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all border-b border-neutral-100 last:border-0 group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                      result.type === 'signal' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                      result.type === 'company' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                      'bg-gradient-to-br from-emerald-500 to-emerald-600'
                    }`}>
                      {result.type === 'signal' && <Zap className="w-5 h-5 text-white" />}
                      {result.type === 'company' && <Building2 className="w-5 h-5 text-white" />}
                      {result.type === 'person' && <User className="w-5 h-5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-neutral-900 truncate group-hover:text-purple-700 transition-colors">
                          {result.title}
                        </h3>
                        {result.score && result.score >= 8 && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                        )}
                      </div>
                      {result.subtitle && (
                        <p className="text-sm text-neutral-600 truncate mb-1">{result.subtitle}</p>
                      )}
                      {result.description && (
                        <p className="text-xs text-neutral-500 line-clamp-1">{result.description}</p>
                      )}
                      {result.tags && result.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {result.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize ${
                        result.type === 'signal' ? 'bg-purple-100 text-purple-700' :
                        result.type === 'company' ? 'bg-blue-100 text-blue-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {result.type}
                      </span>
                      <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-200 text-center">
              <p className="text-xs text-neutral-600">
                Press <kbd className="px-2 py-0.5 bg-white border border-neutral-300 rounded text-xs font-mono">Enter</kbd> for AI-powered insights
              </p>
            </div>
          </div>
        )}

        {/* AI Search Results */}
        {showAIResults && aiSearchResult && (
          <div className="space-y-6 mb-12">
            {/* AI Response Card */}
            <div className="bg-white border-2 border-purple-200 rounded-2xl p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-bold text-neutral-900">Search Results</h2>
                    {aiSearchResult.aiPowered && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                        AI-Powered
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500">for "{aiSearchResult.query}"</p>
                </div>
              </div>
              
              {/* AI Summary */}
              <div className="mb-6">
                <p className="text-lg text-neutral-800 leading-relaxed">
                  {aiSearchResult.summary}
                </p>
              </div>
              
              {/* Key Findings - Inline */}
              {aiSearchResult.keyFindings && aiSearchResult.keyFindings.length > 0 && (
                <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                  <h3 className="text-sm font-semibold text-purple-900 mb-3">Key Insights</h3>
                  <div className="space-y-2">
                    {aiSearchResult.keyFindings.map((finding, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-sm text-neutral-700 flex-1">{finding}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Results - Organized by Category with Filtering */}
            {aiSearchResult.hasResults ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-neutral-900">
                    {(() => {
                      let count = 0;
                      if (filterType === 'all' || filterType === 'signal') count += aiSearchResult.results.signals.length;
                      if (filterType === 'all' || filterType === 'company') count += aiSearchResult.results.companies.length;
                      if (filterType === 'all' || filterType === 'person') count += aiSearchResult.results.people.length;
                      return count;
                    })()} Results Found
                  </h2>
                </div>
                <div className="space-y-6">
                  {/* Signals */}
                  {(filterType === 'all' || filterType === 'signal') && aiSearchResult.results.signals.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-neutral-900">
                          Signals <span className="text-neutral-500 font-normal">({aiSearchResult.results.signals.length})</span>
                        </h3>
                      </div>
                      <div className="grid gap-2">
                        {aiSearchResult.results.signals.map((signal: any) => (
                          <Link
                            key={signal.id}
                            href={`/desk/signals/${signal.id}`}
                            className="block bg-white border border-neutral-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-sm transition-all group"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-neutral-900 mb-1 group-hover:text-purple-600 transition-colors truncate">
                                  {signal.headline}
                                </h4>
                                <p className="text-sm text-neutral-600 line-clamp-1 mb-2">{signal.summary}</p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {signal.company_name && (
                                    <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                                      {signal.company_name}
                                    </span>
                                  )}
                                  {signal.score && signal.score >= 7 && (
                                    <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded font-medium">
                                      High Priority
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-purple-600 transition-colors flex-shrink-0 mt-1" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Companies */}
                  {(filterType === 'all' || filterType === 'company') && aiSearchResult.results.companies.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-neutral-900">
                          Companies <span className="text-neutral-500 font-normal">({aiSearchResult.results.companies.length})</span>
                        </h3>
                      </div>
                      <div className="grid gap-2">
                        {aiSearchResult.results.companies.map((company: any) => (
                          <Link
                            key={company.id}
                            href={`/desk/companies/${company.id}`}
                            className="block bg-white border border-neutral-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all group"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-neutral-900 mb-1 group-hover:text-blue-600 transition-colors">
                                  {company.name}
                                </h4>
                                {company.description && (
                                  <p className="text-sm text-neutral-600 line-clamp-1 mb-2">{company.description}</p>
                                )}
                                {company.tags && company.tags.length > 0 && (
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {company.tags.slice(0, 3).map((tag: string, i: number) => (
                                      <span key={i} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* People */}
                  {(filterType === 'all' || filterType === 'person') && aiSearchResult.results.people.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-5 h-5 text-emerald-600" />
                        <h3 className="text-lg font-semibold text-neutral-900">
                          People <span className="text-neutral-500 font-normal">({aiSearchResult.results.people.length})</span>
                        </h3>
                      </div>
                      <div className="grid gap-2">
                        {aiSearchResult.results.people.map((person: any) => (
                          <Link
                            key={person.id}
                            href={`/desk/people/${person.id}`}
                            className="block bg-white border border-neutral-200 rounded-lg p-4 hover:border-emerald-300 hover:shadow-sm transition-all group"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-neutral-900 mb-1 group-hover:text-emerald-600 transition-colors">
                                  {person.name}
                                </h4>
                                {(person.title || person.company_name) && (
                                  <p className="text-sm text-neutral-600 truncate">
                                    {person.title} {person.title && person.company_name && '·'} {person.company_name}
                                  </p>
                                )}
                              </div>
                              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-emerald-600 transition-colors flex-shrink-0 mt-1" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-neutral-300 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Results Found</h3>
                <p className="text-neutral-600 mb-6">The AI couldn't find relevant data matching your query.</p>
                {aiSearchResult.suggestions && aiSearchResult.suggestions.length > 0 && (
                  <div className="max-w-md mx-auto">
                    <p className="text-sm font-medium text-neutral-700 mb-3">Try these searches:</p>
                    <div className="space-y-2">
                      {aiSearchResult.suggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSearchQuery(suggestion);
                            setShowAIResults(false);
                          }}
                          className="block w-full text-sm text-neutral-700 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 px-4 py-3 rounded-lg transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quick Searches */}
        {!searchQuery && !showAIResults && (
          <div className="flex flex-wrap gap-2 justify-center mb-16">
            {quickSearches.map((item, i) => (
              <button
                key={i}
                onClick={() => setSearchQuery(item.query)}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-full transition-all text-sm"
              >
                <item.icon className="w-4 h-4 text-neutral-600" />
                <span className="text-neutral-700">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stats Section */}
      {!searchQuery && !showAIResults && (
        <div className="max-w-5xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Signals Card */}
            <Link
              href="/desk/signals"
              className="group bg-white border border-neutral-200 rounded-xl p-8 hover:border-neutral-300 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
              </div>
              <div className="text-3xl font-bold text-neutral-900 mb-1">{stats.signals}</div>
              <div className="text-neutral-600 font-medium">Signals</div>
              <p className="text-sm text-neutral-500 mt-2">
                Opportunities from multiple sources
              </p>
            </Link>

            {/* Companies Card */}
            <Link
              href="/desk/companies"
              className="group bg-white border border-neutral-200 rounded-xl p-8 hover:border-neutral-300 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
              </div>
              <div className="text-3xl font-bold text-neutral-900 mb-1">{stats.companies}</div>
              <div className="text-neutral-600 font-medium">Companies</div>
              <p className="text-sm text-neutral-500 mt-2">
                Verified with growth signals
              </p>
            </Link>

            {/* People Card */}
            <Link
              href="/desk/people"
              className="group bg-white border border-neutral-200 rounded-xl p-8 hover:border-neutral-300 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-emerald-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
              </div>
              <div className="text-3xl font-bold text-neutral-900 mb-1">{stats.people}</div>
              <div className="text-neutral-600 font-medium">People</div>
              <p className="text-sm text-neutral-500 mt-2">
                Founders and decision makers
              </p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
