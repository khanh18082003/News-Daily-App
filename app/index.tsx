import { Redirect } from "expo-router";
import React from "react";

// TODO: thay bằng kiểm tra token/user thật (SecureStore, context, v.v.)

export default function Index() {
  return <Redirect href="/(tabs)" />;
}
