import { useState, useEffect } from "react";
import { CheckCircle, Eye, EyeOff } from "lucide-react";
import OtpModal from "../../components/ModalVerifyOtp";
import emailjs from "@emailjs/browser";
import DropdownList from "../../components/DropDownList";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { registerSchema, emailSchema } from "../../schema/RegsiterSchema";
import * as yup from "yup";
import { toast } from "react-hot-toast";

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
  const [timer, setTimer] = useState(60);
  const [submitted, setSubmitted] = useState(false);
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const SERVICE_ID = "service_h6ptjp7";
  const TEMPLATE_ID = "template_2hb217b";
  const PUBLIC_KEY = "OYlVYfIRphM9lXZe7";

  const generateOtp = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

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
    setSubmitted(true);
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

      const generatedOtp = generateOtp();
      setOtp(generatedOtp);

      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        { to_email: email, otp: generatedOtp },
        PUBLIC_KEY
      );
      setShowModal(true);

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
      } else {
        toast.error("Gagal mengirim OTP");
      }
    }
  };

  const handleResendOtp = () => {
    if (timer > 0) return;

    const newOtp = generateOtp();
    setOtp(newOtp);
    setOtpResetTrigger((prev) => prev + 1);

    emailjs
      .send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          to_email: email,
          otp: newOtp,
        },
        PUBLIC_KEY
      )
      .then(() => {
        toast.success("OTP berhasil dikirim ulang!");
      })
      .catch(() => {
        toast.error("Gagal mengirim ulang OTP");
      });
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
    if (timer === 60) {
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-white lg:bg-blue-100">
      {/* Kiri: Logo */}
      <div className="hidden lg:flex w-1/2 items-center justify-center">
        <div className="w-[200px] h-[120px] xl:w-[250px] xl:h-[150px] bg-gray-300 flex items-center justify-center text-lg xl:text-xl font-medium">
          Edupath Logo
        </div>
      </div>

      {/* Kanan: Form */}
      <div
        className="w-full lg:w-1/2 bg-white flex flex-col justify-center py-6 sm:py-8 lg:py-10 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-20 2xl:px-30 lg:rounded-tl-[50px] lg:rounded-bl-[50px] min-h-screen lg:min-h-auto"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleRegisterSubmit();
          }
        }}
      >
        <div className="w-full mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold text-center mb-2">
            Create an account
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-2 text-gray-900 text-center">
            Yuk, jadi anggota EduFamily!
          </p>
        </div>

        {/* Form */}
        <div className="w-full flex flex-col gap-4 sm:gap-5 bg-[#f5f5f5] px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10 rounded-2xl sm:rounded-3xl lg:rounded-4xl">
          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                placeholder="Nama awal"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-full shadow-lg bg-white focus:outline-none text-base sm:text-lg"
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
              />
              {errors.firstName && (
                <p className="text-xs text-red-500 mt-1 px-2">
                  {errors.firstName}
                </p>
              )}
            </div>
            <div>
              <input
                type="text"
                placeholder="Nama akhir"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-full shadow-lg bg-white focus:outline-none text-base sm:text-lg"
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
              />
              {errors.lastName && (
                <p className="text-xs text-red-500 mt-1 px-2">
                  {errors.lastName}
                </p>
              )}
            </div>
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
          <div className="flex flex-col">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
              <input
                type="email"
                placeholder="Email"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-full shadow-lg bg-white focus:outline-none text-base sm:text-lg"
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
              />

              {!isVerified ? (
                <button
                  onClick={handleVerifyEmail}
                  className="bg-[#6CCBFF] hover:bg-[#4BB8FF] text-white px-4 sm:px-3 py-2.5 sm:py-2 rounded-full text-md sm:text-lg font-semibold cursor-pointer whitespace-nowrap flex-shrink-0"
                >
                  Verifikasi
                </button>
              ) : (
                <div className="flex items-center justify-center sm:justify-start w-fit h-fit">
                  <CheckCircle className="text-green-500 w-8 h-8" />
                </div>
              )}
            </div>

            {errors.email && (
              <p className="text-xs text-red-500 mt-1 px-2">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-12 sm:pr-14 rounded-full shadow-lg bg-white focus:outline-none text-base sm:text-lg"
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
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 flex-shrink-0"
              >
                {showPassword ? (
                  <EyeOff size={20} className="sm:w-6 sm:h-6" />
                ) : (
                  <Eye size={20} className="sm:w-6 sm:h-6" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1 px-2">
                {errors.password}
              </p>
            )}
          </div>

          {/* Konfirmasi Password */}
          <div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Konfirmasi Password"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-12 sm:pr-14 rounded-full shadow-lg bg-white focus:outline-none text-base sm:text-lg"
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
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 flex-shrink-0"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} className="sm:w-6 sm:h-6" />
                ) : (
                  <Eye size={20} className="sm:w-6 sm:h-6" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1 px-2">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:gap-2 items-center w-full mt-2">
            <p className="text-center text-xs sm:text-sm">
              Sudah punya akun?{" "}
              <a href="/login" className="text-blue-600 underline">
                Log in!
              </a>
            </p>

            <button
              onClick={handleRegisterSubmit}
              className={`w-full sm:w-fit py-3 sm:py-4 lg:py-5 px-8 sm:px-12 lg:px-20 font-semibold rounded-full shadow-lg transition-colors cursor-pointer ${
                isFormValid
                  ? "bg-[#6CCBFF] hover:bg-[#4BB8FF] text-white"
                  : "bg-gray-300 text-gray-500"
              }`}
            >
              <div className="text-lg sm:text-xl lg:text-2xl">Daftar akun</div>
            </button>
          </div>
        </div>
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
    </div>
  );
}
