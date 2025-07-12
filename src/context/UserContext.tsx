/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { createContext, useContext, useEffect, useState, PropsWithChildren } from 'react';
import { Profile } from '../types';
import { getCurrentUserProfile } from '../lib/auth';
import { supabase } from '../lib/supabaseClient';

const UserContext = createContext<Profile | null>(null);

export const UserProvider = ({ children }: PropsWithChildren) => {
    const [userProfile, setUserProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const profile = await getCurrentUserProfile();
                setUserProfile(profile);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        
        fetchUser();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                    if (session) {
                       const profile = await getCurrentUserProfile();
                       setUserProfile(profile);
                    }
                } else if (event === 'SIGNED_OUT') {
                    setUserProfile(null);
                }
            }
        );

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    return (
        <UserContext.Provider value={userProfile}>
            {!loading ? children : null /* Or a loading spinner */}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);