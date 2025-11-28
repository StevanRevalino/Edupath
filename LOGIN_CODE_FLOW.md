# Login Code Flow Documentation

## Overview

Dokumentasi lengkap alur kode untuk fitur Login di aplikasi Edupath, dari input user di UI hingga response dari server.

## Sequence Diagram

````mermaid
sequenceDiagram
    actor User
    participant UI as :Login Page
    participant Handler as :AuthHandler
    participant Controller as :AuthController
    participant Service as :AuthService
    participant Repo as :UserRepository

    loop Until Login Success
        User->>UI: Input email & password
        User->>UI: Click "Masuk"

        UI->>UI: Validate input (loginSchema)
        alt Validation Failed
            UI->>User: Display field errors
        else Validation Success
            UI->>Handler: login(email, password)
            Handler->>Controller: POST /api/auth/login

            Controller->>Controller: Validate required fields
            alt Fields Missing
                Controller-->>Handler: 400 Bad Request
                Handler-->>UI: Error response
                UI->>User: Show error toast
            else Fields Valid
                Controller->>Service: login(email, password)
                Service->>Repo: findByEmail(email)
                Repo-->>Service: User object or null

                alt User Not Found
                    Service-->>Controller: null
                    Controller-->>Handler: 401 Unauthorized
                    Handler-->>UI: Error response
                    UI->>User: Show "Email atau password salah"
                else User Found
                    Service->>Service: bcrypt.compare(password, hash)
                    alt Password Mismatch
                        Service-->>Controller: null
                        Controller-->>Handler: 401 Unauthorized
                        Handler-->>UI: Error response
                        UI->>User: Show "Email atau password salah"
                    else Password Match
                        Service->>Service: jwt.sign(payload, secret)
                        Service-->>Controller: {token, user}
                        Controller-->>Handler: 200 OK {token, user}
                        Handler-->>UI: Success response

                        UI->>UI: clearAllAuthData()
                        UI->>UI: setToken(token, 1 day)
                        UI->>UI: setUserData(userId, role)
                        UI->>User: Show success toast

                        alt role === "ADMIN"
                            UI->>User: Navigate to /dashboard-admin
                        else role === "USER"
                            UI->>User: Navigate to /home
                        end
                    end
                end
            end
        end
    end
```---

## 1. Client - User Interface (Login.tsx)

### Location

`client/src/pages/auth/Login.tsx`

### State Management

```typescript
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [submitted, setSubmitted] = useState(false);
const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
const [serverError, setServerError] = useState("");
const [openModalVerifyOtp, setOpenModalVerifyOtp] = useState(false);
const navigate = useNavigate();
````

**Penjelasan State:**

- `email` & `password`: Menyimpan input user
- `submitted`: Flag untuk menandai form sudah disubmit (untuk validasi UI)
- `errors`: Menyimpan error validasi per field
- `serverError`: Menyimpan error dari server
- `openModalVerifyOtp`: Kontrol modal reset password
- `navigate`: Hook untuk navigasi setelah login berhasil

---

### Input Handling

#### Email Input

```typescript
<AuthInput
  type="email"
  placeholder="Email"
  value={email}
  onChange={(e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  }}
  error={submitted && errors.email ? errors.email : undefined}
/>
```

**Flow:**

1. User mengetik email
2. State `email` di-update
3. Jika ada error sebelumnya, error dihapus (real-time feedback)
4. Error ditampilkan hanya jika form sudah di-submit

#### Password Input

```typescript
<AuthPasswordInput
  placeholder="Password"
  value={password}
  onChange={(e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  }}
  error={submitted && errors.password ? errors.password : undefined}
/>
```

**Flow:** Sama seperti email input

---

### Submit Handler (`handleLogin`)

