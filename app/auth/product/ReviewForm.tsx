import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import api from "../../../api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import socket from "@/socket";

type ReviewFormProps = {
  productId: string;
};

const ReviewForm: React.FC<ReviewFormProps> = ({ productId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [gender, setGender] = useState<"Anh" | "Chị">("Anh");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const checkToken = async () => {
        const storedToken = await AsyncStorage.getItem("token");
        setToken(storedToken);
        if (storedToken) {
          const response = await api.get("/v1/account/profile", {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });
          setFullName(response.data.fullname);
          setPhone(response.data.phonenumber);
        }
      };
      checkToken();
      return () => {};
    }, [])
  );

  const handleSubmit = async () => {
    if (!fullName || !phone || !comment || rating === 0) {
      Alert.alert("Vui lòng điền đầy đủ thông tin đánh giá");
      return;
    }
    const reviewData = {
      phoneNumber: phone,
      fullName: fullName,
      rating: rating,
      comment: comment,
      product: productId,
    };
    socket.emit("createReview", reviewData);

    router.push("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>Đánh giá:</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity key={i} onPress={() => setRating(i)}>
            <FontAwesome
              name="star"
              size={24}
              color={i <= rating ? "#FFD700" : "#ccc"}
              style={styles.star}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.inputArea}
        placeholder={`Mời ${gender} đánh giá về sản phẩm`}
        value={comment}
        onChangeText={setComment}
        multiline
      />

      <View style={styles.genderContainer}>
        <TouchableOpacity
          style={styles.genderOption}
          onPress={() => setGender("Anh")}
        >
          <View
            style={[styles.radio, gender === "Anh" && styles.radioSelected]}
          />
          <Text style={styles.genderText}>Anh</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.genderOption}
          onPress={() => setGender("Chị")}
        >
          <View
            style={[styles.radio, gender === "Chị" && styles.radioSelected]}
          />
          <Text style={styles.genderText}>Chị</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Họ và tên *"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại *"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Gửi đánh giá</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default ReviewForm;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 100,
  },
  title: {
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 16,
  },
  stars: {
    flexDirection: "row",
    marginBottom: 12,
  },
  star: {
    marginRight: 4,
  },
  inputArea: {
    height: 80,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    textAlignVertical: "top",
  },
  genderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  genderOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    marginRight: 6,
  },
  radioSelected: {
    backgroundColor: "#0a84ff",
    borderColor: "#0a84ff",
  },
  genderText: {
    marginRight: 12,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: "#00FF00",
    padding: 12,
    alignItems: "center",
    borderRadius: 8,
    marginTop: 8,
  },
  submitText: {
    color: "#333",
    fontWeight: "600",
  },
});
