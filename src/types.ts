import React from 'react';

export enum PlayerEvents {
  Ready = 'playerReady',
  StateChange = 'playerStateChange',
  TimeUpdate = 'timeUpdate',
  MuteChange = 'muteChange',
  FullscreenChange = 'fullScreenChange',
}

export const YTPlayerStateLabels: Record<number, string> = {
  0: 'Ended',
  1: 'Playing',
  2: 'Paused',
  3: 'Buffering',
  4: 'Video Cued',
};

export type PlayerMessage = {
  eventType: PlayerEvents | string;
  data?: any;
  currentTime?: number;
  duration?: number;
};

export type PlayerState = {
  ready: boolean;
  playing: boolean;
  muted: boolean;
  fullscreen: boolean;
  currentTime: number;
  duration: number;
};

export type PlayerViewProps = {
  videoId: string;
  onReady?: () => void;
  onStateChange?: (state: number) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  ControlsComponent?: React.ComponentType<PlayerControlsProps>;
};

export type PlayerControlsProps = {
  children?: React.ReactNode;
  sendCommand: (cmd: any) => void;
  playerState: PlayerState;
};

export type PlayerHandle = { postMessage?: (msg: any) => void };
