import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Loader } from "lucide-react";
import { type Consultation } from "../../../../services/consultationService";
import { useChat } from "../../../../hooks/useChat";

interface ChatViewProps {
  consultation: Consultation;
  currentUserId: string;
  onBack: () => void;
}

const ChatView = ({ consultation, currentUserId, onBack }: ChatViewProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Use real-time chat hook
  const {
    messages,
    loading,
    sending: sendingMessage,
    sendMessage,
    error,
  } = useChat({
    consultationId: consultation.consultation_id,
    userId: currentUserId,
    enabled: true,
  });

  // Local state for message input
  const [newMessage, setNewMessage] = useState("");

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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sendingMessage) return;

    try {
      await sendMessage(newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
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
            return (
              <div
                key={message.message_id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[70%]`}>
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
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ketik pesan..."
              rows={1}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              style={{ minHeight: "40px", maxHeight: "120px" }}
            />
          </div>
          <button
            onClick={handleSendMessage}
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
