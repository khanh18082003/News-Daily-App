import Editor from "@/components/Editor";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddPost() {
  const [contentHtml, setContentHtml] = useState("");
  const [isLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    publishTime: new Date(),
  });

  const router = useRouter();

  const handleNext = () => {
    if (!formData.title.trim() || !contentHtml.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập tiêu đề và nội dung.");
      return;
    }

    router.push({
      pathname: "/(modals)/preview-post",
      params: {
        title: formData.title,
        thumbnail: selectedImage,
        contentHtml,
      },
    });
  };

  const pickImageAsync = async () => {
    // Request media library permissions if not already granted
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please grant media library access to pick an image."
        );
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only allow images
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    } else {
      Alert.alert("Image selection canceled", "You did not select any image.");
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.header}>Create a Post</Text>

          {/* Image Picker Section */}
          <TouchableOpacity onPress={pickImageAsync}>
            <View
              style={{
                height: 200,
                backgroundColor: "#efefef",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 8,
                overflow: "hidden",
                borderStyle: "dashed",
                borderWidth: 2,
                borderColor: "#2563EB",
              }}
            >
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage }}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <View
                  style={{ justifyContent: "center", alignItems: "center" }}
                >
                  <Ionicons name="add" size={24} color="black" />
                  <Text>Pick a thumbnail image</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TextInput
            placeholder="Add Title"
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
          />

          {/* Rich Text Editor with fixed height so it scrolls internally */}
          <Editor
            value={contentHtml}
            onChange={setContentHtml}
            initialHeight={360}
            fixedHeight
          />
        </ScrollView>

        {/* Footer action fixed at bottom */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleNext}
            disabled={isLoading}
            style={[styles.button, isLoading && { backgroundColor: "#aaa" }]}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Next</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  scrollContent: { padding: 10, gap: 10 },
  header: { fontSize: 22, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    fontSize: 16,
    borderRadius: 8,
    paddingLeft: 12,
    paddingVertical: 16,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    padding: 10,
    backgroundColor: "#fff",
  },
  button: {
    alignSelf: "center",
    width: "50%",
    backgroundColor: "#2563EB",
    borderRadius: 30,
    padding: 12,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 20,
  },
});
