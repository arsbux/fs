'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Person, Signal, Company } from '@/types';
import SignalCard from '@/components/SignalCard';
import { User, Mail, Building2, Twitter, Linkedin, Github, Globe, ArrowLeft, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function PersonProfilePage() {
  const params = useParams();
  const [person, setPerson] = useState<Person | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPersonData();
  }, [params.id]);

  async function loadPersonData() {
    try {
      // Load person details
      const personRes = await fetch(`/api/people/${params.id}`);
      const personData = await personRes.json();
      setPerson(personData);

      // Load company if exists
      if (personData.company_id) {
        const companyRes = await fetch(`/api/companies/${personData.company_id}`);
        const companyData = await companyRes.json();
        setCompany(companyData);
      }

      // Load signals related to this person
      const signalsRes = await fetch('/api/signals');
      const allSignals = await signalsRes.json();
      const personSignals = allSignals.filter(
        (s: Signal) => s.person_ids?.includes(params.id as string)
      );
      setSignals(personSignals);
    } catch (error) {
      console.error('Error loading person:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-400">Loading person...</div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Person not found</h3>
          <Link href="/desk/people" className="text-blue-600 hover:text-blue-700">
            Back to People
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            href="/desk/people"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to People
          </Link>

          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              {person.avatar_url ? (
                <img src={person.avatar_url} alt={person.name} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>

            {/* Person Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">
                {person.name}
              </h1>
              {person.title && (
                <p className="text-lg text-neutral-600 mb-3">{person.title}</p>
              )}
              {person.bio && (
                <p className="text-neutral-600 mb-4 max-w-3xl">{person.bio}</p>
              )}

              {/* Company Link */}
              {person.company_name && (
                <Link
                  href={person.company_id ? `/desk/companies/${person.company_id}` : '#'}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-all border border-blue-200 mb-4"
                >
                  <Building2 className="w-4 h-4" />
                  {person.company_name}
                </Link>
              )}

              {/* Contact & Social Links */}
              <div className="flex flex-wrap gap-3 mt-4">
                {person.email && (
                  <a
                    href={`mailto:${person.email}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-all"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                )}
                {person.social_links?.twitter && (
                  <a
                    href={`https://twitter.com/${person.social_links.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-all border border-blue-200"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </a>
                )}
                {person.social_links?.linkedin && (
                  <a
                    href={person.social_links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-all border border-blue-200"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
                {person.social_links?.github && (
                  <a
                    href={person.social_links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-all border border-neutral-200"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                  </a>
                )}
                {person.social_links?.website && (
                  <a
                    href={person.social_links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-all border border-neutral-200"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>

              {/* Tags */}
              {person.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {person.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Signals Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-1">
            Related Signals
          </h2>
          <p className="text-neutral-600 text-sm">
            {signals.length} signal{signals.length !== 1 ? 's' : ''} about {person.name}
          </p>
        </div>

        {signals.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
            <User className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">No signals yet</h3>
            <p className="text-neutral-500 text-sm">
              Signals related to {person.name} will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {signals
              .sort((a, b) => b.score - a.score)
              .map((signal) => (
                <SignalCard key={signal.id} signal={signal} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
