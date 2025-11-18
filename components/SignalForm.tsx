'use client';

import { useState, useEffect } from 'react';
import { Company, SignalType, Credibility } from '@/types';
import { SIGNAL_TYPES, CREDIBILITY_OPTIONS } from '@/lib/constants';

interface SignalFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function SignalForm({ onSuccess, onCancel }: SignalFormProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showNewCompany, setShowNewCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [formData, setFormData] = useState({
    headline: '',
    summary: '',
    source_link: '',
    why_it_matters: '',
    recommended_action: '',
    score: 5,
    credibility: 'medium' as Credibility,
    signal_type: 'funding' as SignalType,
    tags: '',
    company_id: '',
    company_name: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    const res = await fetch('/api/companies');
    const data = await res.json();
    setCompanies(data);
  }

  async function handleAddCompany() {
    if (!newCompanyName.trim()) return;
    
    const res = await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCompanyName.trim(), tags: [] }),
    });

    if (res.ok) {
      const newCompany = await res.json();
      setCompanies([...companies, newCompany]);
      setFormData({ ...formData, company_id: newCompany.id, company_name: newCompany.name });
      setNewCompanyName('');
      setShowNewCompany(false);
    } else {
      alert('Error creating company');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const selectedCompany = companies.find(c => c.id === formData.company_id);
    const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

    const res = await fetch('/api/signals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        company_name: selectedCompany?.name || '',
        tags,
        status: 'draft',
      }),
    });

    setLoading(false);

    if (res.ok) {
      onSuccess();
    } else {
      alert('Error creating signal');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
        <div className="flex gap-2">
          <select
            required
            value={formData.company_id}
            onChange={(e) => {
              const company = companies.find(c => c.id === e.target.value);
              setFormData({ ...formData, company_id: e.target.value, company_name: company?.name || '' });
            }}
            className="flex-1 border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Select a company</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowNewCompany(!showNewCompany)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 whitespace-nowrap"
          >
            + New
          </button>
        </div>
        
        {showNewCompany && (
          <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">New Company Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2"
                placeholder="Enter company name"
              />
              <button
                type="button"
                onClick={handleAddCompany}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewCompany(false);
                  setNewCompanyName('');
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Signal Type</label>
        <select
          required
          value={formData.signal_type}
          onChange={(e) => setFormData({ ...formData, signal_type: e.target.value as SignalType })}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          {SIGNAL_TYPES.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
        <input
          required
          type="text"
          value={formData.headline}
          onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Score 9 — Funding — Acme Health raises $8M"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Summary (1 sentence)</label>
        <textarea
          required
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Source Link</label>
        <input
          required
          type="url"
          value={formData.source_link}
          onChange={(e) => setFormData({ ...formData, source_link: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Why it matters (1-2 lines)</label>
        <textarea
          required
          value={formData.why_it_matters}
          onChange={(e) => setFormData({ ...formData, why_it_matters: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Recommended Action (1 line)</label>
        <input
          required
          type="text"
          value={formData.recommended_action}
          onChange={(e) => setFormData({ ...formData, recommended_action: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Score (0-10)</label>
          <input
            required
            type="number"
            min="0"
            max="10"
            value={formData.score}
            onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) })}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Credibility</label>
          <select
            required
            value={formData.credibility}
            onChange={(e) => setFormData({ ...formData, credibility: e.target.value as Credibility })}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            {CREDIBILITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="saas, healthcare, series-a"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Signal'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
