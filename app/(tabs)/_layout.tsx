import { useAuth } from "@/hooks/useAuth";
import { getToken } from "@/services/token.storage";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Tabs, useRouter } from "expo-router";
import { Platform, Text, TouchableOpacity, View } from "react-native";

function AddPostTabButton(props: BottomTabBarButtonProps) {
  const router = useRouter();
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[
        props.style,
        { flex: 1, alignItems: "center", justifyContent: "center" },
      ]}
      onPress={() => router.push("/add-post")}
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: [
            { translateY: Platform.select({ ios: -22, android: -26 })! },
          ],
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: "#19A7FE",
            borderColor: "#fff",
            borderWidth: 6,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Ionicons name="add" color="#fff" size={34} />
        </View>
        <Text style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
          Add Post
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#19A7FE",
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: "#19A7FE" },
        headerTitleStyle: { color: "#fff", fontSize: 24, fontWeight: "bold" },
        tabBarStyle: {
          height: 70,
          paddingBottom: Platform.select({ ios: 12, android: 8 }),
        },
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: "News Daily",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
          headerRight: () =>
            !isAuthenticated ? (
              <TouchableOpacity
                onPress={() => router.push("/(auth)/sign-in")}
                hitSlop={10}
                style={{
                  marginRight: 12,
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255,255,255,0.2)",
                }}
                accessibilityRole="button"
                accessibilityLabel="Sign in as reporter"
              >
                <Ionicons name="log-in-outline" size={20} color="#fff" />
              </TouchableOpacity>
            ) : null,
        }}
      />

      {/* Add tab: ẩn hoàn toàn khi isReporter = false */}
      <Tabs.Screen
        name="add"
        options={
          isAuthenticated
            ? {
                title: "Add Post",
                tabBarIcon: () => null,
                tabBarButton: (props) => <AddPostTabButton {...props} />,
              }
            : {
                href: null,
              }
        }
      />

      {/* Settings */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-sharp" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
