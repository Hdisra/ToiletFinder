const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// Metro (the bundler) with Expo defaults, plus NativeWind reading the Tailwind CSS entry file.
const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './src/global.css' });
