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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
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
          path="/"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        >
          <Route index path="home" element={<Home />} />
          <Route path="tes" element={<Tes />} />
          <Route path="jurusan" element={<Jurusan />} />
          <Route path="universitas" element={<Universitas />} />
          <Route path="konseling" element={<Konseling />} />
          <Route path="profil" element={<Profil />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
