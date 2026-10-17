/**
 * VALORANT PROTOCOL // TACTICAL MINIMAP & LINEUP LAB CONTROLLER
 * Complete coverage for BOTH SITES (A-Site, B-Site, Mid, C-Site) and BOTH SIDES (Attack & Defense).
 * 
 * Features:
 * 1. Interactive Multi-Site Radar with Real-Time Ballistic Trajectories & Impact VFX.
 * 2. Simultaneous Multi-Site Lineup Pins (Click directly on A or B Site pins on radar).
 * 3. Dedicated Site Filters (ALL, A SITE, B SITE, MID, C SITE) & Side Filters (ALL, ATTACK, DEFENSE).
 * 4. Radar Camera Focus & Pan-Zoom Controls (Full Map, A-Site Focus, B-Site Focus, Mid Focus).
 * 5. Authentic First-Person Alignment HUD Card (Sova Charge Bars, Bounces, Crosshair Cues).
 * 6. Tactical Strat Board (Custom utility & agent placement + Pro presets).
 */

class TacticalMinimapLab {
  constructor() {
    this.data = window.VALORANT_LINEUP_DATA || { maps: [] };
    this.activeMapId = 'ascent';
    this.activeMode = 'lineups'; // 'lineups' | 'stratboard'
    this.activeLineupId = null;
    
    // Filters
    this.siteFilter = 'ALL';   // 'ALL' | 'A' | 'B' | 'MID' | 'C'
    this.sideFilter = 'ALL';   // 'ALL' | 'ATTACK' | 'DEFENSE'
    this.agentFilter = 'ALL';  // 'ALL' | 'SOVA' | 'VIPER' | 'BRIMSTONE' | 'KILLJOY' | 'FADE'
    
    // Radar Display State
    this.showCallouts = true;
    this.cameraFocus = 'FULL'; // 'FULL' | 'A' | 'B' | 'MID' | 'C'
    this.zoomScale = 1;
    this.panX = 0;
    this.panY = 0;

    // Stratboard elements
    this.customTokens = [];
    this.selectedTool = 'agent-atk';

    this.container = null;
    this.svgCanvas = null;

    this.init();
  }

  init() {
    this.container = document.getElementById('lineup-lab-content');
    if (!this.container) return;

    this.render();
  }

  getCurrentMap() {
    return this.data.maps.find(m => m.id === this.activeMapId) || this.data.maps[0];
  }

  // Get available sites on the current map
  getAvailableSites(map) {
    const sites = new Set();
    (map.lineups || []).forEach(l => {
      if (l.site) sites.add(l.site.toUpperCase());
    });
    // Order: A, B, C, MID
    const order = ['A', 'B', 'C', 'MID'];
    return order.filter(s => sites.has(s));
  }

  // Calculate filtered lineups based on all active criteria
  getFilteredLineups(map) {
    let list = map.lineups || [];

    if (this.siteFilter !== 'ALL') {
      list = list.filter(l => (l.site || '').toUpperCase() === this.siteFilter.toUpperCase());
    }

    if (this.sideFilter !== 'ALL') {
      list = list.filter(l => (l.side || '').toUpperCase() === this.sideFilter.toUpperCase());
    }

    if (this.agentFilter !== 'ALL') {
      list = list.filter(l => (l.agent || '').toUpperCase() === this.agentFilter.toUpperCase());
    }

    return list;
  }

  // Camera focus presets for each site (responsive for mobile & desktop)
  applyCameraFocus(site) {
    this.cameraFocus = site;
    const isMobile = window.innerWidth <= 768;

    if (site === 'FULL') {
      this.zoomScale = 1;
      this.panX = 0;
      this.panY = 0;
    } else if (site === 'A') {
      this.zoomScale = isMobile ? 1.35 : 1.7;
      this.panX = isMobile ? -50 : -220;
      this.panY = isMobile ? 15 : 50;
    } else if (site === 'B') {
      this.zoomScale = isMobile ? 1.35 : 1.7;
      this.panX = isMobile ? 50 : 220;
      this.panY = isMobile ? 15 : 50;
    } else if (site === 'MID') {
      this.zoomScale = isMobile ? 1.25 : 1.6;
      this.panX = 0;
      this.panY = isMobile ? -10 : -30;
    } else if (site === 'C') {
      this.zoomScale = isMobile ? 1.35 : 1.7;
      this.panX = isMobile ? 55 : 230;
      this.panY = isMobile ? 12 : 45;
    }

    this.updateRadarTransform();
  }

  updateRadarTransform() {
    const screenInner = document.getElementById('radar-inner-stage');
    if (screenInner) {
      screenInner.style.transform = `scale(${this.zoomScale}) translate(${this.panX}px, ${this.panY}px)`;
    }
  }

