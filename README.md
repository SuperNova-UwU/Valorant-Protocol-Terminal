# VALORANT PROTOCOL // TACTICAL WEB EXPERIENCE

A high-fidelity, interactive Valorant-themed web application built with authentic tactical military brutalist aesthetics, official Riot vector glyphs, a dynamic **Valorant Champions Theme Morphing & Anthem Engine (2021–2026)**, an interactive **2D Tactical Radar & Lineup Lab**, **Competitive Economy Simulator**, complete **29-Agent Dossier Viewer**, and interactive **Spike Plant/Defuse Terminal**.

---

## ⚡ Key Highlights & Systems Architecture

### 1. 🏆 Valorant Champions Theme & Anthem Engine (2021 - 2026)
- **Year-by-Year Championship Archive**:
  - **2021 Berlin**: Acend (3-2 Gambit) | Anthem: *"Die For You"* by Grabbitz | Theme: Radiant Gold & Obsidian Black.
  - **2022 Istanbul**: LOUD (3-1 OpTic) | Anthem: *"Fire Again"* ft. Ashnikko | Theme: Fiery Crimson & Sunset Amber.
  - **2023 Los Angeles**: Evil Geniuses (3-1 Paper Rex) | Anthem: *"Ticking Away"* ft. Grabbitz & bbno$ | Theme: Neon Cyber Magenta & Sunset Gold.
  - **2024 Seoul**: EDward Gaming (3-2 Heretics) | Anthem: *"SUPERPOWER"* ft. KISS OF LIFE & Mark Tuan | Theme: Iridescent Jade Cyan & Dragon Yellow.
  - **2025 Paris**: Global Tour & World Finals | Anthem: *"Last Shot"* ft. templuv & 347aidan | Theme: Crown Gold & Royal Sapphire.
  - **2026 Tokyo**: Pacific Champions Apex | Anthem: *"ECLIPSE THE SUN"* ft. Reiko & Hiroyuki Sawano | Theme: Ultraviolet Void & Neon Amber.
  - **Protocol Default**: Quick reset back to default Valorant Red (`#FF4655`) and Deep Void Dark.
- **Dynamic Full-Site HUD & Theme Morphing**:
  - Selecting any year **instantly morphs the entire website's CSS color variables, active highlights, borders, radiant glow, navbar status, and interactive Radianite particle canvas** to that championship's signature aura.
- **Local Self-Hosted High-Fidelity Audio Engine**:
  - All 6 full-length championship anthems are hosted locally as optimized `.m4a` assets in `assets/audio/`.
  - **Zero third-party embed dependencies, zero ads, and zero CORS errors**.
  - Cyber visualizer with animated pulsing frequency bars, scrubbable timeline tracker, volume slider, and dual-mode toggle (`STUDIO AUDIO` vs `YOUTUBE VIDEO`).
- **Persistent Floating Audio HUD**:
  - Pinned player widget at bottom-right showing active track title, artist, live equalizer bars, play/pause controls, and quick year chips across all pages.

### 2. 🗺️ Section 03: Tactical Mini-Map & Lineup Lab
- **Multi-Map Interactive Radar**:
  - Supports competitive maps: **Ascent**, **Split**, **Bind**, **Haven**, **Sunset**, and **Abyss**.
  - Real-time coordinate HUD tracking cursor position on a 1000x1000 tactical grid.
  - **Site Filters**: Filter instantaneously between `ALL SITES`, `A SITE`, `B SITE`, `MID`, and `C SITE`.
  - **Side Filters**: Toggle between `ATTACK` and `DEFENSE` execution lineups.
  - **Camera Focus Presets**: One-click smooth zoom to Full Map, Site A, Site B, or Mid.
  - **Mobile Touch Controls**: Touch drag panning with on-screen `+`, `−`, and `⟲` zoom buttons for smartphones and tablets.
- **Ballistic Trajectory Simulator**:
  - Lineups for **Sova** (Recon & Double Shock Darts), **Viper** (Toxic Screens & One-Ways), **Brimstone** (Post-Plant Mollys & Smokes), **Killjoy** (Lockdowns & Nanoswarms), and **Fade** (Haunt Eyes).
  - Animated quadratic bezier projectile arcs with glowing particle impact VFX (pulsing sonar rings, toxic gas walls, smoke domes, molten fire pools).
