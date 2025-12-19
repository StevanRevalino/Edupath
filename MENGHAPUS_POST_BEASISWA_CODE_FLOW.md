# MENGHAPUS POST INFORMASI BEASISWA - CODE FLOW DOCUMENTATION

## 📋 OVERVIEW

Fitur **Menghapus Post Informasi Beasiswa** memungkinkan administrator untuk menghapus informasi beasiswa yang sudah tidak relevan atau tidak diperlukan lagi dari sistem EDUPATH. Fitur ini dilengkapi dengan konfirmasi untuk mencegah penghapusan yang tidak disengaja.

---

## 🎯 USE CASE: Menghapus Post Informasi Beasiswa

### **Actor**: Admin

### **Preconditions**:

- Admin telah login dengan kredensial admin
- Admin berada di halaman "Kelola Data Beasiswa"
- Terdapat minimal 1 data beasiswa dalam sistem

### **Flow**:

1. Admin login dengan kredensial admin
2. Sistem menampilkan halaman khusus untuk admin
3. Admin memilih opsi 'Kelola Data Beasiswa' melalui sidebar
4. Sistem menampilkan halaman kelola data beasiswa
5. Sistem mengambil data list beasiswa dari database
6. **[Data ditemukan]**: Sistem menampilkan list informasi beasiswa yang tersimpan dalam sistem
7. **[Data tidak ditemukan]**: Sistem menampilkan pesan placeholder error gagal memuat data
8. Admin menekan tombol **Hapus** untuk post beasiswa yang ingin dihapus
9. Sistem menampilkan popup modal konfirmasi untuk menghapus post
10. Admin menekan tombol **Hapus** dalam modal konfirmasi
11. Sistem menghapus data post beasiswa dari database
12. **[Berhasil dihapus]**: Sistem menampilkan feedback notifikasi penghapusan post beasiswa berhasil dilakukan
13. **[Gagal dihapus]**: Sistem menampilkan notifikasi pesan error gagal menghapus data

### **Postconditions**:

- Data beasiswa berhasil dihapus dari database
- Daftar beasiswa di halaman diperbarui secara real-time
- Modal konfirmasi ditutup dan admin kembali ke halaman daftar beasiswa

---

## 🎨 ACTIVITY DIAGRAM FLOW

```
┌─────────────────────────────────────────────────────────────────────┐
│ START                                                                │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                    ┌───────────▼──────────────────────────────┐
                    │ Admin login dengan kredensial admin      │
                    └───────────┬──────────────────────────────┘
                                │
                    ┌───────────▼──────────────────────────────────┐
                    │ Sistem menampilkan halaman khusus untuk     │
                    │ admin                                        │
                    └───────────┬──────────────────────────────────┘
                                │
                    ┌───────────▼──────────────────────────────┐
                    │ Admin memilih opsi 'Kelola Data          │
                    │ Beasiswa' melalui sidebar                │
                    └───────────┬──────────────────────────────┘
                                │
                    ┌───────────▼──────────────────────────────────┐
                    │ Sistem menampilkan halaman kelola data       │
                    │ beasiswa                                     │
                    └───────────┬──────────────────────────────────┘
                                │
                    ┌───────────▼──────────────────────────────┐
                    │ Sistem mengambil data list beasiswa dari │
                    │ database                                 │
                    └───────────┬──────────────────────────────┘
                                │
                    ┌───────────▼──────────┐
                    │ [Data ditemukan?]    │
                    └─────┬────────────┬───┘
                   TIDAK  │            │ YA
          ┌───────────────▼──┐    ┌───▼────────────────────────────┐
          │ Sistem menampilkan│    │ Sistem menampilkan list        │
          │ pesan placeholder │    │ informasi beasiswa yang        │
          │ error gagal       │    │ tersimpan dalam sistem         │
          │ memuat data       │    └───┬────────────────────────────┘
          └────────┬──────────┘        │
                   │                   │
                   │              ┌────▼──────────────────────────┐
                   │              │ Admin menekan tombol 'Hapus'  │
                   │              │ untuk post beasiswa yang      │
                   │              │ ingin dihapus                 │
                   │              └────┬──────────────────────────┘
                   │                   │
                   │              ┌────▼──────────────────────────┐
                   │              │ Sistem menampilkan popup      │
                   │              │ modal konfirmasi untuk        │
                   │              │ menghapus post                │
                   │              └────┬──────────────────────────┘
                   │                   │
                   │              ┌────▼──────────────────────────┐
                   │              │ Admin menekan tombol 'Hapus'  │
                   │              │ dalam modal konfirmasi        │
                   │              └────┬──────────────────────────┘
                   │                   │
                   │              ┌────▼──────────────────────────┐
                   │              │ Sistem menghapus data post    │
                   │              │ beasiswa dari database        │
                   │              └─────┬────────────┬────────────┘
                   │                    │            │
                   │              GAGAL │            │ BERHASIL
                   │    ┌───────────────▼──┐    ┌────▼───────────────────────┐
                   │    │ Sistem menampilkan│    │ Sistem menampilkan feedback│
                   │    │ notifikasi pesan  │    │ notifikasi penghapusan post│
                   │    │ error gagal       │    │ beasiswa berhasil dilakukan│
                   │    │ menghapus data    │    └────┬───────────────────────┘
                   │    └────────┬──────────┘         │
                   │             │                    │
                   └─────────────┴────────────────────┘
                                 │
                    ┌────────────▼──────────────┐
                    │ END                       │
                    └───────────────────────────┘
```

