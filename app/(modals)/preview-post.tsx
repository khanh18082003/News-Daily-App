import { createNews, predictTopic } from "@/services/news.service";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import WebView from "react-native-webview";

export default function PreviewPost() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    title?: string;
    thumbnail?: string;
    contentHtml?: string;
  }>();

  const title = (params.title ?? "").toString();
  const thumbnail = (params.thumbnail ?? "").toString();
  const contentHtml = (params.contentHtml ?? "").toString();

  const [predictedTopic, setPredictedTopic] = useState<string>("");
  const [predicting, setPredicting] = useState<boolean>(false);
  const [posting, setPosting] = useState<boolean>(false);
  const [isEditingTopic, setIsEditingTopic] = useState<boolean>(false);

  const html = useMemo(() => {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      body { font-family: -apple-system, Roboto, "Segoe UI", Arial, sans-serif; padding: 0px; color: #111827; line-height: 1.4; }
      img, video { max-width: 100%; height: auto; }
      pre, code { white-space: pre-wrap; word-break: break-word; }
      h1,h2,h3 { margin: 0.6em 0 0.4em; }
      p { margin: 0.5em 0; }
      ul,ol { padding-left: 1.2em; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #e5e7eb; padding: 6px; }
    </style>
  </head>
  <body>${contentHtml || ""}</body>
</html>`;
  }, [contentHtml]);

  useEffect(() => {
    let mounted = true;

    const runPredict = async () => {
      if (!title && !contentHtml) return;
      try {
        setPredicting(true);
        console.log(title, contentHtml);
        // Điều chỉnh payload/field tùy theo chữ ký của predictTopic trong news.service.ts
        const res = await predictTopic(title, contentHtml);
        console.log("Prediction response:", res);
        let topic: string | undefined;

        topic = res.label;

        if (mounted) setPredictedTopic(topic ?? "Unknown");
      } catch (e) {
        console.warn("Predict failed", e);
        if (mounted) setPredictedTopic("Unknown");
      } finally {
        if (mounted) setPredicting(false);
      }
    };

    runPredict();
    return () => {
      mounted = false;
    };
  }, [title, contentHtml]);

  const handlePost = async () => {
    if (!title.trim() || !contentHtml.trim()) {
      Alert.alert("Thông báo", "Thiếu tiêu đề hoặc nội dung.");
      return;
    }

    try {
      setPosting(true);
      const payload = {
        title,
        author: "User",
        thumbnail: thumbnail,
        content: contentHtml,
        topic: predictedTopic,
        publishTime: new Date(),
      };

      await createNews(payload);
      Alert.alert("Thành công", "Tin tức đã được đăng!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      console.warn("Create news failed", e);
      Alert.alert("Lỗi", "Không thể tạo bài viết, hãy thử lại.");
    } finally {
      setPosting(false);
    }
  };

  const handleEdit = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Preview</Text>
      <View
        style={{
          height: 200,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <Image
          source={{ uri: thumbnail }}
          style={{ width: "100%", height: 200 }}
        />
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Title</Text>
        <Text style={styles.title}>{title || "(No title)"}</Text>

        <Text style={[styles.label, { marginTop: 12 }]}>Content</Text>

        {/* Đặt chiều cao cụ thể cho WebView, bỏ ScrollView bao ngoài */}
        <WebView
          originWhitelist={["*"]}
          source={{ html }}
          style={{ height: 320, borderRadius: 8, overflow: "hidden" }}
          javaScriptEnabled
          domStorageEnabled
          mixedContentMode="always"
        />

        <View style={styles.topicRow}>
          <Text style={styles.label}>Predicted Topic:</Text>
          {predicting ? (
            <ActivityIndicator size="small" />
          ) : (
            <>
              {!isEditingTopic ? (
                <View style={styles.topicDisplayRow}>
                  <Text style={styles.topicValue}>
                    {predictedTopic || "Unknown"}
                  </Text>
                  <Pressable
                    hitSlop={8}
                    onPress={() => setIsEditingTopic(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Edit topic"
                  >
                    <Ionicons name="create-outline" size={18} color="#2563EB" />
                  </Pressable>
                </View>
              ) : (
                <View style={styles.topicEditRow}>
                  <TextInput
                    style={styles.topicInput}
                    value={predictedTopic}
                    placeholder="Enter topic"
                    onChangeText={setPredictedTopic}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={() => setIsEditingTopic(false)}
                  />
                  <Pressable
                    hitSlop={8}
                    onPress={() => setIsEditingTopic(false)}
                    accessibilityRole="button"
                    accessibilityLabel="Save topic"
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="#16a34a"
                    />
                  </Pressable>
                </View>
              )}
            </>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleEdit}
          style={[styles.btn, styles.secondary]}
        >
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePost}
          disabled={posting}
          style={[styles.btn, styles.primary, posting && { opacity: 0.7 }]}
        >
          {posting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.btnText, { color: "#fff" }]}>Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, gap: 12 },
  header: { fontSize: 22, fontWeight: "700" },
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
    gap: 6,
    flex: 1,
  },
  label: { color: "#6b7280", fontSize: 12, fontWeight: "600" },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  contentBox: { maxHeight: 300, marginTop: 4 },
  contentText: { fontSize: 16, lineHeight: 22, color: "#111827" },
  topicRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  topicValue: { fontSize: 14, fontWeight: "700", color: "#2563EB" },
  topicDisplayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  topicEditRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  topicInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#111827",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  primary: { backgroundColor: "#2563EB" },
  secondary: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  btnText: { fontWeight: "700", color: "#111827", fontSize: 16 },
});
