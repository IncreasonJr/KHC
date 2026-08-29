// /home/caleb/Desktop/PROJECTS/KHC/src/hooks/useAuth.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check local storage for an active administrative session
    const storedSession = localStorage.getItem('khc_admin_session');
    if (storedSession) {
      try {
        setUser(JSON.parse(storedSession));
      } catch (err) {
        localStorage.removeItem('khc_admin_session');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    // Artificial delay to simulate network call
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Verify temporary hardcoded admin credentials
    if (email === 'admin@church.com' && password === 'admin123') {
      const sessionUser = {
        id: 'admin-uuid-0000-1111',
        email: 'admin@church.com',
        name: 'System Admin',
        role: 'Administrator'
      };
      setUser(sessionUser);
      localStorage.setItem('khc_admin_session', JSON.stringify(sessionUser));
      setLoading(false);
      return { success: true };
    } else {
      setLoading(false);
      const err = new Error('Invalid administrative credentials. Hint: use admin@church.com / admin123');
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    // Artificial delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    setUser(null);
    localStorage.removeItem('khc_admin_session');
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider context wrapper');
  }
  return context;
};
export default useAuth;
