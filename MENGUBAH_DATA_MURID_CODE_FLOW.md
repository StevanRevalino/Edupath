# MENGUBAH DATA MURID - CODE FLOW DOCUMENTATION

## 📋 OVERVIEW

Fitur **Mengubah Data Murid** memungkinkan administrator untuk mengubah informasi profil murid yang sudah terdaftar dalam sistem EDUPATH. Fitur ini menyediakan antarmuka pengelolaan data dengan validasi input dan konfirmasi perubahan untuk memastikan integritas data.

---

## 🎯 USE CASE: Mengubah Data Murid

### **Actor**: Admin

### **Preconditions**:

- Admin telah login dengan kredensial admin
- Admin berada di halaman "Kelola Data Murid"
- Terdapat minimal 1 data murid dalam sistem

### **Flow**:

1. Admin melihat daftar murid yang tersimpan dalam sistem
2. Admin menekan tombol **Edit** pada murid yang ingin diubah
3. Sistem mengambil data profil murid yang dipilih
4. Sistem menampilkan modal form dengan data profil yang sudah terisi
5. Admin mengubah isi data form (nama depan, nama belakang, atau kelas)
6. Admin menekan tombol **Simpan**
7. Sistem melakukan validasi input:
   - **Jika validasi gagal**: Sistem menampilkan pesan error
   - **Jika validasi berhasil**: Sistem menampilkan konfirmasi SweetAlert2
8. Admin mengonfirmasi perubahan pada dialog konfirmasi
9. Sistem menyimpan perubahan ke database
10. Sistem menampilkan pesan sukses dan memperbarui tampilan daftar murid

### **Postconditions**:

- Data profil murid berhasil diperbarui dalam database
- Daftar murid di halaman diperbarui secara real-time
- Modal ditutup dan admin kembali ke halaman daftar murid

---

## 🎨 ACTIVITY DIAGRAM FLOW

```
┌─────────────────────────────────────────────────────────────────────┐
│ START                                                                │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                    ┌───────────▼──────────┐
                    │ Admin login dengan   │
                    │ kredential admin     │
                    └───────────┬──────────┘
                                │
                    ┌───────────▼──────────────────────────────────┐
                    │ Sistem menampilkan halaman khusus untuk admin│
                    └───────────┬──────────────────────────────────┘
                                │
                    ┌───────────▼──────────────────────────────┐
                    │ Admin memilih opsi 'Kelola Data Murid'  │
                    │ melalui sidebar                          │
                    └───────────┬──────────────────────────────┘
                                │
                    ┌───────────▼──────────────────────────────────┐
                    │ Sistem menampilkan halaman kelola data murid │
                    └───────────┬──────────────────────────────────┘
                                │
                    ┌───────────▼────────────────────────────┐
                    │ Sistem mengambil data murid dari       │
                    │ database                               │
                    └───────────┬────────────────────────────┘
                                │
                    ┌───────────▼──────────┐
                    │ [Data ditemukan?]    │
                    └─────┬────────────┬───┘
                    TIDAK │            │ YA
          ┌───────────────▼──┐    ┌───▼──────────────────────────────┐
          │ Sistem menampilkan│    │ Sistem menampilkan list data     │
          │ pesan placeholder │    │ murid yang tersimpan dalam sistem│
          │ error data murid  │    └───┬──────────────────────────────┘
          │ tidak ditemukan   │        │
          └───────────────────┘        │
                                ┌──────▼──────────────────────────┐
                                │ Admin menekan tombol 'Edit'     │
                                │ untuk murid yang ingin diubah   │
                                └──────┬──────────────────────────┘
                                       │
                                ┌──────▼──────────────────────────────┐
                                │ Sistem mengambil data attribute     │
                                │ profil murid yang dipilih admin     │
                                └──────┬──────────────────────────────┘
                                       │
                                ┌──────▼──────────────────────────────┐
                                │ Sistem menampilkan form untuk       │
                                │ mengubah data murid                 │
                                └──────┬──────────────────────────────┘
                                       │
                                ┌──────▼──────────────────────────────┐
                                │ Sistem mengisi form dengan data     │
                                │ profil yang sudah tersimpan dalam   │
                                │ database                            │
                                └──────┬──────────────────────────────┘
                                       │
                                ┌──────▼──────────────────────────────┐
                                │ Admin mengubah isi data form dengan │
                                │ data terbaru                        │
                                └──────┬──────────────────────────────┘
                                       │
                                ┌──────▼──────────────────────────────┐
                                │ Admin menekan tombol 'Simpan' dalam │
                                │ form                                │
                                └──────┬──────────────────────────────┘
                                       │
                                ┌──────▼────────────────────────┐
                                │ Validasi input data yang      │
                                │ ditambahkan admin             │
                                └──────┬────────────────────────┘
                                       │
                                ┌──────▼───────────┐
                                │ [Validasi valid?]│
                                └───┬──────────┬───┘
                              GAGAL │          │ BERHASIL
                    ┌───────────────▼┐    ┌────▼──────────────────────────┐
                    │ Sistem menampil-│    │ Sistem menampilkan dialog     │
                    │ kan pesan error │    │ konfirmasi SweetAlert2        │
                    │ data belum      │    │ "Apakah anda ingin menyimpan  │
                    │ sesuai          │    │ perubahan?"                   │
                    └───────┬─────────┘    └────┬──────────────────────────┘
                            │                   │
                            │                   │ [Admin konfirmasi]
                            │              ┌────▼──────────────────────────┐
                            │              │ Sistem menyimpan perubahan    │
                            └──────────────┤ data profil murid ke dalam    │
                            (LOOP KEMBALI) │ database                      │
                                           └────┬──────────────────────────┘
                                                │
                                           ┌────▼──────────────────────────┐
                                           │ Sistem menampilkan pesan      │
                                           │ berhasil mengubah data murid  │
                                           └────┬──────────────────────────┘
                                                │
                                           ┌────▼──────┐
                                           │    END    │
                                           └───────────┘
```

