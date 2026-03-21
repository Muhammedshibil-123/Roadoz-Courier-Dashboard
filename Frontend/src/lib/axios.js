import axios from "axios";
import { store } from "../redux/store";
import { startFetching, stopFetching } from "../redux/authSlice";

// Access token lives in memory only — never localStorage
let access_token_in_memory = null;

const api = axios.create({
  // IMPORTANT: Must use "localhost" (not "127.0.0.1") so the browser treats
  // this as same-site as the cookie that was set by localhost:8000.
  // With SameSite=Lax, cookies set on 127.0.0.1 are NOT sent to localhost
  // and vice-versa, causing the refresh token cookie to silently disappear.
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  withCredentials: true, // sends the HttpOnly refresh cookie automatically
});

export const setAccessToken = (token) => {
  access_token_in_memory = token;
};

// ── REQUEST interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  if (!config.skipLoading) {
    store.dispatch(startFetching());
  }
  if (access_token_in_memory) {
    config.headers.Authorization = `Bearer ${access_token_in_memory}`;
  }
  return config;
});

// ── RESPONSE interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    if (!response.config.skipLoading) {
      store.dispatch(stopFetching());
    }
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    // Don't retry on login / refresh / already-retried requests
    if (
      originalRequest.url?.includes("/api/auth/login/") ||
      originalRequest.url?.includes("/api/auth/token/refresh/") ||
      originalRequest._retry
    ) {
      if (!originalRequest.skipLoading) store.dispatch(stopFetching());
      return Promise.reject(error);
    }

    // Try silent token refresh on 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const rs = await api.post(
          "/api/auth/token/refresh/",
          {},
          { skipLoading: true }
        );
        const newAccess = rs.data.access;
        setAccessToken(newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        if (!originalRequest.skipLoading) store.dispatch(stopFetching());
        return api(originalRequest);
      } catch (refreshError) {
        if (!originalRequest.skipLoading) store.dispatch(stopFetching());
        return Promise.reject(refreshError);
      }
    }

    if (!originalRequest.skipLoading) store.dispatch(stopFetching());
    return Promise.reject(error);
  }
);

export default api;