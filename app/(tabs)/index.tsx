import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  SafeAreaView,
} from "react-native";
import Carousel from "react-native-reanimated-carousel"; 
import { Ionicons } from "@expo/vector-icons"; 
import api from "../../api";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCart } from "../../hooks/useCart";

const { width } = Dimensions.get("window");

const images = [
  { source: require("../../assets/images/banner1.jpg") },
  { source: require("../../assets/images/banner2.jpg") },
  { source: require("../../assets/images/banner3.jpg") },
];

const HomePage = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [category, setCategory] = useState<any[]>([]);
  const [product, setProduct] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const { cart, addToCart } = useCart();
  const router = useRouter();

  const [searchInputValue, setSearchInputValue] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      setSearchInputValue("");
      const checkToken = async () => {
        const storedToken = await AsyncStorage.getItem("token");
        setToken(storedToken);
        if (storedToken) {
          const response = await api.get("/v1/account/profile", {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });
          console.log("User Info:", response.data._id);
          if (response.data.avatar) setImageUri(response.data.avatar);
        } else {
          setImageUri(null);
        }
      };
      checkToken();
      return () => {};
    }, [])
  );
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/v1/category/list");
        setCategory(response.data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTop10Products = async () => {
      try {
        const response = await api.get("/v1/product/getTop10");
        setProduct(response.data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    fetchTop10Products();
  }, []);

  // Define renderItem for the Carousel
  const renderItem = ({ index }: { index: number }) => (
    <View style={styles.carouselItemContainer}>
      <Image source={images[index].source} style={styles.carouselImage} />
    </View>
  );
  const handleAvatarPress = () => {
    router.push("/(tabs)/introduce");
  };

  const handleSearch = () => {
    if (!searchInputValue.trim()) return; // Kiểm tra nếu rỗng thì không tìm kiếm
    console.log("search", searchInputValue);
    router.push({
      pathname: "/auth/SearchScreen",
      params: { searchText: searchInputValue },
    });
  };
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
  };

  const handleProductPress = (id: string) => {
    router.push(`/auth/product/${id}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header - Fixed at top */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/logo1.png")}
          style={styles.logo}
        />
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm..."
            value={searchInputValue}
            onChangeText={setSearchInputValue} // Cập nhật state khi nhập
          />
          <TouchableOpacity style={styles.searchIcon} onPress={handleSearch}>
            <Ionicons name="search-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#333F" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/auth/CartScreen")}>
          <Ionicons name="cart-outline" size={24} color="#333" style={styles.cartIcon} />
          {cart.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleAvatarPress}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: 28, height: 28, borderRadius: 14 }}
            />
          ) : (
            <Ionicons name="person-circle-outline" size={28} color="#333" />
          )}
        </TouchableOpacity>
      </View>

      {/* Main Content - Scrollable */}
      <ScrollView
        style={styles.mainContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Carousel Section */}
        <View style={styles.carouselContainer}>
          <Carousel
            loop
            width={width}
            height={200}
            autoPlay={true}
            data={images}
            renderItem={renderItem}
            onSnapToItem={(index) => setActiveSlide(index)}
          />
        </View>

        {/* Dots indicator */}
        <View style={styles.dotsContainer}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeSlide === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {loading ? (
            <Text style={styles.emptyCategoryText}>Đang tải...</Text>
          ) : Array.isArray(category) && category.length > 0 ? (
            category.map((categoryItem, index) => (
              <TouchableOpacity key={index} style={styles.categoryItem}>
                <Text style={styles.categoryText}>{categoryItem.name}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyCategoryText}>Danh mục trống</Text>
          )}
        </ScrollView>

        {/* Top 10 Products Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top 10 sản phẩm bán chạy</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.productsContainer}
        >
          {product.map((product) => {
            return (
              <TouchableOpacity key={product.id} style={styles.productItem}>
                <Image
                  source={{ uri: product?.picture }}
                  resizeMode="contain"
                  style={styles.productImage}
                  onError={(error) => console.log("Image load error:", error)}
                />
                <Text style={styles.productText}>{product.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Product By Category */}
        {category.map((categoryItem) => (
          <View key={categoryItem._id} style={styles.specialOffersContainer}>
            <View style={styles.specialOffersHeader}>
              <Text style={styles.specialOffersTitle}>{categoryItem.name}</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.specialOffersScroll}
            >
              {categoryItem.products.map((product: any) => (
                <TouchableOpacity key={product._id} style={styles.offerCard} onPress={() => handleProductPress(product._id)}>
                  <Image
                    source={{ uri: product.picture }}
                    style={styles.offerImage}
                    resizeMode="cover"
                  />
                  <View style={styles.offerContent}>
                    <Text style={styles.offerName}>{product.name}</Text>
                    <Text style={styles.offerDescription}>
                      {product.description}
                    </Text>
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
                    <TouchableOpacity style={styles.addButton}>
                      <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mainContainer: {
    flex: 1,
  },
  mainScrollView: {
    flex: 1,
  },
  container: { flex: 1, backgroundColor: "#fff" },
  logo: { width: 60, height: 50, marginRight: 10 },
  header: {
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },

  carouselContainer: { marginVertical: 15 },
  carouselItemContainer: { justifyContent: "center", alignItems: "center" },
  carouselImage: { width: width * 0.9, height: 200, borderRadius: 10 },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: "#ddd",
  },
  activeDot: {
    backgroundColor: "#333",
  },
  inactiveDot: {
    backgroundColor: "#bbb",
  },
  categoriesContainer: {
    marginTop: 20,
    paddingLeft: 10,
  },
  categoryItem: {
    backgroundColor: "#FFCC66",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 15,
    width: 150,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  sectionHeader: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  productsContainer: {
    paddingVertical: 10,
  },
  productItem: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#484848",
  },
  productText: {
    marginTop: 5,
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyCategoryText: {
    fontSize: 16,
    color: "#999",
    marginLeft: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    borderRadius: 20,
    flex: 1,
    marginRight: 15,
  },
  searchInput: {
    flex: 0.9,
    height: 40,
    borderWidth: 0,
    borderRadius: 20,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  searchIcon: {
    padding: 10,
  },
  specialOffersContainer: {
    marginTop: 20,
    paddingBottom: 30,
  },
  specialOffersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  specialOffersTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  specialOffersScroll: {
    paddingLeft: 15,
  },
  offerCard: {
    width: 200,
    backgroundColor: "white",
    borderRadius: 12,
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    paddingBottom: 10, 
  },
  offerImage: {
    width: "100%",
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  offerContent: {
    flex: 1, 
    padding: 12,
    justifyContent: "space-between", 
  },
  
  offerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "auto",
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: "#999",
    textDecorationLine: "line-through",
  },

  addButton: {
    position: "absolute",
    right: 12,
    bottom: 12,
    backgroundColor: "#FF6B6B",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },

  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 24, fontWeight: "bold" },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -1,
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  cartIcon: {
    marginRight: 4,
  },
});

export default HomePage;
