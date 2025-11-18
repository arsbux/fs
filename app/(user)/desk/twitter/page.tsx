'use client';

import { MessageSquare, Sparkles, TrendingUp, Users, Zap, Clock } from 'lucide-react';

export default function TwitterPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">𝕏 (Twitter)</h1>
              <p className="text-neutral-400 text-sm mt-1">
                Real-time signals from the startup ecosystem
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Coming Soon Content */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Main Card */}
        <div className="bg-white border-2 border-neutral-200 rounded-3xl p-12 text-center mb-8">
          {/* Icon */}
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-neutral-900" />
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-neutral-900 mb-3">Coming Soon</h2>
          <p className="text-lg text-neutral-600 mb-12 max-w-xl mx-auto">
            Real-time intelligence from the world's conversation
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 hover:border-neutral-300 transition-colors">
              <TrendingUp className="w-6 h-6 text-neutral-900 mx-auto mb-3" />
              <h3 className="font-semibold text-neutral-900 text-sm mb-2">Trending</h3>
              <p className="text-xs text-neutral-600">
                Viral conversations
              </p>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 hover:border-neutral-300 transition-colors">
              <Users className="w-6 h-6 text-neutral-900 mx-auto mb-3" />
              <h3 className="font-semibold text-neutral-900 text-sm mb-2">Founders</h3>
              <p className="text-xs text-neutral-600">
                Key decision-makers
              </p>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 hover:border-neutral-300 transition-colors">
              <Zap className="w-6 h-6 text-neutral-900 mx-auto mb-3" />
              <h3 className="font-semibold text-neutral-900 text-sm mb-2">Launches</h3>
              <p className="text-xs text-neutral-600">
                Product announcements
              </p>
            </div>
          </div>

          {/* Features List */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8 text-left max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-neutral-900" />
              <h3 className="text-sm font-semibold text-neutral-900">Planned Features</h3>
            </div>
            <div className="space-y-3 text-sm text-neutral-700">
              <div className="flex items-start gap-3">
                <span className="w-1 h-1 bg-neutral-900 rounded-full mt-2 flex-shrink-0"></span>
                <span>AI-powered signal filtering</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-1 h-1 bg-neutral-900 rounded-full mt-2 flex-shrink-0"></span>
                <span>Founder & VC tracking</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-1 h-1 bg-neutral-900 rounded-full mt-2 flex-shrink-0"></span>
                <span>Sentiment analysis</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-1 h-1 bg-neutral-900 rounded-full mt-2 flex-shrink-0"></span>
                <span>Thread summaries</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-1 h-1 bg-neutral-900 rounded-full mt-2 flex-shrink-0"></span>
                <span>Real-time alerts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="text-center">
          <p className="text-sm text-neutral-500">
            In development
          </p>
        </div>
      </div>
    </div>
  );
}
