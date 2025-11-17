# 📹 Zoom Meeting Integration - Arsitektur & Cara Kerja

## 🎯 Overview

Sistem Zoom Meeting di EduPath menggunakan **Zoom API Server-to-Server OAuth** untuk membuat meeting otomatis dengan dua tipe URL berbeda:

- **`start_url`** - URL khusus untuk Host (Admin) yang langsung memulai meeting
- **`join_url`** - URL untuk Participant (Student) yang join meeting

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Admin (KelolaLiveChat.tsx)          Student (ChatView.tsx)     │
│  ┌────────────────────┐               ┌────────────────────┐   │
│  │ 1. Klik "Buat Zoom"│               │ 4. Terima Notif    │   │
│  │ 2. Isi Form        │               │ 5. Lihat Chat      │   │
│  │ 3. Submit          │               │ 6. Klik Join       │   │
│  └────────┬───────────┘               └────────┬───────────┘   │
│           │                                    │                │
│           │ POST /api/zoom/create-meeting      │                │
│           └──────────────┬─────────────────────┘                │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  zoomController.ts                                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. Validasi request                                       │  │
│  │ 2. Generate current date/time                            │  │
│  │ 3. Call ZoomService.createMeeting()                      │  │
│  │ 4. Save to database:                                     │  │
│  │    - meeting_id, join_url, start_url                     │  │
│  │ 5. Send message to chat dengan format khusus             │  │
│  │ 6. Return response dengan kedua URL                      │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│                       ▼                                          │
│  zoomService.ts                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. Get OAuth Token dari Zoom                             │  │
│  │ 2. POST ke Zoom API                                      │  │
│  │ 3. Zoom Returns:                                         │  │
│  │    {                                                     │  │
│  │      id: 123456789,                                      │  │
│  │      join_url: "https://zoom.us/j/...",  ← Participant  │  │
│  │      start_url: "https://zoom.us/s/...", ← Host         │  │
│  │      password: "abc123"                                  │  │
│  │    }                                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ZOOM API                                    │
├─────────────────────────────────────────────────────────────────┤
│  • Creates scheduled meeting                                     │
│  • Generates 2 different URLs                                    │
│  • Returns meeting details                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

### 1. Zoom OAuth Server-to-Server

```typescript
// zoomService.ts - Line 49-75

async getAccessToken(): Promise<string> {
  // Credentials dari environment variables
  const credentials = Buffer.from(
    `${this.clientId}:${this.clientSecret}`
  ).toString("base64");

  // Request ke Zoom OAuth endpoint
  const response = await axios.post(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${this.accountId}`,
    {},
    {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    }
  );

  // Save token untuk reuse
  this.accessToken = response.data.access_token;
  this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

  return this.accessToken;
}
```

**Environment Variables Required:**

```env
ZOOM_ACCOUNT_ID=your_account_id
ZOOM_CLIENT_ID=your_client_id
ZOOM_CLIENT_SECRET=your_client_secret
```

---

## 📡 API Flow - Create Meeting

### Step 1: Admin Request (Frontend)

```typescript
// KelolaLiveChat.tsx - Line 516-545

