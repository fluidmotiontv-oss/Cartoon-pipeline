/**
 * Dragon 9 Cartoon Generator & Visual Layer Compositor
 * -----------------------------------------------------------------------------
 * Procedural 2D cartoon scene renderer, character keyframer, phoneme lip-sync
 * generator, and visual asset compositor for the Dragon 9 animation pipeline.
 * 
 * Generates vector frames (SVG), canvas draw instructions, and prompt blueprints
 * for AI rendering, fully runnable in Node.js, Web Browsers, and Termux CLI.
 * -----------------------------------------------------------------------------
 */

class Dragon9CartoonGenerator {
  constructor(options = {}) {
    this.width = options.width || 1920;
    this.height = options.height || 1080;
    this.fps = options.fps || 24;
    this.palette = {
      primary: '#f59e0b',    // Amber / Gold Dragon
      secondary: '#06b6d4',  // Cyan Fluid
      accent: '#ec4899',     // Magenta Pulse
      darkBg: '#090d16',     // Deep Void
      gridLine: '#1e293b',
      text: '#f8fafc',
      ...options.palette
    };
  }

  /**
   * Generates a fully composed procedural SVG frame at time `t` (seconds)
   * @param {object} scene - Validated scene object from ManifestParser
   * @param {number} localTimeSec - Current playback time relative to scene start
   * @param {object} currentDialogue - Active dialogue item (if speaking)
   * @returns {string} Clean SVG markup string
   */
  generateFrameSVG(scene, localTimeSec, currentDialogue = null) {
    const progress = Math.min(1.0, Math.max(0.0, localTimeSec / (scene.computed_duration_sec || 5.0)));
    const frameIndex = Math.floor(localTimeSec * this.fps);
    const cameraTransform = this.computeCameraTransform(scene.camera, progress);

    // 1. Background Layers
    const bgSvg = this.renderBackground(scene.background, progress, localTimeSec);

    // 2. Character Keyframing & Lip-sync
    const charactersSvg = this.renderCharacters(scene, localTimeSec, currentDialogue);

    // 3. Fluid Motion FX & Speedlines
    const fxSvg = this.renderVFX(scene.visual_layers, progress, localTimeSec);

    // 4. Subtitle / Dialogue Overlay with Dragon 9 Timing
    const subtitleSvg = this.renderSubtitles(currentDialogue, localTimeSec);

    // 5. Dragon 9 Synchronized Temporal HUD
    const hudSvg = this.renderDragon9HUD(scene, localTimeSec);

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.width} ${this.height}" width="100%" height="100%" style="background-color: ${this.palette.darkBg}; font-family: 'Plus Jakarta Sans', system-ui, sans-serif;">
  <defs>
    <linearGradient id="dragonGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <linearGradient id="fluidCyan" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
      <stop offset="60%" stop-color="#000000" stop-opacity="0" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.75" />
    </radialGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- World Group with Camera Pan & Zoom Transform -->
  <g transform="${cameraTransform}">
    <!-- Background Layer -->
    ${bgSvg}

    <!-- VFX / Atmosphere Layer -->
    ${fxSvg}

    <!-- Characters Layer -->
    ${charactersSvg}
  </g>

  <!-- Screen Space Layers (Vignette, Subtitles, Dragon 9 HUD) -->
  <rect width="${this.width}" height="${this.height}" fill="url(#vignette)" pointer-events="none" />
  ${subtitleSvg}
  ${hudSvg}
</svg>`.trim();
  }

  /**
   * Compute 2D Camera Transformations (Pan, Zoom, Shake, Punch-In)
   */
  computeCameraTransform(camera = {}, progress = 0) {
    const type = camera.type || 'static';
    const cx = this.width / 2;
    const cy = this.height / 2;

    let scale = 1.0;
    let tx = 0;
    let ty = 0;

    switch (type) {
      case 'pan_left':
        tx = (1.0 - progress) * 120 - 60;
        scale = 1.05;
        break;
      case 'pan_right':
        tx = (progress - 0.5) * 120;
        scale = 1.05;
        break;
      case 'zoom_in':
        scale = 1.0 + (progress * 0.18);
        break;
      case 'punch_in':
        // Fast snap on punchline beat
        scale = progress > 0.6 ? 1.25 : 1.0;
        break;
      case 'shake':
        tx = Math.sin(progress * 50) * 8 * (camera.intensity || 0.5);
        ty = Math.cos(progress * 40) * 8 * (camera.intensity || 0.5);
        scale = 1.05;
        break;
      default:
        scale = 1.0;
        break;
    }

    return `translate(${cx}, ${cy}) scale(${scale.toFixed(3)}) translate(${-cx + tx.toFixed(1)}, ${-cy + ty.toFixed(1)})`;
  }

  /**
   * Render Background Grids, Waves, and Dojo Architecture
   */
  renderBackground(bgConfig = {}, progress = 0, timeSec = 0) {
    const theme = bgConfig.theme || 'cyber_neon_dojo';
    const waveOffset = (timeSec * 40) % 200;

    return `
    <g id="background_layer">
      <!-- Dark gradient sky -->
      <rect width="${this.width}" height="${this.height}" fill="#0a0f1d" />

