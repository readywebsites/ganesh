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
      <div className="bg-[#FFFDF7] border border-[#B89A4A]/30 rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <h1 className="text-2xl font-bold text-[#8F7430] font-heading tracking-wide">
          Jay Ganesha! Welcome to Mahotsav Control Panel
        </h1>
        <p className="text-xs text-[#776B5B] mt-1 max-w-2xl">
          Real-time oversight of Surat Cha Gaurinandan Ganesh Mahotsav membership passes, pilgrim queries, devotions, and media streams.
        </p>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`bg-[#FFFDF7] border border-[#B89A4A]/30 p-5 rounded-2xl flex items-center justify-between shadow-sm`}
          >
            <div>
              <p className="text-xs text-[#776B5B] uppercase tracking-wider font-semibold">{card.title}</p>
              <h3 className="text-2xl font-bold text-[#3F3528] mt-1">{card.count}</h3>
            </div>
            <span className="text-3xl p-3 bg-[#FAF7EF] rounded-xl border border-[#B89A4A]/25">{card.icon}</span>
          </div>
        ))}
      </div>

      {/* Chart & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donation Trends Chart */}
        <div className="lg:col-span-2 bg-[#FFFDF7] border border-[#B89A4A]/30 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#8F7430]">Monthly Donation Contributions (₹)</h3>
            <span className="text-xs text-[#9A8D78] font-mono">Live Analytics</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B89A4A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#B89A4A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(184,154,74,0.2)" />
                <XAxis dataKey="month" stroke="#776B5B" fontSize={12} />
                <YAxis stroke="#776B5B" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFDF7', borderColor: '#B89A4A', borderRadius: '8px', color: '#3F3528' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#B89A4A" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latest Activity Feed */}
        <div className="bg-[#FFFDF7] border border-[#B89A4A]/30 p-6 rounded-2xl flex flex-col">
          <h3 className="text-base font-bold text-[#8F7430] mb-4">Latest Activity Feed</h3>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-72 text-xs">
            {activities.length === 0 ? (
              <p className="text-[#9A8D78] text-center py-6">No recent activity recorded.</p>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="p-3 bg-[#FAF7EF] border border-[#B89A4A]/20 rounded-xl flex items-start space-x-3">
                  <span className="text-base mt-0.5">
                    {act.type === 'Member' ? '👤' : act.type === 'Donation' ? '💰' : '📩'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#3F3528] leading-snug">{act.text}</p>
                    <span className="text-[10px] text-[#776B5B] mt-1 block">
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
