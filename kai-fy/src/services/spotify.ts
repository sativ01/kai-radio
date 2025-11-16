// src/services/spotify.ts - Simplified version for KaiOS
import { type Track, type PlaybackState } from "../types/spotify";

export class SpotifyController {
  private baseUrl: string;
  private currentState: PlaybackState = {
    isPlaying: false,
    track: null,
    volume: 100,
  };

  constructor() {
    // Auto-detect environment
    // Change this IP to your computer/RPi IP for real device testing
    const localIP = "192.168.1.100"; // UPDATE THIS
    const isDev = window.location.hostname === "localhost";

    this.baseUrl = isDev
      ? "http://localhost:3000/api"
      : `http://${localIP}:3000/api`;

    console.log("Spotify API base URL:", this.baseUrl);
  }

  public async getCurrentTrack(): Promise<Track | null> {
    try {
      const response = await fetch(`${this.baseUrl}/current-track`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.warn("Failed to fetch current track:", response.status);
        return null;
      }

      const data = await response.json();

      if (!data) {
        // No track currently playing
        return null;
      }

      const track: Track = {
        id: data.id,
        name: data.name,
        artist: data.artist,
        album: data.album,
        albumArt: data.albumArt,
        duration: data.duration,
        position: data.position,
      };

      this.currentState.isPlaying = data.isPlaying;
      this.currentState.track = track;

      return track;
    } catch (error) {
      console.error("Error fetching current track:", error);
      return null;
    }
  }

  public async play(): Promise<void> {
    await this.sendPlaybackCommand("play");
  }

  public async pause(): Promise<void> {
    await this.sendPlaybackCommand("pause");
  }

  public async togglePlayPause(): Promise<void> {
    await this.sendPlaybackCommand("toggle");
  }

  public async nextTrack(): Promise<void> {
    await this.sendPlaybackCommand("next");
  }

  public async previousTrack(): Promise<void> {
    await this.sendPlaybackCommand("previous");
  }

  private async sendPlaybackCommand(action: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
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
