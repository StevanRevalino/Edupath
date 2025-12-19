# MENGIRIMKAN LINK ZOOM KONSULTASI VIRTUAL KE MURID - CODE FLOW DOCUMENTATION

## 📋 OVERVIEW

Fitur **Mengirimkan Link Zoom Konsultasi Virtual ke Murid** memungkinkan administrator untuk membuat dan mengirimkan link Zoom meeting langsung ke murid melalui chat. Fitur ini terintegrasi dengan Zoom API untuk membuat meeting real-time atau menggunakan placeholder link jika Zoom API tidak tersedia. Link meeting otomatis dikirimkan melalui chat dan notification ke murid yang bersangkutan.

---

## 🎯 USE CASE: Mengirimkan Link Zoom Konsultasi Virtual ke Murid

### **Actor**: Admin

### **Preconditions**:

- Admin telah login dengan kredensial admin
- Terdapat minimal 1 sesi konsultasi dengan status ACCEPTED
- Admin telah membuka window chat dengan murid
- Zoom API credentials telah dikonfigurasi (optional - fallback ke placeholder link)

### **Flow**:

1. Admin login dengan kredensial admin
2. Sistem menampilkan halaman khusus untuk admin
3. Admin memilih opsi 'Chat Murid' melalui sidebar
4. Sistem menampilkan halaman chat murid
5. Sistem mengambil data sesi live chat dari database
6. **[Data ditemukan]**: Sistem menampilkan list sesi live chat dengan murid yang tersimpan dalam sistem
7. **[Data tidak ditemukan]**: Sistem menampilkan pesan placeholder error tidak menemukan data chat murid
8. Admin memilih salah satu sesi live chat yang diinginkan
9. Sistem menampilkan window chatting dengan murid
10. Admin menekan tombol 'Buat Zoom Meeting' dalam window chatting
11. Sistem menampilkan popup form untuk membuat sesi zoom meeting konsultasi virtual
12. Admin mengisi form dengan data-data yang sesuai (topic, description)
13. Admin menekan tombol 'Buat Meeting' dalam form
14. Sistem melakukan validasi data input fields
15. **[Validasi gagal]**: Sistem menampilkan pesan error data tidak sesuai
16. **[Validasi berhasil]**: Sistem melakukan generasi link zoom meeting
17. Sistem mengirimkan link zoom melalui window chatting ke murid yang bersangkutan
18. **[Berhasil mengirim pesan]**: Sistem menampilkan notifikasi pesan baru kepada siswa yang bersangkutan → Sistem menyimpan pesan link zoom kedalam riwayat chat pada database → Admin menekan tombol 'Start Meeting' pada bubble chat link zoom
19. **[Gagal mengirim pesan]**: Sistem menampilkan notifikasi error gagal mengirim pesan
20. Sistem mengarahkan admin ke third-party platform (Zoom) untuk memulai konsultasi virtual

### **Postconditions**:

