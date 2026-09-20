import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  Cpu, 
  Sliders, 
  Film, 
  Volume2, 
  Layers, 
  Smartphone,
  Zap,
  Info
} from 'lucide-react';
import { DragonManifest } from '../types/pipeline';

interface FFmpegLabProps {
  manifest: DragonManifest;
}

export const FFmpegLab: React.FC<FFmpegLabProps> = ({ manifest }) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('ultrafast');
  const [crfValue, setCrfValue] = useState<number>(22);
  const [enableLoudnorm, setEnableLoudnorm] = useState<boolean>(true);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  // Construct FFmpeg scene command
  const sampleScene = manifest.scenes[0] || {
    scene_id: 'scene_001',
    title: 'Dojo Awakening',
    computed_duration_sec: 5.5,
    dialogue: [{ speaker: 'sensei', clean_text: 'Welcome to Dragon 9.', explicit_pause_sec: 0.4, estimated_speech_sec: 4.2 }]
  };

  const drawtextFilter = sampleScene.dialogue?.[0]
    ? `drawtext=text='${sampleScene.dialogue[0].speaker?.toUpperCase()}\\: ${sampleScene.dialogue[0].clean_text}':fontcolor=white:fontsize=36:box=1:boxcolor=black@0.75:boxborderw=16:x=(w-text_w)/2:y=h-120:enable='between(t,${sampleScene.dialogue[0].explicit_pause_sec || 0.4},4.6)'`
    : '';

  const videoFilter = `scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=24${drawtextFilter ? `,${drawtextFilter}` : ''}`;
  const audioFilter = enableLoudnorm ? 'aformat=sample_rates=44100:channel_layouts=stereo,loudnorm=I=-16:TP=-1.5:LRA=11' : 'aformat=sample_rates=44100:channel_layouts=stereo';

  const singleSceneCommand = [
    'ffmpeg -y',
    '-loop 1 -i "./assets/backgrounds/scene_001.png"',
    '-i "./assets/audio/voice_scene_001.wav"',
    `-filter_complex "[0:v]${videoFilter}[v];[1:a]${audioFilter}[a]"`,
    '-map "[v]" -map "[a]"',
    `-t ${sampleScene.computed_duration_sec || 5.5}`,
    '-c:v libx264',
    `-preset ${selectedPreset}`,
    `-crf ${crfValue}`,
    '-pix_fmt yuv420p',
    '-c:a aac -b:a 192k',
    '-movflags +faststart',
    '"./output/scene_001.mp4"'
  ].join(' ');

  const concatCommand = [
    'ffmpeg -y -f concat -safe 0',
    '-i ./output/temp/concat_list.txt',
    '-c copy -movflags +faststart',
    '"./output/dragon9_master_episode.mp4"'
  ].join(' ');

  return (
    <div id="ffmpeg_lab" className="space-y-6">
      
      {/* Header Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                FFMPEG RENDER ARCHITECTURE
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                FLUID MOTION
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-100">
              Filtergraph Compiler & Termux Hardware Dispatch
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Dragon 9 compiles complex multi-track audio-visual filtergraphs, burns ASS/SRT subtitles with micro-pauses,
              and renders high-fidelity 24fps H.264/AAC videos directly on mobile ARM64 devices without dropping frames.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs">
            <div className="text-center px-2">
              <div className="text-amber-400 font-bold">24 FPS</div>
              <div className="text-[10px] text-slate-500">Fluid Cadence</div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center px-2">
              <div className="text-cyan-400 font-bold">1080p</div>
              <div className="text-[10px] text-slate-500">Master Canvas</div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center px-2">
              <div className="text-emerald-400 font-bold">EBU R128</div>
              <div className="text-[10px] text-slate-500">Loudnorm</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Encoding Preset */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
          <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5 font-bold">
            <Cpu className="w-4 h-4 text-amber-400" />
            <span>x264 Preset (Speed vs Efficiency)</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {['ultrafast', 'veryfast', 'medium'].map((preset) => (
              <button
                key={preset}
                onClick={() => setSelectedPreset(preset)}
                className={`py-1.5 px-2 rounded-lg text-xs font-mono transition-all ${
                  selectedPreset === preset
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            * Use <strong>ultrafast</strong> in Termux for near-realtime mobile rendering.
          </p>
        </div>

        {/* CRF Quality Slider */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <label className="text-slate-300 flex items-center gap-1.5 font-bold">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>CRF Quality Constant:</span>
            </label>
            <span className="text-amber-400 font-bold">{crfValue}</span>
          </div>
          <input
            type="range"
            min={18}
            max={28}
            step={1}
            value={crfValue}
            onChange={(e) => setCrfValue(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>18 (Lossless/Heavy)</span>
            <span>22 (Balanced)</span>
            <span>28 (Ultra-compact)</span>
          </div>
        </div>

        {/* Audio Normalization (Loudnorm) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
          <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5 font-bold">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>Audio Mastering Standard</span>
          </label>
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400 font-mono">EBU R128 Loudnorm</span>
            <button
              onClick={() => setEnableLoudnorm(!enableLoudnorm)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                enableLoudnorm
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}
            >
              {enableLoudnorm ? 'ENABLED (-16 LUFS)' : 'DISABLED'}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            Automatically prevents speech audio clipping and balances laughter/SFX.
          </p>
        </div>

      </div>

      {/* Generated FFmpeg Commands */}
      <div className="space-y-4">
        
        {/* Single Scene Render Command */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-slate-200">
                1. Scene Render Command (Filtergraph + Dialogue Subtitle Burn)
              </span>
            </div>
            <button
              onClick={() => handleCopy(singleSceneCommand, 'single_cmd')}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all"
            >
              {copiedCmd === 'single_cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCmd === 'single_cmd' ? 'Copied!' : 'Copy Command'}</span>
            </button>
          </div>
          <div className="p-4 bg-slate-950 font-mono text-xs text-cyan-300/90 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {singleSceneCommand}
          </div>
        </div>

        {/* Master Video Concat Command */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold text-slate-200">
                2. Episode Concatenation Command (Demuxer Stream Copy)
              </span>
            </div>
            <button
              onClick={() => handleCopy(concatCommand, 'concat_cmd')}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all"
            >
              {copiedCmd === 'concat_cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCmd === 'concat_cmd' ? 'Copied!' : 'Copy Command'}</span>
            </button>
          </div>
          <div className="p-4 bg-slate-950 font-mono text-xs text-amber-300/90 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {concatCommand}
          </div>
        </div>

      </div>

    </div>
  );
};
