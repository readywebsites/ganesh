'use client';

import { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
          setActivities(data.activities || []);
          setChartData(data.monthlyDonations || []);
        }
      })
      .catch((err) => console.error('Error fetching dashboard stats:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    { title: "Today's Aarti Bookings", count: stats?.todayBookings || 0, icon: '🏵️', color: 'from-amber-500/20 to-yellow-500/10', border: 'border-amber-500/40' },
    { title: 'Morning Seats Left', count: stats?.morningRemaining ?? 15, icon: '🌅', color: 'from-orange-500/20 to-amber-500/10', border: 'border-orange-500/30' },
    { title: 'Night Seats Left', count: stats?.nightRemaining ?? 15, icon: '🌙', color: 'from-indigo-500/20 to-purple-500/10', border: 'border-indigo-500/30' },
    { title: 'Total Aarti Bookings', count: stats?.totalBookings || 0, icon: '🎟️', color: 'from-yellow-500/20 to-amber-500/10', border: 'border-yellow-500/30' },
    { title: 'Total Members', count: stats?.totalMembers || 0, icon: '👥', color: 'from-amber-500/20 to-yellow-500/10', border: 'border-amber-500/30' },
    { title: 'Total Donations', count: `₹${(stats?.totalDonationAmount || 0).toLocaleString()}`, icon: '💰', color: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/30' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-900 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden">
        <h1 className="text-2xl font-bold text-amber-400 font-heading tracking-wide">
          Jay Ganesha! Welcome to Mahotsav Control Panel
        </h1>
        <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
          Real-time oversight of Surat Cha Gaurinandan Ganesh Mahotsav membership passes, pilgrim queries, devotions, and media streams.
        </p>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-br ${card.color} bg-zinc-900 border ${card.border} p-5 rounded-2xl flex items-center justify-between shadow-lg`}
          >
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">{card.title}</p>
              <h3 className="text-2xl font-bold text-zinc-100 mt-1">{card.count}</h3>
            </div>
            <span className="text-3xl p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">{card.icon}</span>
          </div>
        ))}
      </div>

      {/* Chart & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donation Trends Chart */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-amber-400">Monthly Donation Contributions (₹)</h3>
            <span className="text-xs text-zinc-500 font-mono">Live Analytics</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latest Activity Feed */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col">
          <h3 className="text-base font-bold text-amber-400 mb-4">Latest Activity Feed</h3>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-72 text-xs">
            {activities.length === 0 ? (
              <p className="text-zinc-500 text-center py-6">No recent activity recorded.</p>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-xl flex items-start space-x-3">
                  <span className="text-base mt-0.5">
                    {act.type === 'Member' ? '👤' : act.type === 'Donation' ? '💰' : '📩'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-200 leading-snug">{act.text}</p>
                    <span className="text-[10px] text-zinc-500 mt-1 block">
                      {new Date(act.time).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
