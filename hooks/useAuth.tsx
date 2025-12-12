
import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth'; 
import { auth, db, ref, onValue, signOut } from '../firebase'; 

export function useAuth() {
  const [user, setUser] = useState<User | null>(null); 
  const [authLoading, setAuthLoading] = useState(true); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(true); 
  const [isBanned, setIsBanned] = useState(false); 
  const [isBannedLoading, setIsBannedLoading] = useState(true); 

  useEffect(() => {
    let unsubscribeAuth: () => void;
    let unsubscribeAdminStatus: (() => void) | undefined;
    let unsubscribeBannedStatus: (() => void) | undefined;

    // Listen for auth state changes
    unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => { 
      setUser(currentUser);
      setAuthLoading(false);

      // Clean up previous real-time listeners if a new user logs in or logs out
      if (unsubscribeAdminStatus) {
        unsubscribeAdminStatus();
        unsubscribeAdminStatus = undefined; 
      }
      if (unsubscribeBannedStatus) {
        unsubscribeBannedStatus();
        unsubscribeBannedStatus = undefined; 
      }

      if (currentUser) {
        // --- Admin Status Check (Real-time listener) ---
        setIsAdminLoading(true); 
        const adminRef = ref(db, `Administrators/Profile/${currentUser.uid}/stutus`);
        unsubscribeAdminStatus = onValue(adminRef, (snapshot) => {
          setIsAdmin(snapshot.exists() && snapshot.val() === true);
          setIsAdminLoading(false); 
        }, (error) => {
          console.error("Error fetching real-time admin status:", error);
          setIsAdmin(false); 
          setIsAdminLoading(false); 
        });

        // --- Banned Status Check (Real-time listener) ---
        setIsBannedLoading(true); 
        const userStatusRef = ref(db, `Users/${currentUser.uid}/status`);
        unsubscribeBannedStatus = onValue(userStatusRef, (snapshot) => {
          const isUserBanned = snapshot.exists() && snapshot.val() === false; 
          setIsBanned(isUserBanned);
          setIsBannedLoading(false); 

          // If user becomes banned in real-time, log them out AND persist ban status
          if (isUserBanned) {
            signOut(auth).catch(console.error); // Log out immediately
            localStorage.setItem('isBannedUser', 'true'); // Persist ban status
          } else {
            // If the user is unbanned while currently logged in, ensure the flag is cleared
            localStorage.removeItem('isBannedUser'); 
          }
        }, (error) => {
          console.error("Error fetching real-time user banned status:", error);
          setIsBanned(false); 
          setIsBannedLoading(false); 
          // On error, we don't know the status, so don't clear persistent ban
        });

      } else {
        // If no user, reset all status
        setIsAdmin(false);
        setIsAdminLoading(false);
        setIsBanned(false); 
        setIsBannedLoading(false);
        // Important: Do NOT clear 'isBannedUser' from localStorage here.
        // That should only happen when the user clicks the "Back to Home Page" button.
      }
    });

    // Cleanup function for the main useEffect: unsubscribe from all listeners
    return () => {
      unsubscribeAuth();
      if (unsubscribeAdminStatus) {
        unsubscribeAdminStatus();
      }
      if (unsubscribeBannedStatus) {
        unsubscribeBannedStatus();
      }
    };
  }, []); 

  return { user, authLoading, isAdmin, isAdminLoading, isBanned, isBannedLoading };
}