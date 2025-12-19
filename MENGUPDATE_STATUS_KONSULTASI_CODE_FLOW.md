# MENGUPDATE STATUS KONSULTASI PERMINTAAN MURID - CODE FLOW DOCUMENTATION

## 📋 OVERVIEW

Fitur **Mengupdate Status Konsultasi permintaan Murid** memungkinkan administrator untuk menerima atau menolak permintaan konsultasi dari murid yang berstatus PENDING. Fitur ini dilengkapi dengan konfirmasi modal dan notifikasi ke murid terkait keputusan admin.

---

## 🎯 USE CASE: Mengupdate Status Konsultasi permintaan Murid

### **Actor**: Admin

### **Preconditions**:

- Admin telah login dengan kredensial admin
- Admin berada di halaman "Kelola Data Konseling"
- Terdapat minimal 1 permintaan konsultasi dengan status PENDING dalam sistem

### **Flow**:

1. Admin masuk halaman admin EDUPATH
2. Sistem menampilkan halaman admin EDUPATH
3. Admin memilih opsi 'Kelola Data Konseling' melalui sidebar
4. Sistem menampilkan halaman kelola data konseling
5. Sistem mengambil data konsultasi dari database
6. **[Data ditemukan]**: Sistem menampilkan list data sesi konsultasi
7. **[Data tidak ditemukan]**: Sistem menampilkan placeholder pesan error gagal memuat data
8. Admin memilih section 'Pending' di header halaman kelola data konseling
9. **[Ada status pending]**: Sistem menampilkan data permintaan konsultasi dari murid yang masih berstatus pending
10. **[Tidak ada status pending]**: Sistem menampilkan pesan placeholder tidak ada permintaan konsultasi dengan status pending
11. Admin memilih aksi yang diinginkan (menerima/menolak) untuk salah satu permintaan konsultasi murid
12. Sistem menampilkan popup modal konfirmasi untuk mengubah status permintaan konsultasi yang dipilih
13. Admin menekan tombol 'Ya' dalam modal konfirmasi
14. Sistem menyimpan update status permintaan konsultasi murid yang dipilih admin ke dalam database
15. **[Berhasil menyimpan perubahan]**: Sistem menampilkan feedback notifikasi update status konseling berhasil
16. **[Gagal menyimpan perubahan]**: Sistem menampilkan placeholder pesan error gagal melakukan update status
17. Sistem menampilkan notifikasi update status konseling ke murid yang bersangkutan
18. Sistem menampilkan list permintaan konsultasi murid dengan update data terbaru

### **Postconditions**:

- Status konsultasi berhasil diperbarui di database (ACCEPTED atau DECLINED)
- Notifikasi terkirim ke murid yang mengajukan konsultasi
- Daftar konsultasi di halaman diperbarui secara real-time
- Modal konfirmasi ditutup dan admin kembali ke halaman daftar konsultasi

---

## 🎨 ACTIVITY DIAGRAM FLOW

