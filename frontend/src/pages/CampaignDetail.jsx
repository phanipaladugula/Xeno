import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Rocket, BarChart3, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../services/api';

const STATUS_STYLES = {
  DRAFT: 'bg-background-tertiary text-text-secondary border-border',
  SENDING: 'bg-info-50 text-info-600 border-info-200',
  SENT: 'bg-success-50 text-success-600 border-success-200',
  FAILED: 'bg-error-50 text-error-600 border-error-200',
};

const CHANNEL_ICONS = { WHATSAPP: '💬', EMAIL: '📧', SMS: '📱', RCS: '🌐' };

const DELIVERY_STATUS_STYLES = {
  PENDING: 'bg-background-tertiary text-text-secondary border-border',
  SENT: 'bg-info-50 text-info-600 border-info-200',
  DELIVERED: 'bg-success-50 text-success-600 border-success-200',
  FAILED: 'bg-error-50 text-error-600 border-error-200',
  OPENED: 'bg-xeno-50 text-xeno-600 border-xeno-200',
  READ: 'bg-xeno-100 text-xeno-700 border-xeno-300',
  CLICKED: 'bg-warning-50 text-warning-600 border-warning-200',
};

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [stats, setStats] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [camp, stat, recs] = await Promise.all([
        api.getCampaign(id),
        api.getCampaignStats(id),
        api.getCampaignRecipients(id),
      ]);
      setCampaign(camp);
      setStats(stat);
      setRecipients(recs);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh when campaign is SENDING
  useEffect(() => {
    if (campaign?.status === 'SENDING' || campaign?.status === 'SENT') {
      const interval = setInterval(() => {
        setRefreshing(true);
        fetchData();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [campaign?.status, fetchData]);

  const handleLaunch = async () => {
    try {
      await api.launchCampaign(id);
      toast.success('🚀 Campaign launched!');
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh]">
      <Loader2 className="w-8 h-8 animate-spin text-xeno-500" />
    </div>
  );

  if (!campaign) return null;

  const total = stats?.totalRecipients || 0;
  const sent = stats?.sent || 0;
  const delivered = stats?.delivered || 0;
  const failed = stats?.failed || 0;
  const opened = stats?.opened || 0;
  const clicked = stats?.clicked || 0;

  const pieData = [
    { name: 'Clicked', value: clicked, color: '#f59e0b' },
    { name: 'Opened', value: Math.max(0, opened - clicked), color: '#6633cc' },
    { name: 'Delivered', value: Math.max(0, delivered), color: '#10b981' },
    { name: 'Failed', value: failed, color: '#ef4444' },
    { name: 'Pending', value: Math.max(0, total - sent - failed), color: '#94a3b8' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-border shadow-soft">
        <button onClick={() => navigate('/campaigns')}
          className="p-2.5 text-text-tertiary hover:text-text hover:bg-background-tertiary rounded-xl transition-all border border-transparent hover:border-border">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-warning-50 border border-warning-100 flex items-center justify-center text-xl shadow-sm">
              {CHANNEL_ICONS[campaign.channel]}
            </div>
            <h2 className="text-2xl font-bold text-text">{campaign.name}</h2>
            <span className={`px-2.5 py-1 text-[11px] rounded-full border font-bold uppercase tracking-wider ${STATUS_STYLES[campaign.status]}`}>
              {campaign.status}
            </span>
          </div>
          <p className="text-text-secondary text-sm font-medium mt-1.5 ml-14">
            Segment: <span className="text-text">{campaign.segment?.name || 'None'}</span> · {total} recipients
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setRefreshing(true); fetchData(); }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-border text-text-secondary hover:text-text hover:bg-background-tertiary rounded-xl text-sm font-bold transition-all shadow-sm">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-xeno-600' : ''}`} />
            Refresh
          </button>
          {campaign.status === 'DRAFT' && (
            <button onClick={handleLaunch}
              className="flex items-center gap-2 px-5 py-2 bg-xeno-600 hover:bg-xeno-700 text-white rounded-xl text-sm font-bold transition-all shadow-medium hover:shadow-large">
              <Rocket className="w-4 h-4" /> Launch Campaign
            </button>
          )}
        </div>
      </div>

      {campaign.status === 'SENDING' && (
        <div className="flex items-center gap-3 p-5 bg-info-50 border border-info-200 rounded-2xl text-info-700 text-sm font-bold shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin shrink-0" />
          Delivering messages... Stats are updating in real-time
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="lg:col-span-2 grid grid-cols-3 gap-6">
          {[
            { label: 'Total Sent', value: sent, color: 'text-info-600', border: 'border-info-200' },
            { label: 'Delivered', value: delivered, color: 'text-success-600', border: 'border-success-200' },
            { label: 'Failed', value: failed, color: 'text-error-600', border: 'border-error-200' },
            { label: 'Opened', value: opened, color: 'text-xeno-600', border: 'border-xeno-200' },
            { label: 'Clicked', value: clicked, color: 'text-warning-600', border: 'border-warning-200' },
            { label: 'Open Rate', value: `${(stats?.openRate || 0).toFixed(1)}%`, color: 'text-xeno-700', border: 'border-xeno-300' },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-2xl p-6 border ${s.border} shadow-soft`}>
              <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">{s.label}</p>
              <p className={`text-3xl font-black tracking-tight ${s.color}`}>{s.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Pie Chart */}
        {pieData.length > 0 && (
          <div className="bg-white border border-border shadow-soft rounded-2xl p-6">
            <h3 className="text-sm font-bold text-text mb-4 uppercase tracking-wider">Delivery Breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                  dataKey="value" paddingAngle={2}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} contentStyle={{
                  background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold', color: '#111827', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2.5 mt-4">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: d.color }} />
                    <span className="text-text-secondary font-medium">{d.name}</span>
                  </div>
                  <span className="text-text font-bold">{d.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Message preview */}
      {campaign.messageTemplate && (
        <div className="bg-white border border-border shadow-soft rounded-2xl p-6">
          <h3 className="text-sm font-bold text-text mb-4 uppercase tracking-wider">Message Template</h3>
          <p className="text-sm text-text font-medium bg-background border border-border rounded-xl p-5 whitespace-pre-wrap leading-relaxed shadow-inner">
            {campaign.messageTemplate}
          </p>
        </div>
      )}

      {/* Recipients */}
      {recipients.length > 0 && (
        <div className="bg-white border border-border shadow-soft rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-border bg-background/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center shadow-sm">
                <Users className="w-4 h-4 text-xeno-600" />
              </div>
              <h3 className="text-sm font-bold text-text uppercase tracking-wider">Recipients ({recipients.length})</h3>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-white sticky top-0 border-b border-border shadow-sm">
                <tr>
                  {['Customer', 'Status', 'Sent At', 'Opened At', 'Clicked At'].map(h => (
                    <th key={h} className="text-left py-4 px-6 text-xs font-bold text-text-tertiary uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recipients.slice(0, 50).map(r => (
                  <tr key={r.id} className="hover:bg-background-tertiary transition-colors">
                    <td className="py-4 px-6 text-text font-bold">{r.customer?.name || '—'}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 text-[11px] border rounded-full font-bold tracking-wider uppercase ${DELIVERY_STATUS_STYLES[r.status] || 'bg-background-tertiary text-text-secondary border-border'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-text-secondary font-medium text-xs">{r.sentAt ? new Date(r.sentAt).toLocaleTimeString() : '—'}</td>
                    <td className="py-4 px-6 text-text-secondary font-medium text-xs">{r.openedAt ? new Date(r.openedAt).toLocaleTimeString() : '—'}</td>
                    <td className="py-4 px-6 text-text-secondary font-medium text-xs">{r.clickedAt ? new Date(r.clickedAt).toLocaleTimeString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
