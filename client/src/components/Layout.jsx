import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sprout, 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  Sparkles, 
  LogOut, 
  Menu, 
  X, 
  Layers,
  ShieldCheck,
  User
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Register Farm', path: '/farms/new', icon: PlusCircle },
    { label: 'Generate Advisory', path: '/advisory/generate', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-[#0b1320] text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Navbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900/90 backdrop-blur border-b border-slate-800">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Sprout className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">Agri<span className="text-emerald-400">Advisory</span></span>
        </Link>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar (Desktop & Mobile Dropdown) */}
      <aside className={`
        ${mobileMenuOpen ? 'block' : 'hidden'} 
        md:flex md:w-64 flex-col justify-between bg-slate-900 border-r border-slate-800/80 p-5 shrink-0
      `}>
        <div>
          {/* Logo */}
          <Link to="/" className="hidden md:flex items-center space-x-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <Sprout className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight text-white">Agri<span className="text-emerald-400">Advisory</span></div>
              <div className="text-[11px] text-emerald-400/80 font-medium tracking-wider uppercase">AI Agronomist Engine</div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-3 mb-2">Navigation</div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* AI Capabilities Badge */}
          <div className="mt-8 p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Gemini 2.5 Flash Active</span>
            </div>
            <p className="text-[12px] text-slate-400 leading-relaxed">
              Real-time localized agronomy reasoning with scientific validation.
            </p>
          </div>
        </div>

        {/* User Info & Logout */}
        <div className="pt-6 border-t border-slate-800 mt-6">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-xs font-medium text-slate-200 truncate">{user?.email}</div>
                <div className="text-[10px] text-emerald-400">Authenticated</div>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
