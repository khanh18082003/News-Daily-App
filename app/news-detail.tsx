import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const { width } = Dimensions.get("window");

const NewsDetail = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ item: string }>();
  const item = params.item ? JSON.parse(params.item) : null;
  const [webViewHeight, setWebViewHeight] = React.useState(0); // Start with 0 to avoid flicker
  const webViewRef = useRef<WebView>(null);

  const formatDate = (dateValue: any) => {
    if (!dateValue) return "N/A";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "N/A";
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // ✅ Optimized HTML content with robust height detection
  const htmlContent = `
    <!DOCTYPE html>
    <html style="height: auto;">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
        <style>
          html { height: auto; min-height: 0; }
          body {
            height: auto;
            min-height: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            padding: 10px;
            margin: 0;
            color: #111827;
            line-height: 1.6;
            background-color: #fff;
            font-size: 16px;
            word-wrap: break-word;
          }
          img, video { 
            max-width: 100%; 
            height: auto; 
            border-radius: 8px; 
            margin: 12px 0; 
            display: block;
          }
          h1, h2, h3 { 
            margin: 1em 0 0.5em; 
            font-weight: 600; 
          }
          p { 
            margin: 0.8em 0; 
          }
          ul, ol { 
            padding-left: 20px; 
            margin: 0.8em 0; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 12px 0; 
          }
          th, td { 
            border: 1px solid #e5e7eb; 
            padding: 8px; 
            text-align: left; 
          }
          a { 
            color: #1d4ed8; 
            text-decoration: none; 
          }
          a:hover { 
            text-decoration: underline; 
          }
        </style>
      </head>
      <body>
        ${item?.content || "No content available"}
        <script>
          (function() {
            let debounceTimeout;
            function updateHeight() {
              clearTimeout(debounceTimeout);
              debounceTimeout = setTimeout(() => {
                const height = Math.max(
                  document.body.scrollHeight,
                  document.body.offsetHeight,
                  document.documentElement.scrollHeight,
                  document.documentElement.offsetHeight
                );
                window.ReactNativeWebView.postMessage(JSON.stringify({ height: height }));
              }, 100);
            }
            window.addEventListener("load", updateHeight);
            // Removed resize listener to prevent potential feedback loops
            // MutationObserver to detect dynamic content changes
            const observer = new MutationObserver(updateHeight);
            observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class', 'height', 'width'] });
            // Add load listeners for media elements
            const mediaElements = document.querySelectorAll('img, video');
            mediaElements.forEach(el => {
              if (!el.complete) {
                el.addEventListener('load', updateHeight);
                el.addEventListener('error', updateHeight);
              }
            });
            // Update height periodically for slow-loading content
            const interval = setInterval(updateHeight, 1000);
            setTimeout(() => clearInterval(interval), 5000); // Run for 5s to catch slow loads
            updateHeight();
          })();
        </script>
      </body>
    </html>
  `;

  const onWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.height && !isNaN(data.height) && data.height > 0) {
        setWebViewHeight(data.height);
      }
    } catch (error) {
      console.log("WebView message error:", error);
    }
  };

  // Reload WebView on content change to ensure rendering
  useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  }, [item?.content]);

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>News not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable
            style={({ pressed }) => [
              styles.headerBtn,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="bookmark-outline" size={22} color="#0F172A" />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.headerBtn,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="share-outline" size={22} color="#0F172A" />
          </Pressable>
        </View>
      </View>

      {/* ScrollView for full content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Thumbnail */}
        <Image
          source={
            item.thumbnail
              ? { uri: item.thumbnail }
              : require("../assets/images/icon.png")
          }
          style={styles.thumbnail}
          resizeMode="cover"
          onError={() => console.log("Image load error")}
        />

        {/* Main content */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{item.title}</Text>

          {/* Author */}
          <View style={styles.metaRow}>
            <View style={styles.authorSection}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={20} color="#64748B" />
              </View>
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>
                  {item.author || "Unknown Author"}
                </Text>
                <Text style={styles.dateText}>
                  {formatDate(item.publishTime)}
                </Text>
              </View>
            </View>
          </View>

          {/* ✅ Auto-height WebView */}
          <WebView
            ref={webViewRef}
            originWhitelist={["*"]}
            source={{ html: htmlContent }}
            style={[styles.webView, { height: webViewHeight || 200 }]} // Fallback height
            scrollEnabled={false}
            onMessage={onWebViewMessage}
            javaScriptEnabled
            domStorageEnabled
            mixedContentMode="always"
            onError={(syntheticEvent) =>
              console.log("WebView error:", syntheticEvent.nativeEvent)
            }
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading content...</Text>
              </View>
            )}
            startInLoadingState
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: "#E2E8F0",
  },
  headerActions: { flexDirection: "row", gap: 8 },
  scrollView: { flex: 1 },
  thumbnail: {
    width,
    height: width * 0.6,
    backgroundColor: "#F1F5F9",
  },
  contentContainer: { padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 32,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  authorSection: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  authorInfo: {},
  authorName: { fontSize: 14, fontWeight: "600", color: "#0F172A" },
  dateText: { fontSize: 12, color: "#94A3B8" },
  webView: {
    backgroundColor: "#FFFFFF", // Match container background
    width: "100%",
  },
  loadingContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#64748B",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: { fontSize: 16, color: "#64748B" },
});

export default NewsDetail;
