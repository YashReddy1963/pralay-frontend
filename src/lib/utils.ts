export const BACKEND_URL = "http://10.216.34.170:8000";  // Network IP for mobile access
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function apiPost(endpoint: string, data: any) {
  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    method: "POST",
    credentials: "include", // only if your backend uses session auth/cookies
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`API error:  ${response.status}`);
  return await response.json();
}