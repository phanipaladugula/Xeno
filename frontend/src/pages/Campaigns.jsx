import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Megaphone, Rocket, Trash2, X, Loader2, BarChart3, ChevronRight, Layers } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const STATUS_STYLES = {
  DRAFT: 'bg-background-tertiary text-text-secondary border-border',
  SENDING: 'bg-info-50 text-info-600 border-info-200',
  SENT: 'bg-success-50 text-success-600 border-success-200',
  FAILED: 'bg-error-50 text-error-600 border-error-200',
  PAUSED: 'bg-warning-50 text-warning-600 border-warning-200',
};

const CHANNEL_ICONS = {
  WHATSAPP: '💬',
  EMAIL: '📧',
  SMS: '📱',
  RCS: '🌐',
};

function CampaignCard({ campaign, onDelete, onLaunch, onView }) {
  const status = campaign.status || 'DRAFT';
  const total = campaign.totalSent || 0;
  const opened = campaign.totalOpened || 0;
  const clicked = campaign.totalClicked || 0;

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden hover:border-xeno-300 shadow-soft hover:shadow-medium transition-all group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning-50 border border-warning-100 flex items-center justify-center text-2xl shadow-sm">
              {CHANNEL_ICONS[campaign.channel] || '📣'}
            </div>
            <div>
              <h3 className="font-bold text-text leading-tight group-hover:text-xeno-700 transition-colors">{campaign.name}</h3>
              <p className="text-sm font-medium text-text-secondary mt-1">{campaign.segment?.name || 'No segment'}</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 text-[11px] rounded-full border font-bold uppercase tracking-wider ${STATUS_STYLES[status]}`}>
            {status}
          </span>
        </div>

        {status !== 'DRAFT' && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Sent', value: campaign.totalSent || 0, color: 'text-info-600' },
              { label: 'Opened', value: campaign.totalOpened || 0, color: 'text-xeno-600' },
              { label: 'Clicked', value: campaign.totalClicked || 0, color: 'text-success-600' },
            ].map(s => (
              <div key={s.label} className="text-center p-3 bg-background border border-border/50 rounded-xl">
                <p className={`text-xl font-bold ${s.color}`}>{s.value.toLocaleString()}</p>
                <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {campaign.messageTemplate && (
          <p className="text-sm text-text-secondary line-clamp-2 mb-5 italic bg-background-tertiary p-3 rounded-xl border border-border">
            "{campaign.messageTemplate.slice(0, 80)}{campaign.messageTemplate.length > 80 ? '...' : ''}"
          </p>
        )}

        <div className="flex items-center gap-3 mt-auto">
          {status === 'DRAFT' && (
            <button
              onClick={() => onLaunch(campaign.id)}
              className="flex items-center gap-2 px-4 py-2 bg-xeno-600 hover:bg-xeno-700 text-white rounded-xl text-sm font-bold transition-all shadow-medium hover:shadow-large"
            >
              <Rocket className="w-4 h-4" /> Launch
            </button>
          )}
          <button
            onClick={() => onView(campaign.id)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-border hover:bg-background-tertiary text-text-secondary hover:text-text rounded-xl text-sm font-bold transition-all shadow-sm"
          >
            <BarChart3 className="w-4 h-4" /> Stats
          </button>
          <button
            onClick={() => onDelete(campaign.id)}
            className="ml-auto p-2 text-text-tertiary hover:text-error-600 hover:bg-error-50 rounded-xl transition-all"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Campaigns() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [camps, segs] = await Promise.all([api.getCampaigns(), api.getSegments()]);
      setCampaigns(camps);
      setSegments(segs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this campaign?')) return;
    try {
      await api.deleteCampaign(id);
      toast.success('Campaign deleted');
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleLaunch = async (id) => {
    try {
      await api.launchCampaign(id);
      toast.success('🚀 Campaign launched! Watch stats update in real-time.');
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const draftCount = campaigns.filter(c => c.status === 'DRAFT').length;
  const sentCount = campaigns.filter(c => c.status === 'SENT').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-text tracking-tight">Campaigns</h2>
          <p className="text-text-secondary mt-1">
            {campaigns.length} total · {draftCount} drafts · {sentCount} sent
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-xeno-600 hover:bg-xeno-700 text-white rounded-xl text-sm font-semibold transition-all shadow-medium hover:shadow-large"
        >
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {error && <div className="p-4 bg-error-50 border border-error-100 rounded-xl text-error-600 text-sm font-medium shadow-sm">⚠️ {error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-xeno-500" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-20 bg-white border border-border rounded-2xl shadow-soft">
          <Megaphone className="w-16 h-16 text-text-tertiary mx-auto mb-4 opacity-50" />
          <h3 className="text-text font-bold text-xl mb-2">No campaigns yet</h3>
          <p className="text-text-secondary mb-6">Create your first campaign to reach customers</p>
          <button onClick={() => setShowCreate(true)}
            className="px-6 py-3 bg-xeno-600 hover:bg-xeno-700 text-white rounded-xl font-bold transition-all shadow-medium hover:shadow-large inline-block">
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map(c => (
            <CampaignCard
              key={c.id}
              campaign={c}
              onDelete={handleDelete}
              onLaunch={handleLaunch}
              onView={(id) => navigate(`/campaigns/${id}`)}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCreate && (
          <CreateCampaignModal
            segments={segments}
            onClose={() => setShowCreate(false)}
            onSaved={fetchData}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CreateCampaignModal({ segments, onClose, onSaved }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', description: '', segmentId: '', channel: 'WHATSAPP', messageTemplate: ''
  });
  const [saving, setSaving] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);

  const TEMPLATES = {
    WHATSAPP: `Hi {{name}}! 👋 Exclusive offer just for you in {{city}}! Shop now and enjoy special savings on your next order. You've spent ₹{{totalSpend}} with us — we appreciate your loyalty! 🛍️`,
    EMAIL: `Dear {{name}},\n\nWe noticed you're in {{city}} and wanted to share a special offer tailored just for you.\n\nAs a valued customer who has spent ₹{{totalSpend}} with us, you deserve exclusive benefits!\n\nShop now: [CTA Button]\n\nBest regards,\nXeno Brand Team`,
    SMS: `Hi {{name}}! Special deal for you in {{city}}. Tap to shop → xeno.ai/deals`,
    RCS: `Hello {{name}}! 🎉 Your personalized offer is ready. Tap to explore exclusive deals for our {{city}} customers. Your loyalty means the world to us! ❤️`,
  };

  const handleSegmentSelect = (segId) => {
    const seg = segments.find(s => s.id === parseInt(segId));
    setSelectedSegment(seg);
    setForm(prev => ({ ...prev, segmentId: segId }));
  };

  const handleChannelChange = (ch) => {
    setForm(prev => ({ ...prev, channel: ch, messageTemplate: TEMPLATES[ch] || '' }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Campaign name is required'); return; }
    if (!form.segmentId) { toast.error('Please select a segment'); return; }
    setSaving(true);
    try {
      await api.createCampaign({ ...form, segmentId: parseInt(form.segmentId) });
      toast.success('Campaign created!');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-text/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-white border border-border rounded-2xl w-full max-w-2xl shadow-large overflow-hidden">
        {/* Steps Header */}
        <div className="flex items-center gap-4 p-6 border-b border-border bg-background/50">
          <div className="flex items-center gap-2 flex-1">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-sm
                  ${step >= s ? 'bg-xeno-600 text-white border border-xeno-700' : 'bg-background border border-border text-text-tertiary'}`}>
                  {s}
                </div>
                {s < 3 && <div className={`h-1 w-12 rounded-full ${step > s ? 'bg-xeno-500' : 'bg-border'}`} />}
              </div>
            ))}
          </div>
          <button onClick={onClose} className="p-2 text-text-tertiary hover:text-text hover:bg-background-tertiary rounded-xl transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 className="text-xl font-bold text-text mb-6">Campaign Details</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-2">Campaign Name</label>
                  <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Summer Re-engagement 2026"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text font-medium placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-xeno-500/20 focus:border-xeno-400 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-3">Audience Segment</label>
                  {segments.length === 0 ? (
                    <p className="text-sm font-medium text-warning-600 p-4 bg-warning-50 border border-warning-200 rounded-xl shadow-sm">
                      ⚠️ No segments found. Please create a segment first.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                      {segments.map(seg => (
                        <button key={seg.id} type="button"
                          onClick={() => handleSegmentSelect(String(seg.id))}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all shadow-sm
                            ${form.segmentId === String(seg.id)
                              ? 'border-xeno-500 bg-xeno-50/50 ring-1 ring-xeno-500/20'
                              : 'border-border bg-white hover:border-xeno-300 hover:shadow-medium'}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border
                            ${form.segmentId === String(seg.id) ? 'bg-xeno-100 border-xeno-200 text-xeno-700' : 'bg-background-tertiary border-border text-text-secondary'}
                          `}>
                            <Layers className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-text mb-0.5">{seg.name}</p>
                            <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">{seg.customerCount || 0} customers</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button type="button" disabled={!form.name || !form.segmentId}
                  onClick={() => setStep(2)}
                  className="w-full mt-4 py-3 bg-xeno-600 hover:bg-xeno-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-medium hover:shadow-large flex items-center justify-center gap-2">
                  Next: Choose Channel <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 className="text-xl font-bold text-text mb-6">Choose Channel</h3>
              <div className="grid grid-cols-2 gap-4">
                {['WHATSAPP', 'EMAIL', 'SMS', 'RCS'].map(ch => (
                  <button key={ch} type="button"
                    onClick={() => handleChannelChange(ch)}
                    className={`p-6 rounded-xl border text-center transition-all shadow-sm
                      ${form.channel === ch
                        ? 'border-xeno-500 bg-xeno-50/50 ring-1 ring-xeno-500/20'
                        : 'border-border bg-white hover:border-xeno-300 hover:shadow-medium'}`}>
                    <div className="text-4xl mb-3">{CHANNEL_ICONS[ch]}</div>
                    <p className="font-bold text-text">{ch}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-4 mt-8 pt-6 border-t border-border">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-border bg-white rounded-xl text-text-secondary font-bold hover:bg-background-tertiary transition-all shadow-sm">
                  Back
                </button>
                <button type="button" onClick={() => setStep(3)}
                  className="flex-1 py-3 bg-xeno-600 hover:bg-xeno-700 text-white rounded-xl font-bold transition-all shadow-medium hover:shadow-large flex items-center justify-center gap-2">
                  Next: Message <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 className="text-xl font-bold text-text mb-2">Write Your Message</h3>
              <p className="text-sm font-medium text-text-secondary mb-6 bg-info-50 text-info-700 p-3 rounded-xl border border-info-200">
                💡 Use <code className="text-xeno-700 font-bold bg-white px-1.5 py-0.5 rounded border border-info-200">{'{{name}}'}</code>, <code className="text-xeno-700 font-bold bg-white px-1.5 py-0.5 rounded border border-info-200">{'{{city}}'}</code>, <code className="text-xeno-700 font-bold bg-white px-1.5 py-0.5 rounded border border-info-200">{'{{totalSpend}}'}</code> for personalization
              </p>
              <textarea
                value={form.messageTemplate}
                onChange={e => setForm(p => ({ ...p, messageTemplate: e.target.value }))}
                rows={7}
                placeholder="Write your personalized message..."
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text font-medium placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-xeno-500/20 focus:border-xeno-400 transition-all resize-none shadow-inner"
              />
              {selectedSegment && (
                <div className="mt-4 p-4 bg-background border border-border rounded-xl flex items-start gap-3">
                  <div className="text-xl mt-0.5">{CHANNEL_ICONS[form.channel]}</div>
                  <div>
                    <p className="text-sm font-bold text-text">Sending via {form.channel}</p>
                    <p className="text-xs font-medium text-text-secondary mt-0.5">
                      Will be sent to <span className="font-bold text-xeno-600">{selectedSegment.customerCount} customers</span> in {selectedSegment.name}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex gap-4 mt-8 pt-6 border-t border-border">
                <button type="button" onClick={() => setStep(2)}
                  className="flex-1 py-3 border border-border bg-white rounded-xl text-text-secondary font-bold hover:bg-background-tertiary transition-all shadow-sm">
                  Back
                </button>
                <button type="button" onClick={handleSave} disabled={saving}
                  className="flex-1 py-3 bg-success-600 hover:bg-success-700 text-white rounded-xl font-bold transition-all shadow-medium hover:shadow-large disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : '✓ Save Campaign'}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
