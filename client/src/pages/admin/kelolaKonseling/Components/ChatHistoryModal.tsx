import { useState, useEffect, useRef } from "react";
import { X, MessageCircle } from "lucide-react";
import axios from "axios";
import TokenManager from "../../../../utils/tokenManager";
import toast from "react-hot-toast";
import { parseMessageWithImage } from "../../../../utils/cloudinary";

interface ChatMessage {
  id: string;
  message: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isFromAdmin: boolean;
}

interface ChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultationId: string;
  studentName: string;
  topic: string;
}

const ChatHistoryModal = ({
  isOpen,
  onClose,
  consultationId,
  studentName,
  topic,
}: ChatHistoryModalProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const currentUserId = TokenManager.getUserData().userId || "";

  useEffect(() => {
    if (isOpen && consultationId) {
      fetchChatMessages();
    }
  }, [isOpen, consultationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  };

  const fetchChatMessages = async () => {
    try {
      setLoading(true);
      const token = TokenManager.getToken();

      // Get chat room first
      const roomResponse = await axios.get(
        `${API_URL}/api/chat/room/${consultationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const roomId = roomResponse.data.data.room_id;

      // Fetch messages
      const messagesResponse = await axios.get(
        `${API_URL}/api/chat/messages/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessages(messagesResponse.data.data);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        toast.error("Chat room tidak ditemukan");
      } else {
        toast.error("Gagal mengambil riwayat chat");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
              <MessageCircle className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">{studentName}</h3>
              <p className="text-sm text-gray-600">{topic}</p>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded mt-1 inline-block">
                Chat History (Read Only)
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat riwayat chat...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>Belum ada pesan</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => {
              const isMine = message.senderId === currentUserId;
              const { imageUrl, textMessage } = parseMessageWithImage(
                message.message
              );

              // Check if we need to show date divider
              const showDateDivider =
                index === 0 ||
                formatDate(message.timestamp) !==
                  formatDate(messages[index - 1].timestamp);

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
                      className={`max-w-[70%] ${
                        isMine ? "items-end" : "items-start"
                      } flex flex-col`}
                    >
                      {!isMine && (
                        <span className="text-xs text-gray-600 mb-1 ml-1">
                          {message.senderName}
                        </span>
                      )}
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
                            onClick={() => window.open(imageUrl, "_blank")}
                          />
                        )}
                        {textMessage && (
                          <p className="text-sm whitespace-pre-line">
                            {textMessage}
                          </p>
                        )}
                      </div>
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

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Chat history bersifat read-only. Tidak dapat mengirim pesan baru.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatHistoryModal;
