# Edit Profile Code Flow Documentation

## Overview

Dokumentasi ini menjelaskan alur lengkap untuk fitur **Ubah Profil User** di aplikasi Edupath, mencakup validasi form, konfirmasi SweetAlert2, dan update data ke database.

---

## 1. Flow Summary

### Main Steps:

1. User membuka halaman Profil
2. User mengklik tombol "Ubah Profil"
3. Modal edit profil terbuka dengan data saat ini
4. User mengubah data (firstname, lastname, kelas)
5. User submit form
6. Sistem validasi input
7. Konfirmasi dengan SweetAlert2
8. Update data ke backend
9. Refresh data profil
10. Trigger event untuk update Header
11. Tutup modal dan tampilkan toast success

### Special Features:

- **Ubah Password**: Redirect ke login page dengan logout
- **Real-time validation**: Clear error saat user mengetik
- **Kelas validation**: Hanya accept 10, 11, atau 12
- **Token management**: Auto logout jika token expired
- **Event dispatcher**: Trigger `profileUpdated` event untuk refresh Header

---

## 2. Sequence Diagram

````mermaid
sequenceDiagram
    actor User
    participant ProfilPage as <<view>><br/>ProfilPage
    participant authController
    participant UserDB as <<prisma>><br/>User

    User->>ProfilPage: Buka halaman profil
    ProfilPage->>ProfilPage: fetchUserProfile()
    ProfilPage->>authController: getUserById(userId)
    authController->>UserDB: findUnique(user_id)
    UserDB-->>authController: User data
    authController-->>ProfilPage: User profile data
    ProfilPage->>ProfilPage: setUserProfile(data)

    User->>ProfilPage: Klik "Ubah Profil"
    ProfilPage->>ProfilPage: setShowModal(true)
    ProfilPage-->>User: Tampilkan form modal dengan data saat ini

    User->>ProfilPage: Ubah data (firstname/lastname/kelas)
    ProfilPage->>ProfilPage: handleInputChange()

    User->>ProfilPage: Klik "Simpan"
    ProfilPage->>ProfilPage: handleSubmit(e)
    ProfilPage->>ProfilPage: validateForm()

    alt Validasi gagal
        ProfilPage-->>User: Tampilkan error messages
    else Validasi berhasil
        ProfilPage-->>User: Tampilkan konfirmasi

        User->>ProfilPage: Konfirmasi "Ya, simpan perubahan"
        ProfilPage->>ProfilPage: setSubmitting(true)

        ProfilPage->>authController: updateProfile(updateData)

        authController->>authController: Build updateData object
        authController->>authController: Validate kelas (10-12)

        alt Gagal update
            authController-->>ProfilPage: Error: Data tidak valid
            ProfilPage-->>User: Tampilkan pesan error
        else Berhasil update
            authController->>UserDB: update(user_id, updateData)
            UserDB-->>authController: Updated user data
            authController-->>ProfilPage: Success: Profil berhasil diperbarui

            ProfilPage->>ProfilPage: window.dispatchEvent('profileUpdated')
            ProfilPage-->>User: toast.success("Profil berhasil diperbarui!")
            ProfilPage->>ProfilPage: fetchUserProfile()
            ProfilPage->>authController: getUserById(userId)
            authController->>UserDB: findUnique(user_id)
            UserDB-->>authController: Updated user data
            authController-->>ProfilPage: Updated profile data
            ProfilPage->>ProfilPage: setUserProfile(newData)
            ProfilPage-->>User: Tampilkan data profil terbaru

            ProfilPage->>ProfilPage: setShowModal(false)
            ProfilPage->>ProfilPage: setSubmitting(false)
        end
    end
```---

## 3. Component Structure

### ProfilPage (`index.tsx`)

**State Management:**

```typescript
const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
const [loading, setLoading] = useState(true);
const [showModal, setShowModal] = useState(false);
````

**Key Methods:**

- `fetchUserProfile()`: Fetch data user dari backend
- `handleModalSuccess()`: Callback setelah update berhasil
- `getInitials()`: Generate initials untuk avatar

**Props to Modal:**

```typescript
<ModalEditProfile
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={handleModalSuccess}
  currentData={{
    firstname: userProfile.firstname,
    lastname: userProfile.lastname,
    kelas: userProfile.kelas,
  }}
/>
```

