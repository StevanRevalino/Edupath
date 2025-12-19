# CHAT KONSULTASI DENGAN MURID - CODE FLOW DOCUMENTATION

## 📋 OVERVIEW

Fitur **Chat Konsultasi dengan Murid** memungkinkan administrator untuk berkomunikasi secara real-time dengan murid melalui sistem live chat. Fitur ini menyediakan riwayat percakapan, notifikasi pesan baru, dan tracking unread messages untuk setiap sesi konsultasi yang sudah diterima (ACCEPTED).

---

## 🎯 USE CASE: Chat Konsultasi dengan Murid

### **Actor**: Admin

### **Preconditions**:

- Admin telah login dengan kredensial admin
- Terdapat minimal 1 sesi konsultasi dengan status ACCEPTED yang tanggal konsultasinya sudah tiba atau lewat
- Chat room sudah terbentuk atau akan dibuat otomatis saat pertama kali akses

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
10. Admin menulis pesan yang ingin dikirim kepada murid
11. Admin menekan tombol kirim
12. **[Pesan berhasil dikirim]**: Sistem menampilkan notifikasi pesan baru ke murid yang bersangkutan → Sistem menyimpan pesan terbaru ke dalam riwayat chat pada database → Sistem menampilkan data riwayat chat terbaru di dalam window chatting
13. **[Pesan gagal dikirim]**: Sistem menampilkan feedback notifikasi pesan gagal dikirim

### **Postconditions**:

- Pesan berhasil tersimpan di database dalam chat room terkait
- Notifikasi terkirim ke murid yang menerima pesan
- Riwayat chat di window chatting diperbarui dengan pesan terbaru
- Unread count diperbarui untuk murid

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
                   │              │ Admin menulis pesan yang ingin│
                   │              │ dikirim kepada murid          │
                   │              └────┬──────────────────────────┘
                   │                   │
                   │              ┌────▼──────────────────────────┐
                   │              │ Admin menekan tombol kirim    │
                   │              └────┬──────────────────────────┘
                   │                   │
                   │              ┌────▼──────────────────────────┐
                   │              │ [Pesan berhasil dikirim?]     │
                   │              └─────┬────────────┬────────────┘
                   │              GAGAL │            │ BERHASIL
                   │    ┌───────────────▼──┐    ┌────▼───────────────────────┐
                   │    │ Sistem menampilkan│    │ Sistem menampilkan        │
                   │    │ feedback notifikasi│    │ notifikasi pesan baru ke  │
                   │    │ pesan gagal dikirim│    │ murid yang bersangkutan   │
                   │    └────────┬──────────┘    └────┬───────────────────────┘
                   │             │                    │
                   │             │              ┌─────▼────────────────────────┐
                   │             │              │ Sistem menyimpan pesan       │
                   │             │              │ terbaru ke dalam riwayat chat│
                   │             │              │ pada database                │
                   │             │              └─────┬────────────────────────┘
                   │             │                    │
                   │             │              ┌─────▼────────────────────────┐
                   │             │              │ Sistem menampilkan data      │
                   │             │              │ riwayat chat terbaru di dalam│
                   │             │              │ window chatting              │
                   │             │              └─────┬────────────────────────┘
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
- **React Hot Toast** untuk notifikasi
- **Tailwind CSS** untuk styling
- **Lucide React** untuk icons
- **Real-time polling** untuk update pesan

### **Backend**:

- **Express.js** dengan TypeScript
- **Prisma ORM** untuk database operations
- **PostgreSQL** sebagai database
- **Socket.IO** (optional - currently using polling)

### **Authentication**:

- **JWT (JSON Web Token)** melalui `TokenManager`

---

## 🏗 ARCHITECTURE COMPONENTS

### **Frontend Components**:

