import { TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from './Ionicons';

export type IconButtonProps = {
  name: string;
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
