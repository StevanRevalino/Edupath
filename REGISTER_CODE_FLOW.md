# Register Code Flow

## 1. User Input (Register.tsx)

### State

```typescript
const [email, setEmail] = useState("");
const [otp, setOtp] = useState("");
const [showModal, setShowModal] = useState(false);
const [isVerified, setIsVerified] = useState(false);
const [timer, setTimer] = useState(30);
const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [kelas, setKelas] = useState<OptionType | null>(null);
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [errors, setErrors] = useState<{ [key: string]: string }>({});
```

## 2. Email Verification Flow

### handleVerifyEmail()

```typescript
const handleVerifyEmail = async () => {
  try {
    // Validasi email format
    await emailSchema.validate({ email });

    // Kirim request OTP ke server
    const response = await authHandler.sendOtp(email, "verification");
    const serverOtp = response.data.otp;
    setOtp(serverOtp);

    // Tampilkan modal OTP
    setShowModal(true);
    toast.success("OTP berhasil dikirim ke email!");

    // Hapus error email jika ada
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.email;
      return newErrors;
    });
  } catch (err: any) {
    if (err instanceof yup.ValidationError) {
      setErrors((prev) => ({ ...prev, email: err.message }));
    } else {
      toast.error(err.response?.data?.message || "Gagal mengirim OTP");
    }
  }
};
```

**Step:**

1. Validasi format email dengan `emailSchema`
2. Call `authHandler.sendOtp(email, "verification")`
3. Terima OTP dari server
4. Set OTP ke state
5. Tampilkan modal OTP
6. User input OTP di modal
7. Jika OTP benar, set `isVerified = true`

### handleResendOtp()

```typescript
const handleResendOtp = async () => {
  if (timer > 0) return;

  try {
    const response = await authHandler.sendOtp(email, "verification");
    const newOtp = response.data.otp;
    setOtp(newOtp);
    setOtpResetTrigger((prev) => prev + 1);
    toast.success("OTP berhasil dikirim ulang!");
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Gagal mengirim ulang OTP");
  }
};
```

**Step:**

1. Cek timer (harus 0)
2. Kirim ulang OTP
3. Update OTP state
4. Reset timer ke 30 detik

## 3. Registration Submit Flow

### handleRegisterSubmit()

```typescript
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
    // Validasi form dengan registerSchema
    await registerSchema.validate(formData, { abortEarly: false });
  } catch (err: any) {
    if (err.name === "ValidationError") {
      const newErrors: { [key: string]: string } = {};
      err.inner.forEach((e: yup.ValidationError) => {
        if (e.path && !newErrors[e.path]) {
          newErrors[e.path] = e.message;
        }
      });
      setErrors(newErrors);
      return;
    }
  }

  // Cek email sudah diverifikasi
  if (!isVerified) {
    setErrors((prev) => ({ ...prev, email: "Email belum diverifikasi" }));
    return;
  }

  try {
    // Kirim data registrasi ke server
    await authHandler.register({
      firstname: firstName,
      lastname: lastName,
      kelas: Number(kelas?.value),
      email,
      password,
    });

    toast.success("Register berhasil!");
    navigate("/login");
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Terjadi kesalahan server");
  }
};
```

**Step:**

1. Reset errors
2. Validasi form dengan `registerSchema`
3. Cek `isVerified === true`
4. Call `authHandler.register(data)`
5. Success → navigate ke `/login`
6. Error → tampilkan error message

## 4. Client Handler (authHandler.ts)

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

### register()

```typescript
async register(data: RegisterData): Promise<{ success: boolean }> {
  try {
    await axios.post(`${API_URL}/api/auth/register`, {
      firstname: data.firstname,
      lastname: data.lastname,
      kelas: Number(data.kelas),
      email: data.email,
      password: data.password,
    });
    return { success: true };
  } catch (error) {
    throw error;
  }
}
```

## 5. Server Controller (authController.ts)

### sendVerificationOtp()

```typescript
async sendVerificationOtp(req: Request, res: Response): Promise<void> {
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
    await sendVerificationOtpEmail(email, otp);

    res.status(200).json({
      success: true,
      otp,
      message: "Kode verifikasi berhasil dikirim ke email",
    });
  } catch (error: any) {
    console.error("Send verification OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengirim kode verifikasi",
    });
  }
}
```

**Step:**

1. Extract email dari request body
2. Validasi email tidak kosong
3. Generate OTP 6 digit random
4. Kirim email via `sendVerificationOtpEmail()`
5. Return OTP ke client

### register()

