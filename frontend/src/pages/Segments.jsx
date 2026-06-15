import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Layers, Users, Trash2, Eye, X, Loader2, ChevronDown, ChevronUp, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const FIELD_OPTIONS = [
  { value: 'totalSpend', label: 'Total Spend (₹)' },
  { value: 'orderCount', label: 'Order Count' },
  { value: 'daysSinceLastPurchase', label: 'Days Since Last Purchase' },
  { value: 'city', label: 'City' },
  { value: 'tag', label: 'Tag' },
];

const OP_OPTIONS = {
  totalSpend: [{ value: 'gte', label: '>=' }, { value: 'gt', label: '>' }, { value: 'lte', label: '<=' }, { value: 'lt', label: '<' }, { value: 'eq', label: '=' }],
  orderCount: [{ value: 'gte', label: '>=' }, { value: 'gt', label: '>' }, { value: 'lte', label: '<=' }, { value: 'lt', label: '<' }, { value: 'eq', label: '=' }],
  daysSinceLastPurchase: [{ value: 'gte', label: '>=' }, { value: 'gt', label: '>' }, { value: 'lte', label: '<=' }, { value: 'lt', label: '<' }],
  city: [{ value: 'eq', label: 'equals' }, { value: 'contains', label: 'contains' }, { value: 'neq', label: 'not equals' }],
  tag: [{ value: 'contains', label: 'contains' }],
};

const DEFAULT_CONDITION = { field: 'totalSpend', op: 'gte', value: '1000' };

