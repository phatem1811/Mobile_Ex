import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import MapView, { PROVIDER_GOOGLE, MapPressEvent, Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useFocusEffect, useRouter } from "expo-router";

export default function AddressSearchScreen() {
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
    const router = useRouter();
  const [region, setRegion] = useState({
    latitude: 10.7769,
    longitude: 106.7009,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Quyền truy cập vị trí bị từ chối!");
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
      setSelectedLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      setRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      // Lấy địa chỉ tương ứng với vị trí hiện tại
      fetchAddress(currentLocation.coords.latitude, currentLocation.coords.longitude);
      setLoading(false);
    })();
  }, []);
  const fetchAddress = async (latitude: number, longitude: number) => {
    try {
      const response = await Promise.race([
        Location.reverseGeocodeAsync({ latitude, longitude }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Request Timeout")), 5000)) // Timeout sau 5 giây
      ]);
  
      if (Array.isArray(response) && response.length > 0) {
        let formattedAddress = `${response[0].name}, ${response[0].street}, ${response[0].city}, ${response[0].region}`;
        setAddress(formattedAddress);
      } else {
        setAddress("Không tìm thấy địa chỉ!");
      }
    } catch (error) {
      console.error("Lỗi lấy địa chỉ:", error);
      setAddress("Lỗi lấy địa chỉ, vui lòng thử lại!");
    }
  };

  const handleMapPress = (event: MapPressEvent) => {
    const { coordinate } = event.nativeEvent;
    console.log("Vị trí mới:", coordinate);
    setSelectedLocation(coordinate);
    setRegion({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });

    // Lấy địa chỉ mới
    fetchAddress(coordinate.latitude, coordinate.longitude);
  };

  const handleSelectLocation = () => {
    console.log("Địa điểm đã chọn:", selectedLocation, "Địa chỉ:", address);
    router.push({
      pathname: "/order/checkoutScreen",
      params: {
        address: address,

      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (errorMsg) {
    return <Text style={styles.errorText}>{errorMsg}</Text>;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        showsUserLocation
        showsMyLocationButton
        onPress={handleMapPress}
      >
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title="Vị trí đã chọn"
            description="Đây là vị trí bạn đã chọn trên bản đồ."
          />
        )}
      </MapView>

      {/* Thẻ hiển thị địa chỉ và button chọn */}
      {selectedLocation && (
        <View style={styles.bottomCard}>
          <Text style={styles.addressText}>
            {address ? address : "Đang lấy địa chỉ..."}
          </Text>
          <TouchableOpacity style={styles.selectButton} onPress={handleSelectLocation}>
            <Text style={styles.selectButtonText}>Chọn điểm này</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  errorText: { textAlign: "center", color: "red", marginTop: 10, fontSize: 16 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  bottomCard: {
    position: "absolute",
    bottom: 20,
    left: 20,
    marginBottom: 100,
    right: 20,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addressText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
  selectButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  selectButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

