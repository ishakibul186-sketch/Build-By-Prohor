
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ChatData {
  date: string;
  time: string;
  lastUpdated: number;
  userPhoto: string | null;
  messages?: {type: string; content: any; timestamp: number}[];
}

interface ChatListItemProps {
  chatId: string;
  chatData: ChatData;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ chatId, chatData }) => {
  const defaultPhoto = 'https://via.placeholder.com/150'; // Default placeholder image

  // Try to extract a title from the first form submission message if available
  const messagesArray = chatData.messages || [];
  const formSubmission = messagesArray.find(msg => msg.type === 'form_submission' && typeof msg.content === 'object');
  const chatTitle = formSubmission?.content?.brandBusinessName || 'New Project Inquiry';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      // REVERTED: Re-added card-specific styling
      className="bg-slate-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
    >
      <Link to={`/build-chat/${chatId}`} className="flex items-center p-4"> {/* Removed hover:bg-slate-800 from Link as card handles hover */}
        <div className="flex-shrink-0 mr-4">
          <img
            src={chatData.userPhoto || defaultPhoto}
            alt="User Profile"
            className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
            onError={(e) => (e.currentTarget.src = defaultPhoto)}
          />
        </div>
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-slate-100">{chatTitle}</h3>
          <p className="text-sm text-slate-400">
            Created on {chatData.date} at {chatData.time}
          </p>
        </div>
        <div className="flex-shrink-0 text-slate-500">
          <i className="fas fa-chevron-right"></i>
        </div>
      </Link>
    </motion.div>
  );
};

export default ChatListItem;