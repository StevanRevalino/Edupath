import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserDashboard from "./pages/user/UserDashboard";
import Tes from "./pages/user/Tes";
import type { JSX } from "react";
import Home from "./pages/user/Home";
import Jurusan from "./pages/user/Jurusan";
import Universitas from "./pages/user/Universitas";
import Konseling from "./pages/user/Konseling";
import Profil from "./pages/user/Profil";
import Beasiswa from "./pages/user/Beasiswa";
import TokenManager from "./utils/tokenManager";
import toast from "react-hot-toast";
import AboutUs from "./pages/user/AboutUs";
import ContactUs from "./pages/user/ContactUs";
import ScrollToTop from "./components/ScrollToTop";
import TutorialTes from "./pages/user/Tutorial Tes";
import PertanyaanTes from "./pages/user/Tes-Pertanyaan";
import HasilTes from "./pages/user/Tes-Hasil";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const navigate = useNavigate();
  const hasShownToast = useRef<{
    unauthorized: boolean;
    expired: boolean;
  }>({
    unauthorized: false,
    expired: false,
  });

  const handleAuthFailure = (authStatus: "expired" | "unauthorized") => {
    TokenManager.logout();

    if (authStatus === "expired" && !hasShownToast.current.expired) {
      hasShownToast.current.expired = true;
      toast.error("Session expired. Silakan login kembali.");
    } else if (
      authStatus === "unauthorized" &&
      !hasShownToast.current.unauthorized
    ) {
      hasShownToast.current.unauthorized = true;
      toast.error("Unauthorized. Silakan login terlebih dahulu.");
    }

    navigate("/login");
  };

  const checkAuth = () => {
    const authStatus = TokenManager.getAuthStatus();
    if (authStatus !== "authenticated") {
      handleAuthFailure(authStatus);
      return false;
    }
    return true;
  };

  // Reset toast flags when component mounts
  useEffect(() => {
    hasShownToast.current = {
      unauthorized: false,
      expired: false,
    };
  }, []);

  // Monitor token expiry every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!checkAuth()) {
        clearInterval(interval);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!checkAuth()) {
    return <Navigate to="/login" />;
  }

  return children;
}

function DefaultRoute() {
  if (!TokenManager.isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  const { role } = TokenManager.getUserData();

  if (role === "ADMIN") {
    return <Navigate to="/dashboard-admin" />;
  } else {
    return <Navigate to="/home" />;
  }
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<DefaultRoute />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard-admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/home" />} />
        </Route>

        {/* User routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
        </Route>
        <Route
          path="/tes"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Tes />} />
          <Route path="tutorial" element={<TutorialTes />} />
          <Route path="pertanyaan" element={<PertanyaanTes />} />
          <Route path="hasil/:assessmentId" element={<HasilTes />} />
        </Route>
        <Route
          path="/tes-hasil"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        >
          <Route index path="hasil/:assessmentId" element={<HasilTes />} />
        </Route>
        <Route
          path="/jurusan"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Jurusan />} />
        </Route>
        <Route
          path="/universitas"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Universitas />} />
        </Route>
        <Route
          path="/konseling"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Konseling />} />
        </Route>
        <Route
          path="/beasiswa"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Beasiswa />} />
        </Route>
        <Route
          path="/profil"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Profil />} />
        </Route>
        <Route
          path="/about-us"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<AboutUs />} />
        </Route>
        <Route
          path="/contact-us"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<ContactUs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
