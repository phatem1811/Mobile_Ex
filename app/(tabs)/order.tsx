import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import dayjs from "dayjs";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import api from "@/api";

interface Order {
  _id: string;
  createdAt: string;  // Thêm dòng này
  total_price: number;
  state: number;
}

const OrderHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [token, setToken] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      const fetchOrders = async () => {
        setLoading(true);
        try {
          const storedToken = await AsyncStorage.getItem("token");
          if (!storedToken) {
            setToken(null);
            setLoading(false);
            return;
          }
          setToken(storedToken);

          // Gọi API lấy accountId
          const profileResponse = await api.get("/v1/account/profile", {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          const userId = profileResponse.data._id;
          setAccountId(userId);

          // Gọi API lấy danh sách hóa đơn
          const billResponse = await api.get(
            `/v1/bill/list?accountId=${userId}`,
            {
              headers: { Authorization: `Bearer ${storedToken}` },
            }
          );
          console.log("check bill", billResponse.data.data.bills);
          setOrders(billResponse.data.data.bills || []);
        } catch (error) {
          console.error("Lỗi khi lấy danh sách hóa đơn:", error);
          Alert.alert("Lỗi", "Không thể lấy danh sách hóa đơn.");
        } finally {
          setLoading(false);
        }
      };

      fetchOrders();
    }, [])
  );

  const handleViewDetails = (orderId: string) => {

    router.push({
      pathname: "/order/orderDetailScreen",
      params: {
        orderId: orderId,

      },
    });
  };

  const renderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderItem}>
      <Text style={styles.orderId}>Mã hóa đơn: {item._id}</Text>
      <Text style={styles.orderDate}>
        Ngày đặt: {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
      </Text>
      <Text style={styles.orderTotal}>
        Tổng hóa đơn: {item.total_price.toLocaleString()} VNĐ
      </Text>
      <TouchableOpacity
        style={styles.detailButton}
        onPress={() => handleViewDetails(item._id)}
      >
        <Text style={styles.detailButtonText}>Xem chi tiết</Text>
      </TouchableOpacity>
    </View>
  );

  if (!token) {
    return (
      <View style={styles.center}>
        <Text style={styles.loginText}>
          Vui lòng đăng nhập để xem lịch sử đơn hàng.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử đơn hàng</Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007bff"
          style={styles.loading}
        />
      ) : orders.length > 0 ? (
        <FlatList
          data={orders}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item?._id ? item._id.toString() : `order-${index}`
          }
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Không có đơn hàng nào.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 16,
  },
  orderItem: {
    padding: 16,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#d9534f",
  },
  detailButton: {
    marginTop: 10,
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  detailButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 16,
    color: "#d9534f",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  loading: {
    marginTop: 20,
  },
});

export default OrderHistoryScreen;
