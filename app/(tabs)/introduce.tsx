import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const IntroPage = () => {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      const checkToken = async () => {
        const storedToken = await AsyncStorage.getItem('token');
        setToken(storedToken); // Cập nhật giá trị token
        console.log("check token", storedToken);
      };

      checkToken(); 

      return () => {

      };
    }, [])
  );

  const handleLogin = () => {
    router.push('/(tabs)/login');
  };

  const handleRegister = () => {
    router.push('/auth/RegisterScreen');
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token'); 
    setToken(null); 
    router.push('/(tabs)/login'); 
  };

  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Vui lòng đăng nhập</Text>
        <View style={styles.buttonContainer}>
          <Button title="Đăng nhập" onPress={handleLogin} color="#4CAF50" />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Đăng ký" onPress={handleRegister} color="#FF5722" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        style={styles.profileImage}
        source={require('../../assets/images/iconuser.png')}
      />
      <Text style={styles.name}>Họ và Tên: Huỳnh Tiến Phát</Text>
      <Text style={styles.introduction}>
        Đây là ứng dụng React Native đầu tiên của tôi.
      </Text>
      <Text style={styles.hobby}>Sở thích: Lập trình, chơi game.</Text>

      <View style={styles.buttonContainer}>
        <Button title="Đăng xuất" onPress={handleLogout} color="#FF5722" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  introduction: {
    fontSize: 18,
    marginTop: 10,
    color: '#555',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  hobby: {
    fontSize: 16,
    marginTop: 15,
    color: '#777',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    color: '#333',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default IntroPage;
