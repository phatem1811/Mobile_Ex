import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import api from "../../api";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import * as Burnt from "burnt";

const OtpPage = () => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [timeLeft, setTimeLeft] = useState(300);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const data = useLocalSearchParams();
  const [errorMessages, setErrorMessages] = useState({
    password: "",
    confirmPassword: "",
  });
  const validateForm = () => {
    const { password, confirmPassword } = form;
    let errors = {
      password: "",
      confirmPassword: "",
    };
    if (!password) errors.password = "Vui lòng nhập mật khẩu.";
    else if (password.length < 6)
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";

    if (password !== confirmPassword)
      errors.confirmPassword = "Mật khẩu không khớp.";

    setErrorMessages(errors);

    return !Object.values(errors).some((error) => error);
  };
  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text.length === 1 && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsLoading(true);
      const otpCode = parseInt(otp.join(""), 10);
      if (isNaN(otpCode)) {
        Alert.alert("Lỗi", "Mã OTP không hợp lệ.");
        return;
      }
      if (timeLeft <= 0) {
        Alert.alert("Thông báo", "Mã xác nhận đã hết hạn. Vui lòng thử lại.");
        return;
      }

      try {
        console.log("check data", data, otpCode);
        const response = await api.post("/v1/account/verify-change-password", {
          phonenumber: data.phone,
          email: data.email,
          newPassword: form.password,
          otp: otpCode,
        });

        router.push("/(tabs)/login");
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data) {
          Alert.alert("Lỗi", err.response?.data.message || "Yêu cầu thất bại.");
        } else {
          Alert.alert(
            "Lỗi",
            "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau."
          );
        }
      } finally {
        Burnt.toast({
          title: "Đổi mật khẩu thành công.",
          preset: "done",
          message: "Chào mừng bạn đến với ứng dụng.",
          duration: 2,
          from: "top",
        });

        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  // Chuyển đổi giây thành phút và giây
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#e8ecf4" }}>
      <KeyboardAwareScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Nhập mã OTP</Text>
          <Text style={styles.subtitle}>
            Chúng tôi đã gửi mã xác nhận đến email của bạn.
          </Text>
        </View>
        <View style={styles.otpContainer}>
          {otp.map((value, index) => (
            <TextInput
              key={index}
              style={styles.otpInput}
              keyboardType="number-pad"
              maxLength={1}
              value={value}
              onChangeText={(text) => handleChange(text, index)}
              ref={(ref) => (inputRefs.current[index] = ref)}
            />
          ))}
        </View>
        <Text style={styles.timer}>
          Thời gian còn lại: {formatTime(timeLeft)}
        </Text>




        <View style={styles.input}>
          <Text style={styles.inputLabel}>Mật khẩu mới</Text>
          <TextInput
            placeholder="Nhập mật khẩu mới"
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
          <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
          <TextInput
            placeholder="Nhập lại mật khẩu mới"
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

        <TouchableOpacity onPress={handleSubmit} style={styles.btn}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <View>
              <Text style={styles.btnText}>Xác nhận</Text>
            </View>
          )}
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    flexGrow: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 36,
  },
  title: {
    marginTop: 28,
    fontSize: 24,
    fontWeight: "700",
    color: "#1D2A32",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#929292",
    textAlign: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 24,
  },
  otpInput: {
    width: 48,
    height: 48,
    backgroundColor: "#fff",
    borderRadius: 8,
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#C9D3DB",
  },
  timer: {
    fontSize: 16,
    color: "#FF0000",
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "600",
  },
  btn: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    paddingVertical: 12,
    backgroundColor: "#075eec",
  },
  btnText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
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
});

export default OtpPage;
