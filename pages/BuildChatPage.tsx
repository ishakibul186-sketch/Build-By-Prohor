
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db, ref, push, set, onValue, get, serverTimestamp } from '../firebase';
import AnimatedPage from '../components/AnimatedPage';
import ChatListItem from '../components/ChatListItem';
import { motion } from 'framer-motion';

// Interface for individual messages (for summary)
interface Message {
    id: string;
    sender: 'user' | 'admin';
    type: 'text' | 'form_submission';
    content: string | Record<string, any>;
    timestamp: number;
}

// Interface for chat data stored in Firebase AFTER processing (messages as array)
interface ChatData {
  date: string;
  time: string;
  lastUpdated: number; // Firebase server timestamp
  userPhoto: string | null;
  messages?: Message[]; // Optional messages if available, for summary
}

// FIX: Define a type for the raw chat data coming directly from Firebase
// Firebase stores sub-collections like 'messages' as records/objects with auto-generated keys,
// not directly as arrays.
interface RawChatData {
  date: string;
  time: string;
  lastUpdated: number;
  userPhoto: string | null;
  messages?: Record<string, Omit<Message, 'id'>>;
}


const BuildChatPage: React.FC = () => {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState<Record<string, ChatData>>({});
  const [loadingChats, setLoadingChats] = useState(true);
  const [userProfilePic, setUserProfilePic] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Build Website & Chat – Build By Prohor';
    
    // Helper to set meta tags
    const setMetaTag = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMetaTag('description', 'Start a new project with Build By Prohor. Use our integrated chat to discuss your website requirements, submit details, and track progress.');
    setMetaTag('author', 'Build Website & Chat-Build By Prohor');
  }, []);

  // Fetch user's current profile picture once to store with new chats
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

  // Listen for real-time chat updates
  useEffect(() => {
    if (user && !authLoading) {
      setLoadingChats(true);
      const chatsRef = ref(db, `Build_Chat/${user.uid}`);
      const unsubscribe = onValue(chatsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          // FIX: Process raw Firebase chat data into the expected ChatData structure,
          // converting `messages` from a record to a sorted array if it exists.
          const processedChats: Record<string, ChatData> = Object.entries(data).reduce((acc, [chatId, chatRawDataUnknown]) => {
            // FIX: Assert chatRawDataUnknown to RawChatData to allow property access and spread syntax.
            const chatRawData = chatRawDataUnknown as RawChatData; 
            const messagesArray: Message[] = chatRawData.messages
              ? Object.entries(chatRawData.messages).map(([id, msg]) => ({ id, ...msg as Omit<Message, 'id'> }))
              : [];
            
            acc[chatId] = {
              ...chatRawData,
              messages: messagesArray.sort((a, b) => a.timestamp - b.timestamp),
            };
            return acc;
          }, {} as Record<string, ChatData>);

          setChats(processedChats);
        } else {
          setChats({});
        }
        setLoadingChats(false);
      }, (error) => {
        console.error("Error fetching chats:", error);
        setLoadingChats(false);
      });

      return () => unsubscribe(); // Cleanup listener
    } else if (!user && !authLoading) {
      setChats({});
      setLoadingChats(false);
    }
  }, [user, authLoading]);

  const handleNewChat = async () => {
    if (!user) {
      console.error("User not logged in to create a new chat.");
      return;
    }

    try {
      // Get current date and time
      const now = new Date();
      const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }); // HH:MM

      const newChatRef = push(ref(db, `Build_Chat/${user.uid}`));
      const newChatId = newChatRef.key;

      if (newChatId) {
        await set(newChatRef, {
          date: date,
          time: time,
          lastUpdated: serverTimestamp(), // Use server timestamp
          userPhoto: userProfilePic, // Store user's photo at time of chat creation
        });
        navigate(`/build-chat/${newChatId}`);
      }
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };

  const sortedChats = Object.entries(chats).sort(([, a], [, b]) => b.lastUpdated - a.lastUpdated);

  if (authLoading || loadingChats) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-slate-900 text-primary pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AnimatedPage>
      <div className="min-h-[calc(100vh-8rem)] bg-slate-900 p-4 pt-24 pb-12 relative">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-100 mb-6 text-center">Your Project Chats</h1>

          {sortedChats.length === 0 ? (
            <div className="text-center text-slate-400 py-10">
              <i className="fas fa-comment-alt text-6xl mb-4"></i>
              <p className="text-xl">No active chats yet. Start a new project chat!</p>
            </div>
          ) : (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {sortedChats.map(([chatId, chatData]) => (
                <ChatListItem key={chatId} chatId={chatId} chatData={chatData} />
              ))}
            </motion.div>
          )}
        </div>

        {/* New Chat FAB */}
        <motion.button
          onClick={handleNewChat}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-primary text-white p-4 rounded-full shadow-lg flex items-center justify-center gap-2 text-lg font-bold hover:bg-primary-dark transition-colors z-40"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Start New Chat"
        >
          <i className="fas fa-plus"></i>
          <span className="hidden sm:inline">New Chat</span>
        </motion.button>
      </div>
    </AnimatedPage>
  );
};

export default BuildChatPage;