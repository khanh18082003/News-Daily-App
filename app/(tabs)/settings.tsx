import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  StyleProp,
  TextStyle,
} from "react-native";
import { clearToken } from "../../services/token.storage";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsScreen() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  const items = [
    {
      key: "profile",
      label: "Profile",
      left: <Ionicons name="person-circle-outline" size={22} color="#6b7280" />,
      onPress: () => Alert.alert("Profile", "This feature is coming soon."),
      isAuthenticated,
    },
    {
      key: "mypost",
      label: "My Post",
      left: <Feather name="edit" size={20} color="#6b7280" />,
      onPress: () => {},
      isAuthenticated,
    },
    {
      key: "notifications",
      label: "Notifications",
      left: <Ionicons name="notifications-outline" size={22} color="#6b7280" />,
      onPress: () => {},
    },
    {
      key: "terms",
      label: "Terms and Conditions",
      left: <Ionicons name="document-text-outline" size={22} color="#6b7280" />,
      onPress: () => {},
    },
    {
      key: "about",
      label: "About",
      left: (
        <Ionicons name="information-circle-outline" size={22} color="#6b7280" />
      ),
      onPress: () => {},
    },
  ];

  const onLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(tabs)");
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Optional in-body title; header already shows "Settings" from Tabs */}
      <Text style={styles.title}>Settings</Text>

      <View style={styles.card}>
        {items.map((item, idx) => {
          if (item.isAuthenticated === false) {
            return null;
          }
          return (
            <Row
              key={item.key}
              label={item.label}
              left={item.left}
              onPress={item.onPress}
              showDivider={idx < items.length - 1}
            />
          );
        })}

        {/* Logout Row */}
        {isAuthenticated && (
          <Row
            label="Log Out"
            left={<Ionicons name="log-out-outline" size={22} color="#ef4444" />}
            right={
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            }
            onPress={onLogout}
            labelStyle={{ color: "#ef4444" }}
            showDivider={false}
          />
        )}
      </View>
    </ScrollView>
  );
}

type RowProps = {
  label: string;
  left: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
  showDivider?: boolean;
  labelStyle?: StyleProp<TextStyle>;
};

function Row(props: RowProps) {
  const {
    label,
    left,
    right = <Ionicons name="chevron-forward" size={20} color="#9ca3af" />,
    onPress,
    showDivider = true,
    labelStyle,
  } = props;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.rowLeft}>
        {left}
        <Text style={[styles.rowLabel, labelStyle]}>{label}</Text>
      </View>
      {right}
      {showDivider && <View style={styles.rowDivider} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    borderRadius: 12,
    overflow: "hidden",
    // light shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  row: {
    minHeight: 52,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    // React Native's 'gap' isn't available in older versions; use margin instead.
  },
  rowLabel: {
    fontSize: 15,
    color: "#111827",
    marginLeft: 12,
  },
  rowDivider: {
    position: "absolute",
    bottom: 0,
    left: 16,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#f3f4f6",
  },
});
