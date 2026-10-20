//src/App.jsx

import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import HomeRedirect from "./pages/HomeRedirect";
import LoginPage from "./pages/LoginPage";
import CourseForm from "./pages/teacher/CourseForm";
import TeacherCourseDetail from "./pages/teacher/TeacherCourseDetail";
import TeacherCourses from "./pages/teacher/TeacherCourses";
import MyCourses from "./pages/student/MyCourses";
import StudentCourseDetail from "./pages/student/StudentCourseDetail";
import StudentCourses from "./pages/student/StudentCourses";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<HomeRedirect />} />

            <Route element={<ProtectedRoute role="teacher" />}>
              <Route path="/teacher/courses" element={<TeacherCourses />} />
              <Route path="/teacher/courses/new" element={<CourseForm />} />
              <Route path="/teacher/courses/:id" element={<TeacherCourseDetail />} />
              <Route path="/teacher/courses/:id/edit" element={<CourseForm />} />
            </Route>

            <Route element={<ProtectedRoute role="student" />}>
              <Route path="/courses" element={<StudentCourses />} />
              <Route path="/courses/:id" element={<StudentCourseDetail />} />
              <Route path="/my-courses" element={<MyCourses />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