```typescript
const handleLogin = async () => {
  // Step 1: Reset error states
  setErrors({});
  setSubmitted(true);
  setServerError("");

  try {
    // Step 2: Client-side validation menggunakan Yup schema
    await loginSchema.validate({ email, password }, { abortEarly: false });

    // Step 3: Call AuthHandler untuk login
    const res = await authHandler.login(email, password);
    console.log("Login Response:", res);
    const result = res.data;

    // Step 4: Clear data autentikasi lama
    TokenManager.clearAllAuthData();

    // Step 5: Simpan token dan user data baru
    TokenManager.setToken(result.token, 1); // Token valid 1 hari
    TokenManager.setUserData(result.user.user_id, result.user.role);

    // Step 6: Tampilkan success message
    toast.success("Login berhasil!");

    // Step 7: Role-based navigation
    // Cek role user untuk menentukan halaman tujuan
    if (result.user.role === "ADMIN") {
      // Admin diarahkan ke dashboard admin
      navigate("/dashboard-admin");
    } else {
      // User biasa (STUDENT) diarahkan ke home page
      navigate("/home");
    }
  } catch (err: any) {
    // Error Handling
    if (err instanceof ValidationError) {
      // Validasi error - mapping error per field
      const newErrors: { email?: string; password?: string } = {};
      err.inner.forEach((e) => {
        if (e.path && !newErrors[e.path as keyof typeof newErrors]) {
          newErrors[e.path as "email" | "password"] = e.message;
        }
      });
      setErrors(newErrors);
      return;
    } else {
      // Server error
      const errorMessage =
        err.response?.data?.message || "Email atau password salah";
      setServerError(errorMessage);
    }
  }
};
```

**Penjelasan Step-by-Step:**

**Step 1:** Reset semua error untuk memulai proses fresh
**Step 2:** Validasi input menggunakan `loginSchema` (Yup)

- `abortEarly: false` = validasi semua field, bukan stop di error pertama
  **Step 3:** Panggil `authHandler.login()` untuk kirim request ke server
  **Step 4:** Hapus token/data lama untuk hindari konflik
  **Step 5:** Simpan token JWT dan user data ke localStorage
  **Step 6:** Tampilkan toast notification sukses
  **Step 7:** Role-based navigation:
  - Cek `result.user.role`
  - Jika `"ADMIN"` → redirect ke `/dashboard-admin`
  - Jika bukan admin (USER/STUDENT) → redirect ke `/home`---

### Error Display

```typescript
useEffect(() => {
  if (serverError) {
    toast.error(serverError);
  }
}, [serverError]);
```

**Flow:**

- Setiap kali `serverError` berubah, tampilkan toast error
- Auto-dismiss setelah beberapa detik (handled by react-hot-toast)

---

## 2. Client - Handler Layer (AuthHandler)

### Location

`client/src/handler/authHandler.ts`

### Login Method

```typescript
class AuthHandler {
  async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; data: LoginResponse }> {
    try {
      // Kirim POST request ke backend
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      // Return response data
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      // Throw error untuk di-handle oleh caller
      throw error;
    }
  }
}

export const authHandler = new AuthHandler();
```

**Penjelasan:**

1. Terima `email` dan `password` dari UI
2. Kirim HTTP POST request ke `/api/auth/login`
3. Return response jika berhasil
4. Throw error jika gagal (401, 500, dll)

### Response Interface

```typescript
interface LoginResponse {
  token: string;
  user: {
    user_id: string;
    email: string;
    role: "ADMIN" | "USER";
    firstname: string;
    lastname: string;
    kelas: number | null;
  };
}
```

---

## 3. Server - Controller Layer (AuthController)

### Location

`server/src/controllers/authController.ts`

### Login Method

```typescript
async login(req: Request, res: Response): Promise<void> {
  console.log("Login request received:", req.body);
  const { email, password } = req.body;

  // Step 1: Validasi input field wajib
  if (!email || !password) {
    console.log("Missing email or password");
    res.status(400).json({
      success: false,
      message: "Email dan password wajib diisi",
    });
    return;
  }

  try {
    // Step 2: Call AuthService untuk autentikasi
    const result = await this.authService.login(email, password);

    // Step 3: Cek hasil autentikasi
    if (!result) {
      console.log("Login failed: Invalid credentials");
      res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
      return;
    }

    // Step 4: Send success response dengan token dan user data
    console.log("Login successful for:", email);
    res.status(200).json({
      success: true,
      data: result,
      message: "Login successful",
    });
  } catch (error) {
    // Step 5: Handle unexpected errors
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
```

**Penjelasan Step-by-Step:**

**Step 1:** Validasi bahwa email dan password tidak kosong

- Return 400 Bad Request jika salah satu kosong

**Step 2:** Panggil `authService.login()` untuk verifikasi kredensial

**Step 3:** Cek hasil dari service:

- `null` = kredensial tidak valid → return 401 Unauthorized
- Object = kredensial valid → lanjut ke step 4

**Step 4:** Return success response (200 OK) dengan:

- Token JWT
- User data (tanpa password)

**Step 5:** Catch unexpected error → return 500 Internal Server Error

---

## 4. Server - Service Layer (AuthService)

### Location

