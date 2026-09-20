import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

// Pipeline Module Imports
// @ts-ignore
import { Dragon9ManifestParser } from './scripts/manifest-parser.js';
// @ts-ignore
import { Dragon9FFmpegRenderer } from './scripts/ffmpeg-renderer.js';

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // ===========================================================================
  // API Routes
  // ===========================================================================
  
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', engine: 'Dragon 9 Temporal Orchestrator', timestamp: new Date().toISOString() });
  });

  // 1. Get all unabridged scripts for code export and Termux deployment
  app.get('/api/scripts', (req, res) => {
    try {
      const scriptsDir = path.join(process.cwd(), 'scripts');
      const files = [
        {
          id: 'orchestrator',
          title: 'Pipeline Master Orchestrator',
          filename: 'orchestrator.js',
          language: 'javascript',
          category: 'orchestrator',
          description: 'Master controller coordinating story manifests, audio-visual asset pipelines, Dragon 9 54-minute timecode, and FFmpeg render dispatch.',
          termuxCommand: 'node orchestrator.js --manifest=dragon9-manifest-sample.json'
        },
        {
          id: 'cartoon_generator',
          title: 'Cartoon Generator & Layer Compositor',
          filename: 'cartoon-generator.js',
          language: 'javascript',
          category: 'generator',
          description: 'Procedural 2D cartoon scene renderer, phoneme lip-sync animator, parallax camera director, and SVG/Canvas frame generator.',
          termuxCommand: 'node -e "const { Dragon9CartoonGenerator } = require(\'./cartoon-generator.js\'); console.log(\'Generator ready\');"'
        },
        {
          id: 'ffmpeg_renderer',
          title: 'FFmpeg Render Engine & Filtergraph Handler',
          filename: 'ffmpeg-renderer.js',
          language: 'javascript',
          category: 'renderer',
          description: 'Constructs complex multi-track audio-visual filtergraphs, burns ASS/SRT subtitles with timing pauses, and manages video concatenation.',
          termuxCommand: 'node -e "const { Dragon9FFmpegRenderer } = require(\'./ffmpeg-renderer.js\'); console.log(\'Renderer ready\');"'
        },
        {
          id: 'manifest_parser',
          title: 'Manifest Parser & Temporal Synchronizer',
          filename: 'manifest-parser.js',
          language: 'javascript',
          category: 'parser',
          description: 'Validates episode schemas, computes micro-timing pauses ([pause: X.Xs]), syllable budgets, and Dragon 9 clock metrology.',
          termuxCommand: 'node -e "const { Dragon9ManifestParser } = require(\'./manifest-parser.js\'); console.log(\'Parser ready\');"'
        },
        {
          id: 'python_bridge',
          title: 'Termux Python Render Bridge',
          filename: 'python-bridge.py',
          language: 'python',
          category: 'bridge',
          description: 'Zero-dependency pure Python 3 rendering bridge tailored for Android Termux with built-in WAV audio synthesis and FFmpeg hooks.',
          termuxCommand: 'python3 python-bridge.py --manifest dragon9-manifest-sample.json --render'
        },
        {
          id: 'termux_setup',
          title: 'Termux Mobile Environment Setup Script',
          filename: 'termux-setup.sh',
          language: 'bash',
          category: 'termux',
          description: 'One-click shell setup script to install Node.js, Python, FFmpeg, SoX, and configure project aliases in Termux.',
          termuxCommand: 'bash termux-setup.sh'
        },
        {
          id: 'sample_manifest',
          title: 'Dragon 9 Sample Manifest',
          filename: 'dragon9-manifest-sample.json',
          language: 'json',
          category: 'manifest',
          description: 'Standard 3-scene reference manifest demonstrating 54-minute hour temporal acts, dialogue timing markers, and localized comedy beats.',
          termuxCommand: 'cat dragon9-manifest-sample.json | jq .'
        }
      ];

      const enriched = files.map(item => {
        const filePath = path.join(scriptsDir, item.filename);
        let content = '';
        if (fs.existsSync(filePath)) {
          content = fs.readFileSync(filePath, 'utf-8');
        }
        return { ...item, content };
      });

      res.json({ success: true, scripts: enriched });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Parse & Validate Manifest
  app.post('/api/pipeline/parse-manifest', (req, res) => {
    try {
      const { manifest, targetLanguage = 'en' } = req.body;
      if (!manifest) {
        return res.status(400).json({ success: false, error: 'Manifest payload is required.' });
      }

      const parser = new Dragon9ManifestParser({ targetLanguage });
      const timeline = parser.parse(manifest);

      const renderer = new Dragon9FFmpegRenderer({ fps: timeline.fps });
      const termuxScript = renderer.generateTermuxRenderScript(timeline);

      res.json({ success: true, timeline, termuxScript });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 3. Generate Localized Stand-up Comedy / Dragon 9 Episode with Gemini
  app.post('/api/pipeline/generate-episode', async (req, res) => {
    try {
      const { prompt = 'A comedic dialogue about the 54-minute hour', targetLanguage = 'en' } = req.body;
      const ai = getGeminiClient();

      if (ai) {
        const systemPrompt = `You are the Dragon 9 Asset Architect and automated stand-up comedy localization engine.
Create a complete 3-scene Dragon 9 cartoon episode manifest in JSON format based on the user's prompt.
Strict rules:
1. Temporal Architecture: Incorporate the Dragon 9 54-minute hour, micro-act beats, and fluid temporal rhythm.
2. Comedic Timing & Syllable Budget: Include embedded timing tags like [pause: 0.5s] before punchlines to guide audio synthesis.
3. Last-Word Punchline Rule: Ensure operative punchline words land at the absolute end of lines.
4. Multilingual Localized Translations: Provide 'localized_translations' for 'de', 'es', 'fr', 'ja' for every dialogue segment.
5. Return ONLY a valid JSON object matching the Dragon 9 Manifest schema.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Create a Dragon 9 cartoon episode manifest about: ${prompt}. Primary language: ${targetLanguage}`,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '{}';
        const parsedManifest = JSON.parse(rawText);
        return res.json({ success: true, manifest: parsedManifest });
      }

      // Procedural Fallback if API key is not yet set
      const samplePath = path.join(process.cwd(), 'scripts', 'dragon9-manifest-sample.json');
      const sampleData = JSON.parse(fs.readFileSync(samplePath, 'utf-8'));
      sampleData.title = `Dragon 9: ${prompt.slice(0, 40)}`;
      return res.json({ success: true, manifest: sampleData, notice: 'Procedural template used.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Generate FFmpeg command & Filtergraph for a scene
  app.post('/api/pipeline/generate-ffmpeg', (req, res) => {
    try {
      const { scene, fps = 24, resolution = '1920x1080' } = req.body;
      const renderer = new Dragon9FFmpegRenderer({ fps, resolution });
      const cmd = renderer.buildSceneRenderCommand(
        scene,
        `./assets/backgrounds/${scene.scene_id}.png`,
        `./assets/audio/${scene.scene_id}.wav`,
        `./output/${scene.scene_id}.mp4`
      );

      res.json({ success: true, command: cmd });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // ===========================================================================
  // Vite Integration (Dev vs Prod)
  // ===========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🐉 Dragon 9 Pipeline Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
