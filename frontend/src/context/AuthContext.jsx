import React, { createContext, useState, useEffect } from 'react';
 
export const AuthContext = createContext();
 
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const storedToken = localStorage.getItem('specter_token');
    const storedUser = localStorage.getItem('specter_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);
 
  const login = (token, user) => {
    localStorage.setItem('specter_token', token);
    localStorage.setItem('specter_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
    setIsAuthenticated(true);
  };
 
  const logout = () => {
    localStorage.removeItem('specter_token');
    localStorage.removeItem('specter_user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };
 
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}