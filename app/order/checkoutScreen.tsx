import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [voucher, setVoucher] = useState("");
  const [discount, setDiscount] = useState(0);
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
  const data = useLocalSearchParams();

  useEffect(() => {
    if (data.address && typeof data.address === "string") {
      setAddress(data.address);
      setLoading(false);
      console.log("check data", data.address);
    } else {
      (async () => {
        console.log("đang lấy vị trí");
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
        fetchAddress(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude
        );
        setLoading(false);
      })();
    }
  }, [data.address]);

  // Danh sách sản phẩm trong đơn hàng (giả lập)
  const cartItems = [
    { id: "1", name: "Sản phẩm A", price: 200000, quantity: 1 },
    { id: "2", name: "Sản phẩm B", price: 150000, quantity: 2 },
  ];

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
        console.log("address", formattedAddress);
      } else {
        setAddress("Không tìm thấy địa chỉ!");
      }
    } catch (error) {
      console.error("Lỗi lấy địa chỉ:", error);
      setAddress("Lỗi lấy địa chỉ, vui lòng thử lại!");
    }
  };

  const shippingFee = 30000; // Phí ship cố định
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const total = subtotal + shippingFee - discount;

  // Xử lý áp dụng voucher (giả lập)
  const applyVoucher = () => {
    if (voucher === "SALE50") {
      setDiscount(50000);
      Alert.alert("Áp dụng thành công! Giảm 50,000₫");
    } else {
      Alert.alert("Mã giảm giá không hợp lệ");
    }
  };


  const handleCheckout = () => {
    if (!address || !phone) {
      Alert.alert("Vui lòng nhập đầy đủ thông tin nhận hàng");
      return;
    }
    Alert.alert("Đặt hàng thành công!");
    navigation.goBack();
  };

  const renderContent = () => (
    <>
      <TouchableOpacity
        style={styles.containerAddress}
        onPress={() => router.push("/order/searchAdressScreen")}
      >
        <Ionicons name="location-sharp" size={24} color="red" style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Vị Trí giao hàng</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {loading ? "Đang lấy vị trí..." : address ?? "Chưa có địa chỉ"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>
      <TextInput
        placeholder="Nhập số điện thoại"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <TextInput
        placeholder="Họ tên người nhận hàng"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
     
      <Text style={styles.title}>Tóm tắt đơn hàng</Text>
      
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text>
              {item.name} (x{item.quantity})
            </Text>
            <Text>{item.price.toLocaleString()}₫</Text>
          </View>
        )}
        scrollEnabled={false}
      />
      <TextInput
        placeholder="Nhập mã giảm giá"
        value={voucher}
        onChangeText={setVoucher}
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={applyVoucher}>
        <Text style={styles.buttonText}>Áp dụng mã</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[1]}
        renderItem={() => null}
        keyExtractor={() => "dummy"}
        ListHeaderComponent={renderContent}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 300,
        }}
      />


      <View style={[styles.fixedFooter, { paddingBottom: insets.bottom }]}>
        <View style={styles.summaryRow}>
          <Text>Tạm tính:</Text>
          <Text>{subtotal.toLocaleString()}₫</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Phí vận chuyển:</Text>
          <Text>{shippingFee.toLocaleString()}₫</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Giảm giá:</Text>
          <Text>-{discount.toLocaleString()}₫</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalText}>Tổng cộng:</Text>
          <Text style={styles.totalText}>{total.toLocaleString()}₫</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Xác nhận đặt hàng</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 150,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 3,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  totalText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  checkoutButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  checkoutButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  icon: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
  },
  containerAddress: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginVertical: 10,
  },
  fixedFooter: {
    position: "absolute",
    marginBottom: 90,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
});

export default CheckoutScreen;
