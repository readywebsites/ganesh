'use client';

import { useState, useEffect } from 'react';

export default function AdminSettings() {
  const [formData, setFormData] = useState({
    websiteName: 'Surat Cha Gaurinandan Ganesh Mahotsav 2026',
    logoUrl: '/logo/official_logo.png',
    heroVideoUrl: '/videos/Prompt_English__Create_an_ul.mp4',
    phone: '+91 261 2849102',
    email: 'contact@suratchagaurinandan.org',
    address: 'Nandanvan 2, Vesu, Surat, Gujarat 395007',
    whatsapp: '+91 99999 99999',
    youtube: 'https://youtube.com',
    instagram: 'https://instagram.com',
    mapLocation: 'Nandanvan 2, Vesu, Surat, Gujarat 395007',
    mapDirectionsUrl: 'https://maps.app.goo.gl/E9d5WymkXrvbuzWf6?g_st=iw',
    mapEmbedUrl: 'https://maps.google.com/maps?q=Nandanvan%202,%20Vesu,%20Surat,%20Gujarat%20395007&t=&z=16&ie=UTF8&iwloc=&output=embed',
    metaTitle: 'Surat Cha Gaurinandan | Official Ganesh Mahotsav 2026',
    metaDescription: 'Experience Surat Cha Gaurinandan Ganesh Mahotsav 2026 with live 24/7 Darshan, events, and community blessings.',
    templeTiming: 'Morning: 6:00 AM - 12:30 PM | Evening: 4:00 PM - 10:00 PM | Aarti: 7:00 AM & 7:30 PM',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setFormData((prev) => ({ ...prev, ...data.data }));
        }
      })
      .catch((err) => console.error('Error fetching settings:', err))
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
        setMsg('General website settings, SEO, and contact details saved successfully!');
      } else {
        setMsg('Failed to update settings.');
      }
    } catch (err) {
      setMsg('Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <h1 className="text-xl font-bold text-amber-400 font-heading">GENERAL SYSTEM & SEO SETTINGS</h1>
        <p className="text-xs text-zinc-400 mt-1">Manage website name, logo, hero video, contact details, Google Map embed, and SEO metadata.</p>
      </div>

      {msg && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-xl">
          {msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-6 text-xs">
        {/* Website Identity */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-amber-300 border-b border-zinc-800 pb-2">🏰 Website Identity & Hero Assets</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1">Website Name *</label>
              <input
                type="text"
                required
                value={formData.websiteName}
                onChange={(e) => setFormData({ ...formData, websiteName: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Logo URL *</label>
              <input
                type="text"
                required
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Hero Video Asset URL</label>
            <input
              type="text"
              value={formData.heroVideoUrl}
              onChange={(e) => setFormData({ ...formData, heroVideoUrl: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-amber-300 border-b border-zinc-800 pb-2">📞 Contact & Mandap Location</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">WhatsApp Support</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Temple Mandap Address *</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-amber-300 border-b border-zinc-800 pb-2">🌐 Social Media Channels</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1">YouTube Channel URL</label>
              <input
                type="url"
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Instagram Profile URL</label>
              <input
                type="url"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Google Map */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-amber-300 border-b border-zinc-800 pb-2">🗺️ Google Map Settings</h3>
          <div>
            <label className="block text-zinc-400 mb-1">Google Maps Embed URL</label>
            <input
              type="text"
              value={formData.mapEmbedUrl}
              onChange={(e) => setFormData({ ...formData, mapEmbedUrl: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">Google Maps Directions Link</label>
            <input
              type="text"
              value={formData.mapDirectionsUrl}
              onChange={(e) => setFormData({ ...formData, mapDirectionsUrl: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>
        </div>

        {/* SEO Settings */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-amber-300 border-b border-zinc-800 pb-2">🔍 SEO & Metadata Settings</h3>
          <div>
            <label className="block text-zinc-400 mb-1">SEO Title Tag</label>
            <input
              type="text"
              value={formData.metaTitle}
              onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">SEO Meta Description</label>
            <textarea
              rows={2}
              value={formData.metaDescription}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white"
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 font-bold text-black bg-amber-500 hover:bg-amber-400 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-amber-500/20"
        >
          {saving ? 'Saving Website Settings...' : 'Save All Settings'}
        </button>
      </form>
    </div>
  );
}
