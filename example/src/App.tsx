import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import { PlayerView, YTPlayerStateLabels } from '@flixsrota/player';
import { useState } from 'react';

export default function App() {
  const [input, setInput] = useState('');
  const [videoId, setVideoId] = useState('_cMxraX_5RE'); // default video
  const [isReady, setIsReady] = useState(false);
  const [playerState, setPlayerState] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const extractVideoId = (urlOrId: string): string => {
    const regex = /(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/)([^"&?/ ]{11})/;

    const match = urlOrId.match(regex);

    if (match && match[1]) {
      return match[1];
    }

    if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
      return urlOrId;
    }

    return '';
  };

  return (
    <View style={styles.container}>
      {/* Player */}
      <View style={styles.playerContainer}>
        <PlayerView
          videoId={videoId}
          onReady={() => setIsReady(true)}
          onStateChange={(s: number) => setPlayerState(s)}
          onTimeUpdate={(c: number, d: number) => {
            setCurrentTime(c);
            setDuration(d);
          }}
        />
      </View>
      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title}>🎬 Flixsrota Player Example</Text>
        <Text>Video ID: {videoId}</Text>
        <Text>✅ Ready: {isReady ? 'Yes' : 'No'}</Text>
        <Text>📺 State: {YTPlayerStateLabels[playerState] ?? playerState}</Text>
        <Text>⏱️ Current Time: {currentTime.toFixed(1)}s</Text>
        <Text>⏳ Duration: {duration.toFixed(1)}s</Text>

        {/* Input section */}
        <View style={styles.inputBox}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter YouTube URL or ID"
            value={input}
            onChangeText={setInput}
          />
          <Button
            title="Load Video"
            onPress={() => setVideoId(extractVideoId(input))}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  playerContainer: { alignItems: 'center' },
  inputBox: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  textInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 8,
    borderRadius: 6,
    height: 40,
    backgroundColor: '#fff',
  },
  info: {
    flex: 1,
    padding: 16,
    alignItems: 'flex-start',
  },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
});
