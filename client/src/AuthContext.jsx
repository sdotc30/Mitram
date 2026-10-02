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
    return await guestLoginService();
  };

  const logout = async () => {
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
