"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
  isTeamManager: boolean;
  managedTeam: string | null;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Simple admin check - you can make this more sophisticated
  const isAdmin = !!(user?.email === 'remyan.yc@gmail.com' || user?.email?.includes('admin'));

  // Team manager configuration - you can modify these emails
  const teamManagers = {
    'remyan.yc@gmail.com': 'Golden Dragons',
    'sigmas@dba.com': 'Los Sigmas',
    // Add more team managers here as needed
  };

  // Check if user is a team manager
  const managedTeam = user?.email ? teamManagers[user.email as keyof typeof teamManagers] || null : null;
  const isTeamManager = !!managedTeam;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAdmin,
    isTeamManager,
    managedTeam
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
