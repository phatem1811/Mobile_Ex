const upload_present = "food_order";
const cloud_name = "ddjnapodl";
import * as FileSystem from 'expo-file-system';
//const folder_name = "food_order"
//const urls=[]
const api_url = `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`;

export const uploadImageToCloudinary = async (fileUri) => {
    try {
      const base64Data = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      const data = new FormData();
      data.append("file", `data:image/png;base64,${base64Data}`);  
      data.append("upload_preset", "food_order");
      data.append("cloud_name", "ddjnapodl");
  
      const res = await fetch(`https://api.cloudinary.com/v1_1/ddjnapodl/image/upload`, {
        method: "POST",
        body: data,
      });
  
      const fileData = await res.json();
      console.log(fileData);
      return fileData.url;
    } catch (error) {
      console.error("Error uploading image: ", error);
    }
  };