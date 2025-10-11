import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import TokenManager from "./utils/tokenManager";
import useAuthMonitor from "./hooks/useAuthMonitor";
import AboutUs from "./pages/user/AboutUs";
import ContactUs from "./pages/user/ContactUs";
import ScrollToTop from "./components/ScrollToTop";
import TutorialTes from "./pages/user/Tutorial Tes";
import PertanyaanTes from "./pages/user/Tes-Pertanyaan";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuthMonitor();

  if (!isAuthenticated()) {
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
