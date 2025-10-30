import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "access_token";

export async function saveToken(token: string) {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (e) {
    console.error("Failed to save token:", e);
    throw e;
  }
}

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (e) {
    console.error("Failed to get token:", e);
    return null;
  }
}

export async function clearToken() {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    console.log("Token cleared");
  } catch (e) {
    console.error("Failed to clear token:", e);
  }
}

export { TOKEN_KEY };
