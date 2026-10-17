/**
 * VALORANT PROTOCOL // AGENTS DIRECTORY & DOSSIER VIEWER
 * Complete roster of all playable Valorant agents with roles, abilities, lore & stats.
 */

class ValorantAgentsManager {
  constructor() {
    this.agents = [];
    this.currentRole = 'ALL';
    this.searchQuery = '';
    this.selectedAgent = null;

    this.gridEl = null;
    this.countEl = null;
    this.modalEl = null;

    this.init();
  }

  async init() {
    this.gridEl = document.getElementById('agents-grid');
    this.countEl = document.getElementById('agents-count-badge');
    this.modalEl = document.getElementById('agent-dossier-modal');

    // Load agents from global window object (fallback to fetch if needed)
    if (window.VALORANT_AGENTS && Array.isArray(window.VALORANT_AGENTS)) {
      this.agents = window.VALORANT_AGENTS;
    } else {
      try {
        const res = await fetch('data/agents.json');
        this.agents = await res.json();
      } catch (e) {
        console.warn('Local agents fetch fallback triggered', e);
      }
    }

    // Clean up agents data (ensure role and abilities exist)
    this.agents = this.agents.filter(a => a && a.displayName && a.role);

    this.bindFilters();
    this.bindSearch();
    this.bindModalEvents();
    this.populateMobileDropdown();
    this.render();
  }

  populateMobileDropdown() {
    const dropdown = document.getElementById('mobile-agent-dropdown');
    if (!dropdown) return;

    const roles = ['Duelist', 'Initiator', 'Sentinel', 'Controller'];
    let html = '<option value="">-- CHOOSE AGENT TO INSPECT (26 OPERATIVES) --</option>';

    roles.forEach(role => {
      const roleAgents = this.agents.filter(a => a.role && a.role.displayName.toLowerCase() === role.toLowerCase());
      if (roleAgents.length > 0) {
        html += `<optgroup label="// ${role.toUpperCase()}S (${roleAgents.length})">`;
        roleAgents.forEach(a => {
          html += `<option value="${a.uuid}">${a.displayName.toUpperCase()} // ${role.toUpperCase()}</option>`;
        });
        html += `</optgroup>`;
      }
    });

    dropdown.innerHTML = html;

    dropdown.addEventListener('change', (e) => {
      const uuid = e.target.value;
      if (uuid) {
        this.openDossier(uuid);
        dropdown.value = '';
      }
    });
  }