      <!-- Parallax Cyber Grid Horizon -->
      <g opacity="0.35">
        <line x1="0" y1="${this.height * 0.65}" x2="${this.width}" y2="${this.height * 0.65}" stroke="#38bdf8" stroke-width="2" />
        ${Array.from({ length: 16 }).map((_, i) => {
          const x = (i * (this.width / 15)) - (waveOffset * 0.5);
          return `<line x1="${x}" y1="${this.height * 0.65}" x2="${x * 1.4 - 300}" y2="${this.height}" stroke="#0284c7" stroke-width="1.5" />`;
        }).join('\n')}
        ${Array.from({ length: 6 }).map((_, i) => {
          const y = this.height * 0.65 + Math.pow(i / 5, 2) * (this.height * 0.35);
          return `<line x1="0" y1="${y}" x2="${this.width}" y2="${y}" stroke="#0284c7" stroke-width="1" />`;
        }).join('\n')}
      </g>

      <!-- Dragon Neon Dojo Crest / Sun -->
      <circle cx="${this.width / 2}" cy="${this.height * 0.42}" r="220" fill="none" stroke="url(#dragonGold)" stroke-width="4" opacity="0.8" filter="url(#glow)" />
      <circle cx="${this.width / 2}" cy="${this.height * 0.42}" r="170" fill="#0f172a" opacity="0.85" />
      <path d="M ${this.width / 2 - 120} ${this.height * 0.42} Q ${this.width / 2} ${this.height * 0.42 - 100} ${this.width / 2 + 120} ${this.height * 0.42} T ${this.width / 2} ${this.height * 0.42 + 80} Z" fill="url(#dragonGold)" opacity="0.9" />

      <!-- Fluid Aura Ribbons -->
      <path d="M 0 ${this.height * 0.7} Q ${this.width * 0.25} ${this.height * 0.65 + Math.sin(timeSec * 2) * 30} ${this.width * 0.5} ${this.height * 0.72} T ${this.width} ${this.height * 0.68}" fill="none" stroke="url(#fluidCyan)" stroke-width="6" opacity="0.5" filter="url(#glow)" />
    </g>`;
  }

  /**
   * Render Animated Characters with Lip-Sync Phonemes and Expressive Poses
   */
  renderCharacters(scene, timeSec, currentDialogue) {
    const isSpeaking = !!currentDialogue;
    const speakerId = currentDialogue?.speaker || 'dragon_sensei';

    // Phoneme selection based on time oscillation
    const phonemes = ['rest', 'A', 'E', 'O', 'rest', 'U'];
    const activePhoneme = isSpeaking ? phonemes[Math.floor(timeSec * 8) % phonemes.length] : 'rest';

    // Character 1: Sensei / Anchor (Left Center)
    const senseiX = this.width * 0.32;
    const senseiY = this.height * 0.72;
    const isSenseiSpeaking = isSpeaking && (speakerId === 'dragon_sensei' || speakerId === 'sensei');

    // Character 2: Comedian / Apprentice (Right Center)
    const comicX = this.width * 0.68;
    const comicY = this.height * 0.72;
    const isComicSpeaking = isSpeaking && (speakerId !== 'dragon_sensei' && speakerId !== 'sensei');

    return `
    <g id="characters_layer">
      <!-- Character 1: Dragon Master / Sensei -->
      <g transform="translate(${senseiX}, ${senseiY})">
        <!-- Shadow -->
        <ellipse cx="0" cy="15" rx="140" ry="24" fill="#000" opacity="0.5" />
        
