/**
 * VALORANT PROTOCOL // CHAMPIONS THEME MORPHING & ANTHEM AUDIO ENGINE
 * Dual-core audio engine:
 * 1. Direct High-Fidelity Riot CDN Audio Stream (zero lag, 100% reliable, CORS compliant).
 * 2. Official YouTube Embed Player with strict-origin referrerpolicy & responsive controls.
 * Synchronized with full-site HUD morphing and Floating Audio HUD for 2021-2026.
 */

class ValorantChampionsManager {
  constructor() {
    this.championsData = window.VALORANT_CHAMPIONS_DATA || [];
    this.activeYear = null; // null represents default Valorant Protocol
    this.isPlaying = false;
    this.volume = 0.75;
    this.mediaMode = 'audio'; // 'audio' | 'video'

    // Dedicated HTML5 Audio Player for studio music playback
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.volume = this.volume;
    this.audio.loop = true;

    this.container = null;
    this.playerHud = null;

    this.init();
  }

  init() {
    this.container = document.getElementById('champions-hub-content');
    this.initAudioEvents();
    this.renderYearSelectors();
    this.renderChampionsView(this.championsData[0]); // Default to 2021 or active
    this.createAudioHud();
  }

  initAudioEvents() {
    this.audio.addEventListener('play', () => {
      this.setPlayingState(true);
    });

    this.audio.addEventListener('pause', () => {
      this.setPlayingState(false);
    });

    this.audio.addEventListener('timeupdate', () => {
      this.updateProgress();
    });

    this.audio.addEventListener('ended', () => {
      this.setPlayingState(false);
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio stream error, checking fallback', e);
      this.setPlayingState(false);
    });
  }

  renderYearSelectors() {
    const navBar = document.getElementById('champions-year-nav');
    if (!navBar) return;

    let html = `
      <button class="year-chip-btn ${this.activeYear === null ? 'active' : ''}" data-year="default">
        <span class="chip-dot"></span>
        <span class="chip-year">PROTOCOL DEFAULT</span>
      </button>
    `;

    this.championsData.forEach(champ => {
      html += `
        <button class="year-chip-btn ${this.activeYear === champ.year ? 'active' : ''}" data-year="${champ.year}">
          <span class="chip-dot"></span>
          <span class="chip-year">${champ.year}</span>
          <span class="chip-city">${champ.city}</span>
        </button>
      `;
    });

    navBar.innerHTML = html;

    // Bind click events
    const buttons = navBar.querySelectorAll('.year-chip-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const year = btn.getAttribute('data-year');
        if (year === 'default') {
          this.resetToDefaultTheme();
        } else {
          this.applyChampionsTheme(year);
        }
        if (window.valorantAudio) window.valorantAudio.playClick();
      });

