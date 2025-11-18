'use client';

import { useEffect, useState } from 'react';
import { Person } from '@/types';
import { User, Edit3, Save, X, Building2, Twitter, Linkedin, Github, Globe } from 'lucide-react';

export default function AdminPeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAvatarUrl, setEditingAvatarUrl] = useState('');
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

  async function updatePersonAvatar(personId: string, avatarUrl: string) {
    try {
      const res = await fetch(`/api/people/${personId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: avatarUrl }),
      });

      if (res.ok) {
        setPeople(people.map(person => 
          person.id === personId 
            ? { ...person, avatar_url: avatarUrl }
            : person
        ));
        setEditingId(null);
        setEditingAvatarUrl('');
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
    }
  }

  function startEditing(person: Person) {
    setEditingId(person.id);
    setEditingAvatarUrl(person.avatar_url || '');
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingAvatarUrl('');
  }

  const filteredPeople = people.filter(person =>
    person.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">People Profiles</h1>
              <p className="text-neutral-600 text-sm">Manage people profile pictures and avatars</p>
            </div>
          </div>
          
          <input
            type="text"
            placeholder="Search people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md border border-neutral-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-neutral-400">Loading people...</div>
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Avatar</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Person</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Social</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Avatar URL</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-100">
                  {filteredPeople.map((person) => (
                    <tr key={person.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center overflow-hidden">
                          {person.avatar_url ? (
                            <img 
                              src={person.avatar_url} 
                              alt={person.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <User className={`w-6 h-6 text-white ${person.avatar_url ? 'hidden' : ''}`} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-neutral-900">{person.name}</div>
                        {person.title && (
                          <div className="text-xs text-neutral-500 mt-0.5">{person.title}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {person.company_name ? (
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <Building2 className="w-4 h-4" />
                            {person.company_name}
                          </div>
                        ) : (
                          <span className="text-neutral-400 text-sm">No company</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {person.social_links?.twitter && (
                            <div className="w-6 h-6 bg-blue-50 rounded flex items-center justify-center">
                              <Twitter className="w-3 h-3 text-blue-600" />
                            </div>
                          )}
                          {person.social_links?.linkedin && (
                            <div className="w-6 h-6 bg-blue-50 rounded flex items-center justify-center">
                              <Linkedin className="w-3 h-3 text-blue-600" />
                            </div>
                          )}
                          {person.social_links?.github && (
                            <div className="w-6 h-6 bg-neutral-100 rounded flex items-center justify-center">
                              <Github className="w-3 h-3 text-neutral-700" />
                            </div>
                          )}
                          {person.social_links?.website && (
                            <div className="w-6 h-6 bg-neutral-100 rounded flex items-center justify-center">
                              <Globe className="w-3 h-3 text-neutral-700" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editingId === person.id ? (
                          <input
                            type="url"
                            value={editingAvatarUrl}
                            onChange={(e) => setEditingAvatarUrl(e.target.value)}
                            placeholder="https://example.com/avatar.jpg"
                            className="w-full max-w-xs border border-neutral-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        ) : (
                          <div className="text-sm text-neutral-600 truncate max-w-xs">
                            {person.avatar_url || 'No avatar set'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === person.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updatePersonAvatar(person.id, editingAvatarUrl)}
                              className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                              <Save className="w-4 h-4" />
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="flex items-center gap-1 text-neutral-600 hover:text-neutral-700 text-sm font-medium"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditing(person)}
                            className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-medium"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit Avatar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}