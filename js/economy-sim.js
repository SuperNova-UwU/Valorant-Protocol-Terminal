/**
 * VALORANT PROTOCOL // TACTICAL ECONOMY & BUY CALCULATOR
 * Real-time buy phase terminal, 5-man team roster bankroll management, loss streak tracker,
 * round progression simulator, competitive match rules (Halftime, Overtime, 13-round win condition),
 * and pro competitive economy advisor.
 */

class TacticalEconomySimulator {
  constructor() {
    this.data = window.VALORANT_ECONOMY_DATA || {};
    this.roster = JSON.parse(JSON.stringify(this.data.defaultRoster || []));
    this.activePlayerId = 1;
    this.activeCategory = 'all'; // 'all', 'sidearm', 'smg-shotgun', 'rifle', 'sniper-heavy'
    
    // Official Valorant Competitive Match State
    this.roundNumber = 1;      // Starts at Pistol Round 1
    this.teamScore = 0;        // User's team score (target 13)
    this.enemyScore = 0;       // Opponent team score
    this.currentSide = 'ATTACK'; // 'ATTACK' | 'DEFENSE' (swaps at Halftime)
    this.lossStreak = 0;       // 0 = 1st loss ($1900), 1 = 2nd loss ($2400), 2 = 3+ losses ($2900)
    this.spikePlanted = false;
    this.roundOutcome = 'win'; // 'win' | 'loss'
    this.isMatchOver = false;
    this.matchWinner = null;   // 'TEAM' | 'ENEMY'
    this.isHalftimeEvent = false;
    this.isOvertime = false;
    this.lastExecutionLog = null;

    this.container = null;
    this.init();
  }

  init() {
    this.container = document.getElementById('economy-sim-content');
    if (!this.container) return;

    // Start roster with Pistol Round 1 economy (800 Creds)
    this.applyScenarioPreset('pistol-r1');
    this.render();
  }

  getActivePlayer() {
    return this.roster.find(p => p.id === this.activePlayerId) || this.roster[0];
  }

  getWeapon(id) {
    return this.data.weapons.find(w => w.id === id) || this.data.weapons[0];
  }

  getShield(id) {
    return this.data.shields.find(s => s.id === id) || this.data.shields[0];
  }

  // Calculate current financial specs for a player
  calculatePlayerFinance(player) {
    const weapon = this.getWeapon(player.weaponId);
    const shield = this.getShield(player.shieldId);
    const utilCost = (player.utilCharges || 0) * 200;
    const totalSpend = weapon.cost + shield.cost + utilCost;
    const remainingCreds = Math.max(0, player.creds - totalSpend);
    const isOverBudget = totalSpend > player.creds;

    // In Overtime, all players automatically receive 5,000 Creds
    let minNextRoundCreds;
    if (this.isOvertime) {
      minNextRoundCreds = this.data.constants.OVERTIME_CREDS;
    } else if (this.roundNumber === 12) {
      // Round 12 is followed by Halftime reset to 800
      minNextRoundCreds = this.data.constants.START_CREDS;
    } else {
      const lossReward = this.data.constants.LOSS_STREAK_REWARDS[Math.min(this.lossStreak, 2)];
      const plantBonus = this.spikePlanted ? this.data.constants.SPIKE_PLANT_BONUS : 0;
      minNextRoundCreds = Math.min(this.data.constants.MAX_CREDS, remainingCreds + lossReward + plantBonus);
    }

    const isNextSafe = minNextRoundCreds >= this.data.constants.FULL_BUY_MIN_CREDS;

    return {
      weapon,
      shield,
      utilCost,
      totalSpend,
      remainingCreds,
      isOverBudget,
      minNextRoundCreds,
      isNextSafe
    };
  }

