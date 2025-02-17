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

  const renderItem = ({ index }: { index: number }) => (
    <View style={styles.carouselItemContainer}>
      <Image source={images[index].source} style={styles.carouselImage} />
    </View>
  );

  const handleSearch = () => {
    // Search handling logic here
  };

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
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
          />
          <TouchableOpacity style={styles.searchIcon} onPress={handleSearch}>
            <Ionicons name="search-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="person-circle-outline" size={28} color="#333" />
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
          {product.map((product) => (
            <TouchableOpacity key={product._id} style={styles.productItem}>
              <Image 
                source={{ uri: product?.picture }} 
                resizeMode="contain" 
                style={styles.productImage} 
                onError={(error) => console.log('Image load error:', error)}
              />
              <Text style={styles.productText}>{product.name}</Text>
            </TouchableOpacity>
          ))}
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
                <TouchableOpacity key={product._id} style={styles.offerCard}>
                  <Image
                    source={{ uri: product.picture }}
                    style={styles.offerImage}
                    resizeMode="cover"
                  />
                  <View style={styles.offerContent}>
                    <Text style={styles.offerName}>{product.name}</Text>
                    <Text style={styles.offerDescription}>{product.description}</Text>
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
  header: {
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  logo: { 
    width: 60, 
    height: 50, 
    marginRight: 10 
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    borderRadius: 20,
    marginRight: 15,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 15,
  },
  searchIcon: {
    padding: 10,
  },
  carouselContainer: {
    marginVertical: 15,
  },
  carouselItemContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  carouselImage: {
    width: width * 0.9,
    height: 200,
    borderRadius: 10,
  },
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
  emptyCategoryText: {
    fontSize: 16,
    color: "#999",
    marginLeft: 10,
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
    paddingLeft: 15,
  },
  productItem: {
    alignItems: "center",
    marginRight: 20,
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
  viewAll: {
    color: "#FF6B6B",
    fontSize: 14,
  },
  specialOffersScroll: {
    paddingLeft: 15,
  },
  offerCard: {
    width: 280,
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
  },
  offerImage: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  offerContent: {
    padding: 12,
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
});

export default HomePage;