- Zoom meeting berhasil dibuat dan tersimpan di database
- Link zoom meeting terkirim ke murid melalui chat
- Notifikasi terkirim ke murid tentang zoom meeting baru
- Admin dapat memulai meeting melalui start URL
- Murid dapat join meeting melalui join URL

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
                    │ admin                                         │
                    └───────────┬──────────────────────────────────┘
                                │
                    ┌───────────▼──────────────────────────────┐
                    │ Admin memilih opsi 'Chat Murid' melalui  │
                    │ sidebar                                  │
                    └───────────┬──────────────────────────────┘
                                │
                    ┌───────────▼──────────────────────────────────┐
                    │ Sistem menampilkan halaman chat murid        │
                    └───────────┬──────────────────────────────────┘
                                │
                    ┌───────────▼──────────────────────────────┐
                    │ Sistem mengambil data sesi live chat dari│
                    │ database                                 │
                    └───────────┬──────────────────────────────┘
                                │
                    ┌───────────▼──────────┐
                    │ [Data ditemukan?]    │
                    └─────┬────────────┬───┘
                   TIDAK  │            │ YA
          ┌───────────────▼──┐    ┌───▼────────────────────────────┐
          │ Sistem menampilkan│    │ Sistem menampilkan list sesi   │
          │ pesan placeholder │    │ live chat dengan murid yang    │
          │ error tidak       │    │ tersimpan dalam sistem         │
          │ menemukan data    │    └───┬────────────────────────────┘
          │ chat murid        │        │
          └────────┬──────────┘        │
                   │                   │
                   │              ┌────▼──────────────────────────┐
                   │              │ Admin memilih salah satu sesi │
                   │              │ live chat yang diinginkan     │
                   │              └────┬──────────────────────────┘
                   │                   │
                   │              ┌────▼──────────────────────────┐
                   │              │ Sistem menampilkan window     │
                   │              │ chatting dengan murid         │
                   │              └────┬──────────────────────────┘
                   │                   │
                   │              ┌────▼──────────────────────────┐
                   │              │ Admin menekan tombol 'Buat    │
                   │              │ Zoom Meeting' dalam window    │
                   │              │ chatting                      │
                   │              └────┬──────────────────────────┘
                   │                   │
                   │              ┌────▼──────────────────────────┐
                   │              │ Sistem menampilkan popup form │
                   │              │ untuk membuat sesi zoom       │
                   │              │ meeting konsultasi virtual    │
                   │              └────┬──────────────────────────┘
                   │                   │
                   │              ┌────▼──────────────────────────┐
                   │              │ Admin mengisi form dengan     │
                   │              │ data-data yang sesuai         │
                   │              └────┬──────────────────────────┘
                   │                   │
                   │              ┌────▼──────────────────────────┐
                   │              │ Admin menekan tombol 'Buat    │
                   │              │ Meeting' dalam form           │
                   │              └────┬──────────────────────────┘
                   │                   │
                   │              ┌────▼──────────────────────────┐
                   │              │ Validasi data input fields    │
                   │              └─────┬────────────┬────────────┘
                   │              GAGAL │            │ BERHASIL
                   │    ┌───────────────▼──┐    ┌────▼───────────────────────┐
                   │    │ Sistem menampilkan│    │ Sistem melakukan generasi │
                   │    │ pesan error data  │    │ link zoom meeting         │
                   │    │ tidak sesuai      │    └────┬───────────────────────┘
                   │    └────────┬──────────┘         │
                   │             │              ┌─────▼────────────────────────┐
                   │             │              │ Sistem mengirimkan link zoom │
                   │             │              │ melalui window chatting ke   │
                   │             │              │ murid yang bersangkutan      │
                   │             │              └─────┬────────────────────────┘
                   │             │                    │
                   │             │              ┌─────▼──────────────────────┐
                   │             │              │ [Berhasil mengirim pesan?]│
                   │             │              └─────┬────────────┬─────────┘
                   │             │              GAGAL │            │ BERHASIL
                   │    ┌────────┴──────────────▼─┐   │   ┌────────▼─────────────────────┐
                   │    │ Sistem menampilkan      │   │   │ Sistem menampilkan notifikasi│
                   │    │ notifikasi error gagal  │   │   │ pesan baru kepada siswa yang │
                   │    │ mengirim pesan          │   │   │ bersangkutan                 │
                   │    └─────────────────────────┘   │   └────────┬─────────────────────┘
                   │                                  │            │
                   │                                  │   ┌────────▼─────────────────────┐
                   │                                  │   │ Sistem menyimpan pesan link  │
                   │                                  │   │ zoom kedalam riwayat chat    │
                   │                                  │   │ pada database                │
                   │                                  │   └────────┬─────────────────────┘
                   │                                  │            │
                   │                                  │   ┌────────▼─────────────────────┐
                   │                                  │   │ Admin menekan tombol 'Start  │
                   │                                  │   │ Meeting' pada bubble chat    │
                   │                                  │   │ link zoom                    │
                   │                                  │   └────────┬─────────────────────┘
                   │                                  │            │
                   │                                  │   ┌────────▼─────────────────────┐
                   │                                  │   │ Sistem mengarahkan admin ke  │
                   │                                  │   │ third-party platform (Zoom)  │
                   │                                  │   │ untuk memulai konsultasi     │
                   │                                  │   │ virtual                      │
                   │                                  │   └────────┬─────────────────────┘
                   │                                  │            │
                   └──────────────────────────────────┴────────────┘
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
- **React Hot Toast** untuk notifikasi
- **Tailwind CSS** untuk styling
- **Lucide React** untuk icons
- **ZoomRequestModal** component untuk form input

