import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginSchema } from "../../schema/LoginSchema";
import { ValidationError } from "yup";
import ModalResetPassword from "../../components/ModalResetPassword";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-white lg:bg-blue-100">
      {/* Kiri: Logo */}
      <div className="hidden lg:flex w-1/2 items-center justify-center">
        <div className="w-[200px] h-[120px] xl:w-[250px] xl:h-[150px] bg-gray-300 flex items-center justify-center text-lg xl:text-xl font-medium">
          Edupath Logo
        </div>
      </div>

      {/* Kanan: Form Login */}
      <div
        className="w-full lg:w-1/2 bg-white flex flex-col justify-center py-6 sm:py-8 lg:py-10 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-20 2xl:px-40 lg:rounded-tl-[50px] lg:rounded-bl-[50px] min-h-screen lg:min-h-auto"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleLogin();
          }
        }}
      >
        <div className="w-full mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold text-center mb-2">
            Log in
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-2 text-gray-900 text-center">
            Masuk menggunakan akun terdaftar.
          </p>
        </div>

        {/* Form */}
        <div className="w-full flex flex-col gap-4 sm:gap-5 bg-[#f5f5f5] px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10 rounded-2xl sm:rounded-3xl lg:rounded-4xl">
          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-full shadow-lg bg-white focus:outline-none text-base sm:text-lg"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
            />
            {submitted && errors.email && (
              <p className="text-xs text-red-500 mt-1 px-2">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-full shadow-lg bg-white focus:outline-none text-base sm:text-lg"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={28} /> : <Eye size={28} />}
            </button>
            {submitted && errors.password && (
              <p className="text-xs text-red-500 mt-1 px-2">
                {errors.password}
              </p>
            )}
          </div>

          {/* Lupa Password */}
          <div className="flex justify-end">
            <a
              href="#"
              className="text-xs sm:text-sm text-blue-600 underline"
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

          <div className="flex flex-col gap-3 sm:gap-2 items-center w-full mt-2">
            {/* Daftar Link */}
            <p className="text-center text-xs sm:text-sm">
              Tidak punya akun?{" "}
              <a href="/register" className="text-blue-600 underline">
                Daftar!
              </a>
            </p>

            {/* Tombol Masuk */}
            <button
              onClick={handleLogin}
              className={`w-full sm:w-fit py-3 sm:py-4 lg:py-5 px-8 sm:px-12 lg:px-20 font-semibold rounded-full shadow-lg transition-colors cursor-pointer ${
                email && password
                  ? "bg-[#6CCBFF] hover:bg-[#4BB8FF] text-white"
                  : "bg-gray-300 text-gray-500"
              }`}
            >
              <div className="text-lg sm:text-xl lg:text-2xl">Masuk</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
