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

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const userId = localStorage.getItem("user_id");
  if (!userId) return <Navigate to="/login" />;
  return children;
}

function DefaultRoute() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (role === "ADMIN") {
    return <Navigate to="/dashboard-admin" />;
  } else {
    return <Navigate to="/home" />;
  }
}

function App() {
  return (
    <BrowserRouter>
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

        {/* Dashboard User dengan header tetap */}
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