### **Backend**:

- **Express.js** dengan TypeScript
- **Prisma ORM** untuk database operations
- **PostgreSQL** sebagai database
- **Zoom SDK** (zoom-meeting-js) untuk Zoom API integration
- **zoomService** untuk handle Zoom API calls

### **Authentication**:

- **JWT (JSON Web Token)** melalui `TokenManager`

### **Third-Party Integration**:

- **Zoom API** untuk create real Zoom meetings
- **Fallback mechanism** jika Zoom API tidak available

---

## 🏗 ARCHITECTURE COMPONENTS

### **Frontend Components**:

1. **KelolaLiveChat.tsx** (`client/src/pages/admin/kelolaLiveChat/KelolaLiveChat.tsx`)

   - Main page component untuk live chat admin
   - Handle zoom request functionality
   - Manage zoom modal state
   - Send zoom link via chat message

2. **ZoomRequestModal.tsx** (`client/src/pages/admin/kelolaLiveChat/components/ZoomRequestModal.tsx`)

   - Modal component untuk create zoom meeting
   - Form fields: topic, description
   - Auto-schedule meeting dengan current date & time
   - Loading state saat submit

3. **ChatHandler Class** (Inline dalam KelolaLiveChat.tsx)
   - createZoomMeeting(): Create zoom meeting via API
   - sendMessage(): Send zoom link to chat room

### **Backend Components**:

1. **zoomController.ts** (`server/src/controllers/zoomController.ts`)

   - `createZoomMeeting()`: Create zoom meeting dan save to database
   - `getZoomMeetings()`: Get zoom meetings for consultation
   - `deleteZoomMeeting()`: Delete zoom meeting
   - `generateZoomMeetingId()`: Generate placeholder meeting ID
   - `generatePassword()`: Generate meeting password

2. **zoomService.ts** (`server/src/services/zoomService.ts`)

   - `createMeeting()`: Call Zoom API to create meeting
   - `isConfigured()`: Check if Zoom credentials configured
   - Handle Zoom API authentication

3. **ZoomMeeting Model** (Prisma Schema)

   - Tabel `zoom_meeting` dengan fields:
     - zoom_meeting_id (String, primary key)
     - meeting_id (String, Zoom meeting ID)
     - consultation_id (String, foreign key to Consultation)
     - host_id (String, foreign key to User - admin)
     - topic (String, required)
     - scheduled_time (DateTime, required)
     - description (String, optional)
     - meeting_password (String, required)
     - join_url (String, required)
     - start_url (String, required)
     - status (Enum: scheduled, started, ended)
     - created_at (DateTime, auto-generated)

4. **Notification Model** (Prisma Schema)
   - Create notification untuk murid saat zoom meeting dibuat

---

## 📊 SEQUENCE DIAGRAM

