import { useEffect } from 'react';
import { Platform, StatusBar, Dimensions } from 'react-native';

let ExpoScreenOrientation: any = null;
let RNOrientationLocker: any = null;

try {
  ExpoScreenOrientation = require('expo-screen-orientation');
} catch {
  // not running in expo
}

try {
  RNOrientationLocker = require('react-native-orientation-locker');
} catch {
  // not installed
}

type OrientationChangeCallback = (fullscreen: boolean) => void;

export function useOrientation(
  onChange: OrientationChangeCallback,
  opts: { navigation?: any } = {}
) {
  const { navigation } = opts;

  useEffect(() => {
    const handleFullscreen = (fullscreen: boolean) => {
      if (Platform.OS === 'web') {
        const iframe = document.getElementById(
          'flixsrota-player'
        ) as HTMLIFrameElement | null;
        if (iframe) {
          if (fullscreen) {
            iframe.requestFullscreen?.().catch(() => {});
          } else {
            document.exitFullscreen?.().catch(() => {});
          }
        }
      } else {
        if (ExpoScreenOrientation) {
          ExpoScreenOrientation.lockAsync(
            fullscreen
              ? ExpoScreenOrientation.OrientationLock.LANDSCAPE
              : ExpoScreenOrientation.OrientationLock.DEFAULT
          );
        } else if (RNOrientationLocker) {
          RNOrientationLocker.lockToLandscape?.();
          if (!fullscreen) RNOrientationLocker.unlockAllOrientations?.();
        }

        StatusBar.setHidden(fullscreen);
        navigation?.setOptions?.({
          headerShown: !fullscreen,
          navigationBarHidden: fullscreen,
        });
      }

      onChange(fullscreen);
    };

    // Fallback orientation detection
    const handler = ({ window }: { window: any }) => {
      handleFullscreen(window.width > window.height);
    };
    const sub = Dimensions.addEventListener('change', handler);

    // initial fire
    const { width, height } = Dimensions.get('window');
    handleFullscreen(width > height);

    return () => sub?.remove?.();
  }, [navigation, onChange]);
}
