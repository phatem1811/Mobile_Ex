import React, { useState, useCallback } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import axios from "axios";
import debounce from "lodash.debounce";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";

type Suggestion = {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
};

type SelectedLocation = {
  lat: number;
  lon: number;
  display_name: string;
};

const LOCATIONIQ_API_KEY = "pk.2b0fee32045c1896341b402c43932395";

const SearchLocationScreen: React.FC = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);
  const fixedLocation = { latitude: 10.850317, longitude: 106.772936 };
  const fetchAutocomplete = async (text: string) => {
    if (text.length < 3) return;
    try {
      const response = await axios.get(
        `https://api.locationiq.com/v1/autocomplete?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(
          text
        )}&limit=5&countrycodes=vn`
      );

      if (response.status === 429) {
        console.warn("Quá nhiều request. Hãy thử lại sau.");
        return;
      }

      // Lọc dữ liệu trùng lặp
      const uniqueSuggestions: Suggestion[] = response.data.filter(
        (item: Suggestion, index: number, self: Suggestion[]) =>
          index === self.findIndex((s) => s.place_id === item.place_id)
      );
      setSuggestions(uniqueSuggestions);
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.error("API Key không hợp lệ hoặc bị giới hạn.");
      } else {
        console.error("Lỗi khi lấy dữ liệu:", error.message);
      }
    }
  };

  // Sử dụng debounce để hạn chế số lần gọi API
  const debouncedFetch = useCallback(debounce(fetchAutocomplete, 500), []);

  const getDistanceFromLatLonInKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  };
  const handleInputChange = (text: string) => {
    setQuery(text);
    debouncedFetch(text);
  };

  const selectLocation = (location: Suggestion) => {
    const selected: SelectedLocation = {
      lat: parseFloat(location.lat),
      lon: parseFloat(location.lon),
      display_name: location.display_name,
    };
    setSelectedLocation(selected);

    const distance = getDistanceFromLatLonInKm(
      fixedLocation.latitude,
      fixedLocation.longitude,
      selected.lat,
      selected.lon
    );
    if (distance > 30) {
      alert("⚠️ Vị trí giao hàng vượt quá phạm vi 30km.");
      return;
    }

    router.push({
      pathname: "/order/checkoutScreen",
      params: {
        address: selected.display_name,
        distance: parseFloat(distance.toFixed(2)),
      },
    });

    setSuggestions([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nhập địa chỉ..."
        value={query}
        onChangeText={handleInputChange}
      />

      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item, index) => `${item.place_id}-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => selectLocation(item)}
            >
              <Text style={styles.suggestionText}>{item.display_name}</Text>
            </TouchableOpacity>
          )}
          style={styles.suggestionsList}
        />
      )}

      <TouchableOpacity
        style={styles.mapButton}
        onPress={() => router.push("/order/mapScreen")}
      >
        <Text style={styles.mapButtonText}>Chọn vị trí từ bản đồ</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  input: {
    height: 45,
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
    alignSelf: "center",
    width: "90%", // Chỉ chiếm 90% chiều rộng
  },
  suggestionsList: {
    backgroundColor: "#fff",
    borderRadius: 10,
    maxHeight: 200,
    marginBottom: 10,
    alignSelf: "center",
    width: "90%",
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  suggestionText: {
    fontSize: 15,
    color: "#333",
  },
  selectedLocationCard: {
    padding: 15,
    backgroundColor: "#e0f7fa",
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
    alignSelf: "center",
    width: "90%",
  },
  selectedLocationText: {
    fontSize: 16,
    color: "#00796b",
  },
  // Nút được cố định ở cuối màn hình
  mapButton: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#007bff",
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 100,
    alignItems: "center",
    zIndex: 999, // Đảm bảo nút nằm trên các thành phần khác
    elevation: 10,
  },
  mapButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 40,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  headerTextWrapper: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#666",
  },
});

export default SearchLocationScreen;