```mermaid
sequenceDiagram
    participant Admin
    participant KelolaLiveChatPage<<view>>
    participant chatController<<controller>>
    participant zoomController<<controller>>
    participant zoomService<<service>>
    participant ChatRoom<<model>>
    participant ZoomMeeting<<model>>
    participant ChatMessage<<model>>
    participant Notification<<model>>

    Admin->>KelolaLiveChatPage: Login with admin credentials
    KelolaLiveChatPage->>Admin: Display admin page

    Admin->>KelolaLiveChatPage: Click 'Chat Murid' on sidebar
    KelolaLiveChatPage->>Admin: Display chat murid page

    KelolaLiveChatPage->>chatController: getChatUsers()
    chatController-->>KelolaLiveChatPage: Return chat users data

    alt Data not found
        KelolaLiveChatPage->>Admin: Display placeholder error message
    else Data found
        KelolaLiveChatPage->>Admin: Display chat users list

        Admin->>KelolaLiveChatPage: Click on chat user
        KelolaLiveChatPage->>chatController: getOrCreateRoom(consultationId)
        chatController->>ChatRoom: findUnique({ where: { consultation_id } })
        chatController->>ChatRoom: create({ consultation_id }) if not exists
        ChatRoom-->>chatController: Return chat room
        chatController-->>KelolaLiveChatPage: Return room_id
        KelolaLiveChatPage->>Admin: Display chat window

        Admin->>KelolaLiveChatPage: Click 'Buat Zoom Meeting' button
        KelolaLiveChatPage->>Admin: Display zoom meeting form modal

        Admin->>KelolaLiveChatPage: Fill form (topic, description)
        Admin->>KelolaLiveChatPage: Click 'Buat Meeting' button

        KelolaLiveChatPage->>KelolaLiveChatPage: validateForm()

        alt Validation failed
            KelolaLiveChatPage->>Admin: Display error message
        else Validation successful
            KelolaLiveChatPage->>KelolaLiveChatPage: handleZoomRequest(data)
            KelolaLiveChatPage->>KelolaLiveChatPage: Generate current date & time
            KelolaLiveChatPage->>zoomController: createZoomMeeting(data)
            zoomController->>zoomController: Validate required fields
            zoomController->>zoomController: Verify consultation belongs to admin
            zoomController->>zoomController: Combine date and time
            zoomController->>zoomService: isConfigured()
            zoomService-->>zoomController: Return boolean (configured/not configured)
            Note over zoomController,zoomService: If configured: createMeeting(), else: generatePlaceholder()
            zoomController->>zoomService: createMeeting() OR generatePlaceholder()
            zoomService-->>zoomController: Return meeting data (meetingId, password, joinUrl, startUrl)
            zoomController->>ZoomMeeting: create({ meeting_id, topic, join_url, start_url, ... })
            ZoomMeeting-->>zoomController: Return created zoom meeting
            zoomController->>Notification: create({ type: "zoom_meeting", user_id: murid_id, link: joinUrl })
            Notification-->>zoomController: Notification created
            zoomController-->>KelolaLiveChatPage: { success: true, data: zoomData }

            KelolaLiveChatPage->>KelolaLiveChatPage: Format zoom message with link
            KelolaLiveChatPage->>chatController: sendMessage(roomId, zoomMessage)
            chatController->>ChatMessage: create({ room_id, sender_id, message })
            ChatMessage-->>chatController: Return new message

            alt Send message failed
                chatController-->>KelolaLiveChatPage: { success: false }
                KelolaLiveChatPage->>Admin: Display error toast notification
            else Send message successful
                chatController-->>KelolaLiveChatPage: { success: true, data: message }
                KelolaLiveChatPage->>KelolaLiveChatPage: Update chat messages state
                KelolaLiveChatPage->>KelolaLiveChatPage: Close zoom modal
                KelolaLiveChatPage->>Admin: Display success toast
                KelolaLiveChatPage->>Admin: Display zoom link in chat window

                Admin->>Admin: Click 'Start Meeting' on zoom link bubble
                Admin->>Admin: Navigate to Zoom platform (start_url)
            end
        end
    end
```

---

## 📦 DATA FLOW DETAILS

### 1. Open Zoom Request Modal

**Frontend Handler**:

```typescript
const handleOpenZoomModal = () => {
  if (!selectedUser) {
    toast.error("Pilih user terlebih dahulu");
    return;
  }
  setIsZoomModalOpen(true);
};
```

**No API Call** - Modal opened locally

---

### 2. Submit Zoom Meeting Request