```
┌─────────────────────────────────────────────────────────────────────┐
│ START                                                                │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                    ┌───────────▼──────────────────────────────┐
                    │ Admin masuk halaman admin EDUPATH        │
                    └───────────┬──────────────────────────────┘
                                │
                    ┌───────────▼──────────────────────────────────┐
                    │ Sistem menampilkan halaman admin EDUPATH    │
                    └───────────┬──────────────────────────────────┘
                                │
                    ┌───────────▼──────────────────────────────┐
                    │ Admin memilih opsi 'Kelola Data          │
                    │ Konseling' melalui sidebar               │
                    └───────────┬──────────────────────────────┘
                                │
                    ┌───────────▼──────────────────────────────────┐
                    │ Sistem menampilkan halaman kelola data       │
                    │ konseling                                    │
                    └───────────┬──────────────────────────────────┘
                                │
                    ┌───────────▼──────────────────────────────┐
                    │ Sistem mengambil data konsultasi dari    │
                    │ database                                 │
                    └───────────┬──────────────────────────────┘
                                │
                    ┌───────────▼──────────┐
                    │ [Data ditemukan?]    │
                    └─────┬────────────┬───┘
                   TIDAK  │            │ YA
          ┌───────────────▼──┐    ┌───▼────────────────────────────┐
          │ Sistem menampilkan│    │ Sistem menampilkan list        │
          │ placeholder pesan │    │ data sesi konsultasi           │
          │ error gagal       │    └───┬────────────────────────────┘
          │ memuat data       │        │
          └────────┬──────────┘        │
                   │                   │
                   │              ┌────▼──────────────────────────┐
                   │              │ Admin memilih section         │
                   │              │ 'Pending' di header halaman   │
                   │              │ kelola data konseling         │
                   │              └────┬──────────────────────────┘
                   │                   │
                   │              ┌────▼──────────────────────────┐
                   │              │ [Ada status pending?]         │
                   │              └─────┬────────────┬────────────┘
                   │                    │ TIDAK      │ YA
                   │    ┌───────────────▼──┐    ┌────▼───────────────────────┐
                   │    │ Sistem menampilkan│    │ Sistem menampilkan data    │
                   │    │ pesan placeholder │    │ permintaan konsultasi dari │
                   │    │ tidak ada         │    │ murid yang masih berstatus │
                   │    │ permintaan dengan │    │ pending                    │
                   │    │ status pending    │    └────┬───────────────────────┘
                   │    └────────┬──────────┘         │
                   │             │                    │
                   │             │              ┌─────▼────────────────────────┐
                   │             │              │ Admin memilih aksi yang      │
                   │             │              │ diinginkan (menerima/menolak)│
                   │             │              │ untuk salah satu permintaan  │
                   │             │              │ konsultasi murid             │
                   │             │              └─────┬────────────────────────┘
                   │             │                    │
                   │             │              ┌─────▼────────────────────────┐
                   │             │              │ Sistem menampilkan popup     │
                   │             │              │ modal konfirmasi untuk       │
                   │             │              │ mengubah status permintaan   │
                   │             │              │ konsultasi yang dipilih      │
                   │             │              └─────┬────────────────────────┘
                   │             │                    │
                   │             │              ┌─────▼────────────────────────┐
                   │             │              │ Admin menekan tombol 'Ya'    │
                   │             │              │ dalam modal konfirmasi       │
                   │             │              └─────┬────────────────────────┘
                   │             │                    │
                   │             │              ┌─────▼────────────────────────┐
                   │             │              │ Sistem menyimpan update      │
                   │             │              │ status permintaan konsultasi │
                   │             │              │ murid yang dipilih admin ke  │
                   │             │              │ dalam database               │
                   │             │              └─────┬────────────┬───────────┘
                   │             │              GAGAL │            │ BERHASIL
                   │             │    ┌───────────────▼──┐    ┌────▼───────────────────────┐
                   │             │    │ Sistem menampilkan│    │ Sistem menampilkan feedback│
                   │             │    │ placeholder pesan │    │ notifikasi update status   │
                   │             │    │ error gagal       │    │ konseling berhasil         │
                   │             │    │ melakukan update  │    └────┬───────────────────────┘
                   │             │    │ status            │         │
                   │             │    └────────┬──────────┘         │
                   │             │             │                    │
                   │             │             │              ┌─────▼────────────────────────┐
                   │             │             │              │ Sistem menampilkan notifikasi│
                   │             │             │              │ update status konseling ke   │
                   │             │             │              │ murid yang bersangkutan      │
                   │             │             │              └─────┬────────────────────────┘
                   │             │             │                    │
                   │             │             │              ┌─────▼────────────────────────┐
                   │             │             │              │ Sistem menampilkan list      │
                   │             │             │              │ permintaan konsultasi murid  │
                   │             │             │              │ dengan update data terbaru   │
                   │             │             │              └─────┬────────────────────────┘
                   │             │             │                    │
                   └─────────────┴─────────────┴────────────────────┘
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

1. **KelolaDataKonseling.tsx** (`client/src/pages/admin/kelolaKonseling/KelolaDataKonseling.tsx`)

   - Main page component untuk kelola data konseling
   - Menampilkan tabs: Pending, Active, Completed, Declined
   - Handle update status functionality dengan SweetAlert2
   - Manage consultations list state
   - Filter consultations by status

2. **ConsultationFilters.tsx** (`client/src/pages/admin/kelolaKonseling/Components/ConsultationFilters.tsx`)

   - Tab navigation component untuk filter by status
   - Show badge count untuk pending consultations

3. **ConsultationTable.tsx** / **ConsultationCards.tsx**
   - Display consultation list in table or card format
   - Action buttons: Accept, Decline, View Details

### **Backend Components**:

1. **consultationController.ts** (`server/src/controllers/consultationController.ts`)

   - `updateConsultationStatus()`: Memperbarui status konsultasi (PENDING → ACCEPTED/DECLINED)
   - `getAllConsultations()`: Mengambil semua data konsultasi
   - Notification creation untuk murid

2. **Consultation Model** (Prisma Schema)

   - Tabel `consultation` dengan fields:
     - consultation_id (String, primary key)
     - murid_id (String, foreign key to User)
     - admin_id (String, foreign key to User)
     - topic (String, required)
     - status (Enum: PENDING, ACCEPTED, DECLINED, COMPLETED)
     - consultation_date (DateTime, required)
     - consultation_time (String, required)
     - description (Text, optional)
     - admin_notes (Text, optional - untuk alasan decline)
     - is_active (Boolean, default: true)
     - created_at (DateTime, auto-generated)
     - updated_at (DateTime, auto-updated)

3. **Notification Model** (Prisma Schema)
   - Tabel `notification` untuk notifikasi ke murid:
     - notification_id (String, primary key)
     - user_id (String, foreign key to User)
     - type (Enum: CONSULTATION_ACCEPTED, CONSULTATION_REJECTED, etc.)
     - title (String, required)
     - message (String, required)
     - related_id (String, optional - consultation_id)
     - is_read (Boolean, default: false)
     - created_at (DateTime, auto-generated)

---

## Sequence Diagram

```mermaid
sequenceDiagram
    participant Admin
    participant KelolaDataKonselingPage<<view>>
    participant consultationController<<controller>>
    participant Consultation<<model>>
    participant Notification<<model>>

    Admin->>KelolaDataKonselingPage: Login with admin credentials
    KelolaDataKonselingPage->>Admin: Display admin page

    Admin->>KelolaDataKonselingPage: Click 'Kelola Data Konseling' on sidebar
    KelolaDataKonselingPage->>KelolaDataKonselingPage: fetchConsultations()
    KelolaDataKonselingPage->>consultationController: getAllConsultations()
    consultationController->>Consultation: findMany({ where: { admin_id } })
    Consultation-->>consultationController: Return all consultations
    consultationController-->>KelolaDataKonselingPage: Return consultations data

    alt Data not found
        KelolaDataKonselingPage->>Admin: Display placeholder error message
    else Data found
        KelolaDataKonselingPage->>Admin: Display consultations list

        Admin->>KelolaDataKonselingPage: Click 'Pending' section in header

        alt No pending consultations
            KelolaDataKonselingPage->>Admin: Display "No pending consultations" message
        else Has pending consultations
            KelolaDataKonselingPage->>Admin: Display pending consultations list

            Admin->>KelolaDataKonselingPage: Click 'Accept' or 'Decline' button
            KelolaDataKonselingPage->>KelolaDataKonselingPage: handleUpdateStatus(consultationId, newStatus)

            alt Decline action
                KelolaDataKonselingPage->>Admin: Display SweetAlert2 modal with textarea for decline reason
                Admin->>KelolaDataKonselingPage: Enter decline reason and click 'Tolak Konseling'
            else Accept action
                KelolaDataKonselingPage->>Admin: Display SweetAlert2 confirmation modal
                Admin->>KelolaDataKonselingPage: Click 'Ya, ubah status'
            end

            KelolaDataKonselingPage->>consultationController: updateConsultationStatus(id, status, admin_notes)
            consultationController->>Consultation: update({ where: { consultation_id }, data: { status, admin_notes, is_active } })

            alt Update failed
                Consultation-->>consultationController: Error
                consultationController-->>KelolaDataKonselingPage: { success: false, message: "Gagal memperbarui status konseling" }
                KelolaDataKonselingPage->>Admin: Display error toast notification
                

            else Update successful
                Consultation-->>consultationController: Return updated consultation

                alt Status is ACCEPTED
                    consultationController->>Notification: create({ type: "CONSULTATION_ACCEPTED", user_id: murid_id })
                    Notification-->>consultationController: Notification created
                else Status is DECLINED
                    consultationController->>Notification: create({ type: "CONSULTATION_REJECTED", user_id: murid_id })
                    Notification-->>consultationController: Notification created
                end

                consultationController-->>KelolaDataKonselingPage: { success: true, message: "Status konseling berhasil diperbarui" }
                KelolaDataKonselingPage->>KelolaDataKonselingPage: Update consultations state
                KelolaDataKonselingPage->>KelolaDataKonselingPage: triggerNotificationRefresh()
                KelolaDataKonselingPage->>Admin: Display success toast notification
                KelolaDataKonselingPage->>Admin: Display updated consultations list
            end
        end
    end
