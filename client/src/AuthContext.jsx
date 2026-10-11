import React, { createContext, useContext, useState, useEffect } from "react";
import {
  auth,
  loginWithGoogle as googleLoginService,
  loginAsGuest as guestLoginService,
  logoutUser as logoutService,
} from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    return await googleLoginService();
  };

  const loginAsGuest = async () => {
    const result = await guestLoginService();
    if (result && result.user) {
      // Purge any residual guest storage so guest sessions always start fresh with blank details
      localStorage.removeItem(`user_details_${result.user.uid}`);
      localStorage.removeItem(`profile_completed_${result.user.uid}`);
    }
    return result;
  };

  const logout = async () => {
    if (currentUser && currentUser.isAnonymous) {
      // Clean up temporary guest records immediately upon logging out
      localStorage.removeItem(`user_details_${currentUser.uid}`);
      localStorage.removeItem(`profile_completed_${currentUser.uid}`);
    }
    return await logoutService();
  };

  const value = {
    currentUser,
    loading,
    loginWithGoogle,
    loginAsGuest,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
