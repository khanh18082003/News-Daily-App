import { Stack } from "expo-router";

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: "modal",
        headerShown: true,
        title: "Add Post",
        headerLargeTitle: false, // optional: prevent large title style
      }}
    />
  );
}
