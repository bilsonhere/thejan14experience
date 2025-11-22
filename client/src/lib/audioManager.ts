class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private backgroundMusic: HTMLAudioElement | null = null;
  private enabled: boolean = true;

  init() {
    this.loadSound('ambient', '/sounds/background.mp3', true);
    this.loadSound('success', '/sounds/success.mp3', false);
    this.loadSound('hit', '/sounds/hit.mp3', false);
  }

  loadSound(key: string, src: string, isMusic: boolean = false) {
    const audio = new Audio(src);
    audio.preload = 'auto';
    
    if (isMusic) {
      audio.loop = true;
      audio.volume = 0.3;
      this.backgroundMusic = audio;
    } else {
      audio.volume = 0.5;
    }
    
    this.sounds.set(key, audio);
  }

  play(key: string) {
    if (!this.enabled) return;
    
    const sound = this.sounds.get(key);
    if (sound) {
      const clone = sound.cloneNode() as HTMLAudioElement;
      clone.volume = sound.volume;
      clone.play().catch(() => {});
    }
  }

  playMusic() {
    if (!this.enabled || !this.backgroundMusic) return;
    
    this.backgroundMusic.play().catch(() => {});
  }

  stopMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled && this.backgroundMusic) {
      this.backgroundMusic.pause();
    } else if (enabled && this.backgroundMusic) {
      this.backgroundMusic.play().catch(() => {});
    }
  }

  setMusicVolume(volume: number) {
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = Math.max(0, Math.min(1, volume));
    }
  }
}

export const audioManager = new AudioManager();
