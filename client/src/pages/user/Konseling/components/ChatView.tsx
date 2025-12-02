import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Send,
  Loader,
  Image as ImageIcon,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { type Consultation } from "../index";
import toast from "react-hot-toast";
import {
  uploadImageToCloudinary,
  parseMessageWithImage,
} from "../../../../utils/cloudinary";
import axios from "axios";
import TokenManager from "../../../../utils/tokenManager";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Message {
  id: string;
  message: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isFromAdmin: boolean;
}

// Inline ChatHandler for this component
class ChatHandler {
  private pollingInterval: NodeJS.Timeout | null = null;
  private messageHandlers: ((messages: Message[]) => void)[] = [];
  private errorHandlers: ((error: string) => void)[] = [];

  async getOrCreateRoom(consultationId: string): Promise<string | null> {
    try {
      const token = TokenManager.getToken();
      if (!token) throw new Error("No authentication token");

      const response = await axios.get(
        `${API_URL}/api/chat/room/${consultationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success && response.data.data.room_id) {
        return response.data.data.room_id;
      }
      throw new Error("Failed to get room ID");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          this.notifyErrorHandlers("Session expired. Silakan login ulang.");
          TokenManager.logout();
          window.location.href = "/login";
        } else {
          this.notifyErrorHandlers("Gagal membuat ruang chat");
        }
      }
      return null;
    }
  }

  async loadMessages(roomId: string): Promise<Message[]> {
    try {
      const token = TokenManager.getToken();
      if (!token) throw new Error("No authentication token");

      const response = await axios.get(
        `${API_URL}/api/chat/messages/${roomId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        return response.data.data || [];
      }
      throw new Error("Failed to load messages");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          this.notifyErrorHandlers("Session expired. Silakan login ulang.");
          TokenManager.logout();
          window.location.href = "/login";
        } else {
          this.notifyErrorHandlers("Gagal memuat pesan");
        }
      }
      return [];
    }
  }

  async sendMessage(roomId: string, message: string): Promise<Message | null> {
    try {
      const token = TokenManager.getToken();
      if (!token) throw new Error("No authentication token");

      const response = await axios.post(
        `${API_URL}/api/chat/messages/${roomId}`,
        { message },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          this.notifyErrorHandlers("Session expired. Silakan login ulang.");
          TokenManager.logout();
          window.location.href = "/login";
        } else {
          this.notifyErrorHandlers("Gagal mengirim pesan");
        }
      }
      return null;
    }
  }

  startPolling(roomId: string, intervalMs: number = 3000) {
    this.stopPolling();

    this.pollingInterval = setInterval(async () => {
      try {
        const messages = await this.loadMessages(roomId);
        this.notifyMessageHandlers(messages);
      } catch (error) {
        console.error("Error during polling:", error);
      }
    }, intervalMs);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  onMessages(handler: (messages: Message[]) => void) {
    this.messageHandlers.push(handler);
  }

  onError(handler: (error: string) => void) {
    this.errorHandlers.push(handler);
  }

  removeMessageHandler(handler: (messages: Message[]) => void) {
    this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
  }

  removeErrorHandler(handler: (error: string) => void) {
    this.errorHandlers = this.errorHandlers.filter((h) => h !== handler);
  }

  private notifyMessageHandlers(messages: Message[]) {
    this.messageHandlers.forEach((handler) => handler(messages));
  }

  private notifyErrorHandlers(error: string) {
    this.errorHandlers.forEach((handler) => handler(error));
  }
}

const chatHandler = new ChatHandler();

interface ChatViewProps {
  consultation: Consultation;
  currentUserId: string;
  onBack: () => void;
}

