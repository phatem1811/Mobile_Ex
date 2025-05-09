import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../../../api";
import { useCart } from "../../../hooks/useCart";
import Toast from "react-native-toast-message";
import ReviewForm from "./ReviewForm";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import RelatedProduct from "./RelatedProduct";

import { FontAwesome } from "@expo/vector-icons";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { width, height } = Dimensions.get("window");

type Review = {
  fullName?: string;
  rating: number;
  comment: string;
  createdAt: string;
};
type Product = {
  _id: string;
  name: string;
  picture: string;
  currentPrice: number;
  price: number;
  category: { name: string };
};
const ProductDetail = () => {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<any>(null);
  const [productRelated, setProductRelated] = useState<Product[]>([]);
  const [review, setReview] = useState<any>(null);
  const [quantity, setQuantity] = useState<string>("1");
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: string]: string;
  }>({});
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [visibleReviews, setVisibleReviews] = useState(2);
  const router = useRouter();
  const { cart, addToCart } = useCart();
  const navigation = useNavigation();
  useEffect(() => {
    const fetchrReview = async () => {
      try {
        const response = await api.get(`/v1/review/product/${id}`);

        setReview(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/v1/product/get/${id}`);
        setProduct(response.data.data);
        const initialOptions = {};
        response.data.data.options.forEach((option) => {
          if (option.choices.length > 0) {
            initialOptions[option._id] = option.choices[0]._id;
          }
        });
        setSelectedOptions(initialOptions);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    const fetchProductRelated = async () => {
      try {
        const response = await api.get(
          `v1/recommendations/products/related/${id}`
        );
        setProductRelated(response.data.relatedProducts ?? []);
      } catch (error) {
        console.error("Error fetching product:", error);
        setProductRelated([]);
      }
    };
    fetchProduct();
    fetchProductRelated();
    fetchrReview();
  }, [id]);

  if (!product) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  const handlePressProduct = (item: Product) => {
    router.push(`/auth/product/${item._id}`);
  };
  const formatPrice = (price: number) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
  };

  const handleOptionChange = (optionId: string, choiceId: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: choiceId,
    }));
  };

  const calculateTotalPrice = () => {
    let total = product.currentPrice;
    product.options.forEach((option) => {
      const selectedChoiceId = selectedOptions[option._id];
      const selectedChoice = option.choices.find(
        (choice) => choice._id === selectedChoiceId
      );
      if (selectedChoice?.additionalPrice) {
        total += selectedChoice.additionalPrice;
      }
    });
    return total * parseInt(quantity || "1");
  };

  // Xử lý thay đổi số lượng qua input
  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 1) {
      setQuantity("1");
    } else {
      setQuantity(value);
    }
  };

  // Tăng số lượng
  const increaseQuantity = () => {
    const newQuantity = parseInt(quantity) + 1;
    setQuantity(newQuantity.toString());
  };

  // Giảm số lượng
  const decreaseQuantity = () => {
    const currentQty = parseInt(quantity);
    if (currentQty > 1) {
      setQuantity((currentQty - 1).toString());
    }
  };

  const handleAddToCart = () => {
    try {
      const formattedOptions = product.options.map((option) => {
        const selectedChoiceId = selectedOptions[option._id];
        const selectedChoice = option.choices.find(
          (choice) => choice._id === selectedChoiceId
        );

        return {
          optionId: option._id,
          choiceId: selectedChoiceId,
          addPrice: selectedChoice?.additionalPrice || 0,
        };
      });

      addToCart(
        {
          _id: product._id,
          name: product.name,
          price: product.currentPrice, // Giá gốc mỗi sản phẩm
          picture: product.picture,
          options: formattedOptions,
        },
        parseInt(quantity) // Truyền số lượng vào đây
      );

      Toast.show({
        type: "success",
        text1: "Thành công 🎉",
        text2: `Đã thêm ${product.name} vào giỏ hàng!`,
        position: "top",
        visibilityTime: 1500,
        autoHide: true,
      });

      console.log(
        `Added ${product.name} to cart with options:`,
        formattedOptions
      );
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Thất bại 😔",
        text2: "Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại!",
        position: "top",
        visibilityTime: 1500,
        autoHide: true,
      });

      console.error("Error adding to cart:", error);
    }
  };

  const cartItem = cart.find((item) => item.id === product._id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={{ uri: product.picture }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>
              {formatPrice(product.currentPrice)}
            </Text>
            {product.price !== product.currentPrice && (
              <Text style={styles.originalPrice}>
                {formatPrice(product.price)}
              </Text>
            )}
          </View>

          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Số lượng:</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={decreaseQuantity}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.quantityInput}
              value={quantity}
              onChangeText={handleQuantityChange}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={increaseQuantity}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {product.options.map((option) => (
            <View key={option._id} style={styles.optionContainer}>
              <Text style={styles.optionTitle}>{option.name}</Text>
              {option.choices.map((choice) => (
                <TouchableOpacity
                  key={choice._id}
                  style={styles.radioContainer}
                  onPress={() => handleOptionChange(option._id, choice._id)}
                >
                  <View style={styles.radioOuter}>
                    {selectedOptions[option._id] === choice._id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.choiceText}>
                    {choice.name}
                    {choice.additionalPrice > 0 &&
                      ` (+${formatPrice(choice.additionalPrice)})`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
          <View style={{}}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 8,
              }}
            >
              Sản phẩm liên quan
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {productRelated.map((item) => (
                <RelatedProduct
                  key={item._id}
                  item={item}
                  onPress={handlePressProduct}
                  addToCart={addToCart}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.reviewSection}>
            <Text style={styles.reviewTitle}>Đánh giá sản phẩm</Text>

            {review?.length > 0 ? (
              <>
                {review
                  .slice(0, visibleReviews)
                  .map((item: Review, index: number) => (
                    <View key={index} style={styles.reviewItem}>
                      <View style={styles.reviewHeader}>
                        <Text style={styles.reviewerName}>
                          {item.fullName || "Người dùng ẩn danh"}
                        </Text>
                        <View style={styles.starContainer}>
                          {[0, 1, 2, 3, 4].map((i) => (
                            <FontAwesome
                              key={i}
                              name="star"
                              size={16}
                              color={i < item.rating ? "#FFD700" : "#ccc"}
                              style={{ marginRight: 2 }}
                            />
                          ))}
                        </View>
                      </View>
                      <Text style={styles.reviewTime}>
                        {dayjs(item.createdAt).fromNow()}
                      </Text>
                      <Text style={styles.reviewComment}>{item.comment}</Text>
                    </View>
                  ))}

                {/* Nút xem thêm nếu còn đánh giá chưa hiển thị */}
                {review.length > visibleReviews && (
                  <View style={styles.reviewActions}>
                    <TouchableOpacity
                      onPress={() => setVisibleReviews((prev) => prev + 2)}
                      style={styles.actionButton}
                    >
                      <Text style={styles.actionText}>
                        📖 Xem thêm đánh giá
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <Text
                style={{
                  fontStyle: "italic",
                  color: "#666",
                  marginBottom: 8,
                }}
              >
                Sản phẩm này chưa có đánh giá nào.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.addToCartButton}
        onPress={handleAddToCart}
      >
        <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
      </TouchableOpacity>

      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  starContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionContainer: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  radioOuter: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FF6B6B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#FF6B6B",
  },
  choiceText: {
    fontSize: 16,
    color: "#333",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginTop: 30,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  scrollContent: {
    paddingBottom: 80,
  },
  productImage: {
    width: "100%",
    height: 300,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  productDetails: {
    padding: 15,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 16,
    color: "#999",
    textDecorationLine: "line-through",
    marginRight: 10,
  },
  addToCartButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FF6B6B",
    paddingVertical: 15,
    alignItems: "center",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    elevation: 5,
    zIndex: 10,
  },
  addToCartText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginRight: 10,
  },
  quantityButton: {
    width: 40,
    height: 40,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  quantityButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  quantityInput: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    textAlign: "center",
    marginHorizontal: 10,
    fontSize: 16,
  },
  reviewSection: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  reviewItem: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  reviewerName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#444",
  },
  ratingText: {
    color: "#f39c12",
    fontWeight: "600",
  },
  reviewComment: {
    fontSize: 15,
    color: "#555",
  },
  reviewTime: {
    color: "#999",
    fontSize: 14,
    fontStyle: "italic",
    opacity: 0.6,
  },
  reviewActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#eee",
    borderRadius: 6,
  },
  actionText: {
    fontWeight: "600",
    color: "#333",
  },
});

export default ProductDetail;
