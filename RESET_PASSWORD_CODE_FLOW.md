# Reset Password Code Flow

## 1. User Interface (ModalResetPassword.tsx)

### State

```typescript
const [email, setEmail] = useState("");
const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
const [serverOtp, setServerOtp] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [success, setSuccess] = useState(false);
const [isVerified, setIsVerified] = useState(false);
const [errors, setErrors] = useState<{ [key: string]: string }>({});
const [timer, setTimer] = useState(0);
```

## 2. Send OTP Flow

### handleVerifyEmail()

```typescript
const handleVerifyEmail = async () => {
  try {
    // Validasi email format
    await emailSchema.validate({ email }, { abortEarly: false });
    setErrors({});

    // Kirim request OTP
    const response = await authHandler.sendOtp(email, "reset");

    // Set OTP dari server response
    setServerOtp(response.data.otp);

    toast.success("OTP berhasil dikirim ke email!");
    startTimer(); // Mulai countdown 30 detik
  } catch (err: any) {
    if (err instanceof ValidationError) {
      const emailErr: { email?: string } = {};
      err.inner.forEach((e) => {
        if (e.path === "email") emailErr.email = e.message;
      });
      setErrors((prev) => ({ ...prev, ...emailErr }));
    } else {
      toast.error(err.response?.data?.message || "Gagal mengirim OTP");
    }
  }
};
```

**Step:**

1. Validasi format email dengan `emailSchema`
2. Call `authHandler.sendOtp(email, "reset")`
3. Terima OTP dari server
4. Set `serverOtp` ke state
5. Tampilkan success toast
6. Start timer 30 detik (cooldown untuk resend)

### Timer

```typescript
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
```

**Fungsi:** Countdown 30 detik sebelum bisa resend OTP

## 3. OTP Input & Verification

### handleChangeOtp()

```typescript
const handleChangeOtp = (value: string, index: number) => {
  // Hanya terima digit
  if (!/^\d?$/.test(value)) return;

  const newOtp = [...otp];
  newOtp[index] = value;
  setOtp(newOtp);

  // Auto focus next input
  if (value && index < 5) {
    inputRefs.current[index + 1]?.focus();
  }

  // Auto verify ketika semua 6 digit terisi
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
```

**Step:**

1. User input 1 digit
2. Auto focus ke input berikutnya
3. Ketika 6 digit terisi, compare dengan `serverOtp`
4. Jika match → set `isVerified = true`
5. Jika tidak match → `isVerified = false`

### handleKeyDown()

```typescript
const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
  if (e.key === "Backspace" && otp[index] === "") {
    if (index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }
};
```

**Fungsi:** Handle backspace untuk focus ke input sebelumnya

## 4. Reset Password Submit

### handleSubmit()

```typescript
const handleSubmit = async () => {
  try {
    // Validasi form
    const schema = resetPasswordSchema(isVerified);
    await schema.validate(
      { email, newPassword, confirmPassword },
      { abortEarly: false }
    );

    setErrors({});

    // Kirim request reset password
    await authHandler.resetPassword({
      email,
      otp: serverOtp,
      newPassword,
    });

    // Clear localStorage (force logout)
    localStorage.removeItem("token_data");
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");

    setSuccess(true);
    toast.success("Password berhasil direset! Silakan login kembali.");

    // Redirect ke login setelah 2.5 detik
    setTimeout(() => {
      onClose();

      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register") {
        window.location.href = "/login";
      }
    }, 2500);
  } catch (err: any) {
    if (err instanceof ValidationError) {
      const newErrors: { [key: string]: string } = {};
      err.inner.forEach((e) => {
        if (e.path) newErrors[e.path] = e.message;
      });
      setErrors(newErrors);
    } else {
      toast.error(
        err.response?.data?.message || "Terjadi kesalahan saat reset password"
      );
    }
  }
};
```

**Step:**

1. Validasi form dengan `resetPasswordSchema`
2. Call `authHandler.resetPassword(data)`
3. Clear localStorage (logout paksa)
4. Set `success = true`
5. Tampilkan success toast
6. Setelah 2.5 detik → redirect ke `/login`