  // Calculate team-wide financial analytics
  calculateTeamAnalytics() {
    let totalBank = 0;
    let totalSpend = 0;
    let totalNextMin = 0;
    let fullBuyCount = 0;
    let ecoCount = 0;

    this.roster.forEach(p => {
      totalBank += p.creds;
      const fin = this.calculatePlayerFinance(p);
      totalSpend += fin.totalSpend;
      totalNextMin += fin.minNextRoundCreds;
      if (fin.weapon.cost >= 2900 && fin.shield.cost === 1000) {
        fullBuyCount++;
      } else if (fin.totalSpend <= 1000) {
        ecoCount++;
      }
    });

    const avgCreds = Math.round(totalBank / this.roster.length);
    const avgSpend = Math.round(totalSpend / this.roster.length);

    // Classify Team Strategy
    let strategyClass = "MIXED BUY";
    let strategyBadgeColor = "#facc15";
    let advisorAdvice = "";
    let advisorTagline = "";

    if (this.roundNumber === 1 || this.roundNumber === 13) {
      strategyClass = "PISTOL ROUND";
      strategyBadgeColor = "#00f0ff";
      advisorTagline = "PISTOL PRECISION & EARLY ECONOMY SEEDING";
      advisorAdvice = "Ghost, Frenzy, or Light Shield with signature utility. Winning Round 1 secures an immediate Anti-Eco conversion and a 2-0 round tempo.";
    } else if (fullBuyCount >= 4) {
      strategyClass = "TEAM FULL BUY";
      strategyBadgeColor = "#10e3ac";
      advisorTagline = "MAXIMUM COMBAT POWER // TEMPO ADVANTAGE";
      advisorAdvice = "Team has deployed primary rifles (Vandal, Phantom, or Warden) and heavy armor. Coordinate site execution utilities and trade aggressively before enemy rounds recover.";
    } else if (ecoCount >= 4) {
      strategyClass = "FULL ECO / HARD SAVE";
      strategyBadgeColor = "#00f0ff";
      advisorTagline = "SACRIFICE ROUND // GUARANTEES NEXT ROUND VANDALS";
      advisorAdvice = "Keep investment under $1,000. Group up for cheeky Classic/Shorty corner traps. Avoid dying with expensive guns; save to lock down next round.";
    } else if (avgSpend >= 2000 && fullBuyCount < 3) {
      strategyClass = "HIGH-RISK FORCE BUY";
      strategyBadgeColor = "#ff4655";
      advisorTagline = "DESPERATION GAMBLE // DEFEAT WILL CAUSE DOUBLE-ECO";
      advisorAdvice = "Team is spending all available credits on SMGs and Bulldogs. Must secure opening pick or Spike plant to prevent financial ruin.";
    } else {
      strategyClass = "SEMI-BUY / HERO RIFLE";
      strategyBadgeColor = "#c084fc";
      advisorTagline = "ASYMMETRICAL ASSET ALLOCATION";
      advisorAdvice = "Top fraggers wield primary weapons while support players anchor with Light Shields and utility. Focus on dropping weapons to star players.";
    }

    return {
      totalBank,
      totalSpend,
      totalNextMin,
      avgCreds,
      avgSpend,
      strategyClass,
      strategyBadgeColor,
      advisorTagline,
      advisorAdvice
    };
  }

