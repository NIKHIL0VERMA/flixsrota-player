import { useEffect, useCallback } from 'react';
import { Platform, StatusBar, Dimensions } from 'react-native';

let ExpoScreenOrientation: any = null;
let RNOrientationLocker: any = null;

try {
  ExpoScreenOrientation = require('expo-screen-orientation');
} catch {}
try {
  RNOrientationLocker = require('react-native-orientation-locker');
} catch {}

type OrientationChangeCallback = (fullscreen: boolean) => void;

export function useOrientation(
  onChange: OrientationChangeCallback,
  opts: { navigation?: any } = {}
) {
  const { navigation } = opts;

  const setFullscreen = useCallback(
    async (fullscreen: boolean) => {
      if (Platform.OS === 'web') {
        const iframe = document.getElementById(
          'flixsrota-player-container'
        ) as HTMLElement | null;
        if (iframe) {
          if (fullscreen) {
            iframe.requestFullscreen?.().catch(() => {});
          } else {
            document.exitFullscreen?.().catch(() => {});
          }
        }
        onChange(fullscreen);
        return;
      }

      // Native logic (async)
      if (ExpoScreenOrientation) {
        await ExpoScreenOrientation.lockAsync(
          fullscreen
            ? ExpoScreenOrientation.OrientationLock.LANDSCAPE
            : ExpoScreenOrientation.OrientationLock.PORTRAIT_UP
        );
        !fullscreen &&
          (await ExpoScreenOrientation.lockAsync(
            ExpoScreenOrientation.OrientationLock.DEFAULT
          )); // support auto-rotate after exiting fullscreen
      } else if (RNOrientationLocker) {
        if (fullscreen) {
          RNOrientationLocker.lockToLandscape?.();
        } else {
          RNOrientationLocker.lockToPortrait?.();
          RNOrientationLocker.unlockAllOrientations?.(); // support auto-rotate after exiting fullscreen
        }
      }
      StatusBar.setHidden(fullscreen);
      navigation?.setOptions?.({
        headerShown: !fullscreen,
        navigationBarHidden: fullscreen,
      });

      onChange(fullscreen);
    },
    [navigation, onChange]
  );

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleFullscreenChange = () => {
        setFullscreen(!!document.fullscreenElement);
      };
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => {
        document.removeEventListener(
          'fullscreenchange',
          handleFullscreenChange
        );
      };
    }

    const handler = ({ window }: { window: any }) => {
      setFullscreen(window.width > window.height);
    };
    const sub = Dimensions.addEventListener('change', handler);

    const { width, height } = Dimensions.get('window');
    setFullscreen(width > height);

    return () => sub?.remove?.();
  }, [setFullscreen, onChange]);

  return { setFullscreen };
}
