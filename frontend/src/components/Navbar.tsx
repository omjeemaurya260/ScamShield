import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X, MessageSquare, Camera, Mic, Link2, Users, History, BookOpen, BarChart3, Home } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { path: '/scanner', label: 'Message Scan', icon: MessageSquare },
  { path: '/screenshot', label: 'Screenshot', icon: Camera },
  { path: '/call', label: 'Call Analysis', icon: Mic },
  { path: '/url', label: 'URL Check', icon: Link2 },
  { path: '/family', label: 'Family', icon: Users },
  { path: '/history', label: 'History', icon: History },
  { path: '/education', label: 'Learn', icon: BookOpen },
];

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Shield className="h-8 w-8 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              <div className="absolute inset-0 bg-cyan-400/20 blur-md rounded-full group-hover:bg-cyan-300/30 transition-all" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">Scam</span>
              <span className="text-lg font-bold text-cyan-400">Shield</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(path)
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <a
              href="tel:1930"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all"
            >
              🚨 1930 Helpline
            </a>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-slate-400 hover:text-white"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-slate-700/50 bg-slate-950/98 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive('/') ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive(path) ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-700/50">
              <a
                href="tel:1930"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10"
              >
                🚨 Cybercrime Helpline: 1930
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
