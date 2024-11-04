module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv'],
      ['@aws-amplify/ui-react-native/babel-plugin'],
    ],
  };
}