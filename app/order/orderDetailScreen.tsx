import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Card } from "react-native-paper";
import axios from "axios"; // Import axios
import api from "../../api";
import Icon from "react-native-vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCart } from "../../hooks/useCart";

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
  const router = useRouter();
  const { addToCart } = useCart();
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
  const getOrderStatusLine = (state: number) => {
    if (state === -1) {
      return (
        <View style={styles.containerLine}>
          <Text style={styles.canceledOrderText}>Đơn hàng đã bị hủy</Text>
        </View>
      );
    }
  
    const stages = [
      { label: "Đang xử lí", state: 1 },
      { label: "Đang thực hiện", state: 2 },
      { label: "Đang giao hàng", state: 3 },
      { label: "Hoàn thành", state: 4 },
    ];
  
    return (
      <View style={styles.containerLine}>
        <View style={styles.lineContainer}>
          {stages.map((stage, index) => {
            const isCompleted = state >= stage.state;
            const isLast = index === stages.length - 1;
            return (
              <React.Fragment key={index}>
                <View style={styles.stepContainer}>
                  <View
                    style={[
                      styles.circle,
                      isCompleted && styles.circleCompleted,
                    ]}
                  >
                    {isCompleted && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                  <Text
                    style={[styles.label, isCompleted && styles.labelCompleted]}
                  >
                    {stage.label}
                  </Text>
                </View>
                {!isLast && (
                  <View
                    style={[
                      styles.line,
                      state > stage.state && styles.lineCompleted,
                    ]}
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>
      </View>
    );
  };
  
  
  const handleReorder = () => {
    if (order?.lineItem) {
      order.lineItem.forEach((item) => {
        const formattedOptions =
          item.options?.map((option) => ({
            optionId: option.option._id,
            choiceId: option.choices._id,
            addPrice: option.choices.additionalPrice || 0,
          })) || [];

        const productData = {
          _id: item.product._id,
          name: item.product.name,
          price: item.product.currentPrice,
          picture: item.product.picture,
          options: formattedOptions,
        };

        console.log(
          `Adding to cart:`,
          productData,
          `Quantity: ${item.quantity}`
        );
        addToCart(productData, item.quantity);
      });

      alert(`Đã thêm ${order.lineItem.length} sản phẩm vào giỏ hàng!`);
    }
  };

  return (
    <FlatList
      style={styles.container}
      data={order.lineItem}
      keyExtractor={(item) => item._id}
      contentContainerStyle={{ paddingBottom: 120 }}
      ListHeaderComponent={() => (
        <>
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
              📌 Trạng thái giao hàng: {getOrderStatusLine(order.state)}
            </Text>
          </Card>

          {/* <Card style={styles.statusCard}>
            <Text style={styles.title}>Trạng thái đơn hàng</Text>
            <View style={styles.statusContainer}>
              {getOrderStatus(order.state)}
            </View>
          </Card> */}
        </>
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
        <View>
          <Card style={styles.totalCard}>
            <Text style={styles.totalText}>
              💰 Tổng tiền: {order.total_price.toLocaleString()}đ
            </Text>
          </Card>

          {/* Nút Đặt lại */}
          <TouchableOpacity
            style={styles.reorderButton}
            onPress={handleReorder}
          >
            <Text style={styles.reorderButtonText}>Đặt lại</Text>
          </TouchableOpacity>

          {/* Nút Home */}
          <TouchableOpacity
            style={styles.homeIcon}
            onPress={() => router.push("/(tabs)")}
          >
            <Icon name="home" size={30} color="#075eec" />
          </TouchableOpacity>
        </View>
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
  text: { fontSize: 16, marginBottom: 6, color: "#555" },
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
statusCompleted: { backgroundColor: "#4CAF50" },
  statusText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center", 
    flexWrap: "wrap",
  },
  statusStep: {
    padding: 8,
    marginTop: 10,
    marginLeft: 4,
    marginBottom: 8,
    borderRadius: 10,
    backgroundColor: "#C0C0C0", 
    alignItems: "center",
    justifyContent: "center", 
    minHeight: 60, 
  },
  canceledOrderText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  statusCard: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 10,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between", 
    marginVertical: 16,
  },
  statusColumn: {
    marginTop: 10,
    flex: 1, 
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
  reorderButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  reorderButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  homeIcon: {
    textAlign: "center",
    padding: 10,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  containerLine: {
    alignItems: 'center', // Căn giữa thanh tiến trình
    padding: 16,
  },
  lineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    maxWidth: 400, // Giới hạn chiều rộng tối đa
    width: '100%', // Đảm bảo nó chiếm toàn bộ chiều rộng có thể
  },
  stepContainer: {
    flex: 1, // Mỗi bước chiếm một phần bằng nhau
    alignItems: 'center',
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleCompleted: {
    backgroundColor: '#00b894',
    borderColor: '#00b894',
  },
  checkMark: {
    color: '#fff',
    fontSize: 14,
  },
  label: {
    marginTop: 8,
    color: '#aaa',
    fontSize: 12,
    textAlign: 'center',
  },
  labelCompleted: {
    color: '#00b894',
  },
  line: {
    height: 2,
    flex: 1, // Đường kẻ chiếm phần không gian còn lại giữa các bước
    backgroundColor: '#ccc',
    alignSelf: 'center',
  },
  lineCompleted: {
    backgroundColor: '#00b894',
  },
});

export default OrderDetailScreen;
