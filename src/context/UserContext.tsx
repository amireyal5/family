/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { createContext, useContext, useEffect, useState, PropsWithChildren } from 'react';
import { Profile } from '../types';
import { getCurrentUserProfile } from '../lib/auth';
import { supabase } from '../lib/supabaseClient';

const UserContext = createContext<Profile | null>(null);

const AUTH_TIMEOUT = 5000; // 5 seconds

export const UserProvider = ({ children }: PropsWithChildren) => {
    const [userProfile, setUserProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Race the user fetch against a timeout
                const profile = await Promise.race([
                    getCurrentUserProfile(),
                    new Promise<null>((_, reject) => 
                        setTimeout(() => reject(new Error('Authentication request timed out')), AUTH_TIMEOUT)
                    )
                ]);
                setUserProfile(profile);
            } catch (e) {
                console.error("Failed to fetch user:", e);
                setUserProfile(null);
            } finally {
                setLoading(false);
            }
        };
        
        fetchUser();

        const { data: authListener } = (supabase.auth as any).onAuthStateChange(
            async (event: string, session: any) => {
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