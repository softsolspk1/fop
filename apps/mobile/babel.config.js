process.env.EXPO_ROUTER_APP_ROOT = './app';
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['@babel/plugin-transform-flow-strip-types', { allowDeclareFields: true }],
      'react-native-reanimated/plugin'
    ],
  };
};
