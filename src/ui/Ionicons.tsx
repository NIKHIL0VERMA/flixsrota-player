let Ionicons: any;

try {
  Ionicons = require('@expo/vector-icons').Ionicons;
} catch {
  try {
    Ionicons = require('@react-native-vector-icons/ionicons').default;
  } catch {
    throw new Error(
      '[flixsrota-player] Missing icon dependency. Install either @expo/vector-icons or @react-native-vector-icons/ionicons'
    );
  }
}

export { Ionicons };
