import { API_BASE_URL_BE } from "./global";
import { getToken } from "./token.storage";

export const uploadFileToS3 = async (formData: FormData) => {
  const response = await fetch(`${API_BASE_URL_BE}/s3/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || "Failed to upload file to S3");
  }

  return response.json();
};