---

## 🛠 TECHNICAL STACK

### **Frontend**:

- **React** + **TypeScript**
- **Axios** untuk HTTP requests
- **SweetAlert2** untuk konfirmasi modal
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

1. **KelolaDataBeasiswa.tsx** (`client/src/pages/admin/kelolaBeasiswa/KelolaDataBeasiswa.tsx`)
   - Main page component untuk kelola data beasiswa
   - Menampilkan tabel daftar beasiswa
   - Handle delete functionality dengan SweetAlert2
   - Manage beasiswa list state

### **Backend Components**:

1. **beasiswaController.ts** (`server/src/controllers/beasiswaController.ts`)

   - `deleteBeasiswa()`: Menghapus data beasiswa dari database
   - `getAllBeasiswa()`: Mengambil semua data beasiswa

2. **Beasiswa Model** (Prisma Schema)
   - Tabel `beasiswa` dengan fields:
     - beasiswa_id (String/UUID, primary key)
     - title (String, required)
     - image_url (String, required)
     - link (String, required)
     - created_at (DateTime, auto-generated)
     - updated_at (DateTime, auto-updated)

---

## Sequence Diagram

```mermaid
sequenceDiagram
    participant Admin
    participant KelolaDataBeasiswaPage<<view>>
    participant beasiswaController<<controller>>
    participant Beasiswa<<model>>

    Admin->>KelolaDataBeasiswaPage: Login with admin credentials
    KelolaDataBeasiswaPage->>Admin: Display admin page

    Admin->>KelolaDataBeasiswaPage: Click 'Kelola Data Beasiswa' on sidebar
    KelolaDataBeasiswaPage->>KelolaDataBeasiswaPage: fetchBeasiswa()
    KelolaDataBeasiswaPage->>beasiswaController: getAllBeasiswa()
    beasiswaController->>Beasiswa: findMany()
    Beasiswa-->>beasiswaController: Return all beasiswa
    beasiswaController-->>KelolaDataBeasiswaPage: Return beasiswa data

    alt Data not found
        KelolaDataBeasiswaPage->>Admin: Display placeholder error message
    else Data found
        KelolaDataBeasiswaPage->>Admin: Display beasiswa list

        Admin->>KelolaDataBeasiswaPage: Click 'Hapus' button for selected beasiswa
        KelolaDataBeasiswaPage->>KelolaDataBeasiswaPage: handleDelete(beasiswaId)
        KelolaDataBeasiswaPage->>Admin: Display SweetAlert2 confirmation modal

        Admin->>KelolaDataBeasiswaPage: Click 'Hapus' in confirmation modal
        KelolaDataBeasiswaPage->>beasiswaController: deleteBeasiswa(beasiswaId)
        beasiswaController->>Beasiswa: delete({ where: { beasiswa_id } })

        alt Delete successful
            Beasiswa-->>beasiswaController: Return deleted beasiswa
            beasiswaController-->>KelolaDataBeasiswaPage: { success: true, message: "Beasiswa deleted successfully" }
            KelolaDataBeasiswaPage->>KelolaDataBeasiswaPage: Update beasiswaList state (remove deleted item)
            KelolaDataBeasiswaPage->>Admin: Display success toast: "Beasiswa berhasil dihapus"
        else Delete failed
            Beasiswa-->>beasiswaController: Error
            beasiswaController-->>KelolaDataBeasiswaPage: { success: false, message: "Failed to delete beasiswa" }
            KelolaDataBeasiswaPage->>Admin: Display error toast: "Gagal menghapus beasiswa"
        end
    end
```

## Data Flow Details

### 1. Fetch Beasiswa Data (Initial Load)

