
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StorageService } from '../services/storage';
import { AuthContextType } from '../types';

interface ExtendedAuthContextType extends AuthContextType {
  requires2FA: boolean;
  verify2FA: (code: string) => boolean;
  loginAttempts: number;
}

const AuthContext = createContext<ExtendedAuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  useEffect(() => {
    setIsAuthenticated(StorageService.getAuth());
  }, []);

  const login = (password: string): boolean => {
    if (loginAttempts >= 5) {
      alert('יותר מדי ניסיונות כושלים. אנא נסה שוב מאוחר יותר.');
      return false;
    }

    if (password === '123456') { // Hardcoded for demo
      setRequires2FA(true);
      setLoginAttempts(0);
      return true;
    } else {
      setLoginAttempts(prev => prev + 1);
      return false;
    }
  };

  const verify2FA = (code: string): boolean => {
    if (code === '123456') { // Demo 2FA code
      setIsAuthenticated(true);
      setRequires2FA(false);
      StorageService.setAuth(true);
      setLoginAttempts(0);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRequires2FA(false);
    StorageService.setAuth(false);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      login,
      logout,
      requires2FA,
      verify2FA,
      loginAttempts
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
