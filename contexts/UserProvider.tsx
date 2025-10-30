import { View, Text } from "react-native";
import React, { useMemo, useState, useEffect } from "react";
import { UserContext } from "./UserContext";
import { clearToken, getToken } from "@/services/token.storage";

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const logout = async () => {
    try {
      await clearToken();
    } catch (err) {
      console.error("Error clearing token during logout:", err);
    } finally {
      setIsAuthenticated(false);
      setLoading(false);
      setError(null);
    }
  };

  const refresh = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      setIsAuthenticated(!!token);
    } catch (err) {
      console.error("Error refreshing token:", err);
      setError("Failed to read token");
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Gọi refresh khi mount
  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, loading, error, refresh, logout }),
    [isAuthenticated, loading, error]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserProvider;
