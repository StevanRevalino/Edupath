import { useState, useEffect, useRef } from "react";
import { X, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import TokenManager from "../../../../utils/tokenManager";
import { parseMessageWithImage } from "../../../../utils/cloudinary";
import {
  consultationHandler,
  type ChatMessage,
} from "../../../../handler/consultationHandler";

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

      // Get chat room first
      const roomResponse = await consultationHandler.getChatRoom(
        consultationId
      );
      const roomId = roomResponse.data!.room_id;

      // Fetch messages
      const messagesResponse = await consultationHandler.getChatMessages(
        roomId
      );
      setMessages(messagesResponse.data || []);
    } catch (error: any) {
      console.error("Error fetching chat messages:", error);
      if (error.response?.status === 404) {
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

              // Check if this is a Zoom meeting message
              const isZoomMessage = textMessage.includes(
                "🎥 Zoom Meeting Dibuat"
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
                      className={`${
                        isZoomMessage ? "max-w-[85%]" : "max-w-[70%]"
                      } ${isMine ? "items-end" : "items-start"} flex flex-col`}
                    >
                      {!isMine && !isZoomMessage && (
                        <span className="text-xs text-gray-600 mb-1 ml-1">
                          {message.senderName}
                        </span>
                      )}

                      {isZoomMessage ? (
                        // Special styling for Zoom meeting messages
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 shadow-md w-full">
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
                                🎥 Zoom Meeting
                              </div>
                              {/* Parse and display meeting details */}
                              {textMessage
                                .split("\n")
                                .slice(1)
                                .map((line: string, idx: number) => {
                                  if (line.includes("━")) return null;
                                  if (line.trim() === "") return null;

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

                                  // Zoom URLs - hide them, just show message
                                  if (line.startsWith("🔗")) {
                                    return null;
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
                          <div className="mt-2 text-xs text-gray-500">
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      ) : (
                        // Regular message styling
                        <>
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
                        </>
                      )}
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
