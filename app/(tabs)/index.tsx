import { getAllTopics, getNewsByTopic } from "@/services/news.service";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Topic = {
  key: string;
  label: string;
};

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

type PaginationNewsResponse = {
  items: News[];
  meta: Meta;
};

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function TagChip({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.tagChip, isSelected && { backgroundColor: "#bac7f3ff" }]}
      onPress={onPress}
    >
      <Text style={styles.tagText}>{label.toUpperCase()}</Text>
    </Pressable>
  );
}

function NewsCard({ item, onPress }: { item: News; onPress: () => void }) {
  // Format date safely
  const formatDate = (dateValue: any) => {
    if (!dateValue) return "N/A";

    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);

    // Check if date is valid
    if (isNaN(date.getTime())) return "N/A";

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  // Strip HTML tags from content
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "").trim();
  };

  const plainContent = stripHtml(item.content || "");

  return (
    <Pressable style={styles.newsCard} onPress={onPress}>
      {/* Thumbnail Image */}
      <Image
        source={
          item.thumbnail
            ? { uri: item.thumbnail }
            : require("../../assets/images/news-icon.png")
        }
        style={styles.newsImage}
        resizeMode="cover"
      />

      {/* Content Container */}
      <View style={styles.newsBody}>
        {/* Title */}
        <Text numberOfLines={2} style={styles.newsTitle}>
          {item.title}
        </Text>

        {/* Content Preview */}
        {plainContent && (
          <Text numberOfLines={3} style={styles.newsContent}>
            {plainContent}
          </Text>
        )}

        {/* Author & Date Row */}
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

export default function HomeScreen() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [newsItems, setNewsItems] = useState<News[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const router = useRouter();

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const PAGE_SIZE = 2;

  // Fetch topics on mount
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await getAllTopics();
        setTopics(data);
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };
    fetchTopics();
  }, []);

  // Fetch initial news
  const fetchInitialNews = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setCurrentPage(1);

    try {
      const params = selectedTopic
        ? { topic: selectedTopic, page: 1, pageSize: PAGE_SIZE }
        : { page: 1, pageSize: PAGE_SIZE };

      const data = await getNewsByTopic(params);

      setNewsItems(data.items);
      setMeta(data.meta);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedTopic]);

  // Fetch news when screen is focused or topic changes
  useFocusEffect(
    useCallback(() => {
      fetchInitialNews();
    }, [fetchInitialNews])
  );

  // Handle topic selection
  const handleSelectTopic = async (label: string) => {
    const newTopic = selectedTopic === label ? null : label;
    setSelectedTopic(newTopic);
    // fetchInitialNews will be triggered by useFocusEffect dependency
  };

  // Handle load more
  const handleLoadMore = async () => {
    // Prevent multiple simultaneous requests
    if (loadingMore || loading || !meta?.hasNext) {
      return;
    }

    setLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const params = selectedTopic
        ? { topic: selectedTopic, page: nextPage, pageSize: PAGE_SIZE }
        : { page: nextPage, pageSize: PAGE_SIZE };

      const data = await getNewsByTopic(params);

      // Append new items to existing list
      setNewsItems((prev) => [...prev, ...data.items]);
      setMeta(data.meta);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error("Error loading more news:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Handle pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);

    try {
      const params = selectedTopic
        ? { topic: selectedTopic, page: 1, pageSize: PAGE_SIZE }
        : { page: 1, pageSize: PAGE_SIZE };

      const data = await getNewsByTopic(params);

      setNewsItems(data.items);
      setMeta(data.meta);
    } catch (error) {
      console.error("Error refreshing news:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewNewsDetail = (item: News) => {
    router.push({
      pathname: "/news-detail",
      params: { item: JSON.stringify(item) },
    });
  };

  return (
    <SafeAreaView style={[styles.container]}>
      <FlatList
        data={newsItems}
        keyExtractor={(i) => i.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content]}
        // Pull to refresh
        refreshing={refreshing}
        onRefresh={handleRefresh}
        // Load more pagination
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <>
            {/* Search */}
            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color="#94A3B8" />
                <TextInput
                  placeholder="Search"
                  placeholderTextColor="#9CA3AF"
                  style={styles.searchInput}
                />
              </View>
              <Pressable style={styles.iconBtn}>
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color="#334155"
                />
              </Pressable>
            </View>

            {/* Popular Topics */}
            <View style={styles.section}>
              <SectionHeader title="Popular Topics" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.topicsScrollContent}
              >
                {topics.map((t, index) => (
                  <TagChip
                    key={t.key}
                    label={t.label}
                    isSelected={selectedTopic === t.label}
                    onPress={() => handleSelectTopic(t.label)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Latest News Header */}
            <View style={styles.section}>
              <SectionHeader
                title={selectedTopic?.toUpperCase() || "Latest News"}
              />
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
                <Text style={styles.endText}>No more news to load</Text>
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
                <Text style={styles.loadingText}>Loading news...</Text>
              </View>
            );
          }

          return (
            <View style={styles.emptyContainer}>
              <Ionicons name="newspaper-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyText}>No news available</Text>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingBottom: 24,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
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
  iconBtn: {
    marginLeft: 10,
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
  },
  section: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  linkText: {
    color: "#2563EB",
    fontWeight: "600",
  },
  topicsScrollContent: {
    paddingRight: 16,
  },
  tagChip: {
    borderWidth: 1,
    borderColor: "#E0E7FF",
    backgroundColor: "#F8FAFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tagText: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 13,
  },
  newsCard: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    margin: "auto",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E2E8F0",
  },
  newsImage: {
    width: "100%",
    height: 200,
  },
  newsBody: {
    padding: 16,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  channelText: {
    color: "#2563EB",
    fontWeight: "600",
  },
  mutedText: {
    color: "#94A3B8",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 6,
  },
  recItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  recThumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 12,
  },
  recInfo: {
    flex: 1,
  },
  recTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  newsContent: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
    marginBottom: 12,
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
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#94A3B8",
  },
});
