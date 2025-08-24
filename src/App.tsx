import 'react-toastify/dist/ReactToastify.css';
// import { Toast } from "./components/Toast";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Suspense, useEffect, useState } from "react";
import Loading from "./components/Loading";
import Auth from "./pages/Auth";
import Error from "./pages/Error";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import { User } from "./types";
import { ToastContainer } from 'react-toastify';

function AppContent() {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);

  // Cứ mỗi lần đổi route → check lại localStorage
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    console.log("u::", u);
    
    setUser(u);
  }, [location]);

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {!user ? (
          <>
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            {/* <Route path="*" element={<Navigate to="/auth"  />} /> */}
          </>
        ) : (
          <>
            <Route element={<Layout user={user} />}>
              <Route index element={<Dashboard userRole={user.role} />} />
            </Route>
            <Route path="*" element={<Error />} />
          </>
        )}
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
