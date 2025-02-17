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
} from "react-native";
import Carousel from "react-native-reanimated-carousel"; // Import the new carousel library
import { Ionicons } from "@expo/vector-icons"; // Import icon
import api from "../../api";
import axios from "axios";

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

  // Define renderItem for the Carousel
  const renderItem = ({ index }: { index: number }) => (
    <View style={styles.carouselItemContainer}>
      <Image source={images[index].source} style={styles.carouselImage} />
    </View>
  );


  const handleSearch = () => {
    // const searchText = searchInputValue; // You can store the search value in the state
    // console.log('Search for:', searchText);
    // Add your search handling logic here
  };
  return (
    <View style={styles.container}>
      {/* Header */}
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

      {/* Products */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.productsContainer}
      >
      {product.map((product) => {
        console.log('Category picture URL:', product?.picture); // Log picture URL trước khi render
        return (
          <TouchableOpacity key={product.id} style={styles.productItem}>
            <Image 
              source={{ uri: product?.picture }} 
              resizeMode="contain" 
              style={styles.productImage} 
              onError={(error) => console.log('Image load error:', error)}
            />
            <Text style={styles.productText}>{product.name}</Text>
          </TouchableOpacity>
        );
      })}

    </ScrollView>

      <View style={styles.content}>
        <Text style={styles.text}>Welcome to the Homepage!</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 10,
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

  


  productsContainer: {
    paddingVertical: 10,
    //backgroundColor: '#000', // Background đen như ảnh mẫu
  },
  productItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 40, // Hình tròn
    borderWidth: 2,
    // borderColor: '#000',
  },
  productText: {
    marginTop: 5,
    color: '#000',
    fontWeight: 'bold',
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
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 24, fontWeight: "bold" },
});

export default HomePage;
