'use client';

import { useState } from 'react';

interface CompanyFormProps {
  onSuccess: () => void;
}

export default function CompanyForm({ onSuccess }: CompanyFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

    const res = await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        description: formData.description || undefined,
        website: formData.website || undefined,
        tags,
      }),
    });

    setLoading(false);

    if (res.ok) {
      setFormData({ name: '', description: '', website: '', tags: '' });
      onSuccess();
    } else {
      alert('Error creating company');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">Company Name</label>
        <input
          required
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">Website</label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
          placeholder="https://example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">Tags (comma-separated)</label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
          placeholder="saas, healthcare, b2b"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-neutral-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-neutral-800 disabled:opacity-50 transition-all"
      >
        {loading ? 'Saving...' : 'Add Company'}
      </button>
    </form>
  );
}
