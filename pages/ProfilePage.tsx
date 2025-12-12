
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, ref, get, update } from '../firebase';
import AnimatedPage from '../components/AnimatedPage';
import { motion, AnimatePresence } from 'framer-motion';

// Define the shape of user data
interface UserProfile {
  name: string;
  bio: string;
  number: string;
  dateOfBirth: string;
  address: string;
  country: string;
  email: string;
  picBase64: string;
  deviceInfo?: {
    os: string;
    browser: string;
    userAgent: string;
  };
  geolocation?: {
    latitude: number;
    longitude: number;
  };
}

const ProfilePage: React.FC = () => {
  // FIX: Changed 'loading' to 'authLoading' as 'loading' does not exist on the type returned by useAuth.
  const { user, authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [showDetails, setShowDetails] = useState(false); // Toggle between Card and Detail view
  const [saving, setSaving] = useState(false);

  // Form State for Editing
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    number: '',
    dateOfBirth: '', // This will be pre-filled but not editable
    address: '',
    country: '',     // This will be pre-filled but not editable
  });

  // Fetch User Data
  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          const userRef = ref(db, `Users/${user.uid}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            setProfile(data);
            // Initialize form data
            setFormData({
              name: data.name || '',
              bio: data.bio || '',
              number: data.number || '',
              dateOfBirth: data.dateOfBirth || '',
              address: data.address || '',
              country: data.country || '',
            });
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setLoadingData(false);
        }
      };
      fetchUserData();
    }
  }, [user]);

  // Handle Input Changes for editable fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Only update formData for editable fields
    if (name !== 'dateOfBirth' && name !== 'country') {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const userRef = ref(db, `Users/${user.uid}`);
      // Only send the editable fields for update
      const updates = {
        name: formData.name,
        bio: formData.bio,
        number: formData.number,
        address: formData.address,
        // dateOfBirth and country are not included in updates as they are read-only
      };
      await update(userRef, updates);
      
      // Update local profile state to reflect changes immediately
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      alert("Profile updated successfully!");
      setShowDetails(false); // <--- Added: Switch back to summary view on successful save
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
        <AnimatedPage>
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
                <p>No profile data found.</p>
            </div>
        </AnimatedPage>
    )
  }

  return (
    <AnimatedPage>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-slate-900 p-4 pt-24 pb-12">
        <AnimatePresence mode="wait">
          {!showDetails ? (
            /* ================= VIEW 1: SUMMARY CARD ================= */
            <motion.div
              key="summary-card"
              className="max-w-sm w-full bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: 90 }}
              transition={{ duration: 0.4 }}
            >
              <div className="h-32 bg-gradient-to-r from-primary to-secondary"></div>
              <div className="flex justify-center -mt-16 relative">
                <img
                  src={profile.picBase64 || 'https://via.placeholder.com/150'}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-slate-800 bg-slate-700"
                />
              </div>
              <div className="p-6 text-center">
                <h2 className="text-2xl font-bold text-slate-100">{profile.name}</h2>
                <p className="text-primary text-sm font-medium mb-4">{profile.country}</p>
                <p className="text-slate-400 text-sm mb-6 line-clamp-3">
                  {profile.bio || "No bio available."}
                </p>
                
                <button
                  onClick={() => setShowDetails(true)}
                  className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                  <span>See Full Profile & Edit</span>
                  <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                </button>
              </div>
            </motion.div>
          ) : (
            /* ================= VIEW 2: DETAILED / EDIT VIEW ================= */
            <motion.div
              key="detailed-view"
              className="max-w-2xl w-full bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6 sm:p-8"
              initial={{ opacity: 0, scale: 0.95, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-8 border-b border-slate-700 pb-4">
                <h2 className="text-2xl font-bold text-slate-100">Edit Profile</h2>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                
                {/* Editable Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs uppercase text-slate-500 font-bold mb-1">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs uppercase text-slate-500 font-bold mb-1">Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows={3}
                            className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase text-slate-500 font-bold mb-1">Phone Number</label>
                        <input
                            type="tel"
                            name="number"
                            value={formData.number}
                            onChange={handleChange}
                            className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase text-slate-500 font-bold mb-1">Date of Birth</label>
                        <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            readOnly // Made read-only
                            className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-2 opacity-70 cursor-not-allowed" // Visual cue
                        />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs uppercase text-slate-500 font-bold mb-1">Address</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows={2}
                            className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase text-slate-500 font-bold mb-1">Country</label>
                        <input
                            type="text"
                            name="country"
                            value={formData.country}
                            readOnly // Made read-only
                            className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-2 opacity-70 cursor-not-allowed" // Visual cue
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => setShowDetails(false)}
                        className="flex-1 py-3 px-4 bg-transparent border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 rounded-lg font-semibold transition-colors"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 py-3 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold transition-colors shadow-lg disabled:opacity-50 flex justify-center items-center"
                    >
                        {saving ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        ) : 'Save Changes'}
                    </button>
                </div>

              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedPage>
  );
};

export default ProfilePage;