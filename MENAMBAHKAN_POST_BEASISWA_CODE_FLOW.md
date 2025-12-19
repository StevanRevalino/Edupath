# MENAMBAHKAN POST INFORMASI BEASISWA - CODE FLOW DOCUMENTATION

## 📋 OVERVIEW

Fitur **Menambahkan Post Informasi Beasiswa** memungkinkan administrator untuk menambahkan informasi beasiswa baru ke dalam sistem EDUPATH. Fitur ini menyediakan form input yang tervalidasi untuk memastikan data beasiswa yang ditambahkan lengkap dan akurat.

---

## 🎯 USE CASE: Menambahkan Post Informasi Beasiswa

### **Actor**: Admin

### **Preconditions**:

- Admin telah login dengan kredensial admin
- Admin berada di halaman "Kelola Data Beasiswa"

### **Flow**:

1. Admin login dengan kredensial admin
2. Sistem menampilkan halaman khusus untuk admin
3. Admin memilih opsi 'Kelola Data Beasiswa' melalui sidebar
4. Sistem menampilkan halaman kelola data beasiswa
5. Sistem mengambil data list beasiswa dari database
6. **[Data ditemukan]**: Sistem menampilkan list informasi beasiswa yang tersimpan dalam sistem
7. **[Data tidak ditemukan]**: Sistem menampilkan pesan placeholder error gagal memuat data
8. Admin menekan tombol **Tambah Beasiswa**
9. Sistem menampilkan popup form untuk menambahkan post informasi beasiswa
10. Admin mengisi form dengan data-data yang sesuai
11. Admin menekan tombol **Simpan**
12. Sistem melakukan validasi data input fields
13. **[Validasi gagal]**: Sistem menampilkan pesan error data belum sesuai
14. **[Validasi berhasil]**: Sistem menyimpan data post beasiswa terbaru kedalam database
15. **[Berhasil disimpan]**: Sistem menampilkan notifikasi penambahan post beasiswa berhasil
16. **[Gagal disimpan]**: Sistem menampilkan notifikasi pesan error post gagal disimpan

### **Postconditions**:

- Data beasiswa baru berhasil ditambahkan ke database
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
                                  │ Admin menekan tombol 'Tambah  │
                                  │ Beasiswa'                     │
                                  └────┬──────────────────────────┘
                                       │
                                  ┌────▼──────────────────────────┐
                                  │ Sistem menampilkan popup form │
                                  │ untuk menambahkan post        │
                                  │ informasi beasiswa            │
                                  └────┬──────────────────────────┘
                                       │
                                  ┌────▼──────────────────────────┐
                                  │ Admin mengisi form dengan     │
                                  │ data-data yang sesuai         │
                                  └────┬──────────────────────────┘
                                       │
                                  ┌────▼──────────────────────────┐
                                  │ Admin menekan tombol 'Simpan' │
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
                                    │ notifikasi pesan   │   │ notifikasi penambahan     │
                                    │ error post gagal   │   │ post beasiswa berhasil    │
                                    │ disimpan           │   └────┬──────────────────────┘
                                    └────────────────────┘        │
                                                                  │
                                                             ┌────▼────────────────────┐
                                                             │ Sistem menampilkan      │
                                                             │ notifikasi penambahan   │
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

1. **KelolaDataBeasiswa.tsx** (`client/src/pages/admin/kelolaDataBeasiswa/KelolaDataBeasiswa.tsx`)

   - Main page component untuk kelola data beasiswa
   - Menampilkan tabel daftar beasiswa
   - Handle add functionality

2. **AddBeasiswaModal.tsx** (Component untuk form tambah beasiswa)
   - Modal component dengan form input
   - Validasi menggunakan React Hook Form + Zod
   - Handle submit dan error handling

### **Backend Components**:

