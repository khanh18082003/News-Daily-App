import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: "News Daily",
        headerStyle: { backgroundColor: "#19A7FE" },
        headerTitleStyle: { color: "#fff", fontSize: 24, fontWeight: "bold" },
        headerTitleAlign: "center",
      }}
    />
  );
}
