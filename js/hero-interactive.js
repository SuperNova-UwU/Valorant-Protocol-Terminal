/**
 * VALORANT PROTOCOL // HERO SECTION & INTERACTIVE PROTOCOLS
 * Features:
 * 1. Interactive Spike Plant & Defuse tactical mini-game simulator with audio!
 * 2. Tactical Radianite background particle canvas.
 * 3. Audio toggle & navbar status indicators.
 * 4. Smooth section navigation & scroll spy.
 */

class ValorantHeroInteractive {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    // Spike Simulator State
    this.spikeState = 'IDLE'; // 'IDLE' | 'PLANTING' | 'PLANTED' | 'DEFUSING' | 'DEFUSED' | 'DETONATED'
    this.spikeTimer = null;
    this.spikeTimeRemaining = 45; // 45 seconds round timer
    this.plantProgress = 0;
    this.defuseProgress = 0;

    this.init();
  }

  init() {
    this.initCanvas();
    this.initSpikeSimulator();
    this.initAudioNavbarToggle();
    this.initServerSelector();
    this.initMobileDrawer();
    this.initSmoothNavigation();
  }

  // --- 1. Radianite Particle Canvas ---
  initCanvas() {
    this.canvas = document.getElementById('radianite-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    // Create 45 tactical Radianite particles
    for (let i = 0; i < 45; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 3 + 1.5,
        speedX: (Math.random() - 0.5) * 0.6,
        speedY: (Math.random() - 0.5) * 0.6,
        shape: Math.random() > 0.5 ? 'diamond' : 'cross',
        color: Math.random() > 0.4 ? 'rgba(0, 240, 255, ' : 'rgba(255, 70, 85, ',
        alpha: Math.random() * 0.6 + 0.2
      });
    }

    const animate = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw subtle tactical grid
      this.drawTacticalGrid();

      // Draw particles
      this.particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = this.canvas.width;
        if (p.x > this.canvas.width) p.x = 0;
        if (p.y < 0) p.y = this.canvas.height;
        if (p.y > this.canvas.height) p.y = 0;

        // Mouse avoidance or slight pull
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          p.x -= (dx / dist) * 1.5;
          p.y -= (dy / dist) * 1.5;
        }

        this.ctx.fillStyle = `${p.color}${p.alpha})`;
        this.ctx.strokeStyle = `${p.color}${p.alpha * 0.8})`;

        if (p.shape === 'diamond') {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y - p.size * 2);
          this.ctx.lineTo(p.x + p.size, p.y);
          this.ctx.lineTo(p.x, p.y + p.size * 2);
          this.ctx.lineTo(p.x - p.size, p.y);
          this.ctx.closePath();
          this.ctx.fill();
        } else {
          // Tactical Crosshair Cross
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x - p.size * 2, p.y);
          this.ctx.lineTo(p.x + p.size * 2, p.y);
          this.ctx.moveTo(p.x, p.y - p.size * 2);
          this.ctx.lineTo(p.x, p.y + p.size * 2);
          this.ctx.stroke();
        }
      });

      requestAnimationFrame(animate);
    };

    animate();
  }

  drawTacticalGrid() {
    const spacing = 80;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    this.ctx.lineWidth = 1;

    for (let x = 0; x < this.canvas.width; x += spacing) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.canvas.height; y += spacing) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  // --- 2. Interactive Spike Simulator ---
  initSpikeSimulator() {
    const actionBtn = document.getElementById('spike-action-btn');
    const resetBtn = document.getElementById('spike-reset-btn');
    const timerDisplay = document.getElementById('spike-timer-display');
    const statusText = document.getElementById('spike-status-text');
    const progressBar = document.getElementById('spike-sim-progress');

    if (!actionBtn) return;

    actionBtn.addEventListener('click', () => {
      if (window.valorantAudio) window.valorantAudio.playClick();

      if (this.spikeState === 'IDLE') {
        // Start Planting
        this.spikeState = 'PLANTING';
        actionBtn.disabled = true;
        statusText.textContent = 'PLANTING SPIKE (4.0s)...';
        statusText.className = 'spike-state-planting';

        let plantCount = 0;
        const plantInterval = setInterval(() => {
          plantCount += 100;
          const pct = Math.min(100, (plantCount / 4000) * 100);
          progressBar.style.width = `${pct}%`;

          if (window.valorantAudio && plantCount % 800 === 0) {
            window.valorantAudio.playBeep(440, 0.05, 'square');
          }

          if (plantCount >= 4000) {
            clearInterval(plantInterval);
            this.spikeState = 'PLANTED';
            this.spikeTimeRemaining = 45;
            actionBtn.disabled = false;
            actionBtn.innerHTML = '<span>DEFUSE SPIKE [HOLD]</span>';
            actionBtn.className = 'tactical-btn btn-defuse';
            statusText.textContent = 'SPIKE PLANTED // 45.0s TO DETONATION';
            statusText.className = 'spike-state-planted';
            progressBar.style.width = '100%';
            progressBar.style.backgroundColor = '#ff4655';
            this.startSpikeCountdown();
          }
        }, 100);
      } else if (this.spikeState === 'PLANTED') {
        // Trigger Defusal
        this.spikeState = 'DEFUSING';
        actionBtn.disabled = true;
        statusText.textContent = 'DEFUSING SPIKE (7.0s)...';
        statusText.className = 'spike-state-defusing';

        let defuseCount = 0;
        const defuseInterval = setInterval(() => {
          if (this.spikeState === 'DETONATED') {
            clearInterval(defuseInterval);
            return;
          }

          defuseCount += 100;
          const pct = Math.min(100, (defuseCount / 7000) * 100);
          progressBar.style.width = `${pct}%`;
          progressBar.style.backgroundColor = '#00f0ff';

          if (window.valorantAudio && defuseCount % 700 === 0) {
            window.valorantAudio.playBeep(780, 0.06, 'sine');
          }

          if (defuseCount >= 7000) {
            clearInterval(defuseInterval);
            clearInterval(this.spikeTimer);
            this.spikeState = 'DEFUSED';
            statusText.textContent = 'SPIKE DEFUSED // DEFENDERS WIN!';
            statusText.className = 'spike-state-defused';
            actionBtn.disabled = true;
            actionBtn.innerHTML = '<span>ROUND SECURED</span>';
            if (window.valorantAudio) {
              window.valorantAudio.playBeep(880, 0.2, 'triangle');
              setTimeout(() => window.valorantAudio.playBeep(1174, 0.35, 'triangle'), 150);
            }
          }
        }, 100);
      }
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        clearInterval(this.spikeTimer);
        this.spikeState = 'IDLE';
        this.spikeTimeRemaining = 45;
        actionBtn.disabled = false;
        actionBtn.innerHTML = '<span>PLANT SPIKE</span>';
        actionBtn.className = 'tactical-btn btn-plant';
        statusText.textContent = 'SPIKE READY // SITE UNCONTESTED';
        statusText.className = 'spike-state-idle';
        timerDisplay.textContent = '45.00s';
        progressBar.style.width = '0%';
        progressBar.style.backgroundColor = '#00f0ff';
        if (window.valorantAudio) window.valorantAudio.playClick();
      });
    }
  }

  startSpikeCountdown() {
    const timerDisplay = document.getElementById('spike-timer-display');
    const statusText = document.getElementById('spike-status-text');
    const actionBtn = document.getElementById('spike-action-btn');

    const startTime = performance.now();
    const duration = 45 * 1000;
    let lastBeep = 0;

    this.spikeTimer = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(0, (duration - elapsed) / 1000);
      this.spikeTimeRemaining = remaining;

      if (timerDisplay) {
        timerDisplay.textContent = `${remaining.toFixed(2)}s`;
      }

      // Procedural Spike Beep: accelerates as time ticks down!
      let beepInterval = 1000;
      if (remaining < 5) beepInterval = 120;
      else if (remaining < 10) beepInterval = 250;
      else if (remaining < 20) beepInterval = 450;
      else if (remaining < 30) beepInterval = 700;

      const now = performance.now();
      if (now - lastBeep >= beepInterval) {
        lastBeep = now;
        if (window.valorantAudio && this.spikeState !== 'DEFUSED') {
          const freq = remaining < 10 ? 1320 : 1046.5;
          window.valorantAudio.playSpikeBeep(freq);
        }
      }

      if (remaining <= 0 && this.spikeState !== 'DEFUSED') {
        clearInterval(this.spikeTimer);
        this.spikeState = 'DETONATED';
        if (statusText) {
          statusText.textContent = 'DETONATION // ATTACKERS WIN!';
          statusText.className = 'spike-state-detonated';
        }
        if (actionBtn) {
          actionBtn.disabled = true;
          actionBtn.innerHTML = '<span>DETONATED</span>';
        }
        if (window.valorantAudio) {
          window.valorantAudio.playBeep(120, 0.6, 'sawtooth');
        }
      }
    }, 50);
  }



  // --- 4. Audio Navbar Toggle ---
  initAudioNavbarToggle() {
    const audioBtn = document.getElementById('tactical-audio-toggle');
    if (!audioBtn) return;

    audioBtn.addEventListener('click', () => {
      if (window.valorantAudio) {
        const isEnabled = window.valorantAudio.toggleSound();
        audioBtn.classList.toggle('audio-muted', !isEnabled);
        const label = audioBtn.querySelector('.audio-label');
        if (label) {
          label.textContent = isEnabled ? 'AUDIO: ON' : 'AUDIO: MUTED';
        }
      }
    });
  }

  // --- 5. Global Riot Telemetry Server Selector ---
  initServerSelector() {
    this.servers = [
      { id: 'seoul', name: 'SEOUL', region: 'KR', ping: '14ms', status: 'OPTIMAL' },
      { id: 'tokyo', name: 'TOKYO', region: 'AP', ping: '22ms', status: 'OPTIMAL' },
      { id: 'singapore', name: 'SINGAPORE', region: 'SEA', ping: '31ms', status: 'GOOD' },
      { id: 'mumbai', name: 'MUMBAI', region: 'IN', ping: '28ms', status: 'GOOD' },
      { id: 'frankfurt', name: 'FRANKFURT', region: 'EU', ping: '19ms', status: 'OPTIMAL' },
      { id: 'london', name: 'LONDON', region: 'EU', ping: '24ms', status: 'OPTIMAL' },
      { id: 'virginia', name: 'N. VIRGINIA', region: 'NA', ping: '18ms', status: 'OPTIMAL' },
      { id: 'california', name: 'N. CALIFORNIA', region: 'NA', ping: '25ms', status: 'GOOD' },
      { id: 'saopaulo', name: 'SÃO PAULO', region: 'BR', ping: '34ms', status: 'GOOD' },
      { id: 'sydney', name: 'SYDNEY', region: 'OCE', ping: '42ms', status: 'GOOD' }
    ];

    const wrap = document.getElementById('server-selector-wrap');
    const btn = document.getElementById('server-selector-btn');
    const menu = document.getElementById('server-dropdown-menu');
    const list = document.getElementById('server-nodes-list');
    const currentLabel = document.getElementById('server-current-label');
    const drawerServer = document.getElementById('drawer-server-text');
    if (!wrap || !btn || !menu || !list) return;

    let selectedId = localStorage.getItem('val_selected_server') || 'seoul';
    let activeServer = this.servers.find(s => s.id === selectedId) || this.servers[0];

    const updateDisplay = (server) => {
      if (currentLabel) currentLabel.textContent = `${server.name} // ${server.ping}`;
      if (drawerServer) drawerServer.textContent = `ACTIVE NODE: ${server.name} // ${server.ping}`;
      btn.title = `Riot Telemetry Node: ${server.name} (${server.region}) - ${server.ping} [${server.status}]`;
    };

    const renderList = () => {
      list.innerHTML = this.servers.map(server => `
        <button type="button" class="server-node-item ${server.id === activeServer.id ? 'active' : ''}" data-server-id="${server.id}">
          <span class="node-status-dot ${server.status === 'OPTIMAL' ? 'dot-optimal' : 'dot-good'}"></span>
          <div class="node-info">
            <span class="node-city">${server.name} <span class="node-reg">(${server.region})</span></span>
            <span class="node-tier">${server.status}</span>
          </div>
          <span class="node-ping-val">${server.ping}</span>
        </button>
      `).join('');

      list.querySelectorAll('.server-node-item').forEach(item => {
        item.addEventListener('click', () => {
          const sid = item.getAttribute('data-server-id');
          const found = this.servers.find(s => s.id === sid);
          if (found) {
            activeServer = found;
            localStorage.setItem('val_selected_server', sid);
            updateDisplay(activeServer);
            renderList();
            closeDropdown();
            if (window.valorantAudio) window.valorantAudio.playClick();
          }
        });
      });
    };

    const openDropdown = () => {
      wrap.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    };

    const closeDropdown = () => {
      wrap.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    };

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = wrap.classList.contains('is-open');
      if (isOpen) {
        closeDropdown();
      } else {
        openDropdown();
        if (window.valorantAudio) window.valorantAudio.playHover();
      }
    });

    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) {
        closeDropdown();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDropdown();
    });

    updateDisplay(activeServer);
    renderList();
  }

  // --- 6. Tactical Mobile & Tablet Navigation Drawer ---
  initMobileDrawer() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const drawer = document.getElementById('mobile-nav-drawer');
    const backdrop = document.getElementById('mobile-drawer-backdrop');
    const closeBtn = document.getElementById('drawer-close-btn');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    const drawerAudioBtn = document.getElementById('mobile-drawer-audio-toggle');
    const navbarAudioBtn = document.getElementById('tactical-audio-toggle');

    if (!toggleBtn || !drawer) return;

    const openDrawer = () => {
      drawer.classList.add('is-open');
      toggleBtn.classList.add('is-active');
      toggleBtn.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (window.lenis) window.lenis.stop();
      if (window.valorantAudio) window.valorantAudio.playClick();
    };

    const closeDrawer = () => {
      drawer.classList.remove('is-open');
      toggleBtn.classList.remove('is-active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (window.lenis) window.lenis.start();
    };

    toggleBtn.addEventListener('click', () => {
      if (drawer.classList.contains('is-open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    if (backdrop) backdrop.addEventListener('click', closeDrawer);
    if (closeBtn) closeBtn.addEventListener('click', () => {
      closeDrawer();
      if (window.valorantAudio) window.valorantAudio.playClick();
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href')?.replace('#', '');
        const targetSection = document.getElementById(targetId);
        closeDrawer();
        if (targetSection) {
          e.preventDefault();
          setTimeout(() => {
            if (window.lenis) {
              window.lenis.scrollTo(targetSection, { offset: -70 });
            } else {
              targetSection.scrollIntoView({ behavior: 'smooth' });
            }
          }, 250);
          if (window.valorantAudio) window.valorantAudio.playClick();
        }
      });
    });

    if (drawerAudioBtn) {
      drawerAudioBtn.addEventListener('click', () => {
        if (window.valorantAudio) {
          const isEnabled = window.valorantAudio.toggleSound();
          drawerAudioBtn.classList.toggle('audio-muted', !isEnabled);
          const drawerLabel = drawerAudioBtn.querySelector('span');
          if (drawerLabel) drawerLabel.textContent = isEnabled ? 'AUDIO: ON' : 'AUDIO: MUTED';
          if (navbarAudioBtn) {
            navbarAudioBtn.classList.toggle('audio-muted', !isEnabled);
            const label = navbarAudioBtn.querySelector('.audio-label');
            if (label) label.textContent = isEnabled ? 'AUDIO: ON' : 'AUDIO: MUTED';
          }
        }
      });
    }
  }

  // --- 7. Smooth Nav Scrolling & Section Active Spy ---
  initSmoothNavigation() {
    const navLinks = document.querySelectorAll('.tactical-nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href')?.replace('#', '');
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          e.preventDefault();
          if (window.lenis) {
            window.lenis.scrollTo(targetSection, { offset: -70 });
          } else {
            targetSection.scrollIntoView({ behavior: 'smooth' });
          }
          if (window.valorantAudio) window.valorantAudio.playClick();
        }
      });
      link.addEventListener('mouseenter', () => {
        if (window.valorantAudio) window.valorantAudio.playHover();
      });
    });

    // Section scroll spy
    const sections = ['home', 'agents', 'lineup-lab', 'economy-sim', 'champions', 'dev-diaries', 'contact'];
    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + 200;
      sections.forEach(id => {
        const el = document.getElementById(id);
        const link = document.querySelector(`.tactical-nav-link[href="#${id}"]`);
        if (el && link) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
          }
        }
      });
    }, { passive: true });
  }
}

// Auto init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.heroInteractive = new ValorantHeroInteractive();
  });
} else {
  window.heroInteractive = new ValorantHeroInteractive();
}
