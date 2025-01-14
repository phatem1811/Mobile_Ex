import React from "react";
import { ActivityIndicator, Image, ImageBackground } from "react-native";
import { appInfo } from "../constants/appInfos";
import { appColors } from "../constants/appColor";
import SpaceComponent  from "../components/SpaceComponent";
const SplashScreenComponent  = () => {
  return (
    <ImageBackground
      source={require("../assets/images/splash-img.png")}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
      imageStyle={{ flex: 1 }}
    >
      <Image
        source={require("../assets/images/logo1.png")}

        style={{
          width: appInfo.sizes.WIDTH * 0.7,
          resizeMode: "contain",
        }}
      />
      <SpaceComponent height={16} />
      <ActivityIndicator color={appColors.gray} size={22} />
    </ImageBackground>
  );
};
export default SplashScreenComponent ;