```

## Data Flow Details

### 1. Fetch Consultations Data (Initial Load)

**Frontend Handler**:

```typescript
const fetchConsultations = async () => {
  try {
    setLoading(true);
    const token = TokenManager.getToken();
    const response = await axios.get(`${API_URL}/api/consultations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setConsultations(response.data.data);
  } catch (error) {
    console.error("Error fetching consultations:", error);
    toast.error("Gagal mengambil data konsultasi");
  } finally {
    setLoading(false);
  }
};
```

**Request**:

```http
GET /api/consultations
Headers:
  Authorization: Bearer <JWT_TOKEN>
```

**Backend Processing**:

```typescript
async getAllConsultations(req: Request, res: Response) {
  try {
    const user = req.user; // Get authenticated user from JWT

    const filters: any = {};

    // Admin only sees consultations assigned to them
    if (user?.role === "ADMIN") {
      filters.admin_id = user.user_id;
    }

    const consultations = await prisma.consultation.findMany({
      where: filters,
      include: {
        murid: {
          select: {
            user_id: true,
            firstname: true,
            lastname: true,
            email: true,
            kelas: true,
          },
        },
        admin: {
          select: {
            user_id: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil data konseling",
      data: consultations,
      count: consultations.length,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Terjadi kesalahan saat mengambil data konseling",
    });
  }
}
```

---

### 2. Update Consultation Status

**Frontend Handler**:

```typescript
const handleUpdateStatus = async (
  consultationId: string,
  newStatus: string
) => {
  try {
    // If declining, show a modal to get the decline reason
    if (newStatus === "DECLINED") {
      const result = await Swal.fire({
        title: "Tolak Konseling",
        html: `
          <div class="text-left">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Alasan penolakan <span class="text-red-500">*</span>
            </label>
            <textarea
              id="decline-notes"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="4"
              placeholder="Masukkan alasan mengapa konseling ditolak..."
            ></textarea>
          </div>
        `,
        imageUrl: questionIcon,
        imageWidth: 80,
        imageHeight: 90,
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "var(--primary)",
        confirmButtonText: "Tolak Konseling",
        cancelButtonText: "Batal",
        preConfirm: () => {
          const notes = (
            document.getElementById("decline-notes") as HTMLTextAreaElement
          )?.value;
          if (!notes || notes.trim() === "") {
            Swal.showValidationMessage("Alasan penolakan harus diisi");
            return false;
          }
          return notes;
        },
      });

      if (result.isConfirmed && result.value) {
        const token = TokenManager.getToken();
        await axios.patch(
          `${API_URL}/api/consultations/${consultationId}/status`,
          { status: newStatus, admin_notes: result.value },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setConsultations(
          consultations.map((consultation) =>
            consultation.consultation_id === consultationId
              ? {
                  ...consultation,
                  status: newStatus as Consultation["status"],
                  admin_notes: result.value,
                  is_active: false,
                }
              : consultation
          )
        );

        toast.success("Konseling berhasil ditolak");
        triggerNotificationRefresh();
      }
    } else {
      // For other status changes (ACCEPTED)
      const result = await Swal.fire({
        title: "Apakah Anda yakin?",
        text: `Anda akan mengubah status konseling menjadi "${getStatusText(
          newStatus
        )}".`,
        imageUrl: questionIcon,
        imageWidth: 80,
        imageHeight: 90,
        showCancelButton: true,
        confirmButtonColor: "var(--primary)",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, ubah status",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        const token = TokenManager.getToken();
        await axios.patch(
          `${API_URL}/api/consultations/${consultationId}/status`,
          { status: newStatus },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setConsultations(
          consultations.map((consultation) =>
            consultation.consultation_id === consultationId
              ? {
                  ...consultation,
                  status: newStatus as Consultation["status"],
                }
              : consultation
          )
        );

        toast.success("Status konseling berhasil diperbarui");
        triggerNotificationRefresh();
      }
    }
  } catch (error: any) {
    console.error("Error updating consultation:", error);
    toast.error(
      error.response?.data?.message || "Gagal memperbarui status konseling"
    );
  }
};
```

**Request (Accept)**:

```http
PATCH /api/consultations/:id/status
Headers:
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json