---

## 🛠 TECHNICAL STACK

### **Frontend**:

- **React** + **TypeScript**
- **Axios** untuk HTTP requests
- **SweetAlert2** untuk konfirmasi dialog
- **React Hot Toast** untuk notifikasi
- **Tailwind CSS** untuk styling

### **Backend**:

- **Express.js** dengan TypeScript
- **Prisma ORM** untuk database operations
- **PostgreSQL** sebagai database

### **Authentication**:

- **JWT (JSON Web Token)** melalui `TokenManager`

---

## 🏗 ARCHITECTURE COMPONENTS

### **Frontend Components**:

1. **KelolaDataMurid.tsx** (`client/src/pages/admin/kelolaDataMurid/KelolaDataMurid.tsx`)

   - Main page component untuk kelola data murid
   - Menampilkan tabel daftar murid dengan filter kelas
   - Handle edit, delete, dan search functionality

2. **EditStudentModal.tsx** (`client/src/pages/admin/kelolaDataMurid/components/EditStudentModal.tsx`)
   - Modal component untuk edit data murid
   - Form dengan input firstname, lastname, kelas
   - Validasi required fields

### **Backend Components**:

1. **userController.ts** (`server/src/controllers/userController.ts`)

   - `getUserById()`: Mengambil data user berdasarkan ID
   - `updateUser()`: Memperbarui data user

2. **User Model** (Prisma Schema)
   - Tabel `user` dengan fields: user_id, firstname, lastname, email, role, kelas

---

## Sequence Diagram

````mermaid
sequenceDiagram
    participant Admin
    participant KelolaDataMuridPage<<view>>
    participant userController<<controller>>
    participant User<<model>>

    Admin->>KelolaDataMuridPage: Click 'Kelola Data Murid' on sidebar
    KelolaDataMuridPage->>KelolaDataMuridPage: fetchUsers()
    KelolaDataMuridPage->>userController: getAllUsers()
    userController->>User: findMany()
    User-->>userController: Return all users
    userController-->>KelolaDataMuridPage: Return student data

    alt Data not found
        KelolaDataMuridPage->>Admin: Display placeholder error message
    else Data found
        KelolaDataMuridPage->>Admin: Display student data list

        Admin->>KelolaDataMuridPage: Click 'Edit' button for selected student
        KelolaDataMuridPage->>KelolaDataMuridPage: handleEdit(studentId)
        KelolaDataMuridPage->>KelolaDataMuridPage: Get selected student profile data
        KelolaDataMuridPage->>Admin: Display edit form modal
        KelolaDataMuridPage->>Admin: Pre-fill form with existing data

        Admin->>KelolaDataMuridPage: Update form data
        Admin->>KelolaDataMuridPage: Click 'Simpan' button

        KelolaDataMuridPage->>KelolaDataMuridPage: Validate input data

        alt Validation failed
            KelolaDataMuridPage->>Admin: Display error message
        else Validation success
            KelolaDataMuridPage->>Admin: Display confirmation dialog

            Admin->>KelolaDataMuridPage: Confirm changes

            KelolaDataMuridPage->>userController: updateUser(user_id, updatePayload)
            userController->>User: findUnique(user_id)
            User-->>userController: Return existing user
            userController->>User: update(user_id, data)
            User-->>userController: Return updated user
            userController-->>KelolaDataMuridPage: Return success

            KelolaDataMuridPage->>KelolaDataMuridPage: Update local state
            KelolaDataMuridPage->>Admin: Display success message
          end
        end
