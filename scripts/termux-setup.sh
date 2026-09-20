#!/data/data/com.termux/files/usr/bin/bash
# =============================================================================
# Dragon 9 Fluid Motion Ecosystem — Termux Mobile Environment Setup
# =============================================================================
# Automated installer for Dragon 9 Cartoon Pipeline & Video Rendering Engine
# Installs Node.js, Python, FFmpeg, SoX, and sets up workspace aliases.
# =============================================================================

set -e

echo ""
echo "🐉 ============================================================================="
echo "🐉 DRAGON 9 FLUID MOTION ECOSYSTEM — TERMUX BOOTSTRAPPER"
echo "   Temporal Architecture: 54-Minute Hour / 9-Minute Micro-Acts"
echo "============================================================================="
echo ""

# 1. Update Package Repositories
echo "📦 [1/5] Updating Termux core package repositories..."
pkg update -y && pkg upgrade -y

# 2. Install Required Multimedia & Runtime Packages
echo "📦 [2/5] Installing Node.js, Python 3, FFmpeg, and Audio Tools..."
pkg install -y \
  nodejs-lts \
  python \
  ffmpeg \
  sox \
  git \
  termux-api \
  openssl

# 3. Create Project Directory Structure
echo "📁 [3/5] Setting up Dragon 9 project structure..."
mkdir -p ~/dragon9_pipeline/{scripts,manifests,output,assets/{audio,characters,backgrounds}}
cd ~/dragon9_pipeline

# 4. Create Quick Execution Shortcuts in ~/.bashrc
echo "⚡ [4/5] Registering convenient shell aliases..."
cat << 'EOF' >> ~/.bashrc

# Dragon 9 Fluid Motion Aliases
alias d9-render="node ~/dragon9_pipeline/scripts/orchestrator.js"
alias d9-py="python3 ~/dragon9_pipeline/scripts/python-bridge.py"
alias d9-status="echo '🐉 Dragon 9 Pipeline Active on Termux Environment'"
EOF

# 5. Summary & Verification
echo ""
echo "🎉 [5/5] Setup Complete! System Verification:"
echo "-----------------------------------------------------------------------------"
node -v || true
python3 --version || true
ffmpeg -version | head -n 1 || true
echo "-----------------------------------------------------------------------------"
echo ""
echo "✨ Ready! To render your first episode in Termux:"
echo "   1. cd ~/dragon9_pipeline"
echo "   2. node scripts/orchestrator.js --manifest=manifests/dragon9-manifest-sample.json"
echo ""
echo "🚀 Welcome to the fluid motion of the future ecosystem!"
