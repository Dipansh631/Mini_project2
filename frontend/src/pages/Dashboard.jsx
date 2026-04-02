import React, { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Briefcase, Activity, AlertTriangle, TrendingUp, Target, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../supabase';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = ({ setCurrentPage }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE}/dashboard-stats`, {
          headers: { 'X-User-Email': user?.email || '' },
        });
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    if (!user?.email) {
      setStats(null);
      setLoading(false);
      return;
    }
    fetchStats();
  }, [user?.email]);

  // Format currency for display
  const fmtCurrency = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val || 0}`;
  };

  const sentimentDist = stats?.sentiment_distribution || {};

  const dealDistData = stats ? [
    { name: 'Positive', value: sentimentDist.Positive || 0, color: '#22d3ee' }, // Cyan
    { name: 'Neutral', value: sentimentDist.Neutral || 0, color: '#fbbf24' },  // Amber/Gold
    { name: 'Negative', value: sentimentDist.Negative || 0, color: '#f87171' } // Red
  ].filter(d => d.value > 0) : [];

  // Fallback if no sentiment data yet
  const chartData = dealDistData.length > 0 ? dealDistData : [
    { name: 'Pending Data', value: 1, color: '#18181b' } // Zinc 900
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 size={40} className="text-primary animate-spin" />
      <p className="text-gray-400 font-medium">Crunching real-time pipeline data...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-white">Executive Dashboard</h1>
          <p className="text-gray-400 font-medium text-sm md:text-base">Real-time aggregate analytics from your Supabase deals</p>
        </div>
        <button onClick={() => setCurrentPage('deals')} className="bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold shadow-[0_0_10px_rgba(34,211,238,0.1)] transition-all duration-300">
          <Briefcase size={18} /> View Pipeline
        </button>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card title="Total Deals" value={stats?.total_deals || 0} subtitle="Real deals in database" icon={Activity} color="text-primary" bg="bg-primary/10" border="border-primary/20" glow="shadow-[0_0_15px_rgba(34,211,238,0.1)]" />
        <Card title="Total Projected" value={fmtCurrency(stats?.total_predicted_revenue || 0)} subtitle="Sum of all deal values" icon={DollarSign} color="text-green-400" bg="bg-green-400/10" border="border-green-400/20" glow="shadow-[0_0_15px_rgba(74,222,128,0.1)]" />
        <Card title="Avg Success Prob." value={`${((stats?.avg_success_probability || 0) * 100).toFixed(1)}%`} subtitle="Overall win probability" icon={TrendingUp} color="text-purple-400" bg="bg-purple-400/10" border="border-purple-400/20" glow="shadow-[0_0_15px_rgba(192,132,252,0.1)]" />
        <Card title="Database Status" value="Online" subtitle="Synchronized with Supabase" icon={Target} color="text-yellow-400" bg="bg-yellow-400/10" border="border-yellow-400/20" glow="shadow-[0_0_15px_rgba(250,204,21,0.1)]" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 glass-panel p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white tracking-tight">Recent Deal Trends</h3>
            <span className="text-xs text-primary font-bold uppercase tracking-widest bg-primary/10 px-2 py-1 rounded">Live Data</span>
          </div>
          <div className="h-80 w-full rounded-2xl bg-black/40 shadow-inner">
             {stats?.revenue_trends?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.revenue_trends} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} tickMargin={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }} 
                      itemStyle={{ color: '#22d3ee' }} 
                      formatter={(val) => [`$${val.toLocaleString()}`, 'Predicted Revenue']}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4, fill: '#09090b', stroke: '#22d3ee', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#22d3ee' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center border border-dashed border-white/10 rounded-2xl">
                  <div className="text-center">
                    <Activity size={32} className="text-primary/40 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm font-medium">Revenue trend line will auto-populate as deal history grows.</p>
                  </div>
                </div>
              )}
          </div>
        </div>

        <div className="glass-panel p-8 flex flex-col">
          <h3 className="text-xl font-bold text-white tracking-tight mb-6">Sentiment Mix</h3>
          <div className="h-64 w-full flex-grow">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={4} dataKey="value" stroke="none">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }} 
                  itemStyle={{ color: '#fff' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-4 pt-4 border-t border-white/5">
            {dealDistData.length > 0 ? dealDistData.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-sm font-semibold">
                <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ background: d.color, color: d.color }}></div>
                <span className="text-zinc-300">{d.name} <span className="text-zinc-500 font-medium">({sentimentDist[d.name] || 0})</span></span>
              </div>
            )) : (
              <p className="text-xs text-zinc-600 font-bold uppercase">No data found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, value, subtitle, icon: Icon, color, bg, border, glow }) => (
  <div className={`glass-panel p-6 border ${border} relative overflow-hidden group hover:border-primary/40 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1`}>
    <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full ${bg} opacity-30 blur-[40px] group-hover:bg-primary/20 group-hover:opacity-50 transition-all duration-500`}></div>
    <div className="flex justify-between items-start mb-6 relative z-10">
      <p className="text-xs text-gray-400 font-bold tracking-widest uppercase">{title}</p>
      <div className={`p-2.5 rounded-xl ${bg} ${color} border border-white/5 ${glow}`}>
        <Icon size={20} className="drop-shadow-lg" />
      </div>
    </div>
    <div className="relative z-10">
      <h4 className="text-3xl font-black text-white mb-1.5 tracking-tight">{value}</h4>
      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{subtitle}</p>
    </div>
  </div>
);

export default Dashboard;
