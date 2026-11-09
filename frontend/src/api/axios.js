import axios from 'axios';

let csrfToken = null;
export const setCsrfToken = (token) => {
  csrfToken = token;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // sends the HttpOnly auth cookie
  timeout: 15000,
});

const SAFE = ['get', 'head', 'options'];

api.interceptors.request.use((config) => {
  if (csrfToken && !SAFE.includes((config.method || 'get').toLowerCase())) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.startsWith('/auth/')) {
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.response) return error.response.data?.message || fallback;
  if (error?.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  if (error?.request) return 'Cannot reach the server. Check your connection and make sure the backend is running.';
  return error?.message || fallback;
}

export const unwrap = (promise) => promise.then((res) => res.data.data);

export default api;
