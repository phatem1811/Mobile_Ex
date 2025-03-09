import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
  FlatList,
  ScrollView,
} from "react-native";
import { Card } from "react-native-paper";
import axios from "axios"; // Import axios
import api from "@/api";
import { useLocalSearchParams } from "expo-router";

type Choice = {
  _id: string;
  name: string;
  additionalPrice: number;
};

type Voucher = {
  code: string;
  discount: number;
};
type Option = {
  option: { _id: string; name: string };
  choices: Choice;
};

type Product = {
  _id: string;
  name: string;
  picture: string;
  price: number;
  currentPrice: number;
  description: string;
};

type LineItem = {
  _id: string;
  quantity: number;
  subtotal: number;
  product: Product;
  options?: Option[];
};

type Order = {
  _id: string;
  fullName: string;
  phone_shipment: string;
  address_shipment: string;
  isPaid: boolean;
  total_price: number;
  ship: number;
  pointDiscount: number;
  voucher?: Voucher;
  lineItem: LineItem[];
  state: number;
};

const OrderDetailScreen = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const data = useLocalSearchParams();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/v1/bill/get/${data.orderId}`);
        setOrder(response.data.data);
      } catch (err) {
        setError("Lỗi khi tải hóa đơn. Vui lòng thử lại!");
        console.error("Lỗi khi tải hóa đơn:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Không tìm thấy đơn hàng!</Text>
      </View>
    );
  }

  const getOrderStatus = (state: number): string => {
    switch (state) {
      case 1:
        return "🕒 Đơn hàng đang xử lý";
      case 2:
        return "👨‍🍳 Đang thực hiện món";
      case 3:
        return "🚚 Đang giao hàng";
      case 4:
        return "✅ Đã hoàn thành";
      case 5:
        return "❌ Hủy đơn hàng";
      default:
        return "❓ Trạng thái không xác định";
    }
  };
  return (
    <FlatList
      style={styles.container}
      data={order.lineItem}
      keyExtractor={(item) => item._id}
      contentContainerStyle={{ paddingBottom: 120 }}
      ListHeaderComponent={() => (
        <Card style={styles.card}>
          <Text style={styles.title}>Thông tin đơn hàng</Text>
          <Text style={styles.text}>👤 {order.fullName}</Text>
          <Text style={styles.text}>📞 {order.phone_shipment}</Text>
          <Text style={styles.text}>
            🚚 Phí vận chuyển: {order.ship.toLocaleString()}đ
          </Text>
          <Text style={styles.text}>
            🎟 Voucher: {order.voucher?.code || "Không có"} -{" "}
            {order.voucher?.discount || 0}đ
          </Text>
          <Text style={styles.text}>
            💎 Điểm giảm giá: -{order.pointDiscount.toLocaleString()}đ
          </Text>
          <Text style={styles.text}>
            💳 Trạng thái:{" "}
            {order.isPaid ? "✅ Đã thanh toán" : "❌ Chưa thanh toán"}
          </Text>
          <Text style={styles.text}>
            📌 Trạng thái: {getOrderStatus(order.state)}
          </Text>
        </Card>
      )}
      renderItem={({ item }) => (
        <Card style={styles.productCard}>
          <View style={styles.row}>
            <Image
              source={{ uri: item.product.picture }}
              style={styles.image}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.product.name}</Text>
              <Text style={styles.text}>🔢 Số lượng: {item.quantity}</Text>
              <Text style={styles.text}>
                💵 Giá: {item.product.currentPrice.toLocaleString()}đ
              </Text>
              <Text style={styles.text}>
                🛒 Thành tiền: {item.subtotal.toLocaleString()}đ
              </Text>
              {item.options && item.options.length > 0 && (
                <View>
                  <Text style={styles.optionTitle}>🎯 Tùy chọn:</Text>
                  {item.options.map((opt, index) => (
                    <Text key={index} style={styles.optionText}>
                      - {opt.option.name}: {opt.choices.name} (+
                      {opt.choices.additionalPrice}đ)
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        </Card>
      )}
      ListFooterComponent={() => (
        <Card style={styles.totalCard}>
          <Text style={styles.totalText}>
            💰 Tổng tiền: {order.total_price.toLocaleString()}đ
          </Text>
        </Card>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F5F5F5" },
  card: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 10,
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 8, color: "#333" },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  text: { fontSize: 16, marginBottom: 4, color: "#555" },
  productCard: {
    padding: 12,
    marginBottom: 12,
    backgroundColor: "white",
    borderRadius: 10,
  },
  row: { flexDirection: "row", alignItems: "center" },
  image: { width: 80, height: 80, borderRadius: 10, marginRight: 12 },
  productInfo: { flex: 1 },
  productName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  optionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 8,
    color: "#333",
  },
  optionText: { fontSize: 14, color: "#555" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 16, color: "#888", marginTop: 8 },
  errorText: { fontSize: 16, color: "red", textAlign: "center" },
  totalCard: {
    padding: 16,
    marginTop: 0,
    marginBottom: 10,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  finalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#e74c3c",
  },
});

export default OrderDetailScreen;
