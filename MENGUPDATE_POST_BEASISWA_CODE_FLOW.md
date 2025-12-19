# MENGUPDATE POST INFORMASI BEASISWA - CODE FLOW DOCUMENTATION

## 📋 OVERVIEW

Fitur **Mengupdate Post Informasi Beasiswa** memungkinkan administrator untuk mengubah/memperbarui informasi beasiswa yang sudah ada dalam sistem EDUPATH. Fitur ini menyediakan form edit yang tervalidasi dengan data beasiswa yang sudah tersimpan sebelumnya.

---

## 🎯 USE CASE: Mengupdate Post Informasi Beasiswa

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
8. Admin menekan tombol **Edit** untuk post informasi beasiswa yang ingin diubah
9. Sistem menampilkan form untuk mengubah data post informasi beasiswa
10. Sistem mengambil data post yang sudah tersimpan sebelumnya
11. Admin mengisi form dengan data baru yang ingin ditambahkan
12. Admin menekan tombol **Update**
13. Sistem melakukan validasi data input fields
14. **[Validasi gagal]**: Sistem menampilkan pesan error data belum sesuai
15. **[Validasi berhasil]**: Sistem menyimpan data post beasiswa terbaru kedalam database
16. **[Berhasil disimpan]**: Sistem menampilkan notifikasi perubahan post beasiswa berhasil
17. **[Gagal disimpan]**: Sistem menampilkan notifikasi pesan error post gagal disimpan

### **Postconditions**:

- Data beasiswa berhasil diperbarui di database
- Daftar beasiswa di halaman diperbarui secara real-time
- Modal ditutup dan admin kembali ke halaman daftar beasiswa

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
          └───────────────────┘        │
                                       │
                                  ┌────▼──────────────────────────┐
                                  │ Admin menekan tombol 'Edit'   │
                                  │ untuk post informasi beasiswa │
                                  │ yang ingin diubah             │
                                  └────┬──────────────────────────┘
                                       │
                                  ┌────▼──────────────────────────┐
                                  │ Sistem menampilkan form untuk │
                                  │ mengubah data post informasi  │
                                  │ beasiswa                      │
                                  └────┬──────────────────────────┘
                                       │
                                  ┌────▼──────────────────────────┐
                                  │ Sistem mengambil data post    │
                                  │ yang sudah tersimpan          │
                                  │ sebelumnya                    │
                                  └────┬──────────────────────────┘
                                       │
                                  ┌────▼──────────────────────────┐
                                  │ Admin mengisi form dengan     │
                                  │ data baru yang ingin          │
                                  │ ditambahkan                   │
                                  └────┬──────────────────────────┘
                                       │
                                  ┌────▼──────────────────────────┐
                                  │ Admin menekan tombol 'Update' │
                                  └────┬──────────────────────────┘
                                       │
                                  ┌────▼──────────────────────────┐
                                  │ Validasi data input fields    │
                                  └─────┬────────────┬────────────┘
                                  GAGAL │            │ BERHASIL
                      ┌─────────────────▼──┐    ┌────▼───────────────────────┐
                      │ Sistem menampilkan │    │ Sistem menyimpan data post │
                      │ pesan error data   │    │ beasiswa terbaru kedalam   │
                      │ belum sesuai       │    │ database                   │
                      └────────────────────┘    └────┬───────────┬───────────┘
                                                GAGAL │           │ BERHASIL
                                    ┌─────────────────▼──┐   ┌────▼──────────────────────┐
                                    │ Sistem menampilkan │   │ Sistem menampilkan        │
                                    │ notifikasi pesan   │   │ notifikasi perubahan      │
                                    │ error post gagal   │   │ post beasiswa berhasil    │
                                    │ disimpan           │   └────┬──────────────────────┘
                                    └────────────────────┘        │
                                                                  │
                                                             ┌────▼────────────────────┐
                                                             │ Sistem menampilkan      │
                                                             │ notifikasi perubahan    │
                                                             │ post beasiswa berhasil  │
                                                             └────┬────────────────────┘
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
- **React Hook Form** untuk form validation
- **Zod** untuk schema validation
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
   - Handle edit functionality

2. **BeasiswaFormModal.tsx** (`client/src/pages/admin/kelolaBeasiswa/components/BeasiswaFormModal.tsx`)
   - Modal component dengan form input
   - Support create dan update mode
   - Validasi menggunakan Zod
   - Handle submit dan error handling

### **Backend Components**:

