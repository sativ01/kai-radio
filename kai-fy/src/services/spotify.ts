import {
  type Track,
  type PlaybackState,
  PlaybackAction,
} from "../types/spotify";

export class SpotifyController {
  private baseUrl = "https://api.spotify.com/v1";
  private accessToken: string | null = null;
  private currentState: PlaybackState = {
    isPlaying: false,
    track: null,
    volume: 100,
  };

  constructor() {
    this.loadAccessToken();
  }

  private loadAccessToken(): void {
    // Load from localStorage or prompt user
    this.accessToken = localStorage.getItem("spotify_access_token");
  }

  public setAccessToken(token: string): void {
    this.accessToken = token;
    localStorage.setItem("spotify_access_token", token);
  }

  public async getCurrentTrack(): Promise<Track | null> {
    if (!this.accessToken) {
      console.warn("No access token available");
      return null;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/me/player/currently-playing`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          console.error("Access token expired or invalid");
          return null;
        }
        throw new Error(`Failed to fetch current track: ${response.status}`);
      }

      if (response.status === 204) {
        // No track currently playing
        return null;
      }

      const data = await response.json();

      const track: Track = {
        id: data.item.id,
        name: data.item.name,
        artist: data.item.artists.map((a: any) => a.name).join(", "),
        album: data.item.album.name,
        albumArt: data.item.album.images[0]?.url,
        duration: data.item.duration_ms,
        position: data.progress_ms,
      };

      this.currentState.isPlaying = data.is_playing;
      this.currentState.track = track;

      return track;
    } catch (error) {
      console.error("Error fetching current track:", error);
      return null;
    }
  }

  public async play(): Promise<void> {
    await this.sendPlaybackCommand(PlaybackAction.PLAY);
  }

  public async pause(): Promise<void> {
    await this.sendPlaybackCommand(PlaybackAction.PAUSE);
  }

  public async togglePlayPause(): Promise<void> {
    if (this.currentState.isPlaying) {
      await this.pause();
    } else {
      await this.play();
    }
  }

  public async nextTrack(): Promise<void> {
    await this.sendPlaybackCommand(PlaybackAction.NEXT);
  }

  public async previousTrack(): Promise<void> {
    await this.sendPlaybackCommand(PlaybackAction.PREVIOUS);
  }

  private async sendPlaybackCommand(action: PlaybackAction): Promise<void> {
    if (!this.accessToken) {
      console.warn("No access token available");
      return;
    }

    try {
      let endpoint = "";
      let method = "PUT";

      switch (action) {
        case PlaybackAction.PLAY:
          endpoint = "/me/player/play";
          break;
        case PlaybackAction.PAUSE:
          endpoint = "/me/player/pause";
          break;
        case PlaybackAction.NEXT:
          endpoint = "/me/player/next";
          method = "POST";
          break;
        case PlaybackAction.PREVIOUS:
          endpoint = "/me/player/previous";
          method = "POST";
          break;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok && response.status !== 204) {
        throw new Error(`Playback command failed: ${response.status}`);
      }

      // Update state after action
      setTimeout(() => this.getCurrentTrack(), 500);
    } catch (error) {
      console.error("Error sending playback command:", error);
    }
  }

  public getPlaybackState(): PlaybackState {
    return { ...this.currentState };
  }
}