`server/src/services/authService.ts`

### Login Method

```typescript
async login(email: string, password: string) {
  // Step 1: Cari user berdasarkan email
  const user = await this.userRepository.findByEmail(email);

  // Step 2: Validasi user exists dan punya password
  if (!user || !user.password) return null;

  // Step 3: Verifikasi password menggunakan bcrypt
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;

  // Step 4: Generate JWT token
  const token = jwt.sign(
    {
      user_id: user.user_id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" } // Token expire dalam 1 hari
  );

  // Step 5: Return token dan user data (exclude password)
  return {
    token,
    user: {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      firstname: user.firstname,
      lastname: user.lastname,
      kelas: user.kelas,
    },
  };
}
```

**Penjelasan Step-by-Step:**

**Step 1:** Query database untuk cari user dengan email tersebut

- Menggunakan UserRepository

**Step 2:** Cek apakah user ditemukan dan punya password

- Return `null` jika tidak ada

**Step 3:** Compare password yang diinput dengan hash di database

- Menggunakan `bcrypt.compare()`
- Return `null` jika tidak match

**Step 4:** Generate JWT token dengan payload:

- `user_id`: ID unik user
- `firstname`, `lastname`: Nama user
- `email`: Email user
- `role`: Role user (ADMIN/USER)
- Secret key dari `JWT_SECRET` env variable
- Expiry: 1 hari

**Step 5:** Return object berisi:

- `token`: JWT token string
- `user`: User data tanpa password (security)

---

## 5. Server - Repository Layer (UserRepository)

### Location

`server/src/repositories/userRepository.ts`

### Find By Email Method

```typescript
async findByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}
```

**Penjelasan:**

- Query ke database menggunakan Prisma ORM
- Cari user dengan `email` yang unique
- Return user object atau `null` jika tidak ditemukan

---

## 6. Database Layer

### Prisma User Model

```prisma
model User {
  user_id   String   @id @default(uuid())
  email     String   @unique
  password  String
  firstname String
  lastname  String
  kelas     Int?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
}
```

**Penjelasan:**

- `email`: Unique constraint, digunakan untuk login
- `password`: Hash bcrypt, tidak pernah di-return ke client
- `role`: Enum untuk authorization (USER atau ADMIN)
- `kelas`: Nullable, untuk student saja

---

## 7. Utility - Token Manager

### Location

`client/src/utils/tokenManager.ts`

### Methods

```typescript
class TokenManager {
  // Simpan token dengan expiry
  static setToken(token: string, days: number) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    localStorage.setItem("token", token);
    localStorage.setItem("tokenExpiry", expiryDate.toISOString());
  }

  // Simpan user data
  static setUserData(userId: string, role: string) {
    localStorage.setItem("userId", userId);
    localStorage.setItem("userRole", role);
  }

  // Clear semua auth data
  static clearAllAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
  }

  // Get token jika belum expired
  static getToken(): string | null {
    const token = localStorage.getItem("token");
    const expiry = localStorage.getItem("tokenExpiry");

    if (!token || !expiry) return null;

    if (new Date() > new Date(expiry)) {
      this.clearAllAuthData();
      return null;
    }

    return token;
  }

  // Logout - clear all data dan redirect
  static logout() {
    this.clearAllAuthData();
    window.location.href = "/login";
  }
}
```

**Penjelasan:**

- Semua data disimpan di `localStorage` browser
- Token punya expiry untuk security
- Auto-clear jika token expired
- Logout akan clear semua dan redirect ke login

---

## 8. Validation Schema

### Location

`client/src/schema/LoginSchema.tsx`

```typescript
import * as yup from "yup";

export const loginSchema = yup.object().shape({
  email: yup.string().email("Email tidak valid").required("Email wajib diisi"),
  password: yup
    .string()
    .min(6, "Password minimal 6 karakter")
    .required("Password wajib diisi"),
});
```

**Validation Rules:**

- **Email:**
  - Format email valid
  - Tidak boleh kosong
- **Password:**
  - Minimal 6 karakter
  - Tidak boleh kosong

---

## Flow Summary

### Success Flow

1. **User Input** → Email & password di Login.tsx
2. **Validation** → loginSchema validasi format
3. **API Call** → authHandler.login() kirim POST ke /api/auth/login
4. **Controller** → authController.login() terima request
5. **Service** → authService.login() verifikasi kredensial
6. **Repository** → userRepository.findByEmail() query database
7. **Password Check** → bcrypt.compare() verifikasi password
8. **Token Generation** → jwt.sign() buat token
9. **Response** → Token dan user data dikirim ke client
10. **Storage** → TokenManager simpan token dan user data
11. **Role Check** → Cek role dari response (ADMIN atau USER)
12. **Navigation** → Redirect berdasarkan role:
    - ADMIN → `/dashboard-admin`
    - USER → `/home`