  bindFilters() {
    const roleBtns = document.querySelectorAll('.role-filter-btn');
    roleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        roleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentRole = btn.getAttribute('data-role');
        if (window.valorantAudio) window.valorantAudio.playClick();
        this.render();
      });
      btn.addEventListener('mouseenter', () => {
        if (window.valorantAudio) window.valorantAudio.playHover();
      });
    });
  }

  bindSearch() {
    const searchInput = document.getElementById('agent-search-input');
    const clearBtn = document.getElementById('agent-search-clear');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        if (clearBtn) {
          clearBtn.style.display = this.searchQuery ? 'block' : 'none';
        }
        this.render();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          this.searchQuery = '';
          clearBtn.style.display = 'none';
          this.render();
        }
      });
    }
  }

  getFilteredAgents() {
    return this.agents.filter(agent => {
      // Role match
      const roleMatches = this.currentRole === 'ALL' || 
        (agent.role && agent.role.displayName.toUpperCase() === this.currentRole.toUpperCase());

      // Search match (name, role, or abilities)
      if (!this.searchQuery) return roleMatches;

      const nameMatch = agent.displayName.toLowerCase().includes(this.searchQuery);
      const roleMatch = agent.role && agent.role.displayName.toLowerCase().includes(this.searchQuery);
      const abilityMatch = agent.abilities && agent.abilities.some(ab => 
        ab.displayName && ab.displayName.toLowerCase().includes(this.searchQuery)
      );

      return roleMatches && (nameMatch || roleMatch || abilityMatch);
    });
  }

  render() {
    if (!this.gridEl) return;

    const filtered = this.getFilteredAgents();

    // Update count badge
    if (this.countEl) {
      this.countEl.textContent = `SHOWING ${filtered.length} OF ${this.agents.length} OPERATIVES`;
    }

    if (filtered.length === 0) {
      this.gridEl.innerHTML = `
        <div class="agent-no-results">
          <div class="no-results-icon">// 404</div>
          <h3>NO OPERATIVES MATCH QUERY</h3>
          <p>Check callsign spelling or reset role filters to view available Protocol agents.</p>
          <button class="tactical-btn" onclick="document.getElementById('agent-search-input').value=''; window.agentsManager.searchQuery=''; window.agentsManager.render();">RESET INTEL SEARCH</button>
        </div>
      `;
      return;
    }

    this.gridEl.innerHTML = filtered.map((agent, index) => {
      const roleName = agent.role ? agent.role.displayName : 'Unknown';
      const roleIcon = agent.role ? agent.role.displayIcon : '';
      const portrait = agent.fullPortrait || agent.displayIcon;
      const bgImg = agent.background || '';

      const abilitiesHtml = (agent.abilities || []).slice(0, 4).map(ab => `
        <div class="card-ability-icon" title="${ab.displayName}: ${ab.slot}">
          ${ab.displayIcon ? `<img src="${ab.displayIcon}" alt="${ab.displayName}" loading="lazy"/>` : `<span>?</span>`}
        </div>
      `).join('');

      return `
        <article class="agent-card role-${roleName.toLowerCase()}" data-uuid="${agent.uuid}" tabindex="0">
          <!-- Card Corner Brackets -->
          <div class="card-bracket bracket-tl"></div>
          <div class="card-bracket bracket-tr"></div>
          <div class="card-bracket bracket-bl"></div>
          <div class="card-bracket bracket-br"></div>

          <!-- Card Header & Metadata -->
          <div class="card-top-meta">
            <span class="agent-num">// 0${index + 1}</span>
            <div class="agent-role-pill">
              ${roleIcon ? `<img src="${roleIcon}" alt="${roleName}" class="role-icon-mini"/>` : ''}
              <span>${roleName.toUpperCase()}</span>
            </div>
          </div>

          <!-- Agent Portrait Stage -->
          <div class="agent-card-stage">
            ${bgImg ? `<img src="${bgImg}" alt="" class="agent-card-bg" loading="lazy"/>` : ''}
            <img src="${portrait}" alt="${agent.displayName}" class="agent-portrait" loading="lazy"/>
            <div class="agent-shadow-gradient"></div>
          </div>

          <!-- Card Bottom Info -->
          <div class="agent-card-bottom">
            <h3 class="agent-name">${agent.displayName.toUpperCase()}</h3>
            <p class="agent-tagline">${agent.developerName ? `CODENAME: ${agent.developerName.toUpperCase()}` : 'PROTOCOL OPERATIVE'}</p>
            
            <div class="card-abilities-bar">
              ${abilitiesHtml}
            </div>

            <button class="agent-inspect-btn" data-uuid="${agent.uuid}">
              <span>INSPECT DOSSIER</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </article>
      `;
    }).join('');

    // Attach click listeners to cards
    const cards = this.gridEl.querySelectorAll('.agent-card');
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        const uuid = card.getAttribute('data-uuid');
        this.openDossier(uuid);
      });
      card.addEventListener('mouseenter', () => {
        if (window.valorantAudio) window.valorantAudio.playHover();
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const uuid = card.getAttribute('data-uuid');
          this.openDossier(uuid);
        }
      });
    });
  }

  openDossier(uuid) {
    const agent = this.agents.find(a => a.uuid === uuid);
    if (!agent || !this.modalEl) return;

    this.selectedAgent = agent;
    if (window.valorantAudio) window.valorantAudio.playClick();

    const roleName = agent.role ? agent.role.displayName : 'Operative';
    const roleIcon = agent.role ? agent.role.displayIcon : '';
    const portrait = agent.fullPortrait || agent.displayIcon;

    // Default to the first ability
    const abilities = agent.abilities || [];
    const firstAbility = abilities[0] || null;

    // Render Modal Content
    this.modalEl.innerHTML = `
      <div class="modal-backdrop" id="modal-backdrop"></div>
      <div class="dossier-window" role="dialog" aria-modal="true">
        <!-- Close button -->
        <button class="dossier-close-btn" id="dossier-close-btn" title="Close Dossier (ESC)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        <!-- Tactical Dossier Header -->
        <div class="dossier-header-bar">
          <div class="dossier-header-left">
            <span class="dossier-tag">// VALORANT PROTOCOL CLASSIFIED DOSSIER</span>
            <span class="dossier-id">RECORD ID: ${agent.uuid.slice(0, 8).toUpperCase()}</span>
          </div>
          <div class="dossier-header-right">
            <span class="dossier-status-live">STATUS: ACTIVE IN FIELD</span>
          </div>
        </div>

        <div class="dossier-body">
          <!-- Left Visual Column -->
          <div class="dossier-visual-col">
            <div class="dossier-portrait-box">
              ${agent.background ? `<img src="${agent.background}" alt="" class="dossier-backdrop-art"/>` : ''}
              <img src="${portrait}" alt="${agent.displayName}" class="dossier-large-portrait"/>
              <div class="dossier-portrait-glitch"></div>
            </div>
            
            <div class="dossier-role-card">
              ${roleIcon ? `<img src="${roleIcon}" alt="${roleName}" class="dossier-role-badge"/>` : ''}
              <div>
                <h4>ROLE: ${roleName.toUpperCase()}</h4>
                <p>${agent.role ? agent.role.description : ''}</p>
              </div>
            </div>
          </div>

          <!-- Right Intel Column -->
          <div class="dossier-intel-col">
            <div class="dossier-title-row">
              <h2 class="dossier-agent-name">${agent.displayName.toUpperCase()}</h2>
              <span class="dossier-agent-alias">${agent.developerName ? `// CODE: ${agent.developerName.toUpperCase()}` : ''}</span>
            </div>

            <!-- Agent Bio -->
            <div class="dossier-section">
              <h4 class="dossier-subhead">// BIOGRAPHY & RADIANITE DOSSIER</h4>
              <p class="dossier-description">${agent.description || 'No classified transmission records found.'}</p>
            </div>

            <!-- Combat Attributes Radar -->
            <div class="dossier-section">
              <h4 class="dossier-subhead">// COMBAT PROTOCOL METRICS</h4>
              <div class="combat-metrics-grid">
                <div class="metric-item">
                  <span class="metric-name">TACTICAL MOBILITY</span>
                  <div class="metric-bar"><div class="metric-fill" style="width: ${this.getMetricVal(agent, 'mobility')}%"></div></div>
                </div>
                <div class="metric-item">
                  <span class="metric-name">SITE UTILITY</span>
                  <div class="metric-bar"><div class="metric-fill" style="width: ${this.getMetricVal(agent, 'utility')}%"></div></div>
                </div>
                <div class="metric-item">
                  <span class="metric-name">COMBAT LETHALITY</span>
                  <div class="metric-bar"><div class="metric-fill" style="width: ${this.getMetricVal(agent, 'lethality')}%"></div></div>
                </div>
                <div class="metric-item">
                  <span class="metric-name">INTEL & RECON</span>
                  <div class="metric-bar"><div class="metric-fill" style="width: ${this.getMetricVal(agent, 'recon')}%"></div></div>
                </div>
              </div>
            </div>

            <!-- Interactive Abilities Section -->
            <div class="dossier-section">
              <h4 class="dossier-subhead">// TACTICAL ABILITIES INVENTORY</h4>
              <div class="ability-tabs-bar" id="ability-tabs-bar">
                ${abilities.map((ab, idx) => `
                  <button class="ability-tab-btn ${idx === 0 ? 'active' : ''}" data-slot-idx="${idx}">
                    ${ab.displayIcon ? `<img src="${ab.displayIcon}" alt="${ab.displayName}" class="ability-tab-icon"/>` : ''}
                    <span class="ability-slot-key">${this.formatSlotName(ab.slot)}</span>
                    <span class="ability-tab-title">${ab.displayName}</span>
                  </button>
                `).join('')}
              </div>

              <!-- Active Ability Detailed Viewer -->
              <div class="active-ability-card" id="active-ability-card">
                ${this.renderAbilityDetail(firstAbility)}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.modalEl.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (window.lenis) window.lenis.stop();

    // Bind Ability Tabs Inside Modal
    const abilityBtns = this.modalEl.querySelectorAll('.ability-tab-btn');
    abilityBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        abilityBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const idx = parseInt(btn.getAttribute('data-slot-idx'), 10);
        const card = document.getElementById('active-ability-card');
        if (card && abilities[idx]) {
          card.innerHTML = this.renderAbilityDetail(abilities[idx]);
          if (window.valorantAudio) window.valorantAudio.playClick();
        }
      });
      btn.addEventListener('mouseenter', () => {
        if (window.valorantAudio) window.valorantAudio.playHover();
      });
    });

    // Close on backdrop or close button
    const closeBtn = document.getElementById('dossier-close-btn');
    const backdrop = document.getElementById('modal-backdrop');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeDossier());
    if (backdrop) backdrop.addEventListener('click', () => this.closeDossier());
  }

  renderAbilityDetail(ability) {
    if (!ability) return '<p>No ability telemetry available.</p>';
    return `
      <div class="ability-detail-header">
        ${ability.displayIcon ? `<img src="${ability.displayIcon}" alt="${ability.displayName}" class="ability-detail-icon"/>` : ''}
        <div>
          <span class="ability-slot-badge">${this.formatSlotName(ability.slot)} // KEYBIND ASSIGNMENT</span>
          <h3 class="ability-detail-name">${ability.displayName.toUpperCase()}</h3>
        </div>
      </div>
      <p class="ability-detail-text">${ability.description}</p>
    `;
  }

  formatSlotName(slot) {
    if (!slot) return 'PASSIVE';
    switch (slot) {
      case 'Ability1': return 'KEY [Q]';
      case 'Ability2': return 'KEY [E] SIGNATURE';
      case 'Grenade': return 'KEY [C] UTILITY';
      case 'Ultimate': return 'KEY [X] ULTIMATE';
      case 'Passive': return 'PASSIVE';
      default: return slot.toUpperCase();
    }
  }

  getMetricVal(agent, type) {
    const role = agent.role ? agent.role.displayName : '';
    // Tactical themed metric balance
    if (type === 'mobility') {
      return ['Jett', 'Neon', 'Raze', 'Yoru'].includes(agent.displayName) ? 95 :
             role === 'Duelist' ? 80 : 50;
    }
    if (type === 'utility') {
      return role === 'Controller' ? 95 : role === 'Sentinel' ? 90 : 65;
    }
    if (type === 'lethality') {
      return role === 'Duelist' ? 95 : role === 'Initiator' ? 75 : 60;
    }
    if (type === 'recon') {
      return role === 'Initiator' ? 95 : role === 'Sentinel' ? 80 : 40;
    }
    return 70;
  }

  closeDossier() {
    if (this.modalEl) {
      this.modalEl.classList.remove('open');
      document.body.style.overflow = '';
      if (window.lenis) window.lenis.start();
      this.selectedAgent = null;
      if (window.valorantAudio) window.valorantAudio.playClick();
    }
  }

  bindModalEvents() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalEl && this.modalEl.classList.contains('open')) {
        this.closeDossier();
      }
    });
  }
}

// Auto init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.agentsManager = new ValorantAgentsManager();
  });
} else {
  window.agentsManager = new ValorantAgentsManager();
}
