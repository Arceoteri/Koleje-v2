/**
 * Android & Mobile PWA Haptic Feedback Engine
 * Provides subtle, satisfying tactile feedback during railway track interactions.
 */

class HapticManager {
  private enabled: boolean = true;

  constructor() {
    const saved = localStorage.getItem('train_tracks_haptics_enabled');
    if (saved !== null) {
      this.enabled = saved === 'true';
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    localStorage.setItem('train_tracks_haptics_enabled', String(val));
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    localStorage.setItem('train_tracks_haptics_enabled', String(this.enabled));
    if (this.enabled) {
      this.light();
    }
    return this.enabled;
  }

  private canVibrate(): boolean {
    return (
      this.enabled &&
      typeof window !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      'vibrate' in navigator
    );
  }

  /**
   * Crisp, ultra-light click when placing a track or cycling (12ms)
   */
  public light() {
    if (!this.canVibrate()) return;
    try {
      navigator.vibrate(12);
    } catch {
      // Haptics not allowed
    }
  }

  /**
   * Medium tactile thud when a row or column is completed (25ms)
   */
  public medium() {
    if (!this.canVibrate()) return;
    try {
      navigator.vibrate(25);
    } catch {
      // Haptics not allowed
    }
  }

  /**
   * Double buzz on limit violation or invalid action
   */
  public error() {
    if (!this.canVibrate()) return;
    try {
      navigator.vibrate([25, 40, 25]);
    } catch {
      // Haptics not allowed
    }
  }

  /**
   * Celebratory rhythmic fanfare on victory
   */
  public victory() {
    if (!this.canVibrate()) return;
    try {
      navigator.vibrate([35, 45, 35, 60, 100]);
    } catch {
      // Haptics not allowed
    }
  }
}

export const hapticManager = new HapticManager();
