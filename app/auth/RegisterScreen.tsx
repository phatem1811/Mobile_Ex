import React, { useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import api from "../../api";
import axios from "axios";
const RegisterPage = () => {
  const navigation = useNavigation();

  const [form, setForm] = useState({
    phone: "",
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessages, setErrorMessages] = useState({
    phone: "",
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    const { phone, email, fullName, password, confirmPassword } = form;
    let errors = {
      phone: "",
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    };

    if (!phone) errors.phone = "Vui lòng nhập số điện thoại.";
    else if (!/^\d{10}$/.test(phone))
      errors.phone = "Số điện thoại không hợp lệ.";

    if (!email) errors.email = "Vui lòng nhập email.";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Email không hợp lệ.";

    if (!fullName) errors.fullName = "Vui lòng nhập họ và tên.";

    if (!password) errors.password = "Vui lòng nhập mật khẩu.";
    else if (password.length < 6)
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";

    if (password !== confirmPassword)
      errors.confirmPassword = "Mật khẩu không khớp.";

    setErrorMessages(errors);

    return !Object.values(errors).some((error) => error);
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        setIsLoading(true);
        const response = await api.post("/v1/account/send-otp", {
          phonenumber: form.phone,
          email: form.email,
          password: form.password,
          fullname: form.fullName,
        });

        router.push({
          pathname: "/auth/VerifyOtpScreen",
          params: {
            phone: form.phone,
            email: form.email,
            password: form.password,
            fullName: form.fullName,
          },
        });
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data) {
          Alert.alert("Lỗi", err.response?.data.message || "Đăng ký thất bại.");
        } else {
          Alert.alert(
            "Lỗi",
            "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau."
          );
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#e8ecf4" }}>
      <KeyboardAwareScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Đăng ký tài khoản</Text>
        </View>
        <View style={styles.form}>
          {/* Các trường nhập liệu */}
          <View style={styles.input}>
            <Text style={styles.inputLabel}>Số điện thoại</Text>
            <TextInput
              keyboardType="phone-pad"
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#6b7280"
              style={[
                styles.inputControl,
                errorMessages.phone && styles.inputError,
              ]}
              onChangeText={(phone) => setForm({ ...form, phone })}
              value={form.phone}
            />
            {errorMessages.phone && (
              <Text style={styles.errorText}>{errorMessages.phone}</Text>
            )}
          </View>
          <View style={styles.input}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              keyboardType="email-address"
              placeholder="Nhập email"
              placeholderTextColor="#6b7280"
              style={[
                styles.inputControl,
                errorMessages.email && styles.inputError,
              ]}
              onChangeText={(email) => setForm({ ...form, email })}
              value={form.email}
            />
            {errorMessages.email && (
              <Text style={styles.errorText}>{errorMessages.email}</Text>
            )}
          </View>
          <View style={styles.input}>
            <Text style={styles.inputLabel}>Họ và tên</Text>
            <TextInput
              placeholder="Nhập họ và tên"
              placeholderTextColor="#6b7280"
              style={[
                styles.inputControl,
                errorMessages.fullName && styles.inputError,
              ]}
              onChangeText={(fullName) => setForm({ ...form, fullName })}
              value={form.fullName}
            />
            {errorMessages.fullName && (
              <Text style={styles.errorText}>{errorMessages.fullName}</Text>
            )}
          </View>
          <View style={styles.input}>
            <Text style={styles.inputLabel}>Mật khẩu</Text>
            <TextInput
              placeholder="Nhập mật khẩu"
              placeholderTextColor="#6b7280"
              style={[
                styles.inputControl,
                errorMessages.password && styles.inputError,
              ]}
              secureTextEntry
              onChangeText={(password) => setForm({ ...form, password })}
              value={form.password}
            />
            {errorMessages.password && (
              <Text style={styles.errorText}>{errorMessages.password}</Text>
            )}
          </View>
          <View style={styles.input}>
            <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
            <TextInput
              placeholder="Nhập lại mật khẩu"
              placeholderTextColor="#6b7280"
              style={[
                styles.inputControl,
                errorMessages.confirmPassword && styles.inputError,
              ]}
              secureTextEntry
              onChangeText={(confirmPassword) =>
                setForm({ ...form, confirmPassword })
              }
              value={form.confirmPassword}
            />
            {errorMessages.confirmPassword && (
              <Text style={styles.errorText}>
                {errorMessages.confirmPassword}
              </Text>
            )}
          </View>
          <View style={styles.formAction}>
            <TouchableOpacity onPress={handleSubmit} style={styles.btn}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" /> 
              ) : (
                <View >
                  <Text style={styles.btnText}>Đăng ký</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            router.push("/(tabs)/login");
          }}
        >
          <Text style={styles.formFooter}>
            Đã có tài khoản?{" "}
            <Text style={{ textDecorationLine: "underline", color: "#075eec" }}>
              Đăng nhập
            </Text>
          </Text>
          <TouchableOpacity
            style={styles.homeIcon}
            onPress={() => router.push("/(tabs)")}
          >
            <Icon name="home" size={30} color="#075eec" />
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    justifyContent: "center",
  },
  form: {
    marginBottom: 24,
    paddingHorizontal: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  container: {
    paddingVertical: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  title: {
    fontSize: 31,
    fontWeight: "700",
    color: "#1D2A32",
    marginBottom: 6,
    textAlign: "center",
    marginTop: 40,
  },
  input: {
    marginBottom: 16,
  },
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
    borderStyle: "solid",
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
  formAction: {
    marginTop: 16,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: "#075eec",
    borderColor: "#075eec",
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    color: "#fff",
  },
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
  button: {
    backgroundColor: "#075eec",
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default RegisterPage;