1. **KelolaLiveChat.tsx** (`client/src/pages/admin/kelolaLiveChat/KelolaLiveChat.tsx`)

   - Main page component untuk live chat admin
   - Menampilkan daftar murid dengan accepted consultations
   - Handle chat functionality dengan ChatHandler class
   - Manage selected user dan chat messages state
   - Real-time polling untuk update messages

2. **UserLiveChat.tsx** (`client/src/pages/admin/kelolaLiveChat/components/UserLiveChat.tsx`)

   - Chat window component (minimizable)
   - Display chat messages dengan scroll to bottom
   - Handle send message functionality
   - Unread count tracking

3. **ChatHandler Class** (Inline dalam KelolaLiveChat.tsx)
   - getChatUsers(): Fetch list murid dengan accepted consultations
   - getOrCreateRoom(): Get atau create chat room untuk consultation
   - loadMessages(): Load riwayat pesan dari chat room
   - sendMessage(): Send pesan baru ke chat room

### **Backend Components**:

1. **chatController.ts** (`server/src/controllers/chatController.ts`)

   - `getChatUsers()`: Mengambil daftar murid dengan accepted consultations untuk admin
   - `getChatRoom()`: Get atau create chat room untuk consultation tertentu
   - `getChatMessages()`: Mengambil semua pesan dari chat room
   - `sendMessage()`: Menyimpan pesan baru dan create notification ke murid

2. **ChatRoom Model** (Prisma Schema)

   - Tabel `chat_room` dengan fields:
     - room_id (String, primary key)
     - consultation_id (String, foreign key to Consultation, unique)
     - murid_id (String, foreign key to User)
     - admin_id (String, foreign key to User)
     - created_at (DateTime, auto-generated)
     - updated_at (DateTime, auto-updated)

3. **ChatMessage Model** (Prisma Schema)

   - Tabel `chat_message` dengan fields:
     - message_id (String, primary key)
     - room_id (String, foreign key to ChatRoom)
     - sender_id (String, foreign key to User)
     - message (Text, required)
     - is_read (Boolean, default: false)
     - created_at (DateTime, auto-generated)

4. **Notification Model** (Prisma Schema)
   - Tabel `notification` untuk notifikasi:
     - notification_id (String, primary key)
     - user_id (String, foreign key to User)
     - type (Enum: CHAT_MESSAGE, etc.)
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
    participant KelolaLiveChatPage<<view>>
    participant chatController<<controller>>
    participant ChatRoom<<model>>
    participant ChatMessage<<model>>
    participant Notification<<model>>

    Admin->>KelolaLiveChatPage: Login with admin credentials
    KelolaLiveChatPage->>Admin: Display admin page

    Admin->>KelolaLiveChatPage: Click 'Chat Murid' on sidebar
    KelolaLiveChatPage->>Admin: Display chat murid page

    KelolaLiveChatPage->>KelolaLiveChatPage: fetchChatUsers()
    KelolaLiveChatPage->>chatController: getChatUsers()
    chatController->>ChatRoom: findMany({ where: { admin_id, consultation.status: ACCEPTED } })
    ChatRoom-->>chatController: Return chat users with accepted consultations
    chatController-->>KelolaLiveChatPage: Return chat users data

    alt Data not found
        KelolaLiveChatPage->>Admin: Display placeholder error message
    else Data found
        KelolaLiveChatPage->>Admin: Display chat users list

        Admin->>KelolaLiveChatPage: Click on chat user
        KelolaLiveChatPage->>KelolaLiveChatPage: handleSelectUser(user)
        KelolaLiveChatPage->>chatController: getOrCreateRoom(consultationId)
        chatController->>ChatRoom: findUnique({ where: { consultation_id } })

        alt Room not found
            chatController->>ChatRoom: create({ consultation_id, murid_id, admin_id })
            ChatRoom-->>chatController: Return new chat room
        else Room found
            ChatRoom-->>chatController: Return existing chat room
        end

        chatController-->>KelolaLiveChatPage: Return room_id
        KelolaLiveChatPage->>Admin: Display chat window

        Admin->>KelolaLiveChatPage: Type message
        Admin->>KelolaLiveChatPage: Click send button

        KelolaLiveChatPage->>chatController: sendMessage(roomId, message)
        chatController->>chatController: Validate message not empty
        chatController->>ChatRoom: verify user has access to room
        chatController->>ChatMessage: create({ room_id, sender_id, message })
        ChatMessage-->>chatController: Return new message

        alt Send failed
            chatController-->>KelolaLiveChatPage: { success: false, message: "Error message" }
            KelolaLiveChatPage->>Admin: Display error toast notification
        else Send successful
            chatController->>ChatRoom: update({ updated_at: now })
            chatController->>Notification: create({ type: "CHAT_MESSAGE", user_id: murid_id })
            Notification-->>chatController: Notification created
            chatController-->>KelolaLiveChatPage: { success: true, data: newMessage }
            KelolaLiveChatPage->>KelolaLiveChatPage: Update messages state
            KelolaLiveChatPage->>KelolaLiveChatPage: triggerChatRefresh()
            KelolaLiveChatPage->>Admin: Display updated chat history
            KelolaLiveChatPage->>Admin: Display new message in chat window
        end
    end
