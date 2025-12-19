# MENJADWALKAN ULANG SESI KONSULTASI DENGAN MURID - CODE FLOW DOCUMENTATION

## 📋 OVERVIEW

Fitur **Menjadwalkan Ulang Sesi Konsultasi dengan Murid** memungkinkan administrator untuk mengubah jadwal konsultasi yang sudah diterima (status ACCEPTED) dengan murid. Fitur ini dilengkapi dengan form modal, validasi jadwal, dan notifikasi otomatis ke murid terkait perubahan jadwal.

---

## 🎯 USE CASE: Menjadwalkan Ulang Sesi Konsultasi dengan Murid

### **Actor**: Admin

### **Preconditions**:

- Admin telah login dengan kredensial admin
- Admin berada di halaman "Kelola Data Konseling"
- Terdapat minimal 1 sesi konsultasi dengan status ACCEPTED (Aktif) dalam sistem

### **Flow**:

1. Admin masuk halaman admin EDUPATH
2. Sistem menampilkan halaman admin EDUPATH
3. Admin memilih opsi 'Kelola Data Konseling' melalui sidebar
4. Sistem menampilkan halaman kelola data konseling
5. Sistem mengambil data konsultasi dari database
6. **[Data ditemukan]**: Sistem menampilkan list data sesi konsultasi
7. **[Data tidak ditemukan]**: Sistem menampilkan placeholder pesan error gagal memuat data
8. Admin memilih section 'Aktif' di header halaman kelola data konseling
9. **[Ada status aktif]**: Sistem menampilkan data sesi konsultasi aktif yang ingin dijadwalkan ulang
10. **[Tidak ada status aktif]**: Sistem menampilkan pesan placeholder tidak ada sesi konsultasi dengan status aktif
11. Admin menekan tombol 'Reschedule' untuk salah satu sesi konsultasi aktif yang ingin dijadwalkan ulang
12. Sistem menampilkan popup form untuk mengubah jadwal sesi konsultasi
13. Admin mengisi form dengan data-data yang sesuai
14. Admin menekan tombol 'Reschedule' pada form
15. Sistem melakukan validasi data input fields
16. **[Validasi gagal]**: Sistem menampilkan pesan error data tidak sesuai
17. **[Validasi berhasil]**: Sistem menyimpan perubahan jadwal konsultasi murid yang dipilih admin ke dalam database
18. **[Berhasil menyimpan perubahan]**: Sistem menampilkan notifikasi perubahan jadwal konseling ke murid yang bersangkutan → Sistem menampilkan feedback notifikasi perubahan jadwal konsultasi berhasil
19. **[Gagal menyimpan perubahan]**: Sistem menampilkan placeholder pesan error gagal melakukan perubahan jadwal konsultasi

### **Postconditions**:

