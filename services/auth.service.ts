import { API_BASE_URL_BE } from "./global";
import { getToken, saveToken } from "./token.storage";

export const register = async (
  fullname: string,
  email: string,
  password: string
) => {
  try {
    const response = await fetch(`${API_BASE_URL_BE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fullName: fullname, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Registration failed");
    }

    const data = await response.json();
    if (data?.access_token) {
      await saveToken(data.access_token);
    }
    return data;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
};

export const login = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL_BE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    const data = await response.json();
    if (data?.access_token) {
      await saveToken(data.access_token);
    }
    return data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};

export const getMyProfile = async () => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL_BE}/auth/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch profile");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};
