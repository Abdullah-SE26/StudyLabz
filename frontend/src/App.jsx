import { jwtDecode } from "jwt-decode";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect, useCallback } from "react";
import { useStore } from "./store/authStore";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/AuthPages/Login";
import MagicLinkVerify from "./pages/AuthPages/MagicLinkVerify";
import VerifyRequest from "./pages/AuthPages/VerifyRequest";
import Contact from "./pages/Contact";
import AboutPage from "./pages/About";
import Courses from "./pages/CoursePages/Courses";
import CourseQuestions from "./pages/CoursePages/CourseQuestions";
import PageWrapper from "./components/PageWrapper";
import QuestionPage from "./pages/QuestionPage";

// Dashboard
import DashboardLayout from "./pages/DashboardPages/DashboardLayout";
import DashboardHome from "./pages/DashboardPages/DashboardHome";
import CreateCoursesPage from "./pages/DashboardPages/CreateCoursesPage";
import ManageUsers from "./pages/DashboardPages/ManageUsers";
import ManageReports from "./pages/DashboardPages/ManageReports";
import CreateQuestionsPage from "./pages/DashboardPages/CreateQuestionsPage";
import ManageQuestions from "./pages/DashboardPages/ManageQuestions";

function App() {
  const isAdminMode = true;
  const navigate = useNavigate();
  const location = useLocation();
  const authToken = useStore((state) => state.authToken);
  const logout = useStore((state) => state.logout);

  const handleAuthExpired = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  // Unified token check + login redirect
  useEffect(() => {
    if (!authToken) return;

    try {
      const decodedToken = jwtDecode(authToken);
      const isExpired = decodedToken.exp * 1000 < Date.now();

      if (isExpired) {
        handleAuthExpired();
      } else if (location.pathname === "/login") {
        // If valid token, redirect from login to dashboard
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Failed to decode token:", error);
      handleAuthExpired();
    }
  }, [authToken, location.pathname, navigate, handleAuthExpired]);

  // Global listener for API-triggered auth expiration
  useEffect(() => {
    const onAuthExpired = () => handleAuthExpired();
    window.addEventListener("auth-expired", onAuthExpired);
    return () => window.removeEventListener("auth-expired", onAuthExpired);
  }, [handleAuthExpired]);

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <PageWrapper>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/magic-verify" element={<MagicLinkVerify />} />
          <Route path="/verify-email" element={<VerifyRequest />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Courses */}
          <Route path="/courses" element={<Courses isAdminMode={isAdminMode} />} />
          <Route path="/courses/:courseId/questions" element={<CourseQuestions />} />
          <Route path="/questions/:questionId" element={<QuestionPage />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="create-course" element={<CreateCoursesPage />} />
            <Route path="questions" element={<CourseQuestions />} />
            <Route path="manage-questions" element={<ManageQuestions />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="reports" element={<ManageReports />} />
            <Route path="create-question" element={<CreateQuestionsPage />} />
          </Route>
        </Routes>
      </PageWrapper>
    </>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