## 5. Form Validation

### isFormValid

```typescript
useEffect(() => {
  const isOtpFilled = otp.every((digit) => digit !== "");
  const isFilled =
    email && newPassword && confirmPassword && isOtpFilled && isVerified;

  setIsFormValid(Boolean(isFilled));
}, [email, otp, newPassword, confirmPassword, isVerified]);
```

**Kondisi Valid:**

- Email tidak kosong
- OTP 6 digit terisi
- New password tidak kosong
- Confirm password tidak kosong
- `isVerified === true`

## 6. Client Handler (authHandler.ts)

### sendOtp()

```typescript
/**
 * Unified method untuk mengirim OTP
 * @param email - Email tujuan
 * @param type - Jenis OTP: 'verification' untuk registrasi, 'reset' untuk reset password
 */
async sendOtp(
  email: string,
  type: OtpType = "reset"
): Promise<{ success: boolean; data: SendOtpResponse }> {
  try {
    const endpoint =
      type === "verification"
        ? `${API_URL}/api/auth/send-verification-otp`
        : `${API_URL}/api/auth/send-otp`;

    const response = await axios.post(endpoint, { email });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    throw error;
  }
}
```

### resetPassword()

```typescript
async resetPassword(data: ResetPasswordData): Promise<{ success: boolean }> {
  try {
    await axios.post(`${API_URL}/api/auth/forgot-password`, {
      email: data.email,
      otp: data.otp,
      newPassword: data.newPassword,
    });
    return { success: true };
  } catch (error) {
    throw error;
  }
}
```

## 7. Server Controller (authController.ts)

### sendOtp()

```typescript
async sendOtp(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email wajib diisi",
      });
      return;
    }

    // Generate OTP (6 digit)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Kirim email OTP
    await sendOtpEmail(email, otp);

    res.status(200).json({
      success: true,
      otp,
      message: "OTP berhasil dikirim ke email",
    });
  } catch (error: any) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengirim OTP",
    });
  }
}
```

**Step:**

1. Extract email dari request body
2. Validasi email tidak kosong
3. Generate OTP 6 digit random (100000 - 999999)
4. Kirim email via `sendOtpEmail()`
5. Return OTP ke client (for development/testing)

### forgotPassword()

```typescript
async forgotPassword(req: Request, res: Response): Promise<void> {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    res.status(400).json({
      success: false,
      message: "Email dan password baru wajib diisi",
    });
    return;
  }

  try {
    await this.authService.forgotPassword(email, newPassword);
    res.status(200).json({
      success: true,
      message: "Password berhasil direset",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
```

**Step:**

1. Extract email dan newPassword dari request
2. Validasi tidak kosong
3. Call `authService.forgotPassword()`
4. Return success response

## 8. Server Service (authService.ts)

### forgotPassword()

```typescript
async forgotPassword(email: string, newPassword: string) {
  // Cari user berdasarkan email
  const user = await this.userRepository.findByEmail(email);

  if (!user) throw new Error("User not found");

  // Cek password baru tidak sama dengan password lama
  const isSame = await bcrypt.compare(newPassword, user.password!);
  if (isSame)
    throw new Error("Password baru tidak boleh sama dengan sebelumnya");

  // Hash password baru
  const hashed = await bcrypt.hash(newPassword, 10);

  // Update password di database
  await this.userRepository.updatePassword(email, hashed);
}
```

**Step:**

1. Cari user berdasarkan email
2. Throw error jika user tidak ditemukan
3. Compare newPassword dengan password lama
4. Throw error jika sama (security measure)
5. Hash password baru dengan bcrypt
6. Update password di database

## 9. Repository (userRepository.ts)

### updatePassword()

```typescript
async updatePassword(email: string, hashedPassword: string) {
  return await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });
}
```

**Step:**

1. Update password field untuk user dengan email tersebut
2. Return updated user object

## 10. Email Service (emailService.ts)

### sendOtpEmail()

