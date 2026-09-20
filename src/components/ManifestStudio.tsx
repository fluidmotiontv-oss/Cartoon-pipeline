import React, { useState } from 'react';
import { 
  Layers, 
  Sparkles, 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Globe, 
  Film,
  MessageSquare,
  FileJson,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { DragonManifest, Scene, DialogueItem } from '../types/pipeline';

interface ManifestStudioProps {
  manifest: DragonManifest;
  setManifest: (manifest: DragonManifest) => void;
  onRunManifest: () => void;
}

export const ManifestStudio: React.FC<ManifestStudioProps> = ({
  manifest,
  setManifest,
  onRunManifest
}) => {
  const [activeLangTab, setActiveLangTab] = useState<string>('en');
  const [isRawJsonMode, setIsRawJsonMode] = useState<boolean>(false);
  const [rawJsonText, setRawJsonText] = useState<string>(JSON.stringify(manifest, null, 2));
  const [aiPrompt, setAiPrompt] = useState<string>('A quick witty exchange about the 54-minute hour and coffee breaks');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedRaw, setCopiedRaw] = useState<boolean>(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const scenes = manifest.scenes || [];

  // Update a specific scene
  const handleUpdateScene = (index: number, updated: Partial<Scene>) => {
    const updatedScenes = [...scenes];
    updatedScenes[index] = { ...updatedScenes[index], ...updated };
    const updatedManifest = { ...manifest, scenes: updatedScenes };
    setManifest(updatedManifest);
    setRawJsonText(JSON.stringify(updatedManifest, null, 2));
  };

  // Update dialogue text and recalc pause tags
  const handleUpdateDialogue = (sceneIndex: number, dlgIndex: number, newText: string) => {
    const updatedScenes = [...scenes];
    const targetScene = updatedScenes[sceneIndex];
    if (!targetScene.dialogue) return;

    // Parse [pause: X.Xs]
    let pauseSec = 0;
    const matches = [...newText.matchAll(/\[pause:\s*([0-9.]+)\s*(s|ms)?\]/gi)];
    for (const m of matches) {
      const val = parseFloat(m[1]);
      const unit = (m[2] || 's').toLowerCase();
      pauseSec += unit === 'ms' ? val / 1000 : val;
    }

    const clean = newText.replace(/\[pause:\s*[0-9.]+\s*(s|ms)?\]/gi, '').trim();
    const words = clean.split(/\s+/).filter(Boolean);
    const lastWord = words.length > 0 ? words[words.length - 1].replace(/[.,!?;:"]/g, '') : '';

    const updatedDlg: DialogueItem = {
      ...targetScene.dialogue[dlgIndex],
      raw_text: newText,
      text: newText,
      clean_text: clean,
      explicit_pause_sec: pauseSec,
      word_count: words.length,
      syllable_count: Math.max(1, Math.round(words.length * 1.4)),
      last_word_punchline: lastWord
    };

    targetScene.dialogue[dlgIndex] = updatedDlg;
    const updatedManifest = { ...manifest, scenes: updatedScenes };
    setManifest(updatedManifest);
    setRawJsonText(JSON.stringify(updatedManifest, null, 2));
  };

  // Handle AI Episode Manifest Generation via API
  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/pipeline/generate-episode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, targetLanguage: activeLangTab })
      });
      const data = await res.json();
      if (data.success && data.manifest) {
        setManifest(data.manifest);
        setRawJsonText(JSON.stringify(data.manifest, null, 2));
      }
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Raw JSON parsing
  const handleRawJsonChange = (text: string) => {
    setRawJsonText(text);
    try {
      const parsed = JSON.parse(text);
      setManifest(parsed);
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message);
    }
  };

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(rawJsonText);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  return (
    <div id="manifest_studio" className="space-y-6">
      
      {/* AI Episode Generator Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-cyan-950/30 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold text-slate-200">
                DRAGON 9 AI SCRIPT ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Generate full localized 3-scene manifests with precise timing tags ([pause: 0.5s]) and 54-minute temporal synchronization.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              id="ai_prompt_input"
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe episode topic or stand-up comedy bit..."
              className="flex-1 md:w-80 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
            />
            <button
              id="generate_ai_episode_btn"
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating...' : 'Generate Episode'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor View Header & Mode Switch */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 font-serif">
            <Layers className="w-5 h-5 text-amber-400" />
            <span>Story Manifest: {manifest.title}</span>
          </h2>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
            {scenes.length} Scenes
          </span>
        </div>

        {/* View Switcher & Language Selector */}
        <div className="flex items-center gap-3">
          {/* Multilingual Localization Selector */}
          <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800 text-xs font-mono">
            <Globe className="w-3.5 h-3.5 text-amber-400 mx-1.5" />
            {['en', 'de', 'es', 'fr', 'ja'].map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLangTab(lang)}
                className={`px-2 py-0.5 rounded-lg uppercase transition-all ${
                  activeLangTab === lang
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* JSON vs Visual Toggle */}
          <button
            onClick={() => setIsRawJsonMode(!isRawJsonMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-all"
          >
            <FileJson className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isRawJsonMode ? 'Visual Mode' : 'Raw JSON'}</span>
          </button>
        </div>
      </div>

      {/* Main Content: Visual Storyboard Cards vs Raw JSON */}
      {!isRawJsonMode ? (
        <div className="space-y-4">
          {scenes.map((scene, sceneIdx) => {
            const dialogue = scene.dialogue || [];
            return (
              <div
                key={scene.scene_id || sceneIdx}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg"
              >
                {/* Scene Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold flex items-center justify-center">
                      {sceneIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={scene.title}
                      onChange={(e) => handleUpdateScene(sceneIdx, { title: e.target.value })}
                      className="bg-transparent text-sm font-bold text-slate-200 focus:outline-none focus:border-b border-amber-400 px-1 font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{scene.duration_sec || scene.computed_duration_sec || 5.0}s</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                      Cam: {scene.camera?.type || 'static'}
                    </span>
                  </div>
                </div>

                {/* Dialogue & Micro-Timing Blocks */}
                <div className="space-y-3">
                  <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dialogue & Timing Markers ([pause: X.Xs]):</span>
                  </div>

                  {dialogue.map((dlg, dlgIdx) => {
                    const rawText = dlg.raw_text || dlg.text || '';
                    const localizedText = dlg.localized_translations?.[activeLangTab];
                    const displayText = activeLangTab === 'en' ? rawText : (localizedText || rawText);

                    return (
                      <div
                        key={dlg.id || dlgIdx}
                        className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-mono font-bold text-amber-400">
                            {dlg.speaker?.toUpperCase() || 'SPEAKER'}
                          </span>
                          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                            {dlg.explicit_pause_sec ? (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                Pause: {dlg.explicit_pause_sec}s
                              </span>
                            ) : null}
                            <span>Last word: <strong className="text-slate-200">{dlg.last_word_punchline || '—'}</strong></span>
                          </div>
                        </div>

                        {/* Editable Text Area */}
                        <textarea
                          rows={2}
                          value={displayText}
                          onChange={(e) => handleUpdateDialogue(sceneIdx, dlgIdx, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 leading-relaxed font-sans"
                        />

                        {/* Timing Compliance Check Note */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                          <span>Est. Speech: {dlg.estimated_speech_sec?.toFixed(1) || '3.5'}s</span>
                          {dlg.adaptation_notes && (
                            <span className="text-cyan-400/80 italic">{dlg.adaptation_notes}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Raw JSON Editor View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Raw Manifest JSON Schema</span>
            <button
              onClick={handleCopyRaw}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
            >
              {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedRaw ? 'Copied!' : 'Copy JSON'}</span>
            </button>
          </div>
          {jsonError && (
            <div className="p-3 bg-rose-950/50 border-b border-rose-800 text-xs text-rose-300 font-mono">
              Syntax Error: {jsonError}
            </div>
          )}
          <textarea
            rows={18}
            value={rawJsonText}
            onChange={(e) => handleRawJsonChange(e.target.value)}
            className="w-full p-4 bg-slate-950 font-mono text-xs text-amber-300/90 leading-relaxed focus:outline-none resize-y"
          />
        </div>
      )}

    </div>
  );
};