### ModalEditProfile (`ModalEditProfile.tsx`)

**State Management:**

```typescript
const [formData, setFormData] = useState({
  firstname: currentData.firstname,
  lastname: currentData.lastname,
  kelas: Number(currentData.kelas) || 10,
});
const [submitting, setSubmitting] = useState(false);
const [errors, setErrors] = useState<Record<string, string>>({});
```

**Key Methods:**

- `handleInputChange()`: Handle perubahan input & clear error
- `validateForm()`: Validasi semua field sebelum submit
- `handleSubmit()`: Submit form dengan konfirmasi SweetAlert2
- `handleChangePassword()`: Redirect ke login untuk ubah password
- `handleClose()`: Reset form & tutup modal

---

## 4. Validation Rules

### Frontend Validation (`validateForm()`)

```typescript
1. Firstname:
   - Tidak boleh kosong (trim)
   - Error: "Nama depan tidak boleh kosong"

2. Lastname:
   - Tidak boleh kosong (trim)
   - Error: "Nama belakang tidak boleh kosong"

3. Kelas:
   - Harus diisi
   - Harus number antara 10-12
   - Error: "Kelas harus diisi" / "Kelas harus antara 10-12"
```

### Backend Validation (`authController.updateProfile()`)

```typescript
1. Token Authentication:
   - Cek req.user?.user_id
   - Error 401: "User tidak terautentikasi"

2. Update Data:
   - Cek apakah ada field yang akan diupdate
   - Error 400: "Tidak ada data yang akan diperbarui"

3. Kelas Validation:
   - Convert ke Number
   - Validasi range 10-12
   - Skip update jika invalid (dengan warning log)
```

---

## 5. API Specification

### Endpoint: `PUT /api/auth/update-profile`

**Request:**

```http
PUT /api/auth/update-profile
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "firstname": "string",
  "lastname": "string",
  "kelas": number (10-12)
}
```

**Response Success (200):**

```json
{
  "success": true,
  "data": {
    "user_id": "string",
    "firstname": "string",
    "lastname": "string",
    "email": "string",
    "role": "string",
    "kelas": number,
    "created_at": "datetime",
    "updated_at": "datetime"
  },
  "message": "Profil berhasil diperbarui"
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "Tidak ada data yang akan diperbarui"
}
```

**Response Error (401/403):**

```json
{
  "success": false,
  "message": "User tidak terautentikasi"
}
```

---

## 6. Database Operation

### Table: `User`

**Update Query:**

```sql
UPDATE User
SET
  firstname = ?,
  lastname = ?,
  kelas = ?,
  updated_at = CURRENT_TIMESTAMP
WHERE user_id = ?
```

**Prisma Operation:**

```typescript
const updatedUser = await prisma.user.update({
  where: { user_id: userId },
  data: {
    firstname: updateData.firstname,
    lastname: updateData.lastname,
    kelas: updateData.kelas,
  },
});
```

---

## 7. Special Features

### 7.1 Ubah Password Flow

```
1. User klik "Ubah Password" button (yellow)
2. SweetAlert2 konfirmasi: "Mengubah password akan mengeluarkan Anda"
3. Jika konfirmasi:
   - TokenManager.logout()
   - localStorage.clear()
   - navigate("/login")
   - toast.success("Silakan login kembali untuk mengubah password")
4. User diarahkan ke Login page dengan state reset
```

### 7.2 Profile Updated Event

```typescript
// Dispatch event setelah update berhasil
window.dispatchEvent(new Event("profileUpdated"));

// Header component listen event ini untuk refresh nama user
useEffect(() => {
  const handleProfileUpdate = () => {
    fetchUserData(); // Refresh user data di Header
  };

  window.addEventListener("profileUpdated", handleProfileUpdate);
  return () =>
    window.removeEventListener("profileUpdated", handleProfileUpdate);
}, []);
```

### 7.3 Error Handling

```typescript
1. Validation Errors:
   - Set errors state
   - Tampilkan error di bawah input field
   - Toast: "Mohon periksa input Anda"

2. Token Expired (401/403):
   - Auto logout
   - Navigate ke login
   - Toast: "Token expired. Silakan login kembali."

3. Network/Server Error:
   - Toast: error.response?.data?.message
   - Fallback: "Gagal memperbarui profil"

4. Submitting State:
   - Disable all inputs & buttons
   - Button text: "Menyimpan..."
```

