# MENGHAPUS DATA MURID - CODE FLOW DOCUMENTATION

## 📋 OVERVIEW

Fitur **Menghapus Data Murid** memungkinkan administrator untuk menghapus data murid yang sudah terdaftar dalam sistem EDUPATH. Fitur ini menyediakan mekanisme konfirmasi untuk mencegah penghapusan data yang tidak disengaja.

---

## 🎯 USE CASE: Menghapus Data Murid

### **Actor**: Admin

### **Preconditions**:

- Admin telah login dengan kredensial admin
- Admin berada di halaman "Kelola Data Murid"
- Terdapat minimal 1 data murid dalam sistem
- Admin telah membuka modal edit untuk murid tertentu

### **Flow**:

1. Admin membuka modal edit data murid yang ingin dihapus
2. Admin menekan tombol **Hapus** di dalam form
3. Sistem menampilkan popup modal konfirmasi penghapusan data murid
4. Admin menekan tombol **Ya** dalam modal konfirmasi
5. Sistem melakukan penghapusan data murid dari database
6. **[Penghapusan berhasil]**: Sistem menampilkan feedback notifikasi penghapusan data berhasil dilakukan
7. **[Penghapusan gagal]**: Sistem menampilkan notifikasi pesan error gagal menghapus data murid

### **Postconditions**:

- Data murid berhasil dihapus dari database
- Daftar murid di halaman diperbarui secara real-time
- Modal ditutup dan admin kembali ke halaman daftar murid

---

## 🎨 ACTIVITY DIAGRAM FLOW

```
┌─────────────────────────────────────────────────────────────────────┐
│ START (from Edit Modal)                                              │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                    ┌───────────▼──────────────────────────────┐
                    │ Admin menekan tombol 'Hapus' di dalam    │
                    │ form                                     │
                    └───────────┬──────────────────────────────┘
                                │
                    ┌───────────▼──────────────────────────────────┐
                    │ Sistem menampilkan popup modal konfirmasi   │
                    │ penghapusan data murid                       │
                    └───────────┬──────────────────────────────────┘
                                │
                    ┌───────────▼──────────────────────────────┐
                    │ Admin menekan tombol 'Ya' dalam modal    │
                    │ konfirmasi                               │
                    └───────────┬──────────────────────────────┘
                                │
                    ┌───────────▼──────────────────────────────┐
                    │ Sistem melakukan penghapusan data murid  │
                    └───────────┬──────────────────────────────┘
                                │
                    ┌───────────▼──────────┐
                    │ [Penghapusan sukses?]│
                    └─────┬────────────┬───┘
                    GAGAL │            │ BERHASIL
          ┌───────────────▼──┐    ┌───▼────────────────────────────┐
          │ Sistem menampilkan│    │ Sistem menampilkan feedback    │
          │ notifikasi pesan  │    │ notifikasi penghapusan data    │
          │ error gagal       │    │ berhasil dilakukan             │
          │ menghapus data    │    └───┬────────────────────────────┘
          │ murid             │        │
          └───────────────────┘        │
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
   - Handle delete functionality

2. **EditStudentModal.tsx** (`client/src/pages/admin/kelolaDataMurid/components/EditStudentModal.tsx`)
   - Modal component dengan tombol delete
   - Trigger delete confirmation dialog

### **Backend Components**:

1. **userController.ts** (`server/src/controllers/userController.ts`)

   - `deleteUser()`: Menghapus data user dari database

2. **User Model** (Prisma Schema)
   - Tabel `user` dengan fields: user_id, firstname, lastname, email, role, kelas

---

## Sequence Diagram

```mermaid
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
        KelolaDataMuridPage->>Admin: Display edit form modal

        Admin->>KelolaDataMuridPage: Click 'Hapus' button in form
        KelolaDataMuridPage->>Admin: Display confirmation dialog

        Admin->>KelolaDataMuridPage: Click 'Ya' to confirm deletion

        KelolaDataMuridPage->>userController: deleteUser(user_id)
        userController->>User: findUnique(user_id)
        User-->>userController: Return user data

        alt User not found
            userController-->>KelolaDataMuridPage: Return error
            KelolaDataMuridPage->>Admin: Display error notification
        else User found
            userController->>User: delete(user_id)
            User-->>userController: Return deleted user
            userController-->>KelolaDataMuridPage: Return success

            KelolaDataMuridPage->>KelolaDataMuridPage: Update local state (remove student)
            KelolaDataMuridPage->>KelolaDataMuridPage: Close modal
            KelolaDataMuridPage->>Admin: Display success notification
        end
    end