````

---

### 2. Edit Button Click (Open Modal)

**Frontend State Management**:

```typescript
const handleEdit = (student: Student) => {
  setSelectedStudent(student);
  setEditForm({
    firstname: student.firstname,
    lastname: student.lastname,
    email: student.email,
    kelas: student.kelas,
  });
  setIsModalOpen(true);
};
```

**Modal Display**:

- Form pre-filled dengan data murid yang dipilih
- Email field set sebagai `readOnly`
- Save button disabled jika ada field required yang kosong

---

### 3. Update Student Data (Save Changes)

**Validation Check**:

```typescript
// Tombol "Simpan" disabled jika kondisi ini tidak terpenuhi:
const isFormValid =
  editForm.firstname.trim() !== "" &&
  editForm.lastname.trim() !== "" &&
  editForm.kelas !== null;
```

**Confirmation Dialog (SweetAlert2)**:

```typescript
Swal.fire({
  title: "Apakah anda ingin menyimpan perubahan?",
  imageUrl: warningIcon,
  imageWidth: 80,
  imageHeight: 90,
  showDenyButton: true,
  showCancelButton: false,
  confirmButtonText: "Ya",
  denyButtonText: "Tidak",
  confirmButtonColor: "var(--primary)",
  denyButtonColor: "#d33",
});
```

**Request**:

```http
PUT /api/users/:id
Headers:
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json

Body:
{
  "firstname": "John Updated",
  "lastname": "Doe Updated",
  "kelas": 12
}
```

**Backend Processing**:

```typescript
async updateUser(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const updateData = req.body;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { user_id: id },
  });

  if (!existingUser) {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
    return;
  }

  // Update user
  const updated = await prisma.user.update({
    where: { user_id: id },
    data: updateData,
  });

  res.status(200).json({
    success: true,
    data: {
      user_id: updated.user_id,
      firstname: updated.firstname,
      lastname: updated.lastname,
      email: updated.email,
      role: updated.role,
      kelas: updated.kelas,
    },
    message: "User updated successfully",
  });
}
```

**Response (Success)**:

```json
{
  "success": true,
  "data": {
    "user_id": "uuid-123",
    "firstname": "John Updated",
    "lastname": "Doe Updated",
    "email": "john.doe@example.com",
    "role": "murid",
    "kelas": 12
  },
  "message": "User updated successfully"
}
```

**Frontend State Update**:

```typescript
// Update local state untuk real-time UI update
setStudents(
  students.map((student) =>
    student.user_id === selectedStudent.user_id
      ? {
          ...student,
          firstname: editForm.firstname,
          lastname: editForm.lastname,
          kelas: editForm.kelas,
        }
      : student
  )
);

toast.success("Data murid berhasil diperbarui");
handleCloseModal();
```

**Response (Error - User Not Found)**:

```json
{
  "success": false,
  "message": "User not found"
}
```

---

## 🔌 API ENDPOINTS

### **GET /api/users**

- **Purpose**: Mengambil semua data users (termasuk murid)
- **Auth**: Required (JWT Token)
- **Response**: List of users dengan role 'murid', 'admin', atau 'counselor'

### **GET /api/users/:id**

- **Purpose**: Mengambil data user berdasarkan ID
- **Auth**: Required (JWT Token)
- **Params**: `id` - User ID
- **Response**: Single user object

### **PUT /api/users/:id**

- **Purpose**: Memperbarui data user
- **Auth**: Required (JWT Token)
- **Params**: `id` - User ID
- **Body**: `{ firstname, lastname, kelas }`
- **Response**: Updated user object

---

## ✨ KEY FEATURES

### **1. Real-time Validation**

- Form validation dilakukan on-change
- Save button otomatis disabled jika ada field yang kosong
- Visual indicator dengan asterisk (\*) untuk required fields

### **2. Confirmation Dialog**

- SweetAlert2 dialog sebelum menyimpan perubahan
- User bisa membatalkan perubahan dengan klik "Tidak"
- Custom warning icon untuk visual feedback

### **3. Optimistic UI Update**

- State lokal diupdate langsung setelah API success
- Tidak perlu refresh halaman untuk melihat perubahan
- Instant feedback untuk user experience yang lebih baik

### **4. Error Handling**

