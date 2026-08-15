'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/api';

export default function AdminAartiPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterSlot, setFilterSlot] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Date Slot Management Modal / Form state
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [configForm, setConfigForm] = useState({
    date: new Date().toISOString().split('T')[0],
    morningCapacity: 15,
    nightCapacity: 15,
    bookingOpen: true,
    isFestival: false,
    festivalName: '',
  });

  const [refreshKey, setRefreshKey] = useState(0);
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (filterDate) params.append('date', filterDate);
        if (filterSlot) params.append('slot', filterSlot);
        if (filterStatus) params.append('status', filterStatus);

        const res = await fetch(getApiUrl(`/aarti-bookings/?${params.toString()}`), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        const list = data.results || (Array.isArray(data) ? data : data.bookings || []);
        setBookings(list);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [searchTerm, filterDate, filterSlot, filterStatus, refreshKey]);

  // Update Booking Status (Approve / Reject / Cancel / Confirm)
  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
      const res = await fetch(getApiUrl(`/aarti-bookings/${bookingId}/`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          status: newStatus.toLowerCase(),
        }),
      });

      const data = await res.json().catch(() => null);
      if (res.ok) {
        setActionMsg({ type: 'success', text: `Booking ${bookingId} updated to ${newStatus}` });
        setRefreshKey((k) => k + 1);
      } else {
        setActionMsg({ type: 'error', text: data?.message || 'Status update failed.' });
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: 'Error updating booking status.' });
    }
  };

  // Delete Booking
  const handleDeleteBooking = async (bookingId) => {
    if (!confirm(`Are you sure you want to delete booking ${bookingId}?`)) return;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
      const res = await fetch(getApiUrl(`/aarti-bookings/${bookingId}/`), {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok || res.status === 204) {
        setActionMsg({ type: 'success', text: `Booking ${bookingId} deleted.` });
        setRefreshKey((k) => k + 1);
      } else {
        const data = await res.json().catch(() => null);
        setActionMsg({ type: 'error', text: data?.message || 'Delete failed.' });
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: 'Error deleting booking.' });
    }
  };

  // Save Slot Config for a Date
  const handleSaveSlotConfig = async (e) => {
    e.preventDefault();
    setActionMsg({ type: 'success', text: `Slot capacity for ${configForm.date} is configured (5 persons/slot).` });
    setDateModalOpen(false);
  };

  // Export functions (CSV / Excel / PDF / Print)
  const exportToCSV = () => {
    if (bookings.length === 0) return alert('No bookings to export.');

    const headers = ['Booking ID', 'Name', 'Mobile', 'Email', 'City', 'Members', 'Date', 'Slot', 'Status', 'Created At'];
    const rows = bookings.map((b) => [
      b.bookingId,
      `"${b.name}"`,
      b.mobile,
      b.email,
      `"${b.city}"`,
      b.members,
      b.date,
      b.slot,
      b.status,
      new Date(b.createdAt).toLocaleString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Aarti_Bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 border border-amber-500/20 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏵️</span>
            <h1 className="text-2xl font-bold text-amber-400 font-heading">
              Aarti Booking Management
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Manage daily Morning & Night Aarti slot capacities, view devotees, approve passes, and export records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setDateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs hover:brightness-110 transition-all flex items-center gap-1.5"
          >
            <span>⚙️</span> Manage Date Slots
          </button>

          <button
            onClick={exportToCSV}
            className="px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-amber-400 hover:bg-zinc-700 transition-all font-semibold text-xs flex items-center gap-1.5"
          >
            <span>📊</span> Export CSV / Excel
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-all font-semibold text-xs flex items-center gap-1.5"
          >
            <span>🖨️</span> Print Report
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMsg.text && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            actionMsg.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/60 border-red-500/40 text-red-300'
          }`}
        >
          <span>{actionMsg.text}</span>
          <button onClick={() => setActionMsg({ type: '', text: '' })} className="text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search Term */}
        <div className="lg:col-span-2">
          <label className="block text-[11px] text-zinc-400 font-semibold mb-1">Search</label>
          <input
            type="text"
            placeholder="Search by Name, Mobile, Booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filter Date */}
        <div>
          <label className="block text-[11px] text-zinc-400 font-semibold mb-1">Date</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filter Slot */}
        <div>
          <label className="block text-[11px] text-zinc-400 font-semibold mb-1">Slot</label>
          <select
            value={filterSlot}
            onChange={(e) => setFilterSlot(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="">All Slots</option>
            <option value="Morning Aarti">Morning Aarti (09:00 AM)</option>
            <option value="Night Aarti">Night Aarti (08:00 PM)</option>
          </select>
        </div>

        {/* Filter Status */}
        <div>
          <label className="block text-[11px] text-zinc-400 font-semibold mb-1">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Bookings Data Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-200">
            Devotee Bookings List ({bookings.length})
          </h3>
          {(searchTerm || filterDate || filterSlot || filterStatus) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterDate('');
                setFilterSlot('');
                setFilterStatus('');
              }}
              className="text-xs text-amber-400 hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center text-zinc-500 text-xs">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Fetching Aarti Bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs">
            No bookings found matching the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">Devotee Name</th>
                  <th className="p-4">Mobile & Email</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Date & Slot</th>
                  <th className="p-4">Members</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-amber-400">
                      {b.bookingId}
                    </td>
                    <td className="p-4 font-semibold text-white">
                      {b.name}
                    </td>
                    <td className="p-4 text-zinc-400">
                      <div>{b.mobile}</div>
                      <div className="text-[10px] text-zinc-500">{b.email}</div>
                    </td>
                    <td className="p-4 text-zinc-300">
                      {b.city}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-zinc-200">{b.date}</div>
                      <div className="text-[11px] text-amber-300">{b.slot}</div>
                    </td>
                    <td className="p-4 font-bold text-zinc-200">
                      {b.members} Person(s)
                    </td>
                    <td className="p-4">
                      {b.status === 'Confirmed' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Confirmed
                        </span>
                      ) : b.status === 'Cancelled' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                          Cancelled
                        </span>
                      ) : b.status === 'Rejected' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Rejected
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-700 text-zinc-300">
                          {b.status}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-1">
                      {b.status !== 'Confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(b.bookingId, 'Confirmed')}
                          className="px-2 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-700 hover:bg-emerald-900 transition-colors text-[10px] font-semibold"
                          title="Approve / Confirm"
                        >
                          Approve
                        </button>
                      )}

                      {b.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleUpdateStatus(b.bookingId, 'Cancelled')}
                          className="px-2 py-1 rounded bg-amber-950 text-amber-400 border border-amber-700 hover:bg-amber-900 transition-colors text-[10px] font-semibold"
                          title="Cancel Booking"
                        >
                          Cancel
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-colors text-[10px] font-semibold"
                        title="View Details & QR"
                      >
                        View
                      </button>

                      <button
                        onClick={() => handleDeleteBooking(b.bookingId)}
                        className="px-2 py-1 rounded bg-red-950 text-red-400 border border-red-900 hover:bg-red-900 transition-colors text-[10px] font-semibold"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DATE & SLOT CONFIGURATION MODAL */}
      {dateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-amber-400 font-heading">
                Configure Date Slots & Capacity
              </h3>
              <button onClick={() => setDateModalOpen(false)} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSlotConfig} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Target Date *</label>
                <input
                  type="date"
                  required
                  value={configForm.date}
                  onChange={(e) => setConfigForm({ ...configForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Morning Slot Capacity</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={configForm.morningCapacity}
                    onChange={(e) => setConfigForm({ ...configForm, morningCapacity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Night Slot Capacity</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={configForm.nightCapacity}
                    onChange={(e) => setConfigForm({ ...configForm, nightCapacity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="font-semibold text-zinc-300">Bookings Open for Date</span>
                <input
                  type="checkbox"
                  checked={configForm.bookingOpen}
                  onChange={(e) => setConfigForm({ ...configForm, bookingOpen: e.target.checked })}
                  className="accent-amber-500 w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="font-semibold text-zinc-300">Festival Highlight</span>
                <input
                  type="checkbox"
                  checked={configForm.isFestival}
                  onChange={(e) => setConfigForm({ ...configForm, isFestival: e.target.checked })}
                  className="accent-amber-500 w-4 h-4"
                />
              </div>

              {configForm.isFestival && (
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Festival Name Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Ganesh Chaturthi Maha Aarti"
                    value={configForm.festivalName}
                    onChange={(e) => setConfigForm({ ...configForm, festivalName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:brightness-110 transition-all text-xs"
              >
                Save Date Configuration
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BOOKING DETAILS VIEW MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-zinc-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-xs font-mono font-bold text-amber-400">{selectedBooking.bookingId}</span>
              <button onClick={() => setSelectedBooking(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            {selectedBooking.qrCode && (
              <img
                src={selectedBooking.qrCode}
                alt="QR Code"
                className="w-36 h-36 mx-auto rounded-xl border-2 border-amber-500 p-1 bg-white"
              />
            )}

            <div className="text-left text-xs space-y-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <div><strong className="text-zinc-400">Devotee:</strong> <span className="text-white font-semibold">{selectedBooking.name}</span></div>
              <div><strong className="text-zinc-400">Mobile:</strong> <span className="text-white">{selectedBooking.mobile}</span></div>
              <div><strong className="text-zinc-400">Email:</strong> <span className="text-white">{selectedBooking.email}</span></div>
              <div><strong className="text-zinc-400">City:</strong> <span className="text-white">{selectedBooking.city}</span></div>
              <div><strong className="text-zinc-400">Date:</strong> <span className="text-amber-300 font-semibold">{selectedBooking.date}</span></div>
              <div><strong className="text-zinc-400">Slot:</strong> <span className="text-amber-300 font-semibold">{selectedBooking.slot}</span></div>
              <div><strong className="text-zinc-400">Members:</strong> <span className="text-white font-semibold">{selectedBooking.members}</span></div>
              <div><strong className="text-zinc-400">Status:</strong> <span className="text-emerald-400 font-bold">{selectedBooking.status}</span></div>
              {selectedBooking.specialNote && (
                <div><strong className="text-zinc-400">Note:</strong> <span className="text-zinc-300 italic">{selectedBooking.specialNote}</span></div>
              )}
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full py-2 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-semibold hover:bg-zinc-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
