
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db, ref, set } from '../firebase'; 
import AnimatedPage from '../components/AnimatedPage';
import { motion, AnimatePresence } from 'framer-motion';
import ImageCropModal from '../components/ImageCropModal';

const ProfileSetupPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.displayName || '');
  const [bio, setBio] = useState('');
  const [number, setNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [picBase64, setPicBase64] = useState('');
  
  // Image Crop State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-detection states
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentLatitude, setCurrentLatitude] = useState<number | null>(null);
  const [currentLongitude, setCurrentLongitude] = useState<number | null>(null);
  const [detectedCountryName, setDetectedCountryName] = useState<string | null>(null); // For display
  const [deviceInfo, setDeviceInfo] = useState<{ userAgent: string, os: string, browser: string } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Detect Device Info
    const userAgent = navigator.userAgent;
    let os = 'Unknown OS';
    let browser = 'Unknown Browser';

    if (userAgent.includes('Win')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('X11') || userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('like Mac') && !userAgent.includes('iPad')) os = 'iOS'; // iPhone
    else if (userAgent.includes('iPad')) os = 'iPadOS';

    if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) browser = 'IE';

    setDeviceInfo({ userAgent, os, browser });

    // Try to pre-fill country from browser locale if available
    try {
        const localeCountry = navigator.language.split('-')[1];
        if (localeCountry) {
            // A very simple lookup, for a real app, use a proper library or API
            const countryNames: { [key: string]: string } = {
                'US': 'United States', 'GB': 'United Kingdom', 'CA': 'Canada', 'BD': 'Bangladesh',
                // Add more as needed
            };
            setCountry(countryNames[localeCountry.toUpperCase()] || localeCountry.toUpperCase());
        }
    } catch (e) {
        console.warn("Could not determine country from browser locale.", e);
    }

  }, []); // Run once on mount

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
             setSelectedImage(reader.result?.toString() || null);
             setShowCropModal(true);
        });
        reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSaveCrop = (base64: string) => {
    setPicBase64(base64);
    setShowCropModal(false);
    setSelectedImage(null); 
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);
    setError(null);
    setDetectedCountryName(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLatitude(latitude);
        setCurrentLongitude(longitude);
        
        // In a real application, you would make an API call here to a reverse geocoding service
        // (e.g., Google Maps Geocoding API) to get the country name from lat/long.
        // For this exercise, we'll use a placeholder.
        setDetectedCountryName('Location Detected (Please Confirm Country)');
        setCountry('Location Detected'); // Pre-fill the country input for user to edit
        setLocationLoading(false);
      },
      (geoError) => {
        setLocationLoading(false);
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            setError("Location access denied. Please allow location access in your browser settings.");
            break;
          case geoError.POSITION_UNAVAILABLE:
            setError("Location information is unavailable.");
            break;
          case geoError.TIMEOUT:
            setError("The request to get user location timed out.");
            break;
          default:
            setError("An unknown error occurred while detecting location.");
        }
        console.error("Geolocation Error:", geoError);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You are not logged in.");
      return;
    }
    if (!name || !bio || !number || !dateOfBirth || !address || !country) {
        setError("Please fill out all required fields.");
        return;
    }

    setLoading(true);
    setError(null);

    const userData = {
      name,
      bio,
      number,
      dateOfBirth,
      address,
      country,
      email: user.email,
      picBase64: picBase64, 
      lastChange: 0, // Initialize to 0 to allow the first edit immediately
      deviceInfo: deviceInfo || { userAgent: 'Unknown', os: 'Unknown', browser: 'Unknown' }, // Ensure deviceInfo is always present
      geolocation: (currentLatitude !== null && currentLongitude !== null) ? { latitude: currentLatitude, longitude: currentLongitude } : null,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    try {
      await set(ref(db, `Users/${user.uid}`), userData); 
      navigate('/');
    } catch (err) {
      console.error("Failed to save profile:", err);
      setError("Failed to save profile. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AnimatedPage>
      {/* Increased top padding (pt-24) to ensure content starts below the fixed header */}
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-slate-900 p-4 pt-24">
        <motion.div
          className="max-w-lg w-full bg-slate-800 p-8 rounded-xl shadow-lg"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Complete Your Profile</h1>
          <p className="text-slate-400 mb-8">Just a few more details to get started.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Upload Section */}
            <div className="flex flex-col items-center mb-4">
                <div 
                    className="relative w-32 h-32 mb-2 group cursor-pointer" 
                    onClick={() => fileInputRef.current?.click()}
                >
                    <img 
                        src={picBase64 || 'https://via.placeholder.com/150'} 
                        alt="Profile Preview" 
                        className="w-full h-full rounded-full object-cover border-4 border-slate-700 shadow-sm"
                    />
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <i className="fas fa-camera text-white text-2xl"></i>
                    </div>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*" 
                />
                <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-primary hover:underline font-medium"
                >
                    Upload Photo
                </button>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-slate-300">Bio</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Tell us a little about yourself"
                required
              />
            </div>
            <div>
              <label htmlFor="number" className="block text-sm font-medium text-slate-300">Phone Number</label>
              <input
                type="tel"
                id="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="mt-1 block w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-slate-300">Date of Birth</label>
              <input
                type="date"
                id="dateOfBirth"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="mt-1 block w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-300">Your Address</label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="mt-1 block w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Street, City, State/Province, Postal Code"
                required
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-slate-300">Country</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="block w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="e.g., Bangladesh"
                  required
                />
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={locationLoading}
                  className="px-4 py-2 bg-slate-700 text-slate-200 rounded-md shadow-sm hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {locationLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-slate-200"></div>
                  ) : (
                    <i className="fas fa-map-marker-alt"></i>
                  )}
                  {locationLoading ? 'Detecting...' : 'Detect Location'}
                </button>
              </div>
              {detectedCountryName && !locationLoading && (
                  <p className="text-sm text-slate-400 mt-1">
                      {detectedCountryName} (Please verify and edit if needed)
                  </p>
              )}
            </div>
            
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400"
              >
                {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                    'Save and Continue'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
      
      <AnimatePresence>
        {showCropModal && selectedImage && (
            <ImageCropModal 
                imgSrc={selectedImage} 
                onSave={handleSaveCrop} 
                onClose={() => setShowCropModal(false)} 
            />
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
};

export default ProfileSetupPage;