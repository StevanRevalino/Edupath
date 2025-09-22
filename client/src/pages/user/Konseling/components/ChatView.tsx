import { useEffect, useRef } from "react";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import { type Consultation } from "../../../../services/consultationService";

interface ChatMessage {
  id: string;
  message: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isFromAdmin: boolean;
}

interface ChatViewProps {
  consultation: Consultation;
  messages: ChatMessage[];
  newMessage: string;
  messagesLoading: boolean;
  sendingMessage: boolean;
  currentUserId: string;
  onBack: () => void;
  onSendMessage: () => void;
  onMessageChange: (message: string) => void;
}

const ChatView = ({
  consultation,
  messages,
  newMessage,
  messagesLoading,
  sendingMessage,
  currentUserId,
  onBack,
  onSendMessage,
  onMessageChange,
}: ChatViewProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Only auto-scroll when new messages are added, not when chat is first opened
  useEffect(() => {
    if (messages.length > 0 && !messagesLoading) {
      scrollToBottom();
    }
  }, [messages, messagesLoading]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
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

  return (
    <div className="flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
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
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Belum ada pesan
            </h3>
            <p className="text-gray-500 text-sm">
              Mulai percakapan dengan mengirim pesan pertama
            </p>
          </div>
        ) : (
          messages.map((message) => {
            // Student's messages go to the right, admin's to the left
            const isMine =
              !message.isFromAdmin && message.senderId === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] ${isMine ? "order-2" : "order-1"}`}
                >
                  <div
                    className={`p-3 rounded-lg ${
                      isMine
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
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
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="pt-4 border-t">
        <div className="flex items-center space-x-2">
          <div className="flex-1 flex items-center">
            <textarea
              value={newMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ketik pesan..."
              rows={1}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              style={{ minHeight: "40px", maxHeight: "120px" }}
            />
          </div>
          <button
            onClick={onSendMessage}
            disabled={!newMessage.trim() || sendingMessage}
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
