import { login } from "@/services/auth.service";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { refresh } = useAuth();

  const onSignIn = async () => {
    try {
      const response = await login(email, password);
      console.log("Sign in response:", response);
      await refresh();
      router.replace("/(tabs)");
    } catch (e: any) {
      console.warn(e?.message || "Login failed");
      setError("Email or password is incorrect");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header / Logo */}
        <View style={{ alignItems: "center" }}>
          <Image
            source={require("../../assets/images/news-icon.png")}
            style={{ width: 150, height: 150, resizeMode: "contain" }}
          />
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="email@email.com"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            style={styles.inputUnderline}
            inputMode="email"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <View style={styles.passwordRow}>
            <Text style={styles.label}>Password</Text>
            <Pressable>
              <Text style={styles.forgot}>Forgot password?</Text>
            </Pressable>
          </View>
          <View style={{ position: "relative" }}>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              style={[styles.inputUnderline, { paddingRight: 40 }]}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              style={styles.eyeBtn}
              hitSlop={8}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#6b7280"
              />
            </Pressable>
          </View>
        </View>
        {error ? (
          <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>
        ) : null}
        {/* Sign In Button */}
        <TouchableOpacity style={styles.primaryBtn} onPress={onSignIn}>
          <Text style={styles.primaryBtnText}>Sign In</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerWrap}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or sign in with</Text>
          <View style={styles.divider} />
        </View>

        {/* Social buttons */}
        <View style={styles.socialRow}>
          <SocialIcon name="logo-google" />
          <SocialIcon name="logo-facebook" />
          <SocialIcon name="logo-x" />
          <SocialIcon name="logo-apple" />
        </View>

        {/* Bottom link */}
        <View style={{ alignItems: "center", marginTop: 22 }}>
          <Text style={{ color: "#6b7280" }}>
            Don’t have an account?{" "}
            <Link
              href="/(auth)/sign-up"
              style={{ color: "#19A7FE", fontWeight: "700" }}
            >
              Register
            </Link>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SocialIcon({
  name,
}: {
  name: "logo-google" | "logo-facebook" | "logo-x" | "logo-apple";
}) {
  return (
    <TouchableOpacity style={styles.socialBtn}>
      <Ionicons name={name as any} size={20} color="#111827" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  brandTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#19A7FE",
    marginTop: 6,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    color: "#6b7280",
    marginBottom: 6,
  },
  inputUnderline: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 10,
    fontSize: 16,
  },
  passwordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  forgot: {
    color: "#6b7280",
  },
  eyeBtn: {
    position: "absolute",
    right: 0,
    top: 10,
    height: 24,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtn: {
    height: 48,
    backgroundColor: "#19A7FE",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  dividerWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 22,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    color: "#9ca3af",
    fontSize: 12,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  socialBtn: {
    height: 44,
    width: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
});
