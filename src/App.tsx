import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CodeExportVault } from './components/CodeExportVault';
import { CartoonStagePreview } from './components/CartoonStagePreview';
import { ManifestStudio } from './components/ManifestStudio';
import { FFmpegLab } from './components/FFmpegLab';
import { PipelineRunner } from './components/PipelineRunner';
import { SAMPLE_DRAGON_MANIFEST } from './data/sampleManifest';
import { DragonManifest, CodeScriptItem } from './types/pipeline';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('export');
  const [manifest, setManifest] = useState<DragonManifest>(SAMPLE_DRAGON_MANIFEST);
  const [scripts, setScripts] = useState<CodeScriptItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch unabridged scripts from backend API on mount
  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const res = await fetch('/api/scripts');
        const data = await res.json();
        if (data.success && data.scripts) {
          setScripts(data.scripts);
        }
      } catch (err) {
        console.warn('Backend API scripts fetch, using fallback scripts catalogue:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScripts();
  }, []);

  // Export all scripts as a JSON/text bundle
  const handleExportBundle = () => {
    const bundlePayload = {
      bundle_version: "1.0.0",
      architecture: "Dragon 9 Synchronized Time Fluid Pipeline",
      generated_at: new Date().toISOString(),
      manifest,
      scripts
    };

    const blob = new Blob([JSON.stringify(bundlePayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dragon9_pipeline_bundle_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalDuration = (manifest.scenes || []).reduce(
    (acc, s) => acc + (s.computed_duration_sec || s.duration_sec || 5.0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportBundle={handleExportBundle}
        totalDuration={totalDuration}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'export' && (
          <CodeExportVault
            scripts={scripts}
            onExportBundle={handleExportBundle}
          />
        )}

        {activeTab === 'stage' && (
          <CartoonStagePreview
            manifest={manifest}
          />
        )}

        {activeTab === 'manifest' && (
          <ManifestStudio
            manifest={manifest}
            setManifest={setManifest}
            onRunManifest={() => setActiveTab('runner')}
          />
        )}

        {activeTab === 'ffmpeg' && (
          <FFmpegLab
            manifest={manifest}
          />
        )}

        {activeTab === 'runner' && (
          <PipelineRunner
            manifest={manifest}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-4 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>DRAGON 9 FLUID MOTION ECOSYSTEM • 54-MINUTE HOUR TEMPORAL ARCHITECTURE</span>
          <span>TERMUX READY • NO EXTERNAL NATIVE DEPS REQUIRED</span>
        </div>
      </footer>

    </div>
  );
}
