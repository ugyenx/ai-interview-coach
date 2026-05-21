import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  // Award XP and check for level-ups
  const awardXP = async (xpAmount) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const newXp = (userProfile?.xp || 0) + xpAmount;
      const newLevel = Math.floor(newXp / 300) + 1; // 300 XP per level
      
      const updates = {
        xp: newXp,
        level: newLevel
      };

      // Award dynamic badges
      const currentBadges = userProfile?.badges || [];
      const newBadges = [...currentBadges];
      
      if (newLevel > (userProfile?.level || 1) && !newBadges.includes(`Level ${newLevel} Mastery`)) {
        newBadges.push(`Level ${newLevel} Mastery`);
      }
      if (newXp >= 1000 && !newBadges.includes("XP Millionaire")) {
        newBadges.push("XP Millionaire");
      }
      
      updates.badges = newBadges;
      
      await updateDoc(userRef, updates);
      setUserProfile(prev => ({
        ...prev,
        ...updates
      }));
      return { leveledUp: newLevel > (userProfile?.level || 1), level: newLevel };
    } catch (err) {
      console.error("Failed to update user XP:", err);
    }
  };

  // Update streak counter
  const updateStreak = async (userRef, existingProfile) => {
    try {
      const today = new Date().toDateString();
      const lastActive = existingProfile.lastActiveDate ? new Date(existingProfile.lastActiveDate).toDateString() : '';
      
      let newStreak = existingProfile.streak || 1;
      
      if (lastActive) {
        const diffTime = Math.abs(new Date(today) - new Date(lastActive));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      }
      
      const updates = {
        streak: newStreak,
        lastActiveDate: new Date().toISOString()
      };
      
      await updateDoc(userRef, updates);
      return updates;
    } catch (err) {
      console.error("Failed to update streak:", err);
      return {};
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch or create user profile
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const data = userSnap.data();
            const streakUpdates = await updateStreak(userRef, data);
            setUserProfile({
              ...data,
              ...streakUpdates
            });
          } else {
            // Initialize new user profile
            const newProfile = {
              displayName: user.displayName || user.email.split('@')[0],
              xp: 100,
              level: 1,
              streak: 1,
              lastActiveDate: new Date().toISOString(),
              badges: ["First Interview Completed"]
            };
            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error("Error managing user profile:", err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    awardXP,
    setUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
