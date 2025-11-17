import { useState, useEffect, useRef } from "react";
import {
  Search,
  Send,
  MessageCircle,
  Video,
  MoreVertical,
  Image as ImageIcon,
  X,
  Loader,
} from "lucide-react";
import axios from "axios";
import TokenManager from "../../../utils/tokenManager";
import toast from "react-hot-toast";
import { triggerChatRefresh } from "../../../utils/notificationEvents";
import {
  uploadImageToCloudinary,
  parseMessageWithImage,
} from "../../../utils/cloudinary";
import ZoomRequestModal from "./components/ZoomRequestModal";
import type { ZoomRequestData } from "./components/ZoomRequestModal";

interface ChatUser {
  user_id: string;
  firstname: string;
  lastname: string;
  kelas: number | null;
  lastMessage?: string;
  lastMessageTime?: string;
  room_id?: string;
  consultation_id?: string;
  consultation_date?: string;
  unreadCount?: number;
}

interface ChatMessage {
  id: string;
  message: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isFromAdmin: boolean; // retained because backend still returns it, but not used for alignment
}

const KelolaLiveChat = () => {
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const currentUserId = TokenManager.getUserData().userId || "";

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  };

  // All users are available for chat now (no time restriction)
  const availableChatUsers = chatUsers;

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Polling for message updates when a user is selected
  useEffect(() => {
    if (selectedUser && selectedUser.room_id) {
      // Start polling for new messages every 3 seconds (reduced for better responsiveness)
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const token = TokenManager.getToken();
          const messagesResponse = await axios.get(
            `${API_URL}/api/chat/messages/${selectedUser.room_id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (messagesResponse.data.success) {
            const newMessages = messagesResponse.data.data;
            // Only update if messages are different
            setChatMessages((prevMessages) => {
              if (
                JSON.stringify(prevMessages) !== JSON.stringify(newMessages)
              ) {
                return newMessages;
              }
              return prevMessages;
            });
          }
        } catch (error) {
          console.error("Error polling messages:", error);
          // Don't show toast for polling errors to avoid spam
        }
      }, 3000); // Poll every 3 seconds instead of 5
    }

    // Cleanup function
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [selectedUser, API_URL]);

  // Fetch chat users (students who have accepted AND ACTIVE consultations)
  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        setLoading(true);
        const token = TokenManager.getToken();

        // Fetch live chat users (active consultations)
        const response = await axios.get(`${API_URL}/api/chat/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setChatUsers(response.data.data);
      } catch (error) {
        console.error("Error fetching chat users:", error);
        if (axios.isAxiosError(error)) {
          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            toast.error("Session expired. Silakan login ulang.");
            TokenManager.logout();
            window.location.href = "/login";
          } else {
            toast.error("Gagal mengambil data chat");
          }
        } else {
          toast.error("Gagal mengambil data chat");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChatUsers();

    // Auto-refresh chat users every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchChatUsers();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [API_URL]);

  // Fetch chat messages for selected user
  const fetchChatMessages = async (userId: string) => {
    try {
      setMessagesLoading(true);
      const token = TokenManager.getToken();

      // First, find the user's consultation to get consultation_id
      const selectedUserData = chatUsers.find(
        (user) => user.user_id === userId
      );

      // Chat is now always available - no time restriction check needed
      setSelectedUser(selectedUserData || null);

      if (selectedUserData && selectedUserData.consultation_id) {
        // Get or create chat room first
        const roomResponse = await axios.get(
          `${API_URL}/api/chat/room/${selectedUserData.consultation_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (roomResponse.data.success) {
          const chatRoom = roomResponse.data.data;
          const roomId = chatRoom.room_id;

          // Now fetch messages from the chat room
          const messagesResponse = await axios.get(
            `${API_URL}/api/chat/messages/${roomId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (messagesResponse.data.success) {
            setChatMessages(messagesResponse.data.data);
          } else {
            setChatMessages([]);
          }
          setChatUsers((prev) =>
            prev.map((u) =>
              u.user_id === selectedUserData.user_id
                ? { ...u, unreadCount: 0 }
                : u
            )
          );

          // Update the selected user with room_id
          setSelectedUser((prev) =>
            prev ? { ...prev, room_id: roomId } : null
          );
        }
      } else {
        // If no consultation_id, show empty chat
        setChatMessages([
          {
            id: "welcome-1",
            message:
              "Halo! Saya admin EduPath. Chat room akan dibuat ketika ada konsultasi yang diterima.",
            senderId: "admin",
            senderName: "Admin EduPath",
            timestamp: new Date().toISOString(),
            isFromAdmin: true,
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      toast.error("Gagal mengambil pesan chat");

      // Fallback to welcome message
      setChatMessages([
        {
          id: "error-1",
          message:
            "Maaf, terjadi kesalahan saat mengambil pesan chat. Silakan coba lagi.",
          senderId: "admin",
          senderName: "Admin EduPath",
          timestamp: new Date().toISOString(),
          isFromAdmin: true,
        },
      ]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleUserSelect = (user: ChatUser) => {
    // Optimistic: set selectedUser & kosongkan unread (dot langsung hilang) sebelum fetch
    setSelectedUser(user);
    setChatUsers((prev) =>
      prev.map((u) =>
        u.user_id === user.user_id ? { ...u, unreadCount: 0 } : u
      )
    );
    fetchChatMessages(user.user_id);
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 5MB");
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async () => {
    if (
      (!newMessage.trim() && !selectedImage) ||
      sendingMessage ||
      !selectedUser
    )
      return;

    setSendingMessage(true);
    let messageText = newMessage.trim();

    try {
      const token = TokenManager.getToken();

      // If there's an image, upload it first
      if (selectedImage) {
        setUploadingImage(true);
        try {
          const imageUrl = await uploadImageToCloudinary(
            selectedImage,
            "edupath/chat"
          );
          // Add image URL to message (without [IMAGE] prefix)
          messageText = messageText ? `${messageText}\n${imageUrl}` : imageUrl;
        } catch (error: any) {
          console.error("Error uploading image:", error);
          toast.error(error.message || "Gagal mengupload gambar");
          setUploadingImage(false);
          setSendingMessage(false);
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      // Make sure we have room_id in selectedUser
      if (!selectedUser.room_id && selectedUser.consultation_id) {
        // Try to get/create chat room first
        const roomResponse = await axios.get(
          `${API_URL}/api/chat/room/${selectedUser.consultation_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (roomResponse.data.success) {
          const roomId = roomResponse.data.data.room_id;
          setSelectedUser((prev) =>
            prev ? { ...prev, room_id: roomId } : null
          );
        } else {
          toast.error("Gagal membuat chat room");
          return;
        }
      }

      if (selectedUser.room_id) {
        // Optimistic update: Add message to UI immediately
        const optimisticMessage: ChatMessage = {
          id: `temp-${Date.now()}`,
          message: messageText,
          senderId: currentUserId,
          senderName: "Admin EduPath",
          timestamp: new Date().toISOString(),
          isFromAdmin: true,
        };

        // Add to messages immediately for better UX
        setChatMessages((prev) => [...prev, optimisticMessage]);
        setNewMessage("");

        // Send message via API
        const response = await axios.post(
          `${API_URL}/api/chat/messages/${selectedUser.room_id}`,
          {
            message: messageText,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          // Replace optimistic message with real message from server
          setChatMessages((prev) =>
            prev.map((msg) =>
              msg.id === optimisticMessage.id ? response.data.data : msg
            )
          );

          // Clear message input and image
          setNewMessage("");
          handleRemoveImage();

          // Update last message in chat users list
          setChatUsers((prev) =>
            prev.map((user) =>
              user.user_id === selectedUser?.user_id
                ? {
                    ...user,
                    lastMessage: messageText,
                    // Simpan dalam bentuk ISO agar formatter bisa bekerja dengan benar
                    lastMessageTime: new Date().toISOString(),
                  }
                : user
            )
          );

          // Trigger chat refresh for notification badge
          triggerChatRefresh();
        } else {
          // Remove optimistic message if sending failed
          setChatMessages((prev) =>
            prev.filter((msg) => msg.id !== optimisticMessage.id)
          );
          setNewMessage(messageText); // Restore input
          toast.error("Gagal mengirim pesan");
        }
      } else {
        toast.error(
          "Chat room tidak ditemukan. Pastikan konsultasi sudah diterima."
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Remove optimistic message and restore input on error
      setChatMessages((prev) =>
        prev.filter((msg) => !msg.id.startsWith("temp-"))
      );
      setNewMessage(messageText);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error("Session expired. Silakan login ulang.");
          TokenManager.logout();
          window.location.href = "/login";
        } else {
          toast.error(error.response?.data?.message || "Gagal mengirim pesan");
        }
      } else {
        toast.error("Gagal mengirim pesan");
      }
    } finally {
      setSendingMessage(false);
    }
  };

  // Placeholder: jika nanti ada realtime, panggil fungsi ini ketika pesan baru dari murid diterima.
  const handleIncomingMessageFromStudent = (
    roomId: string,
    message: ChatMessage
  ) => {
    // PENTING: Fungsi ini hanya boleh dipanggil untuk pesan dari STUDENT
    // Pastikan pesan bukan dari admin sebelum memproses unread
    if (message.isFromAdmin) {
      console.warn(
        "handleIncomingMessageFromStudent called with admin message, ignoring"
      );
      return;
    }

    // Jika bukan chat yang sedang dibuka, tambah unread
    if (!selectedUser || selectedUser.room_id !== roomId) {
      setChatUsers((prev) =>
        prev.map((u) =>
          u.room_id === roomId
            ? {
                ...u,
                unreadCount: (u.unreadCount || 0) + 1,
                lastMessage: message.message,
                lastMessageTime: new Date().toISOString(),
              }
            : u
        )
      );
    } else {
      // Sedang dibuka, langsung append ke messages
      setChatMessages((prev) => [...prev, message]);
      // Update last message display
      setChatUsers((prev) =>
        prev.map((u) =>
          u.room_id === roomId
            ? {
                ...u,
                lastMessage: message.message,
                lastMessageTime: new Date().toISOString(),
              }
            : u
        )
      );
    }
  };

  // NOTE: handleIncomingMessageFromStudent akan dipakai saat implementasi realtime (Socket.io)
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  void handleIncomingMessageFromStudent; // hindari unused warning tanpa deklarasi variabel

  // Handle Zoom Meeting Request
  const handleZoomRequest = async (data: ZoomRequestData) => {
    if (!selectedUser) return;

    try {
      const token = TokenManager.getToken();

      // Generate current date and time
      const now = new Date();
      const scheduledDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
      const scheduledTime = now.toTimeString().slice(0, 5); // HH:MM

      const response = await axios.post(
        `${API_URL}/api/zoom/create-meeting`,
        {
          consultationId: selectedUser.consultation_id,
          userId: selectedUser.user_id,
          topic: data.topic,
          scheduledDate: scheduledDate,
          scheduledTime: scheduledTime,
          description: data.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Zoom meeting berhasil dibuat!");

        // Optionally send a message to chat with zoom link
        if (selectedUser.room_id && response.data.data.joinUrl) {
          const zoomData = response.data.data;
          // Send joinUrl to student, but include startUrl in hidden format for admin
          const zoomMessage = `🎥 Zoom Meeting Dibuat\n━━━━━━━━━━━━━━━━━━━\n📋 ${data.topic}\n🔗 ${zoomData.joinUrl}\n🔗HOST ${zoomData.startUrl}\n🔑 ID: ${zoomData.zoomMeetingId}\n🔐 Pass: ${zoomData.password}`;
          await axios.post(
            `${API_URL}/api/chat/messages/${selectedUser.room_id}`,
            { message: zoomMessage },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          // Refresh messages
          fetchChatMessages(selectedUser.user_id);
        }
      }
    } catch (error) {
      console.error("Error creating zoom meeting:", error);
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Gagal membuat Zoom meeting"
        );
      } else {
        toast.error("Gagal membuat Zoom meeting");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter users: only show those with started consultations + search term
  const filteredUsers = availableChatUsers.filter(
    (user) =>
      `${user.firstname} ${user.lastname}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (user.kelas && user.kelas.toString().includes(searchTerm))
  );

  const isValidDate = (d: Date) => !isNaN(d.getTime());

  const formatTime = (timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (!isValidDate(date)) return "";
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (!isValidDate(date)) return "";
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatLastMessageTime = (timestamp?: string) => {
    if (!timestamp) return "";
    const messageDate = new Date(timestamp);
    if (!isValidDate(messageDate)) return ""; // Hindari Invalid Date
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - messageDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Baru saja";
    if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} jam lalu`;

    // Jika lebih dari 1 hari, tampilkan tanggal (dd Mon)
    return messageDate.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600">Memuat data chat...</div>
      </div>
    );
  }

  return (
    <div className="bg-white h-[calc(100vh-120px)] rounded-lg shadow-lg flex">
      {/* Chat Users List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Live Chat</h2>
              <p className="text-sm text-gray-600">
                Murid dengan konseling ter-accept ({chatUsers.length})
              </p>
            </div>
            <MessageCircle className="text-primary" size={24} />
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari siswa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm
                ? "Tidak ada siswa yang ditemukan"
                : chatUsers.length === 0
                ? "Tidak ada data siswa"
                : "Belum ada chat aktif"}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.user_id}
                onClick={() => handleUserSelect(user)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedUser?.user_id === user.user_id
                    ? "bg-secondary-light border-secondary"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                      {user.firstname.charAt(0)}
                      {user.lastname.charAt(0)}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {user.firstname} {user.lastname}
                        {typeof user.unreadCount === "number" &&
                          user.unreadCount > 0 && (
                            <span
                              className="ml-2 inline-block w-3 h-3 rounded-full bg-red-500"
                              title="Pesan baru dari siswa"
                              aria-label="Pesan baru dari siswa"
                            />
                          )}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Kelas {user.kelas}
                      </p>
                      {user.lastMessageTime && (
                        <span className="text-xs text-gray-400">
                          {formatLastMessageTime(user.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    {user.lastMessage && (
                      <p className="text-sm text-gray-500 truncate mt-1 max-w-[300px]">
                        {user.lastMessage}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedUser.firstname.charAt(0)}
                      {selectedUser.lastname.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">
                        {selectedUser.firstname} {selectedUser.lastname}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Kelas {selectedUser.kelas}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsZoomModalOpen(true)}
                    className="p-2 text-gray-600 hover:text-primary hover:bg-secondary-lighter rounded-lg transition-colors"
                    title="Buat Zoom Meeting"
                  >
                    <Video size={20} />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-primary hover:bg-secondary-lighter rounded-lg transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                chatMessages.map((message, index) => {
                  // Robust alignment logic: prioritize isFromAdmin flag for better reliability
                  const isMine =
                    message.isFromAdmin || message.senderId === currentUserId;

                  // Parse message to check for image
                  const { imageUrl, textMessage } = parseMessageWithImage(
                    message.message
                  );

                  // Check if this is a Zoom meeting message
                  const isZoomMessage = textMessage.includes(
                    "🎥 Zoom Meeting Dibuat"
                  );

                  // Check if we need to show date divider
                  const showDateDivider =
                    index === 0 ||
                    formatDate(message.timestamp) !==
                      formatDate(chatMessages[index - 1].timestamp);

                  return (
                    <div key={message.id}>
                      {showDateDivider && (
                        <div className="flex items-center justify-center my-4">
                          <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                            {formatDate(message.timestamp)}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex ${
                          isMine ? "justify-end" : "justify-start"
                        } mb-4`}
                      >
                        <div
                          className={`${
                            isZoomMessage ? "max-w-[85%]" : "max-w-[70%]"
                          }`}
                        >
                          {isZoomMessage ? (
                            // Special styling for Zoom meeting messages
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 shadow-md">
                              <div className="flex items-start gap-3">
                                <div className="bg-primary p-2 rounded-lg flex-shrink-0">
                                  <svg
                                    className="w-6 h-6 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-primary-dark text-base mb-2 flex items-center gap-2">
                                    🎥 Zoom Meeting Dibuat
                                  </div>
                                  {/* Parse and display meeting details */}
                                  {textMessage
                                    .split("\n")
                                    .slice(1)
                                    .map((line: string, idx: number) => {
                                      if (line.includes("━")) return null; // Skip separator line
                                      if (line.trim() === "") return null; // Skip empty lines

                                      // Meeting topic
                                      if (line.startsWith("📋")) {
                                        return (
                                          <div key={idx} className="mb-2">
                                            <span className="text-gray-700 font-semibold">
                                              {line}
                                            </span>
                                          </div>
                                        );
                                      }

                                      // Date/Time
                                      if (line.startsWith("📅")) {
                                        return (
                                          <div key={idx} className="mb-3">
                                            <span className="text-gray-600 text-sm">
                                              {line}
                                            </span>
                                          </div>
                                        );
                                      }

                                      // Join URL - make it a button
                                      if (line.startsWith("🔗")) {
                                        // Check if this is HOST URL (for admin) or regular join URL
                                        const isHostUrl =
                                          line.startsWith("🔗HOST");

                                        if (isHostUrl) {
                                          // This is the host URL (start_url) for admin only
                                          const url = line
                                            .replace("🔗HOST ", "")
                                            .trim();
                                          return (
                                            <a
                                              key={idx}
                                              href={url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="block mb-2"
                                            >
                                              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2">
                                                <svg
                                                  className="w-5 h-5"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  viewBox="0 0 24 24"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                  />
                                                </svg>
                                                Start Meeting (Host)
                                              </button>
                                            </a>
                                          );
                                        } else {
                                          // Regular join URL - hide this for admin in chat
                                          return null;
                                        }
                                      }

                                      // Meeting ID and Password
                                      if (
                                        line.startsWith("🔑") ||
                                        line.startsWith("🔐")
                                      ) {
                                        return (
                                          <div
                                            key={idx}
                                            className="text-sm text-gray-600 font-mono mb-1"
                                          >
                                            {line}
                                          </div>
                                        );
                                      }

                                      return (
                                        <div
                                          key={idx}
                                          className="text-sm text-gray-600"
                                        >
                                          {line}
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            </div>
                          ) : (
                            // Regular message styling
                            <div
                              className={`p-3 rounded-lg ${
                                isMine
                                  ? "bg-primary text-white"
                                  : "bg-gray-200 text-gray-800"
                              }`}
                            >
                              {imageUrl && (
                                <img
                                  src={imageUrl}
                                  alt="Shared image"
                                  className="rounded-lg mb-2 max-w-[300px] h-auto cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() =>
                                    window.open(imageUrl, "_blank")
                                  }
                                />
                              )}
                              {textMessage && (
                                <p className="text-sm whitespace-pre-line">
                                  {textMessage}
                                </p>
                              )}
                            </div>
                          )}
                          <div
                            className={`flex items-center mt-1 text-xs text-gray-500 ${
                              isMine ? "justify-end" : "justify-start"
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-3 relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-32 rounded-lg border-2 border-blue-300"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="flex items-end space-x-2">
                {/* Image Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage || sendingMessage}
                  className="p-2 text-gray-600 hover:text-primary hover:bg-secondary-lighter rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Kirim gambar"
                >
                  <ImageIcon size={20} />
                </button>

                {/* Text Input */}
                <div className="flex-1 flex items-center">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ketik pesan..."
                    rows={1}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    style={{ minHeight: "40px", maxHeight: "120px" }}
                    disabled={uploadingImage || sendingMessage}
                  />
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={
                    (!newMessage.trim() && !selectedImage) ||
                    sendingMessage ||
                    uploadingImage
                  }
                  className="bg-primary text-white p-2 rounded-lg hover:bg-primary-light disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[40px]"
                >
                  {uploadingImage ? (
                    <Loader className="animate-spin" size={20} />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          // No chat selected
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Pilih Chat untuk Memulai
              </h3>
              <p className="text-gray-500">
                Pilih siswa dari daftar untuk memulai percakapan
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Zoom Request Modal */}
      {selectedUser && (
        <ZoomRequestModal
          isOpen={isZoomModalOpen}
          onClose={() => setIsZoomModalOpen(false)}
          studentId={selectedUser.user_id}
          studentName={`${selectedUser.firstname} ${selectedUser.lastname}`}
          consultationId={selectedUser.consultation_id || ""}
          onSubmit={handleZoomRequest}
        />
      )}
    </div>
  );
};

export default KelolaLiveChat;
