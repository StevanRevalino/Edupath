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
import { type Consultation } from "../../../../services/consultationService";
import { useChat } from "../../../../hooks/useChat";
import toast from "react-hot-toast";
import {
  uploadImageToCloudinary,
  parseMessageWithImage,
} from "../../../../utils/cloudinary";

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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if ((!newMessage.trim() && !selectedImage) || sendingMessage) return;

    try {
      let messageToSend = newMessage.trim();

      // If there's an image, upload it first
      if (selectedImage) {
        setUploadingImage(true);
        try {
          const imageUrl = await uploadToCloudinary(selectedImage);
          // Add image URL to message (without [IMAGE] prefix)
          messageToSend = messageToSend
            ? `${messageToSend}\n${imageUrl}`
            : imageUrl;
        } catch (error: any) {
          console.error("Error uploading image:", error);
          toast.error(error.message || "Gagal mengupload gambar");
          setUploadingImage(false);
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      await sendMessage(messageToSend);
      setNewMessage("");
      handleRemoveImage();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Gagal mengirim pesan");
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

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt="Shared image"
                          className="rounded-lg mb-2 max-w-[300px] h-auto cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setZoomedImage(imageUrl)}
                        />
                      )}
                      {textMessage && <p className="text-sm">{textMessage}</p>}
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
              disabled={uploadingImage || sendingMessage}
              className="p-2 bg-[#D0E5FF] text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              title="Kirim gambar"
            >
              <ImageIcon size={25} />
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
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[40px] min-h-[40px]"
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
