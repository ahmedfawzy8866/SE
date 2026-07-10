import { getToken } from "@vercel/connect";

export async function getMyApiToken() {
  try {
    // Retrieve the short-lived token for the connected service
    const token = await getToken("api-key/my-api", { subject: { type: "app" } });
    return token;
  } catch (error) {
    console.error("Error retrieving token from Vercel Connect:", error);
    throw error;
  }
}
