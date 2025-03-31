import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCart } from "../../hooks/useCart";
import api from "../../api";
import socket from "../../socket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";

interface UserProfile {
  _id: string;
  address: string;
  avatar: string;
  bills: string[];
  birthdate: string;
  createdAt: string;
  email: string;
  fullname: string;
  password: string | null;
  phonenumber: string;
  point: number;
  role: number;
  state: boolean;
  updatedAt: string;
  __v: number;
}
const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cart, clearCart } = useCart();

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [voucher, setVoucher] = useState("");
  const [voucherId, setVoucherId] = useState("");
  const [voucherError, setVoucherError] = useState<string>("");
  const [discount, setDiscount] = useState(0);
  const [points, setPoints] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [pointsError, setPointsError] = useState<string>("");
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
  const [choices, setChoices] = useState<{ [key: string]: any[] }>({});
  const [optionNames, setOptionNames] = useState<{ [key: string]: string }>({});
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(
    null
  );
  const [token, setToken] = useState<string | null>(null);
  const data = useLocalSearchParams();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server via WebSocket");
    });

    // socket.on("billCreated", (response) => {
    //   console.log("Server response:", response);
    //   setServerResponse(response);
    //   if (response.status === "success") {
    //     clearCart();
    //     navigate("/success");
    //   } else {
    //     alert("Error creating bill");
    //   }
    // });

    return () => {
      socket.off("connect");
      socket.off("billCreated");
    };
  }, []);

  useEffect(() => {
    if (data.address && typeof data.address === "string") {
      setAddress(data.address);
      setLoading(false);
    } else {
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
        fetchAddress(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude
        );
        setLoading(false);
      })();
    }
  }, [data.address]);

  useFocusEffect(
    React.useCallback(() => {
      const checkToken = async () => {
        const storedToken = await AsyncStorage.getItem("token");
        setToken(storedToken);
        if (storedToken) {
          const response = await api.get("/v1/account/profile", {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });
          if (response.data) {
            setUserProfile(response.data);
          }
        } else {
          setUserProfile(null);
        }
      };
      checkToken();
      return () => {};
    }, [])
  );

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

  const handlePointsChange = (inputValue: string) => {
    const value = parseInt(inputValue) || 0;
    const userPoints = userProfile?.point || 0;

    if (value > userPoints) {
      setPointsError("Số điểm nhập vượt quá số điểm bạn đang có");
      setPoints(userPoints);
      setPointsDiscount(userPoints);
    } else {
      setPointsError("");
      setPoints(value);
      setPointsDiscount(value);
    }
  };

  const shippingFee = 10000;
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const total = subtotal + shippingFee - discount - pointsDiscount;

  const handleCheckout = () => {
    if (!address || !phone) {
      Alert.alert("Vui lòng nhập đầy đủ thông tin nhận hàng");
      return;
    }
    const billData = {
      fullName: name,
      address_shipment: address,
      phone_shipment: phone,
      ship: shippingFee,
      total_price: total,
      pointDiscount: points,
      isPaid: false,
      voucher: voucherId,
      lineItems: cart.map((item) => ({
        product: item.id,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
        options: item.options.map((option) => ({
          optionId: option.optionId,
          choiceId: option.choiceId,
          addPrice: option.addPrice,
        })),
      })),
      note: note || "",
      ...(userProfile?._id ? { account: userProfile._id } : {}),
    };

    socket.emit("createBill", billData);

    // Lắng nghe phản hồi từ server
    socket.on("billCreated", async (response) => {
      if (response.status === "success") {
        console.log("Đặt hàng thành công, ID đơn hàng:", response.data._id);

        await clearCart();

        router.push({
          pathname: "/order/orderDetailScreen",
          params: {
            orderId: response.data._id, // Lấy ID từ server
          },
        });
      } else {
        Alert.alert("Đặt hàng thất bại", response.message);
      }
    });
  };

  const getChoiceName = async (optionId: string, choiceId: string) => {
    try {
      if (!choices[optionId]) {
        const response = await api.get(`/v1/choice/get-choice`, {
          params: { optionalId: optionId },
        });

        const choiceList = response.data.choices || [];
        setChoices((prev) => ({
          ...prev,
          [optionId]: choiceList,
        }));
        const choice = choiceList.find((ch) => ch._id === choiceId);
        return choice ? choice.name : "";
      } else {
        const choiceList = choices[optionId];
        const choice = choiceList.find((ch) => ch._id === choiceId);
        return choice ? choice.name : "";
      }
    } catch (error) {
      console.error("Error fetching choice name:", error);
      return "";
    }
  };

  const handleApplyVoucher = async () => {
    try {
      const url = `/v1/voucher/getcode?code=${voucher}`;
      const fullUrl = api.defaults.baseURL + url;
      const response = await api.get(url);

      if (response.data && response.data.data) {
        const voucherData = response.data.data;
        setVoucherId(response.data.data._id);
        if (voucherData.isActive) {
          setDiscount(voucherData.discount);
          setVoucherError("");
          Alert.alert(
            "Thành công",
            `Áp dụng voucher giảm ${voucherData.discount.toLocaleString()}₫`
          );
        } else {
          setVoucherError("Mã giảm giá đã hết hạn sử dụng");
          setDiscount(0);
          setVoucher("");
          Alert.alert("Lỗi", "Mã giảm giá đã hết hạn sử dụng");
        }
      } else {
        setVoucherError("Voucher không tồn tại");
        setDiscount(0);
        setVoucher("");
        Alert.alert("Lỗi", "Voucher không tồn tại");
      }
    } catch (error) {
      setVoucherError("Voucher không tồn tại");
      setDiscount(0);
      setVoucher("");
      Alert.alert("Lỗi", "Voucher không tồn tại");
    }
  };

  useEffect(() => {
    const fetchOptionAndChoiceNames = async () => {
      const newOptionNames: { [key: string]: string } = {};
      const newChoices: { [key: string]: any[] } = {};

      for (const item of cart) {
        for (const opt of item.options) {
          if (!newChoices[opt.optionId]) {
            const choiceName = await getChoiceName(opt.optionId, opt.choiceId);
            newOptionNames[`${opt.optionId}-${opt.choiceId}`] = choiceName;
          }
        }
      }

      setOptionNames(newOptionNames);
    };

    if (cart.length > 0) {
      fetchOptionAndChoiceNames();
    }
  }, [cart]);

  const renderContent = () => (
    <>
      <TouchableOpacity
        style={styles.containerAddress}
        onPress={() => router.push("/order/searchAdressScreen")}
      >
        <Ionicons
          name="location-sharp"
          size={24}
          color="red"
          style={styles.icon}
        />
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
      <TextInput
        placeholder="Ghi chú"
        value={note}
        onChangeText={setNote}
        style={styles.input}
      />

      <Text style={styles.title}>Tóm tắt đơn hàng</Text>

      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image
              source={{ uri: item.picture }}
              style={styles.productImage}
              resizeMode="contain"
            />
            <View style={styles.itemDetails}>
              <Text style={styles.productName}>{item.name}</Text>
              {item.options && item.options.length > 0 && (
                <View style={styles.optionsContainer}>
                  {item.options.map((option, index) => (
                    <Text key={index} style={styles.optionLabel}>
                      {optionNames[`${option.optionId}-${option.choiceId}`]}
                      {option.addPrice > 0
                        ? ` (+${option.addPrice.toLocaleString()}₫)`
                        : ""}
                    </Text>
                  ))}
                </View>
              )}
              <Text style={styles.productPrice}>
                {(item.price * item.quantity).toLocaleString()}₫
              </Text>
              <Text style={styles.quantity}>Số lượng: {item.quantity}</Text>
            </View>
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
      <TouchableOpacity style={styles.button} onPress={handleApplyVoucher}>
        <Text style={styles.buttonText}>Áp dụng mã</Text>
      </TouchableOpacity>
      {voucherError ? (
        <Text style={styles.errorText}>{voucherError}</Text>
      ) : null}
      {userProfile && (
        <>
          <Text>Nhập số điểm quy đổi:</Text>
          <TextInput
            placeholder="Nhập số điểm quy đổi"
            value={points.toString()}
            onChangeText={handlePointsChange}
            keyboardType="numeric"
            style={[styles.inputPoint, pointsError ? styles.inputError : null]}
          />
        </>
      )}
      {pointsError ? <Text style={styles.errorText}>{pointsError}</Text> : null}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 300,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {renderContent()}
      </ScrollView>
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
        {userProfile && (
          <View style={styles.summaryRow}>
            <Text>Điểm đã dùng:</Text>
            <Text>-{pointsDiscount.toLocaleString()}₫</Text>
          </View>
        )}
        <View style={styles.totalRow}>
          <Text style={styles.totalText}>Tổng cộng:</Text>
          <Text style={styles.totalText}>{total.toLocaleString()}₫</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
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
    flex: 1,
  },
  inputPoint: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
    flex: 1,
    marginBottom: 40,
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
    marginBottom: 15,
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
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: 5,
  },
  quantity: {
    fontSize: 14,
    color: "#666",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 5,
  },
  optionLabel: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#f4f4f4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 5,
    marginBottom: 5,
  },
  voucherContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  errorText: {
    color: "#ff0000",
    fontSize: 12,
    marginTop: 5,
  },
  inputError: {
    borderColor: "#ff0000",
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
});

export default CheckoutScreen;