```

## Data Flow Details

### 1. Fetch Chat Users Data (Initial Load)

**Frontend Handler**:

```typescript
const fetchChatUsers = async () => {
  try {
    setLoading(true);
    const users = await chatHandler.getChatUsers();
    setChatUsers(users);
  } catch (error) {
    console.error("Error fetching chat users:", error);
    toast.error("Gagal mengambil data chat");
  } finally {
    setLoading(false);
  }
};
```

**Request**:

```http
GET /api/chat/users
Headers:
  Authorization: Bearer <JWT_TOKEN>
```

**Backend Processing**:

```typescript
async getChatUsers(req: Request, res: Response) {
  const adminId = req.user?.user_id;
  const now = new Date();

  const acceptedConsultations = await prisma.consultation.findMany({
    where: {
      admin_id: adminId,
      status: "ACCEPTED",
      is_active: true,
      consultation_date: { lte: now }
    },
    include: { murid, chatRoom, messages }
  });

  return res.json({ success: true, data: students });
}
```

**Response**:

```json
{
  "success": true,
  "message": "Berhasil mengambil data chat users",
  "data": [
    {
      "user_id": "US001",
      "firstname": "Budi",
      "lastname": "Santoso",
      "kelas": 12,
      "consultation_id": "CON001",
      "room_id": "ROOM001",
      "lastMessage": "Terima kasih atas bantuannya",
      "lastMessageTime": "2024-01-25T10:30:00.000Z",
      "unreadCount": 2
    }
  ],
  "count": 5
}
```

---

### 2. Get or Create Chat Room

**Frontend Handler**:

```typescript
const handleSelectUser = async (user: ChatUser) => {
  setSelectedUser(user);

  if (user.consultation_id) {
    const roomId = await chatHandler.getOrCreateRoom(user.consultation_id);
    if (roomId) {
      loadMessages(roomId);
    }
  }
};
```

**Request**:

```http
GET /api/chat/room/:consultationId
Headers:
  Authorization: Bearer <JWT_TOKEN>