const handleZoomRequest = async (data: ZoomRequestData) => {
  const response = await axios.post(
    `${API_URL}/api/zoom/create-meeting`,
    {
      consultationId: selectedUser.consultation_id,
      userId: selectedUser.user_id,
      topic: data.topic,
      scheduledDate: now.toISOString().split("T")[0], // YYYY-MM-DD
      scheduledTime: now.toTimeString().slice(0, 5), // HH:MM
      description: data.description,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
```

### Step 2: Backend Processing (Controller)

```typescript
// zoomController.ts - Line 30-160

async createMeeting(req: Request, res: Response) {
  // 1. Validasi input
  const { consultationId, userId, topic, scheduledDate, scheduledTime, description } = req.body;

  // 2. Generate DateTime
  const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);

  // 3. Call Zoom Service
  const zoomMeeting = await zoomService.createMeeting({
    topic: topic,
    start_time: scheduledDateTime.toISOString(),
    duration: 60,
    timezone: "Asia/Jakarta",
    agenda: description,
  });

  // 4. Get both URLs from Zoom response
  meetingId = zoomMeeting.id.toString();
  joinUrl = zoomMeeting.join_url;    // ← untuk Participant
  startUrl = zoomMeeting.start_url;  // ← untuk Host

  // 5. Save ke database
  await prisma.zoomMeeting.create({
    data: {
      meeting_id: meetingId,
      consultation_id: consultationId,
      host_id: adminId,
      topic: topic,
      scheduled_time: scheduledDateTime,
      meeting_password: meetingPassword,
      join_url: joinUrl,    // ✅ Disimpan
      start_url: startUrl,  // ✅ Disimpan
      status: "scheduled",
    },
  });

  // 6. Return response
  return res.status(201).json({
    success: true,
    data: {
      joinUrl: joinUrl,
      startUrl: startUrl,
      // ... other data
    },
  });
}
```

### Step 3: Zoom API Call (Service)

```typescript
// zoomService.ts - Line 87-147

async createMeeting(config: ZoomMeetingConfig): Promise<ZoomMeetingResponse> {
  const token = await this.getAccessToken();

  // Meeting configuration
  const meetingData = {
    topic: config.topic,
    type: 2, // Scheduled meeting
    start_time: config.start_time,
    duration: config.duration,
    timezone: config.timezone,
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: false,      // ✅ Participant harus tunggu host
      mute_upon_entry: true,
      waiting_room: true,             // ✅ Enable waiting room
    },
  };

  // POST ke Zoom API
  const response = await axios.post(
    `https://api.zoom.us/v2/users/me/meetings`,
    meetingData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  // Zoom returns 2 URLs
  return {
    id: response.data.id,
    join_url: response.data.join_url,    // https://zoom.us/j/123456789?pwd=...
    start_url: response.data.start_url,  // https://zoom.us/s/123456789?pwd=...
  };
}
```

---

## 🔗 Perbedaan `start_url` vs `join_url`

### `start_url` (Host/Admin)

```
https://zoom.us/s/123456789?pwd=abc123&zak=xyz...
         ↑
       /s/ = Start (Host)
```

**Karakteristik:**

- ✅ Langsung jadi **Host** saat buka link
- ✅ **Tidak perlu waiting** untuk meeting dimulai
- ✅ Punya **full control** (mute, kick, record, etc.)
- ✅ Meeting otomatis **dimulai** saat host join
- ⚠️ Hanya bisa digunakan oleh **1 orang** (yang create meeting)

**Flow Admin:**

1. Admin klik "Start Meeting (Host)" (button hijau)
2. Browser buka `start_url`
3. Zoom desktop app launch otomatis
4. Admin langsung masuk sebagai Host
5. Meeting dimulai, waiting room aktif

### `join_url` (Participant/Student)

```
https://zoom.us/j/123456789?pwd=abc123
         ↑
       /j/ = Join (Participant)
```

**Karakteristik:**

- 👥 Bisa digunakan **banyak orang**
- ⏳ **Waiting room** sampai host admit
- 🚫 **Tidak bisa start** meeting sendiri
- 👁️ Hanya bisa **view** (limited control)
- 📢 Muncul notif "Waiting for host to start the meeting"

**Flow Student:**

1. Student klik "Join Zoom Meeting" (button biru)
2. Browser buka `join_url`
3. Zoom desktop app launch
4. Masuk ke **waiting room**
5. Menunggu host admit
6. Setelah admitted, baru bisa join meeting

---

## 💬 Format Pesan Chat

### Backend - Kirim Message

```typescript
// KelolaLiveChat.tsx - Line 546-552

const zoomMessage = `🎥 Zoom Meeting Dibuat
━━━━━━━━━━━━━━━━━━━
📋 ${data.topic}
🔗 ${zoomData.joinUrl}       ← Join URL untuk student
🔗HOST ${zoomData.startUrl}  ← Start URL untuk admin (hidden marker)
🔑 ID: ${zoomData.zoomMeetingId}
🔐 Pass: ${zoomData.password}`;

await axios.post(`${API_URL}/api/chat/messages/${selectedUser.room_id}`, {
  message: zoomMessage,
});
```

### Frontend Admin - Parse & Display

```typescript
// KelolaLiveChat.tsx - Line 897-933

if (line.startsWith("🔗")) {
  const isHostUrl = line.startsWith("🔗HOST");

  if (isHostUrl) {
    // Extract start_url
    const url = line.replace("🔗HOST ", "").trim();

    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <button className="bg-green-600 hover:bg-green-700">
          <Video /> Start Meeting (Host)
        </button>
      </a>
    );
  } else {
    // Hide regular join URL from admin
    return null;
  }
}
```

**Output untuk Admin:**

```
┌────────────────────────────────────────┐
│ 🎥 Zoom Meeting Dibuat                 │
├────────────────────────────────────────┤
│ 📋 Konseling Akademik                  │
│ ┌────────────────────────────────────┐ │
│ │ 🎥 Start Meeting (Host)            │ │ ← Green button (start_url)
│ └────────────────────────────────────┘ │
│ 🔑 ID: 123 456 789                     │
│ 🔐 Pass: abc123                        │
└────────────────────────────────────────┘
```

### Frontend Student - Parse & Display

```typescript
// ChatView.tsx - Line 328-358

if (line.startsWith("🔗")) {
  // Skip HOST URL (hanya untuk admin)
  if (line.startsWith("🔗HOST")) {
    return null; // ← Hidden dari student
  }

  // Extract join_url
  const url = line.replace("🔗 ", "").trim();

  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <button className="bg-primary hover:bg-primary-light">
        <Video /> Join Zoom Meeting
      </button>
    </a>
  );
}
```

**Output untuk Student:**

```
┌────────────────────────────────────────┐
│ 🎥 Zoom Meeting Dibuat                 │
├────────────────────────────────────────┤
│ 📋 Konseling Akademik                  │
│ ┌────────────────────────────────────┐ │
│ │ 🎥 Join Zoom Meeting               │ │ ← Blue button (join_url)
│ └────────────────────────────────────┘ │
│ 🔑 ID: 123 456 789                     │
│ 🔐 Pass: abc123                        │
└────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

