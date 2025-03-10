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
import { useCart } from "../../../hooks/useCart";

const { width, height } = Dimensions.get("window");

const ProductDetail = () => {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<{[key: string]: string}>({});
  const router = useRouter();
  const { cart, addToCart } = useCart();
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/v1/product/get/${id}`);
        setProduct(response.data.data);
        const initialOptions = {};
        response.data.data.options.forEach(option => {
          if (option.choices.length > 0) {
            initialOptions[option._id] = option.choices[0]._id;
          }
        });
        setSelectedOptions(initialOptions);
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

  const handleOptionChange = (optionId: string, choiceId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: choiceId
    }));
  };

  const calculateTotalPrice = () => {
    let total = product.currentPrice;
    product.options.forEach(option => {
      const selectedChoiceId = selectedOptions[option._id];
      const selectedChoice = option.choices.find(choice => choice._id === selectedChoiceId);
      if (selectedChoice?.additionalPrice) {
        total += selectedChoice.additionalPrice;
      }
    });
    return total;
  };

  const handleAddToCart = () => {
    const formattedOptions = product.options.map(option => {
      const selectedChoiceId = selectedOptions[option._id];
      const selectedChoice = option.choices.find(choice => choice._id === selectedChoiceId);
      
      return {
        optionId: option._id,
        choiceId: selectedChoiceId,
        addPrice: selectedChoice?.additionalPrice || 0
      };
    });

    console.log('formattedOptions', formattedOptions);
    addToCart({
      _id: product._id,
      name: product.name,
      price: calculateTotalPrice(),
      picture: product.picture,
      options: formattedOptions,
    });
    console.log(`Added ${product.name} to cart with options:`, formattedOptions);
  };
  
  const cartItem = cart.find(item => item.id === product._id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  console.log('product', product);

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
        </View>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  optionContainer: {
    marginTop: 15,
  },
  optionTitle: {
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
    bottom: 0,
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