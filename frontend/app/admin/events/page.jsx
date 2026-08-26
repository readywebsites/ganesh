'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/api';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    bannerUrl: '',
    order: 1,
    active: true,
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/events/?all=true'));
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : data.data || data.events || [];
      if (Array.isArray(rawList)) {
        const sorted = [...rawList].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
        setEvents(sorted);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch(getApiUrl(`/events/${id}/`), { method: 'DELETE' });
      const data = await res.json();
      if (data.success || res.ok) {
        setEvents(events.filter((e) => (e._id || e.id) !== id));
      }
    } catch (err) {
      alert('Failed to delete event');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const id = editingEvent ? (editingEvent._id || editingEvent.id) : null;
      const url = id ? getApiUrl(`/events/${id}/`) : getApiUrl('/events/');
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          day: formData.date,
          order: Number(formData.order) || 1,
          is_active: Boolean(formData.active),
        }),
      });
      const data = await res.json();
      if (data.success || res.ok) {
        fetchEvents();
        setModalOpen(false);
        setEditingEvent(null);
        setFormData({ title: '', description: '', date: '', time: '', location: '', bannerUrl: '', order: 1, active: true });
      } else {
        alert(data.message || 'Failed to save event');
      }
    } catch (err) {
      alert('Failed to save event');
    }
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormData({ title: '', description: '', date: '', time: '', location: '', bannerUrl: '', order: events.length + 1, active: true });
    setModalOpen(true);
  };

  const openEditModal = (ev) => {
    setEditingEvent(ev);
    setFormData({
      title: ev.title || '',
      description: ev.description || ev.desc || '',
      date: ev.date || ev.day || '',
      time: ev.time || '',
      location: ev.location || '',
      bannerUrl: ev.bannerUrl || ev.banner_url || '',
      order: ev.order || 1,
      active: ev.active ?? ev.is_active ?? true,
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-amber-400 font-heading">UTSAV EVENTS CMS</h1>
          <p className="text-xs text-zinc-400 mt-1">Manage scheduled ceremonies, rituals, and Mahotsav timetable.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black rounded-lg"
        >
          + Add New Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-8 text-center text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-2xl">
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div className="col-span-2 p-8 text-center text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-2xl">
            No scheduled events found.
          </div>
        ) : (
          events.map((ev) => (
            <div key={ev._id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
                    Order #{ev.order}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${ev.active ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                    {ev.active ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <h3 className="font-bold text-base text-white">{ev.title}</h3>
                <p className="text-xs text-amber-300 font-mono mt-1">
                  📅 {ev.date} {ev.time ? `• ⏰ ${ev.time}` : ''}
                </p>
                <p className="text-xs text-zinc-400 mt-1">📍 {ev.location}</p>
                <p className="text-xs text-zinc-300 mt-2 line-clamp-3">{ev.description}</p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button
                  onClick={() => openEditModal(ev)}
                  className="px-3 py-1 bg-blue-900/50 hover:bg-blue-800 text-blue-300 text-xs rounded"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(ev._id)}
                  className="px-3 py-1 bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-400 text-xs rounded"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-zinc-900 border border-amber-500/30 p-6 rounded-2xl max-w-lg w-full text-white space-y-4">
            <h3 className="text-base font-bold text-amber-400">
              {editingEvent ? 'Edit Mahotsav Event' : 'Add New Event'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Grand Murti Sthapana & Maha Aarti"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">Date Tag *</label>
                  <input
                    type="text"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="Day 1 - Ganesh Chaturthi"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Time</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="8:00 AM Onwards"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Main Sacred Pandal, Vesu, Surat"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Event Description *</label>
                <textarea
                  required
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details about the event ceremony..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">Display Order #</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Banner Image URL</label>
                  <input
                    type="text"
                    value={formData.bannerUrl}
                    onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                  />
                </div>
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
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