```

**Backend Processing**:

```typescript
async getChatRoom(req: Request, res: Response) {
  const { consultationId } = req.params;

  let chatRoom = await prisma.chatRoom.findUnique({
    where: { consultation_id: consultationId }
  });

  if (!chatRoom) {
    chatRoom = await prisma.chatRoom.create({
      data: { consultation_id, murid_id, admin_id }
    });
  }

  return res.json({ success: true, data: chatRoom });
}
```

**Response**:

```json
{
  "success": true,
  "message": "Berhasil mengambil chat room",
  "data": {
    "room_id": "ROOM001",
    "consultation_id": "CON001",
    "murid_id": "US001",
    "admin_id": "AD001",
    "created_at": "2024-01-25T08:00:00.000Z"
  }
}
```

---

### 3. Load Chat Messages

**Frontend Handler**:

```typescript
const loadMessages = async (roomId: string) => {
  try {
    const messages = await chatHandler.loadMessages(roomId);
    setChatMessages(messages);
  } catch (error) {
    console.error("Error loading messages:", error);
    toast.error("Gagal memuat pesan");
  }
};
```

**Request**:

```http
GET /api/chat/messages/:roomId
Headers:
  Authorization: Bearer <JWT_TOKEN>
```

**Backend Processing**:

```typescript
async getChatMessages(req: Request, res: Response) {
  const { roomId } = req.params;
  const userId = req.user?.user_id;

  const messages = await prisma.chatMessage.findMany({
    where: { room_id: roomId },
    orderBy: { created_at: 'asc' },
    include: { sender }
  });

  // Mark as read
  await prisma.chatMessage.updateMany({
    where: { room_id: roomId, sender_id: { not: userId }, is_read: false },
    data: { is_read: true }
  });

  return res.json({ success: true, data: messages });
}
```

**Response**:

```json
{
  "success": true,
  "message": "Berhasil mengambil pesan chat",
  "data": [
    {
      "id": "MSG001",
      "message": "Selamat siang, saya ingin konsultasi tentang jurusan",
      "senderId": "US001",
      "senderName": "Budi Santoso",
      "timestamp": "2024-01-25T09:00:00.000Z",
      "isFromAdmin": false,
      "isRead": true
    },
    {
      "id": "MSG002",
      "message": "Baik, silakan ceritakan minat dan bakat Anda",
      "senderId": "AD001",
      "senderName": "Admin EDUPATH",
      "timestamp": "2024-01-25T09:05:00.000Z",
      "isFromAdmin": true,
      "isRead": true
    }
  ],
  "count": 2
}
```

---

### 4. Send Message

**Frontend Handler**:

```typescript
const handleSendMessage = async () => {
  if (!newMessage.trim() || !currentRoomId) return;

  try {
    setSendingMessage(true);
    const sentMessage = await chatHandler.sendMessage(
      currentRoomId,
      newMessage
    );

    if (sentMessage) {
      setChatMessages([...chatMessages, sentMessage]);
      setNewMessage("");
      triggerChatRefresh();
    }
  } catch (error) {
    console.error("Error sending message:", error);
    toast.error("Gagal mengirim pesan");
  } finally {
    setSendingMessage(false);
  }
};
```

**Request**:

```http
POST /api/chat/messages/:roomId
Headers:
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json

Body:
{
  "message": "Terima kasih atas informasinya!"
}
```

**Backend Processing**:

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

  // Create notification for student
  if (sender.role === "ADMIN") {
    await prisma.notification.create({
      data: {
        user_id: chatRoom.murid_id,
        type: "CHAT_MESSAGE",
        title: "Pesan Baru dari Admin",
        message: `${sender.firstname}: ${message.slice(0, 50)}...`
      }
    });
  }

  return res.json({ success: true, data: newMessage });
}
```

**Response (Success)**:

```json
{
  "success": true,
  "message": "Pesan berhasil dikirim",
  "data": {
    "id": "MSG003",
    "message": "Terima kasih atas informasinya!",
    "senderId": "AD001",
    "senderName": "Admin EDUPATH",
    "timestamp": "2024-01-25T10:15:00.000Z",
    "isFromAdmin": true,
    "isRead": false
  }
}
```

**Response (Error - Empty Message)**:

```json
{
  "success": false,
  "message": "Message is required"
}
```

**Response (Error - Access Denied)**:

```json
{
  "success": false,
  "message": "Access denied or chat room not found"
}
```

---

## 🔌 API ENDPOINTS

### **GET /api/chat/users**