1. **beasiswaController.ts** (`server/src/controllers/beasiswaController.ts`)

   - `createBeasiswa()`: Menambahkan data beasiswa baru ke database
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

        Admin->>KelolaDataBeasiswaPage: Click 'Tambah Beasiswa' button
        KelolaDataBeasiswaPage->>KelolaDataBeasiswaPage: handleOpenModal()
        KelolaDataBeasiswaPage->>Admin: Display popup form modal

        Admin->>KelolaDataBeasiswaPage: Fill form with data
        Admin->>KelolaDataBeasiswaPage: Click 'Simpan' button

        KelolaDataBeasiswaPage->>KelolaDataBeasiswaPage: handleSubmit()
        KelolaDataBeasiswaPage->>KelolaDataBeasiswaPage: validateForm()

        alt Validation failed
            KelolaDataBeasiswaPage->>Admin: Display error message (data belum sesuai)
        else Validation successful
            KelolaDataBeasiswaPage->>KelolaDataBeasiswaPage: uploadImageToCloudinary()
            KelolaDataBeasiswaPage->>beasiswaController: createBeasiswa()
            beasiswaController->>Beasiswa: create(data)

            alt Save failed
                Beasiswa-->>beasiswaController: Return error
                beasiswaController-->>KelolaDataBeasiswaPage: Return error
                KelolaDataBeasiswaPage->>Admin: Display error notification (post gagal disimpan)
            else Save successful
                Beasiswa-->>beasiswaController: Return created beasiswa
                beasiswaController-->>KelolaDataBeasiswaPage: Return success

                KelolaDataBeasiswaPage->>KelolaDataBeasiswaPage: fetchBeasiswa()
                KelolaDataBeasiswaPage->>KelolaDataBeasiswaPage: handleCloseModal()
                KelolaDataBeasiswaPage->>Admin: Display success notification (penambahan post beasiswa berhasil)
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

### 2. Add New Beasiswa Post

**Frontend Handler**:

```typescript
const handleSubmit = async () => {
  // Validate form first
  const isValid = await validateForm();
  if (!isValid) return;

  // Check if image is required for new beasiswa
  if (!selectedBeasiswa && !imageFile) {
    setErrors((prev) => ({ ...prev, image_url: "Gambar harus diupload" }));
    toast.error("Gambar harus diupload");
    return;
  }

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

    // Create new
    await axios.post(`${API_URL}/api/beasiswa`, payload, authHeader);
    toast.success("Beasiswa berhasil ditambahkan");

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
POST /api/beasiswa
Headers:
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json

Body:
{
  "title": "Beasiswa Unggulan Kemendikbud 2024",
  "image_url": "https://res.cloudinary.com/edupath/beasiswa/image.jpg",
  "link": "https://beasiswa.kemdikbud.go.id/unggulan"
}
```

**Backend Processing**:

```typescript
export const createBeasiswa = async (req: Request, res: Response) => {
  try {
    const { title, image_url, link } = req.body;

    if (!title || !image_url || !link) {
      return res.status(400).json({
        success: false,
        message: "Title, image URL, and link are required",
      });
    }

    const newBeasiswa = await prisma.beasiswa.create({
      data: {
        title,
        image_url,
        link,
      },
    });

    // Send notification to all students
    try {
      const students = await prisma.user.findMany({
        where: { role: "STUDENT" },
        select: { user_id: true },
      });

      const notifications = students.map((student) => ({
        user_id: student.user_id,
        type: "BEASISWA_NEW",
        title: "Beasiswa Baru Tersedia!",
        message: `Beasiswa baru "${title}" telah ditambahkan. Cek sekarang!`,
        related_id: newBeasiswa.beasiswa_id,
        link: `/user/beasiswa`,
      }));

      await prisma.notification.createMany({ data: notifications });
      console.log(`Sent beasiswa notification to ${students.length} students`);
    } catch (notifError: any) {
      console.error("Error sending beasiswa notifications:", notifError);
    }

    res.status(201).json({
      success: true,
      message: "Beasiswa created successfully",
      data: newBeasiswa,
    });
  } catch (error: any) {
    console.error("Error creating beasiswa:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create beasiswa",
      error: error.message,
    });
  }
};
```

**Response (Success)**:

