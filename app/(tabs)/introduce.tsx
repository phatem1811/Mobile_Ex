import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { NavigationProp } from '@react-navigation/native';

interface IntroPageProps {
  navigation: NavigationProp<any>;
}

const IntroPage: React.FC<IntroPageProps> = ({ navigation }) => {

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Home');
    }, 10000); 

    return () => clearTimeout(timer);
  }, [navigation]);

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
    </View>
  );
}

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
});

export default IntroPage;
