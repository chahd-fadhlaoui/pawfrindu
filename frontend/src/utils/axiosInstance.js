import axios from 'axios';
import { BASE_URL } from './constants';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Token applied to request:", token.substring(0, 10) + "...");
    } else {
      console.log("No token found for request");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      console.log("401 detected, clearing token and redirecting...");
      localStorage.removeItem("token");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

axiosInstance.setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

const token = localStorage.getItem('token');
if (token) axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

export default axiosInstance;