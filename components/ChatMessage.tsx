
import React from 'react';
import { motion } from 'framer-motion';
import { ProjectFormData } from './ProjectRequestForm'; // Import the interface for form data

interface Message {
  id: string;
  sender: 'user' | 'admin';
  type: 'text' | 'form_submission';
  content: string | ProjectFormData;
  timestamp: number;
}

interface ChatMessageProps {
  message: Message;
  userPhoto: string | null; // Photo of the current logged-in user
  chatUserPhoto: string | null; // Photo of the user who started THIS specific chat
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, userPhoto, chatUserPhoto }) => {
  const isUser = message.sender === 'user';
  const defaultPhoto = 'https://via.placeholder.com/150'; // Default placeholder image
  const senderPhoto = isUser ? (userPhoto || chatUserPhoto || defaultPhoto) : defaultPhoto;

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const renderMessageContent = (content: string | ProjectFormData, type: string) => {
    if (type === 'form_submission' && typeof content === 'object') {
      const formData = content as ProjectFormData;
      return (
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-primary">Project Inquiry Submitted:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-300">
            <li><span className="font-medium">Brand/Business Name:</span> {formData.brandBusinessName}</li>
            <li><span className="font-medium">Business Type:</span> {formData.businessType}</li>
            <li><span className="font-medium">Has Domain:</span> {formData.hasDomain} {formData.hasDomain === 'Yes' && `(${formData.domainName})`}</li>
            <li><span className="font-medium">Logo Upload:</span> {formData.logoUpload}</li>
            <li><span className="font-medium">Preferred Color:</span> {formData.preferredColorTheme}</li>
            {formData.extraFunctionalities && formData.extraFunctionalities.length > 0 && (
              <li>
                <span className="font-medium">Functionalities:</span> {formData.extraFunctionalities.join(', ')}
              </li>
            )}
          </ul>
          <p className="italic text-slate-400">We'll review your details and get back to you shortly!</p>
        </div>
      );
    }
    return <p>{content as string}</p>;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0 ring-2 ring-primary/50" title="Admin">
            <i className="fas fa-user-secret text-slate-200"></i>
        </div>
      )}
      <div
        className={`flex flex-col max-w-[70%] p-3 rounded-xl shadow-md ${
          isUser
            ? 'bg-primary text-white rounded-br-none'
            : 'bg-slate-700 text-slate-100 rounded-bl-none'
        }`}
      >
        <div className="text-sm">
          {renderMessageContent(message.content, message.type)}
        </div>
        <span className={`text-xs mt-1 ${isUser ? 'text-white/80' : 'text-slate-400'} text-right`}>
          {formatTimestamp(message.timestamp)}
        </span>
      </div>
      {isUser && (
        <img
          src={senderPhoto}
          alt="User"
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          onError={(e) => (e.currentTarget.src = defaultPhoto)}
        />
      )}
    </motion.div>
  );
};

export default ChatMessage;
