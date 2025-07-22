import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    let valid = true;

    // Reset all
    setEmailError("");
    setPasswordError("");
    setServerError("");

    if (!email.trim()) {
      setEmailError("Email wajib diisi");
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError("Format email tidak valid");
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError("Password wajib diisi");
      valid = false;
    }

    return valid;
  };

  const handleLogin = async () => {
    setSubmitted(true);
    if (!validate()) return;

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || "Email atau password salah");
        return;
      }

      // Simpan token jika perlu
      // localStorage.setItem("token", data.token);

      alert("Berhasil masuk!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Login Error:", err);
      setServerError("Terjadi kesalahan saat login");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Kiri: Logo */}
      <div className="w-1/2 flex items-center justify-center bg-white">
        <div className="w-[250px] h-[150px] bg-gray-300 flex items-center justify-center text-xl font-medium">
          Edupath Logo
        </div>
      </div>

      {/* Kanan: Form Login */}
      <div className="w-1/2 bg-slate-100 flex flex-col justify-center p-10">
        <h1 className="text-2xl font-bold mb-2">Masuk Akun</h1>
        <p className="mb-6 text-sm text-gray-600">
          Masuk menggunakan akun terdaftar.
        </p>

        {/* Email */}
        <div className="mt-2">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-md bg-white text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {submitted && emailError && (
            <p className="text-xs text-red-500 mt-1">{emailError}</p>
          )}
        </div>

        {/* Password */}
        <div className="mt-2">
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-md bg-white text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {submitted && passwordError && (
            <p className="text-xs text-red-500 mt-1">{passwordError}</p>
          )}
        </div>

        {/* Lupa Password */}
        <div className="text-right mt-2">
          <a
            href="/forgot-password"
            className="text-sm text-blue-600 underline"
          >
            Lupa password?
          </a>
        </div>

        {/* Server Error */}
        {serverError && (
          <p className="text-red-500 text-sm mt-2">{serverError}</p>
        )}

        {/* Tombol Masuk */}
        <button
          onClick={handleLogin}
          className={`mt-4 w-full py-2 font-bold rounded-md ${
            email && password
              ? "bg-black text-white"
              : "bg-gray-300 text-gray-500"
          }`}
        >
          <div className="text-lg">Masuk</div>
        </button>

        {/* Daftar Link */}
        <p className="text-sm mt-3">
          Tidak punya akun?{" "}
          <a href="/register" className="text-blue-600 underline">
            Daftar!
          </a>
        </p>
      </div>
    </div>
  );
}
