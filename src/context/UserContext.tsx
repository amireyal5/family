// src/context/UserContext.tsx
import React, { createContext, useContext, useEffect, useState, PropsWithChildren } from 'react';
import { Profile } from '../types';
import { getCurrentUserProfile } from '../lib/auth';
import { supabase } from '../lib/supabaseClient';

const UserContext = createContext<Profile | null>(null);

export const UserProvider = ({ children }: PropsWithChildren) => {
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Immediately fetch the user profile on component mount.
    const fetchInitialSession = async () => {
        try {
            const profile = await getCurrentUserProfile();
            setUserProfile(profile);
        } catch (error) {
            console.error("Error fetching initial user profile:", error);
            setUserProfile(null);
        } finally {
            setLoading(false); // Ensure loading is always set to false after the initial check.
        }
    };

    fetchInitialSession();

    // Listen for any future changes in the authentication state (e.g., login, logout).
    const { data: authListener } = (supabase.auth as any).onAuthStateChange(
      async (_event: string, session: any) => {
        // When auth state changes, re-fetch the profile.
        const profile = session ? await getCurrentUserProfile() : null;
        setUserProfile(profile);
      }
    );

    // Clean up the listener when the component unmounts.
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    // Display a loading indicator while the initial user data is being fetched.
    return <div>טוען משתמש...</div>;
  }

  return (
    <UserContext.Provider value={userProfile}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
