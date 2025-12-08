import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { ref, get, update } from 'firebase/database';
import AnimatedPage from '../components/AnimatedPage';
import { motion, AnimatePresence } from 'framer-motion';
import ImageCropModal from '../components/ImageCropModal';

interface UserProfile {
    name: string;
    email: string;
    bio: string;
    picBase64: string;
    lastChange: number;
}

const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editBio, setEditBio] = useState('');
    const [editPic, setEditPic] = useState<string | null>(null);

    // Image crop state
    const [imgSrc, setImgSrc] = useState<string>('');
    const [showCropModal, setShowCropModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cooldown state
    const [timeLeft, setTimeLeft] = useState('');
    const canEdit = profile ? Date.now() - profile.lastChange > ONE_WEEK_IN_MS : false;


    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                try {
                    const userRef = ref(db, `Users/${user.uid}`);
                    const snapshot = await get(userRef);
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        setProfile(data);
                        setEditName(data.name);
                        setEditBio(data.bio);
                        setEditPic(data.picBase64);
                    } else {
                        setError("Profile not found.");
                    }
                } catch (err) {
                    setError("Failed to fetch profile data.");
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            }
        };
        if(user) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (profile && !canEdit) {
            const interval = setInterval(() => {
                const timeRemaining = profile.lastChange + ONE_WEEK_IN_MS - Date.now();
                if (timeRemaining <= 0) {
                    setTimeLeft('');
                    clearInterval(interval);
                    // Force a re-render to enable editing
                    setProfile(p => p ? {...p} : null);
                } else {
                    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
                    setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [profile, canEdit]);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImgSrc(reader.result?.toString() || '');
                setShowCropModal(true);
            });
            reader.readAsDataURL(file);
            e.target.value = ''; // Reset file input
        }
    };

    const handleCropSave = (croppedImageBase64: string) => {
        setEditPic(croppedImageBase64);
        setShowCropModal(false);
    };
    
    const handleSave = async () => {
        if (!user || !profile || !canEdit) return;
        setLoading(true);
        try {
            const userRef = ref(db, `Users/${user.uid}`);
            const updates = {
                name: editName,
                bio: editBio,
                picBase64: editPic,
                lastChange: Date.now(),
            };
            await update(userRef, updates);
            setProfile(prev => prev ? {...prev, ...updates} : null);
            setIsEditing(false);
        } catch (err) {
            setError("Failed to update profile.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (profile) {
            setEditName(profile.name);
            setEditBio(profile.bio);
            setEditPic(profile.picBase64);
        }
        setIsEditing(false);
    }
    
    if (loading && !profile) {
        return <div className="flex justify-center items-center h-[calc(100vh-8rem)]"><p>Loading Profile...</p></div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-[calc(100vh-8rem)]"><p className="text-red-500">{error}</p></div>;
    }

    if (!profile) {
        return <div className="flex justify-center items-center h-[calc(100vh-8rem)]"><p>No profile data available.</p></div>;
    }

    return (
        <AnimatedPage>
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <motion.div 
                    className="bg-white rounded-xl shadow-lg overflow-hidden p-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <AnimatePresence>
                    {showCropModal && imgSrc && (
                        <ImageCropModal 
                            imgSrc={imgSrc}
                            onSave={handleCropSave}
                            onClose={() => setShowCropModal(false)}
                        />
                    )}
                    </AnimatePresence>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Profile Picture */}
                        <div className="relative">
                            <img 
                                src={isEditing ? (editPic || 'https://via.placeholder.com/160') : (profile.picBase64 || 'https://via.placeholder.com/160')} 
                                alt="Profile"
                                className="w-40 h-40 rounded-full object-cover ring-4 ring-primary/20"
                                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/160')}
                            />
                            {isEditing && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors"
                                    aria-label="Change profile picture"
                                >
                                    <i className="fas fa-camera"></i>
                                </button>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 text-center md:text-left">
                           {isEditing ? (
                                <>
                                    <input 
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="text-4xl font-bold text-dark-text mb-1 w-full border-b-2 border-gray-200 focus:border-primary focus:outline-none bg-transparent"
                                    />
                                     <p className="text-lg text-light-text mb-4">{profile.email}</p>
                                    <textarea
                                        value={editBio}
                                        onChange={(e) => setEditBio(e.target.value)}
                                        className="text-md text-dark-text mt-4 w-full border border-gray-200 rounded-md p-2 focus:border-primary focus:outline-none"
                                        rows={4}
                                    />
                                </>
                           ) : (
                                <>
                                    <h1 className="text-4xl font-bold text-dark-text mb-1">{profile.name}</h1>
                                    <p className="text-lg text-light-text mb-4">{profile.email}</p>
                                    <p className="text-md text-dark-text mt-4 whitespace-pre-wrap">{profile.bio}</p>
                                </>
                           )}
                        </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end items-center gap-4">
                        {!isEditing && !canEdit && (
                            <div className="text-sm text-light-text text-center sm:text-right">
                                <p>You can edit your profile again in:</p>
                                <p className="font-semibold text-secondary">{timeLeft}</p>
                            </div>
                        )}
                        {isEditing ? (
                            <>
                                <button onClick={handleCancel} className="px-6 py-2 rounded-full text-dark-text hover:bg-gray-100 transition-colors">
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSave} 
                                    className="px-6 py-2 rounded-full text-white bg-primary hover:bg-primary-dark transition-colors disabled:bg-gray-400"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </>
                        ) : (
                             <button 
                                onClick={() => setIsEditing(true)} 
                                className="px-6 py-2 rounded-full text-white bg-secondary hover:opacity-90 transition-opacity disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled={!canEdit}
                                title={!canEdit ? `You can edit again in ${timeLeft}`: 'Edit your profile'}
                            >
                                <i className="fas fa-pencil-alt mr-2"></i>
                                Edit Profile
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatedPage>
    );
};

export default ProfilePage;
