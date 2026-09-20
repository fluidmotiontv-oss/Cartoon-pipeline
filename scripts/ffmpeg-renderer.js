/**
 * Dragon 9 FFmpeg Render Engine & Filtergraph Handler
 * -----------------------------------------------------------------------------
 * Compiles complex multi-track audio-visual filtergraphs, generates Termux-ready
 * shell scripts, executes native FFmpeg processes, and orchestrates cartoon
 * video stitching with timing pauses, subtitle overlays, and audio normalization.
 * 
 * Optimized for Termux (Android ARM64), Linux servers, and macOS/Windows environments.
 * -----------------------------------------------------------------------------
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

class Dragon9FFmpegRenderer {
  constructor(options = {}) {
    this.options = {
      ffmpegPath: options.ffmpegPath || 'ffmpeg',
      ffprobePath: options.ffprobePath || 'ffprobe',
      outputDir: options.outputDir || './output',
      tempDir: options.tempDir || './temp',
      resolution: options.resolution || '1920x1080',
      fps: options.fps || 24,
      crf: options.crf ?? 22,
      preset: options.preset || 'ultrafast', // ultrafast for mobile Termux speed
      audioBitrate: options.audioBitrate || '192k',
      audioSampleRate: options.audioSampleRate || 44100,
      enableLoudnorm: options.enableLoudnorm !== false,
      ...options
    };
  }

  /**
   * Generates a complete FFmpeg command line string for a single scene
   * @param {object} scene - Parsed scene from Dragon9ManifestParser
   * @param {string} bgImagePath - Path to background image or frame sequence
   * @param {string} audioPath - Path to synthesized voice audio track
   * @param {string} outputPath - Target MP4 file path
   * @returns {string} Raw FFmpeg execution command
   */
  buildSceneRenderCommand(scene, bgImagePath, audioPath, outputPath) {
    const duration = scene.computed_duration_sec.toFixed(3);
    const fps = this.options.fps;
    const [width, height] = this.options.resolution.split('x');

    // Build drawtext filters for dialogue subtitles
    const drawtextFilters = scene.dialogue.map((dlg, idx) => {
      const startTime = (dlg.explicit_pause_sec || 0).toFixed(2);
      const endTime = (dlg.explicit_pause_sec + dlg.estimated_speech_sec).toFixed(2);
      const escapedText = this.escapeFFmpegText(dlg.clean_text);
      const speaker = this.escapeFFmpegText(dlg.speaker.toUpperCase());

      return `drawtext=text='${speaker}\\: ${escapedText}':fontcolor=white:fontsize=36:box=1:boxcolor=black@0.75:boxborderw=16:x=(w-text_w)/2:y=h-120:enable='between(t,${startTime},${endTime})'`;
    });

    // Camera motion filter (pan / zoom)
    let videoFilter = `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},fps=${fps}`;
    if (scene.camera?.type === 'zoom_in') {
      videoFilter += `,zoompan=z='min(zoom+0.0015,1.2)':d=1:s=${width}x${height}`;
    }

    if (drawtextFilters.length > 0) {
      videoFilter += `,${drawtextFilters.join(',')}`;
    }

    // Audio filter with loudnorm and pause padding
    let audioFilter = `aformat=sample_rates=${this.options.audioSampleRate}:channel_layouts=stereo`;
    if (this.options.enableLoudnorm) {
      audioFilter += `,loudnorm=I=-16:TP=-1.5:LRA=11`;
    }

    const cmd = [
      this.options.ffmpegPath,
      '-y',
      '-loop 1',
      `-i "${bgImagePath}"`,
      `-i "${audioPath}"`,
      `-filter_complex "[0:v]${videoFilter}[v];[1:a]${audioFilter}[a]"`,
      `-map "[v]"`,
      `-map "[a]"`,
      `-t ${duration}`,
      `-c:v libx264`,
      `-preset ${this.options.preset}`,
      `-crf ${this.options.crf}`,
      `-pix_fmt yuv420p`,
      `-c:a aac`,
      `-b:a ${this.options.audioBitrate}`,
      `-movflags +faststart`,
      `"${outputPath}"`
    ].join(' ');

    return cmd;
  }

  /**
   * Generates a Termux-optimized Bash script to render an entire Dragon 9 episode
   * @param {object} timelinePackage - Output from Dragon9ManifestParser
   * @returns {string} Fully executable bash script
   */
  generateTermuxRenderScript(timelinePackage) {
    const lines = [
      '#!/data/data/com.termux/files/usr/bin/bash',
      '# =============================================================================',
      '# Dragon 9 Fluid Motion Video Render Pipeline (Termux Mobile Engine)',
      `# Episode: ${timelinePackage.title} (${timelinePackage.manifest_id})`,
      `# Total Duration: ${timelinePackage.temporal_system.total_duration_sec}s | Dragon Time: ${timelinePackage.temporal_system.dragon_timecode.formatted}`,
      '# =============================================================================',
      '',
      'set -e',
      '',
      'echo "🐉 [Dragon 9] Starting Mobile Termux Video Rendering Pipeline..."',
      'mkdir -p ./output/scenes ./output/audio ./output/temp',
      ''
    ];

    // Generate per-scene renders
    const sceneFiles = [];
    timelinePackage.scenes.forEach((scene, index) => {
      const sceneOut = `./output/scenes/scene_${String(index + 1).padStart(3, '0')}.mp4`;
      const bgImg = `./output/temp/bg_${scene.scene_id}.png`;
      const voiceAudio = `./output/audio/voice_${scene.scene_id}.wav`;
      sceneFiles.push(sceneOut);

      lines.push(`echo "🎬 [Dragon 9] Rendering Scene ${index + 1}/${timelinePackage.scenes.length}: ${scene.title}..."`);
      
      // Fallback synthetic tone/audio generator if voice file is missing
      lines.push(`if [ ! -f "${voiceAudio}" ]; then`);
      lines.push(`  ffmpeg -y -f lavfi -i "sine=frequency=440:duration=${scene.computed_duration_sec.toFixed(2)}" -c:a aac -b:a 128k "${voiceAudio}" 2>/dev/null`);
      lines.push('fi');

      // Synthetic background generator if image missing
      lines.push(`if [ ! -f "${bgImg}" ]; then`);
      lines.push(`  ffmpeg -y -f lavfi -i "color=c=0x090d16:s=1920x1080:d=1" -vframes 1 "${bgImg}" 2>/dev/null`);
      lines.push('fi');

      const cmd = this.buildSceneRenderCommand(scene, bgImg, voiceAudio, sceneOut);
      lines.push(cmd);
      lines.push('');
    });

    // Generate concat manifest
    lines.push('echo "🔗 [Dragon 9] Concatenating Scenes into Master Episode..."');
    lines.push('cat << ' + "'EOF' > ./output/temp/concat_list.txt");
    sceneFiles.forEach(file => {
      lines.push(`file '${path.resolve(file)}'`);
    });
    lines.push('EOF');
    lines.push('');

    const finalOutput = `./output/${timelinePackage.manifest_id}_final_master.mp4`;
    lines.push(`ffmpeg -y -f concat -safe 0 -i ./output/temp/concat_list.txt -c copy -movflags +faststart "${finalOutput}"`);
    lines.push('');
    lines.push('echo "✨ [Dragon 9] Rendering Complete! Output generated at:"');
    lines.push(`echo "👉 ${finalOutput}"`);

    return lines.join('\n');
  }

  /**
   * Escape text for FFmpeg drawtext filter syntax
   */
  escapeFFmpegText(text) {
    if (!text) return '';
    return text
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "'\\\\\\''")
      .replace(/:/g, '\\:')
      .replace(/%/g, '\\%');
  }

  /**
   * Execute an FFmpeg command natively via child_process
   * @param {string} command 
   * @param {function} onProgress 
   * @returns {Promise<boolean>}
   */
  execute(command, onProgress = null) {
    return new Promise((resolve, reject) => {
      const parts = command.split(' ');
      const prog = parts[0];
      const args = parts.slice(1);

      const proc = spawn(prog, args, { shell: true });

      proc.stderr.on('data', (data) => {
        const text = data.toString();
        if (onProgress) onProgress(text);
      });

      proc.on('close', (code) => {
        if (code === 0) resolve(true);
        else reject(new Error(`FFmpeg process exited with code ${code}`));
      });

      proc.on('error', (err) => {
        reject(err);
      });
    });
  }
}

export { Dragon9FFmpegRenderer };
export default Dragon9FFmpegRenderer;
