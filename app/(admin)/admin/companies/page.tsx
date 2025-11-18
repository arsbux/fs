'use client';

import { useEffect, useState } from 'react';
import { Company } from '@/types';
import { Building2, Edit3, Save, X, ExternalLink, Image } from 'lucide-react';

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLogoUrl, setEditingLogoUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    const res = await fetch('/api/companies');
    const data = await res.json();
    setCompanies(data);
    setLoading(false);
  }

  async function updateCompanyLogo(companyId: string, logoUrl: string) {
    try {
      const res = await fetch(`/api/companies/${companyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo_url: logoUrl }),
      });

      if (res.ok) {
        setCompanies(companies.map(company => 
          company.id === companyId 
            ? { ...company, logo_url: logoUrl }
            : company
        ));
        setEditingId(null);
        setEditingLogoUrl('');
      }
    } catch (error) {
      console.error('Error updating logo:', error);
    }
  }

  function startEditing(company: Company) {
    setEditingId(company.id);
    setEditingLogoUrl(company.logo_url || '');
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingLogoUrl('');
  }

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Company Logos</h1>
              <p className="text-neutral-600 text-sm">Manage company profile pictures and logos</p>
            </div>
          </div>
          
          <input
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md border border-neutral-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-neutral-400">Loading companies...</div>
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Logo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Website</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Logo URL</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-100">
                  {filteredCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {company.logo_url ? (
                            <img 
                              src={company.logo_url} 
                              alt={company.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <Building2 className={`w-6 h-6 text-neutral-400 ${company.logo_url ? 'hidden' : ''}`} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-neutral-900">{company.name}</div>
                        {company.description && (
                          <div className="text-xs text-neutral-500 mt-0.5 truncate max-w-xs">
                            {company.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {company.website ? (
                          <a 
                            href={company.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Visit
                          </a>
                        ) : (
                          <span className="text-neutral-400 text-sm">No website</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === company.id ? (
                          <input
                            type="url"
                            value={editingLogoUrl}
                            onChange={(e) => setEditingLogoUrl(e.target.value)}
                            placeholder="https://example.com/logo.png"
                            className="w-full max-w-xs border border-neutral-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="text-sm text-neutral-600 truncate max-w-xs">
                            {company.logo_url || 'No logo set'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === company.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateCompanyLogo(company.id, editingLogoUrl)}
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
                            onClick={() => startEditing(company)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit Logo
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