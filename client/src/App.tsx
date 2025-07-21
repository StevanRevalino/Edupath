import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import VerifyOTP from "./pages/VerifyOtp";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ Redirect "/" langsung ke "/register" */}
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
