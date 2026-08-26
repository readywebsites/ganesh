'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/api';

export default function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [totalSum, setTotalSum] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [newDonation, setNewDonation] = useState({
    name: '',
    email: '',
    phone: '',
    amount: '',
    transactionId: '',
    paymentStatus: 'Success',
    notes: '',
  });

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'All') params.set('status', statusFilter);

      const res = await fetch(getApiUrl(`/donations/?${params.toString()}`));
      const data = await res.json();
      if (data.success) {
        setDonations(data.data || []);
        setTotalSum(data.totalAmount || 0);
      }
    } catch (err) {
      console.error('Error fetching donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [search, statusFilter]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this donation record?')) return;
    try {
      const res = await fetch(getApiUrl(`/donations/${id}/`), { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDonations(donations.filter((d) => d._id !== id));
      }
    } catch (err) {
      alert('Failed to delete donation');
    }
  };

  const handleCreateDonation = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(getApiUrl('/donations/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newDonation,
          amount: Number(newDonation.amount),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDonations([data.data, ...donations]);
        setModalOpen(false);
        setNewDonation({
          name: '',
          email: '',
          phone: '',
          amount: '',
          transactionId: '',
          paymentStatus: 'Success',
          notes: '',
        });
      }
    } catch (err) {
      alert('Failed to create donation');
    }
  };

  const exportCSV = () => {
    const headers = ['Transaction ID,Devotee Name,Amount (INR),Payment Status,Phone,Email,Notes,Date'];
    const rows = donations.map((d) =>
      `"${d.transactionId}","${d.name}","${d.amount}","${d.paymentStatus}","${d.phone || ''}","${d.email || ''}","${(d.notes || '').replace(/"/g, '""')}","${new Date(d.createdAt).toLocaleDateString()}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ganesh_Mahotsav_Donations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(getApiUrl(`/donations/${id}/`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus.toLowerCase() === 'success' ? 'verified' : newStatus.toLowerCase(),
          paymentStatus: newStatus.toUpperCase(),
        }),
      });
      const data = await res.json();
      if (data.success || res.ok) {
        setDonations((prev) =>
          prev.map((d) =>
            d._id === id || d.id === id
              ? {
                  ...d,
                  paymentStatus: newStatus.toUpperCase(),
                  status: newStatus.toLowerCase() === 'success' ? 'verified' : newStatus.toLowerCase(),
                }
              : d
          )
        );
      } else {
        alert(data.message || 'Failed to update donation status');
      }
    } catch (err) {
      console.error('Status update error:', err);
      alert('Network error while updating donation status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-amber-400 font-heading">SACRED SEWA DONATIONS</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Total Collected Contributions: <span className="text-emerald-400 font-bold font-mono">₹{totalSum.toLocaleString()}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black rounded-lg transition-colors"
          >
            + Add Manual Donation
          </button>
          <button onClick={exportCSV} className="px-3 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded-lg border border-amber-500/20 transition-colors">
            📊 Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-900/60 p-4 border border-zinc-800 rounded-xl">
        <input
          type="text"
          placeholder="Search by devotee name, transaction ID, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
        >
          <option value="All">All Payment Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-amber-400 font-mono uppercase text-[11px] border-b border-zinc-800">
              <tr>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Devotee Name</th>
                <th className="p-4">Amount (₹)</th>
                <th className="p-4">Method</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4">Contact Details</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-zinc-500">
                    Loading donation records...
                  </td>
                </tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-zinc-500">
                    No donation records found.
                  </td>
                </tr>
              ) : (
                donations.map((d) => {
                  const currentStatus = (d.paymentStatus || (d.status === 'verified' ? 'SUCCESS' : d.status === 'rejected' ? 'REJECTED' : 'PENDING')).toUpperCase();
                  return (
                    <tr key={d._id || d.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="p-4 font-mono text-zinc-400 text-[11px]">{d.transactionId}</td>
                      <td className="p-4 font-semibold text-white">
                        {d.name}
                        {d.notes && <span className="block text-[10px] text-zinc-400 italic">{d.notes}</span>}
                      </td>
                      <td className="p-4 font-bold text-emerald-400 text-sm">₹{d.amount?.toLocaleString()}</td>
                      <td className="p-4 text-[11px] font-mono text-amber-300/80">
                        {d.payment_method || d.paymentMethod || 'GPay / UPI'}
                      </td>
                      <td className="p-4">
                        <select
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(d._id || d.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer focus:outline-none ${
                            currentStatus === 'SUCCESS'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                              : currentStatus === 'PENDING'
                              ? 'bg-yellow-950/80 text-yellow-300 border-yellow-700'
                              : 'bg-red-950/80 text-red-300 border-red-700'
                          }`}
                        >
                          <option value="PENDING">⏳ PENDING</option>
                          <option value="SUCCESS">✓ SUCCESS</option>
                          <option value="REJECTED">✕ REJECTED</option>
                        </select>
                      </td>
                      <td className="p-4 text-[11px] text-zinc-400">
                        <div>{d.phone || 'N/A'}</div>
                        {d.email && <div className="text-[10px] text-zinc-500">{d.email}</div>}
                      </td>
                      <td className="p-4 text-zinc-500 font-mono">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleDelete(d._id || d.id)}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-400 rounded text-[11px] transition-colors"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Donation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-zinc-900 border border-amber-500/30 p-6 rounded-2xl max-w-md w-full text-white space-y-4">
            <h3 className="text-base font-bold text-amber-400">Record New Sacred Contribution</h3>
            <form onSubmit={handleCreateDonation} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Devotee Name *</label>
                <input
                  type="text"
                  required
                  value={newDonation.name}
                  onChange={(e) => setNewDonation({ ...newDonation, name: e.target.value })}
                  placeholder="e.g. Suresh Kumar"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newDonation.amount}
                    onChange={(e) => setNewDonation({ ...newDonation, amount: e.target.value })}
                    placeholder="1001"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Transaction ID</label>
                  <input
                    type="text"
                    value={newDonation.transactionId}
                    onChange={(e) => setNewDonation({ ...newDonation, transactionId: e.target.value })}
                    placeholder="Auto-generated if empty"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newDonation.phone}
                    onChange={(e) => setNewDonation({ ...newDonation, phone: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Status</label>
                  <select
                    value={newDonation.paymentStatus}
                    onChange={(e) => setNewDonation({ ...newDonation, paymentStatus: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Notes / Sewa Cause</label>
                <input
                  type="text"
                  value={newDonation.notes}
                  onChange={(e) => setNewDonation({ ...newDonation, notes: e.target.value })}
                  placeholder="e.g. Bhandara Prasadam"
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
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
