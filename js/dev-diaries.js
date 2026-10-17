/**
 * VALORANT PROTOCOL // DEV DIARIES & PATCH INTELLIGENCE CONTROLLER
 * Renders the live update notes (Patch 9.08), upcoming roadmaps (Episode 10, Replay System, UE5),
 * and archived patch changelogs.
 */

class DevDiariesController {
  constructor() {
    this.data = window.VALORANT_DEV_DIARIES || {};
    this.activeTab = 'current'; // 'current' | 'roadmap' | 'archive' | 'articles'
    this.archiveFilter = 'ALL';
    
    this.tabButtons = null;
    this.container = null;

    this.init();
  }

  init() {
    this.container = document.getElementById('dev-diaries-content');
    this.tabButtons = document.querySelectorAll('.diary-nav-tab');

    this.bindTabs();
    this.render();
  }

  bindTabs() {
    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.getAttribute('data-diary-tab');
        if (window.valorantAudio) window.valorantAudio.playClick();
        this.render();
      });
      btn.addEventListener('mouseenter', () => {
        if (window.valorantAudio) window.valorantAudio.playHover();
      });
    });
  }

  render() {
    if (!this.container) return;

    switch (this.activeTab) {
      case 'current':
        this.renderCurrentPatch();
        break;
      case 'roadmap':
        this.renderUpcomingRoadmap();
        break;
      case 'archive':
        this.renderArchive();
        break;
      case 'articles':
        this.renderArticles();
        break;
      default:
        this.renderCurrentPatch();
    }
  }

  renderCurrentPatch() {
    const patch = this.data.currentPatch;
    if (!patch) return;

    const metricsHtml = patch.keyMetrics.map(m => `
      <div class="patch-metric-card">
        <span class="metric-val">${m.value}</span>
        <span class="metric-lbl">${m.label}</span>
      </div>
    `).join('');

    const highlightsHtml = patch.highlights.map((item, idx) => `
      <div class="patch-highlight-card">
        <div class="highlight-header">
          <div class="highlight-tags">
            <span class="badge-category">${item.category}</span>
            <span class="badge-status badge-${item.badge.toLowerCase()}">${item.badge}</span>
          </div>
          <span class="highlight-index">// NOTE 0${idx + 1}</span>
        </div>

        <h3 class="highlight-title">${item.title}</h3>
        <p class="highlight-summary">${item.content}</p>

        <div class="highlight-details-list">
          ${item.details.map(d => `
            <div class="detail-bullet">
              <span class="bullet-arrow">►</span>
              <span>${d}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    this.container.innerHTML = `
      <div class="current-patch-wrapper">
        <!-- Hero Patch Banner -->
        <div class="patch-banner-box">
          <div class="patch-banner-header">
            <div class="patch-version-tag">
              <span class="version-label">ACTIVE CLIENT VERSION</span>
              <span class="version-number">PATCH ${patch.version}</span>
            </div>
            <div class="patch-date-tag">
              <span class="status-dot"></span>
              <span>${patch.status} // ${patch.releaseDate}</span>
            </div>
          </div>

          <h2 class="patch-headline">${patch.title}</h2>
          <p class="patch-summary-lead">${patch.summary}</p>

          <div class="patch-metrics-row">
            ${metricsHtml}
          </div>
        </div>

        <!-- Section Title -->
        <div class="dev-section-title-bar">
          <h3>// COMPREHENSIVE TACTICAL CHANGELOG</h3>
          <span>VERIFIED BY RIOT BALANCE OPERATIONS</span>
        </div>

        <!-- Highlights Grid -->
        <div class="patch-highlights-grid">
          ${highlightsHtml}
        </div>
      </div>
    `;
  }

  renderUpcomingRoadmap() {
    const roadmap = this.data.upcomingRoadmap || [];

    const cardsHtml = roadmap.map((item, idx) => `
      <div class="roadmap-card">
        <div class="roadmap-corner-bracket"></div>
        <div class="roadmap-meta">
          <span class="roadmap-quarter">${item.quarter}</span>
          <span class="roadmap-badge-target">${item.target}</span>
        </div>

        <div class="roadmap-title-group">
          <span class="roadmap-codename">${item.codename}</span>
          <h3 class="roadmap-title">${item.title}</h3>
          <span class="roadmap-role-tag">${item.role} // REGION: ${item.origin}</span>
        </div>

        <p class="roadmap-desc">${item.description}</p>

        <!-- Milestones Tracker -->
        <div class="roadmap-milestones-box">
          <h4 class="milestones-heading">// DEPLOYMENT PIPELINE</h4>
          ${item.milestones.map(m => `
            <div class="milestone-row">
              <div class="milestone-labels">
                <span class="milestone-name">${m.label}</span>
                <span class="milestone-status status-${m.status.toLowerCase().replace(/\s+/g, '-')}">${m.status} (${m.progress}%)</span>
              </div>
              <div class="milestone-track">
                <div class="milestone-bar" style="width: ${m.progress}%"></div>
              </div>
            </div>
          `).join('')}
        </div>

        <blockquote class="roadmap-quote">${item.teaserQuote}</blockquote>
      </div>
    `).join('');

    this.container.innerHTML = `
      <div class="upcoming-roadmap-wrapper">
        <div class="roadmap-header-lead">
          <span class="lead-badge">// FUTURE PROTOCOL HORIZONS</span>
          <h2>WHAT LIES AHEAD: EPISODE 10 & ADVANCED CLIENT SYSTEMS</h2>
          <p>Peek behind the blast doors at our multi-quarter pipeline: next-generation agents, the in-client replay observer, and Unreal Engine 5 modernization.</p>
        </div>

        <div class="roadmap-grid">
          ${cardsHtml}
        </div>
      </div>
    `;
  }

  renderArchive() {
    const pastPatches = this.data.pastPatches || [];

    const filterTags = ['ALL', 'NEW AGENT', 'BALANCING', 'SENTINEL', 'CONTROLLER', 'NEW WEAPON'];

    const filtered = this.archiveFilter === 'ALL' 
      ? pastPatches 
      : pastPatches.filter(p => p.tags.some(t => t.toUpperCase() === this.archiveFilter.toUpperCase()));

    this.container.innerHTML = `
      <div class="patch-archive-wrapper">
        <div class="archive-header-row">
          <div>
            <span class="lead-badge">// DECLASSIFIED MISSION LOGS</span>
            <h2>HISTORICAL PATCH ARCHIVES</h2>
          </div>

          <!-- Archive Filter Tags -->
          <div class="archive-tag-filters" id="archive-filters">
            ${filterTags.map(tag => `
              <button class="archive-tag-btn ${this.archiveFilter === tag ? 'active' : ''}" data-tag="${tag}">
                ${tag}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="archive-timeline">
          ${filtered.map(p => `
            <div class="archive-patch-entry">
              <div class="archive-date-col">
                <span class="archive-version">v${p.version}</span>
                <span class="archive-date">${p.date}</span>
              </div>
              <div class="archive-content-col">
                <div class="archive-tags-list">
                  ${p.tags.map(t => `<span class="archive-mini-tag">${t}</span>`).join('')}
                </div>
                <h3 class="archive-entry-title">${p.title}</h3>
                <p class="archive-entry-summary">${p.summary}</p>
                <ul class="archive-changes-list">
                  ${p.changes.map(ch => `<li><span class="ch-bullet">▸</span> ${ch}</li>`).join('')}
                </ul>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Bind archive filter buttons
    const filterBtns = this.container.querySelectorAll('.archive-tag-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.archiveFilter = btn.getAttribute('data-tag');
        if (window.valorantAudio) window.valorantAudio.playClick();
        this.renderArchive();
      });
    });
  }

  renderArticles() {
    const articles = this.data.devArticles || [];

    this.container.innerHTML = `
      <div class="dev-articles-wrapper">
        <div class="roadmap-header-lead">
          <span class="lead-badge">// TACTICAL ESSAYS & WHITE PAPERS</span>
          <h2>DEV THOUGHTS & CORE ARCHITECTURE</h2>
          <p>Technical breakdowns, anti-cheat engineering briefs, and competitive game balance methodologies.</p>
        </div>

        <div class="articles-grid">
          ${articles.map(art => `
            <article class="dev-article-card">
              <div class="article-meta">
                <span class="article-date">${art.date}</span>
                <span class="article-readtime">${art.readTime}</span>
              </div>
              <h3 class="article-title">${art.title}</h3>
              <span class="article-author">${art.author}</span>
              <p class="article-excerpt">${art.excerpt}</p>
              <div class="article-tags">
                ${art.tags.map(t => `<span class="article-tag">${t}</span>`).join('')}
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    `;
  }
}

// Auto init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.devDiariesController = new DevDiariesController();
  });
} else {
  window.devDiariesController = new DevDiariesController();
}
