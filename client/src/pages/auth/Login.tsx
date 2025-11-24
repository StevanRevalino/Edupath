import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginSchema } from "../../schema/LoginSchema";
import { ValidationError } from "yup";
import ModalResetPassword from "./components/ModalResetPassword";
import toast from "react-hot-toast";
import TokenManager from "../../utils/tokenManager";
import { authService } from "../../services/authService";
import AuthLayout from "./components/AuthLayout";
import AuthInput from "./components/AuthInput";
import AuthPasswordInput from "./components/AuthPasswordInput";
import AuthButton from "./components/AuthButton";

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

      const res = await authService.login(email, password);
      console.log("Login Response:", res);
      const result = res.data;

      // Clear data auth lama terlebih dahulu untuk menghindari konflik
      TokenManager.clearAllAuthData();

      // Gunakan TokenManager untuk menyimpan token dengan validasi expiry
      TokenManager.setToken(result.token, 1); // Token berlaku 1 hari
      TokenManager.setUserData(result.user.user_id, result.user.role);

      toast.success("Login berhasil!");
      if (result.user.role === "ADMIN") {
        navigate("/dashboard-admin");
      } else {
        navigate("/home");
      }
    } catch (err: any) {
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
        const errorMessage =
          err.response?.data?.message || "Email atau password salah";
        setServerError(errorMessage);
      }
    }
  };

  useEffect(() => {
    if (serverError) {
      toast.error(serverError);
    }
  }, [serverError]);

  return (
    <AuthLayout
      title="Log in"
      subtitle="Masuk menggunakan akun terdaftar."
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleLogin();
        }
      }}
    >
      {/* Email */}
      <AuthInput
        type="email"
        label=""
        placeholder="Email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (errors.email) {
            setErrors((prev) => ({ ...prev, email: undefined }));
          }
        }}
        error={submitted && errors.email ? errors.email : undefined}
      />

      {/* Password */}
      <AuthPasswordInput
        placeholder="Password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (errors.password) {
            setErrors((prev) => ({ ...prev, password: undefined }));
          }
        }}
        error={submitted && errors.password ? errors.password : undefined}
      />

      {/* Lupa Password */}
      <div className="flex justify-end">
        <a
          href="#"
          className="text-xs sm:text-sm text-primary hover:text-primary-dark underline"
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
          <a
            href="/register"
            className="text-primary hover:text-primary-dark underline"
          >
            Daftar!
          </a>
        </p>

        {/* Tombol Masuk */}
        <AuthButton
          onClick={handleLogin}
          disabled={!email || !password}
          className={`w-full sm:w-fit py-3 sm:py-4 lg:py-5 px-8 sm:px-12 lg:px-20 text-lg sm:text-xl lg:text-2xl ${
            email && password
              ? "bg-primary hover:bg-primary-lighter text-white"
              : "bg-gray-300 text-gray-500"
          }`}
        >
          Masuk
        </AuthButton>
      </div>
    </AuthLayout>
  );
}
