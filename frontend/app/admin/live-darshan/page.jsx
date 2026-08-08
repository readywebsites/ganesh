'use client';

import { useState, useEffect } from 'react';

export default function AdminLiveDarshan() {
  const [formData, setFormData] = useState({
    isLive: true,
    liveTitle: 'Live 24x7 Garbh Gruh Mahotsav Darshan',
    liveDescription: 'Stream sacred morning & evening Aarti live from Garbh Gruh.',
    liveThumbnail: '/images/darshan_thumbnail.jpg',
    youtubeLiveUrl: '',
    facebookLiveUrl: '',
    instagramLiveUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/darshan')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setFormData((prev) => ({ ...prev, ...data.data }));
        }
      })
      .catch((err) => console.error('Error fetching live darshan settings:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/darshan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setMsg('Live Darshan broadcast settings updated successfully!');
      } else {
        setMsg('Failed to update live stream settings.');
      }
    } catch (err) {
      setMsg('Error saving stream settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-500">Loading Live Darshan settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-amber-400 font-heading">LIVE DARSHAN BROADCAST MANAGER</h1>
          <p className="text-xs text-zinc-400 mt-1">Control live status, stream URLs, thumbnails, and broadcast details.</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`w-3 h-3 rounded-full ${formData.isLive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
          <span className="text-xs font-bold text-zinc-300 font-mono">
            {formData.isLive ? 'LIVE NOW' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {msg && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-xl">
          {msg}
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Live Status Toggle */}
          <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
            <div>
              <p className="font-bold text-white">Live Darshan Broadcast Status</p>
              <p className="text-[10px] text-zinc-400">Toggle live stream indicator ON or OFF on the public website.</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isLive: !formData.isLive })}
              className={`px-4 py-2 font-bold rounded-xl transition-all ${
                formData.isLive
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {formData.isLive ? '● Live ON' : '○ Offline'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-zinc-300 mb-1">Live Stream Title</label>
              <input
                type="text"
                value={formData.liveTitle}
                onChange={(e) => setFormData({ ...formData, liveTitle: e.target.value })}
                placeholder="Live 24x7 Garbh Gruh Mahotsav Darshan"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-300 mb-1">Thumbnail Image URL</label>
              <input
                type="text"
                value={formData.liveThumbnail}
                onChange={(e) => setFormData({ ...formData, liveThumbnail: e.target.value })}
                placeholder="/images/darshan_thumbnail.jpg"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-300 mb-1">Live Stream Description</label>
            <textarea
              rows={2}
              value={formData.liveDescription}
              onChange={(e) => setFormData({ ...formData, liveDescription: e.target.value })}
              placeholder="Stream sacred morning & evening Aarti live from Garbh Gruh."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="pt-2 border-t border-zinc-800 space-y-3">
            <h4 className="font-bold text-amber-300 text-sm">📺 Broadcast Platform Links</h4>

            <div>
              <label className="block font-bold text-zinc-300 mb-1">▶️ YouTube Live Stream Embed URL</label>
              <input
                type="text"
                value={formData.youtubeLiveUrl}
                onChange={(e) => setFormData({ ...formData, youtubeLiveUrl: e.target.value })}
                placeholder="https://www.youtube.com/embed/live_stream?channel=UC..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-300 mb-1">📘 Facebook Live Stream Link</label>
              <input
                type="text"
                value={formData.facebookLiveUrl}
                onChange={(e) => setFormData({ ...formData, facebookLiveUrl: e.target.value })}
                placeholder="https://facebook.com/live/..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-300 mb-1">📸 Instagram Live Stream Link</label>
              <input
                type="text"
                value={formData.instagramLiveUrl}
                onChange={(e) => setFormData({ ...formData, instagramLiveUrl: e.target.value })}
                placeholder="https://instagram.com/live/..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 font-bold text-black bg-amber-500 hover:bg-amber-400 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-amber-500/20"
          >
            {saving ? 'Saving Stream Settings...' : 'Publish Live Stream Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