```typescript
async register(req: Request, res: Response): Promise<void> {
  try {
    const user = await this.authService.register(req.body);
    res.status(201).json({
      success: true,
      data: user,
      message: "Berhasil register",
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

1. Call `authService.register()`
2. Return user data (tanpa password)
3. Status 201 Created

## 6. Server Service (authService.ts)

### register()

```typescript
async register(data: any) {
  // Cek email sudah terdaftar atau belum
  const existingUser = await this.userRepository.findByEmail(data.email);
  if (existingUser) {
    throw new Error("Email sudah terdaftar");
  }

  // Hash password
  const hashed = await bcrypt.hash(data.password, 10);

  // Generate custom user ID (US001, US002, ...)
  const customId = await this.generateCustomUserId();

  // Format user data
  const formatedUser = {
    user_id: customId,
    firstname: data.firstname,
    lastname: data.lastname,
    email: data.email,
    role: "STUDENT" as const,
    kelas: Number(data.kelas),
    password: hashed,
  };

  // Insert ke database
  const user = await this.userRepository.create(formatedUser);
  return user;
}
```

**Step:**

1. Cek email sudah terdaftar → throw error jika ada
2. Hash password dengan bcrypt (10 salt rounds)
3. Generate custom user ID (US001, US002, ...)
4. Format user data
5. Insert ke database via `userRepository.create()`
6. Return user object (tanpa password)

### generateCustomUserId()

```typescript
private async generateCustomUserId(): Promise<string> {
  const lastUser = await this.userRepository.findLastUserWithPrefix("US");

  let lastNumber = 0;
  if (lastUser) {
    const numPart = parseInt(lastUser.user_id.replace("US", ""));
    lastNumber = isNaN(numPart) ? 0 : numPart;
  }

  const nextNumber = lastNumber + 1;
  return `US${String(nextNumber).padStart(3, "0")}`;
}
```

**Step:**

1. Cari user terakhir dengan prefix "US"
2. Extract nomor dari user_id (US001 → 1)
3. Increment nomor
4. Format dengan padding (2 → 002)
5. Return user_id baru (US002)

## 7. Email Service (emailService.ts)

### sendVerificationOtpEmail()

```typescript
export async function sendVerificationOtpEmail(to: string, otp: string) {
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
    subject: "Kode Verifikasi Email - EduPath",
    html: `
      <h2>Verifikasi Email Anda</h2>
      <p>Kode OTP Anda adalah: <strong>${otp}</strong></p>
      <p>Kode ini berlaku selama 5 menit.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}
```

**Step:**

1. Setup nodemailer transporter dengan Gmail
2. Buat email template dengan OTP
3. Kirim email ke user

## 8. Validation Schema

### registerSchema

```typescript
export const registerSchema = yup.object().shape({
  firstName: yup.string().required("Nama awal wajib diisi"),
  lastName: yup.string().required("Nama akhir wajib diisi"),
  kelas: yup.string().required("Kelas wajib dipilih"),
  email: yup.string().email("Email tidak valid").required("Email wajib diisi"),
  password: yup
    .string()
    .min(6, "Password minimal 6 karakter")
    .required("Password wajib diisi"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Password tidak sama")
    .required("Konfirmasi password wajib diisi"),
});
```

### emailSchema

```typescript
export const emailSchema = yup.object().shape({
  email: yup.string().email("Email tidak valid").required("Email wajib diisi"),
});
```

## Flow Summary

### Email Verification Flow

```
User input email
→ Click "Verifikasi"
→ Validate email format
→ authHandler.sendOtp(email, "verification")
→ POST /api/auth/send-verification-otp
→ Generate 6-digit OTP
→ Send email via nodemailer
→ Return OTP to client
→ Show OTP modal
→ User input OTP
→ Verify OTP
→ Set isVerified = true
```

### Registration Flow

```
User fill form (firstname, lastname, kelas, email, password, confirmPassword)
→ Verify email first (isVerified = true)
→ Click "Daftar akun"
→ Validate form with registerSchema
→ authHandler.register(data)
→ POST /api/auth/register
→ authService.register()
→ Check email exists → throw error if exists
→ Hash password with bcrypt
→ Generate custom user_id (US001, US002, ...)
→ Insert to database
→ Return user data
→ Show success toast
→ Navigate to /login
```

## HTTP Requests/Responses

### Send Verification OTP

**Request:**

```http
POST /api/auth/send-verification-otp
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
  "message": "Kode verifikasi berhasil dikirim ke email"
}
```

### Register

**Request:**

```http
POST /api/auth/register
Content-Type: application/json

{
  "firstname": "John",
  "lastname": "Doe",
  "kelas": 11,
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "user_id": "US001",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "kelas": 11
  },
  "message": "Berhasil register"
}
```

**Error (400) - Email sudah terdaftar:**

```json
{
  "success": false,
  "message": "Email sudah terdaftar"
}
```

## Error Handling

### Client-side Validation Error

- Email format invalid
- Password < 6 characters
- Password tidak sama
- Field kosong
  → Display error per field, tidak ada API call

### Email Belum Diverifikasi

- `isVerified === false`
  → Display "Email belum diverifikasi"

### Server Error - Email Sudah Terdaftar

- `authService.register()` → throw error
  → Return 400 "Email sudah terdaftar"

### Server Error - Gagal Kirim Email

- `sendVerificationOtpEmail()` → throw error
  → Return 500 "Gagal mengirim kode verifikasi"
