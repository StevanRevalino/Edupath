import { useEffect, useRef, useState } from "react";
import { Mail } from "lucide-react";
import toast from "react-hot-toast";

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
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [resetTrigger, setResetTrigger] = useState(0);

  useEffect(() => {
    setTimer(60);
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
    if (inputOtp.join("") === otp.trim()) {
      onVerifySuccess();
    } else {
      toast.error("Invalid OTP");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-sm p-8 rounded-2xl shadow-lg text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Mail className="text-blue-600 w-6 h-6" />
          </div>
        </div>

        <h2 className="text-xl font-bold mb-1">Check your email</h2>
        <p className="text-sm text-gray-600 mb-4">
          Enter the verification code sent to <br />
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
              className="w-12 h-12 border border-gray-300 rounded-lg text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>

        <div className="text-sm text-gray-500 mb-4">
          Didn’t get a code?{" "}
          <button
            onClick={onResend}
            disabled={timer > 0}
            className={`font-semibold text-blue-600 hover:underline disabled:opacity-40 cursor-pointer ${
              timer > 0 ? "disabled:cursor-not-allowed" : ""
            }`}
          >
            {timer > 0 ? `resend in (${timer}s)` : "resend"}
          </button>
        </div>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded-lg font-semibold cursor-pointer"
        >
          Verify email
        </button>

        <button
          onClick={onClose}
          className="text-sm text-gray-400 mt-4 hover:underline cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
