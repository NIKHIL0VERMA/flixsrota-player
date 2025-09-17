let realUseNavigation: any = () => null;

try {
  const mod = require('@react-navigation/native');
  realUseNavigation = mod.useNavigation;
} catch {
  realUseNavigation = () => null;
}

export function useSafeNavigation() {
  try {
    return realUseNavigation();
  } catch {
    return null;
  }
}