```typescript
export async function sendOtpEmail(to: string, otp: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: "Reset Password OTP - EduPath",
    html: `
      <h2>Reset Password</h2>
      <p>Kode OTP Anda untuk reset password: <strong>${otp}</strong></p>
      <p>Kode ini berlaku selama 5 menit.</p>
      <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}
```

**Step:**

1. Setup nodemailer transporter dengan Gmail
2. Buat email template dengan OTP
3. Kirim email ke user

## 11. Validation Schema

### emailSchema

```typescript
export const emailSchema = yup.object().shape({
  email: yup.string().email("Email tidak valid").required("Email wajib diisi"),
});
```

### resetPasswordSchema

```typescript
export const resetPasswordSchema = (isVerified: boolean) =>
  yup.object().shape({
    email: yup
      .string()
      .email("Email tidak valid")
      .required("Email wajib diisi"),
    newPassword: yup
      .string()
      .min(6, "Password minimal 6 karakter")
      .required("Password baru wajib diisi"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("newPassword")], "Password tidak sama")
      .required("Konfirmasi password wajib diisi"),
  });
```

## Flow Summary

### Complete Reset Password Flow

```
User click "Lupa password?"
→ Modal open
→ Input email
→ Click "Verifikasi"
→ Validate email format
→ authHandler.sendOtp(email, "reset")
→ POST /api/auth/send-otp
→ Generate 6-digit OTP
→ Send email via nodemailer
→ Return OTP to client
→ Start 30s timer
→ User input 6-digit OTP
→ Auto-verify when complete
→ If match → isVerified = true
→ Input new password & confirm password
→ Click "Simpan Perubahan"
→ Validate form
→ authHandler.resetPassword(data)
→ POST /api/auth/forgot-password
→ authService.forgotPassword()
→ Find user by email
→ Compare new password with old password
→ Throw error if same
→ Hash new password
→ Update password in database
→ Clear localStorage (force logout)
→ Show success toast
→ Redirect to /login after 2.5s
```

## HTTP Requests/Responses

### Send OTP

**Request:**

```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (200):**

```json
{
  "success": true,
  "otp": "123456",
  "message": "OTP berhasil dikirim ke email"
}
```

**Error (400):**

```json
{
  "success": false,
  "message": "Email wajib diisi"
}
```

**Error (500):**

```json
{
  "success": false,
  "message": "Gagal mengirim OTP"
}
```

### Reset Password

**Request:**

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password berhasil direset"
}
```

**Error (400) - Missing fields:**

```json
{
  "success": false,
  "message": "Email dan password baru wajib diisi"
}
```

**Error (400) - User not found:**

```json
{
  "success": false,
  "message": "User not found"
}
```

**Error (400) - Same password:**

```json
{
  "success": false,
  "message": "Password baru tidak boleh sama dengan sebelumnya"
}
```

## Error Handling

### Client-side Validation Error

- Email format invalid
- Password < 6 characters
- Password tidak sama dengan confirm password
- Field kosong
  → Display error per field

### Email Not Verified

- User belum input OTP atau OTP salah
  → Button "Simpan Perubahan" disabled

### Timer Active

- Timer > 0
  → Button "Verifikasi" disabled, show countdown

### Server Error - User Not Found

- Email tidak terdaftar
  → 400 "User not found"

### Server Error - Same Password

- Password baru sama dengan password lama
  → 400 "Password baru tidak boleh sama dengan sebelumnya"

### Server Error - Failed Send Email

- Nodemailer error
  → 500 "Gagal mengirim OTP"

## Security Features

### OTP

- 6 digit random number (100000 - 999999)
- Sent via email
- Auto-verify saat 6 digit lengkap
- 30 second cooldown untuk resend

### Password Validation

- Minimal 6 karakter
- Must match confirm password
- Tidak boleh sama dengan password lama
- Hash dengan bcrypt (10 salt rounds)

### Auto Logout

- Clear semua data di localStorage
- Force redirect ke login page
- User harus login ulang dengan password baru

### Timer

- 30 detik cooldown untuk prevent spam
- Auto countdown
- Button disabled saat timer > 0
