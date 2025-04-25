// src/contexts/AuthContext.js
"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import { 
    onAuthStateChanged, 
    deleteUser, 
    EmailAuthProvider, 
    reauthenticateWithCredential,
    updatePassword
  } from "firebase/auth";
import { toast } from "sonner";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const authInstance = await getFirebaseAuth();
        setAuth(authInstance);
        
        const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
          // Only set the user if they exist and their email is verified
          if (currentUser && currentUser.emailVerified) {
            setUser(currentUser);
          } else {
            setUser(null);
          }
          setLoading(false);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error("Error initializing auth:", error);
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const signOut = async () => {
    if (auth) {
      try {
        await auth.signOut();
      } catch (error) {
        console.error("Error signing out:", error);
        toast.error("Failed to sign out");
      }
    }
  };

  // Inside AuthProvider component
  const updateUserPassword = async (currentPassword, newPassword) => {
    if (!user || !auth) {
      toast.error("Unable to update password");
      return false;
    }
    
    try {
      // First re-authenticate the user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Then update the password
      await updatePassword(user, newPassword);
      
      toast.success("Password updated successfully");
      return true;
      
    } catch (error) {
      console.error("Error updating password:", error);
      
      if (error.code === 'auth/wrong-password') {
        toast.error("Current password is incorrect");
      } else {
        toast.error("Failed to update password: " + error.message);
      }
      
      return false;
    }
  };

  const deleteAccount = async (password) => {
    if (!user || !password || !auth) {
      toast.error("Unable to delete account");
      return false;
    }
    
    try {
      // First re-authenticate the user
      const credential = EmailAuthProvider.credential(user.email, password);
      
      await reauthenticateWithCredential(user, credential);
      
      // Then delete the user
      await deleteUser(user);
      
      toast.success("Your account has been deleted successfully");
      return true;
      
    } catch (error) {
      console.error("Error deleting account:", error);
      
      if (error.code === 'auth/wrong-password') {
        toast.error("Incorrect password");
      } else {
        toast.error("Failed to delete account: " + error.message);
      }
      
      return false;
    }
  };

  const value = {
    user,
    loading,
    auth,
    isAuthenticated: !!user,
    signOut,
    deleteAccount,
    updateUserPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);