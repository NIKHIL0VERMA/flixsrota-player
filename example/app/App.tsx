import { SafeAreaView, StyleSheet, View } from 'react-native';
import { PlayerView } from '@flixsrota/player';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.player}>
        <PlayerView
          videoId="_cMxraX_5RE" // example video id
          onReady={() => console.log('ready')}
          onStateChange={(s: number) => console.log('state', s)}
          onTimeUpdate={(c: number, d: number) => console.log('time', c, d)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  player: { flex: 1, alignItems: 'center' },
});