Body:
{
  "status": "ACCEPTED"
}
```

**Request (Decline)**:

```http
PATCH /api/consultations/:id/status
Headers:
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json

Body:
{
  "status": "DECLINED",
  "admin_notes": "Jadwal bentrok dengan konseling lain"
}
```

**Backend Processing**:

```typescript
async updateConsultationStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID konseling wajib diisi",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status wajib diisi",
      });
    }

    // Validate status value
    const validStatuses = Object.values(ConsultationStatus);
    if (!validStatuses.includes(status as ConsultationStatus)) {
      return res.status(400).json({
        success: false,
        message: "Status harus salah satu dari: PENDING, ACCEPTED, DECLINED, COMPLETED",
      });
    }

    const existingConsultation = await prisma.consultation.findUnique({
      where: { consultation_id: id },
    });

    if (!existingConsultation) {
      return res.status(404).json({
        success: false,
        message: "Konseling tidak ditemukan",
      });
    }

    // Automatically set is_active to false for DECLINED and COMPLETED status
    let isActive = existingConsultation.is_active;
    if (
      status === ConsultationStatus.DECLINED ||
      status === ConsultationStatus.COMPLETED
    ) {
      isActive = false;
    }

    const updatedConsultation = await prisma.consultation.update({
      where: { consultation_id: id },
      data: {
        status: status as ConsultationStatus,
        admin_notes: admin_notes || existingConsultation.admin_notes || undefined,
        is_active: isActive,
      },
      include: {
        murid: {
          select: {
            user_id: true,
            firstname: true,
            lastname: true,
            email: true,
            kelas: true,
          },
        },
        admin: {
          select: {
            user_id: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
    });

    // Create notification for student
    if (status === ConsultationStatus.ACCEPTED) {
      await prisma.notification.create({
        data: {
          user_id: updatedConsultation.murid_id,
          type: "CONSULTATION_ACCEPTED",
          title: "Konsultasi Diterima",
          message: `Konsultasi Anda tentang "${updatedConsultation.topic}" telah diterima oleh ${updatedConsultation.admin.firstname} ${updatedConsultation.admin.lastname}.`,
          related_id: updatedConsultation.consultation_id,
          is_read: false,
        },
      });
    } else if (status === ConsultationStatus.DECLINED) {
      await prisma.notification.create({
        data: {
          user_id: updatedConsultation.murid_id,
          type: "CONSULTATION_REJECTED",
          title: "Konsultasi Ditolak",
          message: `Konsultasi Anda tentang "${updatedConsultation.topic}" ditolak. ${
            admin_notes ? `Alasan: ${admin_notes}` : ""
          }`,
          related_id: updatedConsultation.consultation_id,
          is_read: false,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Status konseling berhasil diperbarui",
      data: updatedConsultation,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Terjadi kesalahan saat memperbarui status konseling",
    });
  }
}
```

**Response (Success - Accept)**:

```json
{
  "success": true,
  "message": "Status konseling berhasil diperbarui",
  "data": {
    "consultation_id": "CS001",
    "murid_id": "user-uuid-murid",
    "admin_id": "user-uuid-admin",
    "topic": "Konsultasi Pilihan Jurusan",
    "status": "ACCEPTED",
    "consultation_date": "2024-01-25T10:00:00.000Z",
    "consultation_time": "10:00",
    "description": "Ingin berkonsultasi tentang pilihan jurusan kuliah",
    "admin_notes": null,
    "is_active": true,
    "created_at": "2024-01-20T08:00:00.000Z",
    "updated_at": "2024-01-20T09:00:00.000Z",
    "murid": {
      "user_id": "user-uuid-murid",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john.doe@student.com",
      "kelas": 12
    },
    "admin": {
      "user_id": "user-uuid-admin",
      "firstname": "Admin",
      "lastname": "BK",
      "email": "admin.bk@school.com"
    }
  }
}
```

**Response (Success - Decline)**:

```json
{
  "success": true,
  "message": "Status konseling berhasil diperbarui",
  "data": {
    "consultation_id": "CS002",
    "status": "DECLINED",
    "admin_notes": "Jadwal bentrok dengan konseling lain",
    "is_active": false,
    "..."
  }
}
```

**Response (Error - Consultation Not Found)**:

```json
{
  "success": false,
  "message": "Konseling tidak ditemukan"
}
```

**Response (Error - Invalid Status)**:

```json
{
  "success": false,
  "message": "Status harus salah satu dari: PENDING, ACCEPTED, DECLINED, COMPLETED"
}
```

---

## 🔌 API ENDPOINTS

### **GET /api/consultations**

- **Purpose**: Mengambil semua data konsultasi untuk admin yang sedang login
- **Auth**: Required (JWT Token)
- **Response**: Array of consultation objects dengan filter by admin_id

### **PATCH /api/consultations/:id/status**

- **Purpose**: Memperbarui status konsultasi (PENDING → ACCEPTED/DECLINED)
- **Auth**: Required (JWT Token)
- **Params**: `id` - Consultation ID
- **Body**:
  - `status` (required): "ACCEPTED" | "DECLINED"
  - `admin_notes` (optional): Alasan penolakan (required jika DECLINED)
- **Response**: Updated consultation object
- **Side Effects**: Creates notification for student

---

## ✨ KEY FEATURES

### **1. Dual Confirmation Modals**

- **Accept Modal**: Simple confirmation dengan SweetAlert2
- **Decline Modal**: Form modal dengan textarea untuk alasan penolakan
- Custom validation untuk decline reason (tidak boleh kosong)
- Beautiful UI dengan custom icon

### **2. Status Management**

- Status transitions: PENDING → ACCEPTED atau PENDING → DECLINED
- Auto set `is_active = false` untuk DECLINED status
- Real-time update di consultations list
- Filter by status (Pending, Active, Declined, Completed tabs)

### **3. Notification System**

- Automatic notification creation untuk murid saat status berubah
- Different notification types:
  - `CONSULTATION_ACCEPTED`: Saat konsultasi diterima
  - `CONSULTATION_REJECTED`: Saat konsultasi ditolak (dengan alasan)
- Real-time notification refresh dengan `triggerNotificationRefresh()`

### **4. Optimistic UI Update**

- Consultation langsung update di list setelah status change
- Map consultations state untuk update specific item
- Instant feedback tanpa full page reload
- Better user experience

### **5. Admin Notes**

- Required notes untuk DECLINED status
- Optional notes untuk status lainnya
- Stored in `admin_notes` field
- Included in notification message untuk murid

---

## 🔐 SECURITY CONSIDERATIONS

1. **JWT Authentication**: Setiap request memerlukan valid JWT token
2. **Authorization Headers**: Token dikirim via Authorization header
3. **Role-based Access**: Hanya admin yang bisa update status konsultasi
4. **Admin-Specific Data**: Admin hanya bisa lihat/update konsultasi yang assigned ke mereka
5. **Consultation Existence Check**: Verify consultation exists before update
6. **Status Validation**: Server-side validation untuk allowed status values
7. **Required Fields Validation**: Decline reason wajib diisi untuk DECLINED status

---

## 🎨 UI/UX FEATURES

### **Action Buttons Design**:

- **Accept Button**: Green/success color dengan icon checkmark
- **Decline Button**: Red/danger color dengan icon X
- Positioned di action column pada table/card
- Clear visual distinction antara accept dan decline

### **Confirmation Modals (SweetAlert2)**:

**Accept Modal**:

- **Title**: "Apakah Anda yakin?"
- **Text**: "Anda akan mengubah status konseling menjadi 'Accepted'."
- **Icon**: Question icon (80x90px)
- **Confirm Button**: "Ya, ubah status" (Primary color)
- **Cancel Button**: "Batal" (Red color)

**Decline Modal**:

- **Title**: "Tolak Konseling"
- **Form**: Textarea untuk alasan penolakan (required)
- **Placeholder**: "Masukkan alasan mengapa konseling ditolak..."
- **Validation**: Error jika textarea kosong
- **Confirm Button**: "Tolak Konseling" (Red #d33)
- **Cancel Button**: "Batal" (Primary color)

### **Visual Feedback**:

- Success toast: "Status konseling berhasil diperbarui" (Green)
- Success toast (decline): "Konseling berhasil ditolak" (Green)
- Error toast: "Gagal memperbarui status konseling" (Red)
- Immediate list update setelah status change
- Tab badge update untuk pending count

### **Tab Navigation**:

- **Pending Tab**: Shows consultations with PENDING status (with badge count)
- **Active Tab**: Shows consultations with ACCEPTED status
- **Declined Tab**: Shows consultations with DECLINED status
- **Completed Tab**: Shows consultations with COMPLETED status

---

## 🔄 STATE MANAGEMENT

### **Update Status Flow (Accept)**:

1. User clicks "Accept" button pada consultation card
2. SweetAlert2 modal appears dengan konfirmasi
3. User clicks "Batal": Modal closes, no action
4. User clicks "Ya, ubah status": Proceed with update
5. API call: `PATCH /api/consultations/:id/status` with `{ status: "ACCEPTED" }`
6. Backend updates consultation status dan creates notification
7. Success response:
   - Map `consultations` state to update specific item
   - Update status ke "ACCEPTED"
   - Show success toast: "Status konseling berhasil diperbarui"
   - Trigger notification refresh
8. Error response:
   - Show error toast: "Gagal memperbarui status konseling"

### **Update Status Flow (Decline)**:

1. User clicks "Decline" button pada consultation card
2. SweetAlert2 modal appears dengan form textarea
3. User enters decline reason and clicks "Tolak Konseling"
4. Validation: Check if textarea is not empty
5. If invalid: Show validation error
6. If valid: API call with `{ status: "DECLINED", admin_notes: reason }`
7. Backend updates consultation, sets `is_active = false`, creates notification
8. Success response:
   - Update consultations state
   - Show success toast: "Konseling berhasil ditolak"
   - Trigger notification refresh
   - Consultation moves to "Declined" tab

---

## 📚 RELATED FILES

### **Frontend**:

- `client/src/pages/admin/kelolaKonseling/KelolaDataKonseling.tsx`
- `client/src/pages/admin/kelolaKonseling/Components/ConsultationFilters.tsx`
- `client/src/pages/admin/kelolaKonseling/Components/ConsultationTable.tsx`
- `client/src/pages/admin/kelolaKonseling/Components/ConsultationCards.tsx`
- `client/src/utils/tokenManager.ts`
- `client/src/utils/notificationEvents.ts`
- `client/src/assets/question-logo.png` (Question icon for SweetAlert2)

### **Backend**:

- `server/src/controllers/consultationController.ts`
- `server/src/routes/consultationRoutes.ts`
- `server/prisma/schema.prisma`

---

## 🐛 COMMON ISSUES & SOLUTIONS

### **Issue 1: "Konseling tidak ditemukan" error**

- **Cause**: Consultation ID tidak valid atau sudah dihapus
- **Solution**: Refresh halaman untuk mendapatkan data terbaru

### **Issue 2: Decline reason validation error**

- **Cause**: Textarea kosong saat mencoba decline
- **Solution**: Isi alasan penolakan dengan jelas sebelum submit

### **Issue 3: Status tidak berubah di UI**

- **Cause**: State management issue atau network error
- **Solution**: Check console untuk error, refresh halaman

### **Issue 4: Notification tidak terkirim ke murid**

- **Cause**: Notification creation failed di backend
- **Solution**: Check server logs, verify notification table

### **Issue 5: Token expired saat update status**

- **Cause**: JWT token sudah expired
- **Solution**: User akan diredirect ke login page otomatis

### **Issue 6: Modal tidak muncul saat click button**

- **Cause**: SweetAlert2 belum loaded atau conflict
- **Solution**: Check browser console, ensure SweetAlert2 imported correctly

---

## 🚀 FUTURE IMPROVEMENTS

1. **Bulk Status Update**: Update multiple consultations sekaligus
2. **Email Notification**: Send email ke murid saat status berubah
3. **Status History**: Track all status changes dengan timestamps
4. **Auto-Accept Rules**: Define rules untuk auto-accept consultations
5. **Decline Templates**: Pre-defined decline reasons untuk faster input
6. **Undo Feature**: Undo status change dalam waktu tertentu
7. **Status Analytics**: Dashboard untuk track accept/decline rates
8. **Custom Status**: Allow custom consultation statuses beyond 4 defaults
9. **Approval Workflow**: Multi-level approval untuk certain consultations
10. **Push Notifications**: Real-time push notifications untuk mobile app

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Maintainer**: EDUPATH Development Team
