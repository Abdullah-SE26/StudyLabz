import { create } from "zustand";

const savedUser = localStorage.getItem("user");
const savedToken = localStorage.getItem("authToken");

export const useStore = create((set) => ({
  authToken: savedToken || null,
  user: savedUser ? JSON.parse(savedUser) : null,

  setAuth: (token, user) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ authToken: token, user });
  },

  clearAuth: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    set({ authToken: null, user: null });
  },
}));
