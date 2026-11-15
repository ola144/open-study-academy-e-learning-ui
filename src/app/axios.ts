const baseUrl = import.meta.env.VITE_API_URL;
import axios from "axios";

const axiosConfig = {
  baseURL: `${baseUrl}/api/v1`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  withXSRFToken: true,
};

const api = axios.create(axiosConfig);

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (err) => {
    Promise.reject(err);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      if (
        error.response?.status === 401 ||
        error.response?.data.message === "jwt expired"
      ) {
        sessionStorage.setItem(
          "sessionExpired",
          "Your session has expired. Please login again.",
        );

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export const refreshClient = axios.create(axiosConfig);

export default api;
