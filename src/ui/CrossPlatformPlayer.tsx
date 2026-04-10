import { Platform, View, Text } from 'react-native';
import { StyleSheet } from 'react-native';
import { youtubeHTML } from '../utils/youtube';
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useMemo,
  useEffect,
} from 'react';
import { type PlayerHandle } from '../types';
let WebView: any = null;
if (Platform.OS !== 'web') {
  try {
    WebView = require('react-native-webview').WebView;
  } catch (e) {
    console.warn(
      e,
      '\n',
      '[flixsrota-player] react-native-webview is not installed. Please run: expo install react-native-webview or npm install react-native-webview'
    );
    WebView = null;
  }
}

type PlayerViewProps = {
  bundleId: string;
  videoId: string;
  onMessage?: (event: any) => void;
};

/**
 * Cross-platform wrapper that returns:
 * - <iframe> on web
 * - <WebView> on native (if installed)
 * - Error fallback if WebView not installed
 */
const CrossPlatformPlayer = forwardRef<PlayerHandle, PlayerViewProps>(
  ({ bundleId, videoId, onMessage }, ref) => {
    const webviewRef = useRef<any>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const source = useMemo(
      () => ({ html: youtubeHTML(videoId), baseUrl: `https://${bundleId}` }),
      [videoId, bundleId]
    );

    // Listen for messages from iframe on web
    useEffect(() => {
      if (Platform.OS !== 'web') return;

      const handleMessage = (event: MessageEvent) => {
        // Wrap in nativeEvent.data structure expected by parseMessage
        onMessage?.({ nativeEvent: { data: event.data } });
      };
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }, [onMessage]);

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      postMessage: (cmd: string | object) => {
        const wrapped = JSON.stringify(
          typeof cmd === 'string' ? { command: cmd } : cmd
        );
        if (Platform.OS === 'web' && iframeRef.current) {
          iframeRef.current.contentWindow?.postMessage(wrapped, '*');
        } else if (webviewRef.current) {
          webviewRef.current.postMessage(wrapped);
        }
      },
    }));

    if (Platform.OS === 'web') {
      return (
        <View style={styles.iframeView}>
          <iframe
            ref={iframeRef}
            srcDoc={youtubeHTML(videoId)}
            id="flixsrota-player"
            width="100%"
            height="100%"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope"
            style={styles.noBorder}
          />
        </View>
      );
    }

    if (!WebView) {
      return (
        <View style={styles.padding20}>
          <Text>
            ❌ react-native-webview is not installed. Please run:
            {'\n'}
            expo install react-native-webview or npm install
            react-native-webview
          </Text>
        </View>
      );
    }

    return (
      <WebView
        javaScriptEnabled
        ref={webviewRef}
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        source={source}
        originWhitelist={['*']}
        onMessage={onMessage}
      />
    );
  }
);

const styles = StyleSheet.create({
  iframeView: { width: '100%', aspectRatio: 16 / 9 },
  noBorder: { borderWidth: 0 },
  padding20: { padding: 20 },
});

export default CrossPlatformPlayer;
