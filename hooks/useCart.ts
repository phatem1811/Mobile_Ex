import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CartItem {
  id: string;
  name: string;
  price: number;
  picture: string;
  quantity: number;
  options: any[];
}

const CART_STORAGE_KEY = 'cart';

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Hàm lấy giỏ hàng từ AsyncStorage
  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
      const parsedCart = cartData ? JSON.parse(cartData) : [];
      setCart(parsedCart);
    } catch (error) {
      console.error('Error loading cart from AsyncStorage:', error);
    }
  };

  // Đồng bộ giỏ hàng khi component mount
  useEffect(() => {
    loadCart();
  }, []);

  // Hàm cập nhật giỏ hàng và lưu vào AsyncStorage
  const updateCartStorage = async (updatedCart: CartItem[]) => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
      setCart(updatedCart);
    } catch (error) {
      console.error('Error saving cart to AsyncStorage:', error);
    }
  };

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = useCallback((product: {
    _id: string;
    name: string;
    price: number;
    picture: string;
    options?: any[];
  }, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(item => item.id === product._id);
      let newCart: CartItem[];

      if (existingItemIndex > -1) {
        newCart = prevCart.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: product._id,
          name: product.name,
          price: product.price,
          picture: product.picture,
          quantity,
          options: product.options || [],
        };
        newCart = [...prevCart, newItem];
      }

      updateCartStorage(newCart);
      return newCart;
    });
  }, []);

  // Tăng số lượng
  const increaseQuantity = useCallback((id: string) => {
    setCart((prevCart) => {
      const newCart = prevCart.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      );
      updateCartStorage(newCart);
      return newCart;
    });
  }, []);

  // Giảm số lượng
  const decreaseQuantity = useCallback((id: string) => {
    setCart((prevCart) => {
      const newCart = prevCart.map(item =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
      updateCartStorage(newCart);
      return newCart;
    });
  }, []);

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = useCallback((id: string) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter(item => item.id !== id);
      updateCartStorage(newCart);
      return newCart;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    updateCartStorage([]);
  }, []);

  // console.log('cart', cart);

  return {
    cart,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  };
};