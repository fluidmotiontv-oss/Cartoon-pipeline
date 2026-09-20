import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  FileCode, 
  FolderDown, 
  Search, 
  Smartphone,
  ExternalLink,
  Code2,
  Sparkles
} from 'lucide-react';
import { CodeScriptItem } from '../types/pipeline';

interface CodeExportVaultProps {
  scripts: CodeScriptItem[];
  onExportBundle: () => void;
}

export const CodeExportVault: React.FC<CodeExportVaultProps> = ({
  scripts,
  onExportBundle
}) => {
  const [selectedScriptId, setSelectedScriptId] = useState<string>('orchestrator');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const selectedScript = scripts.find(s => s.id === selectedScriptId) || scripts[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const categories = [
    { id: 'all', label: 'All Modules' },
    { id: 'orchestrator', label: 'Orchestrator' },
    { id: 'generator', label: 'Cartoon Gen' },
    { id: 'renderer', label: 'FFmpeg' },
    { id: 'parser', label: 'Manifest Parser' },
    { id: 'bridge', label: 'Python Bridge' },
    { id: 'termux', label: 'Termux Setup' },
    { id: 'manifest', label: 'Sample Manifest' }
  ];

  const filteredScripts = scripts.filter(s => {
    const matchesCat = activeCategory === 'all' || s.category === activeCategory;
    const matchesQuery = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div id="code_export_vault" className="space-y-6">
      
      {/* Hero / Termux Integration Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/30 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                DRAGON 9 ASSET ARCHITECT
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                TERMUX MOBILE OPTIMIZED
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-100">
              Unabridged Script Consolidation & Code Export
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Complete, production-ready source code for our cartoon generation, FFmpeg filtergraph rendering,
              dialogue micro-pause synchronizers, and zero-dependency Python bridge for Android Termux.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="export_all_bundle_btn"
              onClick={onExportBundle}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <FolderDown className="w-4 h-4" />
              <span>Download All Scripts (.bundle)</span>
            </button>
            <button
              id="copy_termux_setup_btn"
              onClick={() => handleCopy('pkg update -y && pkg install -y nodejs-lts python ffmpeg git', 'quick_pkg')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition-all active:scale-95"
            >
              {copiedId === 'quick_pkg' ? <Check className="w-4 h-4 text-emerald-400" /> : <Smartphone className="w-4 h-4 text-cyan-400" />}
              <span>{copiedId === 'quick_pkg' ? 'Copied Termux Pkg!' : 'Copy Termux Pkg Command'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Script Directory & File List */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="script_search_input"
              type="text"
              placeholder="Search scripts by name or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-slate-700 text-amber-400 border border-slate-600 font-semibold'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Script Cards List */}
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredScripts.map((script) => {
              const isSelected = selectedScript?.id === script.id;
              return (
                <div
                  key={script.id}
                  id={`script_card_${script.id}`}
                  onClick={() => setSelectedScriptId(script.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-850 border-amber-500/50 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/30'
                      : 'bg-slate-900/60 hover:bg-slate-850/80 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileCode className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span className="text-xs font-mono font-bold text-slate-200">
                        {script.filename}
                      </span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {script.language}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-snug">
                    {script.description}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-800/60 pt-2">
                    <span>{script.content.split('\n').length} lines</span>
                    <span className="text-cyan-400/80">Termux Ready</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Viewer, Quick Actions & Termux Command */}
        <div className="lg:col-span-8 space-y-4">
          {selectedScript ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
              
              {/* Header Bar */}
              <div className="bg-slate-950/80 border-b border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 font-mono">
                      {selectedScript.filename}
                      <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                        {selectedScript.title}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedScript.description}
                    </p>
                  </div>
                </div>

                {/* Copy & Download Actions */}
                <div className="flex items-center gap-2">
                  <button
                    id={`copy_code_${selectedScript.id}`}
                    onClick={() => handleCopy(selectedScript.content, selectedScript.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium transition-all active:scale-95"
                  >
                    {copiedId === selectedScript.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>

                  <button
                    id={`download_code_${selectedScript.id}`}
                    onClick={() => handleDownload(selectedScript.filename, selectedScript.content)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Termux Run Command Box */}
              <div className="bg-slate-950/40 px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-400 overflow-hidden">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-slate-500 select-none">$</span>
                  <span className="text-cyan-300 truncate">{selectedScript.termuxCommand}</span>
                </div>
                <button
                  onClick={() => handleCopy(selectedScript.termuxCommand, `cmd_${selectedScript.id}`)}
                  className="text-slate-400 hover:text-cyan-300 p-1 rounded hover:bg-slate-800 shrink-0"
                  title="Copy command"
                >
                  {copiedId === `cmd_${selectedScript.id}` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Unabridged Code Block Viewer */}
              <div className="relative p-4 max-h-[520px] overflow-y-auto bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed selection:bg-amber-500/30">
                <pre className="overflow-x-auto">
                  <code>
                    {selectedScript.content.split('\n').map((line, idx) => (
                      <div key={idx} className="flex hover:bg-slate-900/60 py-0.5 px-1 rounded">
                        <span className="w-10 text-slate-600 select-none text-right pr-4 shrink-0 font-light">
                          {idx + 1}
                        </span>
                        <span className="whitespace-pre">{line}</span>
                      </div>
                    ))}
                  </code>
                </pre>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl">
              Select a script from the list to inspect and export.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
