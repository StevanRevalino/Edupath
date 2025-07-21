import { useState } from "react";
import { CheckCircle } from "lucide-react";
import OtpModal from "../components/ModalVerifyOtp";
import emailjs from "@emailjs/browser";
import { useEffect, } from "react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [timer, setTimer] = useState(60);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [kelas, setKelas] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Ganti dengan ID kamu
  const SERVICE_ID = "service_h6ptjp7";
  const TEMPLATE_ID = "template_2hb217b";
  const PUBLIC_KEY = "OYlVYfIRphM9lXZe7";

  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const isFormValid =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    kelas.trim() !== "" &&
    email.trim() !== "" &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "" &&
    password === confirmPassword &&
    isVerified;

  const handleSubmit = () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !kelas.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      alert("Semua field wajib diisi");
      return;
    }

    if (!isVerified) {
      alert("Harap verifikasi email terlebih dahulu");
      return;
    }

    if (password !== confirmPassword) {
      alert("Password dan konfirmasi tidak cocok");
      return;
    }

    // Validasi tambahan (opsional)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Format email tidak valid");
      return;
    }

    if (password.length < 6) {
      alert("Password minimal 6 karakter");
      return;
    }

    // Jika semua valid, submit data
    const payload = {
      firstName,
      lastName,
      kelas,
      email,
      password, // Sebaiknya di-hash di backend
    };

    console.log("Form valid, data siap dikirim ke backend:", payload);

    // Misal nanti pakai fetch atau axios:
    // await axios.post("/api/register", payload)

    alert("Pendaftaran berhasil!");
  };

  const handleVerifyEmail = async () => {
    if (!email) return alert("Masukkan email terlebih dahulu");

    const generatedOtp = generateOtp();
    setOtp(generatedOtp);

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        { to_email: email, otp: generatedOtp },
        PUBLIC_KEY
      );
      console.log("OTP sent:", generatedOtp);
      setShowModal(true);
    } catch (err) {
      console.error("EmailJS error:", err);
      alert("Gagal mengirim OTP");
    }
  };

  useEffect(() => {
    if (!showModal) return;

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
  }, [showModal]);

  return (
    <div className="flex h-screen">
      {/* Kiri: Logo */}
      <div className="w-1/2 flex items-center justify-center bg-blue-500">
        <div className="w-[250px] h-[150px] bg-gray-300 flex items-center justify-center text-xl font-medium">
          Edupath Logo
        </div>
      </div>

      {/* Kanan: Form */}
      <div className="w-1/2 bg-slate-100 flex flex-col justify-center p-10">
        <h1 className="text-2xl font-bold mb-2">Create an account</h1>
        <p className="mb-6 text-sm text-gray-600">
          Yuk, jadi anggota EduFamily!
        </p>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Nama awal"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-white text-sm"
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Nama akhir"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-white text-sm"
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <select
          className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-white text-sm mt-2"
          value={kelas}
          onChange={(e) => setKelas(e.target.value)}
        >
          <option value="" disabled selected>
            Kelas
          </option>
          <option value="10">Kelas 10</option>
          <option value="11">Kelas 11</option>
          <option value="12">Kelas 12</option>
        </select>

        <div className="flex items-center gap-2 mt-2">
          <input
            type="email"
            placeholder="Email"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl bg-white text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {!isVerified ? (
            <button
              onClick={handleVerifyEmail}
              className="bg-blue-500 text-white px-2 py-1 border-gray-300 rounded-xl text-sm"
            >
              Verifikasi
            </button>
          ) : (
            <CheckCircle className="text-green-500" />
          )}
        </div>

        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-white text-sm mt-2"
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Konfirmasi password"
          className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-white text-sm mt-2"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <p className="text-sm mt-3">
          Sudah punya akun?{" "}
          <a href="/login" className="text-blue-600 underline">
            Log in!
          </a>
        </p>

        {password && confirmPassword && password !== confirmPassword && (
          <p className="text-sm text-red-500 mt-1">Password tidak cocok</p>
        )}

        <button
          disabled={!isFormValid}
          onClick={handleSubmit}
          className={`mt-4 w-full py-3 font-bold rounded-full ${
            isFormValid
              ? "bg-black text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Daftar akun
        </button>
      </div>

      {/* Modal OTP */}
      {showModal && (
        <OtpModal
          email={email}
          otp={otp}
          onClose={() => setShowModal(false)}
          onVerifySuccess={() => {
            setIsVerified(true);
            setShowModal(false);
          }}
          onResend={() => {
            console.log("Resend Code Triggered");
            handleVerifyEmail();
          }}
        />
      )}
    </div>
  );
}
