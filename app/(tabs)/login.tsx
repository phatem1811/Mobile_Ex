import React, { useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";
import api from "../../api";
import { Toast } from "toastify-react-native"; 
import * as Burnt from 'burnt';
const LoginPage = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    phonenumber: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    phonenumber: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setForm({
        phonenumber: "",
        password: "",
      });
      setErrors({
        phonenumber: "",
        password: "",
      });
    }, [])
  );

  const validateForm = () => {
    const phoneRegex = /^[0-9]{10}$/;
    const newErrors = {
      phonenumber: "",
      password: "",
    };

    if (!form.phonenumber.trim()) {
      newErrors.phonenumber = "Số điện thoại không được để trống.";
    } else if (!phoneRegex.test(form.phonenumber)) {
      newErrors.phonenumber =
        "Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng.";
    }

    if (!form.password.trim()) {
      newErrors.password = "Mật khẩu không được để trống.";
    } else if (form.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    setErrors(newErrors);
    return !newErrors.phonenumber && !newErrors.password;
  };

  const handleLogin = async () => {
    
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const response = await api.post(
        "/v1/account/login",
        {
          phonenumber: form.phonenumber,
          password: form.password,
        }
      );

      const token = response.data.accountLogin.access_token;
      if (token) {
        await AsyncStorage.setItem("token", token);
        
        router.push("/(tabs)");
        
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        Alert.alert("Lỗi", err.response?.data.message || "Đăng nhập thất bại.");
      } else {
        Alert.alert(
          "Lỗi",
          "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau."
        );
      }
    } finally {
      Burnt.toast({
        title: 'Đăng nhập thành công.',
        preset: 'done',
        message: 'Chào mừng bạn đến với ứng dụng.',
        duration: 2, 
        from: 'top', 
      });
    
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "#e8ecf4" }}>
        <KeyboardAwareScrollView
          style={styles.container}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={styles.header}>
            <Image
              alt="Logo ứng dụng"
              resizeMode="contain"
              style={styles.headerImg}
              source={require("../../assets/images/logo1.png")}
            />
            <Text style={styles.title}>
              Đăng nhập vào{" "}
              <Text style={{ color: "#FF6600" }}>FastFood Online</Text>
            </Text>
            <Text style={styles.subtitle}>
              Truy cập danh mục của bạn và nhiều hơn nữa
            </Text>
          </View>
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <TextInput
                autoCapitalize="none"
                keyboardType="phone-pad"
                placeholder="Nhập số điện thoại"
                style={[
                  styles.inputControl,
                  errors.phonenumber ? styles.inputError : null,
                ]}
                placeholderTextColor="#6b7280"
                value={form.phonenumber}
                onChangeText={(text) => setForm({ ...form, phonenumber: text })}
              />
              {errors.phonenumber ? (
                <Text style={styles.errorText}>{errors.phonenumber}</Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mật khẩu</Text>
              <TextInput
                secureTextEntry
                placeholder="Nhập mật khẩu"
                style={[
                  styles.inputControl,
                  errors.password ? styles.inputError : null,
                ]}
                placeholderTextColor="#6b7280"
                value={form.password}
                onChangeText={(text) => setForm({ ...form, password: text })}
              />
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
            </View>

            <View style={styles.formAction}>
              <TouchableOpacity onPress={handleLogin} disabled={isLoading}>
                <View style={styles.btn}>
                  <Text style={styles.btnText}>
                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/auth/FogetPasswordScreen")}
            >
              <Text style={styles.formLink}>Quên mật khẩu?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/auth/RegisterScreen")}
            >
              <Text style={styles.formFooter}>
                Bạn chưa có tài khoản?{" "}
                <Text
                  style={{ textDecorationLine: "underline", color: "#075eec" }}
                >
                  Đăng ký
                </Text>
              </Text>
              <TouchableOpacity
                style={styles.homeIcon}
                onPress={() => router.push("/(tabs)")}
              >
                <Icon name="home" size={30} color="#075eec" />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 24, flexGrow: 1 },
  title: { fontSize: 25, fontWeight: "700", color: "#1D2A32", marginBottom: 6 },
  subtitle: { fontSize: 15, fontWeight: "500", color: "#929292" },
  header: { alignItems: "center", marginVertical: 36 },
  headerImg: { width: 80, height: 80, marginBottom: 36 },
  form: { marginHorizontal: 24 },
  inputContainer: { marginBottom: 16 },
  inputLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#222",
    marginBottom: 8,
  },
  inputControl: {
    height: 50,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: "500",
    color: "#222",
    borderWidth: 1,
    borderColor: "#C9D3DB",
  },
  inputError: { borderColor: "#ff0000" },
  errorText: { color: "#ff0000", fontSize: 13, marginTop: 4 },
  btn: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    paddingVertical: 12,
    backgroundColor: "#075eec",
  },
  btnText: { fontSize: 18, fontWeight: "600", color: "#fff" },
  formAction: { marginBottom: 16 },
  formLink: { fontSize: 16, color: "#075eec", textAlign: "center" },
  formFooter: {
    paddingVertical: 24,
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
    textAlign: "center",
    letterSpacing: 0.15,
  },
  homeIcon: {
    textAlign: "center",
    padding: 10,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
});

export default LoginPage;
