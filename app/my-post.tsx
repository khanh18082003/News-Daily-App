import { getMyPostedNews } from "@/services/news.service";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type News = {
  id: number;
  title: string;
  topic: string;
  publishTime: Date | null;
  publisher: {
    id: number;
    fullname: string;
  };
  author: string;
  content: string;
  thumbnail: string;
};

type Meta = {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  hasNext: boolean;
  hasPrev: boolean;
};

function NewsCard({ item, onPress }: { item: News; onPress: () => void }) {
  const formatDate = (dateValue: any) => {
    if (!dateValue) return "N/A";
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    if (isNaN(date.getTime())) return "N/A";
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "").trim();
  };

  const plainContent = stripHtml(item.content || "");

  return (
    <Pressable style={styles.newsCard} onPress={onPress}>
      <Image
        source={
          item.thumbnail
            ? { uri: item.thumbnail }
            : require("../assets/images/icon.png")
        }
        style={styles.newsImage}
        resizeMode="cover"
      />
      <View style={styles.newsBody}>
        <View style={styles.topicBadge}>
          <Text style={styles.topicText}>{item.topic}</Text>
        </View>
        <Text numberOfLines={2} style={styles.newsTitle}>
          {item.title}
        </Text>
        {plainContent && (
          <Text numberOfLines={3} style={styles.newsContent}>
            {plainContent}
          </Text>
        )}
        <View style={styles.metaRow}>
          <View style={styles.authorContainer}>
            <Ionicons name="person-circle-outline" size={16} color="#64748B" />
            <Text numberOfLines={1} style={styles.authorText}>
              {item.author}
            </Text>
          </View>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
            <Text style={styles.dateText}>{formatDate(item.publishTime)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const MyPost = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeq = useRef(0);
  const [newsItems, setNewsItems] = useState<News[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const PAGE_SIZE = 10;

  const buildParams = useCallback(
    (page: number) => {
      const params: any = { page, pageSize: PAGE_SIZE };
      const q = searchQuery.trim();
      if (q && q.length >= 2) params.title = q;
      return params;
    },
    [searchQuery]
  );

  const loadNews = useCallback(
    async (page: number, append = false) => {
      if (page === 1) {
        setLoading(!append);
      }
      if (append) setLoadingMore(true);

      const seq = ++requestSeq.current;
      try {
        const data = await getMyPostedNews(buildParams(page));
        if (seq !== requestSeq.current) return;
        setMeta(data.meta);
        setCurrentPage(page);
        setNewsItems((prev) =>
          append ? [...prev, ...data.items] : data.items
        );
      } catch (e) {
        console.error("Load failed:", e);
      } finally {
        if (seq === requestSeq.current) {
          setLoading(false);
          setLoadingMore(false);
          setRefreshing(false);
        }
      }
    },
    [buildParams]
  );

  useEffect(() => {
    loadNews(1, false);
  }, []);

  useEffect(() => {
    if (debouncedRef.current) clearTimeout(debouncedRef.current);
    debouncedRef.current = setTimeout(() => {
      setCurrentPage(1);
      loadNews(1, false);
    }, 450);
    return () => {
      if (debouncedRef.current) clearTimeout(debouncedRef.current);
    };
  }, [searchQuery, loadNews]);

  const handleLoadMore = async () => {
    if (loadingMore || loading || !meta?.hasNext) return;
    await loadNews(currentPage + 1, true);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNews(1, false);
  };

  const handleOnChangeSearch = (text: string) => {
    setSearchQuery(text);
  };

  const clearSearch = () => {
    if (!searchQuery) return;
    setSearchQuery("");
  };

  const handleViewNewsDetail = (item: News) => {
    router.push({
      pathname: "/news-detail",
      params: { item: JSON.stringify(item) },
    });
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={newsItems}
        keyExtractor={(i) => i.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Pressable onPress={handleGoBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#0F172A" />
              </Pressable>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>My Posts</Text>
                <Text style={styles.headerSubtitle}>
                  {meta?.total || 0} posts
                </Text>
              </View>
            </View>
            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color="#94A3B8" />
                <TextInput
                  placeholder="Search my posts..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={handleOnChangeSearch}
                  style={styles.searchInput}
                  returnKeyType="search"
                />
                {!!searchQuery && (
                  <Pressable onPress={clearSearch} hitSlop={10}>
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </Pressable>
                )}
              </View>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <NewsCard item={item} onPress={() => handleViewNewsDetail(item)} />
        )}
        ListFooterComponent={() => {
          if (loadingMore) {
            return (
              <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color="#2563EB" />
                <Text style={styles.loadingText}>Loading more...</Text>
              </View>
            );
          }

          if (!loading && newsItems.length > 0 && !meta?.hasNext) {
            return (
              <View style={styles.endFooter}>
                <Text style={styles.endText}>No more posts to load</Text>
              </View>
            );
          }

          return null;
        }}
        ListEmptyComponent={() => {
          if (loading) {
            return (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>Loading posts...</Text>
              </View>
            );
          }

          return (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="document-text-outline"
                size={64}
                color="#CBD5E1"
              />
              <Text style={styles.emptyText}>No posts yet</Text>
              <Text style={styles.emptySubtext}>
                Start creating your first post!
              </Text>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

export default MyPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    marginLeft: 8,
    fontSize: 16,
    color: "#111827",
    flex: 1,
  },
  newsCard: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    margin: "auto",
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  newsImage: {
    width: "100%",
    height: 200,
  },
  newsBody: {
    padding: 16,
  },
  topicBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  topicText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4F46E5",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
    lineHeight: 22,
  },
  newsContent: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  authorText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginLeft: 6,
    flex: 1,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    color: "#94A3B8",
    marginLeft: 4,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#64748B",
  },
  endFooter: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  endText: {
    fontSize: 14,
    color: "#94A3B8",
    fontStyle: "italic",
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#64748B",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#94A3B8",
  },
});
