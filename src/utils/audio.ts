// Audio disabled completely per user request ("Дууны огт хэрэггүй юм байна")
// Provides safe, silent no-op methods to prevent any sound playback or runtime errors.

class SoundManager {
  public isMuted: boolean = true;

  playChime() {}
  playCardDraw() {}
  playCardFlip() {}
  playShuffle() {}
  playReveal() {}
  playCardInspect() {}
  playBalanceTopUp() {}
  startReadingAmbience() {}
  stopReadingAmbience() {}
  toggleMute() { return true; }
}

export const soundFx = new SoundManager();
