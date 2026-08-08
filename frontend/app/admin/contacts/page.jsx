'use client';

import { useState, useEffect } from 'react';

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [replyingContact, setReplyingContact] = useState(null);
  const [replyText, setReplyText] = useState('');

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'All') params.set('status', statusFilter);

      const res = await fetch(`/api/contacts?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setContacts(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [search, statusFilter]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this contact message?')) return;
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setContacts(contacts.filter((c) => c._id !== id));
      }
    } catch (err) {
      alert('Failed to delete contact');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyingContact) return;
    try {
      const res = await fetch(`/api/contacts/${replyingContact._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText }),
      });
      const data = await res.json();
      if (data.success) {
        setContacts(contacts.map((c) => (c._id === replyingContact._id ? data.data : c)));
        setReplyingContact(null);
        setReplyText('');
      }
    } catch (err) {
      alert('Failed to save reply');
    }
  };

  const exportCSV = () => {
    const headers = ['Name,Email,Phone,Subject,Message,Reply,Status,Date'];
    const rows = contacts.map((c) =>
      `"${c.name}","${c.email}","${c.phone || ''}","${c.subject || ''}","${c.message.replace(/"/g, '""')}","${(c.reply || '').replace(/"/g, '""')}","${c.status}","${new Date(c.createdAt).toLocaleDateString()}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ganesh_Mahotsav_Contacts_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-amber-400 font-heading">PILGRIM CONTACT & INQUIRIES</h1>
          <p className="text-xs text-zinc-400 mt-1">Review devotee inquiries, questions, and record responses.</p>
        </div>

        <button onClick={exportCSV} className="px-3 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded-lg border border-amber-500/20">
          📊 Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-900/60 p-4 border border-zinc-800 rounded-xl">
        <input
          type="text"
          placeholder="Search by name, email, subject, message content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
        >
          <option value="All">All Message Statuses</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
        </select>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-2xl">
            Loading contact inquiries...
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-2xl">
            No contact submissions found.
          </div>
        ) : (
          contacts.map((c) => (
            <div key={c._id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-white">{c.name}</h3>
                  <p className="text-xs text-amber-400/80">
                    {c.email} {c.phone ? `• ${c.phone}` : ''}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === 'replied'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : c.status === 'read'
                        ? 'bg-blue-950 text-blue-400 border border-blue-800'
                        : 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                    }`}
                  >
                    {c.status.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-amber-200/90 mb-1">
                  Subject: {c.subject || 'General Pilgrim Inquiry'}
                </p>
                <div className="p-3 bg-zinc-950 rounded-xl text-xs text-zinc-300 leading-relaxed border border-zinc-800/80">
                  {c.message}
                </div>
              </div>

              {c.reply && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200">
                  <span className="font-bold text-amber-400 block mb-1">💬 Admin Response:</span>
                  {c.reply}
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  onClick={() => {
                    setReplyingContact(c);
                    setReplyText(c.reply || '');
                  }}
                  className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs hover:bg-amber-500/30"
                >
                  💬 {c.reply ? 'Edit Reply' : 'Send Reply'}
                </button>
                <button
                  onClick={() => handleDelete(c._id)}
                  className="px-3 py-1 bg-zinc-800 text-zinc-400 hover:text-red-400 rounded-lg text-xs"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {replyingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-zinc-900 border border-amber-500/30 p-6 rounded-2xl max-w-lg w-full text-white space-y-4">
            <h3 className="text-base font-bold text-amber-400">Reply to {replyingContact.name}</h3>
            <div className="p-3 bg-zinc-950 rounded-xl text-xs text-zinc-400 italic">
              &quot;{replyingContact.message}&quot;
            </div>

            <form onSubmit={handleSendReply} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Your Response Message</label>
                <textarea
                  required
                  rows="4"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Enter detailed reply for devotee..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setReplyingContact(null)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg text-xs hover:bg-amber-400"
                >
                  Save Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
