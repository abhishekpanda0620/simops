import { createContext, useContext, useState, type ReactNode } from 'react';

interface User {
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (user?: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default demo user
const defaultUser: User = {
  name: 'Demo User',
  email: 'demo@simops.academy',
  role: 'student',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('simops_auth') === 'true';
  });
  
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('simops_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultUser;
      }
    }
    return isAuthenticated ? defaultUser : null;
  });

  const login = (userData?: User) => {
    const userToStore = userData || defaultUser;
    localStorage.setItem('simops_auth', 'true');
    localStorage.setItem('simops_user', JSON.stringify(userToStore));
    setIsAuthenticated(true);
    setUser(userToStore);
  };

  const logout = () => {
    localStorage.removeItem('simops_auth');
    localStorage.removeItem('simops_user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