```prisma
model ZoomMeeting {
  zoom_meeting_id  String       @id @default(cuid())
  meeting_id       String       @unique          // Zoom meeting ID (123456789)
  consultation_id  String
  host_id          String                        // Admin user_id
  topic            String
  scheduled_time   DateTime
  description      String?
  meeting_password String
  join_url         String       @default("")     // ✅ URL untuk participant
  start_url        String       @default("")     // ✅ URL untuk host
  status           ZoomStatus   @default(scheduled)
  created_at       DateTime     @default(now())
  updated_at       DateTime     @updatedAt

  consultation     Consultation @relation(...)
  host             User         @relation(...)
}
```

**Query untuk ambil meeting:**

```typescript
// Saat admin/student request meeting details
const meetings = await prisma.zoomMeeting.findMany({
  where: { consultation_id: consultationId },
  include: { host: true },
});

// Backend logic menentukan URL mana yang dikembalikan
const isHost = userRole === "ADMIN" || userId === meeting.host_id;
const meetingUrl = isHost ? meeting.start_url : meeting.join_url;

return {
  ...meeting,
  meetingUrl, // URL yang tepat sesuai role
  isHost, // Flag untuk frontend
};
```

---

## 🎭 User Experience Flow

### Admin Journey (Host)

```
1. [Admin Dashboard] → Kelola Live Chat
2. Pilih student dari list
3. Klik icon Video (🎥)
4. Modal muncul dengan form:
   - Topic (auto-filled: "Konseling Akademik")
   - Date/Time (auto-filled: waktu sekarang)
   - Description (optional)
5. Klik "Buat Meeting"
6. Backend:
   ├─ Call Zoom API
   ├─ Create meeting dengan settings
   ├─ Get start_url & join_url
   ├─ Save to database
   └─ Send message ke chat
7. Message muncul di chat dengan:
   ├─ Green button "Start Meeting (Host)"
   └─ Meeting details
8. Admin klik button hijau
9. Browser open start_url
10. Zoom app launch sebagai HOST
11. Meeting started! ✅
```

### Student Journey (Participant)

```
1. [Student Dashboard] → Konseling
2. Dapat notifikasi "Zoom Meeting Dibuat"
3. Buka chat dengan admin
4. Lihat message Zoom Meeting dengan:
   ├─ Blue button "Join Zoom Meeting"
   └─ Meeting details
5. Student klik button biru
6. Browser open join_url
7. Zoom app launch
8. Masuk waiting room... ⏳
9. Waiting for host to admit
10. Host admit student
11. Joined meeting! ✅
```

---

## 🔒 Security & Best Practices

### 1. Environment Variables

```env
# Never commit these to git!
ZOOM_ACCOUNT_ID=abc123
ZOOM_CLIENT_ID=xyz789
ZOOM_CLIENT_SECRET=secret_key_here
```

### 2. Token Caching

```typescript
// Token di-cache dan reuse sampai expired
if (this.accessToken && Date.now() < this.tokenExpiry) {
  return this.accessToken; // ← Reuse existing token
}
// Otherwise, request new token
```

### 3. URL Security

- ✅ `start_url` tidak pernah terlihat di UI student
- ✅ `join_url` bisa dishare ke multiple participants
- ✅ Password auto-generated oleh Zoom
- ✅ Waiting room enabled by default

### 4. Meeting Settings

```typescript
settings: {
  host_video: true,
  participant_video: true,
  join_before_host: false,     // ✅ Prevent early joining
  mute_upon_entry: true,        // ✅ Reduce noise
  waiting_room: true,           // ✅ Host controls entry
  approval_type: 2,             // ✅ No registration needed
  auto_recording: "none",       // ✅ Privacy
}
```

