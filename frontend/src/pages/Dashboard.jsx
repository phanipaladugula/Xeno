import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Megaphone, TrendingUp, MessageSquare, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import api from '../services/api';

function StatCard({ label, value, sub, icon: Icon, color, trend, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`bg-white border border-border rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">{label}</p>
          <p className="text-3xl font-bold text-text">{value}</p>
          {sub && <p className="text-sm text-text-tertiary mt-1">{sub}</p>}
          {trend && (
            <div className="flex items-center gap-1.5 mt-3">
              <TrendingUp className="w-4 h-4 text-success-500" />
              <span className="text-sm text-success-500 font-medium">{trend}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}

function QuickAction({ title, desc, icon: Icon, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-5 bg-white border border-border rounded-xl hover:border-xeno-300 hover:shadow-soft transition-all group text-left"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-text text-sm group-hover:text-xeno-600 transition-colors">{title}</p>
        <p className="text-xs text-text-secondary mt-1">{desc}</p>
      </div>
      <ArrowRight className="w-5 h-5 text-text-tertiary group-hover:text-xeno-500 transition-colors shrink-0" />
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDashboard();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const fmtRevenue = (v) => {
    if (!v) return '₹0';
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
    return `₹${v.toFixed(0)}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-text tracking-tight">Overview</h2>
          <p className="text-text-secondary mt-1">Your campaign intelligence dashboard</p>
        </div>
        <button onClick={fetchStats} className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-text font-medium hover:bg-background-tertiary hover:shadow-sm transition-all shadow-sm">
          <RefreshCw className={`w-4 h-4 text-text-tertiary ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-error-50 border border-error-100 rounded-xl text-error-600 text-sm font-medium shadow-sm">
          ⚠️ {error} — Make sure the backend is running on port 8080.
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          label="Total Customers"
          value={loading ? '...' : (stats?.totalCustomers ?? 0).toLocaleString()}
          sub="In your CRM"
          icon={Users}
          color="bg-info-50 text-info-500 border border-info-100"
          trend="Live data"
          onClick={() => navigate('/customers')}
        />
        <StatCard
          label="Active Customers"
          value={loading ? '...' : (stats?.activeCustomers ?? 0).toLocaleString()}
          sub="Purchased in 30 days"
          icon={Zap}
          color="bg-success-50 text-success-500 border border-success-100"
          trend="Engaged"
        />
        <StatCard
          label="Total Revenue"
          value={loading ? '...' : fmtRevenue(stats?.totalRevenue)}
          sub="All time"
          icon={TrendingUp}
          color="bg-xeno-50 text-xeno-600 border border-xeno-100"
          trend="Growing"
        />
        <StatCard
          label="Campaigns Sent"
          value={loading ? '...' : (stats?.totalCampaigns ?? 0).toLocaleString()}
          sub={`${stats?.totalMessagesSent ?? 0} messages`}
          icon={Megaphone}
          color="bg-warning-50 text-warning-500 border border-warning-100"
          onClick={() => navigate('/campaigns')}
        />
      </div>

      {/* Engagement Rate */}
      {stats && (
        <div className="bg-white border border-border rounded-2xl p-8 shadow-soft">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-text">Engagement Overview</h3>
            <span className="text-sm font-medium text-text-tertiary px-3 py-1 bg-background-tertiary rounded-full">All campaigns</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { label: 'Avg Engagement', value: `${(stats?.avgEngagementRate ?? 0).toFixed(1)}%`, color: 'bg-xeno-500' },
              { label: 'Messages Sent', value: (stats?.totalMessagesSent ?? 0).toLocaleString(), color: 'bg-info-500' },
              { label: 'Active Campaigns', value: stats?.activeCampaigns ?? 0, color: 'bg-success-500' },
            ].map(item => (
              <div key={item.label} className="text-center p-6 rounded-2xl bg-background border border-border/50">
                <p className="text-4xl font-bold text-text">{item.value}</p>
                <p className="text-sm font-semibold text-text-secondary mt-2 uppercase tracking-wider">{item.label}</p>
                <div className={`h-1.5 w-16 mx-auto rounded-full ${item.color} mt-4 opacity-80`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-bold text-text mb-4">Quick Actions</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            title="View Customers"
            desc={`${stats?.totalCustomers ?? 0} shoppers in CRM`}
            icon={Users}
            color="bg-info-50 text-info-500"
            onClick={() => navigate('/customers')}
          />
          <QuickAction
            title="Create Segment"
            desc="Define your audience rules"
            icon={MessageSquare}
            color="bg-xeno-50 text-xeno-600"
            onClick={() => navigate('/segments')}
          />
          <QuickAction
            title="Launch Campaign"
            desc="Engage your segments"
            icon={Megaphone}
            color="bg-warning-50 text-warning-500"
            onClick={() => navigate('/campaigns')}
          />
          <QuickAction
            title="Ask Xeno AI"
            desc="Chat with your CRM data"
            icon={Zap}
            color="bg-success-50 text-success-500"
            onClick={() => navigate('/chat')}
          />
        </div>
      </div>
    </div>
  );
}
