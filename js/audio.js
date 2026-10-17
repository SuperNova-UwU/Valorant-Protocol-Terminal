/**
 * VALORANT PROTOCOL // TACTICAL AUDIO SYNTHESIZER
 * Procedural Web Audio API sound engine - Zero external audio file lag, zero CORS errors!
 */

class ValorantAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.masterGain = null;
    this.initUserGesture();
  }

  initUserGesture() {
    const unlock = () => {
      this.getAudioContext();
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('scroll', unlock);
    };
    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('scroll', unlock, { once: true });
  }

  getAudioContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.enabled ? 0.35 : 0;
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  toggleSound() {
    this.enabled = !this.enabled;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.enabled ? 0.35 : 0, this.ctx.currentTime);
    }
    if (this.enabled) {
      this.playBeep(880, 0.08, 'sine');
    }
    return this.enabled;
  }

  // Tactical UI Hover Blip
  playHover() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(640, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      // Audio fallback
    }
  }

  // Tactical UI Click / Confirmation
  playClick() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      // High blip
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(1200, t);
      osc1.frequency.exponentialRampToValueAtTime(800, t + 0.06);

      gain1.gain.setValueAtTime(0.08, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      osc1.connect(gain1);
      gain1.connect(this.masterGain);
      osc1.start(t);
      osc1.stop(t + 0.07);

      // Low tactical thud
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(180, t);
      osc2.frequency.exponentialRampToValueAtTime(60, t + 0.08);

      gain2.gain.setValueAtTime(0.12, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc2.connect(gain2);
      gain2.connect(this.masterGain);
      osc2.start(t);
      osc2.stop(t + 0.09);
    } catch (e) {}
  }

  // Jett Tailwind Dash Sound Effect (Air displacement + radiant wind whoosh)
  playJettDash() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.45;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      // Bandpass filter for wind rush
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, t);
      filter.frequency.exponentialRampToValueAtTime(2800, t + 0.15);
      filter.frequency.exponentialRampToValueAtTime(300, t + 0.4);
      filter.Q.setValueAtTime(3.5, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.exponentialRampToValueAtTime(0.28, t + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      whiteNoise.start(t);
      whiteNoise.stop(t + 0.45);

      // Radiant pitch sweep overlay (Wind magic / Radiant energy)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.14);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.38);

      oscGain.gain.setValueAtTime(0.05, t);
      oscGain.gain.exponentialRampToValueAtTime(0.09, t + 0.12);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.42);
    } catch (e) {}
  }

  // Spike Beep Simulator
  playSpikeBeep(frequency = 1046.5) {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, t);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.11);
    } catch (e) {}
  }

  // Transmission Send Beeps (Data packet burst)
  playTransmissionTransmit() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteTime = t + idx * 0.07;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.08, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.08);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(noteTime);
        osc.stop(noteTime + 0.09);
      });
    } catch (e) {}
  }

  playBeep(freq, duration, type = 'sine') {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + duration);
    } catch (e) {}
  }

  // Tactical Economy: Item Purchase Sound (Cash register chink + digital chirp)
  playBuy() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      // High coin ping
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(1400, t);
      osc1.frequency.exponentialRampToValueAtTime(1800, t + 0.08);
      gain1.gain.setValueAtTime(0.09, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc1.connect(gain1);
      gain1.connect(this.masterGain);
      osc1.start(t);
      osc1.stop(t + 0.13);

      // Low tactical cocking thud
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(320, t + 0.04);
      osc2.frequency.exponentialRampToValueAtTime(110, t + 0.14);
      gain2.gain.setValueAtTime(0.12, t + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc2.connect(gain2);
      gain2.connect(this.masterGain);
      osc2.start(t + 0.04);
      osc2.stop(t + 0.16);
    } catch (e) {}
  }

  // Tactical Economy: Item Sell / Refund Sound
  playSell() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(450, t + 0.08);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.1);
    } catch (e) {}
  }

  // Tactical Economy: Round Win Fanfare
  playRoundWin() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      const notes = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteTime = t + i * 0.08;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);
        gain.gain.setValueAtTime(0.12, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.22);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(noteTime);
        osc.stop(noteTime + 0.24);
      });
    } catch (e) {}
  }

  // Tactical Economy: Round Loss Warning Tone
  playRoundLoss() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      const notes = [440.00, 370.00, 311.13, 261.63]; // Descending ominous tone
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteTime = t + i * 0.09;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, noteTime);
        gain.gain.setValueAtTime(0.07, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(noteTime);
        osc.stop(noteTime + 0.27);
      });
    } catch (e) {}
  }

  // Overdraft / Insufficient Creds Buzzer
  playError() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.setValueAtTime(110, t + 0.08);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.2);
    } catch (e) {}
  }
}

window.valorantAudio = new ValorantAudioEngine();
