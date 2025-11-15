import { jwtDecode } from "jwt-decode";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect, useCallback, lazy, Suspense } from "react";
import { useStore } from "./store/authStore";
import PageWrapper from "./components/PageWrapper";

// Lazy-loaded Public Pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/AuthPages/Login"));
const MagicLinkVerify = lazy(() => import("./pages/AuthPages/MagicLinkVerify"));
const VerifyRequest = lazy(() => import("./pages/AuthPages/VerifyRequest"));
const Contact = lazy(() => import("./pages/Contact"));
const AboutPage = lazy(() => import("./pages/About"));
const Courses = lazy(() => import("./pages/CoursePages/Courses"));
const CourseQuestions = lazy(() => import("./pages/CoursePages/CourseQuestions"));
const QuestionPage = lazy(() => import("./pages/QuestionPage"));

// Lazy-loaded Dashboard Pages
const DashboardLayout = lazy(() => import("./pages/DashboardPages/DashboardLayout"));
const DashboardHome = lazy(() => import("./pages/DashboardPages/DashboardHome"));
const CreateCoursesPage = lazy(() => import("./pages/DashboardPages/CreateCoursesPage"));
const ManageUsers = lazy(() => import("./pages/DashboardPages/ManageUsers"));
const ManageReports = lazy(() => import("./pages/DashboardPages/ManageReports"));
const CreateQuestionsPage = lazy(() => import("./pages/DashboardPages/CreateQuestionsPage"));
const ManageQuestions = lazy(() => import("./pages/DashboardPages/ManageQuestions"));
const UserBookmarks = lazy(() => import("./pages/DashboardPages/UserBookmarks"));

const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen">
    <span className="loading loading-bars loading-lg bg-sf-green"></span>
  </div>
);

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
        <Suspense fallback={<LoadingFallback />}>
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
              <Route path="user-bookmarks" element={<UserBookmarks />} />
            </Route>
          </Routes>
        </Suspense>
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