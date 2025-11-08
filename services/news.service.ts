import { API_BASE_URL_BE, API_BASE_URL_PREDICT } from "./global";
import { getToken } from "./token.storage";

type CreateNewsDto = {
  title: string;
  topic: string;
  author: string;
  content: string;
  thumbnail: string;
  publishTime: Date;
};

type ListNewsQueryDto = {
  page?: number;
  pageSize?: number;
  order?: "ASC" | "DESC";
  publisherId?: number;
  topic?: string;
  title?: string;
};

export const createNews = async (newsData: CreateNewsDto) => {
  try {
    const token = await getToken();

    const response = await fetch(`${API_BASE_URL_BE}/news`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(newsData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);

      throw new Error(`Request failed with status ${response.status}`);
    }

    const json = await response.json();
    console.log("News created:", json);
    return json;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export const getAllTopics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL_BE}/news/topics`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`Request failed with status ${response.status}`);
    }
    const json = await response.json();
    return json;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export const getNewsByTopic = async (query: ListNewsQueryDto) => {
  try {
    const params = new URLSearchParams({
      page: (query.page ?? 1).toString(),
      pageSize: (query.pageSize ?? 10).toString(),
      order: (query.order ?? "DESC") as string,
    });
    if (query.publisherId != null) {
      params.set("publisherId", String(query.publisherId));
    }
    if (query.topic) {
      params.set("topic", query.topic);
    }
    if (query.title) {
      params.set("title", query.title);
    }

    const response = await fetch(
      `${API_BASE_URL_BE}/news/paged?` + params.toString()
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`Request failed with status ${response.status}`);
    }
    const json = await response.json();
    return json;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export const predictTopic = async (title: string, content: string) => {
  try {
    const response = await fetch(`${API_BASE_URL_PREDICT}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`Request failed with status ${response.status}`);
    }
    const json = await response.json();
    console.log("Prediction result:", json);
    return json;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};
