import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Button,
  Alert,
  Platform,
  ActivityIndicator ,
} from "react-native";
import { TextInput, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Avatar } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as Burnt from "burnt";
import api from "../../api";
import  { uploadImageToCloudinary } from"../../UploadToCloud"
import axios from "axios";
import { launchImageLibrary } from "react-native-image-picker";

const IntroPage = () => {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [imageUri, setImageUri] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullname: "",
    phonenumber: "",
    email: "",
    address: "",
    point: "",
    birthdate: new Date(),
    avatar: ""
  });

  useFocusEffect(
    React.useCallback(() => {
      const checkToken = async () => {
        const storedToken = await AsyncStorage.getItem("token");
        setToken(storedToken);
        setIsFormChanged(false);
        console.log("check token", storedToken);
        if (storedToken) {
          const response = await api.get("/v1/account/profile", {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });
          console.log("User Info:", response.data._id);
          setUserInfo(response.data._id);

          const parsedBirthday =
            response.data.birthdate &&
            !isNaN(new Date(response.data.birthdate).getTime())
              ? new Date(response.data.birthdate)
              : new Date();

          setForm({
            fullname: response.data.fullname || "",
            phonenumber: response.data.phonenumber || "",
            email: response.data.email || "",
            address: response.data.address || "",
            point: response.data.point || "",
            avatar: response.data.avatar || "",
            birthdate: parsedBirthday,
          });
          if(response.data.avatar) setImageUri(response.data.avatar);
          console.log("check form:", form);
        }
      };

      checkToken();

      return () => {};
    }, [])
  );
  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prevForm) => {
      const updatedForm = { ...prevForm, [field]: value };
      setIsFormChanged(
        JSON.stringify(updatedForm) !== JSON.stringify(userInfo)
      ); // So sánh với dữ liệu gốc
      return updatedForm;
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleChange("birthdate", selectedDate);
    }
  };

  const handleLogin = () => {
    router.push("/(tabs)/login");
  };
  const handleUpdate = async () => {
    let isSuccess = false;
    console.log("check update", form);
    try {
      console.log("check imageUri", imageUri);
      setIsLoading(true);
      const response = await api.put(`/v1/account/${userInfo}`, {
        fullname: form.fullname,
        address: form.address,
        birthdate: form.birthdate.toISOString(),
        avatar: imageUri
      });

      isSuccess = true;

      router.push("/(tabs)/introduce");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        Alert.alert("Lỗi", err.response?.data.message || "Cập nhật thất bại.");
      } else {
        Alert.alert(
          "Lỗi",
          "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau."
        );
      }
    } finally {
      if (isSuccess) {
        Burnt.toast({
          title: "Cập nhật thành công.",
          preset: "done",
          message: "Chào mừng bạn đến với ứng dụng.",
          duration: 2,
          from: "top",
        });
      }

      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    router.push("/auth/RegisterScreen");
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    setToken(null);
    Burnt.toast({
      title: "Đăng xuất thành công.",
      preset: "done",
      message: "Chào mừng bạn đến với ứng dụng.",
      duration: 2,
      from: "top",
    });
    router.push("/(tabs)/login");
  };

  // const requestPermissions = async () => {
  //   const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //   if (status !== 'granted') {
  //     alert('Sorry, we need camera roll permissions to make this work!');
  //   }
  // };
  
  // useEffect(() => {
  //   requestPermissions();
  // }, []);
  const pickImage = async () => {
    const action = await Alert.alert(
      'Chọn ảnh',
      'Chọn ảnh từ thư viện hoặc chụp ảnh mới',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Chọn ảnh từ thư viện',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 1,
            });
            if (!result.canceled && result.assets) {
              const imageUri = result.assets[0].uri;
              console.log('Selected image from library:', imageUri);

              // Bắt đầu tải ảnh lên
              setLoading(true);
              try {
                const uploadedImageUrl = await uploadImageToCloudinary(imageUri);
                setImageUri(uploadedImageUrl);
                setIsFormChanged(true);
                console.log('Image uploaded to Cloudinary:', uploadedImageUrl);
              } catch (error) {
                console.error("Upload failed", error);
              } finally {
                setLoading(false); // Dừng loading
              }
            }
          },
        },
        {
          text: 'Chụp ảnh',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission required', 'Camera permission is required to take photos.');
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              quality: 1,
            });
            if (!result.canceled && result.assets) {
              const imageUri = result.assets[0].uri;
              console.log('Selected image from camera:', imageUri);

              // Bắt đầu tải ảnh lên
              setLoading(true);
              try {
                const uploadedImageUrl = await uploadImageToCloudinary(imageUri);
                setImageUri(uploadedImageUrl);
                setIsFormChanged(true);
                console.log('Image uploaded to Cloudinary:', uploadedImageUrl);
              } catch (error) {
                console.error("Upload failed", error);
              } finally {
                setLoading(false); // Dừng loading
              }
            }
          },
        },
      ]
    );
  };
  if (!token) {
    return (
      <View style={styles.container}>
        <Image
          alt="Logo ứng dụng"
          resizeMode="contain"
          style={styles.headerImg}
          source={require("../../assets/images/logo1.png")}
        />
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
    <View
      style={{ flex: 1, padding: 20, marginTop: 30, backgroundColor: "#fff" }}
    >
      {/* Avatar */}

      <View style={{ alignItems: "center", marginBottom: 20 }}>
      <TouchableOpacity onPress={pickImage}>
        {loading ? (
          // Hiển thị Loading Spinner khi đang upload
          <ActivityIndicator size="large" color="#0000ff" />
        ) : imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: 80, height: 80, borderRadius: 40 }}
          />
        ) : (
          <Avatar.Icon size={80} icon="camera" />
        )}
      </TouchableOpacity>
      <Text style={{ marginTop: 10, color: "#888" }}>Điểm của bạn: {form.point} điểm</Text>
    </View>
      <Text style={{ fontSize: 14, color: "#777" }}>Họ và tên</Text>
      {/* Tên */}
      <TextInput
        style={{
          fontSize: 18,
          fontWeight: "bold",
          marginBottom: 10,
          borderBottomWidth: 1, // Gạch chân toàn dòng
          borderBottomColor: "black",
        }}
        value={form.fullname} // Gán giá trị từ state
        onChangeText={(text) => handleChange("fullname", text)}
      />

      {/* Số điện thoại */}
      <Text style={{ fontSize: 14, color: "#777" }}>Số điện thoại</Text>

      <View
        pointerEvents="none"
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 10,
          borderBottomWidth: 1, // Gạch chân toàn dòng
          width: "100%",
          borderBottomColor: "black",
        }}
      >
        <Image
          source={{ uri: "https://flagcdn.com/w40/vn.png" }}
          style={{ width: 20, height: 14, marginRight: 5 }}
        />
        <TextInput
          style={{
            fontSize: 18,
            fontWeight: "bold",
            marginBottom: 5,
            color: "#C0C0C0",
          }}
          value={form.phonenumber} // Gán giá trị từ state
          onChangeText={(text) => handleChange("phonenumber", text)}
        />
      </View>

      {/* Email */}
      <Text style={{ fontSize: 14, color: "#777" }}>
        Nhập địa chỉ email của bạn
      </Text>
      <View pointerEvents="none">
        <TextInput
          value={form.email}
          onChangeText={(text) => handleChange("email", text)}
          style={{
            fontSize: 16,
            marginBottom: 5,
            borderBottomWidth: 1,
            width: "100%",
            borderBottomColor: "black",
            color: "#C0C0C0",
          }}
        />
      </View>
      <Text style={{ fontSize: 14, color: "#777" }}>Nhập địa chỉ của bạn</Text>
      <View>
        <TextInput
          value={form.address}
          onChangeText={(text) => handleChange("address", text)}
          style={{
            fontSize: 16,
            marginBottom: 5,
            borderBottomWidth: 1,
            width: "100%",
            borderBottomColor: "black",
          }}
        />
      </View>

      {/* Ngày sinh */}
      <Text style={{ fontSize: 14, color: "#777" }}>Ngày sinh</Text>
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={{
          borderBottomWidth: 1,
          borderBottomColor: "black",
          paddingVertical: 8,
          marginBottom: 10,
        }}
      >
        <Text style={{ fontSize: 16 }}>
          {form.birthdate instanceof Date && !isNaN(form.birthdate.getTime())
            ? form.birthdate.toLocaleDateString("vi-VN")
            : "Chưa chọn ngày sinh"}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={
            form.birthdate instanceof Date && !isNaN(form.birthdate.getTime())
              ? form.birthdate
              : new Date()
          }
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* <View style={styles.buttonContainer}>
        <Button title="Cập nhật" onPress={handleLogout} color="#4CAF50" />
      </View> */}
      <View style={styles.buttonContainer}>
        <Button
          title="Cập nhật"
          onPress={handleUpdate}
          color="#4CAF50"
          disabled={!isFormChanged}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Đăng xuất" onPress={handleLogout} color="#FF5722" />
      </View>

      {/* Nút lưu */}
      {/* <Button mode="contained" style={{ marginTop: 20 }}>
        Đăng xuất
      </Button>
      <Button mode="contained" style={{ marginTop: 20 }}>
        Cập nhật
      </Button> */}
    </View>
  );
};

const styles = StyleSheet.create({
  headerImg: { width: 160, height: 160, marginBottom: 20 },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f8ff",
    padding: 20,
    paddingBottom: 0,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  introduction: {
    fontSize: 18,
    marginTop: 10,
    color: "#555",
    textAlign: "center",
    marginHorizontal: 20,
  },
  hobby: {
    fontSize: 16,
    marginTop: 15,
    color: "#777",
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    marginTop: 0,
    color: "#333",
  },
  buttonContainer: {
    width: "100%",
    marginTop: 30,
    marginBottom: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
});

export default IntroPage;
