import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Sliders, 
  Globe, 
  Clock, 
  Sparkles,
  Camera,
  Layers
} from 'lucide-react';
import { DragonManifest, Scene } from '../types/pipeline';

interface CartoonStagePreviewProps {
  manifest: DragonManifest;
}

export const CartoonStagePreview: React.FC<CartoonStagePreviewProps> = ({ manifest }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Compute total duration
  const scenes = manifest.scenes || [];
  const totalDuration = scenes.reduce((acc, s) => acc + (s.computed_duration_sec || s.duration_sec || 5.0), 0);

  // Calculate current scene based on currentTime
  let accumulated = 0;
  let currentScene: Scene = scenes[0] || { scene_id: 'sc1', title: 'Scene 1', duration_sec: 5 };
  let sceneLocalTime = 0;

  for (let i = 0; i < scenes.length; i++) {
    const scDuration = scenes[i].computed_duration_sec || scenes[i].duration_sec || 5.0;
    if (currentTime >= accumulated && currentTime < accumulated + scDuration) {
      currentScene = scenes[i];
      sceneLocalTime = currentTime - accumulated;
      if (activeSceneIndex !== i) setActiveSceneIndex(i);
      break;
    }
    accumulated += scDuration;
  }

  // Active dialogue block
  const dialogues = currentScene.dialogue || [];
  let activeDialogue = dialogues[0] || null;

  // Playback timer loop
  useEffect(() => {
    let lastTimestamp = performance.now();

    const renderLoop = (now: number) => {
      const delta = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isPlaying) {
        setCurrentTime((prev) => {
          const nextTime = prev + delta * playbackSpeed;
          if (nextTime >= totalDuration) {
            return 0; // loop
          }
          return nextTime;
        });
      }

      drawStage();
      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, currentTime, selectedLanguage]);

  // Main Canvas 2D Cartoon Renderer
  const drawStage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Clear & Dark Sci-fi Background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Camera transform
    ctx.save();
    const progress = Math.min(1.0, sceneLocalTime / (currentScene.computed_duration_sec || 5.0));
    
    // Camera pan/zoom simulation
    if (currentScene.camera?.type === 'pan_left') {
      ctx.translate((1.0 - progress) * 40 - 20, 0);
    } else if (currentScene.camera?.type === 'zoom_in') {
      const scale = 1.0 + progress * 0.08;
      ctx.translate(width / 2, height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-width / 2, -height / 2);
    } else if (currentScene.camera?.type === 'punch_in' && progress > 0.6) {
      ctx.translate(width / 2, height / 2);
      ctx.scale(1.12, 1.12);
      ctx.translate(-width / 2, -height / 2);
    }

    // 2. Parallax Cyber Horizon Grid
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.35;
    const horizonY = height * 0.62;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(width, horizonY);
    ctx.stroke();

    const waveOffset = (currentTime * 50) % 150;
    for (let i = -2; i < 18; i++) {
      const topX = i * (width / 14) - waveOffset * 0.4;
      const bottomX = (i - 7) * (width / 7) * 1.5 + (width / 2);
      ctx.beginPath();
      ctx.moveTo(topX, horizonY);
      ctx.lineTo(bottomX, height);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // 3. Dragon Celestial Sun / Crest
    const sunX = width / 2;
    const sunY = height * 0.38;
    ctx.save();
    ctx.beginPath();
    ctx.arc(sunX, sunY, 140, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    // Dragon 9 Emblem in center of sun
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 72px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('9', sunX, sunY + 4);
    ctx.restore();

    // 4. Fluid Waves
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    for (let x = 0; x < width; x += 10) {
      const y = height * 0.68 + Math.sin((x * 0.01) + (currentTime * 3)) * 18;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // 5. Draw Animated Characters
    drawCharacters(ctx, width, height, currentTime, activeDialogue);

    ctx.restore(); // restore camera transform

    // 6. Dialogue Subtitle Banner
    drawSubtitleOverlay(ctx, width, height, activeDialogue, selectedLanguage);

    // 7. Dragon 9 HUD Overlay
    drawHUDOverlay(ctx, width, height, currentTime, currentScene);
  };

  // Draw 2D Cartoon Characters with Lip-Sync
  const drawCharacters = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
    dialogue: any
  ) => {
    const isSpeaking = !!dialogue;
    const isSenseiSpeaking = isSpeaking && dialogue?.speaker === 'dragon_sensei';
    const isComicSpeaking = isSpeaking && dialogue?.speaker !== 'dragon_sensei';

    // Character 1: Sensei (Left)
    const senseiX = width * 0.3;
    const senseiY = height * 0.72;

    // Body
    ctx.fillStyle = '#1e1b4b';
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(senseiX, senseiY, 70, 160, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Head
    const headBob1 = Math.sin(time * 3) * 3;
    ctx.fillStyle = '#312e81';
    ctx.strokeStyle = '#818cf8';
    ctx.beginPath();
    ctx.arc(senseiX, senseiY - 180 + headBob1, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Sensei Horns
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(senseiX - 25, senseiY - 210 + headBob1);
    ctx.lineTo(senseiX - 60, senseiY - 250 + headBob1);
    ctx.lineTo(senseiX - 15, senseiY - 200 + headBob1);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(senseiX + 25, senseiY - 210 + headBob1);
    ctx.lineTo(senseiX + 60, senseiY - 250 + headBob1);
    ctx.lineTo(senseiX + 15, senseiY - 200 + headBob1);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(senseiX - 16, senseiY - 185 + headBob1, 6, 0, Math.PI * 2);
    ctx.arc(senseiX + 16, senseiY - 185 + headBob1, 6, 0, Math.PI * 2);
    ctx.fill();

    // Sensei Mouth (Animated Lip-Sync)
    drawMouth(ctx, senseiX, senseiY - 155 + headBob1, isSenseiSpeaking, time, '#f59e0b');

    // Character 2: Comic Apprentice (Right)
    const comicX = width * 0.7;
    const comicY = height * 0.72;

    // Body
    ctx.fillStyle = '#0f766e';
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(comicX, comicY, 60, 140, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Head
    const headBob2 = Math.cos(time * 3.5) * 4;
    ctx.fillStyle = '#115e59';
    ctx.strokeStyle = '#2dd4bf';
    ctx.beginPath();
    ctx.arc(comicX, comicY - 160 + headBob2, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Visor / Eyes
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(comicX - 25, comicY - 170 + headBob2, 50, 16);

    // Comic Mouth (Animated Lip-Sync)
    drawMouth(ctx, comicX, comicY - 140 + headBob2, isComicSpeaking, time, '#f43f5e');
  };

  const drawMouth = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    isSpeaking: boolean,
    time: number,
    color: string
  ) => {
    ctx.fillStyle = '#090d16';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;

    if (!isSpeaking) {
      // Rest Line
      ctx.beginPath();
      ctx.moveTo(x - 12, y);
      ctx.lineTo(x + 12, y);
      ctx.stroke();
    } else {
      // Morphing phonetic mouth cycle
      const cycle = Math.floor(time * 10) % 4;
      if (cycle === 0) {
        // Wide Open 'A'
        ctx.beginPath();
        ctx.ellipse(x, y + 2, 14, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (cycle === 1) {
        // Grin 'E'
        ctx.beginPath();
        ctx.roundRect(x - 16, y - 4, 32, 8, 4);
        ctx.fill();
        ctx.stroke();
      } else if (cycle === 2) {
        // Round 'O'
        ctx.beginPath();
        ctx.arc(x, y + 2, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        // 'U'
        ctx.beginPath();
        ctx.arc(x, y + 2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
  };

  // Draw Subtitle Banner
  const drawSubtitleOverlay = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dialogue: any,
    targetLang: string
  ) => {
    if (!dialogue) return;

    let textToDisplay = dialogue.clean_text || dialogue.text || '';
    if (targetLang !== 'en' && dialogue.localized_translations?.[targetLang]) {
      textToDisplay = dialogue.localized_translations[targetLang].replace(/\[pause:\s*[^\]]+\]/g, '');
    }

    const speakerName = (dialogue.speaker || 'DRAGON CAST').toUpperCase();
    const bannerY = height - 100;

    ctx.save();
    // Backdrop rounded box
    ctx.fillStyle = 'rgba(9, 13, 22, 0.9)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    const boxW = Math.min(width - 80, 840);
    const boxX = (width - boxW) / 2;
    ctx.beginPath();
    ctx.roundRect(boxX, bannerY - 35, boxW, 80, 16);
    ctx.fill();
    ctx.stroke();

    // Speaker Name Tag
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(speakerName, boxX + 24, bannerY - 12);

    if (dialogue.explicit_pause_sec > 0) {
      ctx.fillStyle = '#f59e0b';
      ctx.textAlign = 'right';
      ctx.fillText(`[PAUSE: ${dialogue.explicit_pause_sec}s SYNC]`, boxX + boxW - 24, bannerY - 12);
    }

    // Dialogue Line
    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(textToDisplay, width / 2, bannerY + 22);

    ctx.restore();
  };

  // Draw Dragon 9 Clock HUD
  const drawHUDOverlay = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
    scene: Scene
  ) => {
    ctx.save();
    const dMin = Math.floor(time / 60);
    const dSec = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    const timeStr = `D9 00:${String(dMin).padStart(2, '0')}:${String(dSec).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;

    // Top Right Clock
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(width - 240, 20, 220, 42, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(width - 218, 41, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 14px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(timeStr, width - 200, 46);

    // Top Left Scene Indicator
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(20, 20, 240, 42, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 13px "JetBrains Mono", monospace';
    ctx.fillText(`${scene.title || 'SCENE'}`, 36, 46);

    ctx.restore();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
  };

  const jumpToScene = (index: number) => {
    let t = 0;
    for (let i = 0; i < index; i++) {
      t += scenes[i].computed_duration_sec || scenes[i].duration_sec || 5.0;
    }
    setCurrentTime(t);
  };

  return (
    <div id="cartoon_stage_preview" className="space-y-6">
      
      {/* Canvas Viewport Frame */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="w-full h-auto aspect-video block bg-slate-950"
        />

        {/* Floating Quick Language Switcher */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 shadow-lg">
          <Globe className="w-3.5 h-3.5 text-amber-400 ml-1.5" />
          {['en', 'de', 'es', 'fr', 'ja'].map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-2 py-0.5 rounded-lg text-xs font-mono uppercase transition-all ${
                selectedLanguage === lang
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Scrub Bar & Media Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        
        {/* Timeline Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="text-amber-400 font-semibold">{currentTime.toFixed(2)}s</span>
            <span>Scene: {currentScene.title}</span>
            <span className="text-slate-500">{totalDuration.toFixed(2)}s</span>
          </div>
          <input
            id="timeline_scrubber"
            type="range"
            min={0}
            max={totalDuration || 10}
            step={0.05}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-t border-slate-800/80">
          
          {/* Play/Pause & Navigation */}
          <div className="flex items-center gap-2">
            <button
              id="stage_play_btn"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <button
              id="stage_rewind_btn"
              onClick={() => setCurrentTime(0)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
              title="Restart from beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Scene Selectors */}
            <div className="hidden sm:flex items-center gap-1.5 ml-2">
              {scenes.map((sc, idx) => (
                <button
                  key={sc.scene_id}
                  onClick={() => jumpToScene(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    activeSceneIndex === idx
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Scene {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Speed & Audio Toggles */}
          <div className="flex items-center gap-2">
            {/* Speed Selector */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs font-mono">
              {[1.0, 1.5, 2.0].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-1 rounded-md transition-all ${
                    playbackSpeed === spd ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Mute Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
