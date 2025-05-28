import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import MapView, {
  PROVIDER_GOOGLE,
  MapPressEvent,
  Marker,
  Polyline,
} from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";

export default function AddressSearchScreen() {
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: 10.7769,
    longitude: 106.7009,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });

  const fixedLocation = { latitude: 10.850317, longitude: 106.772936 }; // ví dụ địa điểm cố định
  const [routeCoords, setRouteCoords] = useState<
    Array<{ latitude: number; longitude: number }>
  >([]);
  const [distanceText, setDistanceText] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isTooFar, setIsTooFar] = useState(false);

  const router = useRouter();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Quyền truy cập vị trí bị từ chối!");
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      const coords = currentLocation.coords;

      setLocation(coords);
      setSelectedLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      setRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      fetchAddress(coords.latitude, coords.longitude);
      fetchDistance(coords.latitude, coords.longitude);
      fetchRoute(coords.latitude, coords.longitude);
      setLoading(false);
    })();
  }, []);
  const fetchRoute = async (lat: number, lng: number) => {
    const from = `${lng},${lat}`;
    const to = `${fixedLocation.longitude},${fixedLocation.latitude}`;
    const apiKey = "pk.2b0fee32045c1896341b402c43932395";

    try {
      const res = await fetch(
        `https://us1.locationiq.com/v1/directions/driving/${from};${to}?key=${apiKey}&overview=full&geometries=geojson`
      );
      const data = await res.json();

      if (data.routes?.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map(
          ([lon, lat]: [number, number]) => ({
            latitude: lat,
            longitude: lon,
          })
        );
        setRouteCoords(coords);
      }
    } catch (err) {
      console.error("Lỗi khi vẽ tuyến đường:", err);
    }
  };

  const fetchAddress = async (latitude: number, longitude: number) => {
    try {
      const response = await Promise.race([
        Location.reverseGeocodeAsync({ latitude, longitude }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request Timeout")), 5000)
        ),
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
    setSelectedLocation(coordinate);
    setRegion({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });

    fetchAddress(coordinate.latitude, coordinate.longitude);
    fetchDistance(coordinate.latitude, coordinate.longitude);
    fetchRoute(coordinate.latitude, coordinate.longitude);
  };

  const fetchDistance = async (lat: number, lng: number) => {
    const from = `${lng},${lat}`;
    const to = `${fixedLocation.longitude},${fixedLocation.latitude}`;
    const apiKey = "pk.2b0fee32045c1896341b402c43932395";

    try {
      const response = await fetch(
        `https://us1.locationiq.com/v1/directions/driving/${from};${to}?key=${apiKey}&overview=false`
      );
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const distanceInMeters = data.routes[0].distance;
        const durationInSeconds = data.routes[0].duration;

        const distanceInKm = parseFloat((distanceInMeters / 1000).toFixed(2));
        setDistance(distanceInKm);
        const formattedDistance = distanceInKm.toFixed(2);
        const durationInMin = Math.ceil(durationInSeconds / 60);

        setDistanceText(`${formattedDistance} km (${durationInMin} phút)`);
        setIsTooFar(distanceInKm > 30);
      } else {
        setDistanceText("Không tìm thấy đường đi.");
        setIsTooFar(false);
      }
    } catch (error) {
      console.error("Lỗi khi lấy quãng đường:", error);
      setDistanceText("Không thể tính khoảng cách.");
      setIsTooFar(false);
    }
  };

  const handleSelectLocation = () => {
    if (!selectedLocation || isTooFar) return;
    router.push({
      pathname: "/order/checkoutScreen",
      params: {
        address: address,
        distance: distance,
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
        <Marker
          coordinate={fixedLocation}
          title="Cửa hàng"
          description="Địa điểm cố định"
          pinColor="green"
        />
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#1E90FF"
            strokeWidth={4}
          />
        )}
      </MapView>

      {selectedLocation && (
        <View style={styles.bottomCard}>
          <Text style={styles.addressText}>
            {address ?? "Đang lấy địa chỉ..."}
          </Text>
          {distanceText && (
            <Text style={styles.distanceText}>Khoảng cách: {distanceText}</Text>
          )}
          {isTooFar && (
            <Text style={styles.warningText}>
              ⚠️ Vị trí quá xa (hơn 30km). Không thể giao hàng đến địa điểm này.
            </Text>
          )}
          <TouchableOpacity
            style={[styles.selectButton, isTooFar && styles.disabledButton]}
            onPress={handleSelectLocation}
            disabled={isTooFar}
          >
            <Text style={styles.selectButtonText}>
              {isTooFar ? "Không thể chọn" : "Chọn điểm này"}
            </Text>
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
  distanceText: {
    fontSize: 14,
    color: "gray",
    marginBottom: 10,
  },
  warningText: {
    color: "red",
    fontSize: 14,
    marginBottom: 8,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
});
