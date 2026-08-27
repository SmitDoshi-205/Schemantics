import { useEffect, useState } from 'react';
import { AuthContext } from './context';
import { api } from '../lib/api';

const TOKEN_KEY = 'schemantics_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => !!localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    api
      .me(token)
      .then((data) => {
        if (!cancelled) setUser(data);
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function login(email, password) {
    const data = await api.login(email, password);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser({ id: data.id, email: data.email });
    return data;
  }

  async function register(email, password) {
    const data = await api.register(email, password);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser({ id: data.id, email: data.email });
    return data;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  const value = { token, user, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}