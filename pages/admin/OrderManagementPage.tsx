
import React, { useState, useEffect, useMemo } from 'react';
import AnimatedPage from '../../components/AnimatedPage';
import { db, ref, onValue } from '../../firebase';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Interface for a single chat object after processing for the admin list
interface AdminChat {
  userId: string;
  chatId: string;
  userEmail: string;
  brandBusinessName: string;
  date: string;
  lastUpdated: number;
  userPhoto: string | null;
}

const OrderManagementPage: React.FC = () => {
    const [allChats, setAllChats] = useState<AdminChat[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setLoading(true);
        // First, fetch all users to create a UID -> email map for efficiency
        const usersRef = ref(db, 'Users');
        onValue(usersRef, (userSnapshot) => {
            const usersData = userSnapshot.val() || {};
            const emailMap: Record<string, string> = {};
            Object.keys(usersData).forEach(uid => {
                emailMap[uid] = usersData[uid].email;
            });

            // Then, fetch all chats in real-time
            const chatsRef = ref(db, 'Build_Chat');
            const unsubscribeChats = onValue(chatsRef, (snapshot) => {
                const data = snapshot.val();
                const chatList: AdminChat[] = [];
                if (data) {
                    // data is { userId1: { chatId1: {...}, chatId2: {...} }, userId2: ... }
                    Object.keys(data).forEach(userId => {
                        const userChats = data[userId];
                        Object.keys(userChats).forEach(chatId => {
                            const chatData = userChats[chatId];
                            
                            // Find brand name from form submission message
                            let brandName = 'New Project Inquiry';
                            if (chatData.messages) {
                                const formSubmissionMsg = Object.values(chatData.messages).find(
                                    (msg: any) => msg.type === 'form_submission'
                                );
                                if (formSubmissionMsg && (formSubmissionMsg as any).content?.brandBusinessName) {
                                    brandName = (formSubmissionMsg as any).content.brandBusinessName;
                                }
                            }
                            
                            chatList.push({
                                userId,
                                chatId,
                                userEmail: emailMap[userId] || 'Unknown Email',
                                brandBusinessName: brandName,
                                date: chatData.date,
                                lastUpdated: chatData.lastUpdated,
                                userPhoto: chatData.userPhoto,
                            });
                        });
                    });
                }
                // Sort by most recently updated
                chatList.sort((a, b) => b.lastUpdated - a.lastUpdated);
                setAllChats(chatList);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching chats:", error);
                setLoading(false);
            });
            
            // Cleanup function for chats listener
            return () => unsubscribeChats();
        }, { onlyOnce: true }); // Fetch user map only once for performance

    }, []);

    const filteredChats = useMemo(() => {
        if (!searchTerm.trim()) return allChats;
        const lowercasedSearch = searchTerm.toLowerCase();
        return allChats.filter(chat => 
            chat.brandBusinessName.toLowerCase().includes(lowercasedSearch) ||
            chat.userEmail.toLowerCase().includes(lowercasedSearch) ||
            chat.date.includes(lowercasedSearch)
        );
    }, [allChats, searchTerm]);

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <AnimatedPage>
            <div className="bg-slate-900 text-white min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-primary mb-6">Project Order Management</h1>
                    
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Search by brand name, user email, or date..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredChats.length > 0 ? (
                                filteredChats.map(chat => (
                                    <motion.div
                                        key={chat.chatId}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <Link
                                            to={`/admin/order-management/${chat.userId}/${chat.chatId}`}
                                            className="block bg-slate-800 p-4 rounded-lg border border-slate-700 hover:bg-slate-700/50 hover:border-primary/50 transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <img 
                                                    src={chat.userPhoto || 'https://via.placeholder.com/150'} 
                                                    alt="User"
                                                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                                />
                                                <div className="flex-grow">
                                                    <h3 className="font-bold text-slate-100">{chat.brandBusinessName}</h3>
                                                    <p className="text-sm text-slate-400">{chat.userEmail}</p>
                                                    <p className="text-xs text-slate-500 mt-1">Last Updated: {formatDate(chat.lastUpdated)}</p>
                                                </div>
                                                <div className="text-slate-500">
                                                    <i className="fas fa-chevron-right"></i>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-16 text-slate-500">
                                    <i className="fas fa-comments-dollar text-5xl mb-4"></i>
                                    <p>No project chats found.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AnimatedPage>
    );
};

export default OrderManagementPage;