1. **beasiswaController.ts** (`server/src/controllers/beasiswaController.ts`)

   - `updateBeasiswa()`: Memperbarui data beasiswa yang sudah ada
   - `getBeasiswaById()`: Mengambil data beasiswa berdasarkan ID

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

        Admin->>KelolaDataBeasiswaPage: Click 'Edit' button for selected beasiswa
        KelolaDataBeasiswaPage->>KelolaDataBeasiswaPage: handleOpenModal(beasiswa)
        KelolaDataBeasiswaPage->>Admin: Display edit form modal with existing data

        Admin->>KelolaDataBeasiswaPage: Fill form with updated data
        Admin->>KelolaDataBeasiswaPage: Click 'Update' button

        KelolaDataBeasiswaPage->>KelolaDataBeasiswaPage: handleSubmit()
        KelolaDataBeasiswaPage->>KelolaDataBeasiswaPage: validateForm()

        alt Validation failed
            KelolaDataBeasiswaPage->>Admin: Display error message (data belum sesuai)
        else Validation successful
            KelolaDataBeasiswaPage->>KelolaDataBeasiswaPage: uploadImageToCloudinary() (if new image)
            KelolaDataBeasiswaPage->>beasiswaController: updateBeasiswa(beasiswa_id, data)
            beasiswaController->>Beasiswa: update(beasiswa_id, data)

            alt Update failed
                Beasiswa-->>beasiswaController: Return error
                beasiswaController-->>KelolaDataBeasiswaPage: Return error
                KelolaDataBeasiswaPage->>Admin: Display error notification (post gagal disimpan)
            else Update successful
                Beasiswa-->>beasiswaController: Return updated beasiswa
                beasiswaController-->>KelolaDataBeasiswaPage: Return success

                KelolaDataBeasiswaPage->>KelolaDataBeasiswaPage: fetchBeasiswa()
                KelolaDataBeasiswaPage->>KelolaDataBeasiswaPage: handleCloseModal()
                KelolaDataBeasiswaPage->>Admin: Display success notification (perubahan post beasiswa berhasil)
            end
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
    const response = await axios.get(`${API_URL}/api/beasiswa`);
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
      data: beasiswa,
    });
  } catch (error: any) {
    console.error("Error fetching beasiswa:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch beasiswa data",
      error: error.message,
    });
  }
};
```

---

### 2. Open Edit Modal with Existing Data

**Frontend Handler**:

```typescript
const handleOpenModal = (beasiswa?: Beasiswa) => {
  if (beasiswa) {
    // Edit mode
    setSelectedBeasiswa(beasiswa);
    setFormData({
      title: beasiswa.title,
      link: beasiswa.link,
      image_url: beasiswa.image_url,
    });
    setImagePreview(beasiswa.image_url);
  }
  setImageFile(null);
  setErrors({});
  setIsModalOpen(true);
};
```

**State Management**:

- `selectedBeasiswa`: Store beasiswa object yang akan diedit
- `formData`: Pre-fill dengan data existing
- `imagePreview`: Show current image dari beasiswa

---

### 3. Update Beasiswa Post

**Frontend Handler**:

```typescript
const handleSubmit = async () => {
  // Validate form first
  const isValid = await validateForm();
  if (!isValid) return;

  try {
    setIsUploading(true);
    let imageUrl = formData.image_url;

    // Upload new image if file is selected
    if (imageFile) {
      try {
        imageUrl = await uploadImageToCloudinary(imageFile, "edupath/beasiswa");
      } catch (error: any) {
        toast.error(error.message || "Gagal mengupload gambar");
        setIsUploading(false);
        return;
      }
    }

    const payload = {
      title: formData.title.trim(),
      link: formData.link.trim(),
      image_url: imageUrl,
    };

    const token = TokenManager.getToken();
    const authHeader = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    // Update existing
    await axios.put(
      `${API_URL}/api/beasiswa/${selectedBeasiswa.beasiswa_id}`,
      payload,
      authHeader
    );
    toast.success("Beasiswa berhasil diperbarui");

    fetchBeasiswa();
    handleCloseModal();
  } catch (error: any) {
    console.error("Error saving beasiswa:", error);
    toast.error(error.response?.data?.message || "Gagal menyimpan beasiswa");
  } finally {
    setIsUploading(false);
  }
};
```

**Request**:

```http
PUT /api/beasiswa/:id
Headers:
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json

