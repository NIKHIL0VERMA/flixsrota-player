import Slider from '@react-native-community/slider';
import { useEffect, useRef, useCallback, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import type { PlayerControlsProps } from '../types';
import { formatTime } from '../utils/time';
import { IconButton } from './IconButton';

export default function DefaultControls(props: PlayerControlsProps) {
  const [showControls, setShowControls] = useState(true);
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [overlayText, setOverlayText] = useState<string | null>(null);
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const DOUBLE_TAP_DELAY = 250; // ms

  let lastTap = 0;
  let tapTimeout: ReturnType<typeof setTimeout> | null = null;

  const handleTap = (direction?: 'forward' | 'backward') => {
    const now = Date.now();

    if (lastTap && now - lastTap < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (tapTimeout) clearTimeout(tapTimeout);
      lastTap = 0;

      if (direction) {
        handleDoubleTap(direction);
      }
    } else {
      // First tap → wait to see if another comes
      lastTap = now;
      tapTimeout = setTimeout(() => {
        showControlHandler(); // single tap action
        lastTap = 0;
      }, DOUBLE_TAP_DELAY);
    }
  };

  const hideControls = useCallback(() => {
    controlsOpacity.stopAnimation(() => {
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowControls(false));
    });
  }, [controlsOpacity]);

  useEffect(() => {
    if (showControls) {
      const timeout = setTimeout(() => hideControls(), 3000);
      return () => clearTimeout(timeout);
    }
    return () => {};
  }, [showControls, hideControls]);

  const showControlHandler = () => {
    controlsOpacity.stopAnimation(() => {
      setShowControls(true);
      Animated.timing(controlsOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const showOverlay = (text: string) => {
    setOverlayText(text);
    overlayAnim.stopAnimation(() => {
      overlayAnim.setValue(0);
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          overlayAnim.stopAnimation(() => {
            Animated.timing(overlayAnim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }).start(() => setOverlayText(null));
          });
        }, 400);
      });
    });
  };

  const handleDoubleTap = (direction: 'forward' | 'backward') => {
    showOverlay(direction === 'forward' ? '+10s' : '-10s');
    props.sendCommand({
      command: 'seekTo',
      seconds:
        props.playerState.currentTime + (direction === 'forward' ? 10 : -10),
    });
  };

  return (
    <View
      style={[
        styles.videoWrapper,
        styles.videoView,
        isLandscape && styles.videoWrapperLandscape,
      ]}
    >
      {/* Video Area */}
      <Pressable style={styles.videoWrapper} onPress={() => handleTap()}>
        {props.children}
        {/* Double tap areas */}
        <Pressable
          style={[styles.doubleTapArea, styles.doubleTapLeft]}
          onPress={() => handleTap('backward')}
        />
        <Pressable
          style={[styles.doubleTapArea, styles.doubleTapRight]}
          onPress={() => handleTap('forward')}
        />

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
      </Pressable>

      {/* Controls */}
      {showControls && (
        <Animated.View style={[styles.controls, { opacity: controlsOpacity }]}>
          <Slider
            style={styles.overlayFlex}
            minimumValue={0}
            maximumValue={props.playerState.duration}
            value={props.playerState.currentTime}
            onSlidingComplete={(value: number) =>
              props.sendCommand({ command: 'seekTo', seconds: value })
            }
            minimumTrackTintColor="#1EB1FC"
            maximumTrackTintColor="#999"
            thumbTintColor="#1EB1FC"
          />

          <View style={styles.timeContainer}>
            <Text style={styles.time}>
              {formatTime(props.playerState.currentTime)} /{' '}
              {formatTime(props.playerState.duration)}
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            {/* Play / Pause */}
            <IconButton
              onPress={() =>
                props.sendCommand(
                  props.playerState.playing ? 'pauseVideo' : 'playVideo'
                )
              }
              name={props.playerState.playing ? 'pause' : 'play'}
            />

            {/* Seek Back */}
            <IconButton
              onPress={() =>
                props.sendCommand({
                  command: 'seekTo',
                  seconds: props.playerState.currentTime - 10,
                })
              }
              name="play-back"
            />

            {/* Seek Forward */}
            <IconButton
              onPress={() =>
                props.sendCommand({
                  command: 'seekTo',
                  seconds: props.playerState.currentTime + 10,
                })
              }
              name="play-forward"
            />

            {/* Mute / Unmute */}
            <IconButton
              onPress={() =>
                props.sendCommand(
                  props.playerState.muted ? 'unMuteVideo' : 'muteVideo'
                )
              }
              name={props.playerState.muted ? 'volume-mute' : 'volume-medium'}
            />

            {/* Fullscreen toggle */}
            <View style={styles.overlayFlex} />
            <IconButton
              onPress={() => props.sendCommand('toggleFullScreen')}
              name={props.playerState.fullscreen ? 'contract' : 'expand'}
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
    width: '100%',
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
    position: 'relative',
    bottom: 50,
    width: '92%',
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
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