```

## Data Flow Details

### 1. Delete Button Click (Open Confirmation)

**Frontend Handler**:

```typescript
const handleDelete = async (studentId: string) => {
  Swal.fire({
    title: "Yakin ingin menghapus data murid ini?",
    text: "Tindakan ini tidak dapat dibatalkan!",
    imageUrl: warningIcon,
    imageWidth: 80,
    imageHeight: 90,
    showCancelButton: true,
    confirmButtonColor: "var(--primary)",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const token = TokenManager.getToken();
        await axios.delete(`${API_URL}/api/users/${studentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // Update local state
        setStudents(students.filter((s) => s.user_id !== studentId));

        toast.success("Data murid berhasil dihapus");
        handleCloseModal();
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Gagal menghapus data murid");
      }
    }
  });
};
```

**Confirmation Dialog (SweetAlert2)**:

- Title: "Yakin ingin menghapus data murid ini?"
- Text: "Tindakan ini tidak dapat dibatalkan!"
- Custom warning icon
- Cancel button untuk membatalkan
- Confirm button untuk melanjutkan penghapusan

---

### 2. Delete User Data (After Confirmation)

**Request**:

```http
DELETE /api/users/:id
Headers:
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
```

**Backend Processing**:

```typescript
async deleteUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

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

    // Delete user
    await prisma.user.delete({
      where: { user_id: id },
    });

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
```

**Response (Success)**:

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Response (Error - User Not Found)**:

```json
{
  "success": false,
  "message": "User not found"
}
```

**Response (Error - Internal Server)**:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

**Frontend State Update**:

```typescript
// Remove deleted student from local state
setStudents(students.filter((s) => s.user_id !== studentId));

toast.success("Data murid berhasil dihapus");
handleCloseModal();
```

---

## 🔌 API ENDPOINTS

### **DELETE /api/users/:id**

- **Purpose**: Menghapus data user dari database
- **Auth**: Required (JWT Token)
- **Params**: `id` - User ID
- **Response**: Success/error message

---

## ✨ KEY FEATURES

### **1. Confirmation Dialog**

- SweetAlert2 dialog sebelum menghapus data
- Warning message yang jelas tentang tindakan permanen
- User bisa membatalkan dengan klik "Cancel"
- Custom warning icon untuk visual feedback

### **2. Cascade Deletion**

- Data murid dihapus dari database
- Related data (jika ada) juga dihapus sesuai cascade rules
- Prevent orphaned records

### **3. Optimistic UI Update**

- State lokal diupdate langsung setelah API success
- Student dihapus dari list tanpa perlu refresh
- Instant feedback untuk user experience yang lebih baik

### **4. Error Handling**

- Toast notification untuk success/error messages
- Console error logging untuk debugging
- Graceful error handling dengan user-friendly messages

### **5. Modal Auto-Close**

- Modal otomatis tertutup setelah penghapusan berhasil
- User langsung kembali ke halaman daftar murid
- Clean state management

---

## 🔐 SECURITY CONSIDERATIONS

1. **JWT Authentication**: Setiap request memerlukan valid JWT token
2. **Authorization Headers**: Token dikirim via Authorization header
3. **Role-based Access**: Hanya admin yang bisa menghapus data murid
4. **Confirmation Required**: Double confirmation untuk mencegah penghapusan tidak sengaja
5. **Error Messages**: Generic error messages untuk menghindari information leakage

---

## 🎨 UI/UX FEATURES

### **Delete Button Design**:

- Red/destructive color untuk indikasi bahaya
- Posisi di bagian bawah modal (secondary action)
- Clear label "Hapus" atau dengan icon trash

### **Confirmation Dialog**:

- Clear warning message
- Emphasize permanence of action
- Two-step confirmation (click button → confirm in dialog)
- Visual warning icon

### **Visual Feedback**:

- Toast notification untuk sukses/error
- Loading state saat proses delete
- Immediate removal dari list setelah sukses
- Modal auto-close

---

## 🔄 STATE MANAGEMENT

### **Delete Flow**:

1. User clicks delete: `handleDelete()` → show confirmation dialog
2. User confirms: API call → `DELETE /api/users/:id`
3. Success response: update `students` state (filter out deleted student)
4. Close modal: `handleCloseModal()`
5. Show success toast

---

## 📚 RELATED FILES

### **Frontend**:

- `client/src/pages/admin/kelolaDataMurid/KelolaDataMurid.tsx`
- `client/src/pages/admin/kelolaDataMurid/components/EditStudentModal.tsx`
- `client/src/utils/tokenManager.ts`

### **Backend**:

- `server/src/controllers/userController.ts`
- `server/src/routes/userRoutes.ts`
- `server/prisma/schema.prisma`

---

## 🐛 COMMON ISSUES & SOLUTIONS

### **Issue 1: Delete button tidak muncul**

- **Cause**: User tidak memiliki permission admin
- **Solution**: Pastikan user login sebagai admin

### **Issue 2: "User not found" error**

- **Cause**: User ID tidak valid atau sudah dihapus
- **Solution**: Refresh halaman untuk mendapatkan data terbaru

### **Issue 3: Token expired**

- **Cause**: JWT token sudah expired
- **Solution**: User akan diredirect ke login page otomatis

### **Issue 4: Delete failed silently**

- **Cause**: Network error atau server error
- **Solution**: Check console logs, retry operation

---

## 🚀 FUTURE IMPROVEMENTS

1. **Soft Delete**: Implementasi soft delete untuk recovery capability
2. **Bulk Delete**: Kemampuan untuk delete multiple students sekaligus
3. **Delete History**: Track penghapusan dengan timestamp dan admin info
4. **Restore Feature**: Fitur untuk restore deleted data dalam periode tertentu
5. **Cascade Preview**: Show preview of related data yang akan dihapus
6. **Audit Trail**: Log all delete operations untuk compliance

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Maintainer**: EDUPATH Development Team