  render() {
    const activePlayer = this.getActivePlayer();
    const activeFin = this.calculatePlayerFinance(activePlayer);
    const team = this.calculateTeamAnalytics();

    // Check Match Phase
    let matchPhaseLabel = "REGULATION // FIRST HALF";
    if (this.isOvertime) {
      matchPhaseLabel = "OVERTIME // WIN BY 2";
    } else if (this.roundNumber === 13) {
      matchPhaseLabel = "HALFTIME PISTOL // SECOND HALF";
    } else if (this.roundNumber > 12) {
      matchPhaseLabel = "REGULATION // SECOND HALF";
    }

    // Match point status
    const isMatchPointTeam = this.teamScore === 12 && this.enemyScore < 12;
    const isMatchPointEnemy = this.enemyScore === 12 && this.teamScore < 12;

    // Filtered weapon catalog
    let filteredWeapons = this.data.weapons || [];
    if (this.activeCategory !== 'all') {
      if (this.activeCategory === 'smg-shotgun') {
        filteredWeapons = filteredWeapons.filter(w => w.category === 'smg' || w.category === 'shotgun');
      } else if (this.activeCategory === 'sniper-heavy') {
        filteredWeapons = filteredWeapons.filter(w => w.category === 'sniper' || w.category === 'heavy');
      } else {
        filteredWeapons = filteredWeapons.filter(w => w.category === this.activeCategory);
      }
    }

    this.container.innerHTML = `
      <div class="economy-sim-wrapper">

        <!-- Top Header: Match Scoreboard & Tournament HUD -->
        <div class="econ-hud-header">
          
          <!-- Match Scoreboard Display -->
          <div class="econ-scoreboard-box">
            <div class="match-score-row">
              <div class="score-team score-allies">
                <span class="score-team-tag">YOUR TEAM [${this.currentSide}]</span>
                <span class="score-num ${this.teamScore > this.enemyScore ? 'score-leading' : ''}">${this.teamScore}</span>
              </div>
              <div class="score-vs-divider">
                <span class="score-vs-tag">VS</span>
                <span class="match-round-tag">ROUND ${this.roundNumber} / 24</span>
              </div>
              <div class="score-team score-enemies">
                <span class="score-num ${this.enemyScore > this.teamScore ? 'score-leading' : ''}">${this.enemyScore}</span>
                <span class="score-team-tag">OPPONENT [${this.currentSide === 'ATTACK' ? 'DEFENSE' : 'ATTACK'}]</span>
              </div>
            </div>

            <!-- Score Alert Badges -->
            <div class="score-alerts-row">
              <span class="match-phase-badge">${matchPhaseLabel}</span>
              ${isMatchPointTeam ? `<span class="match-point-badge team-mp">🎯 MATCH POINT (YOUR TEAM)</span>` : ''}
              ${isMatchPointEnemy ? `<span class="match-point-badge enemy-mp">⚠ MATCH POINT (OPPONENT)</span>` : ''}
              ${this.isOvertime ? `<span class="match-point-badge ot-badge">⚡ OVERTIME ($5,000 PER ROUND)</span>` : ''}
            </div>
          </div>

          <!-- Team Bankroll Overview -->
          <div class="econ-team-metrics-bar">
            <div class="econ-metric-cell">
              <span class="em-label">TOTAL TEAM BANK</span>
              <span class="em-value val-creds">¤ ${team.totalBank.toLocaleString()}</span>
            </div>
            <div class="econ-metric-cell">
              <span class="em-label">AVG PLAYER CREDS</span>
              <span class="em-value">¤ ${team.avgCreds.toLocaleString()}</span>
            </div>
            <div class="econ-metric-cell">
              <span class="em-label">CURRENT STRATEGY</span>
              <span class="em-value" style="color: ${team.strategyBadgeColor};">${team.strategyClass}</span>
            </div>
            <button id="reset-match-btn" class="tactical-btn tactical-btn-outline reset-match-pill" title="Reset match to Round 1">
              <span>↺ RESET MATCH</span>
            </button>
          </div>
        </div>

        <!-- Halftime Event Banner (Dismissible) -->
        ${this.isHalftimeEvent ? `
          <div class="halftime-event-banner">
            <div class="halftime-content">
              <span class="ht-icon">🔄</span>
              <div>
                <h4>HALFTIME SIDE SWAP // PISTOL ROUND 2</h4>
                <p>Teams have swapped sides! You are now on <strong>${this.currentSide}</strong>. All player economies have reset to starting <strong>¤ 800 Creds</strong>.</p>
              </div>
            </div>
            <button id="dismiss-halftime-btn" class="tactical-btn"><span>ACKNOWLEDGE & BUY</span></button>
          </div>
        ` : ''}

        <!-- Match Over Celebration Card -->
        ${this.isMatchOver ? `
          <div class="match-over-banner ${this.matchWinner === 'TEAM' ? 'banner-victory' : 'banner-defeat'}">
            <div class="mob-header">
              <span class="mob-icon">${this.matchWinner === 'TEAM' ? '🏆' : '💀'}</span>
              <h3 class="mob-title">MATCH ${this.matchWinner === 'TEAM' ? 'VICTORY' : 'DEFEAT'} // FINAL SCORE ${this.teamScore} - ${this.enemyScore}</h3>
              <p class="mob-sub">${this.matchWinner === 'TEAM' ? 'Outstanding tactical execution and economic management.' : 'Opponent broke economic momentum. Review economy save points.'}</p>
            </div>
            <button id="restart-match-btn" class="tactical-btn"><span>START NEW COMPETITIVE SCRIM (ROUND 1)</span></button>
          </div>
        ` : ''}

        <!-- Jump to Scenario Bar -->
        <div class="econ-presets-bar">
          <span class="preset-bar-label">JUMP TO MATCH SCENARIOS:</span>
          <div class="preset-buttons-row">
            <button class="econ-preset-btn scenario-btn" data-scenario="pistol-r1">
              <span class="btn-preset-name">ROUND 1: PISTOL</span>
              <span class="btn-preset-sub">¤800 START (0 - 0)</span>
            </button>
            <button class="econ-preset-btn scenario-btn" data-scenario="full-buy-r3">
              <span class="btn-preset-name">ROUND 3: FULL BUY</span>
              <span class="btn-preset-sub">¤4,200 BANK (2 - 0)</span>
            </button>
            <button class="econ-preset-btn scenario-btn" data-scenario="pre-halftime-r12">
              <span class="btn-preset-name">ROUND 12: LAST HALF</span>
              <span class="btn-preset-sub">SWAP NEXT (7 - 5)</span>
            </button>
            <button class="econ-preset-btn scenario-btn" data-scenario="halftime-r13">
              <span class="btn-preset-name">ROUND 13: HALFTIME</span>
              <span class="btn-preset-sub">¤800 PISTOL 2 (7 - 5)</span>
            </button>
            <button class="econ-preset-btn scenario-btn" data-scenario="match-point">
              <span class="btn-preset-name">ROUND 24: MATCH PT</span>
              <span class="btn-preset-sub">DECIDER (12 - 11)</span>
            </button>
            <button class="econ-preset-btn scenario-btn" data-scenario="overtime">
              <span class="btn-preset-name">OVERTIME (12 - 12)</span>
              <span class="btn-preset-sub">¤5,000 OT RULE</span>
            </button>
          </div>
        </div>

        <!-- Main 2-Column Grid: Left Roster & Simulator / Right Buy Wheel Shop -->
        <div class="econ-main-grid">

          <!-- Left Column: 5-Player Team Roster & Round Simulator -->
          <div class="econ-roster-column">

            <!-- 5-Man Team Roster Cards -->
            <div class="roster-panel-card">
              <div class="panel-header-row">
                <span class="panel-tag">// 5-MAN OPERATIVE ROSTER</span>
                <span class="panel-sub">SELECT AGENT TO CONFIGURE LOADOUT</span>
              </div>

              <div class="roster-players-list">
                ${this.roster.map(p => {
                  const fin = this.calculatePlayerFinance(p);
                  const isSelected = p.id === this.activePlayerId;
                  return `
                    <div class="roster-player-item ${isSelected ? 'active-player' : ''}" data-player-id="${p.id}">
                      <div class="player-left-col">
                        <span class="player-num">P${p.id}</span>
                        <div class="player-identity">
                          <span class="player-agent-name">${p.name}</span>
                          <span class="player-agent-role">${p.role}</span>
                        </div>
                      </div>

                      <!-- Current Equipped Equipment Mini -->
                      <div class="player-equipped-mini">
                        <div class="mini-gun-badge">
                          <img src="${fin.weapon.icon}" alt="${fin.weapon.name}" />
                          <span>${fin.weapon.name}</span>
                        </div>
                        <div class="mini-shield-badge badge-shield-${fin.shield.id}">
                          ${fin.shield.id === 'none' ? 'NO SHIELD' : (fin.shield.id === 'light' ? 'LIGHT (+25)' : 'HEAVY (+50)')}
                        </div>
                      </div>

                      <!-- Financial Specs & Min Next -->
                      <div class="player-creds-col">
                        <div class="creds-current-row">
                          <span class="creds-label">BANK:</span>
                          <span class="creds-val val-creds">¤ ${p.creds}</span>
                        </div>
                        <div class="creds-next-row ${fin.isNextSafe ? 'safe-next' : 'unsafe-next'}">
                          <span class="next-tag">MIN NEXT: ¤ ${fin.minNextRoundCreds}</span>
                          <span class="next-status">${fin.isNextSafe ? '✔ SAFE' : '⚠ UNSTABLE'}</span>
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Pro Tactical Advisor Engine Banner -->
            <div class="econ-advisor-card" style="border-left-color: ${team.strategyBadgeColor};">
              <div class="advisor-head">
                <span class="advisor-icon">⚡</span>
                <div>
                  <span class="card-kicker">// PRO ECONOMY ADVISOR ENGINE</span>
                  <h4 class="advisor-title">${team.strategyClass} // ${team.advisorTagline}</h4>
                </div>
              </div>
              <p class="advisor-text">${team.advisorAdvice}</p>
              <div class="advisor-metrics-sub">
                <span class="adv-sub-pill">FULL BUY LINE: ¤ 3,900</span>
                <span class="adv-sub-pill">CURRENT TEAM SPEND: ¤ ${team.totalSpend.toLocaleString()}</span>
                <span class="adv-sub-pill">GUARANTEED NEXT BANK: ¤ ${team.totalNextMin.toLocaleString()}</span>
              </div>
            </div>

            <!-- Round Outcome Simulator Card -->
            <div class="econ-outcome-simulator-card">
              <div class="panel-header-row">
                <span class="panel-tag">// ROUND PROGRESSION SIMULATOR</span>
                <span class="panel-sub">SIMULATE WIN/LOSS & REWARD ADVANCEMENT</span>
              </div>

              <div class="sim-controls-grid">
                <!-- Result Toggle (Win vs Loss) -->
                <div class="sim-ctrl-group">
                  <label class="sim-label">ROUND OUTCOME:</label>
                  <div class="sim-toggle-pill">
                    <button class="sim-toggle-btn ${this.roundOutcome === 'win' ? 'active-win' : ''}" data-outcome="win">
                      <span>🏆 VICTORY (+¤3000)</span>
                    </button>
                    <button class="sim-toggle-btn ${this.roundOutcome === 'loss' ? 'active-loss' : ''}" data-outcome="loss">
                      <span>💀 DEFEAT</span>
                    </button>
                  </div>
                </div>

                <!-- Loss Streak Level Selector (Hidden in OT) -->
                ${!this.isOvertime ? `
                  <div class="sim-ctrl-group">
                    <label class="sim-label">CONSECUTIVE LOSS STREAK:</label>
                    <div class="loss-streak-meters">
                      <button class="loss-tier-btn ${this.lossStreak === 0 ? 'active' : ''}" data-streak="0">
                        <span>1ST LOSS</span>
                        <span class="tier-creds">+¤1,900</span>
                      </button>
                      <button class="loss-tier-btn ${this.lossStreak === 1 ? 'active' : ''}" data-streak="1">
                        <span>2ND LOSS</span>
                        <span class="tier-creds">+¤2,400</span>
                      </button>
                      <button class="loss-tier-btn ${this.lossStreak >= 2 ? 'active' : ''}" data-streak="2">
                        <span>3+ LOSSES (MAX)</span>
                        <span class="tier-creds">+¤2,900</span>
                      </button>
                    </div>
                  </div>
                ` : `
                  <div class="ot-creds-notice">
                    <span>⚡ OVERTIME IN EFFECT: Each player receives a fixed <strong>¤ 5,000 Creds</strong> each round.</span>
                  </div>
                `}

                <!-- Spike Plant Bonus & Kills Per Player -->
                <div class="sim-ctrl-group sim-row-options">
                  <label class="spike-plant-checkbox">
                    <input type="checkbox" id="spike-plant-toggle" ${this.spikePlanted ? 'checked' : ''} />
                    <span>SPIKE PLANTED (+¤300 TO ALL ATTACKERS)</span>
                  </label>

                  <div class="kills-quick-selector">
                    <span class="kills-label">KILLS THIS ROUND (P${activePlayer.id}):</span>
                    <div class="kills-stepper">
                      <button class="kill-btn-step" data-step="-1">-</button>
                      <span class="kill-count-val">${activePlayer.kills || 0}</span>
                      <button class="kill-btn-step" data-step="1">+</button>
                      <span class="kill-bonus-val">(+¤${(activePlayer.kills || 0) * 200})</span>
                    </div>
                  </div>
                </div>

                <!-- Execute Round Button -->
                <button id="execute-round-btn" class="tactical-btn execute-sim-btn" ${this.isMatchOver ? 'disabled' : ''}>
                  <span>${this.isMatchOver ? 'MATCH CONCLUDED' : '▶ EXECUTE ROUND & ADVANCE >>'}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>

              <!-- Simulation Telemetry Receipt Log -->
              ${this.lastExecutionLog ? `
                <div class="sim-telemetry-receipt">
                  <div class="receipt-head">
                    <span class="receipt-title">> ROUND ${this.lastExecutionLog.prevRound} COMPLETE // RESULT: ${this.lastExecutionLog.outcome}</span>
                    <span class="receipt-timestamp">${new Date().toLocaleTimeString()}</span>
                  </div>
                  <div class="receipt-grid">
                    <div>BASE REWARD: <strong style="color: var(--val-cyan);">+¤${this.lastExecutionLog.reward}</strong></div>
                    <div>SPIKE BONUS: <strong style="color: #facc15;">+¤${this.lastExecutionLog.spikeBonus}</strong></div>
                    <div>NEW SCORE: <strong style="color: #10e3ac;">${this.teamScore} - ${this.enemyScore}</strong></div>
                  </div>
                </div>
              ` : ''}

            </div>

          </div>

          <!-- Right Column: Interactive Buy Phase Terminal (Active Player Shop) -->
          <div class="econ-store-column">

            <div class="store-terminal-card">
              
              <!-- Store Header for Active Player -->
              <div class="store-header">
                <div class="store-player-status">
                  <span class="store-player-title">BUY TERMINAL // ${activePlayer.name.toUpperCase()} (P${activePlayer.id})</span>
                  <div class="store-bank-balance">
                    <span class="bank-label">STARTING BANK:</span>
                    <div class="bank-adjuster">
                      <button class="btn-adjust-creds" data-delta="-500">-500</button>
                      <span class="val-creds-large val-creds">¤ ${activePlayer.creds}</span>
                      <button class="btn-adjust-creds" data-delta="500">+500</button>
                    </div>
                  </div>
                </div>

                <!-- Live Purchase Cart Calculation Box -->
                <div class="store-cart-summary ${activeFin.isOverBudget ? 'cart-overbudget' : ''}">
                  <div class="cart-metric">
                    <span class="cm-label">TOTAL SPEND</span>
                    <span class="cm-val cm-spend">- ¤ ${activeFin.totalSpend}</span>
                  </div>
                  <div class="cart-metric">
                    <span class="cm-label">REMAINING CREDS</span>
                    <span class="cm-val ${activeFin.isOverBudget ? 'val-danger' : 'val-creds'}">¤ ${activeFin.remainingCreds}</span>
                  </div>
                  <div class="cart-metric metric-next ${activeFin.isNextSafe ? 'status-safe' : 'status-danger'}">
                    <span class="cm-label">MIN NEXT ROUND</span>
                    <span class="cm-val">¤ ${activeFin.minNextRoundCreds}</span>
                    <span class="cm-tag">${activeFin.isNextSafe ? '✔ GUARANTEED RIFLE' : '⚠ CANNOT FULL BUY'}</span>
                  </div>
                </div>
              </div>

              <!-- Store Category Filter Tabs -->
              <div class="store-category-tabs">
                <button class="store-cat-btn ${this.activeCategory === 'all' ? 'active' : ''}" data-cat="all">ALL WEAPONS</button>
                <button class="store-cat-btn ${this.activeCategory === 'sidearm' ? 'active' : ''}" data-cat="sidearm">SIDEARMS</button>
                <button class="store-cat-btn ${this.activeCategory === 'smg-shotgun' ? 'active' : ''}" data-cat="smg-shotgun">SMGS & SHOTGUNS</button>
                <button class="store-cat-btn ${this.activeCategory === 'rifle' ? 'active' : ''}" data-cat="rifle">RIFLES</button>
                <button class="store-cat-btn ${this.activeCategory === 'sniper-heavy' ? 'active' : ''}" data-cat="sniper-heavy">SNIPERS & HEAVY</button>
              </div>

              <!-- Weapon Items Grid -->
              <div class="store-weapons-grid">
                ${filteredWeapons.map(w => {
                  const isEquipped = activePlayer.weaponId === w.id;
                  const canAfford = activePlayer.creds >= w.cost;
                  const isWarden = w.id === 'warden';
                  return `
                    <div class="weapon-shop-card ${isEquipped ? 'is-equipped' : ''} ${!canAfford && !isEquipped ? 'cant-afford' : ''} ${isWarden ? 'is-new-weapon' : ''}" data-weapon-id="${w.id}">
                      <div class="w-card-header">
                        <span class="w-cat-tag">${w.categoryLabel} ${isWarden ? '★ NEW' : ''}</span>
                        <span class="w-cost-tag ${w.cost === 0 ? 'cost-free' : 'val-creds'}">
                          ${w.cost === 0 ? 'FREE' : '¤ ' + w.cost}
                        </span>
                      </div>

                      <div class="w-img-container">
                        <img src="${w.icon}" alt="${w.name}" draggable="false" />
                      </div>

                      <div class="w-card-info">
                        <h4 class="w-name">${w.name} ${isWarden ? '<span class="new-pill">NEW RIFLE</span>' : ''}</h4>
                        <div class="w-specs-row">
                          <span>${w.magazine}</span>
                          <span>${w.wallPen} PEN</span>
                          <span>${w.fireRate}</span>
                        </div>
                        <div class="w-dmg-row">
                          <span class="head-dmg">HEAD: ${w.headDmg}</span>
                        </div>
                      </div>

                      <button class="w-equip-btn ${isEquipped ? 'active' : ''}" data-weapon-id="${w.id}">
                        ${isEquipped ? 'EQUIPPED' : (canAfford ? 'PURCHASE' : 'INSUFFICIENT CREDS')}
                      </button>
                    </div>
                  `;
                }).join('')}
              </div>

              <!-- Shields & Utilities Bar -->
              <div class="store-shields-utilities-row">
                <!-- Shields Selection -->
                <div class="sub-store-section">
                  <span class="sub-store-title">// SHIELD / BODY ARMOR:</span>
                  <div class="shields-picker-grid">
                    ${this.data.shields.map(s => {
                      const isEquipped = activePlayer.shieldId === s.id;
                      return `
                        <div class="shield-card-btn ${isEquipped ? 'active' : ''}" data-shield-id="${s.id}">
                          <div class="shield-icon-badge">
                            ${s.id === 'none' ? '🛡 0' : (s.id === 'light' ? '🛡 +25' : '🛡 +50')}
                          </div>
                          <div class="shield-meta">
                            <span class="s-name">${s.name}</span>
                            <span class="s-cost ${s.cost === 0 ? 'cost-free' : 'val-creds'}">${s.cost === 0 ? 'FREE' : '¤ ' + s.cost}</span>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>

                <!-- Tactical Utility Charges -->
                <div class="sub-store-section">
                  <span class="sub-store-title">// TACTICAL ABILITY CHARGES:</span>
                  <div class="util-charges-selector">
                    <span class="util-desc">200 CREDS PER EXTRA UTILITY CHARGE</span>
                    <div class="util-pips-row">
                      ${[0, 1, 2, 3].map(charges => `
                        <button class="util-pip-btn ${(activePlayer.utilCharges || 0) === charges ? 'active' : ''}" data-charges="${charges}">
                          <span>${charges} CHARGES</span>
                          <span class="pip-cost">¤ ${charges * 200}</span>
                        </button>
                      `).join('')}
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // 1. Switch active player in roster
    const playerItems = this.container.querySelectorAll('.roster-player-item');
    playerItems.forEach(item => {
      item.addEventListener('click', () => {
        this.activePlayerId = parseInt(item.getAttribute('data-player-id'), 10);
        if (window.valorantAudio) window.valorantAudio.playClick();
        this.render();
      });
    });

    // 2. Adjust active player creds (+500 / -500)
    const adjustBtns = this.container.querySelectorAll('.btn-adjust-creds');
    adjustBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const delta = parseInt(btn.getAttribute('data-delta'), 10);
        const player = this.getActivePlayer();
        player.creds = Math.max(0, Math.min(this.data.constants.MAX_CREDS, player.creds + delta));
        if (window.valorantAudio) window.valorantAudio.playBuy();
        this.render();
      });
    });

    // 3. Category tabs
    const catBtns = this.container.querySelectorAll('.store-cat-btn');
    catBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeCategory = btn.getAttribute('data-cat');
        if (window.valorantAudio) window.valorantAudio.playHover();
        this.render();
      });
    });

    // 4. Equip weapon in store
    const equipBtns = this.container.querySelectorAll('.w-equip-btn, .weapon-shop-card');
    equipBtns.forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const weaponId = el.getAttribute('data-weapon-id');
        if (!weaponId) return;

        const player = this.getActivePlayer();
        const weapon = this.getWeapon(weaponId);

        // Check if currently equipped -> Unequip to Classic
        if (player.weaponId === weaponId) {
          if (weaponId !== 'classic') {
            player.weaponId = 'classic';
            if (window.valorantAudio) window.valorantAudio.playSell();
          }
        } else {
          // Check affordability
          const testSpend = weapon.cost + this.getShield(player.shieldId).cost + (player.utilCharges * 200);
          if (testSpend > player.creds) {
            if (window.valorantAudio) window.valorantAudio.playError();
            return;
          }
          player.weaponId = weaponId;
          if (window.valorantAudio) window.valorantAudio.playBuy();
        }

        this.render();
      });
    });

    // 5. Select Shield
    const shieldBtns = this.container.querySelectorAll('.shield-card-btn');
    shieldBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const shieldId = btn.getAttribute('data-shield-id');
        const player = this.getActivePlayer();
        const shield = this.getShield(shieldId);

        const testSpend = this.getWeapon(player.weaponId).cost + shield.cost + (player.utilCharges * 200);
        if (testSpend > player.creds) {
          if (window.valorantAudio) window.valorantAudio.playError();
          return;
        }

        player.shieldId = shieldId;
        if (window.valorantAudio) window.valorantAudio.playBuy();
        this.render();
      });
    });

    // 6. Select Utility Charges
    const utilBtns = this.container.querySelectorAll('.util-pip-btn');
    utilBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const charges = parseInt(btn.getAttribute('data-charges'), 10);
        const player = this.getActivePlayer();

        const testSpend = this.getWeapon(player.weaponId).cost + this.getShield(player.shieldId).cost + (charges * 200);
        if (testSpend > player.creds) {
          if (window.valorantAudio) window.valorantAudio.playError();
          return;
        }

        player.utilCharges = charges;
        if (window.valorantAudio) window.valorantAudio.playClick();
        this.render();
      });
    });

    // 7. Match Scenario Quick Jumps
    const scenarioBtns = this.container.querySelectorAll('.scenario-btn');
    scenarioBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const scenario = btn.getAttribute('data-scenario');
        this.applyScenarioPreset(scenario);
        if (window.valorantAudio) window.valorantAudio.playBuy();
        this.render();
      });
    });

    // 8. Outcome Toggle (Win vs Loss)
    const outcomeBtns = this.container.querySelectorAll('.sim-toggle-btn');
    outcomeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.roundOutcome = btn.getAttribute('data-outcome');
        if (window.valorantAudio) window.valorantAudio.playClick();
        this.render();
      });
    });

    // 9. Loss streak buttons
    const streakBtns = this.container.querySelectorAll('.loss-tier-btn');
    streakBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.lossStreak = parseInt(btn.getAttribute('data-streak'), 10);
        if (window.valorantAudio) window.valorantAudio.playClick();
        this.render();
      });
    });

    // 10. Spike plant checkbox
    const spikeToggle = document.getElementById('spike-plant-toggle');
    if (spikeToggle) {
      spikeToggle.addEventListener('change', () => {
        this.spikePlanted = spikeToggle.checked;
        if (window.valorantAudio) window.valorantAudio.playHover();
        this.render();
      });
    }

    // 11. Kill stepper
    const killBtns = this.container.querySelectorAll('.kill-btn-step');
    killBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const step = parseInt(btn.getAttribute('data-step'), 10);
        const player = this.getActivePlayer();
        player.kills = Math.max(0, Math.min(5, (player.kills || 0) + step));
        if (window.valorantAudio) window.valorantAudio.playHover();
        this.render();
      });
    });

    // 12. Execute Round Button
    const execBtn = document.getElementById('execute-round-btn');
    if (execBtn) {
      execBtn.addEventListener('click', () => {
        this.executeRoundProgression();
      });
    }

    // 13. Dismiss Halftime Banner
    const dismissHtBtn = document.getElementById('dismiss-halftime-btn');
    if (dismissHtBtn) {
      dismissHtBtn.addEventListener('click', () => {
        this.isHalftimeEvent = false;
        if (window.valorantAudio) window.valorantAudio.playClick();
        this.render();
      });
    }

    // 14. Reset / Restart Match
    const resetBtn = document.getElementById('reset-match-btn');
    const restartBtn = document.getElementById('restart-match-btn');
    [resetBtn, restartBtn].forEach(b => {
      if (b) {
        b.addEventListener('click', () => {
          this.resetMatch();
        });
      }
    });
  }

  // Reset entire match to Round 1
  resetMatch() {
    this.roundNumber = 1;
    this.teamScore = 0;
    this.enemyScore = 0;
    this.currentSide = 'ATTACK';
    this.isMatchOver = false;
    this.matchWinner = null;
    this.isHalftimeEvent = false;
    this.isOvertime = false;
    this.lastExecutionLog = null;
    this.applyScenarioPreset('pistol-r1');
    if (window.valorantAudio) window.valorantAudio.playBuy();
    this.render();
  }

  // Match Scenario Preset Jumper
  applyScenarioPreset(scenario) {
    this.isHalftimeEvent = false;
    this.isMatchOver = false;
    this.matchWinner = null;

    if (scenario === 'pistol-r1') {
      this.roundNumber = 1;
      this.teamScore = 0;
      this.enemyScore = 0;
      this.currentSide = 'ATTACK';
      this.isOvertime = false;
      this.lossStreak = 0;
      this.roster.forEach(p => {
        p.creds = 800;
        p.weaponId = 'classic';
        p.shieldId = 'none';
        p.utilCharges = 0;
        p.kills = 0;
      });
    } else if (scenario === 'full-buy-r3') {
      this.roundNumber = 3;
      this.teamScore = 2;
      this.enemyScore = 0;
      this.currentSide = 'ATTACK';
      this.isOvertime = false;
      this.lossStreak = 0;
      this.roster.forEach(p => {
        p.creds = 4500;
        p.weaponId = 'vandal';
        p.shieldId = 'heavy';
        p.utilCharges = 2;
        p.kills = 1;
      });
    } else if (scenario === 'pre-halftime-r12') {
      this.roundNumber = 12;
      this.teamScore = 7;
      this.enemyScore = 5;
      this.currentSide = 'ATTACK';
      this.isOvertime = false;
      this.roster.forEach(p => {
        p.creds = 3900;
        p.weaponId = 'phantom';
        p.shieldId = 'heavy';
        p.utilCharges = 2;
        p.kills = 0;
      });
    } else if (scenario === 'halftime-r13') {
      this.roundNumber = 13;
      this.teamScore = 7;
      this.enemyScore = 5;
      this.currentSide = 'DEFENSE';
      this.isOvertime = false;
      this.isHalftimeEvent = true;
      this.lossStreak = 0;
      this.roster.forEach(p => {
        p.creds = 800;
        p.weaponId = 'classic';
        p.shieldId = 'none';
        p.utilCharges = 0;
        p.kills = 0;
      });
    } else if (scenario === 'match-point') {
      this.roundNumber = 24;
      this.teamScore = 12;
      this.enemyScore = 11;
      this.currentSide = 'DEFENSE';
      this.isOvertime = false;
      this.roster.forEach(p => {
        p.creds = 4400;
        p.weaponId = 'warden';
        p.shieldId = 'heavy';
        p.utilCharges = 2;
        p.kills = 1;
      });
    } else if (scenario === 'overtime') {
      this.roundNumber = 25;
      this.teamScore = 12;
      this.enemyScore = 12;
      this.currentSide = 'ATTACK';
      this.isOvertime = true;
      this.lossStreak = 0;
      this.roster.forEach(p => {
        p.creds = 5000;
        p.weaponId = 'vandal';
        p.shieldId = 'heavy';
        p.utilCharges = 2;
        p.kills = 0;
      });
    }
  }

  // Execute Round and Advance to Next Round
  executeRoundProgression() {
    if (this.isMatchOver) return;

    const prevRound = this.roundNumber;
    const isWin = this.roundOutcome === 'win';
    
    // Update score
    if (isWin) {
      this.teamScore += 1;
    } else {
      this.enemyScore += 1;
    }

    // Determine rewards
    let reward;
    if (this.isOvertime) {
      // In Overtime, all players receive $5,000 every single round
      reward = this.data.constants.OVERTIME_CREDS;
    } else {
      reward = isWin ? this.data.constants.WIN_REWARD : this.data.constants.LOSS_STREAK_REWARDS[Math.min(this.lossStreak, 2)];
    }
    const plantBonus = this.spikePlanted ? this.data.constants.SPIKE_PLANT_BONUS : 0;

    // Deduct spend and apply round payout to all players
    this.roster.forEach(p => {
      const fin = this.calculatePlayerFinance(p);
      const remainingAfterSpend = fin.remainingCreds;
      const killReward = (p.kills || 0) * this.data.constants.KILL_BONUS;

      if (this.isOvertime) {
        p.creds = 5000; // Fixed OT bank
      } else {
        p.creds = Math.min(this.data.constants.MAX_CREDS, remainingAfterSpend + reward + plantBonus + killReward);
      }
      
      // If round was lost, non-surviving weapons reset to Classic
      if (!isWin) {
        p.weaponId = 'classic';
        p.shieldId = 'none';
      }
      p.kills = 0; // reset
    });

    // Update streak (in regulation)
    if (!this.isOvertime) {
      if (isWin) {
        this.lossStreak = 0;
      } else {
        this.lossStreak = Math.min(2, this.lossStreak + 1);
      }
    }

    // Check Match Win Condition
    // 1. Regulation Win (first to 13 without OT)
    if (!this.isOvertime) {
      if (this.teamScore >= 13 && this.enemyScore < 12) {
        this.isMatchOver = true;
        this.matchWinner = 'TEAM';
        if (window.valorantAudio) window.valorantAudio.playRoundWin();
      } else if (this.enemyScore >= 13 && this.teamScore < 12) {
        this.isMatchOver = true;
        this.matchWinner = 'ENEMY';
        if (window.valorantAudio) window.valorantAudio.playRoundLoss();
      } else if (this.teamScore === 12 && this.enemyScore === 12) {
        // Enters Overtime!
        this.isOvertime = true;
        if (window.valorantAudio) window.valorantAudio.playBuy();
      }
    } else {
      // 2. Overtime Win Condition (Win by 2)
      if (this.teamScore >= 13 && this.teamScore - this.enemyScore >= 2) {
        this.isMatchOver = true;
        this.matchWinner = 'TEAM';
        if (window.valorantAudio) window.valorantAudio.playRoundWin();
      } else if (this.enemyScore >= 13 && this.enemyScore - this.teamScore >= 2) {
        this.isMatchOver = true;
        this.matchWinner = 'ENEMY';
        if (window.valorantAudio) window.valorantAudio.playRoundLoss();
      }
    }

    // Check Halftime Condition (Round 12 -> 13)
    if (prevRound === 12 && !this.isMatchOver) {
      this.isHalftimeEvent = true;
      this.currentSide = this.currentSide === 'ATTACK' ? 'DEFENSE' : 'ATTACK';
      this.lossStreak = 0;
      // Halftime economy reset: All players reset to 800
      this.roster.forEach(p => {
        p.creds = this.data.constants.START_CREDS;
        p.weaponId = 'classic';
        p.shieldId = 'none';
        p.utilCharges = 0;
      });
      if (window.valorantAudio) window.valorantAudio.playRoundWin();
    } else if (!this.isMatchOver) {
      if (isWin) {
        if (window.valorantAudio) window.valorantAudio.playRoundWin();
      } else {
        if (window.valorantAudio) window.valorantAudio.playRoundLoss();
      }
    }

    // Increment round counter if match is not over
    if (!this.isMatchOver) {
      this.roundNumber += 1;
    }
    this.spikePlanted = false;

    // Telemetry log
    const teamAnalytics = this.calculateTeamAnalytics();
    this.lastExecutionLog = {
      prevRound,
      outcome: isWin ? 'VICTORY' : 'DEFEAT',
      reward: this.isOvertime ? 5000 : reward,
      spikeBonus: plantBonus,
      newTeamBank: teamAnalytics.totalBank
    };

    this.render();
  }
}

// Auto init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.economySim = new TacticalEconomySimulator();
  });
} else {
  window.economySim = new TacticalEconomySimulator();
}
