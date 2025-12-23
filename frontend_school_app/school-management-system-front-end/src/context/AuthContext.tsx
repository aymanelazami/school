import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/libs/Api';

// Types
interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    roleId?: number;
    role?: string;
    permissions?: string[];
    twoFactorEnabled?: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; requires2FA?: boolean; userId?: number; error?: string }>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load auth state from localStorage on mount
    useEffect(() => {
        const loadAuthState = async () => {
            try {
                const storedToken = localStorage.getItem('authToken');
                const storedUser = localStorage.getItem('user');

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));

                    // Verify token is still valid by fetching profile
                    try {
                        const profile = await authApi.getProfile();
                        if (profile) {
                            setUser(profile.user || profile);
                        }
                    } catch {
                        // Token is invalid, clear auth state
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('user');
                        setToken(null);
                        setUser(null);
                    }
                }
            } catch (error) {
                console.error('Error loading auth state:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadAuthState();
    }, []);

    // Login function
    const login = useCallback(async (email: string, password: string) => {
        try {
            const response = await authApi.login(email, password);

            // Check if 2FA is required
            if (response.requires2FA) {
                return {
                    success: false,
                    requires2FA: true,
                    userId: response.userId
                };
            }

            // Store token and user
            const { token: authToken, user: userData } = response;

            if (authToken && userData) {
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('user', JSON.stringify(userData));
                setToken(authToken);
                setUser(userData);
                return { success: true };
            }

            return { success: false, error: 'Invalid response from server' };
        } catch (error: any) {
            const message = error.response?.data?.message || error.response?.data?.error || 'Login failed';
            return { success: false, error: message };
        }
    }, []);

    // Logout function
    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Always clear local state
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
        }
    }, []);

    // Refresh user data
    const refreshUser = useCallback(async () => {
        try {
            const profile = await authApi.getProfile();
            if (profile) {
                const userData = profile.user || profile;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            }
        } catch (error) {
            console.error('Error refreshing user:', error);
        }
    }, []);

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
