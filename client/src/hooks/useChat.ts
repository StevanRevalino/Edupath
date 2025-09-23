import { useState, useEffect, useRef } from "react";
import { chatService } from "../services/chatService";

interface Message {
  message_id: string;
  message: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isFromAdmin: boolean;
}

interface UseChatProps {
  consultationId: string;
  userId: string;
  enabled: boolean;
}

interface UseChatReturn {
  messages: Message[];
  loading: boolean;
  sending: boolean;
  sendMessage: (messageText: string) => Promise<void>;
  error: string | null;
}

export const useChat = ({
  consultationId,
  userId,
  enabled,
}: UseChatProps): UseChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const initRef = useRef(false);

  // Initialize chat room and start polling
  useEffect(() => {
    if (!enabled || !consultationId || initRef.current) return;

    const initializeChat = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get or create room
        const currentRoomId = await chatService.getOrCreateRoom(consultationId);
        if (currentRoomId) {
          setRoomId(currentRoomId);

          // Load initial messages
          const initialMessages = await chatService.loadMessages(currentRoomId);
          setMessages(initialMessages);

          // Start polling for new messages
          chatService.startPolling(currentRoomId, 5000);
        }
      } catch (err) {
        console.error("Error initializing chat:", err);
        setError("Gagal menginisialisasi chat");
      } finally {
        setLoading(false);
        initRef.current = true;
      }
    };

    initializeChat();

    // Set up message handler
    const handleMessages = (newMessages: Message[]) => {
      // Only update if messages actually changed to avoid unnecessary re-renders
      setMessages(prev => {
        // Simple comparison by length and last message ID
        if (prev.length !== newMessages.length) {
          return newMessages;
        }
        
        const lastPrev = prev[prev.length - 1];
        const lastNew = newMessages[newMessages.length - 1];
        
        if (!lastPrev || !lastNew || lastPrev.message_id !== lastNew.message_id) {
          return newMessages;
        }
        
        return prev; // No change, keep previous state
      });
    };

    // Set up error handler
    const handleError = (errorMessage: string) => {
      setError(errorMessage);
    };

    chatService.onMessages(handleMessages);
    chatService.onError(handleError);

    // Cleanup on unmount
    return () => {
      chatService.removeMessageHandler(handleMessages);
      chatService.removeErrorHandler(handleError);
      chatService.stopPolling();
    };
  }, [consultationId, enabled]);

  // Send message function
  const sendMessage = async (messageText: string) => {
    if (!roomId || sending) return;

    setSending(true);
    setError(null);

    try {
      // Optimistic update: Add message to UI immediately
      const optimisticMessage: Message = {
        message_id: `temp-${Date.now()}`, // Temporary ID
        message: messageText,
        senderId: userId,
        senderName: "You",
        timestamp: new Date().toISOString(),
        isFromAdmin: false,
      };

      // Add to messages immediately for better UX
      setMessages(prev => [...prev, optimisticMessage]);

      // Send to server
      const newMessage = await chatService.sendMessage(roomId, messageText);
      
      if (newMessage) {
        // Replace optimistic message with real message from server
        setMessages(prev => 
          prev.map(msg => 
            msg.message_id === optimisticMessage.message_id 
              ? newMessage 
              : msg
          )
        );
      } else {
        // Remove optimistic message if sending failed
        setMessages(prev => 
          prev.filter(msg => msg.message_id !== optimisticMessage.message_id)
        );
        throw new Error("Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  return {
    messages,
    loading,
    sending,
    sendMessage,
    error,
  };
};
