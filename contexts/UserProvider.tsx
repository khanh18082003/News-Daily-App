import { getMyProfile } from "@/services/auth.service";
import { clearToken, getToken } from "@/services/token.storage";
import React, { useEffect, useMemo, useState } from "react";
import { UserContext } from "./UserContext";

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

      // 1) Không có token => continue app (unauth)
      if (!token) {
        setIsAuthenticated(false);
        setError(null);
        return;
      }

      // 2) Có token => kiểm tra profile
      // (Giữ authenticated để continue UI, nhưng sẽ logout nếu 401)
      setIsAuthenticated(true);
      setError(null);

      try {
        const profile = await getMyProfile();
        // Có profile => continue app
        if (!profile) {
          // server trả rỗng: vẫn cho continue nhưng set warning
          setError("Profile is empty");
        }
      } catch (err: any) {
        if (err?.status === 401) {
          // Token không hợp lệ/expired => logout
          await logout();
          return;
        }
        // Lỗi khác (network/500/...) => vẫn continue app theo mô tả
        console.error("Profile check failed (non-401):", err);
        setError("Failed to fetch profile");
      }
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
