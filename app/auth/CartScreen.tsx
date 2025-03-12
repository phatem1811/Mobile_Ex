import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../../hooks/useCart";
import { useRouter } from "expo-router";
import api from "@/api";

const { width, height } = Dimensions.get("window");

const CartScreen = () => {
  const { cart, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const router = useRouter();

  const [optionNames, setOptionNames] = useState<{ [key: string]: string }>({});
  const [choices, setChoices] = useState<{ [key: string]: any[] }>({});

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

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
        return choice ? choice.name : "Không có tên lựa chọn";
      } else {
        const choiceList = choices[optionId];
        const choice = choiceList.find((ch) => ch._id === choiceId);
        return choice ? choice.name : "Không có tên lựa chọn";
      }
    } catch (error) {
      console.error("Error fetching choice name:", error);
      return "Không có tên lựa chọn";
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng ({cart.length})</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.mainContainer}>
        {cart.length === 0 ? (
          <View style={styles.emptyCart}>
            <Text style={styles.emptyCartText}>Giỏ hàng của bạn trống</Text>
          </View>
        ) : (
          cart.map((item) => (
            <View key={item.id} style={styles.cartItem}>
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
                        {`${
                          optionNames[`${option.optionId}-${option.choiceId}`] || 'Loading...'
                        }${
                          option.addPrice > 0 ? ` (+${formatPrice(option.addPrice)})` : ''
                        }`}
                      </Text>
                    ))}
                  </View>
                )}
                <Text style={styles.productPrice}>
                  {formatPrice(item.price)}
                </Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => decreaseQuantity(item.id)}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => increaseQuantity(item.id)}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeFromCart(item.id)}
              >
                <Ionicons name="close" size={20} color="#333" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {cart.length > 0 && (
        <View style={styles.checkoutSection}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Tổng thanh toán:</Text>
            <Text style={styles.totalPrice}>{formatPrice(total)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton}  onPress={() =>router.push("/order/checkoutScreen")}>
            <Text style={styles.checkoutButtonText}>Mua hàng ({cart.length})</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  optionLabel: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f4f4f4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 5,
    marginBottom: 5,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginTop: 30,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  mainContainer: {
    flex: 1,
    paddingVertical: 10,
  },
  emptyCart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyCartText: {
    fontSize: 16,
    color: "#666",
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
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 30,
    height: 30,
    backgroundColor: "#f4f4f4",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 18,
    color: "#333",
    fontWeight: "bold",
  },
  quantity: {
    fontSize: 16,
    color: "#333",
    marginHorizontal: 10,
  },
  removeButton: {
    padding: 5,
  },
  checkoutSection: {
    padding: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  totalText: {
    fontSize: 16,
    color: "#333",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  checkoutButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  checkoutButtonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
});

export default CartScreen;