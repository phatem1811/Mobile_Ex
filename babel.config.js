
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
  ],
  overrides: [
    {
      test: fileName => !fileName.includes('node_modules'),
      plugins: [[require('@babel/plugin-proposal-class-properties'), { loose: true }]],
    },
  ],
};
