/**
 * Procedural ambient synthesizer using Web Audio API.
 * Zero external mp3 dependencies (zero 404s).
 * Auto-play is disabled by default; starts only on explicit user click.
 */

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private gainNode: GainNode | null = null;
  private oscA: OscillatorNode | null = null;
  private oscB: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;

  public init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();
  }

  public toggle(): boolean {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  private start() {
    if (!this.ctx) return;
    this.isPlaying = true;

    // Master subtle gain
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.gainNode.gain.exponentialRampToValueAtTime(0.06, this.ctx.currentTime + 3);

    // Warm low-pass filter
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(260, this.ctx.currentTime);

    // Deep harmonic drone (55 Hz - A1 note)
    this.oscA = this.ctx.createOscillator();
    this.oscA.type = 'sine';
    this.oscA.frequency.setValueAtTime(55, this.ctx.currentTime);

    // Secondary subtle fifth overtone (82.4 Hz - E2 note)
    this.oscB = this.ctx.createOscillator();
    this.oscB.type = 'triangle';
    this.oscB.frequency.setValueAtTime(82.41, this.ctx.currentTime);

    this.oscA.connect(this.filter);
    this.oscB.connect(this.filter);
    this.filter.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);

    this.oscA.start();
    this.oscB.start();
  }

  private stop() {
    if (!this.ctx || !this.gainNode) return;
    this.isPlaying = false;
    try {
      this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.0);
      setTimeout(() => {
        this.oscA?.stop();
        this.oscB?.stop();
        this.oscA?.disconnect();
        this.oscB?.disconnect();
        this.gainNode?.disconnect();
      }, 1100);
    } catch {
      // ignore
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }
}

export const audioEngine = new AmbientAudioEngine();
