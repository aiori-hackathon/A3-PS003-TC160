// Web Audio API Procedural Sound Engine
// Zero 404 dependencies: synthesizes ambient drone, whooshes, clicks, and chimes in real-time

class AudioEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private oscLow: OscillatorNode | null = null;
  private oscHigh: OscillatorNode | null = null;
  private noiseNode: AudioNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.35;
  private isPlayingAmbient: boolean = false;

  constructor() {
    try {
      const storedMute = localStorage.getItem('aiori_audio_muted');
      if (storedMute !== null) {
        this.isMuted = storedMute === 'true';
      }
    } catch (e) {
      // ignore
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('aiori_audio_muted', String(this.isMuted));
    } catch (e) {
      // ignore
    }

    if (this.ambientGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.volume * 0.25;
      this.ambientGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    }

    if (!this.isMuted && !this.isPlayingAmbient) {
      this.startAmbient();
    }

    return this.isMuted;
  }

  public startAmbient() {
    if (this.isPlayingAmbient) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.25, now);
      this.ambientGain.connect(this.ctx.destination);

      // 1. Deep Sub-bass hum (Cyber Highway infrastructure)
      this.oscLow = this.ctx.createOscillator();
      this.oscLow.type = 'sine';
      this.oscLow.frequency.setValueAtTime(55, now); // A1 note

      const lowGain = this.ctx.createGain();
      lowGain.gain.setValueAtTime(0.5, now);
      this.oscLow.connect(lowGain);
      lowGain.connect(this.ambientGain);
      this.oscLow.start();

      // 2. Warm pad frequency (Ethereal 110Hz harmonic)
      this.oscHigh = this.ctx.createOscillator();
      this.oscHigh.type = 'triangle';
      this.oscHigh.frequency.setValueAtTime(110, now);

      const highFilter = this.ctx.createBiquadFilter();
      highFilter.type = 'lowpass';
      highFilter.frequency.setValueAtTime(320, now);

      const highGain = this.ctx.createGain();
      highGain.gain.setValueAtTime(0.3, now);

      this.oscHigh.connect(highFilter);
      highFilter.connect(highGain);
      highGain.connect(this.ambientGain);
      this.oscHigh.start();

      // 3. Gentle pink noise air-flow (Highway Doppler simulation)
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.08;
      }

      const whiteNoiseSource = this.ctx.createBufferSource();
      whiteNoiseSource.buffer = noiseBuffer;
      whiteNoiseSource.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(450, now);
      noiseFilter.Q.setValueAtTime(1.5, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, now);

      whiteNoiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ambientGain);
      whiteNoiseSource.start();
      this.noiseNode = whiteNoiseSource;

      this.isPlayingAmbient = true;
    } catch (e) {
      console.warn('AudioContext ambient could not start:', e);
    }
  }

  public stopAmbient() {
    if (!this.isPlayingAmbient) return;
    try {
      this.oscLow?.stop();
      this.oscHigh?.stop();
      this.noiseNode?.disconnect();
      this.ambientGain?.disconnect();
    } catch (e) {
      // ignore
    }
    this.isPlayingAmbient = false;
  }

  // Interaction: Sleek micro-click on button touch
  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

      gain.gain.setValueAtTime(this.volume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {
      // ignore
    }
  }

  // Camera glide / warp whoosh
  public playWhoosh() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150, now);
      filter.frequency.exponentialRampToValueAtTime(1200, now + 0.25);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.5);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.25);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.5);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.35, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);
    } catch (e) {
      // ignore
    }
  }

  // Exploded View expansion mechanical sliding tone
  public playServoTone(pitch: number = 440) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 1.25, now + 0.12);

      gain.gain.setValueAtTime(this.volume * 0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {
      // ignore
    }
  }

  // Shimmering chime for intro launch or finish change
  public playChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const noteTime = now + idx * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(this.volume * 0.2, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(noteTime);
        osc.stop(noteTime + 0.45);
      });
    } catch (e) {
      // ignore
    }
  }
}

export const sound = new AudioEngine();