Body:
{
  "title": "Beasiswa Unggulan Kemendikbud 2025 (Updated)",
  "image_url": "https://res.cloudinary.com/edupath/beasiswa/updated-image.jpg",
  "link": "https://beasiswa.kemdikbud.go.id/unggulan-2025"
}
```

**Backend Processing**:

```typescript
export const updateBeasiswa = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, image_url, link } = req.body;

    const beasiswa = await prisma.beasiswa.update({
      where: {
        beasiswa_id: id,
      },
      data: {
        ...(title && { title }),
        ...(image_url && { image_url }),
        ...(link && { link }),
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
      message: "Beasiswa updated successfully",
      data: beasiswa,
    });
  } catch (error: any) {
    console.error("Error updating beasiswa:", error);

    if (error.message === "Beasiswa not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update beasiswa",
      error: error.message,
    });
  }
};
```

**Response (Success)**:

```json
{
  "success": true,
  "message": "Beasiswa updated successfully",
  "data": {
    "beasiswa_id": "uuid-here",
    "title": "Beasiswa Unggulan Kemendikbud 2025 (Updated)",
    "image_url": "https://res.cloudinary.com/edupath/beasiswa/updated-image.jpg",
    "link": "https://beasiswa.kemdikbud.go.id/unggulan-2025",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-20T14:20:00.000Z"
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
  "message": "Failed to update beasiswa",
  "error": "Error details"
}
```

---

## 🔌 API ENDPOINTS

### **GET /api/beasiswa**

- **Purpose**: Mengambil semua data beasiswa
- **Auth**: Required (JWT Token)
- **Response**: Array of beasiswa objects

### **PUT /api/beasiswa/:id**

- **Purpose**: Memperbarui beasiswa yang sudah ada
- **Auth**: Required (JWT Token)
- **Params**: `id` - Beasiswa ID
- **Body**: Beasiswa data (title, image_url, link)
- **Response**: Updated beasiswa object

---

## ✨ KEY FEATURES

### **1. Form Validation**

- React Hook Form untuk handling form state
- Zod schema validation
- Real-time validation feedback
- Required field indicators

### **2. Image Upload**

- Cloudinary integration untuk upload gambar
- Image preview dengan existing image
- Optional image update (keep old if not changed)
- Supported formats: All image types
- Max file size: 5MB validation

### **3. Pre-filled Form**

- Form automatically populated dengan data existing
- Show current image preview
- Easy to see what's being changed
- Preserve unchanged fields

### **4. Optimistic UI Update**

- Updated beasiswa langsung muncul di list
- Instant feedback tanpa refresh
- Better user experience

### **5. Error Handling**

- Toast notification untuk success/error
- Field-level error messages with Zod validation
- Network error handling
- Image upload error handling
- 404 handling for beasiswa not found

---

## 🔐 SECURITY CONSIDERATIONS

1. **JWT Authentication**: Setiap request memerlukan valid JWT token
2. **Authorization Headers**: Token dikirim via Authorization header
3. **Role-based Access**: Hanya admin yang bisa mengupdate beasiswa
4. **Input Validation**: Server-side validation untuk semua input
5. **SQL Injection Prevention**: Prisma ORM handles parameterization
6. **XSS Prevention**: Sanitize user input before rendering
7. **Beasiswa Ownership**: Verify beasiswa exists before update

---

## 🎨 UI/UX FEATURES

### **Edit Button Design**:

- Yellow/warning color untuk edit action
- Icon + text label "Edit"
- Positioned di action column

### **Form Modal**:

- Same modal component untuk create dan edit
- Pre-filled dengan data existing untuk edit mode
- Title changes: "Tambah Beasiswa" vs "Edit Beasiswa"
- Clear field labels dengan asterisk (\*) untuk required
- Submit button text: "Simpan" (create) vs "Update" (edit)
- Cancel button untuk close modal

### **Visual Feedback**:

- Loading state saat submit
- Toast notification untuk sukses/error
- Disabled state untuk button saat processing
- Form pre-populated dengan existing data

---

## 🔄 STATE MANAGEMENT

### **Edit Flow**:

1. User clicks "Edit" pada beasiswa card
2. Modal opens dengan data pre-filled
3. User modifies data (optional new image)
4. User clicks "Update"
5. Validation check: Show errors if any
6. Image upload (if new image selected)
7. API call: `PUT /api/beasiswa/:id`
8. Success response: Update `beasiswaList` state
9. Close modal: `handleCloseModal()`
10. Show success toast: "Beasiswa berhasil diperbarui"

---

## 📚 RELATED FILES

### **Frontend**:

- `client/src/pages/admin/kelolaBeasiswa/KelolaDataBeasiswa.tsx`
- `client/src/pages/admin/kelolaBeasiswa/components/BeasiswaFormModal.tsx`
- `client/src/schema/BeasiswaSchema.tsx`
- `client/src/utils/tokenManager.ts`
- `client/src/utils/cloudinary.ts`

### **Backend**:

- `server/src/controllers/beasiswaController.ts`
- `server/src/routes/beasiswaRoutes.ts`
- `server/prisma/schema.prisma`

---

## 🐛 COMMON ISSUES & SOLUTIONS

### **Issue 1: Form tidak tersubmit**

- **Cause**: Validation errors pada field
- **Solution**: Check field validation, fix errors yang ditampilkan

### **Issue 2: Image upload gagal**

- **Cause**: File size terlalu besar atau format tidak supported
- **Solution**: Compress image atau gunakan format yang didukung

### **Issue 3: "Beasiswa not found" error**

- **Cause**: Beasiswa ID tidak valid atau sudah dihapus
- **Solution**: Refresh halaman untuk mendapatkan data terbaru

### **Issue 4: Token expired**

- **Cause**: JWT token sudah expired
- **Solution**: User akan diredirect ke login page otomatis

### **Issue 5: Image tidak berubah padahal upload baru**

- **Cause**: Cloudinary upload gagal tapi tidak error
- **Solution**: Check network, retry upload

---

## 🚀 FUTURE IMPROVEMENTS

1. **Version History**: Track changes dan bisa rollback ke versi sebelumnya
2. **Bulk Edit**: Edit multiple beasiswa sekaligus
3. **Draft Changes**: Save draft before publish
4. **Image Comparison**: Side-by-side old vs new image
5. **Change Preview**: Preview changes before save
6. **Audit Log**: Track who changed what and when
7. **Undo Feature**: Undo recent changes
8. **Conflict Detection**: Detect if another admin edited same beasiswa

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Maintainer**: EDUPATH Development Team
