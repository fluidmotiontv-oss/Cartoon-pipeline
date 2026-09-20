import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  Terminal, 
  Sparkles, 
  Layers, 
  Film, 
  Volume2, 
  Check, 
  Copy,
  RefreshCw,
  Cpu,
  Smartphone
} from 'lucide-react';
import { DragonManifest } from '../types/pipeline';

interface PipelineRunnerProps {
  manifest: DragonManifest;
  onNavigateToTab: (tab: string) => void;
}

export const PipelineRunner: React.FC<PipelineRunnerProps> = ({
  manifest,
  onNavigateToTab
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([
    '🐉 Dragon 9 Pipeline Environment Initialized.',
    'Ready to execute orchestration build.'
  ]);
  const [copiedLog, setCopiedLog] = useState<boolean>(false);

  const steps = [
    {
      id: 1,
      title: 'Manifest Validation & Temporal Alignment',
      desc: 'Verify 54-minute hour structure, syllable budgets, and comedy pause markers.'
    },
    {
      id: 2,
      title: 'Speech Synthesis & Timing Synchronization',
      desc: 'Align [pause: X.Xs] audio gaps with character dialogue and sound effects.'
    },
    {
      id: 3,
      title: 'Vector Keyframe & Lip-Sync Layer Rendering',
      desc: 'Rasterize 24fps SVG frames and morph phoneme mouth shapes (A, E, I, O, U).'
    },
    {
      id: 4,
      title: 'FFmpeg Filtergraph Compilation & Concat',
      desc: 'Assemble multi-track audio, color grading, subtitles, and lossless demux stitch.'
    },
    {
      id: 5,
      title: 'Master Video Export & Termux Bundle Ready',
      desc: 'Complete package compiled for mobile deployment.'
    }
  ];

  const handleStartPipeline = () => {
    setIsRunning(true);
    setCurrentStep(1);
    setLogs([
      '🐉 [Dragon 9] Starting Pipeline Orchestration...',
      `📋 Loading manifest: "${manifest.title}" (${manifest.manifest_id})`,
      `⏱️ Total Scenes: ${manifest.scenes.length} | Frame Rate: ${manifest.fps || 24} FPS`
    ]);

    // Step 1 Simulation
    setTimeout(() => {
      setCurrentStep(2);
      setLogs((prev) => [
        ...prev,
        '✅ [Step 1/5] Manifest validated successfully against Dragon 9 Temporal Schema.',
        '🎙️ [Step 2/5] Synthesizing audio stems with speech pauses [pause: 0.4s]...'
      ]);
    }, 900);

    // Step 2 Simulation
    setTimeout(() => {
      setCurrentStep(3);
      setLogs((prev) => [
        ...prev,
        '✅ [Step 2/5] Audio tracks aligned. Loudness normalized to -16 LUFS (EBU R128).',
        '🎨 [Step 3/5] Generating procedural cartoon frames & lip-sync phonemes...'
      ]);
    }, 1800);

    // Step 3 Simulation
    setTimeout(() => {
      setCurrentStep(4);
      setLogs((prev) => [
        ...prev,
        '✅ [Step 3/5] 24 FPS vector keyframes generated. Parallax waves rendered.',
        '⚡ [Step 4/5] Executing FFmpeg complex filtergraphs & subtitle burning...'
      ]);
    }, 2800);

    // Step 4 Simulation
    setTimeout(() => {
      setCurrentStep(5);
      setIsRunning(false);
      setLogs((prev) => [
        ...prev,
        '✅ [Step 4/5] Scene chunks rendered and concatenated into master episode.',
        '🎉 [Step 5/5] Pipeline Execution Succeeded! Master output generated at: ./output/dragon9_master_episode.mp4'
      ]);
    }, 3800);
  };

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  return (
    <div id="pipeline_runner" className="space-y-6">
      
      {/* Launch Control Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono font-bold text-slate-200">
              END-TO-END ORCHESTRATION RUNNER
            </span>
          </div>
          <h2 className="text-2xl font-bold font-serif text-slate-100">
            Execute Dragon 9 Render Pipeline
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Simulate or verify the complete multi-stage cartoon compilation pipeline: Manifest verification, 
            audio synchronization, vector compositing, and FFmpeg filtergraph construction.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            id="start_pipeline_btn"
            onClick={handleStartPipeline}
            disabled={isRunning}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <Play className={`w-4 h-4 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running Pipeline...' : 'Run Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Steps vs Live Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: 5-Stage Step Progress */}
        <div className="lg:col-span-5 space-y-3">
          {steps.map((step) => {
            const isCompleted = currentStep > step.id || (currentStep === 5 && !isRunning);
            const isCurrent = currentStep === step.id && isRunning;
            
            return (
              <div
                key={step.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-slate-900 border-amber-500/60 ring-1 ring-amber-500/30 shadow-md shadow-amber-500/10'
                    : isCompleted
                    ? 'bg-slate-900/60 border-slate-700/60'
                    : 'bg-slate-900/40 border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : isCurrent
                        ? 'bg-amber-500 text-slate-950 animate-pulse font-black'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-200 font-mono">
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Live Console Terminal Output */}
        <div className="lg:col-span-7">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full min-h-[380px]">
            <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-slate-400 ml-2">
                  dragon9-orchestrator.log
                </span>
              </div>
              <button
                onClick={handleCopyLogs}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all"
              >
                {copiedLog ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLog ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-4 flex-1 font-mono text-xs text-slate-300 space-y-1.5 overflow-y-auto">
              {logs.map((line, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed ${
                    line.includes('✅') || line.includes('🎉')
                      ? 'text-emerald-400'
                      : line.includes('🐉') || line.includes('⏱️')
                      ? 'text-amber-300'
                      : 'text-slate-300'
                  }`}
                >
                  {line}
                </div>
              ))}
            </div>

            <div className="bg-slate-900/50 p-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Termux Output Target: /sdcard/Dragon9/</span>
              </span>
              <button
                onClick={() => onNavigateToTab('export')}
                className="text-amber-400 hover:underline"
              >
                View Exported Scripts →
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