- **Purpose**: Mengambil daftar murid dengan accepted consultations untuk admin
- **Auth**: Required (JWT Token)
- **Response**: Array of chat users dengan last message dan unread count
- **Filter**: Only shows consultations where consultation_date <= now

### **GET /api/chat/room/:consultationId**

- **Purpose**: Get atau create chat room untuk consultation tertentu
- **Auth**: Required (JWT Token)
- **Params**: `consultationId` - Consultation ID
- **Response**: Chat room object dengan room_id
- **Auto-create**: Creates room if not exists

### **GET /api/chat/messages/:roomId**

- **Purpose**: Mengambil semua pesan dari chat room
- **Auth**: Required (JWT Token)
- **Params**: `roomId` - Chat Room ID
- **Response**: Array of messages ordered by created_at ascending
- **Side Effects**: Marks unread messages as read for current user

### **POST /api/chat/messages/:roomId**

- **Purpose**: Mengirim pesan baru ke chat room
- **Auth**: Required (JWT Token)
- **Params**: `roomId` - Chat Room ID
- **Body**:
  - `message` (required): Text pesan yang akan dikirim
- **Response**: Created message object
- **Side Effects**:
  - Updates chat room's updated_at timestamp
  - Creates notification for receiver (if sender is admin)

---

## ✨ KEY FEATURES

### **1. Real-time Chat Interface**

- Two-column layout: User list (left) dan chat window (right)
- Auto-scroll to bottom saat pesan baru masuk
- Message grouping by sender
- Timestamp display untuk setiap pesan
- Visual distinction antara admin dan student messages

### **2. Unread Count Tracking**

- Badge indicator untuk unread messages pada user list
- Auto-mark as read saat chat dibuka
- Real-time update unread count
- Separate tracking per chat room

### **3. Chat User Filtering**

- Only shows students dengan ACCEPTED consultations
- Filter berdasarkan consultation_date (sudah tiba atau lewat)
- Sort by latest consultation date
- Search functionality untuk cari murid

### **4. Automatic Notification**

- Notification ke murid saat admin mengirim pesan
- Notification type: CHAT_MESSAGE
- Include message preview (max 50 chars)
- Linked to consultation_id untuk easy navigation

### **5. Chat Room Management**

- Auto-create room saat pertama kali chat
- One room per consultation (unique constraint)
- Track last message time untuk sorting
- Updated_at timestamp untuk activity tracking

---

## 🔐 SECURITY CONSIDERATIONS

1. **JWT Authentication**: Setiap request memerlukan valid JWT token
2. **Authorization Headers**: Token dikirim via Authorization header
3. **Role-based Access**: Hanya admin dan murid terkait yang bisa akses chat room
4. **Room Access Verification**: Server verify user has access sebelum load/send messages
5. **Message Validation**: Validate message tidak kosong sebelum save
6. **XSS Protection**: Sanitize message content untuk prevent XSS attacks
7. **Rate Limiting**: Implement rate limiting untuk prevent spam (recommended)

---

## 🎨 UI/UX FEATURES

### **Chat Interface Design**:

**Left Panel - User List**:

- Search bar dengan icon Search
- User cards dengan:
  - Avatar/initial circle
  - Nama lengkap + kelas
  - Last message preview
  - Timestamp (relative time)
  - Unread badge (if any)
- Active state indicator untuk selected user
- Empty state jika tidak ada chat users

**Right Panel - Chat Window**:

- Header section:
  - Selected user name + kelas
  - Consultation topic
  - Zoom meeting button (if applicable)
- Message area:
  - Admin messages (right-aligned, primary color)
  - Student messages (left-aligned, gray)
  - Timestamp below each message
  - Auto-scroll to bottom
- Input section:
  - Textarea untuk tulis pesan
  - Send button (enabled only if message not empty)
  - Image upload button (optional)
  - Loading state saat sending

### **Visual Feedback**:

