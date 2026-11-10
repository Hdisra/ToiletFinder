import { Image, View } from "react-native";

// Same image and color as the native splash screen (see app.json), so the hand-off is seamless.
const SPLASH_BACKGROUND = "#066DF9";

/** Full-screen splash shown while the saved session is being restored. */
export function SplashView() {
  return (
    <View
      className="absolute inset-0 items-center justify-center"
      style={{ backgroundColor: SPLASH_BACKGROUND }}
    >
      <Image
        source={require("../../assets/images/splash-icon.png")}
        style={{ width: 320, height: 320 }}
        resizeMode="contain"
      />
    </View>
  );
}
