'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/api';

export default function AdminInstagram() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    postUrl: '',
    type: 'post',
    mediaUrl: '',
    likes: '1.2K',
    comments: '180',
  });

  const fetchLiveFeed = async (forceRefresh = false) => {
    if (forceRefresh) setSyncing(true);
    else setLoading(true);

    try {
      const endpoint = getApiUrl(`/instagram/feed/?limit=20${forceRefresh ? '&refresh=true' : ''}`);
      const res = await fetch(endpoint, { cache: 'no-store' });
      const data = await res.json();
      if (data.data) {
        setPosts(data.data);
      }
      setApiStatus({
        status: data.status,
        configured: data.configured,
        source: data.source,
        message: data.message,
        count: data.count,
        cached: data.cached,
      });
    } catch (err) {
      console.error('Error fetching Instagram posts:', err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchLiveFeed();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Remove this post from view?')) return;
    setPosts(posts.filter((p) => (p.id || p._id) !== id));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-amber-400 font-heading flex items-center gap-2">
            <span>📸</span> INSTAGRAM LIVE FEED &amp; SOCIAL CMS
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time feed sync via Meta Graph API, token monitoring, and social media showcase.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchLiveFeed(true)}
            disabled={syncing || loading}
            className="px-4 py-2 text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <span>{syncing ? '🔄 Syncing...' : '🔄 Live Sync from Meta'}</span>
          </button>
        </div>
      </div>

      {/* Meta API Integration Status Banner */}
      <div className="p-5 rounded-2xl bg-zinc-950 border border-amber-500/20 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span
              className={`w-3 h-3 rounded-full ${
                apiStatus?.status === 'live'
                  ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]'
                  : 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
              }`}
            />
            <div>
              <h3 className="text-sm font-bold text-white">
                {apiStatus?.status === 'live'
                  ? 'Meta Graph API: Connected & Live'
                  : 'Meta Graph API: Pending Credentials in .env'}
              </h3>
              <p className="text-xs text-zinc-400">
                Source: <span className="font-mono text-amber-300">{apiStatus?.source || 'Detecting...'}</span>
                {apiStatus?.cached && <span className="ml-2 text-zinc-500">(Cached for performance)</span>}
              </p>
            </div>
          </div>
          <div className="text-xs text-zinc-400">
            Posts loaded: <strong className="text-amber-300">{posts.length}</strong>
          </div>
        </div>

        {apiStatus?.status !== 'live' && (
          <div className="pt-3 border-t border-zinc-800 text-xs text-zinc-300 space-y-2">
            <p className="font-semibold text-amber-400">🔧 How to connect your Live Instagram Feed:</p>
            <p className="text-[11px] text-zinc-400">
              Add your Long-Lived User Access Token and App Secret to your <code className="text-amber-300 bg-zinc-900 px-1 py-0.5 rounded">backend/.env</code> file:
            </p>
            <pre className="bg-zinc-900 p-3 rounded-xl text-[11px] font-mono text-amber-200 border border-zinc-800 overflow-x-auto">
{`INSTAGRAM_ACCESS_TOKEN=your_long_lived_instagram_token
INSTAGRAM_APP_SECRET=your_meta_app_secret
INSTAGRAM_APP_ID=your_meta_app_id
INSTAGRAM_USER_ID=me
INSTAGRAM_CACHE_TIMEOUT=300`}
            </pre>
            <p className="text-[10px] text-zinc-500">
              Once added, click <strong>Live Sync from Meta</strong> above to instantly load live posts directly on the live website and here.
            </p>
          </div>
        )}
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center text-zinc-500 bg-zinc-900 rounded-2xl animate-pulse">
            Fetching Instagram feed...
          </div>
        ) : posts.length === 0 ? (
          <div className="col-span-full p-12 text-center text-zinc-500 bg-zinc-900 rounded-2xl">
            No Instagram posts found.
          </div>
        ) : (
          posts.map((p, idx) => {
            const isReel = p.is_reel || p.media_type === 'VIDEO';
            const imgUrl = p.thumbnail_url || p.media_url;

            return (
              <div
                key={p.id || p._id || idx}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-amber-500/40 transition-colors"
              >
                {/* Media Image */}
                <div className="aspect-square relative w-full bg-black flex items-center justify-center overflow-hidden">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={p.caption || 'Instagram Post'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl text-zinc-600">📸</div>
                  )}

                  <div className="absolute top-2 right-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-black/80 text-amber-300 border border-amber-500/30 rounded backdrop-blur-md">
                      {isReel ? '🎬 Reel' : p.media_type || 'Post'}
                    </span>
                  </div>
                </div>

                {/* Content & Links */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
                      <span>{p.formatted_date || 'Live'}</span>
                      <span className="font-mono text-amber-400/80">@{p.username || 'suratchagaurinandan'}</span>
                    </div>
                    <p className="text-xs text-zinc-200 line-clamp-3 leading-relaxed">
                      {p.caption || 'Instagram update'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <a
                      href={p.permalink || p.postUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1"
                    >
                      <span>Open on IG</span>
                      <span>↗</span>
                    </a>

                    <button
                      onClick={() => handleDelete(p.id || p._id)}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-400 text-[11px] rounded transition-colors"
                    >
                      Hide
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
