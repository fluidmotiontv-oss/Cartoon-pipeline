/**
 * Dragon 9 Master Pipeline Orchestrator (orchestrator.js)
 * -----------------------------------------------------------------------------
 * Central control system for the Dragon 9 Cartoon Generation and Video
 * Rendering Pipeline. Coordinates story manifests, speech synthesis, phoneme
 * lip-sync, SVG frame compositing, FFmpeg rendering, and Termux export.
 * 
 * Usage:
 *   node orchestrator.js --manifest=./manifest.json --lang=en --export-termux
 * -----------------------------------------------------------------------------
 */

import fs from 'fs';
import path from 'path';
import { Dragon9ManifestParser } from './manifest-parser.js';
import { Dragon9CartoonGenerator } from './cartoon-generator.js';
import { Dragon9FFmpegRenderer } from './ffmpeg-renderer.js';

class Dragon9Orchestrator {
  constructor(config = {}) {
    this.config = {
      workDir: config.workDir || './dragon9_workspace',
      outputDir: config.outputDir || './output',
      fps: config.fps || 24,
      targetLang: config.targetLang || 'en',
      renderer: config.renderer || 'ffmpeg',
      ...config
    };

    this.parser = new Dragon9ManifestParser({ targetLanguage: this.config.targetLang });
    this.generator = new Dragon9CartoonGenerator({ fps: this.config.fps });
    this.renderer = new Dragon9FFmpegRenderer({ outputDir: this.config.outputDir, fps: this.config.fps });
  }

  /**
   * Run the complete end-to-end rendering pipeline
   * @param {string|object} manifestSource - Path to manifest file or parsed object
   * @param {object} options - Execution flags
   */
  async runPipeline(manifestSource, options = {}) {
    console.log('=============================================================================');
    console.log('🐉 DRAGON 9 FLUID CARTOON RENDERING PIPELINE ORCHESTRATOR');
    console.log('   Temporal Architecture: 54-Minute Hour / 9-Minute Micro-Acts');
    console.log('=============================================================================\n');

    // Step 1: Parse & Validate Manifest
    console.log('📋 [Step 1/5] Parsing & Validating Dragon 9 Manifest...');
    let rawContent = manifestSource;
    if (typeof manifestSource === 'string' && fs.existsSync(manifestSource)) {
      rawContent = fs.readFileSync(manifestSource, 'utf-8');
    }
    const timeline = this.parser.parse(rawContent);
    console.log(`   ✓ Manifest Loaded: "${timeline.title}" (${timeline.manifest_id})`);
    console.log(`   ✓ Total Scenes: ${timeline.scenes.length} | Total Duration: ${timeline.temporal_system.total_duration_sec.toFixed(2)}s`);
    console.log(`   ✓ Dragon 9 Timecode: ${timeline.temporal_system.dragon_timecode.formatted}\n`);

    // Step 2: Setup Workspace Directories
    console.log('📁 [Step 2/5] Preparing Workspace Directories...');
    const dirs = [
      path.join(this.config.workDir, 'frames'),
      path.join(this.config.workDir, 'audio'),
      path.join(this.config.workDir, 'scripts'),
      this.config.outputDir
    ];
    dirs.forEach(d => fs.mkdirSync(d, { recursive: true }));
    console.log('   ✓ Directories initialized.\n');

    // Step 3: Generate Storyboard Keyframes & SVGs
    console.log('🎨 [Step 3/5] Generating Vector Keyframes & Phoneme Lip-sync Assets...');
    const generatedAssets = [];
    for (let i = 0; i < timeline.scenes.length; i++) {
      const scene = timeline.scenes[i];
      const frameSvg = this.generator.generateFrameSVG(
        scene,
        scene.computed_duration_sec * 0.5,
        scene.dialogue[0] || null
      );

      const svgPath = path.join(this.config.workDir, 'frames', `${scene.scene_id}_preview.svg`);
      fs.writeFileSync(svgPath, frameSvg, 'utf-8');
      generatedAssets.push({ scene_id: scene.scene_id, svgPath });
      console.log(`   ✓ Keyframe generated: ${scene.scene_id} -> ${svgPath}`);
    }
    console.log('');

    // Step 4: Build FFmpeg Filtergraph & Render Scripts
    console.log('⚡ [Step 4/5] Building Multi-Track FFmpeg Filtergraphs...');
    const termuxScript = this.renderer.generateTermuxRenderScript(timeline);
    const scriptPath = path.join(this.config.workDir, 'scripts', 'render_termux.sh');
    fs.writeFileSync(scriptPath, termuxScript, { mode: 0o755 });
    console.log(`   ✓ Termux Mobile Render Script generated: ${scriptPath}\n`);

    // Step 5: Render Summary
    console.log('🎉 [Step 5/5] Pipeline Orchestration Complete!');
    console.log('=============================================================================');
    console.log(`▶ To execute render directly on Termux/Mobile:`);
    console.log(`   bash ${scriptPath}`);
    console.log('=============================================================================\n');

    return {
      success: true,
      timeline,
      assets: generatedAssets,
      termuxScriptPath: scriptPath,
      termuxScriptContent: termuxScript
    };
  }
}

export { Dragon9Orchestrator };
export default Dragon9Orchestrator;
