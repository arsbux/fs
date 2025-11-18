'use client';

import { useEffect, useState } from 'react';
import { Person } from '@/types';
import { User, Building2, Twitter, Linkedin, Github, Globe, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPeople();
  }, []);

  async function loadPeople() {
    const res = await fetch('/api/people');
    const data = await res.json();
    setPeople(data);
    setLoading(false);
  }

  const filteredPeople = people.filter(person =>
    person.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (person.tags && person.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">People</h1>
              <p className="text-neutral-600 text-sm">{people.length} people tracked</p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-6">
            <input
              type="text"
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-neutral-400">Loading people...</div>
          </div>
        ) : filteredPeople.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">
              {searchQuery ? 'No people found' : 'No people yet'}
            </h3>
            <p className="text-neutral-500 text-sm">
              {searchQuery ? 'Try a different search term' : 'People will appear here once you sync data from integrations'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPeople.map((person) => (
              <Link
                key={person.id}
                href={`/desk/people/${person.id}`}
                className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-neutral-300 hover:shadow-sm transition-all cursor-pointer block"
              >
                {/* Avatar & Name */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                    {person.avatar_url ? (
                      <img src={person.avatar_url} alt={person.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-neutral-900 truncate">
                      {person.name}
                    </h3>
                    {person.title && (
                      <p className="text-sm text-neutral-600 truncate">{person.title}</p>
                    )}
                  </div>
                </div>

                {/* Company */}
                {person.company_name && (
                  <div className="flex items-center gap-2 mb-3 text-sm text-neutral-600">
                    <Building2 className="w-4 h-4" />
                    <span className="truncate">{person.company_name}</span>
                  </div>
                )}

                {/* Bio */}
                {person.bio && (
                  <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
                    {person.bio}
                  </p>
                )}

                {/* Social Links */}
                {person.social_links && Object.keys(person.social_links).length > 0 && (
                  <div className="flex gap-2 mb-3">
                    {person.social_links.twitter && (
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Twitter className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    {person.social_links.linkedin && (
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Linkedin className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    {person.social_links.github && (
                      <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
                        <Github className="w-4 h-4 text-neutral-700" />
                      </div>
                    )}
                    {person.social_links.website && (
                      <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
                        <Globe className="w-4 h-4 text-neutral-700" />
                      </div>
                    )}
                  </div>
                )}

                {/* Tags */}
                {person.tags && person.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {person.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                    {person.tags.length > 3 && (
                      <span className="px-2 py-1 text-neutral-500 text-xs">
                        +{person.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <span className="text-xs text-neutral-500">
                    Added {new Date(person.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 text-neutral-600 text-sm font-medium">
                    View Profile <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}