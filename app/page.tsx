'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  Zap, 
  ArrowRight,
  Check,
  Mail,
  Clock,
  Target,
  Bell,
  MessageSquare,
  Users,
  BarChart3
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session) {
            if (window.location.pathname === '/') {
              router.replace('/desk');
            }
          } else {
            setShowLanding(true);
          }
          setChecking(false);
        }
      } catch (error) {
        console.error('Session check error:', error);
        if (mounted) {
          setShowLanding(true);
          setChecking(false);
        }
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-neutral-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (!showLanding) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-neutral-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-neutral-900 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-neutral-900">FounderSignal</span>
            </div>
            <Link
              href="/login"
              className="px-4 sm:px-5 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-neutral-100 rounded-full text-xs sm:text-sm font-medium text-neutral-700 mb-6 sm:mb-8">
              <div className="w-2 h-2 bg-neutral-900 rounded-full"></div>
              <span>Validated by analysts, delivered in minutes</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 mb-4 sm:mb-6 leading-tight px-4">
              Act on opportunities<br />
              <span className="relative inline-block">
                before everyone else
                <div className="absolute bottom-1 left-0 right-0 h-3 bg-neutral-900 -z-10"></div>
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-neutral-600 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-4">
              Get human-validated alerts on launches, fundraises, and partnerships—with ready-to-send outreach templates. No noise, just action.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-4">
              <Link
                href="/login"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-all inline-flex items-center justify-center gap-2 text-center"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-neutral-600 px-4">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-neutral-900" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-neutral-900" />
                <span>Setup in 3 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-neutral-900" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Problem/Solution */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-start">
            <div>
              <div className="inline-block px-3 py-1 bg-neutral-100 text-neutral-900 rounded-full text-xs sm:text-sm font-medium mb-4">
                The Problem
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-4 sm:mb-6">
                You're always one step behind
              </h2>
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-neutral-600">
                <p className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">✗</span>
                  <span>By the time you see a Product Hunt launch, 50 others already reached out</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">✗</span>
                  <span>You spend hours scanning Twitter, HN, and news sites manually</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">✗</span>
                  <span>Most "signals" are noise—you waste time chasing dead ends</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">✗</span>
                  <span>Even when you find something, you don't know what to say</span>
                </p>
              </div>
            </div>

            <div>
              <div className="inline-block px-3 py-1 bg-neutral-900 text-white rounded-full text-xs sm:text-sm font-medium mb-4">
                The Solution
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-4 sm:mb-6">
                We do the work. You take action.
              </h2>
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-neutral-600">
                <p className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-neutral-900 flex-shrink-0 mt-0.5" />
                  <span>Get alerts within 1 hour of a relevant signal going live</span>
                </p>
                <p className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-neutral-900 flex-shrink-0 mt-0.5" />
                  <span>Every alert is validated by a human analyst—no false positives</span>
                </p>
                <p className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-neutral-900 flex-shrink-0 mt-0.5" />
                  <span>One-line "why it matters" + ready-to-send outreach copy</span>
                </p>
                <p className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-neutral-900 flex-shrink-0 mt-0.5" />
                  <span>Act in minutes, not hours—while the opportunity is hot</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3 sm:mb-4">
              From signal to action in 3 steps
            </h2>
            <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto">
              Set it up once, then just act on the alerts we send you
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-neutral-900 text-white rounded-xl flex items-center justify-center text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                1
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2 sm:mb-3">Create your watchlist</h3>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                Add companies, keywords, and topics you want to track. Our fuzzy matching engine automatically surfaces relevant signals.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-neutral-900 text-white rounded-xl flex items-center justify-center text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                2
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2 sm:mb-3">We scan & score</h3>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                Our system monitors Product Hunt, Hacker News, GitHub, Y Combinator, and Reddit. Every signal gets a 0-10 score based on relevance and traction.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200 sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-neutral-900 text-white rounded-xl flex items-center justify-center text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                3
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2 sm:mb-3">Get instant alerts</h3>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                Receive Slack or email alerts for high-priority signals. Track your actions and measure precision with built-in analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3 sm:mb-4">
              Everything you need to move fast
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white border border-neutral-200 rounded-xl p-5 sm:p-6 hover:border-neutral-900 hover:shadow-lg transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-900" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2">Slack & email alerts</h3>
              <p className="text-sm text-neutral-600">
                Configure alert thresholds and delivery schedules. Get realtime, daily, or weekly digests.
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-5 sm:p-6 hover:border-neutral-900 hover:shadow-lg transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-900" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2">Scored & prioritized</h3>
              <p className="text-sm text-neutral-600">
                Every signal gets a 1-10 score. Focus on what matters most.
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-5 sm:p-6 hover:border-neutral-900 hover:shadow-lg transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-900" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2">Fuzzy matching</h3>
              <p className="text-sm text-neutral-600">
                Advanced matching engine finds relevant signals even with partial company names or keywords.
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-5 sm:p-6 hover:border-neutral-900 hover:shadow-lg transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-900" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2">Multiple sources</h3>
              <p className="text-sm text-neutral-600">
                Product Hunt, Hacker News, GitHub, Y Combinator, Reddit—all in one place.
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-5 sm:p-6 hover:border-neutral-900 hover:shadow-lg transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-900" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2">Action tracking</h3>
              <p className="text-sm text-neutral-600">
                Mark signals as acted, useful, or ignored. Track precision metrics and ROI.
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-5 sm:p-6 hover:border-neutral-900 hover:shadow-lg transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-900" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2">AI-powered search</h3>
              <p className="text-sm text-neutral-600">
                Search across all signals with natural language queries powered by Claude AI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-neutral-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-3 sm:mb-4">
              $100/month
            </h2>
            <p className="text-lg sm:text-xl text-neutral-300">
              Simple, transparent pricing
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 md:p-10 max-w-3xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-bold mb-4">Everything included</h3>
              <ul className="grid sm:grid-cols-2 gap-3">
                <li className="flex items-start gap-2 sm:gap-3">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm">Unlimited watchlist tracking</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm">Product Hunt integration</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm">Hacker News monitoring</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm">GitHub trending repos</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm">Y Combinator startups</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm">Reddit community signals</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm">Slack & email alerts</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm">AI-powered search</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm">Smart scoring (0-10)</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm">Action tracking & metrics</span>
                </li>
              </ul>
            </div>

            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-neutral-900 rounded-xl font-bold hover:bg-neutral-100 transition-all shadow-xl w-full sm:w-auto justify-center"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-xs sm:text-sm text-neutral-400 mt-3 sm:mt-4">
                No credit card required · Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-8 sm:mb-12 text-center">
            Common questions
          </h2>
          
          <div className="space-y-4 sm:space-y-6">
            <details className="group bg-white border border-neutral-200 rounded-xl p-5 sm:p-6 hover:border-neutral-900 transition-all">
              <summary className="font-bold text-neutral-900 cursor-pointer list-none flex items-center justify-between text-sm sm:text-base">
                <span>What if I don't have a watchlist?</span>
                <ArrowRight className="w-5 h-5 text-neutral-400 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
              </summary>
              <p className="text-neutral-600 mt-3 sm:mt-4 leading-relaxed text-sm sm:text-base">
                No problem. During onboarding, just tell us your industry and goals. We'll help you build a focused list of 5-10 companies or keywords to track.
              </p>
            </details>

            <details className="group bg-white border border-neutral-200 rounded-xl p-5 sm:p-6 hover:border-neutral-900 transition-all">
              <summary className="font-bold text-neutral-900 cursor-pointer list-none flex items-center justify-between text-sm sm:text-base">
                <span>How quickly will I see results?</span>
                <ArrowRight className="w-5 h-5 text-neutral-400 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
              </summary>
              <p className="text-neutral-600 mt-3 sm:mt-4 leading-relaxed text-sm sm:text-base">
                First alerts within 24 hours. Most pilots see their first meeting booked or partnership conversation started within 2 weeks.
              </p>
            </details>

            <details className="group bg-white border border-neutral-200 rounded-xl p-5 sm:p-6 hover:border-neutral-900 transition-all">
              <summary className="font-bold text-neutral-900 cursor-pointer list-none flex items-center justify-between text-sm sm:text-base">
                <span>Do you send every signal you find?</span>
                <ArrowRight className="w-5 h-5 text-neutral-400 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
              </summary>
              <p className="text-neutral-600 mt-3 sm:mt-4 leading-relaxed text-sm sm:text-base">
                No. We only send validated, high-confidence signals with clear action paths. You get quality over quantity—typically 2-5 alerts per week.
              </p>
            </details>

            <details className="group bg-white border border-neutral-200 rounded-xl p-5 sm:p-6 hover:border-neutral-900 transition-all">
              <summary className="font-bold text-neutral-900 cursor-pointer list-none flex items-center justify-between text-sm sm:text-base">
                <span>Can I integrate with Slack or Notion?</span>
                <ArrowRight className="w-5 h-5 text-neutral-400 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
              </summary>
              <p className="text-neutral-600 mt-3 sm:mt-4 leading-relaxed text-sm sm:text-base">
                Pilot includes email + dashboard. Slack and advanced integrations are available as add-ons or in higher tiers.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-neutral-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 mb-4 sm:mb-6">
            Stop missing opportunities
          </h2>
          <p className="text-lg sm:text-xl text-neutral-600 mb-8 sm:mb-10 max-w-2xl mx-auto">
            Join the founders who act first. Get your free sample alerts today.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition-all text-base sm:text-lg w-full sm:w-auto justify-center"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 border-t border-neutral-200 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-neutral-900">FounderSignal</span>
            </div>
            <div className="text-xs sm:text-sm text-neutral-600">
              © 2025 FounderSignal. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
