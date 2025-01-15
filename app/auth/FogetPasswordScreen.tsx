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
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";
import api from "../../api";
import axios from "axios";

const ForgetPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState({
    phone: "",
    email: "",
  });
  const router = useRouter();

  const validateForm = () => {
    let isValid = true;
    let tempErrors = { phone: "", email: "" };

    if (!form.phone) {
      tempErrors.phone = "Số điện thoại không được để trống.";
      isValid = false;
    } else if (!/^[0-9]{10,11}$/.test(form.phone)) {
      tempErrors.phone = "Số điện thoại không hợp lệ.";
      isValid = false;
    }

    if (!form.email) {
      tempErrors.email = "Email không được để trống.";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      tempErrors.email = "Email không hợp lệ.";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        setIsLoading(true);
        const response = await api.post("/v1/account/reset-password", {
          phonenumber: form.phone,
          email: form.email,
        });

        router.push({
          pathname: "/auth/VerifyResetPassScreen",
          params: {
            phone: form.phone,
            email: form.email,
          },
        });
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data) {
          Alert.alert(
            "Lỗi",
            err.response?.data.message || "Yêu cầu  thất bại."
          );
        } else {
          Alert.alert(
            "Lỗi",
            "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau."
          );
        }
      } finally {
        setIsLoading(false);
      }

      console.log("Form submitted:", form);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#e8ecf4" }}>
      <KeyboardAwareScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Quên mật khẩu</Text>
          <Text style={styles.subtitle}>
            Nhập số điện thoại và email để khôi phục mật khẩu của bạn.
          </Text>
        </View>
        <View style={styles.form}>
          <View style={styles.input}>
            <Text style={styles.inputLabel}>Số điện thoại</Text>
            <TextInput
              keyboardType="phone-pad"
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#6b7280"
              style={[
                styles.inputControl,
                errors.phone ? styles.inputError : null,
              ]}
              onChangeText={(phone) => setForm({ ...form, phone })}
              value={form.phone}
            />
            {errors.phone ? (
              <Text style={styles.errorText}>{errors.phone}</Text>
            ) : null}
          </View>
          <View style={styles.input}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              keyboardType="email-address"
              placeholder="Nhập email"
              placeholderTextColor="#6b7280"
              style={[
                styles.inputControl,
                errors.email ? styles.inputError : null,
              ]}
              onChangeText={(email) => setForm({ ...form, email })}
              value={form.email}
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </View>
          <View style={styles.formAction}>
            <TouchableOpacity onPress={handleSubmit} style={styles.btn}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" ></ActivityIndicator>
              ) : (
                <View>
                  <Text style={styles.btnText}>Khôi phục mật khẩu</Text>
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
            Nhớ mật khẩu?{" "}
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
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#929292",
    textAlign: "center",
    marginBottom: 20,
  },
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
  errorText: {
    color: "red",
    fontSize: 13,
    marginTop: 4,
  },
  inputError: {
    borderColor: "red",
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

export default ForgetPasswordPage;
