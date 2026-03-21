import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Briefcase, Activity, AlertTriangle, TrendingUp, Target } from 'lucide-react';

const revenueData = [
  { name: 'Jan', val: 4000 }, { name: 'Feb', val: 3000 }, { name: 'Mar', val: 5500 }, 
  { name: 'Apr', val: 7200 }, { name: 'May', val: 6800 }, { name: 'Jun', val: 8900 },
];

const dealDistData = [
  { name: 'Won', value: 45, color: '#10B981' },
  { name: 'Lost', value: 15, color: '#EF4444' },
  { name: 'Negotiation', value: 20, color: '#F59E0B' },
  { name: 'Proposal', value: 20, color: '#3B82F6' }
];

const Dashboard = ({ setCurrentPage }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className="mb-10 flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-white">Executive Dashboard</h1>
          <p className="text-gray-400 font-medium">Real-time AI-powered analytics and revenue predictions</p>
        </div>
        <button onClick={() => setCurrentPage('deals')} className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-semibold shadow-lg shadow-primary/20 transition-all duration-300 transform hover:-translate-y-1">
          <Briefcase size={18} /> View Pipeline
        </button>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card title="Total Deals" value="104" subtitle="+12% from last month" icon={Activity} color="text-blue-400" bg="bg-blue-400/10" border="border-blue-400/20" />
        <Card title="Predicted Revenue" value="$4.2M" subtitle="Based on 85% confidence" icon={DollarSign} color="text-green-400" bg="bg-green-400/10" border="border-green-400/20" />
        <Card title="Avg Success Prob." value="68%" subtitle="Overall pipeline health" icon={TrendingUp} color="text-purple-400" bg="bg-purple-400/10" border="border-purple-400/20" />
        <Card title="Avg Client Sentiment" value="Positive" subtitle="From last 500 emails" icon={Target} color="text-yellow-400" bg="bg-yellow-400/10" border="border-yellow-400/20" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 glass-panel p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold tracking-tight">Predicted Revenue Trends (6 Mo)</h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#64748B" axisLine={false} tickLine={false} dx={-10} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', color: '#f8fafc', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }} cursor={{ stroke: '#334155', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="val" stroke="#3B82F6" strokeWidth={4} dot={{ r: 5, fill: '#0F172A', stroke: '#3B82F6', strokeWidth: 2 }} activeDot={{ r: 8, fill: '#3B82F6', stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-8">
          <h3 className="text-xl font-bold tracking-tight mb-6">Deal Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={dealDistData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={3} dataKey="value">
                  {dealDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-4">
            {dealDistData.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-sm font-medium">
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: d.color }}></div>
                <span className="text-gray-300">{d.name} ({d.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Insights */}
      <div className="glass-panel p-8">
        <h3 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary"><AlertTriangle size={20} /></div>
          Top AI Generated Insights
        </h3>
        <div className="space-y-4">
          <InsightRow badge="Risk Alert" text="Globex Corp deal ($450k) shows dropping sentiment in recent technical discussion emails." severity="high" />
          <InsightRow badge="Opportunity" text="Initech shows 88% success probability based on historical CRM data. Highly recommended to push proposal." severity="low" />
          <InsightRow badge="Action Required" text="5 high-value prospects ($1M+ total) have no logged interactions in 14 days." severity="medium" />
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, value, subtitle, icon: Icon, color, bg, border }) => (
  <div className={`glass-panel p-6 border ${border} relative overflow-hidden group hover:border-${color.split('-')[1]}-500/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
    <div className={`absolute -right-4 -top-4 w-28 h-28 rounded-full ${bg} opacity-50 blur-2xl group-hover:bg-${color.split('-')[1]}-500/20 transition-all duration-500`}></div>
    <div className="flex justify-between items-start mb-6 relative z-10">
      <p className="text-sm text-gray-400 font-semibold tracking-wide uppercase">{title}</p>
      <div className={`p-2.5 rounded-xl ${bg} ${color} shadow-sm`}>
        <Icon size={22} />
      </div>
    </div>
    <div className="relative z-10">
      <h4 className="text-4xl font-black mb-1.5 tracking-tight">{value}</h4>
      <p className="text-xs font-medium text-gray-500">{subtitle}</p>
    </div>
  </div>
);

const InsightRow = ({ badge, text, severity }) => {
  const colors = {
    high: 'bg-red-500/10 text-red-400 border-red-500/20 border-l-red-500',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 border-l-yellow-500',
    low: 'bg-green-500/10 text-green-400 border-green-500/20 border-l-green-500',
  };
  return (
    <div className={`flex flex-col md:flex-row items-start md:items-center gap-4 p-5 rounded-xl bg-surface/40 hover:bg-surface border border-transparent border-l-4 ${colors[severity]} transition-all duration-200 cursor-pointer shadow-sm`}>
      <span className={`px-3 py-1.5 rounded-md text-xs font-bold border ${colors[severity].replace('border-l-.*', '')} uppercase tracking-widest whitespace-nowrap`}>
        {badge}
      </span>
      <p className="text-sm font-medium text-gray-300 leading-relaxed">{text}</p>
    </div>
  );
};

export default Dashboard;
