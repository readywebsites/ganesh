'use client';

import { useState, useEffect } from 'react';

export default function AdminInstagram() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    postUrl: '',
    type: 'post',
    mediaUrl: '',
    likes: '1.2K',
    comments: '180',
  });

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/instagram');
      const data = await res.json();
      if (data.success) setPosts(data.data || []);
    } catch (err) {
      console.error('Error fetching Instagram posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this Instagram post link?')) return;
    try {
      const res = await fetch(`/api/instagram/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) setPosts(posts.filter((p) => p._id !== id));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setPosts([data.data, ...posts]);
        setModalOpen(false);
        setFormData({ title: '', postUrl: '', type: 'post', mediaUrl: '', likes: '1.2K', comments: '180' });
      }
    } catch (err) {
      alert('Failed to save post');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-amber-400 font-heading">INSTAGRAM SOCIAL HUB CMS</h1>
          <p className="text-xs text-zinc-400 mt-1">Manage featured Instagram posts, reels, stories, and links.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black rounded-lg"
        >
          + Add Instagram Post / Reel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-zinc-500 bg-zinc-900 rounded-2xl">
            Loading Instagram items...
          </div>
        ) : posts.length === 0 ? (
          <div className="col-span-full p-8 text-center text-zinc-500 bg-zinc-900 rounded-2xl">
            No Instagram posts found.
          </div>
        ) : (
          posts.map((p) => (
            <div key={p._id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded">
                    {p.type}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">❤️ {p.likes} • 💬 {p.comments}</span>
                </div>
                <h3 className="font-bold text-sm text-white">{p.title || 'Instagram Entry'}</h3>
                <a href={p.postUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:underline block truncate mt-1">
                  🔗 {p.postUrl}
                </a>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-zinc-800">
                <button
                  onClick={() => handleDelete(p._id)}
                  className="px-3 py-1 bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-400 text-xs rounded"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-zinc-900 border border-amber-500/30 p-6 rounded-2xl max-w-md w-full text-white space-y-4">
            <h3 className="text-base font-bold text-amber-400">Add Instagram Post / Reel</h3>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Title / Caption</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Day 1 Divine Darshan Reel"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Content Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                >
                  <option value="post">Post</option>
                  <option value="reel">Reel</option>
                  <option value="story">Story</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Instagram Post / Reel URL *</label>
                <input
                  type="url"
                  required
                  value={formData.postUrl}
                  onChange={(e) => setFormData({ ...formData, postUrl: e.target.value })}
                  placeholder="https://www.instagram.com/p/..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Media Image URL (Optional Preview)</label>
                <input
                  type="text"
                  value={formData.mediaUrl}
                  onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-black font-bold rounded hover:bg-amber-400"
                >
                  Save Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