- Success: Message langsung muncul di chat window
- Error toast: "Gagal mengirim pesan" (Red)
- Loading spinner saat fetch data
- Disabled state pada send button saat sedang mengirim
- Typing indicator (future enhancement)

---

## 🔄 STATE MANAGEMENT

### **Chat Flow**:

1. User loads "Chat Murid" page
2. System fetches chat users (accepted consultations)
3. Display list of students dengan last message preview
4. User clicks on student card
5. System gets or creates chat room untuk consultation
6. System loads message history untuk chat room
7. Display chat window dengan messages
8. User types message in textarea
9. User clicks send button
10. Frontend sends POST request to sendMessage API
11. Backend validates message and user access
12. Backend creates new message in database
13. Backend updates chat room timestamp
14. Backend creates notification untuk student
15. Backend returns created message
16. Frontend adds message to chat window
17. Frontend triggers chat refresh event
18. Frontend clears input textarea
19. Chat window auto-scrolls to bottom

### **Polling Strategy** (Current Implementation):

- Poll chat users every 30 seconds untuk update last message
- Poll messages every 5 seconds saat chat window terbuka
- Stop polling saat user leaves page
- Debounce polling untuk prevent excessive requests

---

## 📚 RELATED FILES

### **Frontend**:

- `client/src/pages/admin/kelolaLiveChat/KelolaLiveChat.tsx`
- `client/src/pages/admin/kelolaLiveChat/components/UserLiveChat.tsx`
- `client/src/pages/admin/kelolaLiveChat/components/ZoomRequestModal.tsx`
- `client/src/utils/tokenManager.ts`
- `client/src/utils/notificationEvents.ts`
- `client/src/utils/cloudinary.ts` (untuk image upload)

### **Backend**:

- `server/src/controllers/chatController.ts`
- `server/src/routes/chatRoutes.ts`
- `server/prisma/schema.prisma`

---

## 🐛 COMMON ISSUES & SOLUTIONS

### **Issue 1: "Access denied or chat room not found" error**

- **Cause**: User trying to access chat room yang bukan miliknya
- **Solution**: Verify consultation belongs to admin, check authentication

### **Issue 2: Messages tidak muncul setelah dikirim**

- **Cause**: Polling interval terlalu lama atau failed to refresh
- **Solution**: Trigger manual refresh, check network connection

### **Issue 3: Unread count tidak update**

- **Cause**: Mark as read query failed atau polling stopped
- **Solution**: Refresh page, check backend logs

### **Issue 4: Chat users list kosong**

- **Cause**: Tidak ada accepted consultations atau consultation_date belum tiba
- **Solution**: Check consultation status dan dates, wait for consultation date

### **Issue 5: "Message is required" error**

- **Cause**: Trying to send empty atau whitespace-only message
- **Solution**: Validate input tidak kosong di frontend sebelum send

---

## 🚀 FUTURE IMPROVEMENTS

1. **WebSocket Integration**: Replace polling dengan Socket.IO untuk real-time updates
2. **Typing Indicator**: Show saat user sedang mengetik
3. **Message Read Receipts**: Double check mark untuk pesan yang sudah dibaca
4. **File/Image Sharing**: Upload dan share files dalam chat
5. **Emoji Support**: Emoji picker untuk expressi lebih baik
6. **Message Reactions**: React ke pesan dengan emoji
7. **Message Search**: Search dalam riwayat chat
8. **Chat Archive**: Archive old chats untuk clean interface
9. **Voice Messages**: Record dan send voice messages
10. **Video Call Integration**: Direct video call dari chat interface
11. **Message Delete/Edit**: Edit atau delete sent messages
12. **Chat Export**: Export chat history sebagai PDF
13. **Auto-translate**: Translate messages ke bahasa berbeda
14. **Chat Templates**: Quick replies dengan predefined messages

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Maintainer**: EDUPATH Development Team
