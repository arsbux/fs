'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Signal, Company, Person } from '@/types';
import { 
  ArrowLeft, 
  ExternalLink, 
  TrendingUp, 
  MessageCircle, 
  Users, 
  Building2, 
  Calendar, 
  Tag, 
  Lightbulb, 
  Target,
  CheckCircle2,
  ThumbsUp,
  X,
  Rocket,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function SignalProfilePage() {
  const params = useParams();
  const [signal, setSignal] = useState<Signal | null>(null);
  const [relatedCompanies, setRelatedCompanies] = useState<Company[]>([]);
  const [relatedPeople, setRelatedPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionState, setActionState] = useState<string | null>(null);

  useEffect(() => {
    loadSignalData();
  }, [params.id]);

  async function loadSignalData() {
    try {
      // Load signal details
      const signalRes = await fetch(`/api/signals/${params.id}`);
      const signalData = await signalRes.json();
      setSignal(signalData);

      // Set initial action state
      if (signalData.user_actions && signalData.user_actions.length > 0) {
        setActionState(signalData.user_actions[signalData.user_actions.length - 1].action);
      }

      // Load related companies
      if (signalData.company_ids && signalData.company_ids.length > 0) {
        const companiesRes = await fetch('/api/companies');
        const allCompanies = await companiesRes.json();
        const related = allCompanies.filter((c: Company) => 
          signalData.company_ids.includes(c.id)
        );
        setRelatedCompanies(related);
      }

      // Load related people
      if (signalData.person_ids && signalData.person_ids.length > 0) {
        const peopleRes = await fetch('/api/people');
        const allPeople = await peopleRes.json();
        const related = allPeople.filter((p: Person) => 
          signalData.person_ids.includes(p.id)
        );
        setRelatedPeople(related);
      }
    } catch (error) {
      console.error('Error loading signal:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(action: 'acted' | 'useful' | 'ignore') {
    try {
      const res = await fetch('/api/signals/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signal_id: signal?.id,
          action,
        }),
      });

      if (res.ok) {
        setActionState(action);
      }
    } catch (error) {
      console.error('Error recording action:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-400">Loading signal...</div>
      </div>
    );
  }

  if (!signal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Signal not found</h3>
          <Link href="/desk" className="text-blue-600 hover:text-blue-700">
            Back to Signals
          </Link>
        </div>
      </div>
    );
  }

  const scoreColor = signal.score >= 8 
    ? 'bg-red-50 text-red-700 border-red-200' 
    : signal.score >= 6 
    ? 'bg-amber-50 text-amber-700 border-amber-200' 
    : 'bg-yellow-50 text-yellow-700 border-yellow-200';

  const sourceIcon = signal.ph_post_id ? Rocket : signal.hn_story_id ? Zap : ExternalLink;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link
            href="/desk"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Signals
          </Link>

          <div className="flex items-start gap-6">
            {/* Score Badge */}
            <div className={`flex items-center justify-center w-16 h-16 rounded-2xl border font-bold text-xl ${scoreColor}`}>
              {signal.score}
            </div>

            {/* Signal Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="px-3 py-1 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-lg capitalize">
                  {signal.signal_type?.replace('_', ' ') || 'Signal'}
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  signal.credibility === 'high' ? 'bg-emerald-500' :
                  signal.credibility === 'medium' ? 'bg-amber-500' :
                  'bg-neutral-400'
                }`} />
                <span className="text-sm text-neutral-500 capitalize">{signal.credibility}</span>
                
                {/* Source Badge */}
                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg">
                  {React.createElement(sourceIcon, { className: "w-3 h-3" })}
                  {signal.ph_post_id ? 'Product Hunt' : signal.hn_story_id ? 'Hacker News' : 'Manual'}
                </div>
              </div>

              <h1 className="text-2xl font-bold text-neutral-900 mb-3 leading-tight">
                {signal.headline}
              </h1>

              <p className="text-neutral-700 leading-relaxed mb-4">
                {signal.summary}
              </p>

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-sm text-neutral-600">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(signal.created_at).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                {signal.company_name && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    {signal.company_name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Source Stats */}
        {(signal.ph_votes_count !== undefined || signal.hn_story_id) && (
          <div className="bg-white rounded-2xl p-6 border border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Source Metrics</h2>
            
            {signal.ph_votes_count !== undefined && (
              <div className="flex items-center gap-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100 rounded-xl">
                <div className="flex items-center gap-2 text-orange-700">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold">{signal.ph_votes_count} upvotes</span>
                </div>
                <div className="flex items-center gap-2 text-orange-600">
                  <MessageCircle className="w-5 h-5" />
                  <span>{signal.ph_comments_count} comments</span>
                </div>
                {signal.ph_makers && signal.ph_makers.length > 0 && (
                  <div className="flex items-center gap-2 text-orange-600">
                    <Users className="w-5 h-5" />
                    <span>{signal.ph_makers.length} makers</span>
                  </div>
                )}
              </div>
            )}

            {signal.hn_story_id && (
              <div className="flex items-center gap-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl">
                <div className="flex items-center gap-2 text-amber-700">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold">{signal.hn_score} points</span>
                </div>
                <div className="flex items-center gap-2 text-amber-600">
                  <MessageCircle className="w-5 h-5" />
                  <span>{signal.hn_comments} comments</span>
                </div>
                {signal.hn_author && (
                  <div className="flex items-center gap-2 text-amber-600">
                    <Users className="w-5 h-5" />
                    <span>@{signal.hn_author}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Why it matters */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">Why it matters</h3>
            </div>
            <p className="text-neutral-700 leading-relaxed">{signal.why_it_matters}</p>
          </div>

          {/* Recommended action */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">Recommended action</h3>
            </div>
            <p className="text-neutral-700 leading-relaxed">{signal.recommended_action}</p>
          </div>
        </div>

        {/* Related Entities */}
        {(relatedCompanies.length > 0 || relatedPeople.length > 0) && (
          <div className="bg-white rounded-2xl p-6 border border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900 mb-6">Related Entities</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Companies */}
              {relatedCompanies.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-neutral-700 mb-3 uppercase tracking-wide">
                    Companies ({relatedCompanies.length})
                  </h3>
                  <div className="space-y-3">
                    {relatedCompanies.map((company) => (
                      <Link
                        key={company.id}
                        href={`/desk/companies/${company.id}`}
                        className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-neutral-900">{company.name}</div>
                          {company.description && (
                            <div className="text-sm text-neutral-600 line-clamp-1">
                              {company.description}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* People */}
              {relatedPeople.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-neutral-700 mb-3 uppercase tracking-wide">
                    People ({relatedPeople.length})
                  </h3>
                  <div className="space-y-3">
                    {relatedPeople.map((person) => (
                      <Link
                        key={person.id}
                        href={`/desk/people/${person.id}`}
                        className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
                      >
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-neutral-900">{person.name}</div>
                          {person.title && (
                            <div className="text-sm text-neutral-600">{person.title}</div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {signal.tags && signal.tags.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {signal.tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 text-neutral-700 text-sm rounded-lg"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Actions</h2>
          
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => handleAction('acted')}
              disabled={actionState === 'acted'}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                actionState === 'acted'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-neutral-50 text-neutral-700 hover:bg-emerald-50 hover:text-emerald-700 border border-neutral-200 hover:border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Acted</span>
            </button>
            <button
              onClick={() => handleAction('useful')}
              disabled={actionState === 'useful'}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                actionState === 'useful'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-neutral-50 text-neutral-700 hover:bg-blue-50 hover:text-blue-700 border border-neutral-200 hover:border-blue-200'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Useful</span>
            </button>
            <button
              onClick={() => handleAction('ignore')}
              disabled={actionState === 'ignore'}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                actionState === 'ignore'
                  ? 'bg-neutral-400 text-white shadow-sm'
                  : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <X className="w-4 h-4" />
              <span>Ignore</span>
            </button>
          </div>

          <a 
            href={signal.source_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-all"
          >
            <span>View Source</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}