const ChatView = ({ consultation, currentUserId, onBack }: ChatViewProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // State for expand/collapse
  const [isExpanded, setIsExpanded] = useState(false);

  // State for image zoom modal
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Chat states (without hook)
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  // Local state for message input
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize chat and polling
  useEffect(() => {
    const initializeChat = async () => {
      setLoading(true);
      setError(null);

      try {
        const currentRoomId = await chatHandler.getOrCreateRoom(
          consultation.consultation_id
        );
        if (currentRoomId) {
          setRoomId(currentRoomId);
          const initialMessages = await chatHandler.loadMessages(currentRoomId);
          setMessages(initialMessages);
          chatHandler.startPolling(currentRoomId, 5000);
        }
      } catch (err) {
        console.error("Error initializing chat:", err);
        setError("Gagal menginisialisasi chat");
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    const handleMessages = (newMessages: Message[]) => {
      setMessages((prev) => {
        if (prev.length !== newMessages.length) return newMessages;
        const lastPrev = prev[prev.length - 1];
        const lastNew = newMessages[newMessages.length - 1];
        if (!lastPrev || !lastNew || lastPrev.id !== lastNew.id) {
          return newMessages;
        }
        return prev;
      });
    };

    const handleError = (errorMessage: string) => {
      setError(errorMessage);
    };

    chatHandler.onMessages(handleMessages);
    chatHandler.onError(handleError);

    return () => {
      chatHandler.removeMessageHandler(handleMessages);
      chatHandler.removeErrorHandler(handleError);
      chatHandler.stopPolling();
      setMessages([]);
      setRoomId(null);
    };
  }, [consultation.consultation_id]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  // Only auto-scroll when new messages are added, not when chat is first opened
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

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

  const uploadToCloudinary = async (file: File): Promise<string> => {
    return await uploadImageToCloudinary(file, "edupath/chat");
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedImage) || sendingMessage || !roomId)
      return;

    setSendingMessage(true);
    setError(null);

    try {
      let messageToSend = newMessage.trim();

      // If there's an image, upload it first
      if (selectedImage) {
        setUploadingImage(true);
        try {
          const imageUrl = await uploadToCloudinary(selectedImage);
          messageToSend = messageToSend
            ? `${messageToSend}\n${imageUrl}`
            : imageUrl;
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

      // Optimistic update
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        message: messageToSend,
        senderId: currentUserId,
        senderName: "You",
        timestamp: new Date().toISOString(),
        isFromAdmin: false,
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      // Send to server
      const sentMessage = await chatHandler.sendMessage(roomId, messageToSend);

      if (sentMessage) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id ? sentMessage : msg
          )
        );
      } else {
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== optimisticMessage.id)
        );
        throw new Error("Failed to send message");
      }

      setNewMessage("");
      handleRemoveImage();

      // Focus back to textarea so user can continue typing
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Gagal mengirim pesan");
      setMessages((prev) => prev.filter((msg) => !msg.id.startsWith("temp-")));
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Overlay for expanded view */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={() => setZoomedImage(null)}
        >
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black/50 rounded-full p-2 transition-colors"
          >
            <X size={24} />
          </button>
          <img
            src={zoomedImage}
            alt="Zoomed image"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Chat Container */}
      <div
        className={`flex flex-col transition-all duration-300 ${
          isExpanded
            ? "fixed inset-4 md:inset-8 lg:inset-12 bg-white rounded-2xl shadow-2xl z-50 p-6"
            : "h-[600px]"
        }`}
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-primary hover:bg-secondary-light rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h3 className="font-semibold text-gray-800">
                Chat Konseling #{consultation.consultation_id}
              </h3>
              <p className="text-sm text-gray-600">{consultation.topic}</p>
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-600 hover:text-primary hover:bg-secondary-light rounded-lg transition-colors"
            title={isExpanded ? "Perkecil" : "Perbesar"}
          >
            {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Loader className="animate-spin mb-2" />
              Memuat pesan...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="text-4xl mb-2">💬</div>
              <p className="text-lg font-medium">Belum ada pesan</p>
              <p className="text-sm mt-1">
                Mulai percakapan dengan mengirim pesan
              </p>
            </div>
          ) : (
            messages.map((message) => {
              // Student's messages go to the right, admin's to the left
              const isMine = message.senderId === currentUserId;

              // Parse message to check for image
              const { imageUrl, textMessage } = parseMessageWithImage(
                message.message
              );

              // Check if this is a Zoom meeting message
              const isZoomMessage = textMessage.includes("Zoom Meeting Dibuat");

              return (
                <div
                  key={message.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`${
                      isZoomMessage ? "max-w-[85%]" : "max-w-[70%]"
                    }`}
                  >
                    {isZoomMessage ? (
                      // Special styling for Zoom meeting messages
                      <div className="bg-gray-200 border-2 border-gray-300 rounded-xl p-4 shadow-md">
                        <div className="flex items-start gap-3">
                          <div className="bg-primary-light p-2 rounded-lg flex-shrink-0">
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
                                  // Skip HOST URL (only for admin)
                                  if (line.startsWith("🔗HOST")) {
                                    return null;
                                  }

                                  // Regular join URL for student
                                  const url = line.replace("🔗 ", "").trim();
                                  return (
                                    <a
                                      key={idx}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block mb-2"
                                    >
                                      <button className="w-full bg-primary hover:bg-primary-light text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2">
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
                                        Join Zoom Meeting
                                      </button>
                                    </a>
                                  );
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

                                // Warning message - skip it, not needed
                                if (line.startsWith("⚠️")) {
                                  return null;
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
                            onClick={() => setZoomedImage(imageUrl)}
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
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="pt-4 border-t">
          {/* Show info message if consultation is completed */}
          {consultation.status === "COMPLETED" && (
            <div className="mb-3 p-3 bg-gray-100 rounded-lg text-center">
              <p className="text-sm text-gray-600">
                ⏱️ Sesi konseling telah selesai. Chat tidak dapat digunakan
                lagi.
              </p>
            </div>
          )}

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

          <div className="flex items-center space-x-2">
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
              disabled={
                uploadingImage ||
                sendingMessage ||
                consultation.status === "COMPLETED"
              }
              className="p-2 bg-secondary-light text-gray-600 hover:text-primary hover:bg-secondary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              title="Kirim gambar"
            >
              <ImageIcon size={25} />
            </button>

            {/* Text Input */}
            <div className="flex-1 flex items-center">
              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  consultation.status === "COMPLETED"
                    ? "Konseling telah selesai"
                    : "Ketik pesan..."
                }
                rows={1}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                style={{ minHeight: "40px", maxHeight: "120px" }}
                disabled={
                  uploadingImage ||
                  sendingMessage ||
                  consultation.status === "COMPLETED"
                }
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={
                (!newMessage.trim() && !selectedImage) ||
                sendingMessage ||
                uploadingImage ||
                consultation.status === "COMPLETED"
              }
              className="bg-primary text-white p-2 rounded-lg hover:bg-primary-light disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[40px] min-h-[40px]"
            >
              {uploadingImage ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatView;