- Jadwal konsultasi berhasil diperbarui di database dengan tanggal dan waktu baru
- Admin notes diupdate dengan alasan reschedule
- Daftar konsultasi di halaman diperbarui secara real-time
- Modal form ditutup dan admin kembali ke halaman daftar konsultasi

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
                   │              │ Admin memilih section 'Aktif' │
                   │              │ di header halaman kelola data │
                   │              │ konseling                     │
                   │              └────┬──────────────────────────┘
                   │                   │
                   │              ┌────▼──────────────────────────┐
                   │              │ [Ada status aktif?]           │
                   │              └─────┬────────────┬────────────┘
                   │                    │ TIDAK      │ YA
                   │    ┌───────────────▼──┐    ┌────▼───────────────────────┐
                   │    │ Sistem menampilkan│    │ Sistem menampilkan data    │
                   │    │ pesan placeholder │    │ sesi konsultasi aktif yang │
                   │    │ tidak ada sesi    │    │ ingin dijadwalkan ulang    │
                   │    │ konsultasi dengan │    └────┬───────────────────────┘
                   │    │ status aktif      │         │
                   │    └────────┬──────────┘         │
                   │             │                    │
                   │             │              ┌─────▼────────────────────────┐
                   │             │              │ Admin menekan tombol         │
                   │             │              │ 'Reschedule' untuk salah satu│
                   │             │              │ sesi konsultasi aktif yang   │
                   │             │              │ ingin dijadwalkan ulang      │
                   │             │              └─────┬────────────────────────┘
                   │             │                    │
                   │             │              ┌─────▼────────────────────────┐
                   │             │              │ Sistem menampilkan popup     │
                   │             │              │ form untuk mengubah jadwal   │
                   │             │              │ sesi konsultasi              │
                   │             │              └─────┬────────────────────────┘
                   │             │                    │
                   │             │              ┌─────▼────────────────────────┐
                   │             │              │ Admin mengisi form dengan    │
                   │             │              │ data-data yang sesuai        │
                   │             │              └─────┬────────────────────────┘
                   │             │                    │
                   │             │              ┌─────▼────────────────────────┐
                   │             │              │ Admin menekan tombol         │
                   │             │              │ 'Reschedule' pada form       │
                   │             │              └─────┬────────────────────────┘
                   │             │                    │
                   │             │              ┌─────▼────────────────────────┐
                   │             │              │ Validasi data input fields   │
                   │             │              └─────┬────────────┬───────────┘
                   │             │              GAGAL │            │ BERHASIL
                   │             │    ┌───────────────▼──┐    ┌────▼───────────────────────┐
                   │             │    │ Sistem menampilkan│    │ Sistem menyimpan perubahan │
                   │             │    │ pesan error data  │    │ jadwal konsultasi murid    │
                   │             │    │ tidak sesuai      │    │ yang dipilih admin ke      │
                   │             │    └────────┬──────────┘    │ dalam database             │
                   │             │             │               └────┬───────────┬───────────┘
                   │             │             │             GAGAL  │           │ BERHASIL
                   │             │             │    ┌───────────────▼──┐    ┌───▼──────────────────────┐
                   │             │             │    │ Sistem menampilkan│    │ Sistem menampilkan       │
                   │             │             │    │ placeholder pesan │    │ notifikasi perubahan     │
                   │             │             │    │ error gagal       │    │ jadwal konseling ke murid│
                   │             │             │    │ melakukan         │    │ yang bersangkutan        │
                   │             │             │    │ perubahan jadwal  │    └───┬──────────────────────┘
                   │             │             │    │ konsultasi        │        │
                   │             │             │    └────────┬──────────┘        │
                   │             │             │             │              ┌────▼──────────────────────┐
                   │             │             │             │              │ Sistem menampilkan        │
                   │             │             │             │              │ feedback notifikasi       │
                   │             │             │             │              │ perubahan jadwal          │
                   │             │             │             │              │ konsultasi berhasil       │
                   │             │             │             │              └────┬──────────────────────┘
                   │             │             │             │                   │
                   └─────────────┴─────────────┴─────────────┴───────────────────┘
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
- **shadcn/ui** components (Calendar, Popover, Button)
- **date-fns** untuk date formatting dan manipulation
- **React Hot Toast** untuk notifikasi
- **Tailwind CSS** untuk styling
- **Lucide React** untuk icons

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
   - Handle reschedule functionality
   - Manage consultations list state
   - Filter consultations by status

2. **RescheduleModal.tsx** (`client/src/pages/admin/kelolaKonseling/Components/RescheduleModal.tsx`)

   - Modal component dengan form reschedule
   - Calendar picker untuk pilih tanggal baru
   - Time slot selector dengan disabled slots untuk yang sudah booked
   - Textarea untuk alasan reschedule
   - Real-time validation
   - Fetches booked slots untuk tanggal yang dipilih

3. **ConsultationTable.tsx** / **ConsultationCards.tsx**
   - Display consultation list in table or card format
   - Action button: Reschedule (hanya untuk status ACCEPTED)

### **Backend Components**:

1. **consultationController.ts** (`server/src/controllers/consultationController.ts`)

   - `rescheduleConsultation()`: Memperbarui jadwal konsultasi yang sudah ACCEPTED
   - `getBookedSlotsForDate()`: Mengambil time slots yang sudah booked untuk tanggal tertentu
   - `checkScheduleConflict()`: Helper untuk check conflict dengan konsultasi lain
   - Validation untuk tanggal, waktu, dan alasan reschedule

