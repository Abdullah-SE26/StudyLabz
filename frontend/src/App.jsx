// App.js
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
import CourseQuestions from "./pages/CoursePages/CourseQuestions";
import PageWrapper from "./components/PageWrapper";

// Dashboard
import DashboardLayout from "./pages/DashboardPages/DashboardLayout";
import DashboardHome from "./pages/DashboardPages/DashboardHome";
import CreateCoursesPage from "./pages/DashboardPages/CreateCoursesPage";
import ManageUsers from "./pages/DashboardPages/ManageUsers";
import ManageReports from "./pages/DashboardPages/ManageReports";
import CreateQuestionsPage from "./pages/DashboardPages/CreateQuestionsPage";

function App() {
  const isAdminMode = true;

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

            {/* Courses */}
            <Route path="/courses" element={<Courses isAdminMode={isAdminMode} />} />
            <Route path="/courses/:courseId/exams" element={<ExamsDashboard />} />
            <Route path="/courses/:courseId/questions" element={<CourseQuestions />} />

            {/* Dashboard */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="create-course" element={<CreateCoursesPage />} />
              <Route path="questions" element={<CourseQuestions />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="reports" element={<ManageReports />} />
              <Route path="create-question" element={<CreateQuestionsPage />} />
            </Route>
          </Routes>
        </PageWrapper>
      </Router>
    </>
  );
}

export default App;
