
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User, rememberMe: boolean) => void;
  logout: () => void;
  updateCurrentUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to determine which storage to use based on where the user was loaded from
const getUserStorageKey = (user: User | null): 'localStorage' | 'sessionStorage' | null => {
  if (!user) return null;
  const localStorageUser = localStorage.getItem('user');
  if (localStorageUser && JSON.parse(localStorageUser).id === user.id) {
    return 'localStorage';
  }
  const sessionStorageUser = sessionStorage.getItem('user');
  if (sessionStorageUser && JSON.parse(sessionStorageUser).id === user.id) {
    return 'sessionStorage';
  }
  return null;
};


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for a logged-in user in session storage first, then local storage for persistence
    try {
      const storedSessionUser = sessionStorage.getItem('user');
      const storedLocalUser = localStorage.getItem('user');

      if (storedSessionUser) {
        setUser(JSON.parse(storedSessionUser));
      } else if (storedLocalUser) {
        setUser(JSON.parse(storedLocalUser));
      }
    } catch (error) {
      console.error("Failed to parse user from storage", error);
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData: User, rememberMe: boolean) => {
    // Strip password before storing in state and storage for security
    const { password, ...userToStore } = userData;
    if (rememberMe) {
      localStorage.setItem('user', JSON.stringify(userToStore));
      sessionStorage.removeItem('user'); // Ensure only one storage is used
    } else {
      sessionStorage.setItem('user', JSON.stringify(userToStore));
      localStorage.removeItem('user'); // Ensure only one storage is used
    }
    setUser(userToStore);
  };

  const logout = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  const updateCurrentUser = (userData: Partial<User>) => {
    setUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = { ...prevUser, ...userData };
        // Ensure password is not stored
        const { password, ...userToStore } = updatedUser;

        const storageKey = getUserStorageKey(prevUser);
        if (storageKey === 'localStorage') {
          localStorage.setItem('user', JSON.stringify(userToStore));
        } else if (storageKey === 'sessionStorage') {
          sessionStorage.setItem('user', JSON.stringify(userToStore));
        } else { // Fallback if user somehow not found in either, e.g., new user just logged in without remember me
          sessionStorage.setItem('user', JSON.stringify(userToStore));
        }
        
        return userToStore;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};