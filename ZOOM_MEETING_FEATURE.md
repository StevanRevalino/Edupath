# Fitur Zoom Meeting untuk Admin/Guru BK

## Overview

Fitur ini memungkinkan admin/guru BK untuk membuat Zoom meeting langsung dari interface chat dengan siswa.

## Cara Menggunakan

### 1. Buka Halaman Live Chat

- Navigasi ke halaman "Kelola Live Chat" di dashboard admin
- Pilih siswa yang ingin dibuatkan Zoom meeting dari daftar chat

### 2. Buat Zoom Meeting

- Klik tombol **Video** (ikon video) di header chat
- Modal "Buat Zoom Meeting" akan muncul
- Isi form dengan informasi berikut:
  - **Topik Meeting**: Judul meeting (contoh: "Konseling Akademik")
  - **Tanggal**: Pilih tanggal meeting
  - **Waktu**: Pilih jam meeting
  - **Durasi**: Pilih durasi (15, 30, 45, 60, 90, atau 120 menit)
  - **Deskripsi**: (Opsional) Jelaskan tujuan meeting

### 3. Kirim Meeting

- Klik tombol **"Buat Meeting"**
- Sistem akan:
  - Membuat Zoom meeting
  - Mengirim notifikasi ke siswa
  - Mengirim link meeting ke chat
  - Menyimpan jadwal meeting

## Fitur

### Frontend (Client)

- **ZoomRequestModal.tsx**: Modal form untuk membuat Zoom meeting
- **KelolaLiveChat.tsx**: Integrasi tombol dan handler Zoom
- Validasi form
- Loading state saat submit
- Preview info siswa

### Backend (Server)

- **zoomController.ts**: Controller untuk handle Zoom API
- **zoomRoutes.ts**: Routes untuk endpoint Zoom
- Validasi authorization
- Generate meeting ID dan password
- Simpan ke database
- Kirim notifikasi ke siswa

### Database

Tabel baru yang ditambahkan:

1. **ZoomMeeting**

   - zoom_meeting_id (primary key)
   - meeting_id (unique)
   - consultation_id
   - host_id (admin)
   - topic
   - scheduled_time
   - duration
   - description
   - meeting_password
   - status (scheduled/started/ended/cancelled)

2. **Notification**
   - notification_id (primary key)
   - user_id
   - type
   - title
   - message
   - is_read
   - related_id
   - link

## API Endpoints

### POST /api/zoom/create-meeting

Membuat Zoom meeting baru

```json
{
  "consultationId": "string",
  "userId": "string",
  "topic": "string",
  "scheduledDate": "YYYY-MM-DD",
  "scheduledTime": "HH:MM",
  "duration": number,
  "description": "string"
}
```

### GET /api/zoom/meetings/:consultationId

Mendapatkan semua Zoom meetings untuk konsultasi

### PATCH /api/zoom/meeting/:meetingId/status

Update status meeting (scheduled/started/ended/cancelled)

### DELETE /api/zoom/meeting/:meetingId

Membatalkan meeting

## Cara Setup

### 1. Jalankan Migration Database

```bash
cd server
npx prisma migrate dev --name add_zoom_meeting_and_notification
npx prisma generate
```

### 2. Restart Server

```bash
npm run dev
```

### 3. Test Fitur

- Login sebagai admin
- Buka halaman Live Chat
- Pilih siswa yang sudah ada konsultasi ter-accept
- Klik tombol Video untuk membuat meeting

## Notes

- Link Zoom yang di-generate saat ini adalah placeholder
- Untuk produksi, perlu integrasi dengan Zoom API resmi
- Meeting hanya bisa dibuat untuk konsultasi yang sudah ter-accept
- Notifikasi otomatis dikirim ke siswa
- Link meeting juga dikirim melalui chat

## Future Improvements

1. Integrasi dengan Zoom API resmi
2. Real-time notification menggunakan WebSocket
3. Calendar view untuk jadwal meeting
4. Reminder otomatis sebelum meeting
5. Recording meeting
