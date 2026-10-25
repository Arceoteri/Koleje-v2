/**
 * Web Audio API procedural sound synthesizer for Train Tracks.
 * Zero external audio assets, works offline in PWA and complies with browser audio policies.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Check localStorage for saved sound preference
    const saved = localStorage.getItem('train_tracks_sound_muted');
    if (saved !== null) {
      this.isMuted = saved === 'true';
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('train_tracks_sound_muted', String(this.isMuted));
    if (!this.isMuted) {
      this.playClick();
    }
    return this.isMuted;
  }

  /**
   * Crisp, tactile wooden snap / railway sleeper clack when placing or cycling a track
   */
  public playTrackPlace(trackType: string) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Primary woody transient click
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Slightly vary pitch based on track type for variety
      let baseFreq = 220;
      if (trackType === 'H') baseFreq = 240;
      else if (trackType === 'V') baseFreq = 260;
      else if (trackType.startsWith('CURVE')) baseFreq = 300;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq * 1.8, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.06);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);

      // Subtle high-pitch metallic rail ping
      const ping = this.ctx.createOscillator();
      const pingGain = this.ctx.createGain();

      ping.type = 'sine';
      ping.frequency.setValueAtTime(1400, now);
      ping.frequency.exponentialRampToValueAtTime(800, now + 0.05);

      pingGain.gain.setValueAtTime(0.04, now);
      pingGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      ping.connect(pingGain);
      pingGain.connect(this.ctx.destination);

      ping.start(now);
      ping.stop(now + 0.06);
    } catch {
      // Audio not permitted or failed
    }
  }

  /**
   * Soft woody tap / scratch when placing an X or erasing a cell
   */
  public playEraseOrX() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Audio error safety
    }
  }

  /**
   * Subtle UI button switch tick
   */
  public playClick() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Audio error safety
    }
  }

  /**
   * Gentle two-tone soft buzzer on validation failure
   */
  public playError() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      [0, 0.12].forEach((offset, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(idx === 0 ? 190 : 155, now + offset);

        gain.gain.setValueAtTime(0.08, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.09);

        // Filter out harsh highs
        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now + offset);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.1);
      });
    } catch {
      // Audio error safety
    }
  }

  /**
   * Celebratory train chime fanfare + happy whistle on puzzle victory
   */
  public playVictory() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Pentatonic celebratory ascending arpeggio (C5, E5, G5, A5, C6)
      const notes = [523.25, 659.25, 783.99, 880.0, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const noteTime = now + idx * 0.11;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.12, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.36);
      });

      // Harmonious warm chord resonance at the end
      const chordDelay = now + 0.58;
      [523.25, 659.25, 783.99, 1046.5].forEach(freq => {
        const chordOsc = this.ctx!.createOscillator();
        const chordGain = this.ctx!.createGain();

        chordOsc.type = 'triangle';
        chordOsc.frequency.setValueAtTime(freq, chordDelay);

        chordGain.gain.setValueAtTime(0.08, chordDelay);
        chordGain.gain.exponentialRampToValueAtTime(0.001, chordDelay + 0.7);

        chordOsc.connect(chordGain);
        chordGain.connect(this.ctx!.destination);

        chordOsc.start(chordDelay);
        chordOsc.stop(chordDelay + 0.75);
      });
    } catch {
      // Audio error safety
    }
  }
}

export const soundManager = new SoundManager();