        <!-- Robe Body -->
        <path d="M -110 0 C -90 -220, -50 -320, 0 -340 C 50 -320, 90 -220, 110 0 Z" fill="#1e1b4b" stroke="#6366f1" stroke-width="4" />
        <path d="M -20 -330 L 0 0 L 20 -330" stroke="#f59e0b" stroke-width="5" />
        <circle cx="0" cy="-220" r="18" fill="#f59e0b" />

        <!-- Head with Gentle Bob -->
        <g transform="translate(0, ${Math.sin(timeSec * 3) * 4 - 360})">
          <!-- Mask / Head Shape -->
          <polygon points="0,-90 60,-30 45,60 -45,60 -60,-30" fill="#312e81" stroke="#818cf8" stroke-width="4" />
          
          <!-- Dragon Horns -->
          <path d="M -40 -70 Q -80 -140 -110 -110 Q -70 -70 -30 -50" fill="#f59e0b" />
          <path d="M 40 -70 Q 80 -140 110 -110 Q 70 -70 30 -50" fill="#f59e0b" />

          <!-- Eyes -->
          <ellipse cx="-24" cy="-10" rx="12" ry="${isSenseiSpeaking ? 10 : 8}" fill="#38bdf8" filter="url(#glow)" />
          <ellipse cx="24" cy="-10" rx="12" ry="${isSenseiSpeaking ? 10 : 8}" fill="#38bdf8" filter="url(#glow)" />
          <circle cx="-24" cy="-10" r="4" fill="#ffffff" />
          <circle cx="24" cy="-10" r="4" fill="#ffffff" />

          <!-- Dynamic Mouth (Lip-Sync) -->
          ${this.renderMouthShape(0, 30, isSenseiSpeaking ? activePhoneme : 'rest', '#f59e0b')}
        </g>
      </g>

      <!-- Character 2: Fluid Comic Apprentice -->
      <g transform="translate(${comicX}, ${comicY})">
        <!-- Shadow -->
        <ellipse cx="0" cy="15" rx="120" ry="20" fill="#000" opacity="0.5" />
        
        <!-- Body -->
        <path d="M -80 0 C -70 -180, -40 -280, 0 -300 C 40 -280, 70 -180, 80 0 Z" fill="#0f766e" stroke="#14b8a6" stroke-width="4" />
        
        <!-- Cyber Scarf / Accents -->
        <path d="M -60 -260 Q 0 -220 60 -260 L 80 -140 Q 0 -100 -80 -140 Z" fill="#f43f5e" opacity="0.9" />

        <!-- Head with Kinetic Gesture -->
        <g transform="translate(0, ${Math.cos(timeSec * 3.5) * 5 - 320}) rotate(${isComicSpeaking ? Math.sin(timeSec * 6) * 5 : 0})">
          <circle cx="0" cy="0" r="60" fill="#115e59" stroke="#2dd4bf" stroke-width="4" />
          
          <!-- Visor Eyes -->
          <rect x="-42" y="-20" width="84" height="26" rx="13" fill="#fb7185" filter="url(#glow)" />
          <circle cx="-16" cy="-7" r="5" fill="#ffffff" />
          <circle cx="16" cy="-7" r="5" fill="#ffffff" />

