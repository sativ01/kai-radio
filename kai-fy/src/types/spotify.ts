export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt?: string;
  duration: number;
  position: number;
}

export interface PlaybackState {
  isPlaying: boolean;
  track: Track | null;
  volume: number;
}

export enum PlaybackAction {
  PLAY = 'play',
  PAUSE = 'pause',
  STOP = 'stop',
  NEXT = 'next',
  PREVIOUS = 'previous',
  TOGGLE = 'toggle',
}
