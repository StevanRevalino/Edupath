import { CheckCircle } from "lucide-react";
import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { resetPasswordSchema } from "../schema/ResetPasswordSchema";
import { useEffect } from "react";
import toast from "react-hot-toast";

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

  const SERVICE_ID = "service_h6ptjp7";
  const TEMPLATE_ID = "template_2hb217b";
  const PUBLIC_KEY = "OYlVYfIRphM9lXZe7";

  const generateOtp = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const handleVerifyEmail = async () => {
    if (!email) return toast.error("Masukkan email terlebih dahulu");

    const generatedOtp = generateOtp();
    setServerOtp(generatedOtp);

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        { to_email: email, otp: generatedOtp },
        PUBLIC_KEY
      );
      toast.success("OTP berhasil dikirim!");
    } catch (err) {
      console.error("EmailJS error:", err);
      toast.error("Gagal mengirim OTP");
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
      await resetPasswordSchema.validate(
        { email, newPassword, confirmPassword },
        { abortEarly: false }
      );

      // Clear error
      setErrors({});

      // Kirim ke backend
      const res = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            otp: serverOtp,
            newPassword,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) return toast.error(data.message);

      setSuccess(true);
    } catch (err: any) {
      if (err.name === "ValidationError") {
        const newErrors: { [key: string]: string } = {};
        err.inner.forEach((e: any) => {
          newErrors[e.path] = e.message;
        });
        setErrors(newErrors);
      } else {
        console.error(err);
        toast.error("Terjadi kesalahan");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-[600px] shadow-xl relative">
        <h1 className="text-xl font-bold mb-3 text-start">Reset Password</h1>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <label className="text-sm block mb-1 text-left">Email</label>
            <div className="flex gap-2">
              <input
                type="email"
                className="flex-1 px-3 py-2 border rounded-md w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="flex items-center">
                {!isVerified ? (
                  <button
                    onClick={handleVerifyEmail}
                    className="bg-blue-500 text-white px-2 py-2 rounded-md cursor-pointer"
                  >
                    Verifikasi
                  </button>
                ) : (
                  <CheckCircle className="text-green-500" />
                )}
              </div>
            </div>
            {errors.email && (
              <p className="text-sm text-red-500 mt-1 text-left">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm block mb-1 text-left">
              Password Baru
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-md"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            {errors.newPassword && (
              <p className="text-sm text-red-500 mt-1 text-left">
                {errors.newPassword}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="flex items-center">
            <div>
              <label className="font-bold block text-left text-2xl">
                Verifikasi Email
              </label>
              <p className="text-xs text-gray-500 text-left">
                Masukkan kode yang kami kirimkan ke email Anda!
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm block mb-1 text-left">
              Konfirmasi Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-md"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1 text-left">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center gap-4 mb-9">
          <div className="flex gap-1">
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
                className="w-10 h-10 border rounded-md text-center text-lg"
              />
            ))}
          </div>

          <button
            onClick={handleSubmit}
            className={`${
              isFormValid
                ? "bg-black text-white"
                : "bg-gray-300 text-gray-500 cursor-pointer"
            } px-4 py-2 rounded-md font-semibold`}
          >
            Simpan Perubahan
          </button>
        </div>

        {/* Batal */}
        <div className="flex justify-between">
          <button onClick={onClose} className="text-gray-600 text-sm underline cursor-pointer">
            Batal
          </button>
          {/* Success message */}
          {success && (
            <p className="text-green-600 text-sm mb-3">
              Password berhasil direset!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