  render() {
    const map = this.getCurrentMap();
    if (!map) return;

    const availableSites = this.getAvailableSites(map);
    const filteredLineups = this.getFilteredLineups(map);

    // Default select first lineup if none active or current one filtered out
    if (filteredLineups.length > 0) {
      if (!this.activeLineupId || !filteredLineups.some(l => l.id === this.activeLineupId)) {
        this.activeLineupId = filteredLineups[0].id;
      }
    } else {
      this.activeLineupId = null;
    }

    const activeLineup = map.lineups.find(l => l.id === this.activeLineupId) || filteredLineups[0] || null;

    this.container.innerHTML = `
      <div class="lineup-lab-wrapper">

        <!-- Top Control Bar -->
        <div class="lab-header-controls">
          <!-- Map Selector Tabs -->
          <div class="lab-map-tabs">
            ${this.data.maps.map(m => `
              <button class="lab-map-btn ${m.id === this.activeMapId ? 'active' : ''}" data-map-id="${m.id}">
                <span class="btn-dot"></span>
                <span>${m.name}</span>
                <span class="map-lineup-pill">${(m.lineups || []).length}</span>
              </button>
            `).join('')}
          </div>

          <!-- Mode Switcher & Callout Toggle -->
          <div class="lab-action-switches">
            <div class="mode-pill-toggle">
              <button class="mode-btn ${this.activeMode === 'lineups' ? 'active' : ''}" data-mode="lineups">
                <span>LINEUP LAB</span>
              </button>
              <button class="mode-btn ${this.activeMode === 'stratboard' ? 'active' : ''}" data-mode="stratboard">
                <span>STRAT BOARD</span>
              </button>
            </div>

            <button class="callout-toggle-btn ${this.showCallouts ? 'active' : ''}" id="callout-toggle-btn">
              <span>CALLOUTS: ${this.showCallouts ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        <!-- Main Workspace Grid -->
        <div class="lab-workspace-grid">

          <!-- Left Column: Interactive Radar Canvas -->
          <div class="radar-viewport-container">
            <div class="radar-hud-header">
              <div class="radar-hud-title-group">
                <span class="radar-loc-tag">// ${map.name} // ${map.location}</span>
                <span class="radar-mode-badge">${this.activeMode === 'lineups' ? 'TACTICAL BALLISTICS SIM' : 'FREEFORM STRAT BOARD'}</span>
              </div>

              <!-- Camera Viewport Quick Switchers -->
              <div class="radar-camera-controls">
                <span class="cam-label">CAM FOCUS:</span>
                <button class="cam-btn ${this.cameraFocus === 'FULL' ? 'active' : ''}" data-focus="FULL">FULL MAP</button>
                ${availableSites.map(s => `
                  <button class="cam-btn ${this.cameraFocus === s ? 'active' : ''}" data-focus="${s}">
                    ${s}-SITE
                  </button>
                `).join('')}
              </div>

              <span class="radar-coords-readout" id="radar-mouse-coords">COORD: 000, 000</span>
            </div>

            <!-- The Radar Screen Box -->
            <div class="radar-screen" id="radar-interactive-screen">
              
              <!-- Subtle Radar Sweep Animation -->
              <div class="radar-sweep-beam"></div>

              <!-- Tactical Polar Grid Rings -->
              <div class="radar-tactical-grid">
                <div class="grid-ring ring-1"><span class="ring-tag">25m</span></div>
                <div class="grid-ring ring-2"><span class="ring-tag">50m</span></div>
                <div class="grid-ring ring-3"><span class="ring-tag">75m</span></div>
                <div class="grid-crosshair-h"></div>
                <div class="grid-crosshair-v"></div>
                <span class="compass-marker comp-n">N</span>
                <span class="compass-marker comp-s">S</span>
                <span class="compass-marker comp-e">E</span>
                <span class="compass-marker comp-w">W</span>
              </div>

              <!-- Radar Inner Stage (for smooth Pan & Zoom) -->
              <div class="radar-inner-stage" id="radar-inner-stage" style="transform: scale(${this.zoomScale}) translate(${this.panX}px, ${this.panY}px);">
                <!-- Radar Image Layer -->
                <img src="${map.radarImg}" alt="${map.name} Radar" class="radar-base-img" draggable="false" />

                <!-- Interactive Callout Pins Layer -->
                <div class="radar-callouts-layer ${this.showCallouts ? 'visible' : 'hidden'}">
                  ${map.callouts.map(c => `
                    <div class="callout-pin callout-type-${c.type} callout-site-${c.site || 'mid'}" style="left: ${c.x / 10}%; top: ${c.y / 10}%;">
                      <span class="pin-dot"></span>
                      <span class="pin-label">${c.name}</span>
                    </div>
                  `).join('')}
                </div>

                <!-- SVG Dynamic Graphics & Trajectory Layer -->
                <svg id="radar-svg-canvas" class="radar-svg-layer" viewBox="0 0 1000 1000">
                  <!-- Trajectories, pins and VFX will be drawn here -->
                </svg>
              </div>

              <!-- On-Screen Radar Zoom & Pan Controls (Mobile & Desktop) -->
              <div class="radar-mobile-zoom-overlay">
                <button type="button" class="radar-zoom-btn" id="radar-zoom-in" title="Zoom In">+</button>
                <button type="button" class="radar-zoom-btn" id="radar-zoom-out" title="Zoom Out">−</button>
                <button type="button" class="radar-zoom-btn" id="radar-zoom-reset" title="Reset View">⟲</button>
              </div>

              <!-- Radar Floating Quick Help -->
              <div class="radar-floating-hint">
                <span>💡 TIP: Click or tap any A or B Site pin on radar to inspect lineup</span>
              </div>
            </div>

            <!-- Radar Footer Legend -->
            <div class="radar-legend-bar">
              <div class="legend-item"><span class="leg-dot color-site-a"></span> A-SITE UTILITY</div>
              <div class="legend-item"><span class="leg-dot color-site-b"></span> B-SITE UTILITY</div>
              <div class="legend-item"><span class="leg-dot color-atk"></span> ATTACKER THROW</div>
              <div class="legend-item"><span class="leg-dot color-def"></span> DEFENDER POSITION</div>
              <div class="legend-item"><span class="leg-dot color-smoke"></span> SMOKE / ORB</div>
              <div class="legend-item"><span class="leg-dot color-lethal"></span> LETHAL ZONE</div>
            </div>
          </div>

          <!-- Right Column: Lineup Dossier OR Stratboard Palette -->
          <div class="lab-sidebar-container">
            ${this.activeMode === 'lineups' 
              ? this.renderLineupsSidebar(map, availableSites, filteredLineups, activeLineup)
              : this.renderStratboardSidebar(map)
            }
          </div>

        </div>

      </div>
    `;

    this.bindEvents(map, availableSites);
    this.initRadarGraphics(activeLineup, filteredLineups);
  }

