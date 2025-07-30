import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginSchema } from "../../schema/LoginSchema";
import { ValidationError } from "yup";
import ModalResetPassword from "../../components/ModalResetPassword";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [serverError, setServerError] = useState("");
  const [openModalVerifyOtp, setOpenModalVerifyOtp] = useState(false);
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

      if (!res.ok) {
        const data = await res.json().catch(() => null);

        const errorMessage = data?.message || "Email atau password salah";

        setServerError(errorMessage);
        return;
      }

      const result = await res.json();
      localStorage.setItem("user_id", result.user.user_id);
      localStorage.setItem("token", result.token);
      console.log(result);

      toast.success("Login berhasil!");
      if (result.user.user_id.startsWith("BK")) {
        navigate("/dashboard-admin");
      } else {
        navigate("/home");
      }
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

  useEffect(() => {
    if (serverError) {
      toast.error(serverError);
    }
  }, [serverError]);

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Kiri: Logo (desktop only) */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-red-100">
        <div className="w-[250px] h-[150px] bg-gray-300 flex items-center justify-center text-xl font-medium">
          Edupath Logo
        </div>
      </div>

      {/* Kanan: Form Login */}
      <div className="w-full md:w-1/2 bg-slate-100 flex flex-col justify-center px-6 py-10 md:px-10 lg:px-20 xl:px-40">
        <div className="w-full">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">
            Log in
          </h1>
          <p className="text-lg md:text-xl mb-6 text-gray-600 text-center">
            Masuk menggunakan akun terdaftar.
          </p>
        </div>

        {/* Form */}
        <div
          className="w-full flex flex-col gap-2"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleLogin();
            }
          }}
        >
          {/* Email */}
          <div className="mt-2">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 rounded-md bg-white text-sm focus:outline-none"
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
              className="w-full px-4 py-3 rounded-md bg-white text-sm focus:outline-none"
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
        </div>

        {/* Lupa Password */}
        <div className="text-right mt-2">
          <a
            href="#"
            className="text-sm text-blue-600 underline"
            onClick={(e) => {
              e.preventDefault();
              setOpenModalVerifyOtp(true);
            }}
          >
            Lupa password?
          </a>

          {openModalVerifyOtp && (
            <ModalResetPassword
              isOpen={openModalVerifyOtp}
              onClose={() => setOpenModalVerifyOtp(false)}
            />
          )}
        </div>

        {/* Daftar Link */}
        <p className="text-sm mt-10 text-center">
          Tidak punya akun?{" "}
          <a href="/register" className="text-blue-600 underline">
            Daftar!
          </a>
        </p>

        {/* Tombol Masuk */}
        <button
          onClick={handleLogin}
          className={`mt-4 w-full py-2 font-bold rounded-md cursor-pointer ${
            email && password
              ? "bg-black text-white"
              : "bg-gray-300 text-gray-500"
          }`}
        >
          <div className="text-lg">Masuk</div>
        </button>
      </div>
    </div>
  );
}
