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
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../../../api";

const { width, height } = Dimensions.get("window");

const ProductDetail = () => {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<any>(null);
  const router = useRouter();
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/v1/product/get/${id}`);
        setProduct(response.data.data);
        console.log('success', response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  const formatPrice = (price: number) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
  };

  const handleAddToCart = () => {
    console.log("Added to cart:", product.name);
  };

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
        </View>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
        </TouchableOpacity>
      </ScrollView>


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    paddingBottom: 20, 
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
  discount: {
    fontSize: 16,
    color: "#FF6B6B",
    fontWeight: "bold",
  },
  addToCartButton: {
    position: "fixed",
    bottom: -150,
    left: 0,
    right: 0,
    backgroundColor: "#FF6B6B",
    paddingVertical: 15,
    alignItems: "center",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    elevation: 5,
  },
  addToCartText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
});

export default ProductDetail;