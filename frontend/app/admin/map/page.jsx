'use client';

import { useState, useEffect } from 'react';

export default function AdminMapSettings() {
  const [formData, setFormData] = useState({
    mapLocation: 'Nandanvan 2, Vesu, Surat, Gujarat 395007',
    mapDirectionsUrl: 'https://maps.app.goo.gl/E9d5WymkXrvbuzWf6?g_st=iw',
    mapEmbedUrl: 'https://maps.google.com/maps?q=Nandanvan%202,%20Vesu,%20Surat,%20Gujarat%20395007&t=&z=16&ie=UTF8&iwloc=&output=embed',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setFormData({
            mapLocation: data.data.mapLocation || '',
            mapDirectionsUrl: data.data.mapDirectionsUrl || '',
            mapEmbedUrl: data.data.mapEmbedUrl || '',
          });
        }
      })
      .catch((err) => console.error('Error fetching map settings:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setMsg('Google Map location & direction links updated successfully!');
      } else {
        setMsg('Failed to update map settings.');
      }
    } catch (err) {
      setMsg('Error saving map settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-500">Loading Map settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <h1 className="text-xl font-bold text-amber-400 font-heading">GOOGLE MAP & LOCATION SETTINGS</h1>
        <p className="text-xs text-zinc-400 mt-1">Configure temple venue address, Google Maps direction URL, and interactive embed frame.</p>
      </div>

      {msg && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-xl">
          {msg}
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-zinc-300 mb-1">📍 Temple Location Display Text</label>
            <input
              type="text"
              value={formData.mapLocation}
              onChange={(e) => setFormData({ ...formData, mapLocation: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-300 mb-1">🗺️ Google Maps Directions URL</label>
            <input
              type="url"
              value={formData.mapDirectionsUrl}
              onChange={(e) => setFormData({ ...formData, mapDirectionsUrl: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white font-mono"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-300 mb-1">🖼️ Google Maps Embed URL</label>
            <textarea
              rows="3"
              value={formData.mapEmbedUrl}
              onChange={(e) => setFormData({ ...formData, mapEmbedUrl: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white font-mono"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 font-bold text-black bg-amber-500 hover:bg-amber-400 rounded-xl transition-all disabled:opacity-50"
          >
            {saving ? 'Updating Map...' : 'Save Google Map Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
