'use client';

import { useState, useEffect } from 'react';

export default function AdminVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    videoType: 'youtube',
    thumbnailUrl: '',
    category: 'Aarti & Utsav',
    featured: false,
    order: 0,
  });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/videos');
      const data = await res.json();
      if (data.success) setVideos(data.data || []);
    } catch (err) {
      console.error('Error loading videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this video item?')) return;
    try {
      const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setVideos(videos.filter((v) => v._id !== id));
        showToast('Video entry deleted');
      } else {
        showToast(data.message || 'Delete failed', 'error');
      }
    } catch (err) {
      showToast('Failed to delete video', 'error');
    }
  };

  const toggleFeatured = async (video) => {
    try {
      const res = await fetch(`/api/videos/${video._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !video.featured }),
      });
      const data = await res.json();
      if (data.success) {
        setVideos(videos.map((v) => (v._id === video._id ? data.data : v)));
        showToast(`Video ${!video.featured ? 'marked as Featured' : 'removed from Featured'}`);
      }
    } catch (err) {
      showToast('Failed to update featured state', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editingVideo ? `/api/videos/${editingVideo._id}` : '/api/videos';
      const method = editingVideo ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, order: Number(formData.order) }),
      });
      const data = await res.json();
      if (data.success) {
        fetchVideos();
        setModalOpen(false);
        setEditingVideo(null);
        showToast(editingVideo ? 'Video updated!' : 'New video published!');
        setFormData({
          title: '',
          videoUrl: '',
          videoType: 'youtube',
          thumbnailUrl: '',
          category: 'Aarti & Utsav',
          featured: false,
          order: 0,
        });
      } else {
        showToast(data.message || 'Save failed', 'error');
      }
    } catch (err) {
      showToast('Failed to save video', 'error');
    }
  };

  const openCreateModal = () => {
    setEditingVideo(null);
    setFormData({
      title: '',
      videoUrl: '',
      videoType: 'youtube',
      thumbnailUrl: '',
      category: 'Aarti & Utsav',
      featured: false,
      order: videos.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (v) => {
    setEditingVideo(v);
    setFormData({
      title: v.title,
      videoUrl: v.videoUrl,
      videoType: v.videoType || 'youtube',
      thumbnailUrl: v.thumbnailUrl || '',
      category: v.category || 'Aarti & Utsav',
      featured: v.featured || false,
      order: v.order || 0,
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl border text-xs font-semibold shadow-2xl backdrop-blur-xl transition-all ${
            toast.type === 'error'
              ? 'bg-red-950/90 border-red-800 text-red-300'
              : 'bg-emerald-950/90 border-emerald-800 text-emerald-300'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-amber-400 font-heading">VIDEO GALLERY CMS</h1>
          <p className="text-xs text-zinc-400 mt-1">Manage YouTube videos, Instagram reels, featured clips, and custom thumbnails.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black rounded-xl shadow-lg shadow-amber-500/20"
        >
          + Add New Video
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-zinc-500 bg-zinc-900 rounded-2xl">
            Loading video gallery...
          </div>
        ) : videos.length === 0 ? (
          <div className="col-span-full p-8 text-center text-zinc-500 bg-zinc-900 rounded-2xl">
            No video records found.
          </div>
        ) : (
          videos.map((v) => (
            <div key={v._id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between group">
              {v.thumbnailUrl && (
                <div className="relative h-40 w-full overflow-hidden bg-black">
                  <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  {v.featured && (
                    <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 bg-amber-500 text-black rounded">
                      ★ Featured
                    </span>
                  )}
                </div>
              )}

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                      {v.videoType}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">Order #{v.order}</span>
                  </div>
                  <h3 className="font-bold text-sm text-white">{v.title}</h3>
                  <p className="text-xs text-amber-300/80 mt-1 truncate font-mono">{v.videoUrl}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Category: {v.category}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                  <button
                    onClick={() => toggleFeatured(v)}
                    className={`text-[10px] ${v.featured ? 'text-amber-400 font-bold' : 'text-zinc-400 hover:text-white'}`}
                  >
                    {v.featured ? '★ Featured' : '☆ Feature'}
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(v)}
                      className="px-3 py-1 bg-blue-900/50 hover:bg-blue-800 text-blue-300 text-xs rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(v._id)}
                      className="px-3 py-1 bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-400 text-xs rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-zinc-900 border border-amber-500/30 p-6 rounded-2xl max-w-md w-full text-white space-y-4">
            <h3 className="text-base font-bold text-amber-400">
              {editingVideo ? 'Edit Video Entry' : 'Add New Video'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Video Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Maha Aarti Highlight Video"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Video Platform Type</label>
                <select
                  value={formData.videoType}
                  onChange={(e) => setFormData({ ...formData, videoType: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="youtube">YouTube Video</option>
                  <option value="instagram">Instagram Reel / Video</option>
                  <option value="upload">Custom Direct Upload</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Video URL *</label>
                <input
                  type="url"
                  required
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Aarti & Rituals"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Order #</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Thumbnail Image URL</label>
                <input
                  type="text"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="featured-video"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 bg-zinc-950"
                />
                <label htmlFor="featured-video" className="text-zinc-300 cursor-pointer">
                  Mark as Featured Video
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400"
                >
                  Save Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
