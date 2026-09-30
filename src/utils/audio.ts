/**
 * Web Audio Synthesizer for tactile feedback
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    try {
      const saved = localStorage.getItem('aethercalc_sound_enabled');
      this.isEnabled = saved !== null ? saved === 'true' : true;
    } catch {
      this.isEnabled = true;
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public get enabled(): boolean {
    return this.isEnabled;
  }

  public toggle(): boolean {
    this.isEnabled = !this.isEnabled;
    try {
      localStorage.setItem('aethercalc_sound_enabled', String(this.isEnabled));
    } catch {
      // ignore
    }
    return this.isEnabled;
  }

  public playClick(pitch: number = 800) {
    if (!this.isEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.4, this.ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.036);
    } catch {
      // Audio not permitted or failed
    }
  }

  public playEquals() {
    if (!this.isEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      const t = this.ctx.currentTime;
      osc1.frequency.setValueAtTime(523.25, t); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, t + 0.08); // E5

      osc2.frequency.setValueAtTime(1046.5, t); // C6
      osc2.frequency.exponentialRampToValueAtTime(1318.5, t + 0.08);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(t + 0.13);
      osc2.stop(t + 0.13);
    } catch {
      // Ignore
    }
  }

  public playClear() {
    if (!this.isEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const t = this.ctx.currentTime;
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.05);

      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(t + 0.051);
    } catch {
      // Ignore
    }
  }
}

export const soundFx = new SoundSynthesizer();
