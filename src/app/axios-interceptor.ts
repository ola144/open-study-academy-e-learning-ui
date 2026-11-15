import axios, { type InternalAxiosRequestConfig } from "axios";

import api, { refreshClient } from "./axios";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<void> | null = null;
let isRedirecting = false;

const refreshAccessToken = async (): Promise<void> => {
  await refreshClient.post("/auth/refresh");
};

const redirectToLogin = () => {
  if (isRedirecting) return;

  isRedirecting = true;

  // This is only a notification, not token storage.
  sessionStorage.setItem(
    "sessionExpired",
    "Your session has expired. Please login again.",
  );

  window.location.assign("/login");
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as
      | CustomAxiosRequestConfig
      | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url ?? "";

    const isAuthEndpoint =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/auth/logout");

    // Only attempt refresh for an expired/invalid
    // authentication response.
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Reuse an existing refresh request if one is running.
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      await refreshPromise;

      // The backend has set the new access cookie.
      // Retry the original request.
      return api(originalRequest);
    } catch (refreshError) {
      if (axios.isAxiosError(refreshError)) {
        const refreshStatus = refreshError.response?.status;

        // The refresh session is invalid, expired,
        // revoked, or otherwise rejected.
        if (refreshStatus === 401 || refreshStatus === 403) {
          redirectToLogin();
        }
      }

      // Do not log out the user for network errors or 5xx.
      return Promise.reject(refreshError);
    }
  },
);
