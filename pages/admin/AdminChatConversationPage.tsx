
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db, ref, get, onValue, push, set, update, serverTimestamp } from '../../firebase';
import AnimatedPage from '../../components/AnimatedPage';
import ChatMessage from '../../components/ChatMessage';
import { motion, AnimatePresence } from 'framer-motion';
import { ProjectFormData } from '../../components/ProjectRequestForm';

// Interfaces (can be moved to a shared types file later)
interface Message {
  id: string;
  sender: 'user' | 'admin';
  type: 'text' | 'form_submission';
  content: string | ProjectFormData;
  timestamp: number;
}
interface ChatDataForComponent {
  date: string;
  time: string;
  lastUpdated: number;
  userPhoto: string | null;
  messages?: Message[];
}
interface UserProfile {
    name: string; bio: string; number: string; email: string;
}

const AdminChatConversationPage: React.FC = () => {
    const { userId, chatId } = useParams<{ userId: string; chatId: string }>();
    const [chatData, setChatData] = useState<ChatDataForComponent | null>(null);
    const [loadingChat, setLoadingChat] = useState(true);
    const [messageText, setMessageText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [modalUserData, setModalUserData] = useState<UserProfile | null>(null);
    const [modalProjectData, setModalProjectData] = useState<ProjectFormData | null>(null);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        if (userId && chatId) {
            setLoadingChat(true);
            const chatRef = ref(db, `Build_Chat/${userId}/${chatId}`);
            const unsubscribe = onValue(chatRef, (snapshot) => {
                const rawData = snapshot.val();
                if (rawData) {
                    const messagesArray: Message[] = rawData.messages
                        ? Object.entries(rawData.messages).map(([id, msg]) => ({ id, ...(msg as Omit<Message, 'id'>) }))
                        : [];
                    setChatData({ ...rawData, messages: messagesArray.sort((a, b) => a.timestamp - b.timestamp) });
                } else {
                    setChatData(null);
                }
                setLoadingChat(false);
            }, (error) => {
                console.error("Error fetching chat:", error);
                setLoadingChat(false);
            });
            return () => unsubscribe();
        }
    }, [userId, chatId]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatData?.messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !chatId || !messageText.trim()) return;
        try {
            const messagesRef = ref(db, `Build_Chat/${userId}/${chatId}/messages`);
            const newMsgRef = push(messagesRef);
            await set(newMsgRef, {
                sender: 'admin',
                type: 'text',
                content: messageText.trim(),
                timestamp: serverTimestamp(),
            });
            setMessageText('');
            await update(ref(db, `Build_Chat/${userId}/${chatId}`), {
                lastUpdated: serverTimestamp(),
            });
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };
    
    const handleOpenInfoModal = async () => {
        if (!userId || !chatData) return;
        setIsInfoModalOpen(true);
        setModalLoading(true);
        try {
            const userRef = ref(db, `Users/${userId}`);
            const userSnap = await get(userRef);
            if (userSnap.exists()) {
                setModalUserData(userSnap.val());
            }
            const formSubmission = chatData.messages?.find(msg => msg.type === 'form_submission');
            if (formSubmission) {
                setModalProjectData(formSubmission.content as ProjectFormData);
            }
        } catch (error) {
            console.error("Error fetching modal data:", error);
        } finally {
            setModalLoading(false);
        }
    };

    if (loadingChat) {
        return <div className="h-screen flex items-center justify-center bg-slate-900"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
    }
    if (!chatData) {
        return <div className="h-screen flex items-center justify-center bg-slate-900 text-white"><p>Chat not found.</p></div>;
    }

    const brandName = (modalProjectData?.brandBusinessName || (chatData.messages?.find(msg => msg.type === 'form_submission')?.content as ProjectFormData)?.brandBusinessName) || `Chat with User`;

    return (
        <AnimatedPage>
            <div className="h-screen w-full flex flex-col bg-slate-800 pt-16">
                <div className="flex-shrink-0 p-4 border-b border-slate-700 bg-slate-700 text-slate-100 flex justify-between items-center">
                    <h1 className="font-semibold text-xl">{brandName}</h1>
                    <button onClick={handleOpenInfoModal} className="text-slate-300 hover:text-primary transition-colors" aria-label="View Details">
                        <i className="fas fa-info-circle text-2xl"></i>
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto px-4 py-2 space-y-4">
                    {chatData.messages?.map(msg => (
                        <ChatMessage key={msg.id} message={msg} userPhoto={null} chatUserPhoto={chatData.userPhoto} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="flex-shrink-0 bg-slate-700 p-4 border-t border-slate-700">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="Type your message as admin..."
                            className="flex-grow px-4 py-2 bg-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button type="submit" className="bg-primary text-white p-3 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center"><i className="fas fa-paper-plane"></i></button>
                    </form>
                </div>
            </div>

            <AnimatePresence>
                {isInfoModalOpen && (
                    <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsInfoModalOpen(false)}>
                        <motion.div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} onClick={e => e.stopPropagation()}>
                            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-primary">Details</h2>
                                <button onClick={() => setIsInfoModalOpen(false)} className="text-slate-400 text-2xl hover:text-white">&times;</button>
                            </div>
                            <div className="p-6 overflow-y-auto">
                                {modalLoading ? <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div></div> : (
                                    <div className="space-y-6">
                                        {modalUserData && (
                                            <div>
                                                <h3 className="font-semibold text-slate-200 border-b border-slate-700 pb-2 mb-2">User Information</h3>
                                                <p><strong className="text-slate-400">Name:</strong> {modalUserData.name}</p>
                                                <p><strong className="text-slate-400">Email:</strong> {modalUserData.email}</p>
                                                <p><strong className="text-slate-400">Phone:</strong> {modalUserData.number}</p>
                                                <p><strong className="text-slate-400">Bio:</strong> {modalUserData.bio}</p>
                                            </div>
                                        )}
                                        {modalProjectData && (
                                            <div>
                                                <h3 className="font-semibold text-slate-200 border-b border-slate-700 pb-2 mb-2">Project Details</h3>
                                                {Object.entries(modalProjectData).map(([key, value]) => (
                                                    <p key={key}><strong className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</strong> {Array.isArray(value) ? value.join(', ') : value}</p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AnimatedPage>
    );
};

export default AdminChatConversationPage;
