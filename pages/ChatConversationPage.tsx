
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db, ref, get, onValue, push, set, update, serverTimestamp } from '../firebase';
import AnimatedPage from '../components/AnimatedPage';
import ProjectRequestForm, { ProjectFormData } from '../components/ProjectRequestForm';
import ChatMessage from '../components/ChatMessage';
import { motion, AnimatePresence } from 'framer-motion';

// Interfaces for chat and message data
interface Message {
  id: string;
  sender: 'user' | 'admin';
  type: 'text' | 'form_submission';
  content: string | ProjectFormData;
  timestamp: number; // Stored as Firebase server timestamp (number)
}

// Interface for chat data as it is stored directly in Firebase
interface RawChatDataFromFirebase {
  date: string;
  time: string;
  lastUpdated: number;
  userPhoto: string | null;
  messages?: Record<string, Omit<Message, 'id'>>; // Firebase stores messages as a record/object, not an array directly
  // 'fromjason' field also exists here but is not needed for the component's state
}

// Interface for chat data after processing for component's state (messages as array)
interface ChatDataForComponent {
  date: string;
  time: string;
  lastUpdated: number;
  userPhoto: string | null;
  messages?: Message[];
}

const ChatConversationPage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { user, authLoading } = useAuth();
  // FIX: Use the processed type for chatData state
  const [chatData, setChatData] = useState<ChatDataForComponent | null>(null);
  const [loadingChat, setLoadingChat] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [userProfilePic, setUserProfilePic] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (chatData?.messages) {
      scrollToBottom();
    }
  }, [chatData?.messages]);

  // Fetch user's current profile picture once
  useEffect(() => {
    if (user && !authLoading) {
      const fetchUserProfilePic = async () => {
        try {
          const userRef = ref(db, `Users/${user.uid}/picBase64`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            setUserProfilePic(snapshot.val());
          }
        } catch (error) {
          console.error("Failed to fetch user profile picture:", error);
        }
      };
      fetchUserProfilePic();
    }
  }, [user, authLoading]);

  // Listen for real-time chat data and messages
  useEffect(() => {
    if (user && chatId && !authLoading) {
      setLoadingChat(true);
      const chatRef = ref(db, `Build_Chat/${user.uid}/${chatId}`);
      const unsubscribe = onValue(chatRef, (snapshot) => {
        const rawData = snapshot.val();
        if (rawData) {
          // FIX: Convert rawData from Firebase's record format to an array for component state
          const firebaseChatData = rawData as RawChatDataFromFirebase; // Type assertion
          const messagesArray: Message[] = firebaseChatData.messages
            ? Object.entries(firebaseChatData.messages).map(([id, msg]) => ({ id, ...msg as Omit<Message, 'id'> }))
            : [];
          
          setChatData({ 
            date: firebaseChatData.date,
            time: firebaseChatData.time,
            lastUpdated: firebaseChatData.lastUpdated,
            userPhoto: firebaseChatData.userPhoto,
            messages: messagesArray.sort((a, b) => a.timestamp - b.timestamp) 
          });
        } else {
          setChatData(null);
        }
        setLoadingChat(false);
      }, (error) => {
        console.error("Error fetching chat conversation:", error);
        setLoadingChat(false);
      });

      return () => unsubscribe();
    } else if (!user && !authLoading) {
      setChatData(null);
      setLoadingChat(false);
    }
  }, [user, chatId, authLoading]);

  // Check if the form has been submitted (i.e., a form_submission message exists)
  const isFormSubmitted = chatData?.messages?.some(msg => msg.type === 'form_submission');

  const handleFormSubmit = async (formData: ProjectFormData) => {
    if (!user || !chatId) return;

    try {
      const messagesRef = ref(db, `Build_Chat/${user.uid}/${chatId}/messages`);
      const newMsgRef = push(messagesRef);

      // Save form data as a chat message
      await set(newMsgRef, {
        sender: 'user',
        type: 'form_submission',
        content: formData, // The form data itself
        timestamp: serverTimestamp(),
      });

      // FIX: Removed the line below as per user request to not save to 'fromjason' path
      // await set(ref(db, `Build_Chat/${user.uid}/${chatId}/fromjason`), formData);

      // Update lastUpdated timestamp on the chat
      await update(ref(db, `Build_Chat/${user.uid}/${chatId}`), {
        lastUpdated: serverTimestamp(),
      });

    } catch (error) {
      console.error("Failed to submit project form:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !chatId || !messageText.trim()) return;

    try {
      const messagesRef = ref(db, `Build_Chat/${user.uid}/${chatId}/messages`);
      const newMsgRef = push(messagesRef);

      await set(newMsgRef, {
        sender: 'user',
        type: 'text',
        content: messageText.trim(),
        timestamp: serverTimestamp(),
      });
      setMessageText('');

      // Update lastUpdated timestamp on the chat
      await update(ref(db, `Build_Chat/${user.uid}/${chatId}`), {
        lastUpdated: serverTimestamp(),
      });

    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (authLoading || loadingChat) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-primary pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!chatData) {
    return (
      <AnimatedPage>
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-slate-900 text-white pt-24">
          <p className="text-xl">Chat not found or access denied.</p>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <motion.div
        className="h-screen w-full flex flex-col bg-slate-800 pt-16 box-border"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Chat Header (Fixed) */}
        <div className="flex-shrink-0 p-4 border-b border-slate-700 bg-slate-700 text-slate-100 text-center font-semibold text-xl">
          Project Chat - {chatData.date} {chatData.time}
        </div>

        {/* Messages display area (Scrollable) */}
        <div className="flex-grow overflow-y-auto px-4 py-2 space-y-4">
          <AnimatePresence>
            {isFormSubmitted ? (
              chatData.messages?.map((msg) => (
                <ChatMessage 
                  key={msg.id} 
                  message={msg} 
                  userPhoto={userProfilePic} 
                  chatUserPhoto={chatData.userPhoto}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center items-center h-full"
              >
                <ProjectRequestForm onSubmit={handleFormSubmit} />
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} /> {/* For auto-scrolling */}
        </div>

        {/* Message Input Area (Fixed) */}
        {isFormSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0 bg-slate-700 p-4 border-t border-slate-700"
          >
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow px-4 py-2 bg-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Message input"
              />
              <button
                type="submit"
                className="bg-primary text-white p-3 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center"
                aria-label="Send message"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </motion.div>
        )}
      </motion.div>
    </AnimatedPage>
  );
};

export default ChatConversationPage;
