import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { JSX, Suspense, useEffect, useState } from "react";
import Loading from "./components/Loading";
import Auth from "./pages/Auth";
import Error from "./pages/Error";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import StudentsPage from "./pages/Students";
import TeachersPage from "./pages/Teachers";
import StudentDetailPage from "./pages/StudentDetail";
import TeacherDetailPage from "./pages/TeacherDetail";
import ClassManagement from "./pages/ClassManagement";
import Layout from "./components/Layout";
import { User } from "./types";
import { ToastContainer } from 'react-toastify';

function ProtectedRoute({ user, children }: { user: User | null; children: JSX.Element }) {
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

function AppContent() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    setUser(u);
  }, []);

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route
          path="/auth"
          element={
            user ? <Navigate to="/" replace /> : <Auth setUser={setUser} />
          }
        />
        <Route
          path="/auth/forgot-password"
          element={user ? <Navigate to="/" replace /> : <ForgotPassword />}
        />

        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard userRole={user?.role || ""} />} />
          <Route path="student" element={<StudentsPage userRole={user?.role || ""} />} />
          <Route path="student/:id" element={<StudentDetailPage />} />
          <Route path="teacher" element={<TeachersPage userRole={user?.role || ""} />} />
          <Route path="teacher/:id" element={<TeacherDetailPage />} />
          <Route path="class" element={<ClassManagement userRole={user?.role || ""} />} />
        </Route>

        <Route path="*" element={<Error />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
      <ToastContainer />
    </Router>
  );
}
