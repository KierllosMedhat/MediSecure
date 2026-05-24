/**
 * Axios instance with JWT interceptors.
 * Handles auto-attach of access token and 401 refresh logic.
 *
 * SECURITY: Tokens are stored in-memory (module-scoped variables),
 * NOT in localStorage. On page refresh, tokens are lost and the
 * user must re-authenticate.
 *
 * Owner: Abanob (Auth module)
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/* ---- In-memory token storage ---- */
let accessToken = null;
let refreshToken = null;

/** Get the current access token from memory. */
export function getAccessToken() {
  return accessToken;
}

/** Store both tokens in memory. */
export function setTokens(access, refresh) {
  accessToken = access;
  refreshToken = refresh;
}

/** Clear all tokens from memory. */
export function clearTokens() {
  accessToken = null;
  refreshToken = null;
}

/* ---- Axios instance ---- */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/* ---- Request Interceptor: Attach JWT ---- */
apiClient.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ---- Response Interceptor: Auto-refresh on 401 ---- */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh: refreshToken,
        });

        setTokens(data.access, refreshToken);

        apiClient.defaults.headers.common.Authorization = `Bearer ${data.access}`;
        processQueue(null, data.access);

        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        sessionStorage.removeItem('user');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
