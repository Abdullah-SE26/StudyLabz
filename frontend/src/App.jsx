import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/AuthPages/Login";
import MagicLinkVerify from "./pages/AuthPages/MagicLinkVerify";
import VerifyRequest from "./pages/AuthPages/VerifyRequest";
import Contact from "./pages/Contact";
import AboutPage from "./pages/About";
import Courses from "./pages/CoursePages/Courses";
import ExamsDashboard from "./pages/CoursePages/ExamsDashboard";
import ExamQuestions from "./pages/CoursePages/ExamQuestions";
import PageWrapper from "./components/page-wrapper";

// Dashboard
import DashboardLayout from "./pages/DashboardPages/DashboardLayout";
import DashboardHome from "./pages/DashboardPages/DashboardHome";
import CreateCoursesPage from "./pages/DashboardPages/CreateCoursesPage";
import ManageUsers from "./pages/DashboardPages/ManageUsers";
import ManageReports from "./pages/DashboardPages/ManageReports";

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Router>
        <PageWrapper>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/magic-verify" element={<MagicLinkVerify />} />
            <Route path="/verify-email" element={<VerifyRequest />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/courses" element={<Courses />} />
            <Route
              path="/courses/:courseId/exams"
              element={<ExamsDashboard />}
            />
            <Route
              path="/courses/:courseId/exams/:examId"
              element={<ExamQuestions />}
            />

            {/* Dashboard */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="create-course" element={<CreateCoursesPage />} />
              <Route path="questions" element={<ExamQuestions />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="reports" element={<ManageReports />} />
            </Route>
          </Routes>
        </PageWrapper>
      </Router>
    </>
  );
}

export default App;
