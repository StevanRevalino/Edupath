import { CheckCircle } from "lucide-react";
import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import {
  resetPasswordSchema,
  emailSchema,
} from "../schema/ResetPasswordSchema";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { ValidationError } from "yup";
import warningLogo from "../assets/warning-logo.png";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalResetPassword({ isOpen, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [serverOtp, setServerOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const SERVICE_ID = "service_h6ptjp7";
  const TEMPLATE_ID = "template_2hb217b";
  const PUBLIC_KEY = "OYlVYfIRphM9lXZe7";

  const generateOtp = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const startTimer = () => {
    setTimer(30);
    const id = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1 && intervalId) {
          clearInterval(id);
        }
        return prev - 1;
      });
    }, 1000);
    setIntervalId(id);
  };

  const handleVerifyEmail = async () => {
    try {
      await emailSchema.validate({ email }, { abortEarly: false });
      setErrors({}); // reset errors

      const generatedOtp = generateOtp();
      setServerOtp(generatedOtp);

      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        { to_email: email, otp: generatedOtp },
        PUBLIC_KEY
      );

      toast.success("OTP berhasil dikirim!");
      startTimer();
    } catch (err) {
      if (err instanceof ValidationError) {
        const emailErr: { email?: string } = {};
        err.inner.forEach((e) => {
          if (e.path === "email") emailErr.email = e.message;
        });
        setErrors((prev) => ({ ...prev, ...emailErr }));
      }
    }
  };

  const handleChangeOtp = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== "")) {
      const userInputOtp = newOtp.join("");
      if (userInputOtp === serverOtp) {
        setIsVerified(true);
        toast.success("Email berhasil diverifikasi!");
      } else {
        setIsVerified(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && otp[index] === "") {
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  useEffect(() => {
    const isOtpFilled = otp.every((digit) => digit !== "");
    const isFilled =
      email && newPassword && confirmPassword && isOtpFilled && isVerified;

    setIsFormValid(Boolean(isFilled));
  }, [email, otp, newPassword, confirmPassword, isVerified]);

  const handleSubmit = async () => {
    try {
      const schema = resetPasswordSchema(isVerified);
      await schema.validate(
        { email, newPassword, confirmPassword },
        { abortEarly: false }
      );

      setErrors({});

      const API_URL =
        (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: serverOtp,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.message);

      setSuccess(true);
      toast.success("Password berhasil direset!");

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      if (err instanceof ValidationError) {
        const newErrors: { [key: string]: string } = {};
        err.inner.forEach((e) => {
          if (e.path) newErrors[e.path] = e.message;
        });
        setErrors(newErrors);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white p-4 sm:p-6 rounded-4xl w-full max-w-[700px] shadow-xl relative mx-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-12">
            <img src={warningLogo} alt="warning" className="h-28 w-24 " />
            <h1 className="text-4xl sm:text-md font-bold text-start">
              Reset Password
            </h1>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 text-sm underline cursor-pointer"
          >
            <X className="w-6 h-6" strokeWidth={3} />
          </button>
        </div>

        <div className="flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-sm block mb-1 text-left">Email</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  className="flex-1 px-3 py-2 bg-[#F1F1F1] shadow-md rounded-md w-full focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="flex items-center">
                  {!isVerified ? (
                    <button
                      onClick={handleVerifyEmail}
                      className={`${
                        timer > 0
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-[#6CCBFF] hover:bg-[#4BB8FF] text-white"
                      } px-2 py-2 rounded-md cursor-pointer text-sm sm:text-base whitespace-nowrap`}
                      disabled={timer > 0}
                    >
                      {timer > 0 ? `Kirim ulang (${timer}s)` : "Verifikasi"}
                    </button>
                  ) : (
                    <CheckCircle className="text-green-500" />
                  )}
                </div>
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 text-left">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="text-sm block mb-1 text-left">
                Password Baru
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 bg-[#F1F1F1] shadow-md rounded-md focus:outline-none"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {errors.newPassword && (
                <p className="text-sm text-red-500 text-left">
                  {errors.newPassword}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex items-center order-2 lg:order-1 mb-3 lg:mb-0">
              <div>
                <label className="font-bold block text-left text-xl sm:text-2xl">
                  Verifikasi Email
                </label>
                <p className="text-sm text-gray-500 text-left">
                  Masukkan kode yang kami kirimkan ke email Anda!
                </p>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <label className="text-sm block mb-1 text-left">
                Konfirmasi Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 bg-[#F1F1F1] shadow-md rounded-md focus:outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 text-left">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="flex gap-1 sm:gap-2 flex-wrap justify-center sm:justify-start w-full sm:w-auto">
              {otp.map((val, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el!;
                  }}
                  type="text"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleChangeOtp(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className="sm:w-10 sm:h-10 mb-4 sm:mb-10 w-12 h-12 border bg-[#dcdddc] font-semibold border-none rounded-lg shadow-md shadow-[#c3c3c3] text-center text-lg focus:outline-none focus:bg-[#c3c3c3] focus:ring-[#6CCBFF]"
                />
              ))}
            </div>

            <button
              onClick={handleSubmit}
              className={`${
                isFormValid
                  ? "bg-[#6CCBFF] hover:bg-[#4BB8FF] text-white"
                  : "bg-gray-300 text-gray-500 "
              } px-4 py-2 rounded-md font-semibold text-sm sm:text-base w-full sm:w-auto whitespace-nowrap cursor-pointer`}
            >
              Simpan Perubahan
            </button>
          </div>
        </div>

        {/* Batal */}
        <div className="flex justify-between">
          {/* Success message */}
          {success && (
            <p className="text-green-600 text-sm">Password berhasil direset!</p>
          )}
        </div>
      </div>
    </div>
  );
}