function SegmentCard({ segment, onDelete, onPreview }) {
  const [expanded, setExpanded] = useState(false);
  let parsedRules = null;
  try { parsedRules = JSON.parse(segment.rules); } catch {}

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden hover:border-xeno-300 shadow-soft hover:shadow-medium transition-all group">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-xeno-50 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6 text-xeno-600" />
            </div>
            <div>
              <h3 className="font-bold text-text group-hover:text-xeno-700 transition-colors">{segment.name}</h3>
              <p className="text-sm text-text-secondary mt-1">{segment.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-2xl font-bold text-text">{(segment.customerCount || 0).toLocaleString()}</p>
              <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider">customers</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-xeno-700 bg-xeno-50 hover:bg-xeno-100 rounded-xl transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            View Rules
          </button>
          <button
            onClick={() => onDelete(segment.id)}
            className="ml-auto p-2 text-text-tertiary hover:text-error-600 hover:bg-error-50 rounded-xl transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {expanded && parsedRules && (
          <div className="mt-4 p-4 bg-background rounded-xl text-sm font-mono space-y-2 border border-border">
            <p className="text-text-secondary font-bold mb-3">Operator: <span className="text-xeno-600 bg-xeno-50 px-2 py-0.5 rounded">{parsedRules.operator}</span></p>
            {parsedRules.conditions?.map((c, i) => (
              <div key={i} className="flex gap-2 text-text font-medium">
                <span className="text-info-600">{c.field}</span>
                <span className="text-warning-600">{c.op}</span>
                <span className="text-success-600">{c.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Segments() {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState(null);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      const data = await api.getSegments();
      setSegments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSegments(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this segment?')) return;
    try {
      await api.deleteSegment(id);
      toast.success('Segment deleted');
      fetchSegments();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-text tracking-tight">Segments</h2>
          <p className="text-text-secondary mt-1">{segments.length} audience segments defined</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-xeno-600 hover:bg-xeno-700 text-white rounded-xl text-sm font-semibold transition-all shadow-medium hover:shadow-large"
        >
          <Plus className="w-4 h-4" /> Create Segment
        </button>
      </div>

      {error && <div className="p-4 bg-error-50 border border-error-100 rounded-xl text-error-600 text-sm font-medium shadow-sm">⚠️ {error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-xeno-500" />
        </div>
      ) : segments.length === 0 ? (
        <div className="text-center py-20 bg-white border border-border rounded-2xl shadow-soft">
          <Layers className="w-16 h-16 text-text-tertiary mx-auto mb-4 opacity-50" />
          <h3 className="text-text font-bold text-xl mb-2">No segments yet</h3>
          <p className="text-text-secondary">Create your first segment to target specific customers</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {segments.map(seg => (
            <SegmentCard key={seg.id} segment={seg} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCreate && <CreateSegmentModal onClose={() => setShowCreate(false)} onSaved={fetchSegments} />}
      </AnimatePresence>
    </div>
  );
}

function CreateSegmentModal({ onClose, onSaved }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [operator, setOperator] = useState('AND');
  const [conditions, setConditions] = useState([{ ...DEFAULT_CONDITION }]);
  const [previewCount, setPreviewCount] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [saving, setSaving] = useState(false);

  const buildRules = () => JSON.stringify({ operator, conditions });

  const handlePreview = async () => {
    setPreviewing(true);
    try {
      const result = await api.previewSegment(buildRules());
      setPreviewCount(result.count);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPreviewing(false);
    }
  };

  const addCondition = () => setConditions(prev => [...prev, { ...DEFAULT_CONDITION }]);
  const removeCondition = (i) => setConditions(prev => prev.filter((_, idx) => idx !== i));
  const updateCondition = (i, key, val) => setConditions(prev =>
    prev.map((c, idx) => idx === i ? { ...c, [key]: val } : c)
  );

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      await api.createSegment({ name, description, rules: buildRules() });
      toast.success('Segment created!');
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
        className="bg-white border border-border rounded-2xl w-full max-w-2xl shadow-large max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border bg-background/50">
          <h3 className="text-xl font-bold text-text">Create Segment</h3>
          <button onClick={onClose} className="p-2 text-text-tertiary hover:text-text hover:bg-background-tertiary rounded-xl transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSave} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-text-secondary mb-1.5">Segment Name</label>
              <input
                type="text" required value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. High-Value Loyal Customers"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text text-sm font-medium placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-xeno-500/20 focus:border-xeno-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-secondary mb-1.5">Description</label>
              <input
                type="text" value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Brief description of this audience"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text text-sm font-medium placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-xeno-500/20 focus:border-xeno-400 transition-all"
              />
            </div>
          </div>

          {/* Rules */}
          <div className="bg-background rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-bold text-text">Audience Rules</label>
              <select
                value={operator} onChange={e => setOperator(e.target.value)}
                className="text-sm font-bold px-3 py-1.5 bg-white border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-xeno-500/20"
              >
                <option value="AND">ALL conditions (AND)</option>
                <option value="OR">ANY condition (OR)</option>
              </select>
            </div>
            <div className="space-y-3">
              {conditions.map((cond, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <select
                    value={cond.field}
                    onChange={e => updateCondition(i, 'field', e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-border rounded-xl text-text text-sm font-medium focus:outline-none focus:ring-2 focus:ring-xeno-500/20"
                  >
                    {FIELD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <select
                    value={cond.op}
                    onChange={e => updateCondition(i, 'op', e.target.value)}
                    className="w-32 px-3 py-2 bg-white border border-border rounded-xl text-text text-sm font-medium focus:outline-none focus:ring-2 focus:ring-xeno-500/20"
                  >
                    {(OP_OPTIONS[cond.field] || OP_OPTIONS.totalSpend).map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <input
                    type="text" value={cond.value}
                    onChange={e => updateCondition(i, 'value', e.target.value)}
                    className="w-32 px-3 py-2 bg-white border border-border rounded-xl text-text text-sm font-medium placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-xeno-500/20 focus:border-xeno-400"
                    placeholder="value"
                  />
                  {conditions.length > 1 && (
                    <button type="button" onClick={() => removeCondition(i)} className="p-2 text-text-tertiary hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addCondition}
              className="mt-4 flex items-center gap-2 text-sm font-bold text-xeno-600 hover:text-xeno-700 transition-colors bg-white px-4 py-2 border border-border rounded-xl hover:shadow-sm">
              <Plus className="w-4 h-4" /> Add condition
            </button>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-4 p-4 bg-xeno-50 rounded-xl border border-xeno-100">
            <button type="button" onClick={handlePreview} disabled={previewing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-xeno-200 hover:bg-xeno-100 text-xeno-700 font-bold rounded-xl text-sm transition-all shadow-sm disabled:opacity-50">
              {previewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Preview
            </button>
            {previewCount !== null && (
              <p className="text-sm font-medium text-text-secondary">
                <span className="font-bold text-xeno-600 text-lg">{previewCount.toLocaleString()}</span> customers match
              </p>
            )}
          </div>

          <div className="flex gap-4 pt-4 border-t border-border mt-8">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border border-border bg-white rounded-xl text-text-secondary font-bold text-sm hover:bg-background-tertiary hover:text-text transition-colors shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 bg-xeno-600 hover:bg-xeno-700 text-white rounded-xl text-sm font-bold transition-all shadow-medium hover:shadow-large disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Segment'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