### Error Flows

#### Validation Error (Client-side)

```
User Input → Yup Validation FAIL → Display field errors
```

- Tidak ada API call
- Error ditampilkan per field

#### Invalid Credentials (Server-side)

```
API Call → AuthService → User not found OR Password mismatch
→ Return null → Controller return 401 → Client display error toast
```

#### Server Error

```
API Call → Unexpected error → Controller return 500
→ Client display "Internal server error"
```

---

## HTTP Request/Response Examples

### Request

```http
POST /api/auth/login HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": "US001",
      "email": "user@example.com",
      "role": "USER",
      "firstname": "John",
      "lastname": "Doe",
      "kelas": 11
    }
  },
  "message": "Login successful"
}
```

### Error Response - Invalid Credentials (401)

```json
{
  "success": false,
  "message": "Email atau password salah"
}
```

### Error Response - Missing Fields (400)

```json
{
  "success": false,
  "message": "Email dan password wajib diisi"
}
```

### Error Response - Server Error (500)

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Security Considerations

### Client-side

1. **Input Validation**: Yup schema untuk validasi format
2. **Token Storage**: localStorage dengan expiry check
3. **Auto Logout**: Token expired otomatis logout
4. **Clear Old Data**: Clear data lama sebelum simpan yang baru

### Server-side

1. **Password Hashing**: bcrypt dengan salt rounds
2. **JWT Token**: Signed dengan secret, expires 1 hari
3. **No Password in Response**: Password tidak pernah di-return
4. **Generic Error Messages**: Tidak expose info sensitif
5. **Environment Variables**: Secret key di .env file

---

## Data Flow Diagram (Text)

```
[Browser] → [Login.tsx]
              ↓ (email, password)
          [loginSchema validation]
              ↓ (valid)
          [authHandler.login()]
              ↓ HTTP POST
          [Express Server]
              ↓
          [authController.login()]
              ↓
          [authService.login()]
              ↓
          [userRepository.findByEmail()]
              ↓
          [Prisma → PostgreSQL]
              ↓ (user data)
          [bcrypt.compare(password)]
              ↓ (valid)
          [jwt.sign(payload)]
              ↓ (token)
          [return {token, user}]
              ↓ HTTP 200
          [authHandler receives response]
              ↓
          [Login.tsx receives data]
              ↓
          [TokenManager.setToken()]
          [TokenManager.setUserData()]
              ↓
          [navigate("/dashboard-admin" or "/home")]
```

---

## Environment Variables

### Client (.env)

```
VITE_API_URL=http://localhost:5000
```

### Server (.env)

```
JWT_SECRET=your-super-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/edupath
```

---

## Testing Considerations

### Unit Tests

- **authHandler.login()**: Mock axios, test success/error cases
- **authService.login()**: Mock repository, test password verification
- **loginSchema**: Test validation rules

### Integration Tests

- Full flow dari UI → Database
- Test dengan real database (test environment)

### E2E Tests

- Simulate user interaction
- Test dengan real browser (Playwright/Cypress)

---

## Common Issues & Solutions

### Issue 1: Token Expired

**Symptoms:** Auto redirect ke login
**Solution:** Normal behavior, user perlu login ulang

### Issue 2: CORS Error

**Symptoms:** Network error di browser console
**Solution:** Check CORS config di server

### Issue 3: 401 Unauthorized

**Symptoms:** "Email atau password salah"
**Solution:**

- Verify email exists di database
- Verify password correct
- Check password hash di database

### Issue 4: Token tidak tersimpan

**Symptoms:** Redirect ke login setelah refresh
**Solution:**

- Check localStorage di DevTools
- Verify TokenManager.setToken() called
- Check browser not in incognito mode

---

## Dependencies

### Client

- `axios`: HTTP client
- `react-router-dom`: Navigation
- `react-hot-toast`: Toast notifications
- `yup`: Schema validation

### Server

- `express`: Web framework
- `bcrypt`: Password hashing
- `jsonwebtoken`: JWT token generation
- `prisma`: ORM untuk database
- `dotenv`: Environment variables

---

**Last Updated:** November 27, 2025
