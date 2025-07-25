import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserDashboard from "./pages/user/UserDashboard";
import type { JSX } from "react";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const userId = localStorage.getItem("user_id");
  if (!userId) return <Navigate to="/login" />;
  return children;
}

function App() {
  const userId = localStorage.getItem("user_id");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {userId?.startsWith("BK") ? (
                <AdminDashboard />
              ) : (
                <UserDashboard />
              )}
            </ProtectedRoute> 
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
