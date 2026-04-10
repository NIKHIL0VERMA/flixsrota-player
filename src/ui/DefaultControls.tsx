import Slider from '@react-native-community/slider';
import { useEffect, useRef, useCallback, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';

import type { PlayerControlsProps } from '../types';
import { formatTime } from '../utils/time';
import { IconButton } from './IconButton';

export default function DefaultControls({
  sendCommand,
  playerState,
  children,
}: PlayerControlsProps) {
  const [showControls, setShowControls] = useState(true);
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const [overlayText, setOverlayText] = useState<string | null>(null);
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const DOUBLE_TAP_DELAY = 250; // ms
  const useNativeDriver = Platform.OS !== 'web';

  const lastTap = useRef(0);
  const tapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideControls = useCallback(() => {
    controlsOpacity.stopAnimation(() => {
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver,
      }).start(() => setShowControls(false));
    });
  }, [controlsOpacity, useNativeDriver]);

  useEffect(() => {
    if (showControls) {
      const timeout = setTimeout(() => hideControls(), 3000);
      return () => clearTimeout(timeout);
    }
    return () => {};
  }, [showControls, hideControls]);

  const showControlHandler = useCallback(() => {
    controlsOpacity.stopAnimation(() => {
      setShowControls(true);
      Animated.timing(controlsOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver,
      }).start();
    });
  }, [controlsOpacity, useNativeDriver]);

  const showOverlay = useCallback(
    (text: string) => {
      setOverlayText(text);
      overlayAnim.stopAnimation(() => {
        overlayAnim.setValue(0);
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver,
        }).start(() => {
          setTimeout(() => {
            overlayAnim.stopAnimation(() => {
              Animated.timing(overlayAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver,
              }).start(() => setOverlayText(null));
            });
          }, 400);
        });
      });
    },
    [overlayAnim, useNativeDriver]
  );

  const handleDoubleTap = useCallback(
    (direction: 'forward' | 'backward') => {
      showOverlay(direction === 'forward' ? '+10s' : '-10s');
      sendCommand({
        command: 'seekTo',
        seconds: playerState.currentTime + (direction === 'forward' ? 10 : -10),
      });
    },
    [sendCommand, playerState.currentTime, showOverlay]
  );

  const handleTap = useCallback(
    (direction?: 'forward' | 'backward') => {
      if (Platform.OS === 'web') {
        if (!direction) {
          showControlHandler();
        }
        return;
      }

      const now = Date.now();

      if (lastTap.current && now - lastTap.current < DOUBLE_TAP_DELAY) {
        // Double tap detected
        if (tapTimeout.current) clearTimeout(tapTimeout.current);
        lastTap.current = 0;

        if (direction) {
          handleDoubleTap(direction);
        }
      } else {
        // First tap → wait to see if another comes
        lastTap.current = now;
        tapTimeout.current = setTimeout(() => {
          showControlHandler(); // single tap action
          lastTap.current = 0;
        }, DOUBLE_TAP_DELAY);
      }
    },
    [handleDoubleTap, showControlHandler]
  );

  return (
    <View
      id="flixsrota-player-container"
      style={[
        styles.videoWrapper,
        styles.videoView,
        playerState.fullscreen && styles.videoWrapperLandscape,
      ]}
    >
      {/* Video Area */}
      <View id="ui-gesture-view" style={styles.videoWrapper}>
        {children}
        {/* Double tap areas */}
        {Platform.OS !== 'web' && (
          <>
            <Pressable
              id="ui-gesture-left"
              style={[styles.doubleTapArea, styles.doubleTapLeft]}
              onPress={() => handleTap('backward')}
            />
            <Pressable
              id="ui-gesture-right"
              style={[styles.doubleTapArea, styles.doubleTapRight]}
              onPress={() => handleTap('forward')}
            />
          </>
        )}

        {/* Overlay animation */}
        {overlayText && (
          <Animated.View
            style={[
              styles.overlayTextContainer,
              { opacity: overlayAnim, transform: [{ scale: overlayAnim }] },
            ]}
          >
            <Text style={styles.overlayText}>{overlayText}</Text>
          </Animated.View>
        )}
      </View>

      {/* Controls */}
      {showControls && (
        <Animated.View style={[styles.controls, { opacity: controlsOpacity }]}>
          <Slider
            style={styles.overlayFlex}
            minimumValue={0}
            maximumValue={Math.max(playerState.duration, 0.01)}
            value={playerState.currentTime}
            onSlidingComplete={(value: number) =>
              sendCommand({ command: 'seekTo', seconds: value })
            }
            minimumTrackTintColor="#1EB1FC"
            maximumTrackTintColor="#999"
            thumbTintColor="#1EB1FC"
          />

          <View style={styles.timeContainer}>
            <Text style={styles.time}>
              {formatTime(playerState.currentTime)} /{' '}
              {formatTime(playerState.duration)}
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            {/* Play / Pause */}
            <IconButton
              onPress={() =>
                sendCommand(playerState.playing ? 'pauseVideo' : 'playVideo')
              }
              name={playerState.playing ? 'pause' : 'play'}
            />

            {/* Seek Back */}
            <IconButton
              style={styles.space}
              onPress={() =>
                sendCommand({
                  command: 'seekTo',
                  seconds: playerState.currentTime - 10,
                })
              }
              name="play-back"
            />

            {/* Seek Forward */}
            <IconButton
              style={styles.space}
              onPress={() =>
                sendCommand({
                  command: 'seekTo',
                  seconds: playerState.currentTime + 10,
                })
              }
              name="play-forward"
            />

            {/* Mute / Unmute */}
            <IconButton
              style={styles.space}
              onPress={() =>
                sendCommand(playerState.muted ? 'unMuteVideo' : 'muteVideo')
              }
              name={playerState.muted ? 'volume-mute' : 'volume-medium'}
            />

            {/* Fullscreen toggle */}
            <View style={styles.overlayFlex} />
            <IconButton
              onPress={() => sendCommand('toggleFullScreen')}
              name={playerState.fullscreen ? 'contract' : 'expand'}
            />
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  videoWrapperLandscape: {
    height: '100%',
  },
  doubleTapLeft: { left: 0 },
  doubleTapRight: { right: 0 },
  overlayFlex: { flex: 1 },
  videoWrapper: {
    ...(Platform.OS === 'web' ? { flex: 1 } : { width: '100%' }),
    aspectRatio: 16 / 9,
    backgroundColor: '#111',
  },
  videoView: {
    alignItems: 'center',
  },
  doubleTapArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '25%',
  },
  overlayTextContainer: {
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0006',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  overlayText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  controls: {
    position: 'absolute',
    bottom: 5,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    width: '100%',
    alignSelf: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  time: {
    color: '#fff',
    fontSize: 12,
  },
  space: {
    marginLeft: 12,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
