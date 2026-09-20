import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Terminal, 
  Film, 
  FileCode, 
  Layers, 
  Sparkles, 
  Download,
  Clock
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onExportBundle: () => void;
  totalDuration: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onExportBundle,
  totalDuration
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Dragon 9 54-minute hour calculations (Earth minutes % 54)
      const totalEarthMinutes = now.getHours() * 60 + now.getMinutes();
      const dHour = Math.floor(totalEarthMinutes / 54);
      const dMin = totalEarthMinutes % 54;
      const dSec = now.getSeconds();
      const ms = Math.floor(now.getMilliseconds() / 10);
      setCurrentTime(
        `D9[${String(dHour).padStart(2, '0')}:${String(dMin).padStart(2, '0')}:${String(dSec).padStart(2, '0')}.${String(ms).padStart(2, '0')}]`
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 100);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'export', label: 'Code Vault & Termux', icon: FileCode, badge: 'All Scripts' },
    { id: 'stage', label: 'Cartoon Stage', icon: Film, badge: 'Live 2D' },
    { id: 'manifest', label: 'Manifest & Storyboard', icon: Layers },
    { id: 'ffmpeg', label: 'FFmpeg Lab', icon: Terminal },
    { id: 'runner', label: 'Pipeline Runner', icon: Sparkles }
  ];

  return (
    <header id="dragon9_navbar" className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/40">
              <Flame className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black tracking-wider text-lg text-slate-100 uppercase">
                  DRAGON <span className="text-amber-400">9</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                  Asset Architect
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">
                Fluid Motion • 54-Min Hour Pipeline
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav_tab_${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        isActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-3">
            {/* Dragon 9 Clock HUD */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="text-amber-300 font-semibold">{currentTime}</span>
            </div>

            {/* Export All Bundle Button */}
            <button
              id="export_bundle_top_btn"
              onClick={onExportBundle}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Bundle</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