- **Interactive Strat Board Mode**:
  - Sandbox site planner: click anywhere on the radar to deploy Attackers, Defenders, Smokes, Mollys, and Spikes.
  - Pre-programmed pro execution presets (*Ascent Fast A Split*, *Mid-to-B Retake Pinch*, *Split B-Heaven Pinch*).

### 3. 💰 Section 04: Tactical Economy Simulator
- **Authentic Competitive Buy Phase Engine**:
  - Complete weapons catalog organized by tier: Sidearms, SMGs, Shotguns, Rifles (including the 2026 **Warden Rifle**, Vandal, Phantom), Sniper Rifles, Machine Guns, and Shields.
  - Standard Valorant round credit caps: 9,000 Creds max.
  - Round phases 1 through 13 (Standard competitive half).
  - Round outcomes: Round Win (+3,000), Spike Plant Bonus (+300), Loss Streak bonuses (1st Loss: 1,900, 2nd Loss: 2,400, 3rd+ Loss: 2,900 max).
  - Live Buy Advice Engine: Recommends `FULL BUY`, `FORCE BUY`, `ECO / SAVE`, or `BONUS ROUND` based on team loadout.

### 4. 👥 Section 02: Agents Classified Directory
- **All 29 Playable Operatives**: Complete roster categorized by tactical role (`DUELIST`, `INITIATOR`, `SENTINEL`, `CONTROLLER`).
- **Instant Search Bar**: Filter by operative name, role, or ability keyword.
- **Mobile Operative Dropdown**: Quick selector dropdown on mobile/tablet devices to immediately inspect any agent without excessive scrolling.
- **Classified Dossier Modal**:
  - High-resolution agent portraits and radiant backdrop art.
  - Keybind ability matrix (`[C]`, `[Q]`, `[E] SIGNATURE`, `[X] ULTIMATE`, `[PASSIVE]`).
  - Combat rating meters (Mobility, Utility, Lethality, Recon).

### 5. 🎯 Section 01: Tactical Hero Terminal & Spike Simulator
- **Interactive Spike Terminal Simulator**:
  - 4.0-second interactive plant sequence with tactical progress track.
  - 45-second round countdown with accelerating procedural audio beeps.
  - Defuse sequence and detonation VFX.
- **Live Server Region Selector**: Multi-server latency indicator (Tokyo, Frankfurt, Virginia, Mumbai, Seoul, Singapore, London, São Paulo).
- **Radianite Particle Canvas**: Interactive geometry reacting to cursor movement and color-morphing with Champions themes.

### 6. 📜 Section 06: Dev Diaries & Section 07: Encrypted Transmission
- **Live Patch Intelligence (v9.08)** with roadmap progress milestones.
- **Encrypted Transmission Terminal**: Callsign generator, security clearance selector, 256-bit cipher handshake logger, and verified dispatch ticket receipt generator.

---

## 🛠️ Technology Stack

- **Core**: Vanilla ECMAScript 2026 (ES6+ Classes), HTML5 Semantic Elements, CSS Custom Properties (Variables).
- **Audio**: HTML5 Audio API (Local .m4a studio streams) + Web Audio API Synthesizer (UI Blips, Spike beeps).
- **Graphics & Motion**: HTML5 Canvas 2D (Particle Engine), SVG Vector Graphics, Lenis Smooth Scroll Engine.
- **Responsive Architecture**: Mobile-first fluid CSS grid and flexbox with tactical clip-paths and breakpoints for mobile, tablet, and ultra-wide displays.

---

## 🌐 Deployment & Hosting Guide

This project is built with standard relative asset paths and zero build steps, making it **100% plug-and-play** on any static web host.

### Option 1: GitHub Pages (Recommended for Portfolio)
1. Push this repository to GitHub.
2. In your repository, go to **Settings** > **Pages**.
3. Under **Branch**, select `main` (or `master`) and folder `/ (root)`.
4. Click **Save**. Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

### Option 2: Vercel / Netlify
1. Connect your GitHub repository to Vercel or Netlify.
2. Leave the build command empty (`Output directory: .`).
3. Deploy! Instant global CDN hosting with HTTPS and custom domain support.

### Option 3: Local Development
Double-click `index.html` or run the included PowerShell streaming server:
```powershell
powershell -File server.ps1
```
Open `http://localhost:5500` in your browser.
