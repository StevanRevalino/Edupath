import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginSchema } from "../schema/LoginSchema";
import { ValidationError } from "yup";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setErrors({});
    setSubmitted(true);
    setServerError("");

    try {
      await loginSchema.validate({ email, password }, { abortEarly: false });

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

      alert("Berhasil masuk!");
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof ValidationError) {
        const newErrors: { email?: string; password?: string } = {};
        err.inner.forEach((e) => {
          if (e.path && !newErrors[e.path as keyof typeof newErrors]) {
            newErrors[e.path as "email" | "password"] = e.message;
          }
        });
        setErrors(newErrors);
        return;
      } else {
        console.error("Login Error:", err);
        setServerError("Terjadi kesalahan saat login");
      }
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
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) {
                setErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
          />
          {submitted && errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="mt-2">
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-md bg-white text-sm"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) {
                setErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
          />
          {submitted && errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password}</p>
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
