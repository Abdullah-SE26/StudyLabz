// src/lib/axios.js
import axios from "axios";
import { toast } from "react-hot-toast";
import { useStore } from "../src/store/authStore";

// Create Axios instance
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

// Request interceptor: attach token
instance.interceptors.request.use(
  (config) => {
    const authToken = useStore.getState().authToken;
    if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token expiration
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const response = error.response;

    if (response?.status === 401 && response.data?.code === "TOKEN_EXPIRED") {
      toast.error("Session expired. Please log in again.");
      window.dispatchEvent(new CustomEvent("auth-expired"));
    }

    return Promise.reject(error);
  }
);

export default instance;
