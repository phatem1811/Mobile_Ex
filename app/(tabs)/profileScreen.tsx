import React, { useState } from "react";
import { View, Text, TextInput, Image, TouchableOpacity } from "react-native";
import { Avatar, Button } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";

const ProfileScreen = () => {
  const [email, setEmail] = useState("huynhtienphat1811@gmail.com");
  const [gender, setGender] = useState("");

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
      {/* Avatar */}
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Avatar.Icon size={80} icon="camera" />
        <Text style={{ marginTop: 10, color: "#888" }}>0 điểm</Text>
      </View>
      <Text style={{ fontSize: 14, color: "#777" }}>Họ và tên</Text>
      {/* Tên */}
      <TextInput
        style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
        value="Phát"
        underlineColorAndroid="black"
      />

      {/* Số điện thoại */}
      <Text style={{ fontSize: 14, color: "#777" }}>Số điện thoại</Text>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
      >
        <Image
          source={{ uri: "https://flagcdn.com/w40/vn.png" }}
          style={{ width: 20, height: 14, marginRight: 5 }}
        />
        <TextInput
          value="+84 971025289"
          editable={false}
          style={{
            fontSize: 16,
            width: "100%", // Đảm bảo gạch chân kéo dài hết dòng
            borderBottomWidth: 1, // Độ dày của gạch chân
            borderBottomColor: "black", // Màu gạch chân
            paddingVertical: 8, // Tạo khoảng cách trên/dưới
          }}
        />
      </View>

      {/* Email */}
      <Text style={{ fontSize: 14, color: "#777" }}>
        Nhập địa chỉ email của bạn
      </Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={{ fontSize: 16, marginBottom: 5 }}
      />
      <TouchableOpacity>
        <Text style={{ color: "blue", textDecorationLine: "underline" }}>
          Yêu cầu gửi lại email xác thực
        </Text>
      </TouchableOpacity>

      {/* Giới tính */}
      <Text style={{ fontSize: 14, color: "#777", marginTop: 10 }}>
        Giới tính
      </Text>
      <Picker
        selectedValue={gender}
        onValueChange={(value) => setGender(value)}
      >
        <Picker.Item label="Vui lòng chọn giới tính" value="" />
        <Picker.Item label="Nam" value="male" />
        <Picker.Item label="Nữ" value="female" />
        <Picker.Item label="Khác" value="other" />
      </Picker>

      {/* Nút lưu */}
      <Button mode="contained" style={{ marginTop: 20 }}>
        Lưu
      </Button>
    </View>
  );
};

export default ProfileScreen;