- Toast notification untuk success/error messages
- Console error logging untuk debugging
- Graceful error handling dengan user-friendly messages

### **5. Filter by Kelas**

- Tab-based filter untuk kelas 10, 11, 12
- Real-time count untuk setiap kelas
- Visual indicator dengan color-coded tabs

### **6. Search Functionality**

- Real-time search di nama depan, nama belakang, dan email
- Case-insensitive search
- Debounced search untuk performance optimization

---

## 🔐 SECURITY CONSIDERATIONS

1. **JWT Authentication**: Setiap request memerlukan valid JWT token
2. **Authorization Headers**: Token dikirim via Authorization header
3. **Role-based Access**: Hanya admin yang bisa mengakses halaman ini
4. **Input Validation**: Frontend dan backend validation untuk data integrity
5. **Error Messages**: Generic error messages untuk menghindari information leakage

---

## 📝 VALIDATION RULES

### **Firstname**:

- **Required**: Ya
- **Type**: String
- **Validation**: Tidak boleh kosong (trim)

### **Lastname**:

- **Required**: Ya
- **Type**: String
- **Validation**: Tidak boleh kosong (trim)

### **Kelas**:

- **Required**: Ya
- **Type**: Number
- **Validation**: Harus salah satu dari [10, 11, 12]

### **Email**:

- **Required**: Ya (readonly di edit form)
- **Type**: String (email format)
- **Note**: Email tidak bisa diubah melalui form ini

---

## 🎨 UI/UX FEATURES

### **Modal Design**:

- Responsive layout dengan max-width untuk desktop
- Close button (X) di pojok kanan atas
- Save button dengan primary color
- Delete button dengan destructive color (red)

### **Form Layout**:

- Grid layout untuk form fields
- Label dengan required indicator (\*)
- Readonly email field dengan disabled styling
- Dropdown select untuk kelas dengan clear options

### **Visual Feedback**:

- Loading states dengan spinner
- Disabled button states
- Toast notifications untuk actions
- SweetAlert2 dialog untuk confirmations
- Color-coded kelas badges

---

## 🔄 STATE MANAGEMENT

### **Component States**:

```typescript
const [students, setStudents] = useState<Student[]>([]);
const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
const [isModalOpen, setIsModalOpen] = useState(false);
const [editForm, setEditForm] = useState({
  firstname: "",
  lastname: "",
  email: "",
  kelas: null as number | null,
});
const [searchQuery, setSearchQuery] = useState("");
const [selectedKelas, setSelectedKelas] = useState<"all" | number>("all");
```

### **State Flow**:

1. Initial load: `fetchUsers()` → set `students` state
2. Click edit: `handleEdit()` → set `selectedStudent` & `editForm` → open modal
3. Form change: `onChange` → update `editForm` state
4. Save: `handleUpdateStudent()` → API call → update `students` state → close modal

---

## 📚 RELATED FILES

### **Frontend**:

- `client/src/pages/admin/kelolaDataMurid/KelolaDataMurid.tsx`
- `client/src/pages/admin/kelolaDataMurid/components/EditStudentModal.tsx`
- `client/src/handler/userHandler.ts`
- `client/src/utils/tokenManager.ts`

### **Backend**:

- `server/src/controllers/userController.ts`
- `server/src/routes/userRoutes.ts`
- `server/prisma/schema.prisma`

---

## 🐛 COMMON ISSUES & SOLUTIONS

### **Issue 1: Save button tidak bisa diklik**

- **Cause**: Ada field required yang masih kosong
- **Solution**: Pastikan firstname, lastname, dan kelas sudah terisi

### **Issue 2: "User not found" error**

- **Cause**: User ID tidak valid atau user sudah dihapus
- **Solution**: Refresh halaman untuk mendapatkan data terbaru

### **Issue 3: Token expired**

- **Cause**: JWT token sudah expired
- **Solution**: User akan diredirect ke login page otomatis

### **Issue 4: Changes not reflected**

- **Cause**: Local state update failed
- **Solution**: Refresh halaman untuk fetch data terbaru dari server

---

## 🚀 FUTURE IMPROVEMENTS

1. **Bulk Edit**: Kemampuan untuk edit multiple students sekaligus
2. **Field History**: Track perubahan field dengan timestamp
3. **Email Change**: Memungkinkan perubahan email dengan email verification
4. **Profile Picture**: Upload dan edit foto profil murid
5. **Advanced Validation**: Regex validation untuk format nama
6. **Undo Changes**: Fitur untuk undo perubahan dalam session yang sama

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Maintainer**: EDUPATH Development Team
