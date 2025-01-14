import React, { useEffect, useState } from "react";
import { SplashScreen } from "./screens/SplashScreen";
import { NavigationContainer } from "@react-navigation/native";
import AuthNavigator from "./src/navigators/AuthNavigator";
import { StatusBar } from "react-native";
const App = () => {
  // sử dụng usestate để lưu thời gian 1.5 giây
  const [isShowSplash, setIsShowSplash] = useState(true);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsShowSplash(false);
    }, 1500);
    return () => clearTimeout(timeout);
  }, []);
  // dùng dầu ! để phủ định điều kiện
  //background nằm dưới thanh StatusBar
  return (
    <>
      <StatusBar
        barstyle={"dark-content"}
        translucent
        backgroundColor={"transparent"}
      />
      {!isShowSplash ? (
        <SplashScreen />
      ) : (
        <NavigationContainer>
          <AuthNavigator />
        </NavigationContainer>
      )}
    </>
  );
};
export default App;
