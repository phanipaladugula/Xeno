import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, ChevronLeft, ChevronRight, User, Trash2, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const TAGS_COLOR = {
  vip: 'bg-warning-50 text-warning-600 border-warning-200',
  loyal: 'bg-xeno-50 text-xeno-600 border-xeno-200',
  regular: 'bg-info-50 text-info-600 border-info-200',
  'at-risk': 'bg-warning-100 text-warning-600 border-warning-300',
  churned: 'bg-error-50 text-error-600 border-error-200',
};

function TagBadge({ tag }) {
  const t = tag.trim();
  const cls = TAGS_COLOR[t] || 'bg-background-tertiary text-text-secondary border-border';
  return (
    <span className={`px-2 py-0.5 text-[11px] rounded-full border font-bold uppercase tracking-wider ${cls}`}>{t}</span>
  );
}

function CustomerRow({ customer, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const tags = customer.tags ? customer.tags.split(',').filter(Boolean) : [];
  const daysSince = customer.lastPurchaseDate
    ? Math.floor((Date.now() - new Date(customer.lastPurchaseDate).getTime()) / 86400000)
    : null;

  return (
    <>
      <tr
        className="hover:bg-background-tertiary/50 transition-colors cursor-pointer group"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="py-4 px-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-xeno-50 flex items-center justify-center text-sm font-bold text-xeno-600 shrink-0 border border-xeno-100 shadow-sm">
              {customer.name?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-text group-hover:text-xeno-700 transition-colors">{customer.name}</p>
              <p className="text-xs text-text-tertiary mt-0.5">{customer.email}</p>
            </div>
          </div>
        </td>
        <td className="py-4 px-6 text-sm font-medium text-text-secondary">{customer.city || '—'}</td>
        <td className="py-4 px-6 text-sm font-bold text-text">
          ₹{(customer.totalSpend || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </td>
        <td className="py-4 px-6 text-sm font-medium text-text-secondary">{customer.orderCount || 0}</td>
        <td className="py-4 px-6">
          <span className={`text-xs font-bold ${daysSince === null ? 'text-text-tertiary' : daysSince <= 15 ? 'text-success-600' : daysSince <= 30 ? 'text-warning-600' : 'text-error-500'}`}>
            {daysSince === null ? '—' : `${daysSince}d ago`}
          </span>
        </td>
        <td className="py-4 px-6">
          <div className="flex gap-1.5 flex-wrap">
            {tags.map(t => <TagBadge key={t} tag={t} />)}
          </div>
        </td>
        <td className="py-4 px-6">
          <button
            onClick={e => { e.stopPropagation(); onDelete(customer.id); }}
            className="p-2 text-text-tertiary hover:text-error-600 hover:bg-error-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-background">
          <td colSpan={7} className="px-6 py-4 border-b border-border">
            <div className="grid grid-cols-3 gap-6 text-sm bg-white p-4 rounded-xl border border-border shadow-sm">
              <div><span className="text-text-tertiary text-xs uppercase font-bold tracking-wider block mb-1">Phone</span> <span className="font-medium text-text">{customer.phone || '—'}</span></div>
              <div><span className="text-text-tertiary text-xs uppercase font-bold tracking-wider block mb-1">Country</span> <span className="font-medium text-text">{customer.country || 'India'}</span></div>
              <div><span className="text-text-tertiary text-xs uppercase font-bold tracking-wider block mb-1">ID</span> <span className="font-mono text-text-secondary">#{customer.id}</span></div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getCustomers(page, 20, search);
      setCustomers(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await api.deleteCustomer(id);
      toast.success('Customer deleted');
      fetchCustomers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSearch = (val) => {
    setSearch(val);
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-text tracking-tight">Customers</h2>
          <p className="text-text-secondary mt-1">{totalElements.toLocaleString()} shoppers in your CRM</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-xeno-600 hover:bg-xeno-700 text-white rounded-xl text-sm font-semibold transition-all shadow-medium hover:shadow-large"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      {error && (
        <div className="p-4 bg-error-50 border border-error-100 rounded-xl text-error-600 text-sm font-medium shadow-sm">⚠️ {error}</div>
      )}

      {/* Search */}
      <div className="flex items-center gap-3 p-3 bg-white border border-border rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-xeno-500/20 focus-within:border-xeno-300 transition-all">
        <Search className="w-5 h-5 text-text-tertiary shrink-0 ml-1" />
        <input
          type="text"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 bg-transparent text-text text-sm font-medium outline-none placeholder-text-tertiary"
        />
        {search && <button onClick={() => handleSearch('')} className="p-1 hover:bg-background-tertiary rounded-lg"><X className="w-4 h-4 text-text-tertiary" /></button>}
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background">
                {['Customer', 'City', 'Total Spend', 'Orders', 'Last Purchase', 'Tags', ''].map(h => (
                  <th key={h} className="text-left py-4 px-6 text-xs font-bold text-text-tertiary uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center text-text-tertiary">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-xeno-400" />
                  <span className="text-sm font-medium">Loading customers...</span>
                </td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-text-tertiary">
                  <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <span className="text-sm font-medium">No customers found</span>
                </td></tr>
              ) : customers.map(c => (
                <CustomerRow key={c.id} customer={c} onDelete={handleDelete} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-background/50">
            <span className="text-sm font-medium text-text-secondary">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-xl bg-white border border-border text-text-secondary disabled:opacity-50 disabled:bg-background hover:bg-background-tertiary hover:text-text transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="p-2 rounded-xl bg-white border border-border text-text-secondary disabled:opacity-50 disabled:bg-background hover:bg-background-tertiary hover:text-text transition-all shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {showAdd && <AddCustomerModal onClose={() => setShowAdd(false)} onSaved={fetchCustomers} />}
      </AnimatePresence>
    </div>
  );
}

function AddCustomerModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', country: 'India', tags: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.createCustomer(form);
      toast.success('Customer added!');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-text/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-white border border-border rounded-2xl p-8 w-full max-w-md shadow-large">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-text">Add Customer</h3>
          <button onClick={onClose} className="p-2 text-text-tertiary hover:text-text hover:bg-background-tertiary rounded-xl transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { label: 'Name', field: 'name', type: 'text', required: true, placeholder: 'Priya Sharma' },
            { label: 'Email', field: 'email', type: 'email', required: true, placeholder: 'priya@example.com' },
            { label: 'Phone', field: 'phone', type: 'text', placeholder: '+91 98765 43210' },
            { label: 'City', field: 'city', type: 'text', placeholder: 'Mumbai' },
            { label: 'Tags', field: 'tags', type: 'text', placeholder: 'loyal,vip' },
          ].map(f => (
            <div key={f.field}>
              <label className="block text-sm font-bold text-text-secondary mb-1.5">{f.label}</label>
              <input
                type={f.type}
                required={f.required}
                value={form[f.field]}
                onChange={e => setForm(prev => ({ ...prev, [f.field]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text text-sm font-medium placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-xeno-500/20 focus:border-xeno-400 transition-all"
              />
            </div>
          ))}
          <div className="flex gap-3 pt-4 border-t border-border mt-6">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border bg-white rounded-xl text-text-secondary font-bold text-sm hover:bg-background-tertiary hover:text-text transition-colors shadow-sm">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-xeno-600 hover:bg-xeno-700 text-white rounded-xl text-sm font-bold transition-all shadow-medium hover:shadow-large disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Customer'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
