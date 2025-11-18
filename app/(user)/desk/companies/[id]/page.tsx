'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Company, Signal } from '@/types';
import SignalCard from '@/components/SignalCard';
import { Building2, ExternalLink, MapPin, Users, Calendar, Tag, Globe, Twitter, Linkedin, Github, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CompanyProfilePage() {
  const params = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanyData();
  }, [params.id]);

  async function loadCompanyData() {
    try {
      // Load company details
      const companyRes = await fetch(`/api/companies/${params.id}`);
      const companyData = await companyRes.json();
      setCompany(companyData);

      // Load signals related to this company
      const signalsRes = await fetch('/api/signals');
      const allSignals = await signalsRes.json();
      const companySignals = allSignals.filter(
        (s: Signal) => s.company_id === params.id || s.company_ids?.includes(params.id as string)
      );
      setSignals(companySignals);
    } catch (error) {
      console.error('Error loading company:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-400">Loading company...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Company not found</h3>
          <Link href="/desk/companies" className="text-blue-600 hover:text-blue-700">
            Back to Companies
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
            href="/desk/companies"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Companies
          </Link>

          <div className="flex items-start gap-6">
            {/* Company Logo/Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              {company.logo_url ? (
                <img src={company.logo_url} alt={company.name} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <Building2 className="w-10 h-10 text-white" />
              )}
            </div>

            {/* Company Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">
                {company.name}
              </h1>
              {company.description && (
                <p className="text-neutral-600 mb-4 max-w-3xl">{company.description}</p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
                {company.industry && (
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4" />
                    {company.industry}
                  </div>
                )}
                {company.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {company.location}
                  </div>
                )}
                {company.employee_count && (
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {company.employee_count} employees
                  </div>
                )}
                {company.founded_year && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Founded {company.founded_year}
                  </div>
                )}
              </div>

              {/* Links */}
              <div className="flex flex-wrap gap-3 mt-4">
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-all"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
                {company.social_links?.twitter && (
                  <a
                    href={`https://twitter.com/${company.social_links.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-all border border-blue-200"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </a>
                )}
                {company.social_links?.linkedin && (
                  <a
                    href={company.social_links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-all border border-blue-200"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
                {company.social_links?.github && (
                  <a
                    href={company.social_links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-all border border-neutral-200"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                  </a>
                )}
              </div>

              {/* Tags */}
              {company.tags && company.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {company.tags.map((tag, i) => (
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
            {signals.length} signal{signals.length !== 1 ? 's' : ''} about {company.name}
          </p>
        </div>

        {signals.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
            <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">No signals yet</h3>
            <p className="text-neutral-500 text-sm">
              Signals related to {company.name} will appear here
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
