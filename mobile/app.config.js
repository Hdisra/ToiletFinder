// Extends app.json. The Google Maps keys come from .env and are not committed.
module.exports = ({ config }) => {
  const iosGoogleMapsApiKey = process.env.GOOGLE_MAPS_IOS_API_KEY;
  const androidGoogleMapsApiKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;

  return {
    ...config,
    plugins: [
      ...(config.plugins ?? []),
      ...(iosGoogleMapsApiKey || androidGoogleMapsApiKey
        ? [
            [
              "react-native-maps",
              { iosGoogleMapsApiKey, androidGoogleMapsApiKey },
            ],
          ]
        : []),
    ],
  };
};
