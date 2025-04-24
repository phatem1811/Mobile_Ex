import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';

const formatPrice = (price: number): string =>
  price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

type ProductOption = {
  _id: string;
  choices: { _id: string; additionalPrice: number }[];
};

type Product = {
  _id: string;
  name: string;
  picture: string;
  currentPrice: number;
  price: number;
  options?: ProductOption[];
  category: { name: string };
};

type RelatedProductProps = {
  item: Product;
  onPress: (item: Product) => void;
  addToCart: (item: any, quantity: number) => void; 
};

const RelatedProduct = ({ item, onPress, addToCart }: RelatedProductProps) => {
  const { name, picture, currentPrice, price, options = [] } = item;
  const isDiscounted = currentPrice < price;

  const handleAddToCart = () => {
    try {


      addToCart(
        {
          _id: item._id,
          name: item.name,
          price: item.currentPrice,
          picture: item.picture,
          options: [],
        },
        1 
      );

      Toast.show({
        type: 'success',
        text1: 'Thành công 🎉',
        text2: `Đã thêm ${item.name} vào giỏ hàng!`,
        position: 'top',
        visibilityTime: 1500,
        autoHide: true,
      });

    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Thất bại 😔',
        text2: 'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại!',
        position: 'top',
        visibilityTime: 1500,
        autoHide: true,
      });
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
      <Image source={{ uri: picture }} style={styles.image} />

      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={2}>{name}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.currentPrice}>{formatPrice(currentPrice)}</Text>
          {isDiscounted && <Text style={styles.oldPrice}>{formatPrice(price)}</Text>}
        </View>
      </View>

      <TouchableOpacity style={styles.buyButton} onPress={handleAddToCart}>
        <Text style={styles.buyText}>MUA</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  card: {
    width: 160,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 90,
    borderRadius: 6,
    resizeMode: 'cover',
  },
  category: {
    backgroundColor: '#ffe082',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#444',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
    height: 40, 
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e53935',
  },
  oldPrice: {
    fontSize: 12,
    color: '#888',
    marginLeft: 6,
    textDecorationLine: 'line-through',
  },
  buyButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 4,
    paddingVertical: 5,
    marginTop: 8,
  },
  buyText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default RelatedProduct;
