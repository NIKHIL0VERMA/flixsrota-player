import { TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native';
import Ionicons, {
  type IoniconsIconName,
} from '@react-native-vector-icons/ionicons';

export type IconButtonProps = {
  name: IoniconsIconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

export function IconButton({
  name,
  size = 22,
  color = '#fff',
  style,
  onPress,
}: IconButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <Ionicons name={name} size={size} color={color} />
    </TouchableOpacity>
  );
}
