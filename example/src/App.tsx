import { View, Text, StyleSheet } from 'react-native';
import { PlayerView } from '@flixsrota/player';
import { useState } from 'react';

export default function App() {
  // This is just an example, you can use the player in any way you want
  // For example, you can use it in a screen or a component
  // You can also use the player with a video id from public youtube videos
  // Just make sure to pass the video id to the PlayerView component

  let isReady = useState(false);
  let state = useState(0);
  let currentTime = useState(0);
  let duration = useState(0);
  return (
    <View style={styles.player}>
      <PlayerView
        videoId="_cMxraX_5RE" // example video id
        onReady={() => isReady[1](true)}
        onStateChange={(s: number) => state[1](s)}
        onTimeUpdate={(c: number, d: number) => {
          currentTime[1](c);
          duration[1](d);
        }}
      />

      <Text>Flixsrota Player Example</Text>
      <Text>Ready: {isReady[0] ? 'Yes' : 'No'}</Text>
      <Text>State: {state[0]}</Text>
      <Text>Current Time: {currentTime[0]}</Text>
      <Text>Duration: {duration[0]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  player: { flex: 1, alignItems: 'center' },
});
