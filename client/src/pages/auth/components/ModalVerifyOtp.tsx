import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import warningLogo from "../../../assets/warning-logo.png";

interface OTPModalProps {
  email: string;
  otp: string;
  onClose: () => void;
  onVerifySuccess: () => void;
  onResend: () => void;
  resetTrigger: number;
}

export default function OTPModal({
  email,
  otp,
  onClose,
  onVerifySuccess,
  onResend,
}: OTPModalProps) {
  const [inputOtp, setInputOtp] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [resetTrigger] = useState(0);

  useEffect(() => {
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
  }, [resetTrigger]);

  const handleChange = (value: string, idx: number) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...inputOtp];
    newOtp[idx] = value;
    setInputOtp(newOtp);
    if (value && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === "Backspace" && !inputOtp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    if (timer <= 0) {
      toast.error("Kode OTP sudah kedaluwarsa");
      return;
    }

    const userOtp = inputOtp.join("");
    const serverOtp = otp ? otp.toString().trim() : "";

    if (!serverOtp) {
      toast.error("OTP tidak tersedia, silakan kirim ulang");
      return;
    }

    if (userOtp === serverOtp) {
      onVerifySuccess();
    } else {
      toast.error("Invalid OTP");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-sm p-8 rounded-4xl shadow-lg text-center">
        <div className="flex justify-center mb-4">
          <img src={warningLogo} alt="warning" className="w-24 h-28" />
        </div>

        <h2 className="text-xl font-bold mb-1">Periksa Email Anda</h2>
        <p className="text-sm text-gray-600 mb-4">
          Kode verifikasi telah dikirim ke
          <br />
          <span className="font-medium">{email}</span>
        </p>

        <div className="flex justify-center gap-2 mb-4">
          {inputOtp.map((val, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              maxLength={1}
              value={val}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="w-12 h-12 border bg-gray-300 font-semibold border-none rounded-lg shadow-md shadow-gray-400 text-center text-lg focus:outline-none focus:bg-gray-400 focus:ring-primary"
            />
          ))}
        </div>

        <div className="text-sm text-gray-500 mb-4">
          Tidak menerima kode verifikasi?{" "}
          <button
            onClick={onResend}
            disabled={timer > 0}
            className={`font-semibold text-primary hover:text-primary-dark hover:underline disabled:opacity-40 cursor-pointer ${
              timer > 0 ? "disabled:cursor-not-allowed" : ""
            }`}
          >
            {timer > 0 ? `kirim ulang (${timer}s)` : "kirim ulang"}
          </button>
        </div>

        <button
          onClick={handleSubmit}
          className="bg-primary hover:bg-primary-hoverer text-white w-full py-2 rounded-lg font-semibold cursor-pointer"
        >
          Verifikasi Email
        </button>

        <button
          onClick={onClose}
          className="text-sm font-semibold text-gray-600 mt-4 hover:underline cursor-pointer"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