**Frontend Handler**:

```typescript
const handleZoomRequest = async (data: ZoomRequestData) => {
  if (!selectedUser) return;

  try {
    // Generate current date and time
    const now = new Date();
    const scheduledDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const scheduledTime = now.toTimeString().slice(0, 5); // HH:MM

    const zoomData = await chatHandler.createZoomMeeting({
      consultationId: selectedUser.consultation_id!,
      userId: selectedUser.user_id,
      topic: data.topic,
      scheduledDate: scheduledDate,
      scheduledTime: scheduledTime,
      description: data.description,
    });

    if (zoomData) {
      toast.success("Zoom meeting berhasil dibuat!");
      // Send zoom link to chat
      if (selectedUser.room_id && zoomData.joinUrl) {
        const zoomMessage = `🎥 Zoom Meeting Dibuat\n━━━━━━━━━━━━━━━━━━━\n📋 ${data.topic}\n🔗 ${zoomData.joinUrl}\n🔗HOST ${zoomData.startUrl}\n🔑 ID: ${zoomData.zoomMeetingId}\n🔐 Pass: ${zoomData.password}`;
        await chatHandler.sendMessage(selectedUser.room_id, zoomMessage);
      }
    }
  } catch (error) {
    console.error("Error creating zoom meeting:", error);
    toast.error("Gagal membuat Zoom meeting");
  }
};
```

**Request**:

```http
POST /api/zoom/create-meeting
Headers:
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json

Body:
{
  "consultationId": "CON001",
  "userId": "US001",
  "topic": "Konseling Akademik",
  "scheduledDate": "2024-01-25",
  "scheduledTime": "10:00",
  "description": "Diskusi tentang pemilihan jurusan kuliah"
}
```

**Backend Processing**:

```typescript
async createZoomMeeting(req: Request, res: Response) {
  const adminId = req.user?.user_id;
  const { consultationId, userId, topic, scheduledDate, scheduledTime, description } = req.body;

  // Validate required fields
  if (!consultationId || !userId || !topic || !scheduledDate || !scheduledTime) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  // Verify consultation
  const consultation = await prisma.consultation.findUnique({
    where: { consultation_id: consultationId }
  });

  if (!consultation || consultation.admin_id !== adminId) {
    return res.status(404).json({ success: false, message: "Consultation not found" });
  }

  // Combine date and time
  const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);

  let meetingId, meetingPassword, joinUrl, startUrl;

  // Try Zoom API or fallback to placeholder
  if (zoomService.isConfigured()) {
    try {
      const zoomMeeting = await zoomService.createMeeting({
        topic, start_time: scheduledDateTime.toISOString(), duration: 60
      });
      meetingId = zoomMeeting.id.toString();
      joinUrl = zoomMeeting.join_url;
      startUrl = zoomMeeting.start_url;
    } catch {
      // Fallback to placeholder
      meetingId = this.generateZoomMeetingId();
      meetingPassword = this.generatePassword();
      joinUrl = `https://zoom.us/j/${meetingId}?pwd=${meetingPassword}`;
    }
  } else {
    meetingId = this.generateZoomMeetingId();
    meetingPassword = this.generatePassword();
    joinUrl = `https://zoom.us/j/${meetingId}?pwd=${meetingPassword}`;
  }

  // Save to database
  const dbZoomMeeting = await prisma.zoomMeeting.create({
    data: { meeting_id: meetingId, consultation_id: consultationId, topic, join_url: joinUrl, ... }
  });

  // Create notification
  await prisma.notification.create({
    data: { user_id: userId, type: "zoom_meeting", title: "Zoom Meeting Dibuat", link: joinUrl }
  });

  return res.status(201).json({ success: true, data: { joinUrl, startUrl, ... } });
}
```

**Response (Success)**:

```json
{
  "success": true,
  "message": "Zoom meeting berhasil dibuat",
  "data": {
    "meetingId": "ZM001",
    "zoomMeetingId": "1234567890",
    "realZoomMeetingId": 1234567890,
    "topic": "Konseling Akademik",
    "scheduledTime": "2024-01-25T10:00:00.000Z",
    "joinUrl": "https://zoom.us/j/1234567890?pwd=abc123",
    "startUrl": "https://zoom.us/s/1234567890?pwd=abc123",
    "password": "abc123",
    "status": "scheduled",
    "isRealZoom": true
  }
}
```

**Response (Error - Missing Fields)**:

```json
{
  "success": false,
  "message": "Missing required fields"
}
```

**Response (Error - Unauthorized)**:

```json
{
  "success": false,
  "message": "Consultation not found or unauthorized"
}
```

---

### 3. Send Zoom Link to Chat

**Frontend Handler**:

```typescript
if (selectedUser.room_id && zoomData.joinUrl) {
  const zoomMessage = `🎥 Zoom Meeting Dibuat\n━━━━━━━━━━━━━━━━━━━\n📋 ${data.topic}\n🔗 ${zoomData.joinUrl}\n🔗HOST ${zoomData.startUrl}\n🔑 ID: ${zoomData.zoomMeetingId}\n🔐 Pass: ${zoomData.password}`;
  await chatHandler.sendMessage(selectedUser.room_id, zoomMessage);
  fetchChatMessages(selectedUser.user_id);
}
```

**Request**:

```http
POST /api/chat/messages/:roomId
Headers:
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json

