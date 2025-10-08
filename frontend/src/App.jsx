import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import MagicLinkVerify from "./pages/AuthPages/MagicLinkVerify";
import Login from "./pages/AuthPages/Login";
import VerifyRequest from "./pages/AuthPages/VerifyRequest";
import Home from "./pages/Home";
import PageWrapper from "./components/page-wrapper";
import Contact from "./pages/Contact";
import AboutPage from "./pages/About";
import Courses from "./pages/CoursePages/Courses";
import ExamsDashboard from "./pages/CoursePages/ExamsDashboard";
import ExamQuestions from "./pages/CoursePages/ExamQuestions";
import Dashboard from "./pages/DashboardPages/dashboard";

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Router>
        <PageWrapper>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/magic-verify" element={<MagicLinkVerify />} />
            <Route path="/verify-email" element={<VerifyRequest />} />
            <Route path="/Contact" element={<Contact />} />
            <Route path="/About" element={<AboutPage />} />
            <Route path="/Courses" element={<Courses />} />
            <Route path="/Courses/:courseId/exams" element={<ExamsDashboard />} />
            <Route path="/Courses/:courseId/exams/:examId" element={<ExamQuestions />} />
            <Route path="/Dashboard" element={<Dashboard/>} />
          </Routes>
        </PageWrapper>
      </Router>
    </>
  );
}

export default App;
