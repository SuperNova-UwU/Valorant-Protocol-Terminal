/**
 * VALORANT PROTOCOL // TACTICAL TRANSMISSION & CONTACT HUB
 * Handles communications dispatch, ticket generation, ping telemetry & form security.
 */

class TacticalContactController {
  constructor() {
    this.form = null;
    this.terminalOutput = null;
    this.randomTagBtn = null;
    this.isTransmitting = false;

    this.init();
  }

  init() {
    this.form = document.getElementById('tactical-transmission-form');
    this.terminalOutput = document.getElementById('transmission-status-console');
    this.randomTagBtn = document.getElementById('gen-callsign-btn');

    this.bindEvents();
    this.bindPingSimulator();
  }

  bindEvents() {
    if (this.randomTagBtn) {
      this.randomTagBtn.addEventListener('click', () => {
        this.generateRandomCallsign();
        if (window.valorantAudio) window.valorantAudio.playClick();
      });
    }

    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleTransmit();
      });

      // Hover feedback on inputs
      const inputs = this.form.querySelectorAll('input, select, textarea, button');
      inputs.forEach(input => {
        input.addEventListener('focus', () => {
          if (window.valorantAudio) window.valorantAudio.playHover();
        });
      });
    }
  }

  generateRandomCallsign() {
    const prefixes = ['PHOENIX', 'VIPER', 'OMEN', 'SOVA', 'REYNA', 'CYPHER', 'KILLJOY', 'CHAMBER', 'VYSE', 'JETT', 'CLOVE'];
    const regions = ['KR1', 'EUW', 'NA1', 'AP', 'BR', 'LATAM'];
    const randPre = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randReg = regions[Math.floor(Math.random() * regions.length)];
    const randNum = Math.floor(100 + Math.random() * 900);

    const callsignInput = document.getElementById('sender-callsign');
    if (callsignInput) {
      callsignInput.value = `${randPre}#${randReg}${randNum}`;
    }
  }

  handleTransmit() {
    if (this.isTransmitting) return;

    const callsign = document.getElementById('sender-callsign')?.value || 'AGENT#UNASSIGNED';
    const email = document.getElementById('sender-email')?.value || 'unknown@radianite.net';
    const category = document.getElementById('transmission-category')?.value || 'GENERAL';
    const priority = document.querySelector('input[name="priority"]:checked')?.value || 'STANDARD';
    const message = document.getElementById('transmission-body')?.value || '';

    if (!message.trim()) {
      alert('Transmission body cannot be empty. Enter classified field intel before sending.');
      return;
    }

    this.isTransmitting = true;
    const submitBtn = document.getElementById('transmission-submit-btn');
    const submitText = document.getElementById('submit-btn-text');

    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.textContent = 'ENCRYPTING PACKET...';

    // Play transmission beeps
    if (window.valorantAudio) {
      window.valorantAudio.playTransmissionTransmit();
    }

    const consoleOutput = document.getElementById('terminal-log-feed');
    if (consoleOutput) {
      consoleOutput.innerHTML = `
        <div class="log-line">> INITIATING VALORANT PROTOCOL SECURE HANDSHAKE...</div>
        <div class="log-line">> GENERATING AES-256 RADIANITE CIPHER...</div>
      `;

      setTimeout(() => {
        consoleOutput.innerHTML += `<div class="log-line">> QUANTUM HANDSHAKE ESTABLISHED WITH PROTOCOL HQ.</div>`;
      }, 600);

      setTimeout(() => {
        consoleOutput.innerHTML += `<div class="log-line">> DISPATCHING PACKET: PRIORITY [${priority.toUpperCase()}]...</div>`;
      }, 1200);

      setTimeout(() => {
        const ticketId = `VAL-${Math.floor(1000 + Math.random() * 9000)}-${category.slice(0, 3).toUpperCase()}`;
        consoleOutput.innerHTML += `
          <div class="log-line log-success">> TRANSMISSION CONFIRMED! TICKET ISSUED: [${ticketId}]</div>
          <div class="log-line">> FIELD DISPATCH DELIVERED TO RIOT VALORANT OPERATIONS.</div>
        `;

        this.showReceipt(ticketId, callsign, email, category, priority, message);
        this.isTransmitting = false;
        if (submitBtn) submitBtn.disabled = false;
        if (submitText) submitText.textContent = 'TRANSMIT NEW DISPATCH';
        if (this.form) this.form.reset();
      }, 1900);
    }
  }

  showReceipt(ticketId, callsign, email, category, priority, message) {
    const receiptBox = document.getElementById('transmission-receipt');
    if (!receiptBox) return;

    const timestamp = new Date().toUTCString();

    receiptBox.innerHTML = `
      <div class="receipt-card">
        <div class="receipt-header">
          <div class="receipt-badge">
            <span class="pulse-indicator"></span>
            <span>TRANSMISSION CONFIRMED</span>
          </div>
          <span class="receipt-id">TICKET: ${ticketId}</span>
        </div>

        <div class="receipt-grid">
          <div class="receipt-row">
            <span class="r-label">OPERATIVE CALLSIGN:</span>
            <span class="r-val">${callsign}</span>
          </div>
          <div class="receipt-row">
            <span class="r-label">SECURE CHANNEL:</span>
            <span class="r-val">${email}</span>
          </div>
          <div class="receipt-row">
            <span class="r-label">CLASSIFICATION:</span>
            <span class="r-val">${category.toUpperCase()}</span>
          </div>
          <div class="receipt-row">
            <span class="r-label">SECURITY CLEARANCE:</span>
            <span class="r-val">${priority.toUpperCase()}</span>
          </div>
          <div class="receipt-row">
            <span class="r-label">TIMESTAMP:</span>
            <span class="r-val">${timestamp}</span>
          </div>
        </div>

        <div class="receipt-footer">
          <p>Your intel has been encrypted and routed into the Valorant Protocol feedback queue. Our engineering staff and agent balance coordinators monitor transmissions 24/7.</p>
        </div>
      </div>
    `;
    receiptBox.style.display = 'block';
    receiptBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  bindPingSimulator() {
    const pingBtn = document.getElementById('run-ping-test-btn');
    if (!pingBtn) return;

    pingBtn.addEventListener('click', () => {
      if (window.valorantAudio) window.valorantAudio.playClick();
      pingBtn.disabled = true;
      pingBtn.textContent = 'PROBING NODES...';

      const nodes = [
        { id: 'ping-tokyo', base: 14 },
        { id: 'ping-frankfurt', base: 22 },
        { id: 'ping-virginia', base: 18 },
        { id: 'ping-mumbai', base: 11 }
      ];

      setTimeout(() => {
        nodes.forEach(node => {
          const el = document.getElementById(node.id);
          if (el) {
            const jitter = Math.floor((Math.random() - 0.5) * 4);
            const finalPing = Math.max(8, node.base + jitter);
            el.textContent = `${finalPing} ms`;
          }
        });

        pingBtn.disabled = false;
        pingBtn.textContent = 'REFRESH PING';
        if (window.valorantAudio) window.valorantAudio.playHover();
      }, 700);
    });
  }
}

// Auto init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.tacticalContact = new TacticalContactController();
  });
} else {
  window.tacticalContact = new TacticalContactController();
}
