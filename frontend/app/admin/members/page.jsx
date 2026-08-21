'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/api';

export default function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [volunteerFilter, setVolunteerFilter] = useState('All');
  const [editingMember, setEditingMember] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'All') params.set('status', statusFilter);
      if (volunteerFilter !== 'All') params.set('volunteer', volunteerFilter);

      const res = await fetch(getApiUrl(`/memberships/?${params.toString()}`), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setMembers(data.data || data.results || []);
      } else if (Array.isArray(data)) {
        setMembers(data);
      }
    } catch (err) {
      console.error('Error loading members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [search, statusFilter, volunteerFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
      const res = await fetch(getApiUrl(`/memberships/${id}/`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus.toLowerCase() }),
      });
      const data = await res.json();
      if (data.success || res.ok) {
        setMembers(members.map((m) => ((m._id === id || m.id === id) ? { ...m, status: newStatus } : m)));
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this member registration?')) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
      const res = await fetch(getApiUrl(`/memberships/${id}/`), {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        setMembers(members.filter((m) => m._id !== id && m.id !== id));
      }
    } catch (err) {
      alert('Failed to delete member');
    }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
      const id = editingMember._id || editingMember.id;
      const res = await fetch(getApiUrl(`/memberships/${id}/`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(editingMember),
      });
      const data = await res.json();
      if (data.success || res.ok) {
        setMembers(members.map((m) => ((m._id === id || m.id === id) ? (data.data || editingMember) : m)));
        setModalOpen(false);
        setEditingMember(null);
      }
    } catch (err) {
      alert('Failed to update member details');
    }
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ['Membership ID,Name,Mobile,Email,City,Address,Occupation,Volunteer,Status,Date'];
    const rows = members.map((m) =>
      `"${m.membershipId}","${m.name}","${m.mobile}","${m.email}","${m.city}","${m.address.replace(/"/g, '""')}","${m.occupation}","${m.volunteer}","${m.status}","${new Date(m.createdAt).toLocaleDateString()}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ganesh_Mahotsav_Members_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Excel / TSV formatted
  const exportExcel = () => {
    let tsv = 'Membership ID\tName\tMobile\tEmail\tCity\tAddress\tOccupation\tVolunteer\tStatus\tCreated At\n';
    members.forEach((m) => {
      tsv += `${m.membershipId}\t${m.name}\t${m.mobile}\t${m.email}\t${m.city}\t${m.address}\t${m.occupation}\t${m.volunteer}\t${m.status}\t${new Date(m.createdAt).toLocaleString()}\n`;
    });
    const blob = new Blob([tsv], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ganesh_Mahotsav_Members_${Date.now()}.xls`;
    link.click();
  };

  // Print Table
  const printMembers = () => {
    window.print();
  };

  // Download Pass Card
  const downloadCard = (member) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 1200, 700);
    grad.addColorStop(0, '#160e06');
    grad.addColorStop(0.5, '#261608');
    grad.addColorStop(1, '#0d0803');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 700);

    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, 1160, 660);

    ctx.fillStyle = '#f6e0a4';
    ctx.font = 'bold 44px Arial, sans-serif';
    ctx.fillText('સુરત ચા ગૌરીનંદન', 80, 110);

    ctx.fillStyle = '#ff9933';
    ctx.font = '22px Arial, sans-serif';
    ctx.fillText('GANESH MAHOTSAV 2026 — OFFICIAL BHAKTA PASS', 80, 150);

    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('MEMBER NAME', 80, 240);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.fillText(member.name, 80, 300);

    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('MEMBERSHIP ID', 80, 380);
    ctx.fillStyle = '#f6e0a4';
    ctx.font = 'bold 36px monospace';
    ctx.fillText(member.membershipId, 80, 430);

    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('VOLUNTEER ROLE', 550, 380);
    ctx.fillStyle = '#ff9933';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.fillText(member.volunteer || 'Bhakta Member', 550, 430);

    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('CITY & SECTOR', 80, 520);
    ctx.fillStyle = '#cccccc';
    ctx.font = '28px Arial, sans-serif';
    ctx.fillText(member.city, 80, 565);

    const a = document.createElement('a');
    a.download = `${member.name.replace(/\s+/g, '_')}_Membership_Card.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header & Export controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-amber-400 font-heading">MEMBERSHIP DIRECTORY</h1>
          <p className="text-xs text-zinc-400 mt-1">Manage, approve, edit, and print registered Bhakta members.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={exportCSV} className="px-3 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded-lg border border-amber-500/20">
            📊 Export CSV
          </button>
          <button onClick={exportExcel} className="px-3 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-emerald-300 rounded-lg border border-emerald-500/20">
            📈 Export Excel
          </button>
          <button onClick={printMembers} className="px-3 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-blue-300 rounded-lg border border-blue-500/20">
            🖨️ Print Directory
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-900/60 p-4 border border-zinc-800 rounded-xl">
        <input
          type="text"
          placeholder="Search by name, ID, mobile, email, city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
        >
          <option value="All">All Statuses</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
        </select>

        <select
          value={volunteerFilter}
          onChange={(e) => setVolunteerFilter(e.target.value)}
          className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
        >
          <option value="All">All Volunteer Interests</option>
          <option value="Aarti & Ritual Assistance">Aarti & Ritual Assistance</option>
          <option value="Event & Crowd Guidance">Event & Crowd Guidance</option>
          <option value="Prasadam Distribution Sewa">Prasadam Distribution Sewa</option>
          <option value="Media & Photography Team">Media & Photography Team</option>
          <option value="Vedic Chanting & Music">Vedic Chanting & Music</option>
        </select>
      </div>

      {/* Members Data Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-amber-400 font-mono uppercase text-[11px] border-b border-zinc-800">
              <tr>
                <th className="p-4">Membership ID</th>
                <th className="p-4">Devotee Name</th>
                <th className="p-4">Mobile & Email</th>
                <th className="p-4">City</th>
                <th className="p-4">Volunteer Sewa</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-zinc-500">
                    Loading member records...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-zinc-500">
                    No membership records found.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m._id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4 font-mono text-amber-300 font-bold">{m.membershipId}</td>
                    <td className="p-4 font-semibold text-white">
                      {m.name}
                      <span className="block text-[10px] text-zinc-500 font-normal">{m.occupation}</span>
                    </td>
                    <td className="p-4">
                      {m.mobile}
                      <span className="block text-[10px] text-zinc-400">{m.email}</span>
                    </td>
                    <td className="p-4">{m.city}</td>
                    <td className="p-4">
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded text-[11px]">
                        {m.volunteer}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          m.status === 'Approved'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : m.status === 'Pending'
                            ? 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      {m.status !== 'Approved' && (
                        <button
                          onClick={() => handleStatusChange(m._id, 'Approved')}
                          className="px-2 py-1 bg-emerald-900/50 hover:bg-emerald-800 text-emerald-300 rounded text-[10px]"
                          title="Approve"
                        >
                          ✓ Approve
                        </button>
                      )}
                      {m.status !== 'Rejected' && (
                        <button
                          onClick={() => handleStatusChange(m._id, 'Rejected')}
                          className="px-2 py-1 bg-red-900/50 hover:bg-red-800 text-red-300 rounded text-[10px]"
                          title="Reject"
                        >
                          ✕ Reject
                        </button>
                      )}
                      <button
                        onClick={() => downloadCard(m)}
                        className="px-2 py-1 bg-amber-900/50 hover:bg-amber-800 text-amber-300 rounded text-[10px]"
                        title="Download Pass Card"
                      >
                        🎴 Card
                      </button>
                      <button
                        onClick={() => {
                          setEditingMember(m);
                          setModalOpen(true);
                        }}
                        className="px-2 py-1 bg-blue-900/50 hover:bg-blue-800 text-blue-300 rounded text-[10px]"
                        title="Edit"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(m._id)}
                        className="px-2 py-1 bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-400 rounded text-[10px]"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Member Modal */}
      {modalOpen && editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-zinc-900 border border-amber-500/30 p-6 rounded-2xl max-w-lg w-full text-white space-y-4">
            <h3 className="text-lg font-bold text-amber-400">Edit Member Details</h3>
            <form onSubmit={handleEditSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">Mobile</label>
                  <input
                    type="text"
                    value={editingMember.mobile}
                    onChange={(e) => setEditingMember({ ...editingMember, mobile: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingMember.email}
                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">City</label>
                  <input
                    type="text"
                    value={editingMember.city}
                    onChange={(e) => setEditingMember({ ...editingMember, city: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Occupation</label>
                  <input
                    type="text"
                    value={editingMember.occupation}
                    onChange={(e) => setEditingMember({ ...editingMember, occupation: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Address</label>
                <textarea
                  value={editingMember.address}
                  onChange={(e) => setEditingMember({ ...editingMember, address: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                  rows="2"
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">Volunteer Interest</label>
                  <input
                    type="text"
                    value={editingMember.volunteer}
                    onChange={(e) => setEditingMember({ ...editingMember, volunteer: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Status</label>
                  <select
                    value={editingMember.status}
                    onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-black font-bold rounded hover:bg-amber-400"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
