import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
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
        err.inner.forEach((e: yup.ValidationError) => {
          if (e.path) newErrors[e.path] = e.message;
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
      await axios.post("http://localhost:5000/api/auth/register", {
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
    <div className="flex flex-col md:flex-row h-screen">
      {/* Kiri: Logo */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-blue-100">
        <div className="w-[250px] h-[150px] bg-gray-300 flex items-center justify-center text-xl font-medium">
          Edupath Logo
        </div>
      </div>

      {/* Kanan: Form */}
      <div
        className="w-full md:w-1/2 bg-slate-100 flex flex-col justify-center py-10 px-6 md:px-10 lg:px-20 xl:px-40"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleRegisterSubmit();
          }
        }}
      >
        <div className="w-full">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">
            Create an account
          </h1>
          <p className="text-lg md:text-xl mb-6 text-gray-600 text-center">
            Yuk, jadi anggota EduFamily!
          </p>
        </div>

        {/* Form */}
        <div className="w-full flex flex-col gap-2">
          {/* First & Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                placeholder="Nama awal"
                className="w-full px-4 py-3 rounded-md bg-white text-sm focus:outline-none"
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
                <p className="text-xs text-red-500">{errors.firstName}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                placeholder="Nama akhir"
                className="w-full px-4 py-3 rounded-md bg-white text-sm focus:outline-none"
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
                <p className="text-xs text-red-500">{errors.lastName}</p>
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
            placeholder="Pilih Kelas"
            error={errors.kelas}
            className="outline-none"
          />

          {/* Email */}
          <div className="flex flex-col">
            <div className="flex flex-row gap-3 w-full">
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 rounded-md bg-white text-sm focus:outline-none"
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
                  className="bg-blue-500 text-white px-1 py-2 rounded-md text-md font-semibold cursor-pointer"
                >
                  Verifikasi
                </button>
              ) : (
                <CheckCircle className="text-green-500" />
              )}
            </div>

            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="">
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-md bg-white text-sm focus:outline-none"
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
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Konfirmasi Password */}
          <div className="">
            <input
              type="password"
              placeholder="Konfirmasi Password"
              className="w-full px-4 py-3 rounded-md bg-white text-sm focus:outline-none"
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
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <p className="text-center text-sm mt-10">
          Sudah punya akun?{" "}
          <a href="/login" className="text-blue-600 underline">
            Masuk!
          </a>
        </p>

        <button
          onClick={handleRegisterSubmit}
          className={`mt-4 w-full py-2 font-bold rounded-md ${
            isFormValid
              ? "bg-black text-white"
              : "bg-gray-300 text-gray-500 cursor-pointer"
          }`}
        >
          <div className="text-lg">Daftar akun</div>
        </button>
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
