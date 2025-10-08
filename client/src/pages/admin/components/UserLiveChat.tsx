import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, X, Minimize2, Maximize2 } from "lucide-react";
import toast from "react-hot-toast";

interface ChatMessage {
  id: string;
  message: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isFromAdmin: boolean;
}

interface ChatProps {
  isOpen: boolean;
  onToggle: () => void;
}

const UserLiveChat = ({ isOpen, onToggle }: ChatProps) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isConnected] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Load chat history on component mount
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sendingMessage) return;

    setSendingMessage(true);
    try {
      // TODO: Implement real-time chat with backend
      // For now, just add message locally
      const userId = "US005";

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        message: newMessage,
        senderId: userId,
        senderName: "Saya",
        timestamp: new Date().toISOString(),
        isFromAdmin: false,
      };

      setChatMessages((prev) => [...prev, userMessage]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Gagal mengirim pesan");
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
    const date = new Date(timestamp);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (!isMinimized) {
      setUnreadCount(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Window */}
      <div
        className={`bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
          isMinimized ? "h-16 w-80" : "h-96 w-80 sm:w-96"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-blue-500 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <MessageCircle size={20} />
            <div>
              <h3 className="font-semibold text-sm">Chat dengan Ibu Sarah</h3>
              <p className="text-xs opacity-90">
                {isConnected ? "Terhubung dengan BK001" : "Tidak terhubung"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {unreadCount > 0 && isMinimized && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
            <button
              onClick={handleMinimize}
              className="text-white hover:text-gray-200 transition-colors"
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button
              onClick={onToggle}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Chat Content - Only show when not minimized */}
        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 h-64">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageCircle size={48} className="mb-3 opacity-50" />
                  <p className="text-sm font-medium mb-1">Belum ada pesan</p>
                  <p className="text-xs text-center px-4">
                    Mulai percakapan dengan mengirim pesan
                  </p>
                </div>
              ) : (
                <>
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.isFromAdmin ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div className={`max-w-[80%]`}>
                        <div
                          className={`p-2 rounded-lg text-sm ${
                            message.isFromAdmin
                              ? "bg-gray-200 text-gray-800"
                              : "bg-blue-500 text-white"
                          }`}
                        >
                          <p>{message.message}</p>
                        </div>
                        <div
                          className={`flex items-center mt-1 text-xs text-gray-500 ${
                            message.isFromAdmin
                              ? "justify-start"
                              : "justify-end"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-3 border-t border-gray-200">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ketik pesan..."
                    rows={1}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    style={{ minHeight: "32px", maxHeight: "80px" }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserLiveChat;