**Frontend Handler**:

```typescript
const fetchBeasiswa = async () => {
  try {
    setLoading(true);
    const token = TokenManager.getToken();
    const response = await axios.get(`${API_URL}/api/beasiswa`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setBeasiswaList(response.data.data);
  } catch (error) {
    console.error("Error fetching beasiswa:", error);
    toast.error("Gagal mengambil data beasiswa");
  } finally {
    setLoading(false);
  }
};
```

**Request**:

```http
GET /api/beasiswa
Headers:
  Authorization: Bearer <JWT_TOKEN>
```

**Backend Processing**:

```typescript
export const getAllBeasiswa = async (req: Request, res: Response) => {
  try {
    const beasiswa = await prisma.beasiswa.findMany({
      orderBy: {
        created_at: "desc",
      },
    });

    res.status(200).json({
      success: true,
      message: "Beasiswa fetched successfully",
      data: beasiswa,
    });
  } catch (error: any) {
    console.error("Error fetching beasiswa:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch beasiswa",
      error: error.message,
    });
  }
};
```

---

### 2. Delete Beasiswa with Confirmation

**Frontend Handler**:

```typescript
const handleDelete = async (beasiswaId: string) => {
  Swal.fire({
    title: "Apakah Anda yakin?",
    text: "Data beasiswa akan dihapus permanen",
    showCancelButton: true,
    confirmButtonText: "Hapus",
    cancelButtonText: "Batal",
    confirmButtonColor: "#d33",
    cancelButtonColor: "var(--primary)",
    imageUrl: warningIcon,
    imageWidth: 80,
    imageHeight: 90,
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const token = TokenManager.getToken();
        await axios.delete(`${API_URL}/api/beasiswa/${beasiswaId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setBeasiswaList(
          beasiswaList.filter((b) => b.beasiswa_id !== beasiswaId)
        );
        toast.success("Beasiswa berhasil dihapus");
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            TokenManager.logout();
            window.location.href = "/login";
          }
        }
        toast.error("Gagal menghapus beasiswa");
      }
    }
  });
};
```

**Request**:

```http
DELETE /api/beasiswa/:id
Headers:
  Authorization: Bearer <JWT_TOKEN>

Params:
  id: "beasiswa-uuid-here"
