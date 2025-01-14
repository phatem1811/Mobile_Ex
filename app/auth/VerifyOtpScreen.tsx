import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, SafeAreaView, View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const OtpPage = () => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 phút = 300 giây
  const inputRefs = useRef<(TextInput | null)[]>([]); // Lưu trữ tham chiếu đến các ô nhập OTP

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Chuyển focus sang ô tiếp theo khi người dùng nhập
    if (text.length === 1 && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const otpCode = otp.join("");
    console.log("OTP Code:", otpCode);

    if (timeLeft <= 0) {
      Alert.alert("Thông báo", "Mã xác nhận đã hết hạn. Vui lòng thử lại.");
      return;
    }

    // Thực hiện logic xác thực OTP
    Alert.alert("Xác nhận OTP", `Mã OTP của bạn là: ${otpCode}`);
  };

  // Đếm ngược thời gian
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer); // Xóa timer khi component unmount
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
        <TouchableOpacity onPress={handleSubmit} style={styles.btn}>
          <Text style={styles.btnText}>Xác nhận</Text>
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
});

export default OtpPage;