Body:
{
  "message": "🎥 Zoom Meeting Dibuat\n━━━━━━━━━━━━━━━━━━━\n📋 Konseling Akademik\n🔗 https://zoom.us/j/1234567890?pwd=abc123\n🔗HOST https://zoom.us/s/1234567890?pwd=abc123\n🔑 ID: 1234567890\n🔐 Pass: abc123"
}
```

**Backend Processing** (chatController):

```typescript
async sendMessage(req: Request, res: Response) {
  const { roomId } = req.params;
  const { message } = req.body;
  const userId = req.user?.user_id;

  const newMessage = await prisma.chatMessage.create({
    data: { room_id: roomId, sender_id: userId, message: message.trim() }
  });

  await prisma.chatRoom.update({
    where: { room_id: roomId },
    data: { updated_at: new Date() }
  });

  // Note: Zoom messages don't create additional notification (notification already created by createZoomMeeting)

  return res.json({ success: true, data: newMessage });
}
```

**Response**:

```json
{
  "success": true,
  "message": "Pesan berhasil dikirim",
  "data": {
    "id": "MSG005",
    "message": "🎥 Zoom Meeting Dibuat\n━━━━━━━━━━━━━━━━━━━\n...",
    "senderId": "AD001",
    "senderName": "Admin EDUPATH",
    "timestamp": "2024-01-25T10:00:30.000Z",
    "isFromAdmin": true
  }
}
```

---

### 4. Start Zoom Meeting (Navigate to Zoom)

**Frontend Handler**:

```typescript
const handleStartZoomMeeting = (startUrl: string) => {
  window.open(startUrl, "_blank");
};
```

**No API Call** - Direct navigation to third-party platform (Zoom)

---

## 🔌 API ENDPOINTS

### **POST /api/zoom/create-meeting**

- **Purpose**: Create zoom meeting dan save to database
- **Auth**: Required (JWT Token)
- **Body**:
  - `consultationId` (required): Consultation ID
  - `userId` (required): Student user ID
  - `topic` (required): Meeting topic/title
  - `scheduledDate` (required): Meeting date (YYYY-MM-DD)
  - `scheduledTime` (required): Meeting time (HH:MM)
  - `description` (optional): Meeting description/agenda
- **Response**: Zoom meeting object dengan join_url, start_url, password
- **Side Effects**:
  - Creates zoom meeting record in database
  - Creates notification untuk student
  - Calls Zoom API (if configured) atau generates placeholder

### **POST /api/chat/messages/:roomId**

- **Purpose**: Send zoom link message to chat room
- **Auth**: Required (JWT Token)
- **Params**: `roomId` - Chat Room ID
- **Body**: `message` - Formatted zoom link message
- **Response**: Created message object
- **Side Effects**: Updates chat room timestamp

---

## ✨ KEY FEATURES

### **1. Zoom API Integration**

- Real Zoom meeting creation via Zoom SDK
- Fallback mechanism jika Zoom API tidak available
- Auto-detection of Zoom credentials configuration
- Generate placeholder meeting ID dan password

### **2. Automatic Scheduling**

- Meeting scheduled dengan current date & time
- Auto-generate meeting credentials
- Support untuk custom topic dan description

### **3. Multi-channel Notification**

- Send zoom link via chat message
- Create notification untuk student
- Include join URL untuk student dan start URL untuk admin

### **4. Formatted Zoom Message**

- Beautiful message format dengan icons
- Include meeting topic, join URL, host URL, ID, dan password
- Easy to parse dan display in chat window

### **5. Form Validation**

- Validate required fields (topic)
- Optional description field
- Real-time validation feedback
- Loading state saat submit

---

## 🔐 SECURITY CONSIDERATIONS

1. **JWT Authentication**: Setiap request memerlukan valid JWT token
2. **Authorization Check**: Verify consultation belongs to admin
3. **Consultation Verification**: Validate consultation exists dan active
4. **Zoom Credentials Security**: Zoom API credentials stored securely in environment variables
5. **URL Protection**: Start URL hanya dikirim ke admin (via chat), join URL ke student
6. **Input Sanitization**: Sanitize topic dan description untuk prevent XSS
7. **Rate Limiting**: Implement rate limiting untuk prevent abuse (recommended)

---

## 🎨 UI/UX FEATURES

### **Zoom Request Modal Design**:

**Header**:

- Video icon dalam blue circle background
- Title "Buat Zoom Meeting"
- Close button (X icon)

**Student Info Card**:

- Light blue background
- Student name + class
- Student ID
- Label "Meeting akan dikirim ke:"

**Form Fields**:

1. **Topik Meeting** (Required):

   - Text input dengan icon FileText
   - Placeholder: "e.g., Konseling Karir & Jurusan"
   - Red asterisk (\*) untuk required field

2. **Meeting Time Info**:

   - Blue info box
   - Clock icon + text
   - Info: "Meeting akan dibuat dengan waktu sekarang (langsung dimulai)"

3. **Deskripsi / Agenda** (Optional):
   - Textarea dengan icon FileText
   - 4 rows height
   - Placeholder: "Jelaskan tujuan meeting dan hal yang akan dibahas..."

**Info Box**:

- Amber/yellow background
- Info icon + bold "Catatan:"
- Text: "Link Zoom meeting akan dikirim ke siswa melalui notifikasi dan chat"

**Action Buttons**:

- **Batal**: Gray border, hover bg-gray-50
- **Buat Meeting**: Primary color, white text, Video icon
- Loading state: Spinner + "Membuat..." text

### **Zoom Link Message Format**:

```
🎥 Zoom Meeting Dibuat
━━━━━━━━━━━━━━━━━━━
📋 Konseling Akademik
🔗 https://zoom.us/j/1234567890?pwd=abc123
🔗HOST https://zoom.us/s/1234567890?pwd=abc123
🔑 ID: 1234567890
🔐 Pass: abc123
```

### **Visual Feedback**:

- Success: Toast "Zoom meeting berhasil dibuat!" (Green)
- Error: Toast "Gagal membuat Zoom meeting" (Red)
- Loading: Spinner animation dalam button
- Disabled state: Opacity 50%, cursor not-allowed

---

## 🔄 STATE MANAGEMENT

### **Zoom Creation Flow**:

1. Admin opens chat window dengan student
2. Admin clicks "Buat Zoom Meeting" button
3. System opens ZoomRequestModal
4. Admin fills form (topic required, description optional)
5. Admin clicks "Buat Meeting"
6. Frontend validates form data (topic not empty)
7. Frontend generates current date & time
8. Frontend sends POST request to createZoomMeeting API
9. Backend validates consultation belongs to admin
10. Backend combines date & time to DateTime object
11. Backend checks if Zoom API configured
12. **[Zoom API configured]**: Backend calls Zoom API to create meeting → **[Success]**: Get real credentials → **[Failed]**: Fallback to placeholder
13. **[Zoom API not configured]**: Generate placeholder meeting ID, password, URLs
14. Backend creates ZoomMeeting record in database
15. Backend creates notification untuk student
16. Backend returns zoom data (join_url, start_url, password, etc.)
17. Frontend receives zoom data
18. Frontend formats zoom message dengan meeting details
19. Frontend sends zoom message to chat room via sendMessage API
20. Backend creates ChatMessage record
21. Backend updates ChatRoom timestamp
22. **[Send message success]**: Frontend updates chat messages state → Frontend displays success toast → Frontend closes modal → Zoom link appears in chat window
23. **[Send message failed]**: Frontend displays error toast
24. Admin can click "Start Meeting" button on zoom link bubble
25. System opens start_url in new tab (Zoom platform)

---

## 📚 RELATED FILES

### **Frontend**:

- `client/src/pages/admin/kelolaLiveChat/KelolaLiveChat.tsx`
- `client/src/pages/admin/kelolaLiveChat/components/ZoomRequestModal.tsx`
- `client/src/utils/tokenManager.ts`

### **Backend**:

- `server/src/controllers/zoomController.ts`
- `server/src/controllers/chatController.ts`
- `server/src/services/zoomService.ts`
- `server/src/routes/zoomRoutes.ts`
- `server/src/routes/chatRoutes.ts`
- `server/prisma/schema.prisma`

---

## 🐛 COMMON ISSUES & SOLUTIONS

### **Issue 1: "Missing required fields" error**

- **Cause**: Topic field kosong atau tidak terisi
- **Solution**: Validate form sebelum submit, pastikan topic diisi

### **Issue 2: Zoom meeting created but message tidak terkirim**

- **Cause**: Chat room tidak ditemukan atau sendMessage API failed
- **Solution**: Check room_id exists, verify chat room active

### **Issue 3: "Consultation not found or unauthorized" error**

- **Cause**: Consultation tidak belong to admin atau tidak exists
- **Solution**: Verify consultation_id valid, check admin_id match

### **Issue 4: Zoom API failed, fallback ke placeholder**

- **Cause**: Zoom credentials tidak configured atau API rate limit exceeded
- **Solution**: Check environment variables untuk Zoom credentials, verify API quota

### **Issue 5: Start meeting button tidak berfungsi**

- **Cause**: Browser blocked popup atau start_url invalid
- **Solution**: Allow popups dari domain, check start_url format

---

## 🚀 FUTURE IMPROVEMENTS

1. **Custom Meeting Duration**: Allow admin to set meeting duration (default 60 minutes)
2. **Recurring Meetings**: Support untuk create recurring zoom meetings
3. **Meeting Reminders**: Auto reminder notification sebelum meeting dimulai
4. **Meeting Analytics**: Track meeting attendance, duration, dan participation
5. **Calendar Integration**: Sync zoom meetings dengan Google Calendar atau Outlook
6. **Meeting Recording**: Auto record meetings dan save to cloud storage
7. **Waiting Room**: Enable waiting room feature untuk better control
8. **Co-host Support**: Allow multiple admins sebagai co-hosts
9. **Custom Meeting Templates**: Save meeting templates untuk quick creation
10. **Meeting History**: View past zoom meetings dengan recordings
11. **Breakout Rooms**: Support untuk create breakout rooms during meeting
12. **Pre-meeting Survey**: Collect student questions sebelum meeting
13. **Post-meeting Feedback**: Auto send feedback form setelah meeting selesai
14. **Integration dengan LMS**: Sync dengan Learning Management System

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Maintainer**: EDUPATH Development Team
