import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000",
});

export async function requestReport(prompt: string): Promise<string> {
  const { data } = await api.post<{ response: string }>("/api/report", { prompt });
  return data.response;
}
