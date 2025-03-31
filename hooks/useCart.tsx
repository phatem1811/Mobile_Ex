import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CartItem {
  id: string;
  name: string;
  price: number;
  picture: string;
  quantity: number;
  options: any[];
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Omit<CartItem, "quantity">, quantity?: number) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "cart";

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Hàm lấy giỏ hàng từ AsyncStorage
  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
      const parsedCart = cartData ? JSON.parse(cartData) : [];
      setCart(parsedCart);
    } catch (error) {
      console.error("Error loading cart from AsyncStorage:", error);
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
      console.error("Error saving cart to AsyncStorage:", error);
    }
  };

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = (product: Omit<CartItem, "quantity">, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) =>
          item.id === product._id &&
          JSON.stringify(item.options) === JSON.stringify(product.options)
      );
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
  };

  // Tăng số lượng
  const increaseQuantity = (id: string) => {
    setCart((prevCart) => {
      const newCart = prevCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      );
      updateCartStorage(newCart);
      return newCart;
    });
  };

  // Giảm số lượng
  const decreaseQuantity = (id: string) => {
    setCart((prevCart) => {
      const newCart = prevCart.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
      updateCartStorage(newCart);
      return newCart;
    });
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = (id: string) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item.id !== id);
      updateCartStorage(newCart);
      return newCart;
    });
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = () => {
    setCart([]);
    updateCartStorage([]);
  };

  const value: CartContextType = {
    cart,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Hook để sử dụng CartContext
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};