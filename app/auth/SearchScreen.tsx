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
  FlatList,
} from "react-native";
import Carousel from "react-native-reanimated-carousel"; // Import the new carousel library
import { Ionicons } from "@expo/vector-icons"; // Import icon
import api from "../../api";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import ProductDetail from "./product/[id]";
const { width } = Dimensions.get("window");

const images = [
  { source: require("../../assets/images/banner1.jpg") },
  { source: require("../../assets/images/banner2.jpg") },
  { source: require("../../assets/images/banner3.jpg") },
];

const HomePage = () => {
  const [product, setProduct] = useState<any[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const router = useRouter();
  const dataSearch = useLocalSearchParams();
  const [keyword, setKeyword] = useState(dataSearch.searchText || "");
  const [searchInputValue, setSearchInputValue] = useState("");
  const navigation = useNavigation();

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
    getProductbyName();
  }, [keyword]);

  const getProductbyName = async () => {
    console.log("check func", keyword);
    if (keyword) {
      const response = await api.get(`/v1/product/search`, {
        params: { name: keyword },
      });
      setProduct(response.data);
    }
  };
  const handleSearch = () => {
    setKeyword(searchInputValue);
  };

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
  };
  const handleAvatarPress = () => {
    router.push("/(tabs)/introduce");
  };

  const handleProductPress = (id: string) => {
    router.push(`/auth/product/${id}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
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
      {dataSearch.searchText ? (
        product.length > 0 ? (
          <View style={styles.specialOffersContainer}>
            <View style={styles.specialOffersHeader}>
              <Text style={styles.specialOffersTitle}>
                Kết quả tìm kiếm: {keyword}
              </Text>
            </View>
            <FlatList
              data={product}
              keyExtractor={(item) => item._id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={{ paddingBottom: 100 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.offerCard} onPress={() => handleProductPress(item._id)}>
                  <Image
                    source={{ uri: item.picture }}
                    style={styles.offerImage}
                    resizeMode="cover"
                  />
                  <View style={styles.offerContent}>
                    <Text style={styles.offerName}>{item.name}</Text>
                    <Text style={styles.offerDescription}>
                      {item.description}
                    </Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.currentPrice}>
                        {formatPrice(item.currentPrice)}
                      </Text>
                      {item.price !== item.currentPrice && (
                        <Text style={styles.originalPrice}>
                          {formatPrice(item.price)}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity style={styles.addButton}>
                      <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        ) : (
          <View style={styles.notFoundContainer}>
            <Text style={styles.notFoundText}>Không tìm thấy sản phẩm</Text>
          </View>
        )
      ) : null}
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
    flex: 0.5,
    marginHorizontal: 5,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    paddingBottom: 10, // Thêm khoảng cách để tránh bị che khuất
  },

  offerImage: {
    width: "100%",
    height: 120,
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
  notFoundContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  notFoundText: {
    fontSize: 16,
    color: "#888",
    fontWeight: "bold",
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 15,
  },
});

export default HomePage;
