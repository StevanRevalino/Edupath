import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import OtpModal from "../components/ModalVerifyOtp";
import emailjs from "@emailjs/browser";
import DropdownList from "../components/DropDownList";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { registerSchema } from "../schema/RegsiterSchema";
import * as yup from "yup";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [timer, setTimer] = useState(60);
  const [submitted, setSubmitted] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [kelas, setKelas] = useState("");
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
    kelas.trim() !== "" &&
    email.trim() !== "" &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "" &&
    password === confirmPassword &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    password.length >= 6 &&
    isVerified;

  const handleRegisterSubmit = async () => {
    setSubmitted(true);
    setErrors({}); // reset error

    const formData = {
      firstName,
      lastName,
      kelas,
      email,
      password,
      confirmPassword,
    };

    try {
      // Validasi pakai Yup schema
      await registerSchema.validate(formData, { abortEarly: false });
    } catch (err: any) {
      if (err.name === "ValidationError") {
        const newErrors: { [key: string]: string } = {};
        err.inner.forEach((e: yup.ValidationError) => {
          if (e.path) newErrors[e.path] = e.message;
        });
        setErrors(newErrors);
        return; // ❌ STOP proses jika validasi gagal
      }
    }

    // Validasi manual tambahan
    if (!isVerified) {
      setErrors((prev) => ({
        ...prev,
        email: "Email belum diverifikasi",
      }));
      return; // ❌ STOP jika belum verifikasi
    }

    try {
      // Kirim ke server
      await axios.post("http://localhost:5000/api/auth/register", {
        firstname: firstName,
        lastname: lastName,
        kelas: Number(kelas),
        email,
        password,
      });

      alert("Pendaftaran berhasil!");
      navigate("/login");
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Terjadi kesalahan server";
      console.error("Error saat register:", errorMsg);
      alert(errorMsg);
    }
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
        <h1 className="text-2xl font-bold mb-2">Buat Akun</h1>
        <p className="mb-6 text-sm text-gray-600">
          Yuk, jadi anggota EduFamily!
        </p>

        {/* First & Last Name */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="text"
              placeholder="Nama awal"
              className="w-full px-4 py-3 rounded-md bg-white text-sm"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />

            {errors.firstName && (
              <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              placeholder="Nama akhir"
              className="w-full px-4 py-3 rounded-md bg-white text-sm"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            {errors.lastName && (
              <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Kelas */}
        <div className="mt-2">
          <DropdownList
            value={kelas}
            onChange={(e) => setKelas(e.target.value)}
            placeholder="Kelas"
            className="border-0"
            options={[
              { value: "10", label: "Kelas 10" },
              { value: "11", label: "Kelas 11" },
              { value: "12", label: "Kelas 12" },
            ]}
            error={errors.kelas}
          />
        </div>

        {/* Email */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 rounded-md bg-white text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

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

        {submitted && email.trim() === "" && (
          <p className="text-xs text-red-500 mt-1">Email wajib diisi</p>
        )}

        {submitted &&
          email.trim() !== "" &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
            <p className="text-xs text-red-500 mt-1">
              Format email tidak valid
            </p>
          )}

        {submitted &&
          email.trim() !== "" &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
          !isVerified && (
            <p className="text-xs text-red-500 mt-1">
              Email belum diverifikasi
            </p>
          )}

        {/* Password */}
        <div className="mt-2">
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-md bg-white text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {submitted && password.trim() === "" && (
            <p className="text-xs text-red-500 mt-1">Password wajib diisi</p>
          )}
          {submitted && password.length > 0 && password.length < 6 && (
            <p className="text-xs text-red-500 mt-1">
              Password minimal 6 karakter
            </p>
          )}
        </div>

        {/* Konfirmasi Password */}
        <div className="mt-2">
          <input
            type="password"
            placeholder="Konfirmasi Password"
            className="w-full px-4 py-3 rounded-md bg-white text-sm"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {submitted && confirmPassword.trim() === "" && (
            <p className="text-xs text-red-500 mt-1">
              Konfirmasi password wajib diisi
            </p>
          )}
          {submitted &&
            password !== confirmPassword &&
            confirmPassword !== "" && (
              <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>
            )}
        </div>

        <p className="text-sm mt-3">
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
          email={email}
          otp={otp}
          onClose={() => setShowModal(false)}
          onVerifySuccess={() => {
            setIsVerified(true);
            setShowModal(false);
          }}
          onResend={handleVerifyEmail}
        />
      )}
    </div>
  );
}
