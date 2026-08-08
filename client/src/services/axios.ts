import axios, { type InternalAxiosRequestConfig } from "axios";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _metadata?: { startTime: number };
}

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
      ? "https://edumind-server.onrender.com/api"
      : "http://localhost:5000/api"),
  withCredentials: true,
});

// Request Interceptor
api.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    config._metadata = { startTime: Date.now() };

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log(
        `%c[API Request] %c${config.method?.toUpperCase()} ${config.url}`,
        "color: #3b82f6; font-weight: bold;",
        "color: #94a3b8;"
      );
    }

    return config;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error("[API Request Error]", error);
    }
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    const config = response.config as CustomAxiosRequestConfig;
    const duration = config._metadata
      ? Date.now() - config._metadata.startTime
      : null;

    if (import.meta.env.DEV) {
      console.log(
        `%c[API Response] %c${response.config.method?.toUpperCase()} ${response.config.url} %c(${response.status}) in ${duration}ms`,
        "color: #22c55e; font-weight: bold;",
        "color: #94a3b8;",
        "color: #eab308;"
      );
    }

    return response;
  },
  (error) => {
    const config = error.config as CustomAxiosRequestConfig | undefined;
    const duration = config?._metadata
      ? Date.now() - config._metadata.startTime
      : null;

    if (import.meta.env.DEV) {
      console.error(
        `%c[API Error] %c${config?.method?.toUpperCase()} ${config?.url} %c(${error.response?.status || "ERR"}) in ${duration}ms:`,
        "color: #ef4444; font-weight: bold;",
        "color: #94a3b8;",
        "color: #f87171;",
        error.response?.data?.message || error.message
      );
    }
    return Promise.reject(error);
  }
);

export default api;