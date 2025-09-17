import { useEffect } from 'react';
import { BackHandler } from 'react-native';

// Try loading Expo's orientation API if available
let ExpoOrientation: typeof import('expo-screen-orientation') | null = null;
try {
  ExpoOrientation = require('expo-screen-orientation');
} catch {}

// Fallback for bare RN: react-native-orientation-locker
let RNOrientation: any = null;
try {
  RNOrientation = require('react-native-orientation-locker');
} catch {}

export function useFullscreenBack(isFullscreen: boolean) {
  useEffect(() => {
    const onBackPress = () => {
      if (isFullscreen) {
        if (ExpoOrientation) {
          // Expo projects
          ExpoOrientation.lockAsync(
            ExpoOrientation.OrientationLock.PORTRAIT_UP
          ).catch(() => {});
          ExpoOrientation.lockAsync(
            ExpoOrientation.OrientationLock.DEFAULT
          ).catch(() => {});
        } else if (RNOrientation) {
          // Bare RN projects
          RNOrientation.lockToPortrait();
          RNOrientation.unlockAllOrientations();
        }
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [isFullscreen]);
}