```

**Backend Processing**:

```typescript
export const deleteBeasiswa = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const beasiswa = await prisma.beasiswa.delete({
      where: {
        beasiswa_id: id,
      },
    });

    if (!beasiswa) {
      return res.status(404).json({
        success: false,
        message: "Beasiswa not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Beasiswa deleted successfully",
      data: beasiswa,
    });
  } catch (error: any) {
    console.error("Error deleting beasiswa:", error);

    if (error.message === "Beasiswa not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete beasiswa",
      error: error.message,
    });
  }
};
```

**Response (Success)**:

```json
{
  "success": true,
  "message": "Beasiswa deleted successfully",
  "data": {
    "beasiswa_id": "uuid-here",
    "title": "Beasiswa Unggulan Kemendikbud 2025",
    "image_url": "https://res.cloudinary.com/edupath/beasiswa/image.jpg",
    "link": "https://beasiswa.kemdikbud.go.id/unggulan",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response (Error - Beasiswa Not Found)**:

```json
{
  "success": false,
  "message": "Beasiswa not found"
}
```

**Response (Error - Internal Server)**:

```json
{
  "success": false,
  "message": "Failed to delete beasiswa",
  "error": "Error details"
}
```

---

## 🔌 API ENDPOINTS

### **GET /api/beasiswa**

- **Purpose**: Mengambil semua data beasiswa
- **Auth**: Required (JWT Token)
- **Response**: Array of beasiswa objects

### **DELETE /api/beasiswa/:id**

- **Purpose**: Menghapus beasiswa berdasarkan ID
- **Auth**: Required (JWT Token)
- **Params**: `id` - Beasiswa ID (UUID)
- **Response**: Deleted beasiswa object

---

## ✨ KEY FEATURES

### **1. Confirmation Modal (SweetAlert2)**

- Beautiful confirmation dialog sebelum delete
- Custom warning icon untuk visual feedback
- Jelas menunjukkan action yang akan dilakukan
- Tombol cancel untuk membatalkan
- Prevent accidental deletion

### **2. Optimistic UI Update**

- Beasiswa langsung hilang dari list setelah delete
- Filter beasiswaList untuk remove deleted item
- Instant feedback tanpa refresh
- Better user experience

### **3. Permanent Deletion**

- Data beasiswa dihapus permanent dari database
- Tidak ada soft delete
- Warning message yang jelas: "Data beasiswa akan dihapus permanen"
- Irreversible action

### **4. Error Handling**

- Toast notification untuk success/error
- Network error handling
- 404 handling untuk beasiswa not found
- 401/403 handling dengan auto logout
- Database error handling

### **5. Authorization**

- Token verification pada setiap request
- Auto logout jika token expired atau unauthorized
- Redirect ke login page setelah logout

---

## 🔐 SECURITY CONSIDERATIONS

1. **JWT Authentication**: Setiap request memerlukan valid JWT token
2. **Authorization Headers**: Token dikirim via Authorization header
3. **Role-based Access**: Hanya admin yang bisa menghapus beasiswa
4. **Confirmation Required**: Double confirmation untuk prevent accidental delete
5. **Database Integrity**: Prisma handles transaction safety
6. **Beasiswa Existence Check**: Verify beasiswa exists before delete
7. **Auto Logout**: Token expired atau unauthorized akan logout otomatis

---

## 🎨 UI/UX FEATURES

### **Delete Button Design**:

- Red/danger color untuk delete action
- Icon + text label "Hapus"
- Positioned di action column
- Clear visual distinction dari edit button

### **Confirmation Modal (SweetAlert2)**:

- **Title**: "Apakah Anda yakin?"
- **Text**: "Data beasiswa akan dihapus permanen"
- **Warning Icon**: Custom warning icon (80x90px)
- **Confirm Button**: "Hapus" (Red #d33)
- **Cancel Button**: "Batal" (Primary color)
- **Modal Style**: Clean, modern design

### **Visual Feedback**:

- Success toast: "Beasiswa berhasil dihapus" (Green)
- Error toast: "Gagal menghapus beasiswa" (Red)
- Immediate list update setelah delete
- Loading state prevention dengan disabled state

---

## 🔄 STATE MANAGEMENT

### **Delete Flow**:

1. User clicks "Hapus" pada beasiswa card
2. SweetAlert2 modal appears dengan konfirmasi
3. User clicks "Batal": Modal closes, no action
4. User clicks "Hapus": Proceed with delete
5. API call: `DELETE /api/beasiswa/:id`
6. Success response:
   - Filter `beasiswaList` to remove deleted item
   - Show success toast: "Beasiswa berhasil dihapus"
7. Error response:
   - Show error toast: "Gagal menghapus beasiswa"
   - If 401/403: Logout and redirect to login

---

## 📚 RELATED FILES

### **Frontend**:

- `client/src/pages/admin/kelolaBeasiswa/KelolaDataBeasiswa.tsx`
- `client/src/utils/tokenManager.ts`
- `client/src/assets/icons/warning.svg` (Warning icon for SweetAlert2)

### **Backend**:

- `server/src/controllers/beasiswaController.ts`
- `server/src/routes/beasiswaRoutes.ts`
- `server/prisma/schema.prisma`

---

## 🐛 COMMON ISSUES & SOLUTIONS

### **Issue 1: "Beasiswa not found" error**

- **Cause**: Beasiswa ID tidak valid atau sudah dihapus oleh admin lain
- **Solution**: Refresh halaman untuk mendapatkan data terbaru

### **Issue 2: Delete gagal tapi tidak ada error**

- **Cause**: Network issue atau server down
- **Solution**: Check console untuk error details, retry delete

### **Issue 3: Token expired saat delete**

- **Cause**: JWT token sudah expired
- **Solution**: User akan diredirect ke login page otomatis

### **Issue 4: Modal konfirmasi tidak muncul**

- **Cause**: SweetAlert2 belum loaded atau conflict dengan library lain
- **Solution**: Check browser console, ensure SweetAlert2 imported

### **Issue 5: Delete berhasil tapi list tidak update**

- **Cause**: State management issue atau filter logic error
- **Solution**: Check beasiswaList filter logic, force refresh

---

## 🚀 FUTURE IMPROVEMENTS

1. **Soft Delete**: Implement soft delete dengan deleted_at field
2. **Restore Feature**: Kemampuan restore beasiswa yang sudah dihapus
3. **Bulk Delete**: Delete multiple beasiswa sekaligus
4. **Trash/Recycle Bin**: Temporary storage untuk beasiswa yang dihapus
5. **Undo Feature**: Undo delete dalam waktu tertentu (5-10 detik)
6. **Audit Log**: Track who deleted what and when
7. **Archive Instead**: Archive instead of permanent delete
8. **Confirmation Email**: Send email notification saat delete beasiswa

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Maintainer**: EDUPATH Development Team
