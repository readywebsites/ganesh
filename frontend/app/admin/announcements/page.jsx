'use client';

import { useState, useEffect } from 'react';

export default function AdminAnnouncements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'notification',
    priority: 'medium',
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    active: true,
    link: '',
  });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/announcements');
      const data = await res.json();
      if (data.success) setItems(data.data || []);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setItems(items.filter((i) => i._id !== id));
        showToast('Announcement deleted');
      } else {
        showToast(data.message || 'Delete failed', 'error');
      }
    } catch (err) {
      showToast('Failed to delete', 'error');
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const res = await fetch(`/api/announcements/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !item.active }),
      });
      const data = await res.json();
      if (data.success) {
        setItems(items.map((i) => (i._id === item._id ? data.data : i)));
        showToast(`Announcement ${!item.active ? 'activated' : 'disabled'}`);
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editingItem ? `/api/announcements/${editingItem._id}` : '/api/announcements';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        fetchItems();
        setModalOpen(false);
        setEditingItem(null);
        showToast(editingItem ? 'Announcement updated!' : 'Announcement created!');
        setFormData({
          title: '',
          content: '',
          type: 'notification',
          priority: 'medium',
          publishDate: new Date().toISOString().split('T')[0],
          expiryDate: '',
          active: true,
          link: '',
        });
      } else {
        showToast(data.message || 'Save failed', 'error');
      }
    } catch (err) {
      showToast('Failed to save announcement', 'error');
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      content: '',
      type: 'notification',
      priority: 'medium',
      publishDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      active: true,
      link: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      type: item.type || 'notification',
      priority: item.priority || 'medium',
      publishDate: item.publishDate ? new Date(item.publishDate).toISOString().split('T')[0] : '',
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
      active: item.active ?? true,
      link: item.link || '',
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
          <h1 className="text-xl font-bold text-amber-400 font-heading">ANNOUNCEMENTS & TICKER CMS</h1>
          <p className="text-xs text-zinc-400 mt-1">Manage priority alerts, ticker messages, news updates, publish dates, and expiry limits.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black rounded-xl shadow-lg shadow-amber-500/20"
        >
          + Create Announcement
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-zinc-500 bg-zinc-900 rounded-2xl">Loading announcements...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 bg-zinc-900 rounded-2xl">No announcements created.</div>
        ) : (
          items.map((item) => (
            <div key={item._id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                    {item.type}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      item.priority === 'urgent'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : item.priority === 'high'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {item.priority || 'medium'} Priority
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                      item.active ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                    }`}
                    onClick={() => handleToggleActive(item)}
                  >
                    {item.active ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white">{item.title}</h3>
                <p className="text-xs text-zinc-400">{item.content}</p>
                {item.publishDate && (
                  <p className="text-[10px] text-zinc-500 font-mono pt-1">
                    Published: {new Date(item.publishDate).toLocaleDateString()}
                    {item.expiryDate ? ` • Expires: ${new Date(item.expiryDate).toLocaleDateString()}` : ''}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="px-3 py-1.5 bg-blue-900/50 hover:bg-blue-800 text-blue-300 text-xs rounded-xl"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleActive(item)}
                  className="px-3 py-1.5 bg-zinc-800 text-zinc-300 text-xs rounded-xl hover:bg-zinc-700"
                >
                  {item.active ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-400 text-xs rounded-xl"
                >
                  Delete
                </button>
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
              {editingItem ? 'Edit Announcement' : 'Create New Announcement'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="ticker">Ticker Banner</option>
                    <option value="notification">Notification</option>
                    <option value="news">News Article</option>
                    <option value="popup">Popup Modal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Pass Distribution Notice"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Content / Message *</label>
                <textarea
                  required
                  rows="3"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Detailed announcement text..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">Publish Date</label>
                  <input
                    type="date"
                    value={formData.publishDate}
                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Optional Link URL</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                />
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
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