  renderLineupsSidebar(map, availableSites, filteredLineups, activeLineup) {
    const agentsList = ['ALL', 'SOVA', 'VIPER', 'BRIMSTONE', 'KILLJOY', 'FADE'];

    // Counts for badge badges
    const totalCount = (map.lineups || []).length;
    const aCount = (map.lineups || []).filter(l => (l.site || '').toUpperCase() === 'A').length;
    const bCount = (map.lineups || []).filter(l => (l.site || '').toUpperCase() === 'B').length;
    const midCount = (map.lineups || []).filter(l => (l.site || '').toUpperCase() === 'MID').length;
    const cCount = (map.lineups || []).filter(l => (l.site || '').toUpperCase() === 'C').length;

    const atkCount = (map.lineups || []).filter(l => (l.side || '').toUpperCase() === 'ATTACK').length;
    const defCount = (map.lineups || []).filter(l => (l.side || '').toUpperCase() === 'DEFENSE').length;

    return `
      <!-- Lineups Sidebar -->
      <div class="lineup-dossier-card">
        <div class="dossier-card-head">
          <div class="dossier-title-row">
            <div>
              <span class="card-kicker">// TACTICAL BALLISTICS & LINEUP GUIDE</span>
              <h3>CLASSIFIED SITE EXECUTIONS</h3>
            </div>
            <div class="dossier-stats-pill">
              <span>${filteredLineups.length} / ${totalCount} LINEUPS</span>
            </div>
          </div>
        </div>

        <!-- 1. PRIMARY SITE SELECTOR TABS (Resolves: Shows both sites) -->
        <div class="lab-filter-section">
          <div class="filter-row-label">
            <span>SITE SELECTOR // CHOOSE OBJECTIVE:</span>
          </div>
          <div class="site-tabs-grid">
            <button class="site-tab-btn ${this.siteFilter === 'ALL' ? 'active' : ''}" data-site="ALL">
              <span class="tab-site-name">ALL SITES</span>
              <span class="tab-site-count">${totalCount}</span>
            </button>
            <button class="site-tab-btn site-a ${this.siteFilter === 'A' ? 'active' : ''}" data-site="A">
              <span class="site-gem gem-a"></span>
              <span class="tab-site-name">A SITE</span>
              <span class="tab-site-count">${aCount}</span>
            </button>
            <button class="site-tab-btn site-b ${this.siteFilter === 'B' ? 'active' : ''}" data-site="B">
              <span class="site-gem gem-b"></span>
              <span class="tab-site-name">B SITE</span>
              <span class="tab-site-count">${bCount}</span>
            </button>
            ${midCount > 0 ? `
              <button class="site-tab-btn site-mid ${this.siteFilter === 'MID' ? 'active' : ''}" data-site="MID">
                <span class="site-gem gem-mid"></span>
                <span class="tab-site-name">MID</span>
                <span class="tab-site-count">${midCount}</span>
              </button>
            ` : ''}
            ${cCount > 0 ? `
              <button class="site-tab-btn site-c ${this.siteFilter === 'C' ? 'active' : ''}" data-site="C">
                <span class="site-gem gem-c"></span>
                <span class="tab-site-name">C SITE</span>
                <span class="tab-site-count">${cCount}</span>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- 2. SIDE FILTER (ATTACK VS DEFENSE) -->
        <div class="lab-filter-section side-filter-bar">
          <div class="filter-row-label">
            <span>ROUND PHASE // TACTICAL SIDE:</span>
          </div>
          <div class="side-pill-group">
            <button class="side-filter-btn ${this.sideFilter === 'ALL' ? 'active' : ''}" data-side="ALL">
              <span>ALL PHASES</span>
            </button>
            <button class="side-filter-btn side-atk ${this.sideFilter === 'ATTACK' ? 'active' : ''}" data-side="ATTACK">
              <span>⚔ ATTACK (${atkCount})</span>
            </button>
            <button class="side-filter-btn side-def ${this.sideFilter === 'DEFENSE' ? 'active' : ''}" data-side="DEFENSE">
              <span>🛡 DEFENSE (${defCount})</span>
            </button>
          </div>
        </div>

        <!-- 3. AGENT FILTER CHIPS -->
        <div class="lab-filter-section agent-filter-bar">
          <div class="filter-row-label">
            <span>OPERATIVE FILTER:</span>
          </div>
          <div class="lineup-agent-filter-chips">
            ${agentsList.map(ag => `
              <button class="ag-chip-btn ${this.agentFilter === ag ? 'active' : ''}" data-agent="${ag}">
                ${ag}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Lineup Selector List -->
        <div class="lineup-selector-list">
          ${filteredLineups.length > 0 ? filteredLineups.map(l => {
            const isSiteA = (l.site || '').toUpperCase() === 'A';
            const isSiteB = (l.site || '').toUpperCase() === 'B';
            const isMid = (l.site || '').toUpperCase() === 'MID';
            const isSiteC = (l.site || '').toUpperCase() === 'C';
            const siteClass = isSiteA ? 'site-pill-a' : (isSiteB ? 'site-pill-b' : (isSiteC ? 'site-pill-c' : 'site-pill-mid'));

            return `
              <div class="lineup-list-item ${l.id === this.activeLineupId ? 'active' : ''}" data-lineup-id="${l.id}">
                <div class="item-agent-thumb">
                  <img src="${l.agentIcon}" alt="${l.agent}" />
                  <span class="item-agent-sub">${l.agent.substring(0, 3).toUpperCase()}</span>
                </div>
                <div class="item-info">
                  <div class="item-header-meta">
                    <div class="badge-cluster">
                      <span class="item-site-badge ${siteClass}">[SITE ${l.site}]</span>
                      <span class="item-side-badge badge-${l.side.toLowerCase()}">${l.side}</span>
                    </div>
                    <span class="item-difficulty-pill diff-${l.difficulty.toLowerCase()}">${l.difficulty}</span>
                  </div>
                  <h4 class="item-title">${l.name}</h4>
                  <div class="item-sub-meta">
                    <span class="sub-ability">${l.ability} (${l.abilitySlot.split(' ')[0]})</span>
                    <span class="sub-throw">⚡ ${l.throwType || 'STAND & THROW'}</span>
                  </div>
                </div>
              </div>
            `;
          }).join('') : `
            <div class="no-lineups-placeholder">
              <span class="empty-icon">⚠</span>
              <p>No classified lineups found for <strong>${this.siteFilter === 'ALL' ? 'this filter' : this.siteFilter + '-SITE'}</strong> on ${map.name}.</p>
              <button class="reset-filters-btn" id="reset-filters-btn">RESET FILTERS</button>
            </div>
          `}
        </div>

        <!-- Detailed Active Lineup Inspection Card with HUD Alignment Visualizer -->
        ${activeLineup ? this.renderActiveLineupCard(activeLineup) : ''}

      </div>
    `;
  }

  // First-Person Crosshair & HUD Alignment Card
  renderActiveLineupCard(activeLineup) {
    const charge = activeLineup.charge !== undefined ? activeLineup.charge : 0;
    const bounces = activeLineup.bounces !== undefined ? activeLineup.bounces : 0;
    const isSova = activeLineup.agent.toUpperCase() === 'SOVA';

    return `
      <div class="active-lineup-breakdown">
        <!-- Card Header -->
        <div class="breakdown-header">
          <div class="ab-icon-large">
            <img src="${activeLineup.abilityIcon}" alt="${activeLineup.ability}" />
          </div>
          <div class="breakdown-header-titles">
            <div class="breakdown-meta-top">
              <span class="breakdown-slot">${activeLineup.abilitySlot} // ${activeLineup.type}</span>
              <span class="item-site-badge site-pill-${activeLineup.site.toLowerCase()}">SITE ${activeLineup.site}</span>
            </div>
            <h4 class="breakdown-title">${activeLineup.name}</h4>
          </div>
        </div>

        <!-- IN-GAME HUD & CHARGE VISUALIZER (Authentic Valorant Style) -->
        <div class="hud-alignment-visualizer-box">
          <div class="hud-vis-header">
            <span class="hud-vis-tag">// IN-GAME FIRST-PERSON ALIGNMENT HUD</span>
            <span class="hud-tech-badge">${activeLineup.throwType || 'STAND & THROW'}</span>
          </div>

          <div class="hud-vis-body">
            <!-- Sova Charge Bar / Utility Charge Graphic -->
            ${isSova ? `
              <div class="sova-charge-meter-row">
                <div class="charge-bars-container">
                  <span class="charge-meter-label">CHARGE POWER:</span>
                  <div class="charge-pip-bar">
                    <div class="charge-pip ${charge >= 1 ? 'charged' : ''}"></div>
                    <div class="charge-pip ${charge >= 2 ? 'charged' : ''}"></div>
                    <div class="charge-pip ${charge >= 3 ? 'charged' : ''}"></div>
                  </div>
                  <span class="charge-value-text">${charge === 0 ? 'TAP / 0 BARS' : charge + (charge === 1 ? ' BAR' : ' BARS')}</span>
                </div>

                <div class="bounce-pips-container">
                  <span class="bounce-meter-label">BOUNCES:</span>
                  <div class="bounce-diamonds">
                    <span class="bounce-diamond ${bounces >= 1 ? 'active' : ''}">◆</span>
                    <span class="bounce-diamond ${bounces >= 2 ? 'active' : ''}">◆</span>
                  </div>
                  <span class="bounce-value-text">${bounces} ${bounces === 1 ? 'BOUNCE' : 'BOUNCES'}</span>
                </div>
              </div>
            ` : `
              <div class="util-spec-row">
                <div class="util-spec-item">
                  <span class="sc-label">CAST MECHANIC:</span>
                  <span class="sc-val" style="color: var(--val-cyan);">${activeLineup.throwType || 'STAND & THROW'}</span>
                </div>
                <div class="util-spec-item">
                  <span class="sc-label">EXECUTION TYPE:</span>
                  <span class="sc-val" style="color: #facc15;">${activeLineup.type}</span>
                </div>
              </div>
            `}

            <!-- Crosshair Alignment Cue Box -->
            <div class="alignment-cue-banner">
              <div class="crosshair-icon-mini">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" fill="#00f0ff" />
                  <line x1="12" y1="2" x2="12" y2="8" stroke="#00f0ff" stroke-width="2" />
                  <line x1="12" y1="16" x2="12" y2="22" stroke="#00f0ff" stroke-width="2" />
                  <line x1="2" y1="12" x2="8" y2="12" stroke="#00f0ff" stroke-width="2" />
                  <line x1="16" y1="12" x2="22" y2="12" stroke="#00f0ff" stroke-width="2" />
                </svg>
              </div>
              <div class="alignment-cue-text">
                <span class="cue-label">CROSSHAIR HUD ALIGNMENT:</span>
                <p class="cue-desc">${activeLineup.alignGuide || activeLineup.instructions}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Standing & Landing Coordinates Grid -->
        <div class="breakdown-specs-grid">
          <div class="spec-cell">
            <span class="sc-label">STAND POSITION</span>
            <span class="sc-val">${activeLineup.from.label}</span>
          </div>
          <div class="spec-cell">
            <span class="sc-label">IMPACT / LANDING TARGET</span>
            <span class="sc-val" style="color: #ff4655;">${activeLineup.to.label}</span>
          </div>
        </div>

        <!-- Full Instructions -->
        <div class="breakdown-instructions-box">
          <span class="inst-label">// STEP-BY-STEP EXECUTION PROTOCOL</span>
          <p>${activeLineup.instructions}</p>
        </div>

        <!-- Action Buttons -->
        <div class="breakdown-action-row">
          <button id="simulate-trajectory-btn" class="tactical-btn trajectory-action-btn">
            <span>▶ SIMULATE TRAJECTORY PATH</span>
          </button>
          <button id="focus-site-btn" class="tactical-btn tactical-btn-outline" data-site="${activeLineup.site}">
            <span>🎯 FOCUS CAMERA [SITE ${activeLineup.site}]</span>
          </button>
        </div>
      </div>
    `;
  }

  renderStratboardSidebar(map) {
    const strategies = map.strategies || [];

    return `
      <!-- Stratboard Sidebar -->
      <div class="stratboard-palette-card">
        <div class="dossier-card-head">
          <span class="card-kicker">// TACTICAL STRAT BOARD</span>
          <h3>INTERACTIVE SITE PLANNER</h3>
          <p class="strat-guide-text">Click any tool below, then click anywhere on the radar map to deploy tactical utility & agents!</p>
        </div>

        <!-- Palette Tool Selector -->
        <div class="strat-tools-palette">
          <button class="tool-btn ${this.selectedTool === 'agent-atk' ? 'active' : ''}" data-tool="agent-atk">
            <span class="tool-icon icon-atk">⚔</span>
            <span>ATTACKER</span>
          </button>
          <button class="tool-btn ${this.selectedTool === 'agent-def' ? 'active' : ''}" data-tool="agent-def">
            <span class="tool-icon icon-def">🛡</span>
            <span>DEFENDER</span>
          </button>
          <button class="tool-btn ${this.selectedTool === 'smoke' ? 'active' : ''}" data-tool="smoke">
            <span class="tool-icon icon-smoke">☁</span>
            <span>SMOKE ORB</span>
          </button>
          <button class="tool-btn ${this.selectedTool === 'molly' ? 'active' : ''}" data-tool="molly">
            <span class="tool-icon icon-molly">🔥</span>
            <span>MOLLY / FIRE</span>
          </button>
          <button class="tool-btn ${this.selectedTool === 'spike' ? 'active' : ''}" data-tool="spike">
            <span class="tool-icon icon-spike">⚡</span>
            <span>PLANT SPIKE</span>
          </button>
        </div>

        <!-- Quick Clear Controls -->
        <div class="strat-board-actions">
          <button id="clear-stratboard-btn" class="tactical-btn tactical-btn-outline" style="width: 100%;">
            <span>CLEAR PLACED TOKENS (${this.customTokens.length})</span>
          </button>
        </div>

        <!-- Pro Competitive Strat Presets -->
        <div class="strat-presets-box">
          <span class="inst-label">// LOAD PRO COMPETITIVE STRATEGIES</span>
          <div class="presets-list">
            ${strategies.map((strat, idx) => `
              <div class="preset-card-item" data-preset-idx="${idx}">
                <div class="preset-header">
                  <span class="preset-name">${strat.name}</span>
                  <span class="item-side-badge badge-${strat.side.toLowerCase()}">${strat.side}</span>
                </div>
                <p class="preset-desc">${strat.description}</p>
                <button class="preset-deploy-btn" data-preset-idx="${idx}">DEPLOY STRAT TO MAP ►</button>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;
  }

  bindEvents(map, availableSites) {
    // 1. Map tabs
    const mapBtns = this.container.querySelectorAll('.lab-map-btn');
    mapBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeMapId = btn.getAttribute('data-map-id');
        this.activeLineupId = null;
        this.siteFilter = 'ALL';
        this.sideFilter = 'ALL';
        this.cameraFocus = 'FULL';
        this.zoomScale = 1;
        this.panX = 0;
        this.panY = 0;
        this.customTokens = [];
        if (window.valorantAudio) window.valorantAudio.playClick();
        this.render();
      });
      btn.addEventListener('mouseenter', () => {
        if (window.valorantAudio) window.valorantAudio.playHover();
      });
    });

    // 2. Mode toggle
    const modeBtns = this.container.querySelectorAll('.mode-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeMode = btn.getAttribute('data-mode');
        if (window.valorantAudio) window.valorantAudio.playClick();
        this.render();
      });
    });

    // 3. Callouts toggle
    const calloutBtn = document.getElementById('callout-toggle-btn');
    if (calloutBtn) {
      calloutBtn.addEventListener('click', () => {
        this.showCallouts = !this.showCallouts;
        if (window.valorantAudio) window.valorantAudio.playHover();
        this.render();
      });
    }

    // 4. Site Filter Tabs (A-Site, B-Site, Mid, C-Site, ALL)
    const siteTabBtns = this.container.querySelectorAll('.site-tab-btn');
    siteTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const site = btn.getAttribute('data-site');
        this.siteFilter = site;
        this.activeLineupId = null; // Auto pick first in filtered
        if (site !== 'ALL') {
          this.applyCameraFocus(site);
        } else {
          this.applyCameraFocus('FULL');
        }
        if (window.valorantAudio) window.valorantAudio.playClick();
        this.render();
      });
      btn.addEventListener('mouseenter', () => {
        if (window.valorantAudio) window.valorantAudio.playHover();
      });
    });

    // 5. Side Filter Buttons (Attack, Defense, ALL)
    const sideBtns = this.container.querySelectorAll('.side-filter-btn');
    sideBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.sideFilter = btn.getAttribute('data-side');
        this.activeLineupId = null;
        if (window.valorantAudio) window.valorantAudio.playClick();
        this.render();
      });
    });

    // 6. Agent Filter Chips
    const agChips = this.container.querySelectorAll('.ag-chip-btn');
    agChips.forEach(btn => {
      btn.addEventListener('click', () => {
        this.agentFilter = btn.getAttribute('data-agent');
        this.activeLineupId = null;
        if (window.valorantAudio) window.valorantAudio.playClick();
        this.render();
      });
    });

    // 7. Lineup list item click
    const lineupItems = this.container.querySelectorAll('.lineup-list-item');
    lineupItems.forEach(item => {
      item.addEventListener('click', () => {
        const newId = item.getAttribute('data-lineup-id');
        this.activeLineupId = newId;
        const targetLineup = map.lineups.find(l => l.id === newId);
        if (targetLineup && this.cameraFocus !== 'FULL' && this.cameraFocus !== targetLineup.site) {
          this.applyCameraFocus(targetLineup.site);
        }
        if (window.valorantAudio) window.valorantAudio.playClick();
        this.render();
      });
    });

    // 8. Camera Focus Buttons on Radar Header
    const camBtns = this.container.querySelectorAll('.cam-btn');
    camBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const focus = btn.getAttribute('data-focus');
        this.applyCameraFocus(focus);
        camBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (window.valorantAudio) window.valorantAudio.playHover();
      });
    });

    // 9. Focus site button inside active card
    const focusSiteBtn = document.getElementById('focus-site-btn');
    if (focusSiteBtn) {
      focusSiteBtn.addEventListener('click', () => {
        const site = focusSiteBtn.getAttribute('data-site');
        this.applyCameraFocus(site);
        if (window.valorantAudio) window.valorantAudio.playClick();
        // Update cam-btn active
        const matchingCamBtn = this.container.querySelector(`.cam-btn[data-focus="${site}"]`);
        if (matchingCamBtn) {
          camBtns.forEach(b => b.classList.remove('active'));
          matchingCamBtn.classList.add('active');
        }
      });
    }

    // 10. Simulate Trajectory button
    const simBtn = document.getElementById('simulate-trajectory-btn');
    if (simBtn) {
      simBtn.addEventListener('click', () => {
        const lineup = map.lineups.find(l => l.id === this.activeLineupId);
        if (lineup) {
          if (window.valorantAudio) window.valorantAudio.playHover();
          this.animateTrajectoryFlight(lineup);
        }
      });
    }

    // 11. Reset filters button
    const resetBtn = document.getElementById('reset-filters-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.siteFilter = 'ALL';
        this.sideFilter = 'ALL';
        this.agentFilter = 'ALL';
        this.applyCameraFocus('FULL');
        this.render();
      });
    }

    // 12. Stratboard tool select
    const toolBtns = this.container.querySelectorAll('.tool-btn');
    toolBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        toolBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedTool = btn.getAttribute('data-tool');
        if (window.valorantAudio) window.valorantAudio.playHover();
      });
    });

    // 13. Clear Stratboard button
    const clearBtn = document.getElementById('clear-stratboard-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.customTokens = [];
        if (window.valorantAudio) window.valorantAudio.playClick();
        this.render();
      });
    }

    // 14. Deploy preset strategy
    const presetBtns = this.container.querySelectorAll('.preset-deploy-btn');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-preset-idx'), 10);
        const strat = map.strategies[idx];
        if (strat) {
          this.loadPresetStrategy(strat);
          if (window.valorantAudio) window.valorantAudio.playClick();
        }
      });
    });

    // 15. Interactive Radar Screen mouse movement & click-to-place
    const radarScreen = document.getElementById('radar-interactive-screen');
    const coordsEl = document.getElementById('radar-mouse-coords');
    if (radarScreen) {
      radarScreen.addEventListener('mousemove', (e) => {
        const rect = radarScreen.getBoundingClientRect();
        const x = Math.round(((e.clientX - rect.left) / rect.width) * 1000);
        const y = Math.round(((e.clientY - rect.top) / rect.height) * 1000);
        if (coordsEl) coordsEl.textContent = `COORD: ${x}, ${y}`;
      });

      radarScreen.addEventListener('click', (e) => {
        if (this.activeMode !== 'stratboard') return;
        const rect = radarScreen.getBoundingClientRect();
        const x = Math.round(((e.clientX - rect.left) / rect.width) * 1000);
        const y = Math.round(((e.clientY - rect.top) / rect.height) * 1000);

        this.addStratToken(x, y, this.selectedTool);
      });

      // 16. Touch Drag Panning on Mobile Radar
      let touchStartX = 0, touchStartY = 0;
      let initialPanX = 0, initialPanY = 0;
      let isTouching = false;

      radarScreen.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          isTouching = true;
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          initialPanX = this.panX;
          initialPanY = this.panY;
        }
      }, { passive: true });

      radarScreen.addEventListener('touchmove', (e) => {
        if (!isTouching || e.touches.length !== 1) return;
        const deltaX = (e.touches[0].clientX - touchStartX) / (this.zoomScale || 1);
        const deltaY = (e.touches[0].clientY - touchStartY) / (this.zoomScale || 1);
        this.panX = initialPanX + deltaX;
        this.panY = initialPanY + deltaY;
        this.updateRadarTransform();
      }, { passive: true });

      radarScreen.addEventListener('touchend', () => {
        isTouching = false;
      }, { passive: true });
    }

    // 17. Zoom In, Zoom Out, and Reset View Buttons
    const zoomInBtn = document.getElementById('radar-zoom-in');
    const zoomOutBtn = document.getElementById('radar-zoom-out');
    const zoomResetBtn = document.getElementById('radar-zoom-reset');

    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.zoomScale = Math.min(this.zoomScale + 0.35, 2.8);
        this.updateRadarTransform();
        if (window.valorantAudio) window.valorantAudio.playHover();
      });
    }

    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.zoomScale = Math.max(this.zoomScale - 0.35, 0.7);
        this.updateRadarTransform();
        if (window.valorantAudio) window.valorantAudio.playHover();
      });
    }

    if (zoomResetBtn) {
      zoomResetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.applyCameraFocus('FULL');
        if (window.valorantAudio) window.valorantAudio.playClick();
      });
    }
  }

  loadPresetStrategy(strat) {
    this.customTokens = [];
    (strat.tokens || []).forEach(t => {
      this.customTokens.push({
        x: t.x,
        y: t.y,
        type: t.role === 'Duelist' || t.role === 'Initiator' ? 'agent-atk' : 'agent-def',
        label: t.agent,
        task: t.task
      });
    });

    this.render();
  }

  addStratToken(x, y, toolType) {
    this.customTokens.push({
      x: x,
      y: y,
      type: toolType,
      label: toolType.toUpperCase().replace('-', ' ')
    });

    if (window.valorantAudio) window.valorantAudio.playHover();
    this.drawStratboardTokens();
  }

  initRadarGraphics(activeLineup, filteredLineups) {
    this.svgCanvas = document.getElementById('radar-svg-canvas');
    if (!this.svgCanvas) return;

    if (this.activeMode === 'lineups') {
      this.drawLineupGraphics(activeLineup, filteredLineups);
    } else if (this.activeMode === 'stratboard') {
      this.drawStratboardTokens();
    }
  }

  // Draw ALL Lineup Pins on radar simultaneously + Active Trajectory & VFX
  drawLineupGraphics(activeLineup, filteredLineups) {
    if (!this.svgCanvas) return;
    this.svgCanvas.innerHTML = '';

    const map = this.getCurrentMap();
    const allMapLineups = map.lineups || [];

    let defsHtml = `
      <defs>
        <filter id="glow-vfx" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="strong-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    `;

    let activeTrajectoryHtml = '';
    let landingVfxHtml = '';

    // If active lineup exists, render its rich trajectory
    if (activeLineup) {
      const { from, to, controlPoint, color, effectRadius, effectType, wallEnd } = activeLineup;
      const cp = controlPoint || { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 - 80 };
      const pathD = `M ${from.x} ${from.y} Q ${cp.x} ${cp.y} ${to.x} ${to.y}`;

      // Impact VFX based on ability type
      if (effectType === 'sonar-pulse') {
        landingVfxHtml = `
          <circle cx="${to.x}" cy="${to.y}" r="${effectRadius}" fill="${color}" fill-opacity="0.12" stroke="${color}" stroke-width="2.5" stroke-dasharray="8,5">
            <animate attributeName="r" values="${effectRadius * 0.3};${effectRadius}" dur="1.8s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.9;0" dur="1.8s" repeatCount="indefinite"/>
          </circle>
          <circle cx="${to.x}" cy="${to.y}" r="14" fill="${color}" filter="url(#glow-vfx)" />
        `;
      } else if (effectType === 'toxic-wall' && wallEnd) {
        landingVfxHtml = `
          <line x1="${from.x}" y1="${from.y}" x2="${wallEnd.x}" y2="${wallEnd.y}" stroke="#10e3ac" stroke-width="14" stroke-linecap="round" opacity="0.8" filter="url(#strong-glow)" />
        `;
      } else if (effectType === 'smoke-cloud') {
        landingVfxHtml = `
          <circle cx="${to.x}" cy="${to.y}" r="${effectRadius}" fill="${color}" fill-opacity="0.32" stroke="${color}" stroke-width="3" filter="url(#glow-vfx)">
            <animate attributeName="r" values="${effectRadius * 0.92};${effectRadius * 1.06};${effectRadius * 0.92}" dur="3.2s" repeatCount="indefinite"/>
          </circle>
        `;
      } else if (effectType === 'lockdown-dome') {
        landingVfxHtml = `
          <circle cx="${to.x}" cy="${to.y}" r="${effectRadius}" fill="#facc15" fill-opacity="0.15" stroke="#facc15" stroke-width="3" stroke-dasharray="10,6" filter="url(#strong-glow)">
            <animate attributeName="stroke-dashoffset" values="0;120" dur="4s" repeatCount="indefinite"/>
          </circle>
        `;
      } else if (effectType === 'fire-pool' || effectType === 'shock-burst') {
        landingVfxHtml = `
          <circle cx="${to.x}" cy="${to.y}" r="${effectRadius}" fill="${color}" fill-opacity="0.3" stroke="${color}" stroke-width="3" filter="url(#glow-vfx)">
            <animate attributeName="r" values="${effectRadius * 0.95};${effectRadius * 1.04};${effectRadius * 0.95}" dur="2s" repeatCount="indefinite"/>
          </circle>
        `;
      }

      activeTrajectoryHtml = `
        <!-- Impact VFX -->
        ${landingVfxHtml}

        <!-- Trajectory Background Thick Glow -->
        <path d="${pathD}" fill="none" stroke="${color}" stroke-width="8" opacity="0.25" filter="url(#glow-vfx)" />

        <!-- Main Animated Trajectory Arc -->
        <path id="active-trajectory-path" d="${pathD}" fill="none" stroke="${color}" stroke-width="4" stroke-dasharray="10,6" />

        <!-- Origin Thrower Beacon -->
        <g transform="translate(${from.x}, ${from.y})" class="trajectory-origin-node">
          <circle r="26" fill="#0f1923" stroke="${color}" stroke-width="3.5" filter="url(#glow-vfx)" />
          <circle r="14" fill="${color}" opacity="0.9" />
          <text y="42" fill="#ece8e1" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="700" text-anchor="middle">
            📍 ${from.label.toUpperCase()}
          </text>
        </g>

        <!-- Landing Target Node -->
        <g transform="translate(${to.x}, ${to.y})" class="trajectory-target-node">
          <circle r="22" fill="#ff4655" stroke="#ece8e1" stroke-width="3" filter="url(#glow-vfx)" />
          <polygon points="-7,-7 7,7 -7,7 7,-7" stroke="#fff" stroke-width="2.5" />
          <text y="-30" fill="#00f0ff" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="700" text-anchor="middle">
            🎯 ${to.label.toUpperCase()}
          </text>
        </g>

        <!-- Animated Flying Projectile -->
        <circle id="flying-projectile" r="9" fill="#ffffff" filter="url(#glow-vfx)" style="opacity: 0;" />
      `;
    }

    // Render INTERACTIVE PINS for ALL lineups on both sites
    let interactivePinsHtml = '<g class="radar-lineup-pins-group">';
    allMapLineups.forEach(l => {
      const isActive = activeLineup && l.id === activeLineup.id;
      const isFiltered = filteredLineups.some(fl => fl.id === l.id);
      const isSiteA = (l.site || '').toUpperCase() === 'A';
      const isSiteB = (l.site || '').toUpperCase() === 'B';
      const siteColor = isSiteA ? '#facc15' : (isSiteB ? '#00f0ff' : '#9d5cf7');
      const pinOpacity = isFiltered ? (isActive ? '1' : '0.85') : '0.25';

      interactivePinsHtml += `
        <g class="interactive-lineup-pin ${isActive ? 'is-active-pin' : ''}" 
           transform="translate(${l.to.x}, ${l.to.y})" 
           data-pin-lineup-id="${l.id}" 
           style="cursor: pointer; opacity: ${pinOpacity};">
          
          <!-- Outer Pulsing Ring for Active -->
          ${isActive ? `
            <circle r="34" fill="none" stroke="${siteColor}" stroke-width="2" stroke-dasharray="6,4">
              <animate attributeName="r" values="24;36;24" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite"/>
            </circle>
          ` : ''}

          <!-- Pin Circle -->
          <circle r="${isActive ? '20' : '15'}" fill="#0a1016" stroke="${siteColor}" stroke-width="${isActive ? '3' : '2'}" />
          
          <!-- Site Tag Inside Pin -->
          <text y="${isActive ? '6' : '5'}" fill="${siteColor}" font-family="'Barlow Semi Condensed', sans-serif" font-size="${isActive ? '14' : '11'}" font-weight="800" text-anchor="middle">
            ${l.site}
          </text>

          <!-- Label Tooltip on Hover / Active -->
          <g class="pin-hover-tooltip" transform="translate(0, ${isActive ? '-30' : '-24'})">
            <rect x="-80" y="-18" width="160" height="22" rx="4" fill="#0f1923" stroke="${siteColor}" stroke-width="1.5" opacity="0.95" />
            <text y="-3" fill="#ffffff" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" text-anchor="middle">
              ${l.agent.toUpperCase()} // [SITE ${l.site}]
            </text>
          </g>
        </g>
      `;
    });
    interactivePinsHtml += '</g>';

    this.svgCanvas.innerHTML = defsHtml + landingVfxHtml + activeTrajectoryHtml + interactivePinsHtml;

    // Bind click events on SVG lineup pins directly!
    const pins = this.svgCanvas.querySelectorAll('.interactive-lineup-pin');
    pins.forEach(pin => {
      pin.addEventListener('click', (e) => {
        e.stopPropagation();
        const lineupId = pin.getAttribute('data-pin-lineup-id');
        if (lineupId) {
          this.activeLineupId = lineupId;
          const target = allMapLineups.find(l => l.id === lineupId);
          if (target && this.siteFilter !== 'ALL' && this.siteFilter !== target.site) {
            this.siteFilter = 'ALL'; // expand so it's not hidden
          }
          if (window.valorantAudio) window.valorantAudio.playClick();
          this.render();
        }
      });

      pin.addEventListener('mouseenter', () => {
        if (window.valorantAudio) window.valorantAudio.playHover();
      });
    });

    // Trigger ballistic flight animation
    if (activeLineup) {
      this.animateTrajectoryFlight(activeLineup);
    }
  }

  animateTrajectoryFlight(lineup) {
    const path = document.getElementById('active-trajectory-path');
    const projectile = document.getElementById('flying-projectile');
    if (!path || !projectile) return;

    const pathLength = path.getTotalLength();
    let start = null;
    const duration = 1100; // 1.1s flight

    projectile.style.opacity = '1';

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min(1, (timestamp - start) / duration);
      const point = path.getPointAtLength(progress * pathLength);

      projectile.setAttribute('cx', point.x);
      projectile.setAttribute('cy', point.y);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Impact sound
        if (window.valorantAudio) {
          window.valorantAudio.playBeep(880, 0.12, 'triangle');
        }
      }
    };

    requestAnimationFrame(step);
  }

  drawStratboardTokens() {
    if (!this.svgCanvas) return;
    this.svgCanvas.innerHTML = '';

    let tokensHtml = '';
    this.customTokens.forEach((token) => {
      let iconColor = '#00f0ff';
      let iconSymbol = '⚔';

      if (token.type === 'agent-atk') {
        iconColor = '#ff4655';
        iconSymbol = 'ATK';
      } else if (token.type === 'agent-def') {
        iconColor = '#00f0ff';
        iconSymbol = 'DEF';
      } else if (token.type === 'smoke') {
        iconColor = '#9d5cf7';
        iconSymbol = '☁';
      } else if (token.type === 'molly') {
        iconColor = '#f59e0b';
        iconSymbol = '🔥';
      } else if (token.type === 'spike') {
        iconColor = '#facc15';
        iconSymbol = '⚡';
      }

      if (token.type === 'smoke') {
        tokensHtml += `
          <circle cx="${token.x}" cy="${token.y}" r="80" fill="${iconColor}" fill-opacity="0.3" stroke="${iconColor}" stroke-width="2" />
        `;
      } else if (token.type === 'molly') {
        tokensHtml += `
          <circle cx="${token.x}" cy="${token.y}" r="65" fill="${iconColor}" fill-opacity="0.35" stroke="${iconColor}" stroke-width="2" />
        `;
      }

      tokensHtml += `
        <g transform="translate(${token.x}, ${token.y})" class="strat-placed-token" style="cursor: pointer;">
          <circle r="22" fill="#0f1923" stroke="${iconColor}" stroke-width="3" filter="drop-shadow(0 0 10px ${iconColor})" />
          <text y="6" fill="#fff" font-family="'Barlow Semi Condensed', sans-serif" font-size="16" font-weight="700" text-anchor="middle">
            ${iconSymbol}
          </text>
          ${token.label ? `
            <text y="38" fill="#ece8e1" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" text-anchor="middle">
              ${token.label}
            </text>
          ` : ''}
          ${token.task ? `
            <text y="56" fill="#8b97a2" font-family="'Rajdhani', sans-serif" font-size="14" text-anchor="middle">
              ${token.task}
            </text>
          ` : ''}
        </g>
      `;
    });

    this.svgCanvas.innerHTML = tokensHtml;
  }
}

// Auto init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.minimapLab = new TacticalMinimapLab();
  });
} else {
  window.minimapLab = new TacticalMinimapLab();
}
