import { Signal, Person } from '@/types';
import { 
  ExternalLink, 
  TrendingUp, 
  CheckCircle2, 
  ThumbsUp, 
  X, 
  Building2, 
  MessageCircle,
  Users,
  Lightbulb,
  Target
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SignalCardProps {
  signal: Signal;
}

export default function SignalCard({ signal }: SignalCardProps) {
  const [actionState, setActionState] = useState<string | null>(
    signal.user_actions && signal.user_actions.length > 0 
      ? signal.user_actions[signal.user_actions.length - 1].action 
      : null
  );
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    // Fetch people data if person_ids exist
    if (signal.person_ids && signal.person_ids.length > 0) {
      fetchPeople();
    }
  }, [signal.person_ids]);

  async function fetchPeople() {
    try {
      const res = await fetch('/api/people');
      const allPeople = await res.json();
      const signalPeople = allPeople.filter((p: Person) => 
        signal.person_ids?.includes(p.id)
      );
      setPeople(signalPeople);
    } catch (error) {
      console.error('Error fetching people:', error);
    }
  }

  const scoreColor = signal.score >= 8 
    ? 'bg-red-50 text-red-700 border-red-200' 
    : signal.score >= 6 
    ? 'bg-amber-50 text-amber-700 border-amber-200' 
    : 'bg-yellow-50 text-yellow-700 border-yellow-200';

  async function handleAction(action: 'acted' | 'useful' | 'ignore', e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const res = await fetch('/api/signals/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signal_id: signal.id,
          action,
        }),
      });

      if (res.ok) {
        setActionState(action);
        if (!signal.user_actions) signal.user_actions = [];
        signal.user_actions.push({
          user_id: 'default-user',
          action,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error recording action:', error);
    }
  }
  
  return (
    <Link href={`/desk/signals/${signal.id}`} className="block">
      <div className="group bg-white border border-neutral-200 rounded-2xl p-5 hover:border-neutral-300 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 relative cursor-pointer">
      {/* Header with Score and Meta */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`flex items-center justify-center w-10 h-10 rounded-xl font-semibold text-base ${scoreColor}`}>
          {signal.score}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-lg capitalize">
              {signal.signal_type.replace('_', ' ')}
            </span>
            <div className={`w-2 h-2 rounded-full ${
              signal.credibility === 'high' ? 'bg-emerald-500' :
              signal.credibility === 'medium' ? 'bg-amber-500' :
              'bg-neutral-400'
            }`} />
          </div>
          
          <h3 className="text-base font-semibold text-neutral-900 mb-2 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
            {signal.headline}
          </h3>
          
          {/* Company Link */}
          {signal.company_id && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/desk/companies/${signal.company_id}`;
              }}
              className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 transition-colors group/company"
            >
              <Building2 className="w-3.5 h-3.5 group-hover/company:scale-110 transition-transform" />
              <span className="font-medium">{signal.company_name}</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <p className="text-neutral-700 text-sm leading-relaxed mb-4 line-clamp-3">
        {signal.summary}
      </p>

      {/* Product Hunt Stats */}
      {signal.ph_votes_count !== undefined && (
        <div className="flex items-center gap-4 mb-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100 rounded-xl">
          <div className="flex items-center gap-1.5 text-sm text-orange-700 font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>{signal.ph_votes_count}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-orange-600">
            <MessageCircle className="w-4 h-4" />
            <span>{signal.ph_comments_count}</span>
          </div>
          {signal.ph_makers && signal.ph_makers.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-orange-600 truncate">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">
                {signal.ph_makers.map(m => 
                  m.twitter_username ? `@${m.twitter_username}` : m.name
                ).join(', ')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Hacker News Stats */}
      {signal.hn_story_id && (
        <div className="flex items-center gap-4 mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl">
          <div className="flex items-center gap-1.5 text-sm text-amber-700 font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>{signal.hn_score}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-amber-600">
            <MessageCircle className="w-4 h-4" />
            <span>{signal.hn_comments}</span>
          </div>
          {people.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-amber-600 truncate">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">
                {people.slice(0, 2).map(p => p.name).join(', ')}
                {people.length > 2 && ` +${people.length - 2}`}
              </span>
            </div>
          )}
          {signal.hn_category && (
            <div className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-lg font-medium capitalize">
              {signal.hn_category.replace(/_/g, ' ')}
            </div>
          )}
        </div>
      )}

      {/* Indie Hackers Stats */}
      {signal.ih_post_id && (
        <div className="flex items-center gap-4 mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl">
          <div className="flex items-center gap-1.5 text-sm text-indigo-700 font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>{signal.ih_upvotes || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-indigo-600">
            <MessageCircle className="w-4 h-4" />
            <span>{signal.ih_comments || 0}</span>
          </div>
          {signal.ih_revenue && signal.ih_revenue > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z"/>
              </svg>
              <span>${signal.ih_revenue >= 1000 ? `${(signal.ih_revenue / 1000).toFixed(0)}k` : signal.ih_revenue}</span>
            </div>
          )}
          {signal.ih_category && (
            <div className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-lg font-medium capitalize">
              {signal.ih_category}
            </div>
          )}
        </div>
      )}

      {/* GitHub Stats */}
      {signal.github_repo_url && (
        <div className="flex items-center gap-4 mb-4 p-3 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-1.5 text-sm text-slate-700 font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
            </svg>
            <span>{signal.github_stars}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-.878a2.25 2.25 0 111.5 0v.878a2.25 2.25 0 01-2.25 2.25h-1.5v2.128a2.251 2.251 0 11-1.5 0V8.5h-1.5A2.25 2.25 0 013.5 6.25v-.878a2.25 2.25 0 111.5 0zM5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm6.75.75a.75.75 0 100-1.5.75.75 0 000 1.5zm-3 8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/>
            </svg>
            <span>{signal.github_forks}</span>
          </div>
          {signal.github_today_stars && signal.github_today_stars > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>+{signal.github_today_stars} today</span>
            </div>
          )}
          {signal.github_language && (
            <div className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded-lg font-medium">
              {signal.github_language}
            </div>
          )}
        </div>
      )}

      {/* Insights Section */}
      <div className="space-y-3 mb-4">
        {/* Why it matters */}
        <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
              Why it matters
            </span>
          </div>
          <p className="text-sm text-blue-800 leading-relaxed">{signal.why_it_matters}</p>
        </div>

        {/* Recommended action */}
        <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wide">
              Recommended action
            </span>
          </div>
          <p className="text-sm text-emerald-800 leading-relaxed">{signal.recommended_action}</p>
        </div>
      </div>

      {/* Tags and Source */}
      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
        <div className="flex flex-wrap gap-1.5">
          {signal.tags.slice(0, 2).map((tag, i) => (
            <span key={i} className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-lg">
              {tag}
            </span>
          ))}
          {signal.tags.length > 2 && (
            <span className="px-2 py-1 text-neutral-500 text-xs">
              +{signal.tags.length - 2}
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(signal.source_link, '_blank', 'noopener,noreferrer');
          }}
          className="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-700 text-xs font-medium transition-colors group/link"
        >
          <span>Source</span>
          <ExternalLink className="w-3 h-3 group-hover/link:scale-110 transition-transform" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <button
          onClick={(e) => handleAction('acted', e)}
          disabled={actionState === 'acted'}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            actionState === 'acted'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'bg-neutral-50 text-neutral-700 hover:bg-emerald-50 hover:text-emerald-700 border border-neutral-200 hover:border-emerald-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Acted</span>
        </button>
        <button
          onClick={(e) => handleAction('useful', e)}
          disabled={actionState === 'useful'}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            actionState === 'useful'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-neutral-50 text-neutral-700 hover:bg-blue-50 hover:text-blue-700 border border-neutral-200 hover:border-blue-200'
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          <span>Useful</span>
        </button>
        <button
          onClick={(e) => handleAction('ignore', e)}
          disabled={actionState === 'ignore'}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            actionState === 'ignore'
              ? 'bg-neutral-400 text-white shadow-sm'
              : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border border-neutral-200 hover:border-neutral-300'
          }`}
        >
          <X className="w-4 h-4" />
          <span>Ignore</span>
        </button>
        </div>
      </div>
    </Link>
  );
}
