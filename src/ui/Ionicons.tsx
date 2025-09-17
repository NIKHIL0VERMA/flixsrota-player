let Ionicons: any;
try {
  Ionicons = require('@expo/vector-icons').Ionicons;
} catch {
  Ionicons = require('react-native-vector-icons/Ionicons').default;
}

export { Ionicons };
