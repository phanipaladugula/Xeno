import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Layers, Megaphone, MessageSquare,
  LogOut, Menu, X, Bell, ChevronRight, Sparkles
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Customers', icon: Users, path: '/customers' },
  { name: 'Segments', icon: Layers, path: '/segments' },
  { name: 'Campaigns', icon: Megaphone, path: '/campaigns' },
  { name: 'AI Assistant', icon: MessageSquare, path: '/chat', badge: 'AI' },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('xeno_token');
    navigate('/login');
  };

  const currentPage = navigation.find(n => n.path === location.pathname)?.name || 'Agentic Marketing Platform';

  return (
    <div className="flex h-screen text-text bg-transparent overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static top-0 left-0 z-50 h-full w-64 flex flex-col
        bg-white border-r border-border
        transition-transform duration-300 lg:translate-x-0 shadow-soft
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <img 
              src="https://cdn.prod.website-files.com/620353a026ae70e21288308a/69e0a8442fde5f7cc3b2d3c6_newlogoxeno-blue11.png" 
              alt="Xeno Logo" 
              className="h-8"
            />
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-text-tertiary hover:text-xeno-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider px-3 mb-4">
            Main Menu
          </p>
          {navigation.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-xeno-50 text-xeno-600'
                    : 'text-text-secondary hover:bg-background-tertiary hover:text-text'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-xeno-500"
                  />
                )}
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-xeno-600' : 'text-text-tertiary group-hover:text-xeno-500'}`} />
                <span className="flex-1 text-left">{item.name}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-xeno-100 text-xeno-700 rounded-full">
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-4 h-4 text-xeno-400" />}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-border shrink-0 bg-background-secondary">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-background-tertiary transition-colors border border-transparent hover:border-border cursor-pointer" onClick={handleLogout}>
            <div className="w-9 h-9 rounded-full bg-xeno-100 flex items-center justify-center text-sm font-bold text-xeno-600">
              XD
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-bold text-text truncate">Xeno Demo</p>
              <p className="text-xs text-text-tertiary truncate">demo@xeno.com</p>
            </div>
            <div className="text-text-tertiary hover:text-error-500 p-1">
              <LogOut className="w-4 h-4" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-border/50 bg-white/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-text-secondary hover:text-text">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-text">{currentPage}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/chat')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-xeno-50 border border-xeno-200 rounded-xl text-xeno-700 text-sm font-semibold hover:bg-xeno-100 transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-xeno-500" />
              Ask AI
            </button>
            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-white text-text-secondary hover:text-text hover:bg-background-tertiary transition-all shadow-sm">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-error-500 border-2 border-white rounded-full" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}