      btn.addEventListener('mouseenter', () => {
        if (window.valorantAudio) window.valorantAudio.playHover();
      });
    });
  }

  applyChampionsTheme(year) {
    const data = this.championsData.find(c => c.year === year);
    if (!data) return;

    this.activeYear = year;
    const theme = data.theme;

    // Remove any previous theme class
    document.body.className = document.body.className.replace(/\btheme-champions-\S+/g, '').trim();
    document.body.classList.add(`theme-champions-${year}`);

    // Update Root CSS Custom Properties
    const root = document.documentElement;
    root.style.setProperty('--val-red', theme.primary);
    root.style.setProperty('--val-cyan', theme.secondary);
    root.style.setProperty('--val-dark', theme.bgDark);
    root.style.setProperty('--val-surface', theme.bgSurface);
    root.style.setProperty('--val-surface-card', theme.bgCard);
    root.style.setProperty('--val-red-glow', theme.glow);

    // Update navbar server pulse dot to Champions theme color
    const pingDot = document.getElementById('server-ping-dot');
    if (pingDot) {
      pingDot.style.background = theme.primary;
      pingDot.style.boxShadow = `0 0 10px ${theme.primary}`;
    }

    // Update canvas particle colors
    if (window.heroInteractive && window.heroInteractive.particles) {
      window.heroInteractive.particles.forEach(p => {
        p.color = Math.random() > 0.4 ? `${theme.primary}, ` : `${theme.secondary}, `;
      });
    }

    // Refresh year chips active state
    this.renderYearSelectors();

    // Render detailed view in the Champions section
    this.renderChampionsView(data);

    // Play Champions Anthem
    this.playChampionsAnthem(data);

    // Update Floating HUD Audio Bar
    this.updateAudioHudInfo(data);
  }

  resetToDefaultTheme() {
    this.activeYear = null;

    // Stop audio
    this.pauseChampionsAnthem();

    // Remove all theme classes
    document.body.className = document.body.className.replace(/\btheme-champions-\S+/g, '').trim();

    // Reset Root CSS properties
    const root = document.documentElement;
    root.style.setProperty('--val-red', '#ff4655');
    root.style.setProperty('--val-cyan', '#00f0ff');
    root.style.setProperty('--val-dark', '#0f1923');
    root.style.setProperty('--val-surface', '#131e28');
    root.style.setProperty('--val-surface-card', '#15222e');
    root.style.setProperty('--val-red-glow', 'rgba(255, 70, 85, 0.4)');

    // Reset navbar server ping dot
    const pingDot = document.getElementById('server-ping-dot');
    if (pingDot) {
      pingDot.style.background = '';
      pingDot.style.boxShadow = '';
    }

    // Re-render year chips
    this.renderYearSelectors();

    // Re-render default view in section
    this.renderChampionsView(this.championsData[0]);

    if (this.playerHud) {
      this.playerHud.classList.remove('active');
    }
  }

  renderChampionsView(data) {
    if (!this.container || !data) return;

    const origin = encodeURIComponent(window.location.origin);
    const widgetReferrer = encodeURIComponent(window.location.href);

    this.container.innerHTML = `
      <div class="champions-showcase-box theme-year-${data.year}">
        
        <!-- Left Trophy & Visual Column -->
        <div class="champ-visual-card">
          <div class="trophy-glow-halo" style="background: radial-gradient(circle, ${data.theme.glow} 0%, transparent 70%);"></div>
          
          <div class="trophy-watermark-icon">
            <svg viewBox="0 0 24 24" width="160" height="160" fill="${data.theme.primary}">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>

          <div class="trophy-badge-overlay">
            <span class="champ-tag-city">// ${data.country}</span>
            <h3 class="champ-big-year">${data.year}</h3>
            <span class="champ-venue-text">${data.venue}</span>
            <span class="champ-dates-text">${data.dates}</span>
          </div>

          <div class="champ-winner-banner" style="border-left: 4px solid ${data.theme.primary};">
            <div class="winner-title-label">WORLD CHAMPIONS</div>
            <div class="winner-team-name">${data.winner}</div>
            <div class="winner-score-line">Score: ${data.finalScore}</div>
            <div class="winner-mvp-tag">🏆 TOURNAMENT MVP: <strong>${data.mvp}</strong></div>
          </div>
        </div>

        <!-- Right Intel & Media Column -->
        <div class="champ-intel-card">
          
          <!-- Anthem Music & Video Deck -->
          <div class="anthem-deck-box" style="border-color: ${data.theme.primary};">
            <div class="anthem-meta-header">
              <div class="anthem-source-tabs">
                <button class="anthem-tab-btn ${this.mediaMode === 'audio' ? 'active' : ''}" id="tab-audio-mode" style="${this.mediaMode === 'audio' ? `background: ${data.theme.primary}; color: #000; border-color: ${data.theme.primary};` : ''}">
                  <span>♫ STUDIO AUDIO (LOCAL)</span>
                </button>
                <button class="anthem-tab-btn ${this.mediaMode === 'video' ? 'active' : ''}" id="tab-video-mode" style="${this.mediaMode === 'video' ? `background: ${data.theme.primary}; color: #000; border-color: ${data.theme.primary};` : ''}">
                  <span>▶ MUSIC VIDEO (YT)</span>
                </button>
              </div>

              <div class="anthem-soundwaves ${this.isPlaying ? 'dancing' : ''}">
                <span class="wave-bar" style="background:${data.theme.primary}"></span>
                <span class="wave-bar" style="background:${data.theme.primary}"></span>
                <span class="wave-bar" style="background:${data.theme.primary}"></span>
                <span class="wave-bar" style="background:${data.theme.primary}"></span>
              </div>
            </div>

            <div class="anthem-track-info">
              <h4 class="anthem-song-title">"${data.anthemTitle}"</h4>
              <span class="anthem-artist-name">PERFORMED BY ${data.anthemArtist.toUpperCase()}</span>
            </div>

            <!-- Media Container: Audio Visualizer OR YouTube Embed -->
            <div class="anthem-embed-player-frame" id="anthem-media-container">
              ${this.mediaMode === 'audio' ? `
                <!-- Tactical Audio Visualizer Deck -->
                <div class="audio-stream-display" style="background: radial-gradient(circle at center, rgba(${data.theme.particles === 'gold' ? '229,184,66' : '0,240,255'}, 0.08) 0%, rgba(0,0,0,0.85) 100%);">
                  <div class="audio-viz-bars">
                    <span class="viz-bar"></span><span class="viz-bar"></span><span class="viz-bar"></span><span class="viz-bar"></span>
                    <span class="viz-bar"></span><span class="viz-bar"></span><span class="viz-bar"></span><span class="viz-bar"></span>
                    <span class="viz-bar"></span><span class="viz-bar"></span><span class="viz-bar"></span><span class="viz-bar"></span>
                  </div>
                  <div class="audio-stream-meta">
                    <span class="stream-status-badge" style="color: ${data.theme.primary};">// HIGH-FIDELITY STUDIO MASTER // HOST-SAFE ZERO LAG</span>
                    <div class="audio-timeline-wrap">
                      <span id="audio-time-current">0:00</span>
                      <div class="audio-progress-bar-track" id="audio-seek-track">
                        <div class="audio-progress-bar-fill" id="audio-progress-fill" style="background: ${data.theme.primary}; width: 0%;"></div>
                      </div>
                      <span id="audio-time-total">--:--</span>
                    </div>
                  </div>
                </div>
              ` : `
                <!-- Resilient YouTube Embed Frame with strict-origin-when-cross-origin referrerpolicy -->
                <iframe
                  id="anthem-media-iframe"
                  class="anthem-media-iframe"
                  src="https://www.youtube.com/embed/${data.youtubeId}?enablejsapi=1&origin=${origin}&widget_referrer=${widgetReferrer}&rel=0&modestbranding=1&playsinline=1"
                  title="Champions ${data.year} Official Anthem - ${data.anthemTitle}"
                  frameborder="0"
                  referrerpolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen>
                </iframe>
              `}
            </div>

            <!-- Action Controls Row -->
            <div class="anthem-action-row">
              <button class="anthem-play-toggle-btn" id="anthem-toggle-btn" style="background: ${data.theme.primary}; color: #000;">
                <span id="anthem-play-icon">${this.isPlaying ? '❚❚ PAUSE ANTHEM' : '▶ PLAY OFFICIAL ANTHEM'}</span>
              </button>

              <div class="anthem-volume-slider-wrap">
                <span class="volume-label">VOL</span>
                <input type="range" id="anthem-volume-slider" min="0" max="1" step="0.05" value="${this.volume}" class="anthem-volume-slider">
              </div>

              <a href="https://www.youtube.com/watch?v=${data.youtubeId}" target="_blank" rel="noopener noreferrer" class="anthem-yt-link">
                <span>WATCH ON YOUTUBE</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
              </a>
            </div>
          </div>

          <!-- Tournament Lore & Quote -->
          <blockquote class="champ-motto-quote" style="border-left-color: ${data.theme.primary};">
            <span class="motto-tag">MOTTO: "${data.motto}"</span>
            <p>${data.quote}</p>
          </blockquote>

          <p class="champ-history-summary">${data.summary}</p>

          <!-- Exclusive Skin Bundle Showcase -->
          <div class="champ-skin-bundle-box">
            <div class="bundle-header">
              <span class="bundle-title">// EXCLUSIVE COMMEMORATIVE BUNDLE: ${data.bundleName.toUpperCase()}</span>
              <span class="bundle-weapons">${data.weapons}</span>
            </div>
            <p class="bundle-aura-desc">
              <span class="aura-star" style="color: ${data.theme.primary};">★</span>
              ${data.skinAura}
            </p>
          </div>

        </div>

      </div>
    `;

    // Bind Mode Switcher Tabs
    const audioTab = document.getElementById('tab-audio-mode');
    const videoTab = document.getElementById('tab-video-mode');

    if (audioTab) {
      audioTab.addEventListener('click', () => {
        this.mediaMode = 'audio';
        this.renderChampionsView(data);
        if (this.isPlaying) {
          this.playAudioTrack(data);
        }
      });
    }

    if (videoTab) {
      videoTab.addEventListener('click', () => {
        this.mediaMode = 'video';
        // Pause background audio when switching to video
        if (this.audio) this.audio.pause();
        this.renderChampionsView(data);
      });
    }

    // Bind Anthem Play/Pause toggle inside section
    const playBtn = document.getElementById('anthem-toggle-btn');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (this.isPlaying) {
          this.pauseChampionsAnthem();
        } else {
          this.playChampionsAnthem(data);
        }
      });
    }

    // Bind Volume Slider
    const volSlider = document.getElementById('anthem-volume-slider');
    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        this.volume = parseFloat(e.target.value);
        if (this.audio) this.audio.volume = this.volume;
      });
    }

    // Bind Scrubber / Seek
    const seekTrack = document.getElementById('audio-seek-track');
    if (seekTrack) {
      seekTrack.addEventListener('click', (e) => {
        if (this.audio && this.audio.duration) {
          const rect = seekTrack.getBoundingClientRect();
          const pos = (e.clientX - rect.left) / rect.width;
          this.audio.currentTime = pos * this.audio.duration;
        }
      });
    }
  }

  playChampionsAnthem(data) {
    if (!data) return;

    if (this.mediaMode === 'audio') {
      this.playAudioTrack(data);
    } else {
      // If in video mode, attempt YouTube playback via postMessage
      const iframe = document.getElementById('anthem-media-iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      }
      this.setPlayingState(true);
    }

    this.updateAudioHudInfo(data);
  }

  playAudioTrack(data) {
    if (!data) return;
    const trackSrc = data.audioFile || data.audioStreamUrl;
    if (!trackSrc) return;

    // Check if new track needs to be loaded
    const resolvedSrc = new URL(trackSrc, window.location.href).href;
    if (this.audio.src !== resolvedSrc) {
      this.audio.src = trackSrc;
      this.audio.load();
    }

    this.audio.play().then(() => {
      this.setPlayingState(true);
    }).catch(err => {
      console.warn('Audio auto-play policy restriction or play error:', err);
      // Fallback to stream if local fails
      if (data.audioStreamUrl && trackSrc !== data.audioStreamUrl) {
        this.audio.src = data.audioStreamUrl;
        this.audio.play().then(() => this.setPlayingState(true)).catch(e => console.warn('Stream fallback error', e));
      }
    });
  }

  pauseChampionsAnthem() {
    if (this.audio) {
      this.audio.pause();
    }

    // Also pause YouTube video if in video mode
    const iframe = document.getElementById('anthem-media-iframe');
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      } catch (e) {}
    }

    this.setPlayingState(false);
  }

  updateProgress() {
    if (!this.audio || !this.audio.duration) return;

    const current = this.audio.currentTime || 0;
    const total = this.audio.duration || 0;
    const pct = (current / total) * 100;

    const fill = document.getElementById('audio-progress-fill');
    if (fill) fill.style.width = `${pct}%`;

    const curText = document.getElementById('audio-time-current');
    if (curText) curText.textContent = this.formatTime(current);

    const totalText = document.getElementById('audio-time-total');
    if (totalText) totalText.textContent = this.formatTime(total);
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  setPlayingState(playing) {
    this.isPlaying = playing;

    // Update section play button
    const playIcon = document.getElementById('anthem-play-icon');
    if (playIcon) {
      playIcon.textContent = playing ? '❚❚ PAUSE ANTHEM' : '▶ PLAY OFFICIAL ANTHEM';
    }

    // Update dancing soundwaves
    const waves = document.querySelectorAll('.anthem-soundwaves');
    waves.forEach(w => w.classList.toggle('dancing', playing));

    // Update visualizer bars in audio stream mode
    const vizContainer = document.querySelector('.audio-stream-display');
    if (vizContainer) {
      vizContainer.classList.toggle('playing', playing);
    }

    // Update Floating HUD
    if (this.playerHud) {
      this.playerHud.classList.toggle('is-playing', playing);
      const hudBtn = document.getElementById('hud-play-btn');
      if (hudBtn) {
        hudBtn.innerHTML = playing 
          ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
          : '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
      }
    }
  }

  createAudioHud() {
    // Avoid duplicate creation
    if (document.getElementById('champions-floating-hud-player')) return;

    const hud = document.createElement('div');
    hud.id = 'champions-floating-hud-player';
    hud.className = 'champions-floating-hud-player';
    hud.innerHTML = `
      <div class="hud-audio-inner">
        <div class="hud-now-playing">
          <div class="hud-equalizer">
            <span></span><span></span><span></span><span></span>
          </div>
          <div class="hud-track-meta">
            <span class="hud-status-tag">CHAMPIONS ANTHEM STREAM</span>
            <span class="hud-track-title" id="hud-track-title">CHAMPIONS 2021: DIE FOR YOU</span>
          </div>
        </div>

        <div class="hud-player-controls">
          <button id="hud-play-btn" class="hud-btn-circle" title="Play / Pause Anthem">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </button>
          
          <div class="hud-quick-years">
            <button class="hud-year-btn" data-year="2021">2021</button>
            <button class="hud-year-btn" data-year="2022">2022</button>
            <button class="hud-year-btn" data-year="2023">2023</button>
            <button class="hud-year-btn" data-year="2024">2024</button>
            <button class="hud-year-btn" data-year="2025">2025</button>
            <button class="hud-year-btn" data-year="2026">2026</button>
          </div>

          <button id="hud-close-btn" class="hud-btn-close" title="Reset to Default Protocol">&times;</button>
        </div>
      </div>
    `;

    document.body.appendChild(hud);
    this.playerHud = hud;

    // Bind HUD controls
    const playBtn = document.getElementById('hud-play-btn');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (this.isPlaying) {
          this.pauseChampionsAnthem();
        } else {
          const currentData = this.championsData.find(c => c.year === this.activeYear) || this.championsData[0];
          this.applyChampionsTheme(currentData.year);
        }
      });
    }

    const closeBtn = document.getElementById('hud-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.resetToDefaultTheme();
      });
    }

    const yearBtns = hud.querySelectorAll('.hud-year-btn');
    yearBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const year = btn.getAttribute('data-year');
        this.applyChampionsTheme(year);
      });
    });
  }

  updateAudioHudInfo(data) {
    if (!this.playerHud || !data) return;
    this.playerHud.classList.add('active');

    const titleEl = document.getElementById('hud-track-title');
    if (titleEl) {
      titleEl.textContent = `CHAMPIONS ${data.year} // ${data.anthemTitle.toUpperCase()} (${data.anthemArtist.toUpperCase()})`;
    }

    // Highlight active year in HUD
    const hudYearBtns = this.playerHud.querySelectorAll('.hud-year-btn');
    hudYearBtns.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-year') === data.year);
    });
  }
}

// Auto instantiate
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.championsManager = new ValorantChampionsManager();
  });
} else {
  window.championsManager = new ValorantChampionsManager();
}
