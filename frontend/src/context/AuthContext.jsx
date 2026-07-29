import { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      client.get('/auth/me/')
        .then(({ data }) => setUser(data.user))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  function login(email, password) {
    return client.post('/auth/login/', { email, password }).then(({ data }) => {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      return client.get('/auth/me/').then(({ data }) => {
        setUser(data.user);
        return data.user;
      });
    });
  }

  function register(email, password, profile = {}) {
    return client.post('/auth/register/', { email, password, ...profile }).then(({ data }) => {
      return login(email, password);
    });
  }

  function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
