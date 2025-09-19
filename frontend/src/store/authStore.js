import { create } from "zustand";

// Try to read from localStorage
const savedUser = localStorage.getItem("user");
const initialUser = savedUser ? JSON.parse(savedUser) : null;

export const useStore = create((set) => ({
  // Navbar state
  menuOpen: false,
  toggleMenu: () => set((state) => ({ menuOpen: !state.menuOpen })),

  // Auth state
  authToken: localStorage.getItem("authToken") || null,
  user: initialUser,

  // Set auth token and user info
  setAuth: (token, user) =>
    set(() => {
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));
      return { authToken: token, user };
    }),

  // Clear auth
  clearAuth: () =>
    set(() => {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      return { authToken: null, user: null };
    }),
}));
