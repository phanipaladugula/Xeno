import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('demo@xeno.com');
  const [password, setPassword] = useState('demo123');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    localStorage.setItem('xeno_token', 'demo-token-' + Date.now());
    toast.success('Welcome back! 👋');
    setLoading(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-xeno-300/30 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-xeno-200/40 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <img 
            src="https://cdn.prod.website-files.com/620353a026ae70e21288308a/69e0a8442fde5f7cc3b2d3c6_newlogoxeno-blue11.png" 
            alt="Xeno Logo" 
            className="h-10 mx-auto mb-6 object-contain drop-shadow-sm"
          />
          <h1 className="text-3xl font-black text-text mb-2 tracking-tight">Agentic Marketing</h1>
          <p className="text-text-secondary font-medium">Log in to manage your intelligent campaigns</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-border rounded-2xl p-8 shadow-large">
          <h2 className="text-xl font-bold text-text mb-1">Sign in</h2>
          <p className="text-text-tertiary text-sm mb-6 font-medium">Enter your credentials to continue</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-text-secondary mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text font-medium placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-xeno-500/20 focus:border-xeno-400 transition-all text-sm shadow-inner"
                placeholder="you@brand.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-secondary mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text font-medium placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-xeno-500/20 focus:border-xeno-400 transition-all text-sm shadow-inner"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-xeno-600 hover:bg-xeno-700 text-white rounded-xl font-bold transition-all shadow-medium hover:shadow-large disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none text-sm"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-info-50 rounded-xl border border-info-200 shadow-sm">
            <p className="text-xs font-bold text-info-700 text-center uppercase tracking-wider">
              🎯 Demo credentials pre-filled — just click Sign In
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {['AI Segments', 'Multi-Channel', 'Live Analytics'].map((feat) => (
            <div key={feat} className="text-center py-3 px-2 bg-white rounded-xl border border-border shadow-soft hover:shadow-medium transition-shadow">
              <p className="text-xs font-bold text-text-secondary tracking-tight">{feat}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
