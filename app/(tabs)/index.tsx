import { getAllTopics, getNewsByTopic } from "@/services/news.service";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
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

function SectionHeader({
  title,
  onPressViewAll,
}: {
  title: string;
  onPressViewAll?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable onPress={onPressViewAll} hitSlop={8}>
        <Text style={styles.linkText}>View All</Text>
      </Pressable>
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
  const [newsList, setNewsList] = useState<PaginationNewsResponse | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await getAllTopics();

        setTopics(data);
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    const fetchNews = async () => {
      try {
        const data = await getNewsByTopic({ page: 1, pageSize: 10 });
        console.log("Fetched news:", data);
        setNewsList(data);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchNews();
    fetchTopics();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const fetchNews = async () => {
        try {
          // If a topic is selected, fetch by that topic; otherwise default listing
          const params = selectedTopic
            ? { topic: selectedTopic, page: 1, pageSize: 10 }
            : { page: 1, pageSize: 10 };
          const data = await getNewsByTopic(params);
          console.log("Fetched news on focus:", data);
          if (!mounted) return;
          setNewsList(data);
        } catch (error) {
          console.error("Error fetching news:", error);
        }
      };
      fetchNews();

      return () => {
        mounted = false;
      };
    }, [selectedTopic])
  );

  const handleSelectTopic = async (label: string) => {
    setSelectedTopic((prev) => (prev === label ? null : label));
    const response = await getNewsByTopic({
      topic: label,
      page: 1,
      pageSize: 10,
    });
    console.log("News by topic:", response);
    setNewsList(response);
  };

  const handleViewNewsDetail = (item: News) => {
    // Navigation to detail screen can be implemented here
    console.log("View details for news ID:", item);
    router.push({
      pathname: "/news-detail",
      params: { item: JSON.stringify(item) },
    });
  };

  return (
    <SafeAreaView style={[styles.container]}>
      <FlatList
        data={newsList?.items}
        keyExtractor={(i) => i.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content]}
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
              <SectionHeader title="Popular Topics" onPressViewAll={() => {}} />
              <View style={styles.tagsWrap}>
                {topics.map((t, index) => (
                  <TagChip
                    key={t.key}
                    label={t.label}
                    isSelected={selectedTopic === t.label}
                    onPress={() => handleSelectTopic(t.label)}
                  />
                ))}
              </View>
            </View>

            {/* Latest News Header */}
            <View style={styles.section}>
              <SectionHeader
                title={selectedTopic?.toUpperCase() || "Latest News"}
                onPressViewAll={() => {}}
              />
            </View>
          </>
        }
        renderItem={({ item }) => (
          <NewsCard item={item} onPress={() => handleViewNewsDetail(item)} />
        )}
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
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tagChip: {
    borderWidth: 1,
    borderColor: "#E0E7FF",
    backgroundColor: "#F8FAFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: "#475569",
    fontWeight: "600",
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
});
