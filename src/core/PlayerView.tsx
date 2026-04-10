import { useRef, useCallback, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import {
  PlayerEvents,
  type PlayerHandle,
  type PlayerState,
  type PlayerViewProps,
} from '../types';
import { parseMessage } from './messaging';
import DefaultControls from '../ui/DefaultControls';
import { useFullscreenBack } from '../hooks/useFullscreenBack';
import { useOrientation } from '../hooks/useOrientation';
import CrossPlatformPlayer from '../ui/CrossPlatformPlayer';
import { useSafeNavigation } from '../hooks/useSafeNavigation';

/**
 * PlayerView wraps the WebView, manages player state,
 * and bridges messages between RN and the YouTube iframe.
 */
export default function PlayerView({
  bundleId,
  videoId,
  onReady,
  onStateChange,
  onTimeUpdate,
}: PlayerViewProps) {
  const [playerState, setPlayerState] = useState<PlayerState>({
    ready: false,
    playing: false,
    muted: false,
    fullscreen: false,
    currentTime: 0,
    duration: 0,
  });

  const playerStateRef = useRef(playerState);
  useEffect(() => {
    playerStateRef.current = playerState;
  }, [playerState]);

  const playerRef = useRef<PlayerHandle>(null);
  const navigation = useSafeNavigation();

  const sendCommand = useCallback(
    (cmd: string | object) => {
      if (cmd === 'toggleFullScreen' && Platform.OS === 'web') {
        setFullscreen(!playerStateRef.current.fullscreen);
      }
      playerRef.current?.postMessage?.(cmd);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // setFullscreen handles its own deps
  );

  const handleShortcut = useCallback(
    (key: string, code: string, ctrlKey: boolean) => {
      const state = playerStateRef.current;
      if (!state) return;

      if (key.toLowerCase() === 'f') {
        sendCommand('toggleFullScreen');
      } else if (code === 'Space') {
        sendCommand(state.playing ? 'pauseVideo' : 'playVideo');
      } else if (key.toLowerCase() === 'm' && ctrlKey) {
        sendCommand(state.muted ? 'unMuteVideo' : 'muteVideo');
      } else if (code === 'ArrowRight' && ctrlKey) {
        sendCommand({ command: 'seekTo', seconds: state.currentTime + 10 });
      } else if (code === 'ArrowLeft' && ctrlKey) {
        sendCommand({ command: 'seekTo', seconds: state.currentTime - 10 });
      }
    },
    [sendCommand]
  );

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' ||
        (e.ctrlKey &&
          ['m', 'ArrowRight', 'ArrowLeft'].includes(
            e.key.toLowerCase() || e.code
          ))
      ) {
        e.preventDefault();
      }
      handleShortcut(e.key, e.code, e.ctrlKey);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleShortcut]);

  // Back button handler when in fullscreen
  useFullscreenBack(playerState.fullscreen);

  // Orientation listener
  const handleOrientation = useCallback(
    (fullscreen: boolean) => {
      setPlayerState((s) => ({ ...s, fullscreen }));
    },
    [] // stable identity
  );

  const { setFullscreen } = useOrientation(handleOrientation, { navigation });

  return (
    <DefaultControls sendCommand={sendCommand} playerState={playerState}>
      <CrossPlatformPlayer
        bundleId={bundleId}
        videoId={videoId}
        ref={playerRef}
        onMessage={(event) => {
          const data = parseMessage(event.nativeEvent.data);
          if (!data) return;

          switch (data.eventType) {
            case PlayerEvents.Ready:
              setPlayerState((s) => ({ ...s, ready: true }));
              onReady?.();
              break;
            case PlayerEvents.StateChange:
              const playing = data.data === 1;
              setPlayerState((s) => ({ ...s, playing }));
              onStateChange?.(data.data);
              break;
            case PlayerEvents.MuteChange:
              setPlayerState((s) => ({ ...s, muted: data.data }));
              break;
            case PlayerEvents.TimeUpdate:
              setPlayerState((s) => ({
                ...s,
                currentTime: data.currentTime || 0,
                duration: data.duration || 0,
              }));
              onTimeUpdate?.(data.currentTime || 0, data.duration || 0);
              break;
            case PlayerEvents.FullscreenChange:
              if (Platform.OS !== 'web') {
                setFullscreen(!playerState.fullscreen);
              }
              break;
            case PlayerEvents.OverlayClick:
              setPlayerState((s) => ({ ...s, lastTapTime: Date.now() }));
              break;
            case PlayerEvents.KeyDown:
              handleShortcut(data.data.key, data.data.code, data.data.ctrlKey);
              break;
            case PlayerEvents.PlayerQualityChange:
              console.log('Player Quality Change:', data.data);
              break;
            case PlayerEvents.PlaybackRateChange:
              console.log('Player Playback Rate Change:', data.data);
              break;
            case PlayerEvents.PlayerError:
              console.error('Player Error:', data.data);
              break;
            default:
              console.warn('Unhandled event from player:', data);
              break;
          }
        }}
      />
    </DefaultControls>
  );
}