---

## 8. User Experience Flow

### Happy Path:

```
1. User buka halaman Profil ✅
2. Klik "Ubah Profil" ✅
3. Modal muncul dengan data saat ini ✅
4. User ubah firstname "John" → "Jane" ✅
5. User ubah kelas 10 → 11 ✅
6. Klik "Simpan" ✅
7. SweetAlert2 konfirmasi muncul ✅
8. User klik "Ya, simpan perubahan" ✅
9. Loading state (button disabled) ✅
10. Update berhasil ✅
11. Toast success muncul ✅
12. Header name auto-refresh ✅
13. Modal tertutup ✅
14. Data profil di page ter-refresh ✅
```

### Error Path - Validation:

```
1. User kosongkan firstname ❌
2. Klik "Simpan" ❌
3. Validasi gagal ❌
4. Error muncul: "Nama depan tidak boleh kosong" ❌
5. Toast: "Mohon periksa input Anda" ❌
6. User tidak bisa submit ❌
7. User isi firstname ✅
8. Error hilang otomatis ✅
9. Submit berhasil ✅
```

### Error Path - Token Expired:

```
1. User submit form ✅
2. Request ke backend ✅
3. Backend return 401 Unauthorized ❌
4. Frontend detect token expired ❌
5. Auto logout ✅
6. Toast: "Token expired. Silakan login kembali." ✅
7. Redirect ke login page ✅
```

### Ubah Password Path:

```
1. User klik "Ubah Password" ⚠️
2. SweetAlert2: "Mengubah password akan mengeluarkan Anda" ⚠️
3. User klik "Ya, ubah password" ✅
4. Logout & clear localStorage ✅
5. Toast: "Silakan login kembali" ✅
6. Redirect ke login page ✅
7. User bisa reset password di login page ✅
```

---

## 9. State Management Summary

### ProfilPage States:

| State         | Type                  | Purpose                       |
| ------------- | --------------------- | ----------------------------- |
| `userProfile` | `UserProfile \| null` | Menyimpan data profil user    |
| `loading`     | `boolean`             | Loading state saat fetch data |
| `showModal`   | `boolean`             | Toggle modal edit profil      |

### ModalEditProfile States:

| State        | Type                             | Purpose                    |
| ------------ | -------------------------------- | -------------------------- |
| `formData`   | `{ firstname, lastname, kelas }` | Form input values          |
| `submitting` | `boolean`                        | Disable inputs saat submit |
| `errors`     | `Record<string, string>`         | Validation error messages  |

---

## 10. Security Features

1. **JWT Token Authentication**: Setiap request pakai Bearer token
2. **Token Expiration Handling**: Auto logout jika token expired
3. **Input Sanitization**: Trim whitespace, validate types
4. **Password Exclusion**: Password tidak pernah dikembalikan di response
5. **Confirmation Dialog**: SweetAlert2 untuk konfirmasi perubahan penting
6. **Logout Warning**: Konfirmasi sebelum logout untuk ubah password

---

## 11. Integration Points

### Frontend → Backend:

- `PUT /api/auth/update-profile`: Update profil user
- `GET /api/users/{userId}`: Fetch profil user

### Event System:

- `window.dispatchEvent(new Event('profileUpdated'))`: Trigger refresh Header

### Navigation:

- `navigate("/login")`: Redirect ke login untuk ubah password atau token expired

### Toast Notifications:

- Success: "Profil berhasil diperbarui!"
- Error: Validation errors atau API errors
- Info: "Silakan login kembali untuk mengubah password"

---

## 12. Dependencies

### Frontend Libraries:

- `react-router-dom`: Navigation
- `axios`: HTTP requests
- `react-hot-toast`: Toast notifications
- `sweetalert2`: Confirmation dialogs
- `lucide-react`: Icons

### Backend:

- `prisma`: ORM untuk database
- `express`: HTTP server
- `jsonwebtoken`: Token authentication

---

## Conclusion

Flow ini mengimplementasikan **edit profil user** dengan validation lengkap, confirmation dialogs, dan error handling yang robust. Fitur special seperti "Ubah Password" dengan auto-logout dan event dispatcher untuk refresh Header menambah user experience yang seamless.