2. **Consultation Model** (Prisma Schema)
   - Tabel `consultation` dengan fields:
     - consultation_id (String, primary key)
     - murid_id (String, foreign key to User)
     - admin_id (String, foreign key to User)
     - topic (String, required)
     - status (Enum: PENDING, ACCEPTED, DECLINED, COMPLETED)
     - consultation_date (DateTime, required - updated saat reschedule)
     - consultation_time (String, required)
     - description (Text, optional)
     - admin_notes (Text, optional - updated dengan alasan reschedule)
     - is_active (Boolean, default: true)
     - created_at (DateTime, auto-generated)
     - updated_at (DateTime, auto-updated)

---

## Sequence Diagram

```mermaid
sequenceDiagram
    participant Admin
    participant KelolaDataKonselingPage<<view>>
    participant consultationController<<controller>>
    participant Consultation<<model>>

    Admin->>KelolaDataKonselingPage: Login with admin credentials
    KelolaDataKonselingPage->>Admin: Display admin page

    Admin->>KelolaDataKonselingPage: Click 'Kelola Data Konseling' on sidebar
    KelolaDataKonselingPage->>Admin: Display kelola data konseling page

    KelolaDataKonselingPage->>KelolaDataKonselingPage: fetchConsultations()
    KelolaDataKonselingPage->>consultationController: getAllConsultations()
    consultationController->>Consultation: findMany({ where: { admin_id } })
    Consultation-->>consultationController: Return all consultations
    consultationController-->>KelolaDataKonselingPage: Return consultations data

    alt Data not found
        KelolaDataKonselingPage->>Admin: Display placeholder error message
    else Data found
        KelolaDataKonselingPage->>Admin: Display consultations list

        Admin->>KelolaDataKonselingPage: Click 'Aktif' section in header

        alt No active consultations
            KelolaDataKonselingPage->>Admin: Display "No active consultations" message
        else Has active consultations
            KelolaDataKonselingPage->>Admin: Display active consultations list

            Admin->>KelolaDataKonselingPage: Click 'Reschedule' button for active consultation
            KelolaDataKonselingPage->>KelolaDataKonselingPage: handleReschedule(consultation)
            KelolaDataKonselingPage->>Admin: Display reschedule form modal with current schedule

            Admin->>KelolaDataKonselingPage: Fill form with new data
            Admin->>KelolaDataKonselingPage: Click 'Reschedule' button on form

            KelolaDataKonselingPage->>KelolaDataKonselingPage: handleSubmitReschedule()

            alt Validation failed
                KelolaDataKonselingPage->>Admin: Display validation error message
            else Validation successful
                KelolaDataKonselingPage->>consultationController: rescheduleConsultation(id, newDate, rescheduleReason)
                consultationController->>consultationController: Validate request body
                consultationController->>Consultation: findUnique({ where: { consultation_id } })
                Consultation-->>consultationController: Return consultation
                consultationController->>consultationController: Validate status is ACCEPTED
                consultationController->>consultationController: checkScheduleConflict()
                consultationController->>Consultation: update({ consultation_date, admin_notes: "[DIJADWALKAN ULANG] reason" })
                Consultation-->>consultationController: Return updated consultation

                alt Reschedule failed
                    consultationController-->>KelolaDataKonselingPage: { success: false, message: "Error message" }
                    KelolaDataKonselingPage->>Admin: Display error toast notification
                else Reschedule successful
                    consultationController-->>KelolaDataKonselingPage: { success: true, data: updatedConsultation }
                    KelolaDataKonselingPage->>KelolaDataKonselingPage: Update consultations state
                    KelolaDataKonselingPage->>KelolaDataKonselingPage: triggerNotificationRefresh()
                    KelolaDataKonselingPage->>KelolaDataKonselingPage: Close modal
                    KelolaDataKonselingPage->>Admin: Display success toast notification
                    KelolaDataKonselingPage->>Admin: Display updated consultations list
                end
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

---

### 2. Open Reschedule Modal

**Frontend Handler**:

```typescript
const handleReschedule = (consultation: Consultation) => {
  setSelectedConsultation(consultation);
  setIsRescheduleModalOpen(true);
  setIsDetailModalOpen(false);
};
```

**Modal Display**:

- Shows current schedule information
- Displays calendar for date selection
- Shows time slot dropdown with booked slots disabled
- Textarea for reschedule reason (required)

---

### 3. Fetch Booked Slots for Selected Date

**Frontend Handler (RescheduleModal)**:

```typescript
const fetchBookedSlots = async (date: Date) => {
  try {
    const dateString = format(date, "yyyy-MM-dd");
    const token = TokenManager.getToken();
    const response = await axios.get(
      `${API_URL}/api/consultations/booked-slots/${dateString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setBookedSlots(response.data.data.bookedSlots || []);
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    setBookedSlots([]);
  }
};
```

**Request**:

```http
GET /api/consultations/booked-slots/:date
Headers:
  Authorization: Bearer <JWT_TOKEN>

Params:
  date: "2024-01-25"
```

**Response**:

```json
{
  "success": true,
  "data": {
    "bookedSlots": ["10:00", "14:00", "16:30"]
  }
}
```

---

### 4. Submit Reschedule

**Frontend Handler**:

```typescript
const handleSubmitReschedule = async (data: {
  date: Date;
  time: string;
  endTime: string;
  reason: string;
}) => {
  if (!selectedConsultation) return;

  try {
    // Combine date and time
    const [hours, minutes] = data.time.split(":");
    const newDateTime = new Date(data.date);
    newDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const token = TokenManager.getToken();
    const response = await axios.patch(
      `${API_URL}/api/consultations/${selectedConsultation.consultation_id}/reschedule`,
      { newDate: newDateTime.toISOString(), rescheduleReason: data.reason },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Update local state
    const updatedConsultation = response.data.data as Consultation;
    setConsultations(
      consultations.map((c) =>
        c.consultation_id === selectedConsultation.consultation_id
          ? updatedConsultation
          : c
      )
    );

    toast.success("Konseling berhasil di-reschedule");
    triggerNotificationRefresh();
    handleCloseRescheduleModal();
  } catch (error: any) {
    console.error("Error rescheduling consultation:", error);
    toast.error(error.response?.data?.message || "Gagal reschedule konseling");
  }
};
```

**Request**:

```http
PATCH /api/consultations/:id/reschedule
Headers:
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json

Body:
{
  "newDate": "2024-01-25T10:00:00.000Z",
  "rescheduleReason": "Bentrok dengan rapat sekolah"
}
```

**Backend Processing**:

```typescript
async rescheduleConsultation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { newDate, rescheduleReason } = req.body;

    // Validations
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID konseling wajib diisi",
      });
    }

    if (!newDate) {
      return res.status(400).json({
        success: false,
        message: "Tanggal baru wajib diisi",
      });
    }

    if (!rescheduleReason || rescheduleReason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Alasan reschedule wajib diisi",
      });
    }

    // Validate date format
    const newConsultationDate = new Date(newDate);
    if (isNaN(newConsultationDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Format tanggal tidak valid",
      });
    }

    // Check if new date is in the future (min 5 minutes from now)
    const newConsultationDateIndonesia = new Date(
      newConsultationDate.toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
      })
    );

    const now = new Date();
    const indonesiaTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );
    const fiveMinutesFromNow = new Date(
      indonesiaTime.getTime() + 5 * 60 * 1000
    );

    if (newConsultationDateIndonesia < fiveMinutesFromNow) {
      return res.status(400).json({
        success: false,
        message: "Tanggal konseling harus minimal 5 menit dari sekarang",
      });
    }

    // Get consultation to verify it exists and is ACCEPTED
    const consultation = await prisma.consultation.findUnique({
      where: { consultation_id: id },
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

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: "Konseling tidak ditemukan",
      });
    }

    // Only allow rescheduling ACCEPTED consultations
    if (consultation.status !== ConsultationStatus.ACCEPTED) {
      return res.status(400).json({
        success: false,
        message: "Hanya konseling dengan status ACCEPTED yang dapat di-reschedule",
      });
    }

    // Check for scheduling conflict (exclude current consultation)
    const hasConflict = await this.checkScheduleConflict(
      newConsultationDate,
      id
    );

    if (hasConflict) {
      return res.status(409).json({
        success: false,
        message: "Jadwal konseling bentrok dengan konseling lain. Silakan pilih waktu lain.",
      });
    }

    // Update consultation with new date and reschedule note
    const updatedConsultation = await prisma.consultation.update({
      where: { consultation_id: id },
      data: {
        consultation_date: newConsultationDate,
        admin_notes: `[DIJADWALKAN ULANG] ${rescheduleReason}`,
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

    return res.status(200).json({
      success: true,
      message: "Konseling berhasil di-reschedule",
      data: updatedConsultation,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Terjadi kesalahan saat reschedule konseling",
    });
  }
}
```

**Response (Success)**:

```json
{
  "success": true,
  "message": "Konseling berhasil di-reschedule",
  "data": {
    "consultation_id": "CS001",
    "murid_id": "user-uuid-murid",
    "admin_id": "user-uuid-admin",
    "topic": "Konsultasi Pilihan Jurusan",
    "status": "ACCEPTED",
    "consultation_date": "2024-01-25T10:00:00.000Z",
    "consultation_time": "10:00",
    "description": "Ingin berkonsultasi tentang pilihan jurusan kuliah",
    "admin_notes": "[DIJADWALKAN ULANG] Bentrok dengan rapat sekolah",
    "is_active": true,
    "created_at": "2024-01-20T08:00:00.000Z",
    "updated_at": "2024-01-20T14:30:00.000Z",
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

**Response (Error - Not ACCEPTED)**:

```json
{
  "success": false,
  "message": "Hanya konseling dengan status ACCEPTED yang dapat di-reschedule"
}
```

**Response (Error - Schedule Conflict)**:

```json
{
  "success": false,
  "message": "Jadwal konseling bentrok dengan konseling lain. Silakan pilih waktu lain."
}
```

**Response (Error - Date in Past)**:

```json
{
  "success": false,
  "message": "Tanggal konseling harus minimal 5 menit dari sekarang"
}
```

**Response (Error - Missing Reason)**:

```json
{
  "success": false,
  "message": "Alasan reschedule wajib diisi"
}
```

---

## 🔌 API ENDPOINTS

### **GET /api/consultations**

- **Purpose**: Mengambil semua data konsultasi untuk admin yang sedang login
- **Auth**: Required (JWT Token)
- **Response**: Array of consultation objects dengan filter by admin_id

### **GET /api/consultations/booked-slots/:date**

- **Purpose**: Mengambil time slots yang sudah booked untuk tanggal tertentu
- **Auth**: Required (JWT Token)
- **Params**: `date` - Date string (YYYY-MM-DD)
- **Response**: Array of booked time slots

### **PATCH /api/consultations/:id/reschedule**

- **Purpose**: Menjadwalkan ulang konsultasi yang berstatus ACCEPTED
- **Auth**: Required (JWT Token)
- **Params**: `id` - Consultation ID
- **Body**:
  - `newDate` (required): ISO DateTime string untuk jadwal baru
  - `rescheduleReason` (required): Alasan reschedule
- **Response**: Updated consultation object
- **Validations**:
  - Consultation must exist
  - Status must be ACCEPTED
  - New date must be at least 5 minutes in future
  - No schedule conflict with other consultations

---

## ✨ KEY FEATURES

### **1. Interactive Calendar Picker**

- Modern calendar UI dengan shadcn/ui
- Disable tanggal yang sudah lewat
- Visual feedback untuk tanggal yang dipilih
- Format tanggal Indonesia

### **2. Smart Time Slot Selection**

- Dropdown time slots dari 08:00 - 17:00
- Auto disable slots yang sudah booked
- Auto disable past time slots untuk hari ini
- Visual indicator untuk disabled slots

### **3. Real-time Booked Slots Fetching**

- Fetch booked slots setiap kali tanggal berubah
- Prevent double booking
- Exclude current consultation dari conflict check

### **4. Comprehensive Validation**

- Frontend validation:
  - Date required
  - Time required
  - Reschedule reason required (tidak boleh kosong)
- Backend validation:
  - Date format validation
  - Future date validation (min 5 minutes)
  - Status validation (only ACCEPTED can be rescheduled)
  - Schedule conflict check
  - Required fields validation

### **5. Admin Notes Tracking**

- Auto update admin_notes dengan format: `[DIJADWALKAN ULANG] {reason}`
- History tracking untuk reschedule actions
- Reason visible di consultation details

### **6. Optimistic UI Update**

- Consultation langsung update di list setelah reschedule
- Map consultations state untuk update specific item
- Instant feedback tanpa full page reload
- Better user experience

---

## 🔐 SECURITY CONSIDERATIONS

1. **JWT Authentication**: Setiap request memerlukan valid JWT token
2. **Authorization Headers**: Token dikirim via Authorization header
3. **Role-based Access**: Hanya admin yang bisa reschedule konsultasi
4. **Admin-Specific Data**: Admin hanya bisa reschedule konsultasi yang assigned ke mereka
5. **Consultation Existence Check**: Verify consultation exists before reschedule
6. **Status Validation**: Only ACCEPTED consultations can be rescheduled
7. **Date Validation**: Ensure new date is in future with minimum buffer
8. **Conflict Prevention**: Check schedule conflicts before allowing reschedule
9. **Required Fields Validation**: Reschedule reason wajib diisi

---

## 🎨 UI/UX FEATURES

### **Reschedule Button Design**:

- Yellow/warning color untuk reschedule action
- Icon calendar dengan arrow
- Text label "Reschedule"
- Positioned di action column (hanya untuk status ACCEPTED)

### **Reschedule Modal Design**:

**Header Section**:

- **Title**: "Reschedule Konseling"
- **Subtitle**: "Ubah jadwal konseling dengan [Nama Murid]"
- Yellow accent underline
- Close button (X) di top-right corner

**Current Schedule Display**:

- Gray background box
- Shows existing date and time
- Format Indonesia: "25 Januari 2024 pukul 10:00"

**Form Fields**:

1. **Date Picker**:

   - Calendar popover dengan shadcn/ui
   - Disable past dates
   - Calendar icon trigger
   - Format display: "25 Januari 2024"

2. **Time Slot Selector**:

   - Dropdown dengan clock icon
   - Auto populate slots 08:00 - 17:00
   - Gray out booked/past slots
   - Minus icon untuk disabled indicator

3. **Reschedule Reason**:
   - Textarea dengan label "Alasan Reschedule"
   - Red asterisk untuk required
   - Placeholder: "Masukkan alasan mengapa jadwal perlu diubah..."
   - 4 rows height
   - Character limit hint (optional)

**Action Buttons**:

- **Cancel**: Gray button "Batal"
- **Submit**: Primary button "Reschedule"
- Disabled state saat form tidak lengkap

### **Visual Feedback**:

- Success toast: "Konseling berhasil di-reschedule" (Green)
- Error toast: "Gagal reschedule konseling" (Red)
- Specific error messages untuk different validations
- Loading state pada button saat submit
- Immediate list update setelah reschedule

---

## 🔄 STATE MANAGEMENT

### **Reschedule Flow**:

1. User clicks "Reschedule" button pada active consultation card
2. Modal opens dengan current schedule information
3. User selects new date on calendar
4. System fetches booked slots untuk selected date
5. User selects available time slot (booked ones disabled)
6. User enters reschedule reason in textarea
7. User clicks "Reschedule" button
8. Frontend validation:
   - Check all required fields filled
   - Show error if any field missing
9. API call: `PATCH /api/consultations/:id/reschedule`
10. Backend validations:
    - Date format validation
    - Future date validation
    - Status check (must be ACCEPTED)
    - Schedule conflict check
11. Success response:
    - Update `consultation_date` in database
    - Update `admin_notes` with reschedule reason
    - Update consultations state in frontend
    - Close modal
    - Show success toast
    - Trigger notification refresh (optional untuk future implementation)
12. Error response:
    - Show specific error toast
    - Keep modal open untuk correction

---

## 📚 RELATED FILES

### **Frontend**:

- `client/src/pages/admin/kelolaKonseling/KelolaDataKonseling.tsx`
- `client/src/pages/admin/kelolaKonseling/Components/RescheduleModal.tsx`
- `client/src/pages/admin/kelolaKonseling/Components/ConsultationTable.tsx`
- `client/src/pages/admin/kelolaKonseling/Components/ConsultationCards.tsx`
- `client/src/components/ui/calendar.tsx` (shadcn/ui)
- `client/src/components/ui/popover.tsx` (shadcn/ui)
- `client/src/components/ui/button.tsx` (shadcn/ui)
- `client/src/utils/tokenManager.ts`
- `client/src/utils/notificationEvents.ts`

### **Backend**:

- `server/src/controllers/consultationController.ts`
- `server/src/routes/consultationRoutes.ts`
- `server/prisma/schema.prisma`

---

## 🐛 COMMON ISSUES & SOLUTIONS

### **Issue 1: "Jadwal konseling bentrok" error**

- **Cause**: Selected time slot conflicts dengan konsultasi lain
- **Solution**: Pilih tanggal/waktu lain yang available, check booked slots

### **Issue 2: Time slots tidak muncul atau semua disabled**

- **Cause**: Fetch booked slots failed atau semua slots sudah booked
- **Solution**: Pilih tanggal lain, check network connection

### **Issue 3: "Tanggal konseling harus minimal 5 menit dari sekarang" error**

- **Cause**: Selected datetime is too close atau sudah lewat
- **Solution**: Pilih tanggal/waktu yang lebih jauh ke depan

### **Issue 4: "Hanya konseling dengan status ACCEPTED yang dapat di-reschedule" error**

- **Cause**: Trying to reschedule consultation yang bukan status ACCEPTED
- **Solution**: Reschedule button seharusnya hidden untuk non-ACCEPTED status

### **Issue 5: Calendar tidak muncul saat click date picker**

- **Cause**: shadcn/ui components belum properly installed
- **Solution**: Check component installation, ensure Popover & Calendar imported

### **Issue 6: Alasan reschedule tidak tersimpan**

- **Cause**: Textarea value tidak ter-capture atau validation failed
- **Solution**: Ensure textarea onChange handler working, check required validation

### **Issue 7: Modal tidak close setelah successful reschedule**

- **Cause**: handleCloseRescheduleModal tidak ter-call
- **Solution**: Check success response handling, ensure modal state reset

---

## 🚀 FUTURE IMPROVEMENTS

1. **Notification to Student**: Send real-time notification ke murid saat jadwal di-reschedule
2. **Email Notification**: Send email ke murid dengan detail jadwal baru
3. **Reschedule History**: Track all reschedule history dengan timestamps
4. **Reschedule Limit**: Limit jumlah reschedule per consultation (e.g., max 3 times)
5. **Multi-day View**: Calendar view showing all consultations
6. **Drag-and-Drop Reschedule**: Drag consultation card ke tanggal/waktu baru
7. **Bulk Reschedule**: Reschedule multiple consultations sekaligus
8. **Reschedule Approval**: Require student approval untuk reschedule
9. **Auto-suggest Times**: Suggest available time slots based on preferences
10. **Conflict Resolution**: Show conflicting consultations dan suggest alternatives
11. **Reschedule Templates**: Pre-defined reschedule reasons untuk faster input
12. **Calendar Integration**: Sync dengan Google Calendar atau Outlook
13. **Reminder Settings**: Set reminders untuk rescheduled consultations
14. **Undo Reschedule**: Undo recent reschedule dalam waktu tertentu

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Maintainer**: EDUPATH Development Team