```json
{
  "success": true,
  "message": "Beasiswa created successfully",
  "data": {
    "beasiswa_id": "uuid-here",
    "title": "Beasiswa Unggulan Kemendikbud 2024",
    "image_url": "https://res.cloudinary.com/edupath/beasiswa/image.jpg",
    "link": "https://beasiswa.kemdikbud.go.id/unggulan",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response (Error - Validation Failed)**:

```json
{
  "success": false,
  "message": "Title, image URL, and link are required"
}
```

**Response (Error - Internal Server)**:

```json
{
  "success": false,
  "message": "Failed to create beasiswa",
  "error": "Error details"
}
```

---

## 🔌 API ENDPOINTS

### **GET /api/beasiswa**

- **Purpose**: Mengambil semua data beasiswa
- **Auth**: Required (JWT Token)
- **Response**: Array of beasiswa objects

### **POST /api/beasiswa**

- **Purpose**: Menambahkan beasiswa baru
- **Auth**: Required (JWT Token)
- **Body**: Beasiswa data (title, image_url, link)
- **Response**: Created beasiswa object + sends notifications to all students

---

## ✨ KEY FEATURES

### **1. Form Validation**

- React Hook Form untuk handling form state
- Zod schema validation
- Real-time validation feedback
- Required field indicators

### **2. Image Upload**

- Cloudinary integration untuk upload gambar
- Image preview sebelum upload
- Supported formats: All image types
- Max file size: 5MB validation
- Image compression before upload

### **3. Notification System**

- Automatically sends notification to all students when new beasiswa is added
- Notification type: BEASISWA_NEW
- Includes beasiswa title and link in notification

### **4. Optimistic UI Update**

- New beasiswa langsung muncul di list
- Instant feedback tanpa refresh
- Better user experience

### **5. Error Handling**

- Toast notification untuk success/error
- Field-level error messages with Zod validation
- Network error handling
- Image upload error handling
- Validation error display

---

## 🔐 SECURITY CONSIDERATIONS

1. **JWT Authentication**: Setiap request memerlukan valid JWT token
2. **Authorization Headers**: Token dikirim via Authorization header
3. **Role-based Access**: Hanya admin yang bisa menambah beasiswa
4. **Input Validation**: Server-side validation untuk semua input
5. **SQL Injection Prevention**: Prisma ORM handles parameterization
6. **XSS Prevention**: Sanitize user input before rendering

---

## 🎨 UI/UX FEATURES

### **Add Button Design**:

- Primary color (var(--primary))
- Icon + text label "Tambah Beasiswa"
- Positioned prominently di header section

### **Form Modal**:

- Clean, organized layout
- Grouped related fields
- Clear field labels dengan asterisk (\*) untuk required
- Submit button disabled saat validasi gagal
- Cancel button untuk close modal

### **Visual Feedback**:

- Loading state saat submit
- Toast notification untuk sukses/error
- Disabled state untuk button saat processing
- Form reset setelah sukses

---

## 🔄 STATE MANAGEMENT

### **Add Flow**:

1. User clicks "Tambah Beasiswa": Show modal
2. User fills form: Real-time validation
3. User clicks "Simpan": Submit handler
4. Validation check: Show errors if any
5. API call: `POST /api/beasiswa`
6. Success response: Update `beasiswaList` state
7. Close modal: `handleCloseModal()`
8. Reset form: `reset()`
9. Show success toast

---

## 📚 RELATED FILES

### **Frontend**:

- `client/src/pages/admin/kelolaDataBeasiswa/KelolaDataBeasiswa.tsx`
- `client/src/pages/admin/kelolaDataBeasiswa/components/AddBeasiswaModal.tsx`
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

### **Issue 3: "Required fields missing" error**

- **Cause**: Ada required field yang kosong
- **Solution**: Pastikan semua field required terisi

### **Issue 4: Token expired**

- **Cause**: JWT token sudah expired
- **Solution**: User akan diredirect ke login page otomatis

### **Issue 5: Duplicate entry**

- **Cause**: Submit button diklik multiple times
- **Solution**: Disable button saat processing

---

## 🚀 FUTURE IMPROVEMENTS

1. **Draft Save**: Auto-save form data sebagai draft
2. **Bulk Upload**: Upload multiple beasiswa sekaligus via CSV/Excel
3. **Rich Media**: Support video dan dokumen PDF
4. **Schedule Publishing**: Schedule beasiswa untuk publish di waktu tertentu
5. **Template System**: Save dan reuse form templates
6. **Preview Mode**: Preview beasiswa sebelum publish
7. **Version Control**: Track changes dan revision history
8. **Duplicate Feature**: Duplicate existing beasiswa untuk edit

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Maintainer**: EDUPATH Development Team