---

## 🐛 Troubleshooting

### Problem: "Waiting for host to start the meeting"

**Cause:** Admin menggunakan `join_url` instead of `start_url`

**Solution:**

- Pastikan admin klik button **hijau** "Start Meeting (Host)"
- Bukan button biru "Join Zoom Meeting"

### Problem: Multiple hosts in meeting

**Cause:** `start_url` di-share ke multiple people

**Solution:**

- `start_url` hanya untuk admin yang create meeting
- Student harus pakai `join_url`

### Problem: 401 Unauthorized from Zoom API

**Cause:** Invalid credentials atau token expired

**Solution:**

```bash
# Check environment variables
echo $ZOOM_ACCOUNT_ID
echo $ZOOM_CLIENT_ID
echo $ZOOM_CLIENT_SECRET

# Verify credentials di Zoom Marketplace
# https://marketplace.zoom.us/
```

### Problem: Meeting tidak muncul di database

**Cause:** Prisma schema belum di-push

**Solution:**

```bash
cd server
npx prisma db push
npx prisma generate
```

---

## 📊 Monitoring & Logs

### Backend Logs

```typescript
console.log("✅ Zoom meeting created:", meetingId);
console.log("✅ Zoom access token obtained successfully");
console.log("❌ Failed to create Zoom meeting:", error.message);
```

### Check Zoom Dashboard

1. Login ke https://zoom.us/
2. Go to "Meetings" tab
3. Verify meeting created with correct:
   - Topic
   - Start time
   - Host
   - Settings (waiting room, etc.)

---

## 🚀 Future Improvements

### 1. Real-time Status Updates

```typescript
// Use Socket.io untuk update meeting status
socket.emit("meeting-started", { meetingId });
socket.emit("participant-joined", { userId });
```

### 2. Recording Management

```typescript
settings: {
  auto_recording: "cloud",  // Auto-record to cloud
  recording_authentication: true,
}
```

### 3. Meeting Analytics

```typescript
// Track meeting metrics
- Duration
- Participants count
- Recording availability
- Chat logs
```

### 4. Recurring Meetings

```typescript
type: 8, // Recurring meeting
recurrence: {
  type: 2, // Weekly
  repeat_interval: 1,
  weekly_days: "1,3,5", // Mon, Wed, Fri
}
```

---

## 📚 API Reference

### Zoom API Endpoints Used

**1. OAuth Token**

```
POST https://zoom.us/oauth/token
Query: grant_type=account_credentials&account_id={ACCOUNT_ID}
Header: Authorization: Basic {base64(CLIENT_ID:CLIENT_SECRET)}
Response: { access_token, expires_in }
```

**2. Create Meeting**

```
POST https://api.zoom.us/v2/users/me/meetings
Header: Authorization: Bearer {ACCESS_TOKEN}
Body: { topic, type, start_time, duration, settings }
Response: { id, join_url, start_url, password }
```

### EduPath API Endpoints

**1. Create Meeting**

```
POST /api/zoom/create-meeting
Auth: Bearer {JWT_TOKEN}
Body: {
  consultationId: string,
  userId: string,
  topic: string,
  scheduledDate: string,
  scheduledTime: string,
  description?: string
}
Response: {
  success: true,
  data: {
    meetingId: string,
    zoomMeetingId: string,
    joinUrl: string,
    startUrl: string,
    password: string,
    status: "scheduled"
  }
}
```

**2. Get Meetings**

```
GET /api/zoom/meetings/:consultationId
Auth: Bearer {JWT_TOKEN}
Response: {
  success: true,
  data: [{
    zoom_meeting_id: string,
    topic: string,
    meetingUrl: string,  // Automatically correct URL based on role
    isHost: boolean,     // true if admin
    ...
  }]
}
```

---

## ✅ Summary

### Key Points:

1. **2 URL Types**: `start_url` (host) & `join_url` (participant)
2. **Automatic Role Detection**: Backend returns correct URL based on user role
3. **Smart UI**: Admin sees green "Start" button, Student sees blue "Join" button
4. **Security**: Host URL hidden from students via message parsing
5. **Database**: Both URLs saved for flexibility
6. **Real Settings**: Waiting room, host control, password protection

### Why This Works:

- ✅ Admin **immediately** becomes host (no waiting)
- ✅ Student **must wait** for host to admit
- ✅ **Clear separation** of roles and permissions
- ✅ **Single source of truth** (database stores both URLs)
- ✅ **Flexible display** (parse message to show correct button per role)

---

**Last Updated:** November 17, 2025
**Version:** 1.0.0
**Author:** EduPath Development Team
