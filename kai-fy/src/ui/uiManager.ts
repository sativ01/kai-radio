import { type Track } from "../types/spotify";

export class UIManager {
  private mainContent: HTMLElement | null = null;
  private currentTrackId: string | null = null;

  constructor() {
    this.mainContent = document.getElementById("main-content");
  }

  public async initialize(): Promise<void> {
    this.renderInitialView();
    this.updateSoftkeys("Prev", "Play", "Next");
  }

  private renderInitialView(): void {
    if (!this.mainContent) return;

    this.mainContent.innerHTML = `
      <div class="now-playing">
        <div class="album-art-container">
          <img id="album-art" class="album-art" src="" alt="Album art" />
        </div>
        <div class="track-info">
          <h2 id="track-name" class="track-name">No track playing</h2>
          <p id="artist-name" class="artist-name">—</p>
          <p id="album-name" class="album-name">—</p>
        </div>
        <div class="playback-status">
          <span id="playback-icon" class="playback-icon">⏸</span>
        </div>
      </div>
    `;
  }

  public updateNowPlaying(track: Track | null): void {
    if (!track) {
      this.updateTrackInfo("No track playing", "—", "—");
      this.updateAlbumArt("");
      return;
    }

    // Only update DOM if track has changed
    if (this.currentTrackId !== track.id) {
      this.currentTrackId = track.id;
      this.updateTrackInfo(track.name, track.artist, track.album);
      this.updateAlbumArt(track.albumArt || "");
    }
  }

  private updateTrackInfo(name: string, artist: string, album: string): void {
    const trackNameEl = document.getElementById("track-name");
    const artistNameEl = document.getElementById("artist-name");
    const albumNameEl = document.getElementById("album-name");

    if (trackNameEl) trackNameEl.textContent = name;
    if (artistNameEl) artistNameEl.textContent = artist;
    if (albumNameEl) albumNameEl.textContent = album;
  }

  private updateAlbumArt(url: string): void {
    const albumArtEl = document.getElementById("album-art") as HTMLImageElement;
    if (albumArtEl) {
      if (url) {
        albumArtEl.src = url;
        albumArtEl.style.display = "block";
      } else {
        albumArtEl.style.display = "none";
      }
    }
  }

  public updatePlaybackStatus(isPlaying: boolean): void {
    const playbackIconEl = document.getElementById("playback-icon");
    if (playbackIconEl) {
      playbackIconEl.textContent = isPlaying ? "▶" : "⏸";
    }
  }

  public updateSoftkeys(left: string, center: string, right: string): void {
    const softkeyLeft = document.getElementById("softkey-left");
    const softkeyCenter = document.getElementById("softkey-center");
    const softkeyRight = document.getElementById("softkey-right");

    if (softkeyLeft) softkeyLeft.textContent = left;
    if (softkeyCenter) softkeyCenter.textContent = center;
    if (softkeyRight) softkeyRight.textContent = right;
  }

  public showMessage(message: string, duration: number = 3000): void {
    // Create a toast-like message
    const messageEl = document.createElement("div");
    messageEl.className = "message-toast";
    messageEl.textContent = message;
    document.body.appendChild(messageEl);

    setTimeout(() => {
      messageEl.remove();
    }, duration);
  }
}
