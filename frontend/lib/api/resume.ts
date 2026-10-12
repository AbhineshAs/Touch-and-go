import { BACKEND_URL, getStoredToken, getStoredUser } from "./auth";
import { UploadedResume } from "@/lib/candidate/types";

export async function fetchResumeFromBackend(
  email?: string,
  token?: string
): Promise<UploadedResume | null> {
  const authToken = token || getStoredToken();
  const user = getStoredUser();
  const userEmail = email || user?.email;

  const headers: Record<string, string> = {};
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  if (userEmail) {
    headers["X-User-Email"] = userEmail;
  }

  const queryParams = userEmail ? `?email=${encodeURIComponent(userEmail)}` : "";

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/candidate/resume/${queryParams}`, {
      method: "GET",
      headers,
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return data.resume || null;
  } catch (err) {
    console.warn("Could not fetch resume from Django backend:", err);
    return null;
  }
}

export async function uploadResumeToBackend(
  resume: Omit<UploadedResume, "id" | "uploadedAt">,
  email?: string,
  token?: string
): Promise<UploadedResume | null> {
  const authToken = token || getStoredToken();
  const user = getStoredUser();
  const userEmail = email || user?.email;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  if (userEmail) {
    headers["X-User-Email"] = userEmail;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/candidate/resume/`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...resume,
        email: userEmail,
      }),
    });
    if (!res.ok) {
      console.warn("Django backend rejected resume upload:", await res.text());
      return null;
    }
    const data = await res.json();
    return data.resume || null;
  } catch (err) {
    console.warn("Failed to post resume to Django backend:", err);
    return null;
  }
}

export async function replaceResumeInBackend(
  resume: Omit<UploadedResume, "id" | "uploadedAt">,
  email?: string,
  token?: string
): Promise<UploadedResume | null> {
  const authToken = token || getStoredToken();
  const user = getStoredUser();
  const userEmail = email || user?.email;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  if (userEmail) {
    headers["X-User-Email"] = userEmail;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/candidate/resume/`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        ...resume,
        email: userEmail,
      }),
    });
    if (!res.ok) {
      console.warn("Django backend rejected resume replace:", await res.text());
      return null;
    }
    const data = await res.json();
    return data.resume || null;
  } catch (err) {
    console.warn("Failed to replace resume in Django backend:", err);
    return null;
  }
}

export async function deleteResumeFromBackend(
  email?: string,
  token?: string
): Promise<boolean> {
  const authToken = token || getStoredToken();
  const user = getStoredUser();
  const userEmail = email || user?.email;

  const headers: Record<string, string> = {};
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  if (userEmail) {
    headers["X-User-Email"] = userEmail;
  }

  const queryParams = userEmail ? `?email=${encodeURIComponent(userEmail)}` : "";

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/candidate/resume/${queryParams}`, {
      method: "DELETE",
      headers,
    });
    return res.ok;
  } catch (err) {
    console.warn("Failed to delete resume from Django backend:", err);
    return false;
  }
}
