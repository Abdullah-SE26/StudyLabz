import { create } from "zustand";

const savedUser = localStorage.getItem("user");
const savedToken = localStorage.getItem("authToken");

export const useStore = create((set) => ({
  authToken: savedToken || null,
  user: savedUser ? JSON.parse(savedUser) : null,
  menuOpen: false,
  shouldRefetchDashboard: false,

  // Courses & Exams
  courses: [],                       
  examTypesByCourse: {},              
  setCourses: (courses) => set({ courses }),
  setExamTypesForCourse: (courseId, types) =>
    set((state) => ({
      examTypesByCourse: { ...state.examTypesByCourse, [courseId]: types },
    })),

  toggleMenu: () => set((state) => ({ menuOpen: !state.menuOpen })),

  setAuth: (token, user) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ authToken: token, user });
  },

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    set({ authToken: null, user: null });
  },

  updateUser: (user) => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    const updatedUser = { ...savedUser, ...user };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  setShouldRefetchDashboard: (shouldRefetch) => {
    set({ shouldRefetchDashboard: shouldRefetch });
  },
}));
