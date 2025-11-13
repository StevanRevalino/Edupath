import { useState, useEffect } from "react";
import OtpModal from "./components/ModalVerifyOtp";
import DropdownList from "../../components/DropDownList";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { registerSchema, emailSchema } from "../../schema/RegsiterSchema";
import * as yup from "yup";
import { toast } from "react-hot-toast";
import AuthLayout from "./components/AuthLayout";
import AuthInput from "./components/AuthInput";
import AuthEmailInput from "./components/AuthEmailInput";
import AuthPasswordInput from "./components/AuthPasswordInput";
import AuthButton from "./components/AuthButton";

type OptionType = {
  value: string | number;
  label: string;
};

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [timer, setTimer] = useState(30);
  const kelasOptions = [
    { value: "10", label: "Kelas 10" },
    { value: "11", label: "Kelas 11" },
    { value: "12", label: "Kelas 12" },
  ];
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [kelas, setKelas] = useState<OptionType | null>(null);
  const [otpResetTrigger, setOtpResetTrigger] = useState(0);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isFormValid =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    String(kelas?.value).trim() !== "" &&
    email.trim() !== "" &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "" &&
    password === confirmPassword &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    password.length >= 6 &&
    isVerified;

  const handleRegisterSubmit = async () => {
    setErrors({});

    const formData = {
      firstName,
      lastName,
      kelas: kelas?.value ?? "",
      email,
      password,
      confirmPassword,
    };

    try {
      await registerSchema.validate(formData, { abortEarly: false });
    } catch (err: any) {
      if (err.name === "ValidationError") {
        const newErrors: { [key: string]: string } = {};
        const sortedErrors = err.inner.sort((a: any, b: any) => {
          const aIsRequired = a.message.includes("wajib");
          const bIsRequired = b.message.includes("wajib");

          if (aIsRequired && !bIsRequired) return -1;
          if (!aIsRequired && bIsRequired) return 1;
          return 0;
        });

        sortedErrors.forEach((e: yup.ValidationError) => {
          if (e.path && !newErrors[e.path]) {
            newErrors[e.path] = e.message;
          }
        });
        setErrors(newErrors);
        return;
      }
    }

    if (!isVerified) {
      setErrors((prev) => ({
        ...prev,
        email: "Email belum diverifikasi",
      }));
      return;
    }

    try {
      const API_URL =
        (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";
      await axios.post(`${API_URL}/api/auth/register`, {
        firstname: firstName,
        lastname: lastName,
        kelas: Number(kelas?.value),
        email,
        password,
      });

      toast.success("Register berhasil!");
      navigate("/login");
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Terjadi kesalahan server";
      console.error("Error saat register:", errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      // validasi pakai yup
      await emailSchema.validate({ email });

      const API_URL =
        (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

      const response = await axios.post(
        `${API_URL}/api/auth/send-verification-otp`,
        {
          email,
        }
      );
      // Set OTP dari server response
      const serverOtp = response.data.otp;
      setOtp(serverOtp);

      setShowModal(true);
      toast.success("OTP berhasil dikirim ke email!");

      // hapus error jika sukses
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    } catch (err: any) {
      if (err instanceof yup.ValidationError) {
        setErrors((prev) => ({
          ...prev,
          email: err.message,
        }));
      } else if (axios.isAxiosError(err)) {
        const errorMessage =
          err.response?.data?.message || "Gagal mengirim OTP";
        toast.error(errorMessage);
      } else {
        toast.error("Gagal mengirim OTP");
      }
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;

    try {
      const API_URL =
        (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

      const response = await axios.post(
        `${API_URL}/api/auth/send-verification-otp`,
        {
          email,
        }
      );
      const newOtp = response.data.otp;
      setOtp(newOtp);
      setOtpResetTrigger((prev) => prev + 1);

      toast.success("OTP berhasil dikirim ulang!");
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const errorMessage =
          err.response?.data?.message || "Gagal mengirim ulang OTP";
        toast.error(errorMessage);
      } else {
        toast.error("Gagal mengirim ulang OTP");
      }
    }
  };

  useEffect(() => {
    if (!showModal) return;

    setTimer(30);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showModal]);

  useEffect(() => {
    if (timer === 30) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Yuk, jadi anggota EduFamily!"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleRegisterSubmit();
        }
      }}
    >
      {/* First & Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AuthInput
          placeholder="Nama awal"
          value={firstName}
          onChange={(e) => {
            setFirstName(e.target.value);
            if (errors.firstName) {
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.firstName;
                return newErrors;
              });
            }
          }}
          error={errors.firstName}
        />
        <AuthInput
          placeholder="Nama akhir"
          value={lastName}
          onChange={(e) => {
            setLastName(e.target.value);
            if (errors.lastName) {
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.lastName;
                return newErrors;
              });
            }
          }}
          error={errors.lastName}
        />
      </div>

      {/* Kelas */}
      <DropdownList
        options={kelasOptions}
        value={kelas}
        onChange={(option) => {
          setKelas(option);
          if (errors.kelas) {
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.kelas;
              return newErrors;
            });
          }
        }}
        placeholder="Kelas"
        error={errors.kelas}
        className="outline-none"
      />

      {/* Email */}
      <AuthEmailInput
        placeholder="Email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (errors.email) {
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.email;
              return newErrors;
            });
          }
        }}
        error={errors.email}
        isVerified={isVerified}
        onVerify={handleVerifyEmail}
        verifyButtonText="Verifikasi"
      />

      {/* Password */}
      <AuthPasswordInput
        placeholder="Password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (errors.password) {
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.password;
              return newErrors;
            });
          }
        }}
        error={errors.password}
      />

      {/* Konfirmasi Password */}
      <AuthPasswordInput
        placeholder="Konfirmasi Password"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          if (errors.confirmPassword) {
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.confirmPassword;
              return newErrors;
            });
          }
        }}
        error={errors.confirmPassword}
      />

      <div className="flex flex-col gap-3 sm:gap-2 items-center w-full mt-2">
        <p className="text-center text-xs sm:text-sm">
          Sudah punya akun?{" "}
          <a href="/login" className="text-blue-600 underline">
            Log in!
          </a>
        </p>

        <AuthButton
          onClick={handleRegisterSubmit}
          disabled={!isFormValid}
          className={`w-full sm:w-fit py-3 sm:py-4 lg:py-5 px-8 sm:px-12 lg:px-20 text-lg sm:text-xl lg:text-2xl ${
            isFormValid
              ? "bg-primary hover:bg-primary-lighter text-white"
              : "bg-gray-300 text-gray-500"
          }`}
        >
          Daftar akun
        </AuthButton>
      </div>

      {/* Modal OTP */}
      {showModal && (
        <OtpModal
          key={otp}
          email={email}
          otp={otp}
          onClose={() => setShowModal(false)}
          onVerifySuccess={() => {
            setIsVerified(true);
            setShowModal(false);
          }}
          onResend={handleResendOtp}
          resetTrigger={otpResetTrigger}
        />
      )}
    </AuthLayout>
  );
}
