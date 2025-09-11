const path = require('path');

module.exports = (async () => {
  const expoMetroConfig = await import('@expo/metro-config');
  const monorepoConfig = await import('react-native-monorepo-config');

  const getDefaultConfig = expoMetroConfig.getDefaultConfig;
  const withMetroConfig = monorepoConfig.withMetroConfig;

  const root = path.resolve(__dirname, '..');

  const config = withMetroConfig(getDefaultConfig(__dirname), {
    root,
    dirname: __dirname,
  });

  config.resolver.unstable_enablePackageExports = true;

  return config;
})();
