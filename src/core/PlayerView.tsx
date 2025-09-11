import { useRef, useCallback, useState } from 'react';
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
  videoId,
  onReady,
  onStateChange,
  onTimeUpdate,
  ControlsComponent = DefaultControls,
}: PlayerViewProps) {
  const [playerState, setPlayerState] = useState<PlayerState>({
    ready: false,
    playing: false,
    muted: false,
    fullscreen: false,
    currentTime: 0,
    duration: 0,
  });

  const playerRef = useRef<PlayerHandle>(null);
  const navigation = useSafeNavigation();

  const sendCommand = (cmd: string | object) => {
    playerRef.current?.postMessage?.(cmd);
  };

  // Back button handler when in fullscreen
  useFullscreenBack(playerState.fullscreen);

  // Orientation listener
  const handleOrientation = useCallback(
    (fullscreen: boolean) => {
      setPlayerState((s) => ({ ...s, fullscreen }));
    },
    [] // stable identity
  );

  useOrientation(handleOrientation, { navigation });

  return (
    <ControlsComponent sendCommand={sendCommand} playerState={playerState}>
      <CrossPlatformPlayer
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
              }));
              onTimeUpdate?.(data.currentTime || 0, data.duration || 0);
              break;
            // case PlayerEvents.FullscreenChange:
            //   if (!playerState.fullscreen) {
            //     ScreenOrientation.lockAsync(
            //       ScreenOrientation.OrientationLock.LANDSCAPE
            //     );
            //   } else {
            //     ScreenOrientation.lockAsync(
            //       ScreenOrientation.OrientationLock.DEFAULT
            //     );
            //   }
            //   break;
            default:
              console.warn('Unhandled event from player:', data);
              break;
          }
        }}
      />
    </ControlsComponent>
  );
}