          <!-- Dynamic Mouth (Lip-Sync) -->
          ${this.renderMouthShape(0, 26, isComicSpeaking ? activePhoneme : 'rest', '#f43f5e')}
        </g>
      </g>
    </g>`;
  }

  /**
   * Render Morphing Mouth Shapes for Accurate Phonemes
   */
  renderMouthShape(x, y, phoneme, color = '#f59e0b') {
    switch (phoneme) {
      case 'A': // Wide Open
        return `<ellipse cx="${x}" cy="${y}" rx="20" ry="14" fill="#0f172a" stroke="${color}" stroke-width="3" />
                <path d="M ${x - 10} ${y + 6} Q ${x} ${y - 2} ${x + 10} ${y + 6}" fill="#f43f5e" />`;
      case 'E': // Wide Grin / Teeth
        return `<rect x="${x - 22}" y="${y - 6}" width="44" height="12" rx="6" fill="#ffffff" stroke="${color}" stroke-width="3" />
                <line x1="${x - 16}" y1="${y}" x2="${x + 16}" y2="${y}" stroke="#0f172a" stroke-width="2" />`;
      case 'O': // Round O
        return `<circle cx="${x}" cy="${y}" r="12" fill="#0f172a" stroke="${color}" stroke-width="3" />`;
      case 'U': // Small Tight O
        return `<circle cx="${x}" cy="${y}" r="8" fill="#0f172a" stroke="${color}" stroke-width="3" />`;
      case 'rest':
      default: // Neutral Rest
        return `<line x1="${x - 16}" y1="${y}" x2="${x + 16}" y2="${y}" stroke="${color}" stroke-width="4" stroke-linecap="round" />`;
    }
  }

  /**
   * Render Speedlines, Fluid Sparks, and Atmospheric Glow
   */
  renderVFX(layers, progress, timeSec) {
    return `
    <g id="vfx_layer">
      <!-- Speedline accents during comedy punch -->
      ${Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 45) + (timeSec * 15);
        const rad = (angle * Math.PI) / 180;
        const x1 = (this.width / 2) + Math.cos(rad) * 450;
        const y1 = (this.height * 0.45) + Math.sin(rad) * 450;
        const x2 = (this.width / 2) + Math.cos(rad) * 580;
        const y2 = (this.height * 0.45) + Math.sin(rad) * 580;
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#f59e0b" stroke-width="2" opacity="0.3" stroke-dasharray="8 8" />`;
      }).join('\n')}
    </g>`;
  }

  /**
   * Render Subtitle Banner with Last-Word Highlight & Timing Cue Indicators
   */
  renderSubtitles(dialogue, timeSec) {
    if (!dialogue || !dialogue.clean_text) return '';

    const text = dialogue.clean_text;
    const speaker = dialogue.speaker?.toUpperCase() || 'DRAGON CAST';
    const lastWord = dialogue.last_word_punchline || '';
    const hasPause = dialogue.explicit_pause_sec > 0;

    return `
    <g id="subtitle_layer" transform="translate(${this.width / 2}, ${this.height - 130})">
      <!-- Backdrop Pill -->
      <rect x="-480" y="-45" width="960" height="90" rx="20" fill="#090d16" fill-opacity="0.88" stroke="#334155" stroke-width="2" />
      
      <!-- Speaker Tag -->
      <text x="-450" y="-16" fill="#38bdf8" font-size="14" font-weight="700" letter-spacing="2">${speaker}</text>
      ${hasPause ? `<text x="440" y="-16" text-anchor="end" fill="#f59e0b" font-size="13" font-weight="600">[PAUSE: ${dialogue.explicit_pause_sec}s SYNC]</text>` : ''}

      <!-- Main Dialogue Text -->
      <text x="0" y="24" text-anchor="middle" fill="#f8fafc" font-size="26" font-weight="600">
        ${text}
      </text>
    </g>`;
  }

  /**
   * Dragon 9 54-Minute Temporal Clock & Cadence HUD
   */
  renderDragon9HUD(scene, timeSec) {
    const dHour = 0;
    const dMin = Math.floor(timeSec / 60);
    const dSec = Math.floor(timeSec % 60);
    const ms = Math.floor((timeSec % 1) * 100);
    const timeStr = `D9 00:${String(dMin).padStart(2, '0')}:${String(dSec).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;

    return `
    <g id="hud_layer">
      <!-- Top-Right Dragon 9 Clock Widget -->
      <g transform="translate(${this.width - 290}, 30)">
        <rect width="250" height="52" rx="12" fill="#0f172a" fill-opacity="0.85" stroke="#f59e0b" stroke-width="1.5" />
        <circle cx="26" cy="26" r="10" fill="#f59e0b" filter="url(#glow)" />
        <text x="50" y="32" fill="#f8fafc" font-size="16" font-family="'JetBrains Mono', monospace" font-weight="700" letter-spacing="1">
          ${timeStr}
        </text>
      </g>
      
      <!-- Top-Left Scene & Act Marker -->
      <g transform="translate(40, 30)">
        <rect width="260" height="52" rx="12" fill="#0f172a" fill-opacity="0.85" stroke="#334155" stroke-width="1.5" />
        <text x="20" y="32" fill="#38bdf8" font-size="14" font-family="'JetBrains Mono', monospace" font-weight="600">
          ACT 1 / ${scene.title || 'SCENE'}
        </text>
      </g>
    </g>`;
  }
}

// Support ES Module export
export { Dragon9CartoonGenerator };
export default Dragon9CartoonGenerator;
