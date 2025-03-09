import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import SplashScreenComponent from "./splashscreen";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();

    if (loaded) {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, [loaded]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {loading ? (
        <SplashScreenComponent></SplashScreenComponent>
      ) : (
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="auth/RegisterScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="auth/FogetPasswordScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="auth/VerifyOtpScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="auth/VerifyResetPassScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="auth/SearchScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="auth/CartScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="auth/product/[id]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="order/orderDetailScreen"
            options={{ title: "Chi tiết đơn hàng" }}
          />

          <Stack.Screen name="+not-found" />
        </Stack>
      )}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
